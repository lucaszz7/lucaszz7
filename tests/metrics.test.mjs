import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCalendar,streaks,languageShares,renderCards,escapeXml} from '../scripts/metrics.mjs';
const html=(date,count,id='day')=>`<td data-date="${date}" id="${id}"></td><tool-tip for="${id}">${count===0?'No':count} contributions on September 1st.</tool-tip>`;
test('reads GitHub cells and separately located tooltips',()=>assert.deepEqual(parseCalendar(html('2026-09-01',0,'a')+html('2026-09-02',3,'b')),[{date:'2026-09-01',count:0},{date:'2026-09-02',count:3}]));
test('calendar changes fail closed rather than fabricate zeros',()=>{
  assert.throws(()=>parseCalendar('<td data-date="2026-09-01" id="x"></td>'));
  assert.throws(()=>parseCalendar(html('2026-09-01',1)+html('2026-09-03',1,'b')));
  assert.throws(()=>parseCalendar(html('2026-09-01',1)+html('2026-09-01',1,'b')));
});
test('handles legacy explicit counts and plural thousands',()=>{
  assert.equal(parseCalendar('<rect data-date="2026-09-01" data-count="4"/>')[0].count,4);
  assert.equal(parseCalendar(html('2026-09-01','1,200'))[0].count,1200);
});
test('current streak allows today to be unfinished, but not a missed yesterday',()=>{
  const days=[{date:'2026-09-01',count:2},{date:'2026-09-02',count:3},{date:'2026-09-03',count:0}];
  assert.deepEqual(streaks(days,'2026-09-03'),{current:2,longest:2,total:5});
  assert.equal(streaks(days,'2026-09-04').current,0);
});
test('language distribution reflects all actual byte counts',()=>{
  assert.deepEqual(languageShares({Python:3,Java:1}),[{name:'Python',bytes:3,share:.75},{name:'Java',bytes:1,share:.25}]);
  assert.deepEqual(languageShares({}),[]);
});
test('SVG escaping and zero values remain honest',()=>{
  assert.equal(escapeXml('<x & "y">'),'&lt;x &amp; &quot;y&quot;&gt;');
  const cards=renderCards({repos:0,stars:0,commits:0,prs:0,issues:0,languages:{},days:[{date:'2026-09-01',count:0},{date:'2026-09-02',count:0}],today:'2026-09-02',from:'2025-09-03',updatedAt:'2026-09-02'});
  assert.equal(Object.keys(cards).length,6);
  assert.ok(!Object.values(cards).some(svg=>/NaN|Infinity|undefined/.test(svg)));
  assert.ok(cards['trophies.svg'].includes('NOT YET'));
  assert.ok(!cards['trophies.svg'].includes('>REACHED<'));
});
