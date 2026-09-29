import {writeFile, mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

export const USER = 'lucaszz7';
const DAY = 86400000;
const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const escapeXml = e;
const date = value => new Date(value).toISOString().slice(0,10);
const number = value => Number(value).toLocaleString('en-US');
const attr = (tag, name) => new RegExp(`\\b${name}=["']([^"']+)["']`).exec(tag)?.[1];

// Read the anonymous, public calendar, not an account's private repositories.
// Fail on markup changes instead of silently producing a grid of zeroes.
export function parseCalendar(html) {
  const tips = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi)) {
    const key = attr(match[1], 'for');
    const text = match[2].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    const count = /^(No|[\d,]+) contributions? on /i.exec(text)?.[1];
    if (key && count) tips.set(key, count === 'No' ? 0 : Number(count.replaceAll(',','')));
  }
  const days = [];
  for (const match of html.matchAll(/<(?:td|rect)\b[^>]*\bdata-date=["'][^"']+["'][^>]*>/gi)) {
    const d = attr(match[0], 'data-date');
    const id = attr(match[0], 'id');
    const explicitCount = attr(match[0], 'data-count');
    const count = explicitCount !== undefined ? Number(explicitCount) : tips.get(id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d ?? '') || !Number.isSafeInteger(count) || count < 0) {
      throw new Error('GitHub calendar format changed; previous assets were preserved.');
    }
    days.push({date:d, count});
  }
  days.sort((a,b) => a.date.localeCompare(b.date));
  if (!days.length || new Set(days.map(d=>d.date)).size !== days.length) throw new Error('Missing or duplicate calendar dates.');
  for(let i=1;i<days.length;i++) {
    if (Date.parse(days[i].date)-Date.parse(days[i-1].date)!==DAY) throw new Error('Calendar has a missing day.');
  }
  return days;
}

export function streaks(days, today) {
  const visible = days.filter(day=>day.date<=today);
  let longest=0, run=0, total=0;
  for(const day of visible) {
    total+=day.count;
    run=day.count>0 ? run+1 : 0;
    longest=Math.max(longest,run);
  }
  const map = new Map(visible.map(day=>[day.date,day.count]));
  let cursor=Date.parse(today);
  if (!(map.get(date(cursor))>0)) cursor-=DAY; // Today may still be in progress.
  let current=0;
  while(map.get(date(cursor))>0) { current++; cursor-=DAY; }
  return {current,longest,total};
}

export function languageShares(languages) {
  const entries=Object.entries(languages).filter(([,bytes])=>Number.isSafeInteger(bytes)&&bytes>0).sort((a,b)=>b[1]-a[1]);
  const total=entries.reduce((sum,[,bytes])=>sum+bytes,0);
  return entries.map(([name,bytes])=>({name,bytes,share:bytes/total}));
}

function svg(title,width,height,body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${e(title)}</title><style>text{font-family:Segoe UI,Arial,sans-serif}.mono{font-family:Consolas,Menlo,monospace}.label{fill:#9fb4a6;font-size:12px}.value{fill:#eef6f0;font-size:32px;font-weight:600}.small{fill:#9fb4a6;font-size:11px}</style><rect x=".5" y=".5" width="${width-1}" height="${height-1}" rx="14" fill="#101715" stroke="#2c3b34"/>${body}</svg>\n`;
}
const text=(x,y,value,cls='label',extra='')=>`<text x="${x}" y="${y}" class="${cls}" ${extra}>${e(value)}</text>`;
const heading=(title,sub)=>text(24,31,title,'mono','fill="#7ee2b8" font-size="12" letter-spacing="1.5"')+text(24,53,sub,'small');

export function renderCards(data) {
  const {repos,stars,commits,prs,issues,languages,days,today,from,updatedAt}=data;
  const s=streaks(days,today);
  const cards={};
  let body=heading('GITHUB STATS','Public data / @'+USER);
  const values=[['Repositories',repos],['Stars',stars],['Commits · 365d',commits],['PRs · 365d',prs],['Issues · 365d',issues],['Calendar activity',s.total]];
  values.forEach(([label,value],i)=>{
    const x=24+(i%3)*140,y=101+Math.floor(i/3)*80;
    body+=text(x,y,number(value),'value')+text(x,y+24,label);
  });
  body+='<path d="M24 224H416" stroke="#2c3b34"/>';
  body+=text(24,248,'Updated '+updatedAt+' UTC','small');
  cards['stats.svg']=svg('Public GitHub statistics for '+USER,440,266,body);
  body=heading('CONTRIBUTION STREAK','Visible calendar / '+days[0].date+' to '+days.at(-1).date);
  body+=text(30,126,s.current,'value','font-size="46"')+text(30,155,'Current · days');
  body+=text(232,126,s.longest,'value','font-size="46"')+text(232,155,'Longest · days');
  body+='<path d="M204 82V170M24 194H416" stroke="#2c3b34"/>';
  body+=text(24,219,'Longest streak is limited to this calendar window.','small');
  body+=text(24,244,'Updated '+updatedAt+' UTC','small');
  cards['streak.svg']=svg('Current and longest contribution streak in the visible window',440,266,body);
  const shares=languageShares(languages);
  const colors=['#7ee2b8','#8cae9c','#b3c6ba','#608e76','#c4d1c8','#496d5a'];
  body=heading('TOP LANGUAGES','Code bytes / public, owned, non-fork repositories');
  if (!shares.length) body+=text(24,98,'No language data available.');
  shares.forEach((lang,i)=>{
    const y=90+i*53;
    body+=text(24,y,lang.name,'label')+text(410,y,(lang.share*100).toFixed(1)+'%','label','text-anchor="end"');
    body+=`<rect x="24" y="${y+12}" width="392" height="7" rx="3.5" fill="#24392c"/><rect x="24" y="${y+12}" width="${392*lang.share}" height="7" rx="3.5" fill="${colors[i%colors.length]}"/>`;
  });
  const languageHeight=112+Math.max(1,shares.length)*53;
  body+=text(24,languageHeight-20,'Not a proficiency score · '+updatedAt+' UTC','small');
  cards['languages.svg']=svg('Language distribution from GitHub repository byte counts',440,languageHeight,body);
  for(const [width,name] of [[960,'activity.svg'],[440,'activity-mobile.svg']]) {
    const recent=days.slice(-90),left=40,right=width-24,top=84,bottom=216;
    const max=Math.max(1,...recent.map(d=>d.count));
    body=heading('ACTIVITY / 90 DAYS',recent[0].date+' to '+recent.at(-1).date+' · visible contributions');
    for(let i=0;i<3;i++) {
      const y=top+(bottom-top)*i/2;
      body+=`<path d="M${left} ${y}H${right}" stroke="#24392c" stroke-dasharray="3 5"/>`;
      body+=text(left-9,y+4,Math.round(max*(1-i/2)),'small','text-anchor="end"');
    }
    const points=recent.map((day,i)=>[left+i/(recent.length-1)*(right-left),bottom-day.count/max*(bottom-top)]);
    const line=points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
    body+=`<path d="${line} L${right} ${bottom}H${left}Z" fill="#7ee2b8" opacity=".06"/><path d="${line}" fill="none" stroke="#7ee2b8" stroke-width="2"/>`;
    body+=text(left,242,recent[0].date,'small')+text(right,242,recent.at(-1).date,'small','text-anchor="end"');
    body+=text(24,275,'Updated '+updatedAt+' UTC','small');
    cards[name]=svg('Daily GitHub contributions, without interpolation or invented activity',width,292,body);
  }
  const milestones=[['PUBLIC REPOSITORY',repos>=1,'At least one owned public repository'],['FIRST STAR',stars>=1,'At least one star across those repositories'],['PUBLIC COMMIT',commits>=1,'At least one authored default-branch commit / 365d']];
  body=heading('TROPHIES / VERIFIED MILESTONES','Conditions checked against public GitHub data');
  milestones.forEach(([label,earned,description],i)=>{
    const y=88+i*72;
    body+=`<circle cx="33" cy="${y-3}" r="8" fill="${earned?'#7ee2b8':'#25382d'}"/>`;
    body+=text(54,y,label,'mono','fill="#d5e9dc" font-size="12"');
    body+=text(416,y,earned?'REACHED':'NOT YET','small','text-anchor="end"');
    // Two readable lines for the longest condition, never a fabricated rank.
    const lines=description.length>47 ? ['At least one authored default-branch','commit in the last 365 days'] : [description];
    lines.forEach((line,j)=>body+=text(54,y+22+j*15,line,'small'));
  });
  body+=text(24,308,'Project milestones, not awards · '+updatedAt+' UTC','small');
  cards['trophies.svg']=svg('Milestones derived from real public repository data',440,328,body);
  return cards;
}

export async function fetchData({now=new Date(),token=process.env.GITHUB_TOKEN}={}) {
  const today=date(now),from=date(new Date(Date.parse(today)-364*DAY));
  const api=async path=>{
    const response=await fetch('https://api.github.com'+path,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'lucaszz7-profile',...(token?{Authorization:'Bearer '+token}:{})},signal:AbortSignal.timeout(30000),redirect:'error'});
    if(!response.ok) throw new Error(`GitHub API returned ${response.status}; previous assets were preserved.`);
    return response.json();
  };
  const pages=async path=>{
    const rows=[];
    for(let page=1;page<=100;page++) {
      const batch=await api(path+(path.includes('?')?'&':'?')+'per_page=100&page='+page);
      if(!Array.isArray(batch))throw new Error('Unexpected GitHub response.');
      rows.push(...batch);
      if(batch.length<100)return rows;
    }
    throw new Error('Pagination limit reached; refusing to publish partial counts.');
  };
  const repositories=(await pages(`/users/${USER}/repos?type=owner`)).filter(r=>r.private===false && !r.fork && r.owner?.login?.toLowerCase()===USER);
  const languages={},commitIds=new Set();
  for(const repo of repositories) {
    const path='/repos/'+USER+'/'+encodeURIComponent(repo.name);
    const bytes=await api(path+'/languages');
    for(const [name,count] of Object.entries(bytes)) {
      if(!Number.isSafeInteger(count)||count<0)throw new Error('Invalid language byte count.');
      languages[name]=(languages[name]??0)+count;
    }
    if(repo.size>0) {
      const commits=await pages(path+'/commits?author='+USER+'&since='+from+'T00:00:00Z&until='+today+'T23:59:59Z');
      for(const commit of commits)commitIds.add(commit.sha);
    }
  }
  const searchCount=async kind=>{
    const result=await api('/search/issues?q='+encodeURIComponent(`author:${USER} is:${kind} is:public created:${from}..${today}`));
    if(result.incomplete_results||!Number.isSafeInteger(result.total_count))throw new Error('Search result is incomplete.');
    return result.total_count;
  };
  const calendar=await fetch(`https://github.com/users/${USER}/contributions`,{headers:{'User-Agent':'lucaszz7-profile','Accept-Language':'en'},signal:AbortSignal.timeout(30000),redirect:'error'});
  if(!calendar.ok)throw new Error('Public contribution calendar unavailable.');
  const days=parseCalendar(await calendar.text()).filter(day=>day.date<=today);
  if(days.length<300 || Date.parse(today)-Date.parse(days.at(-1).date)>2*DAY)throw new Error('Calendar is truncated or stale.');
  return {username:USER,today,from,updatedAt:today,repos:repositories.length,stars:repositories.reduce((sum,r)=>sum+r.stargazers_count,0),commits:commitIds.size,prs:await searchCount('pr'),issues:await searchCount('issue'),languages,days};
}

export async function generate() {
  const data=await fetchData();
  const cards=renderCards(data);
  const output=new URL('../assets/generated/',import.meta.url);
  await mkdir(output,{recursive:true});
  await Promise.all(Object.entries(cards).map(([name,content])=>writeFile(new URL(name,output),content)));
  // Only public aggregate data; no tokens, email addresses or repository payloads.
  await writeFile(new URL('metrics.json',output),JSON.stringify(data,null,2)+'\n');
  console.log(`Generated ${Object.keys(cards).length} cards from real GitHub data (${data.updatedAt}).`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  generate().catch(error=>{console.error(error.message);process.exitCode=1;});
}
