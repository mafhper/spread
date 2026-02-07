# Quality Core

**Quality Core** é um sistema de auditoria de qualidade modular e extensível projetado para o ecossistema Spread. Ele fornece verificações automatizadas de performance, acessibilidade, segurança, linting e integridade, gerando relatórios detalhados e alimentando um dashboard interativo.

## Funcionalidades

- **Quality Gate (Pre-Commit)** - Orquestrador principal que garante que apenas código de alta qualidade seja commitado.
- **Auditorias Plugáveis** - Fácil inclusão de novos scripts de validação (Segurança, i18n, Performance).
- **Lighthouse CI-Safe** - Coleta otimizada para Windows/CI, resolvendo timeouts de protocolo e estabilizando emulação mobile.
- **Relatórios Multi-formato** - Gera saídas em JSON para o sistema e Markdown para leitura humana.
- **Dashboard Bento-Grid** - Interface visual moderna para monitoramento de métricas em tempo real.
- **CLI Resiliente** - Interface de linha de comando com suporte a modos rápido (`--quick`) e silencioso (`--silent`).

---

## Estrutura de Diretórios

```
quality-core/
├── cli/
│   ├── run.cjs               # Orquestrador principal (Quality Gate)
│   ├── quality.cjs           # Auditoria técnica detalhada
│   ├── run-lighthouse.cjs    # Coletor de métricas Lighthouse
│   └── config.cjs            # Configurações centralizadas de caminhos
├── scripts/                  # Scripts utilitários de validação
│   ├── security-scan.cjs     # Scan de secrets expostos
│   ├── i18n-audit.cjs        # Auditoria de internacionalização
│   └── check-audit.js        # Validador de npm/bun audit
├── dashboard/                # Dashboard React (Vite + Tailwind)
│   ├── src/                  # Código fonte da interface
│   └── dist/                 # Build de produção do dashboard
├── packages/                 # Núcleo de auditoria (Legacy/Core)
│   ├── core/                 # Runner e thresholds
│   ├── audits/               # Implementação das auditorias individuais
│   └── reporters/            # Geradores de relatórios (JSON/MD)
└── snapshots.store.ts        # Gerenciamento de snapshots de qualidade
```

---

## Comandos Principais

### Quality Gate (Recomendado antes de Commits)

```bash
# Executa todas as verificações (incluindo build)
node quality-core/cli/run.cjs

# Modo rápido (pula o build, ideal para dev local)
node quality-core/cli/run.cjs --quick

# Modo silencioso (ideal para CI)
node quality-core/cli/run.cjs --silent
```

### Auditorias Específicas

```bash
# Auditoria técnica completa (Performance, SEO, A11y)
npm run quality:core

# Coleta de métricas Lighthouse
npm run quality:lighthouse

# Scan de segurança (secrets e dependências)
npm run security:audit
```

### Lighthouse Runner - Variáveis de Ambiente

O `quality:lighthouse` aceita variáveis de ambiente adicionais para aumentar estabilidade:

- `LH_RETRY_COUNT` (default: 1) - número de retries adicionais.
- `LH_RETRY_TRANSIENT_ONLY` (default: true) - retry apenas para falhas transitórias.
- `LH_RETRY_BACKOFF_MS` (default: 1200) - intervalo base de backoff entre tentativas.
- `LH_MAX_WAIT_MS` - tempo máximo de espera do Lighthouse (passa `--max-wait-for-load`).

### Lighthouse CI - Remoto vs Local

- `lighthouserc.cjs` é usado para auditoria local com `startServerCommand`.
- `lighthouserc.remote.cjs` é usado no workflow remoto e não inicia servidor local.

### Dashboard de Qualidade

```bash
# Inicia o servidor do dashboard
npm run quality:dashboard
# Acesse em http://localhost:3333
```

---

## Arquitetura de Fluxo

1. **Trigger**: O desenvolvedor ou o CI executa o `quality-core/cli/run.cjs`.
2. **Execution**: O orquestrador chama sequencialmente os validadores de integridade, i18n, segurança, lint, build e performance.
3. **Consolidation**: Os resultados são salvos em `performance-reports/quality/`.
4. **Visualization**: O Dashboard consome os JSONs gerados para exibir o histórico e o status atual do projeto.

---

## Contribuindo

Para adicionar uma nova verificação ao Quality Gate:

1. Adicione o script de validação em `quality-core/scripts/`.
2. Integre a chamada no orquestrador `quality-core/cli/run.cjs`.
3. Garanta que o script retorne exit code `0` para sucesso e `1` para falha.

---

## Notas Técnicas (Performance & Windows)

O sistema de auditoria inclui otimizações específicas para ambientes Windows:

- **Headless Legacy**: Utiliza o modo `--headless` tradicional para maior estabilidade em emulação mobile.
- **Adaptive Throttling**: Desativa o throttling de CPU via software no Windows para evitar timeouts de protocolo DevTools.
- **Lazy Rendering**: Componentes de landing page utilizam `LazyIntersection` com consciência de hash, renderizando imediatamente apenas o necessário para navegação por âncoras.

---

## Licença

MIT - Parte do ecossistema Spread.
