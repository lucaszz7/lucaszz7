# Instalação do perfil — Lucas Gabriel

Esta pasta contém o README e todos os SVGs necessários. É independente do LCE. A revisão visual V2 foi aplicada ao clone local `lucaszz7`, com remoto `lucaszz7/lucaszz7`, sem commit ou push. Não foram alterados a visibilidade dos projetos nem repositórios remotos nesta revisão.

## Colocar no GitHub

1. Usar o repositório do perfil `lucaszz7/lucaszz7`, já configurado como remoto neste clone. Para aparecer no perfil, o repositório precisa de ser público. Não reutilizar o repositório privado do LCE. Se instalar este pacote noutra máquina, clonar primeiro o repositório existente.
2. Colocar o conteúdo desta pasta na raiz desse repositório, incluindo `assets/`, `scripts/`, `tests/` e `.github/`. Não publicar `.preview/`.
3. O README da raiz será usado no perfil segundo as [regras de Profile README do GitHub](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme).
4. Em **Actions → Refresh profile visuals**, verificar a primeira execução. Se necessário, usar **Run workflow**. O workflow permite escrita apenas no repositório do perfil e não precisa de um PAT pessoal.
5. Confirmar no perfil o banner, contactos, ligações e animação. Os ficheiros de métricas já incluem um snapshot real inicial, portanto não existem imagens apontadas para uma branch ainda inexistente.

O e-mail e o username Discord foram fornecidos para exibição pública. Não há telefone, LinkedIn inventado, localização, idade ou experiência profissional presumida. O LCE tem um card descritivo, sem ligação pública quebrada a código privado nem promessa de demo online.

## Atualização automática

Um único workflow, `.github/workflows/profile-assets.yml`, atualiza as métricas e a snake diariamente às **06:23 UTC**, ou manualmente. As actions estão fixadas por SHA. O script de métricas não tem dependências npm e usa Node 24.

`GITHUB_TOKEN` é fornecido automaticamente ao job pelo GitHub. Nunca colocar tokens, cookies ou `.env` no README ou em URLs. A snake usa [Platane/snk](https://github.com/Platane/snk); o restante painel é original e gerado localmente a partir dos dados públicos.

O agendamento não é uma garantia de hora exata. O GitHub pode atrasar execuções ou desativar agendamentos de repositórios públicos após 60 dias sem atividade; consultar as [condições dos workflows agendados](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule). A branch tem de permitir o commit do bot. Se o job falhar, o último snapshot publicado permanece, com data visível; corrigir o erro e repetir a execução, sem desativar proteções de segurança por conveniência.

## O que cada métrica significa

- **Repositories / Stars:** repositórios públicos, próprios e não-forks; soma das estrelas recebidas nesses repositórios. Inclui o repositório do perfil quando existir.
- **Commits:** SHAs únicos devolvidos pelas branches padrão desses repositórios, com `author=lucaszz7`, nos últimos 365 dias UTC. Não é uma contagem de todos os commits feitos em todo o GitHub.
- **PRs / Issues:** itens públicos criados pelo utilizador no mesmo intervalo de 365 dias; a consulta rejeita resultados incompletos.
- **Calendar activity / streak / graph:** calendário público visível do GitHub. Pode incluir contagens privadas anonimizadas se o utilizador as tiver ativado no perfil. Não consulta nomes, conteúdo ou detalhes dos repositórios privados. A maior sequência limita-se ao intervalo de calendário obtido, não à vida inteira da conta.
- **Current streak:** se hoje ainda não tiver contribuições, a contagem pode terminar ontem. Uma quebra anterior termina a sequência. Datas são UTC.
- **Top Languages:** bytes de código devolvidos pelo GitHub, em todos os repositórios públicos próprios não-forks. Sem exclusões artificiais ou pesos. Não representa nível de domínio; as tecnologias do LCE privado não são adicionadas artificialmente ao gráfico.
- **Trophies:** três condições explícitas e verificáveis — repositório público, estrela e commit público recente. Não são troféus oficiais, certificações, prémios profissionais ou ranks.

Fontes: [repositórios e linguagens](https://docs.github.com/en/rest/repos/repos), [commits](https://docs.github.com/en/rest/commits/commits), [pesquisa de issues/PRs](https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests) e [calendário público](https://github.com/users/lucaszz7/contributions).

Os endpoints públicos tradicionais de GitHub Readme Stats, Activity Graph e Profile Trophy estavam indisponíveis na verificação de 29/09/2026 (503/402). Por isso, estes cartões não dependem desses serviços. Os ícones e badges continuam a usar [Skill Icons](https://github.com/tandpfun/skill-icons) e [Shields.io](https://shields.io/), que podem ter indisponibilidades próprias; os textos alternativos identificam cada recurso.

## Editar sem quebrar a composição

- `README.md`: todo o texto público, links e ordem das secções, em inglês.
- `assets/hero.svg` e `assets/hero-mobile.svg`: banner original nas duas proporções.
- `assets/typing.svg`: recurso da versão anterior, preservado mas já não exibido no README.
- `assets/project-*.svg`: cards dos dois projetos.
- `assets/footer.svg`: assinatura visual.
- `scripts/metrics.mjs`: cores, parsing, métricas e renderização dos cartões.
- `assets/generated/`: ficheiros produzidos pelo gerador e pela snake. Não editar números à mão.
- `.github/workflows/profile-assets.yml`: atualização diária e permissões do job.
- `tests/metrics.test.mjs`: testes de cálculo, parsing, escaping e ausência de valores inventados.
- `tests/profile.test.mjs`: navegação, recursos locais, contactos e hierarquia do perfil.

Paleta: fundo `#101715`, borda `#2c3b34`, texto `#eef6f0`, secundário `#9fb4a6`, destaque `#7ee2b8`. As animações próprias respeitam redução de movimento; o README troca a snake por um gráfico estático quando essa preferência está ativa.

Se mudar o username, atualizar README, SVGs, `USER` no script, o teste de repositório do workflow, `github_user_name` e os contactos. Discord é apresentado como username: não foi inventado um ID numérico nem um link de convite.

## Verificação local

```powershell
node --test tests/*.test.mjs
node scripts/metrics.mjs
```

O segundo comando consulta apenas dados públicos e está sujeito ao limite da API. Sem token funciona para este volume; no Actions utiliza o token automático. O parser recusa datas em falta, contagens ausentes e respostas alteradas, em vez de publicar zeros falsos.

A atualização remota só pode ser confirmada depois de publicar os ficheiros e observar uma execução bem-sucedida do workflow. A pré-visualização local não é prova de execução do GitHub Actions nem garantia de comportamento idêntico em todas as versões do renderizador GitHub.

## Revisão V2 — apresentação profissional

- Apresentação em inglês com área de desenvolvimento, formação e competências aplicadas, sem títulos de senioridade ou experiência profissional inventada.
- Projetos antes da lista de tecnologias, com contexto técnico e funcionalidades verificadas nos READMEs locais dos dois projetos.
- Competências agrupadas por programação, interfaces, backend/dados e ferramentas, com descrição do contexto de utilização.
- Banner mais compacto; removida a animação de escrita do percurso principal. Mantido apenas um sinal discreto no banner de desktop. Estatísticas, milestones e snake ficam numa secção expansível.
- `GitHub Profile - lucaszz7` e o ZIP da V1 são versões anteriores. A versão de trabalho atual está neste clone `lucaszz7`. A pasta `lucaszz7/` interna, já existente e não versionada, não foi alterada.

Verificação V2 em 29/09/2026: dez testes passaram, o diff não apresenta erros de whitespace e os 13 SVGs foram validados como XML. A pré-visualização foi revista em desktop e a 375 px; verificaram-se também a largura de 768 px, as âncoras e a abertura das estatísticas. Não foram observados imagens em falta nem overflow horizontal nessas verificações. A captura final e a nova revisão do fundo claro foram interrompidas por indisponibilidade da pré-visualização; a revisão clara da V1 não é apresentada como validação da V2. O pacote ZIP exclui o servidor temporário, as suas dependências e qualquer repositório interno.

## Bio curta opcional para a barra lateral

`Computer Programming student | Desktop & full-stack web | Python, TypeScript & SQL | Data integration & AI-assisted development`

Esta bio é apenas uma sugestão. Nome, fotografia, bio e repositórios fixados são configurações do perfil GitHub, não elementos controlados pelo README; não foram alterados nesta revisão. Não foi criada uma fotografia nem foram inventadas conquistas para preencher as referências.
