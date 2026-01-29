# 🔴 PLANO DE QUALIDADE E TESTES — ANTIGRAVITY

**Responsável:** QA & Testing Lane  
**Data:** 2026-01-29  
**Status:** 🔴 Auditoria Inicial Completa

---

## 📋 RESUMO EXECUTIVO

Auditoria completa do código-fonte e fluxos da aplicação ANTIGRAVITY (PEC-OS). Este documento consolida todos os bugs identificados, casos extremos (edge cases), e recomendações de testes.

### ⚠️ Severidade dos Achados

- 🔴 **Crítico**: 3 bugs
- 🟡 **Médio**: 8 bugs/edge cases
- 🟢 **Baixo**: 5 melhorias

---

## � BUGS CRÍTICOS (CORRIGIDOS)

### 1. **[RESOLVIDO] API Chat sem tratamento de erro adequado**
**Arquivo:** `app/api/chat/route.ts`  
**Linha:** 33  
**Descrição:** A API de chat apenas loga erros no console, mas não retorna mensagens de erro estruturadas ao cliente.

```typescript
// Atual
console.error('Chat API Error:', error);
return NextResponse.json({ error: 'Internal error' }, { status: 500 });
```

**Impacto:** Usuário não recebe feedback claro quando a IA falha. Dificulta debugging em produção.

**Reprodução:**
1. Desligar a API do OpenAI ou usar chave inválida
2. Tentar enviar mensagem no chat
3. Usuário vê apenas "Desculpe, tive um problema de conexão"

**Solução:** Implementar logging estruturado + mensagens de erro específicas.

---

### 2. **[RESOLVIDO] Supabase Client sem validação de credenciais**
**Arquivo:** `lib/supabase/client.ts`  
**Linha:** 8  
**Descrição:** Apenas loga erro no console quando credenciais estão faltando, mas cria cliente com placeholders.

```typescript
console.error('Supabase credentials missing or invalid in client-side environment!')
```

**Impacto:** Aplicação pode rodar com cliente Supabase inválido, causando falhas silenciosas em autenticação e sync.

**Reprodução:**
1. Remover variáveis de ambiente do Supabase
2. Tentar fazer login
3. Middleware redireciona para /login mas auth nunca funciona

**Solução:** Throw error ou mostrar tela de configuração quando credenciais faltam.

---

### 3. **Race Condition no LiveStatus**
**Arquivo:** `components/LiveStatus.tsx`  
**Linhas:** 47-53  
**Descrição:** Componente escuta evento `storage` do window, mas pode não capturar mudanças feitas pelo AIChat se o evento disparar antes do listener estar registrado.

```typescript
window.addEventListener('storage', handleStorageChange);
```

**Impacto:** LiveStatus pode mostrar dados desatualizados após comandos da IA.

**Reprodução:**
1. Abrir dashboard
2. Enviar comando rápido no AIChat (ex: "operação verde")
3. LiveStatus pode não atualizar imediatamente

**Solução:** Usar Context API ou state management (Zustand/Jotai) ao invés de eventos de storage.

---

## 🟡 BUGS MÉDIOS / EDGE CASES

### 4. **Validação de data inconsistente**
**Arquivo:** `components/AIChat.tsx`  
**Linha:** 66  
**Descrição:** Usa `new Date().toISOString().split('T')[0]` em múltiplos lugares sem validação de timezone.

**Impacto:** Usuários em timezones diferentes podem ter datas inconsistentes.

**Solução:** Centralizar lógica de data em `lib/date-utils.ts` com timezone awareness.

---

### 5. **Comando da IA pode falhar silenciosamente**
**Arquivo:** `components/AIChat.tsx`  
**Linhas:** 148-153  
**Descrição:** Se o JSON do comando da IA estiver malformado, apenas loga erro mas não informa usuário.

```typescript
try {
    const command = JSON.parse(jsonString);
    await executeCommand(command);
} catch (e) {
    console.error('Failed to parse AI command', e);
}
```

**Impacto:** Usuário acha que comando foi executado, mas nada acontece.

**Solução:** Adicionar mensagem de erro na UI quando comando falha.

---

### 6. **Métrica não encontrada não retorna feedback**
**Arquivo:** `components/AIChat.tsx`  
**Linhas:** 78-80  
**Descrição:** Quando métrica não existe, throw error mas não há UI feedback.

**Impacto:** Usuário não sabe que precisa criar a métrica primeiro.

**Solução:** Retornar mensagem sugerindo criar métrica via configuração.

---

### 7. **[RESOLVIDO] Sync errors apenas no console**
**Arquivo:** `lib/sync.ts`  
**Linhas:** 26, 40, 54, 66, 79, 93  
**Descrição:** 6 pontos de falha de sync que apenas logam no console.

**Impacto:** Usuário pode perder dados sem saber que sync falhou.

**Solução:** Toast notifications para erros de sync + retry automático.

---

### 8. **[RESOLVIDO] localStorage pode exceder quota**
**Arquivo:** `lib/storage.ts`  
**Linhas:** 118-124  
**Descrição:** Não há tratamento para `QuotaExceededError`.

**Impacto:** Aplicação pode parar de salvar dados silenciosamente.

**Solução:** Implementar limpeza automática de dados antigos + alerta ao usuário.

---

### 9. **Middleware com placeholders em produção**
**Arquivo:** `middleware.ts`  
**Linhas:** 12-13  
**Descrição:** Usa placeholders se env vars não existirem.

```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
```

**Impacto:** Pode passar em build mas falhar em runtime.

**Solução:** Validar env vars no build time.

---

### 10. **Onboarding pode ser mostrado múltiplas vezes**
**Arquivo:** `app/page.tsx`  
**Linha:** 136  
**Descrição:** `showOnboarding` é controlado por state local, não persiste.

**Impacto:** Usuário vê onboarding toda vez que recarrega página.

**Solução:** Persistir flag no localStorage.

---

### 11. **ServiceWorker registration sem retry**
**Arquivo:** `app/layout.tsx`  
**Linhas:** 52-54  
**Descrição:** Se registro falhar, apenas loga erro.

**Impacto:** PWA features podem não funcionar.

**Solução:** Implementar retry com backoff exponencial.

---

## 🟢 MELHORIAS RECOMENDADAS

### 12. **[IMPLEMENTADO] Remover console.log de produção**
**Arquivos:** 8 arquivos com console.log  
**Descrição:** Logs de debug devem ser removidos ou usar logger condicional.

**Solução:** Criar `lib/logger.ts` com níveis de log (dev/prod).

---

### 13. **Adicionar error boundaries**
**Descrição:** Nenhum error boundary React implementado.

**Impacto:** Crash em um componente derruba toda aplicação.

**Solução:** Adicionar ErrorBoundary em `app/layout.tsx`.

---

### 14. **[IMPLEMENTADO] Falta validação de input do usuário**
**Arquivo:** `components/CheckDiario.tsx`, `SemanaViva.tsx`, etc.  
**Descrição:** Inputs não validam tamanho/tipo antes de salvar.

**Solução:** Adicionar Zod schemas para validação.

---

### 15. **Falta testes automatizados**
**Descrição:** Zero testes unitários, integração ou E2E.

**Impacto:** Regressões podem passar despercebidas.

**Solução:** Implementar suite de testes (ver seção abaixo).

---

### 16. **Acessibilidade não verificada**
**Descrição:** Sem testes de a11y, pode ter problemas com screen readers.

**Solução:** Adicionar testes com axe-core.

---

## 🧪 PLANO DE TESTES

### Fase 1: Setup de Infraestrutura
- [ ] Instalar Jest + React Testing Library
- [ ] Instalar Playwright para E2E
- [ ] Configurar coverage reports
- [ ] Setup CI/CD para rodar testes

### Fase 2: Testes Unitários
- [ ] `lib/storage.ts` - 100% coverage
- [ ] `lib/date-utils.ts` - 100% coverage
- [ ] `lib/alert-engine.ts` - edge cases
- [ ] `lib/metrics-engine.ts` - cálculos de status

### Fase 3: Testes de Integração
- [ ] AIChat + Storage integration
- [ ] LiveStatus + Storage sync
- [ ] Supabase sync flow
- [ ] API routes (/api/chat)

### Fase 4: Testes E2E (Playwright)
- [ ] Fluxo completo: Login → Dashboard → Check Diário
- [ ] Fluxo: Configurar métrica → Registrar valor → Ver no LiveStatus
- [ ] Fluxo: Chat com IA → Comando executado → Dados atualizados
- [ ] Fluxo: Semana Viva → Adicionar projeto → Marcar progresso
- [ ] Fluxo: Impacto → Registrar → Exportar

### Fase 5: Testes de Regressão
- [ ] Criar suite de smoke tests
- [ ] Testes de performance (Lighthouse)
- [ ] Testes de acessibilidade (axe)

---

## 🎯 PRÓXIMOS PASSOS

### Imediato (Esta Sprint)
1. ✅ Criar este PLAN.md
2. [ ] Criar pasta `__tests__/`
3. [ ] Configurar Jest + RTL
4. [ ] Escrever primeiros 5 testes unitários
5. [ ] Configurar Playwright

### Curto Prazo (Próxima Sprint)
1. [ ] Corrigir bugs críticos (#1, #2, #3)
2. [ ] Implementar error boundaries
3. [ ] Adicionar logger estruturado
4. [ ] Escrever testes E2E principais

### Médio Prazo
1. [ ] 80%+ code coverage
2. [ ] CI/CD com testes automáticos
3. [ ] Monitoring de erros (Sentry?)
4. [ ] Performance budgets

---

## 📊 MÉTRICAS DE QUALIDADE

### Baseline Atual (2026-01-29)
- **Testes Unitários:** 0
- **Testes E2E:** 0
- **Code Coverage:** 0%
- **console.error:** 21 ocorrências
- **console.log:** 8 ocorrências
- **Error Boundaries:** 0
- **TypeScript Strict:** ✅ Ativo
- **ESLint:** ✅ Configurado

### Meta (30 dias)
- **Testes Unitários:** 50+
- **Testes E2E:** 10+
- **Code Coverage:** 80%+
- **console.* em produção:** 0
- **Error Boundaries:** 3+
- **Bugs Críticos:** 0

---

## 🔍 OBSERVAÇÕES ADICIONAIS

### Pontos Positivos
- ✅ TypeScript bem tipado
- ✅ Estrutura de pastas clara
- ✅ Componentes modulares
- ✅ Design system consistente

### Débitos Técnicos
- ⚠️ Falta de testes
- ⚠️ Error handling inconsistente
- ⚠️ Logs de debug em produção
- ⚠️ Sem monitoring de erros
- ⚠️ Sem validação de inputs

---

**Documento vivo.** Atualizar conforme bugs são corrigidos e testes implementados.

---
---

# 🚀 ARQUITETURA DE INTEGRAÇÕES — ANTIGRAVITY

**Responsável:** Research & Strategic Planning Lane  
**Data:** 2026-01-29  
**Status:** ✅ Pesquisa Completa

---

## 📋 CATEGORIAS DE INTEGRAÇÃO

Este documento complementa o plano de QA com pesquisa técnica sobre **integrações de terceiros** compatíveis com Next.js 15 + Serverless.

### Categorias Pesquisadas

1. [Notificações (Email, Push, SMS)](#notificações)
2. [Exportação de Dados (CSV, Excel, PDF)](#exportação-de-dados)
3. [Integração com Calendário](#integração-com-calendário)
4. [Backup Automático (Cloud Storage)](#backup-automático)
5. [Webhooks para Automações](#webhooks)
6. [Ferramentas de Produtividade](#ferramentas-de-produtividade)
7. [APIs de CRM e Analytics](#apis-de-crm-e-analytics)

---

## 📧 NOTIFICAÇÕES

### Email: **Resend** ⭐ (Recomendado)

**Justificativa:**
- API moderna e simples
- Templates com React Email
- Serverless-first
- 3.000 emails/mês grátis

```bash
npm install resend react-email
```

**Alternativas:** SendGrid, AWS SES, Postmark

---

### Push: **OneSignal** ⭐

**Justificativa:**
- SDK Web/iOS/Android
- 10k subscribers grátis
- Serverless-friendly

```bash
npm install react-onesignal
```

**Alternativas:** Firebase Cloud Messaging, Pusher Beams

---

### SMS: **Twilio** ⭐

**Justificativa:**
- Líder de mercado
- API confiável
- Suporte global

```bash
npm install twilio
```

**Alternativas:** AWS SNS, Vonage

---

## 📊 EXPORTAÇÃO DE DADOS

### CSV: **papaparse** ⭐

**Justificativa:**
- Leve e rápido
- Client + Server side
- Parsing e geração

```bash
npm install papaparse @types/papaparse
```

---

### Excel: **ExcelJS** ⭐

**Justificativa:**
- Controle total de formatação
- Fórmulas, estilos, imagens
- TypeScript support

```bash
npm install exceljs
```

**Exemplo de uso:**
```typescript
// app/api/export/excel/route.ts
import ExcelJS from 'exceljs';

export async function POST(req: Request) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Dados');
  
  sheet.columns = [
    { header: 'Nome', key: 'nome', width: 30 },
    { header: 'Email', key: 'email', width: 40 }
  ];
  
  sheet.addRows(data);
  const buffer = await workbook.xlsx.writeBuffer();
  
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=export.xlsx'
    }
  });
}
```

---

### PDF: **Puppeteer** ⭐ (Server-side)

**Justificativa:**
- Renderiza HTML/CSS como PDF
- Fidelidade visual perfeita
- Ideal para relatórios complexos

```bash
npm install puppeteer
```

> ⚠️ **Importante:** Para Vercel, usar `chrome-aws-lambda`

**Alternativas (Client-side):** jsPDF, react-pdf, pdf-lib

---

## 📅 INTEGRAÇÃO COM CALENDÁRIO

### Google Calendar: **googleapis** ⭐ (Oficial)

**Justificativa:**
- SDK oficial do Google
- OAuth 2.0 integrado
- TypeScript support

```bash
npm install googleapis
```

**Arquitetura OAuth 2.0:**
1. Usuário autoriza app → obtém `refresh_token`
2. App armazena token no Supabase (criptografado)
3. API Routes renovam `access_token` automaticamente

**Segurança:**
- ✅ Tokens criptografados no Supabase
- ✅ `access_type=offline` para refresh tokens
- ✅ Rate limiting
- ✅ Scopes mínimos necessários

**Alternativa:** Microsoft Graph API (Outlook/Office 365)

---

## ☁️ BACKUP AUTOMÁTICO

### Cloud Storage: **Cloudflare R2** ⭐ (Custo-benefício)

**Justificativa:**
- **Zero egress fees** (vs S3)
- API compatível com S3
- $0.015/GB/mês
- Perfeito para backups

```bash
npm install @aws-sdk/client-s3
```

**Exemplo:**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function backupToR2(data: any, filename: string) {
  const command = new PutObjectCommand({
    Bucket: 'antigravity-backups',
    Key: `${new Date().toISOString()}-${filename}`,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  });
  await r2.send(command);
}
```

**Estratégia:**
- Diário: Backup incremental
- Semanal: Backup completo
- Retenção: 90 dias

**Alternativas:** AWS S3, Supabase Storage, Vercel Blob

---

## 🔗 WEBHOOKS

### Webhook Management: **Svix** ⭐

**Justificativa:**
- Gerenciamento completo
- Retry automático
- Logs e debugging
- HMAC signatures
- 50k msgs/mês grátis

```bash
npm install svix
```

**Recebimento seguro:**
```typescript
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const payload = await req.text();
  const wh = new Webhook(process.env.SVIX_WEBHOOK_SECRET!);
  
  try {
    const verified = wh.verify(payload, {
      'svix-id': req.headers.get('svix-id')!,
      'svix-timestamp': req.headers.get('svix-timestamp')!,
      'svix-signature': req.headers.get('svix-signature')!,
    });
    
    return Response.json({ received: true });
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

**Alternativas:** Hookdeck, implementação manual

---

## 🛠️ FERRAMENTAS DE PRODUTIVIDADE

### Notion: **@notionhq/client** ⭐ (Oficial)

**Justificativa:**
- SDK oficial
- TypeScript nativo
- Bem documentado

```bash
npm install @notionhq/client
```

**Use Cases:**
- Sincronizar tarefas ANTIGRAVITY → Notion
- Notion como CMS headless
- Exportar relatórios

---

### Trello: **trello.js** ⭐

**Justificativa:**
- 100% API coverage
- TypeScript support
- Atualizado frequentemente

```bash
npm install trello @types/trello
```

**Use Cases:**
- Criar cards de tarefas automaticamente
- Sincronizar status de projetos
- Integrar com Semana Viva

---

## 🎯 APIS DE CRM E ANALYTICS

### HubSpot: **@hubspot/api-client** ⭐

```bash
npm install @hubspot/api-client
```

### Pipedrive: **pipedrive** ⭐

```bash
npm install pipedrive
```

### Google Analytics 4: **@google-analytics/data** ⭐

```bash
npm install @google-analytics/data
```

---

## 🏗️ ARQUITETURA RECOMENDADA

### Estrutura de Pastas

```
ferramenta-antigravity/
├── app/api/
│   ├── notifications/
│   │   ├── email/route.ts
│   │   ├── push/route.ts
│   │   └── sms/route.ts
│   ├── export/
│   │   ├── csv/route.ts
│   │   ├── excel/route.ts
│   │   └── pdf/route.ts
│   ├── calendar/
│   │   ├── auth/route.ts
│   │   └── events/route.ts
│   ├── backup/
│   │   └── trigger/route.ts
│   ├── webhooks/
│   │   ├── send/route.ts
│   │   └── receive/route.ts
│   └── integrations/
│       ├── notion/route.ts
│       ├── trello/route.ts
│       └── crm/route.ts
└── lib/
    ├── notifications/
    ├── export/
    ├── calendar.ts
    ├── backup.ts
    └── integrations/
```

---

## 🔐 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```bash
# Notificações
RESEND_API_KEY=
ONESIGNAL_APP_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Calendário
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Cloud Storage
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# Webhooks
SVIX_API_KEY=
SVIX_WEBHOOK_SECRET=

# Integrações
NOTION_API_KEY=
TRELLO_API_KEY=
TRELLO_TOKEN=
HUBSPOT_ACCESS_TOKEN=
PIPEDRIVE_API_KEY=
```

---

## 💰 COMPARAÇÃO DE CUSTOS

| Serviço | Free Tier | Pago (100 usuários) |
|---------|-----------|---------------------|
| Resend | 3k emails/mês | $10/mês |
| OneSignal | 10k subscribers | Grátis |
| Twilio SMS | - | ~$50/mês |
| Cloudflare R2 | 10GB | $1.50/mês |
| Svix | 50k msgs/mês | $25/mês |
| Notion API | Grátis | Grátis |
| Trello API | Grátis | Grátis |
| HubSpot | Limitado | $50+/mês |
| **TOTAL** | **~$0** | **~$136/mês** |

---

## ✅ PRÓXIMOS PASSOS (BUILDER)

### Fase 1: Setup Inicial
- [ ] Escolher prioridades de integração
- [ ] Configurar variáveis de ambiente
- [ ] Instalar dependências base

### Fase 2: Implementação
- [ ] Criar API Routes
- [ ] Implementar funções em `/lib`
- [ ] Criar UI components

### Fase 3: Testes
- [ ] Testar cada integração isoladamente
- [ ] Testes E2E dos fluxos completos
- [ ] Validar error handling

### Fase 4: Deploy
- [ ] Configurar secrets em produção
- [ ] Deploy gradual (feature flags)
- [ ] Monitoring e logs

---

## 📚 REFERÊNCIAS TÉCNICAS

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Resend Docs](https://resend.com/docs)
- [ExcelJS GitHub](https://github.com/exceljs/exceljs)
- [Puppeteer Docs](https://pptr.dev/)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Svix Docs](https://docs.svix.com/)
- [Notion API](https://developers.notion.com/)
- [Trello API](https://developer.atlassian.com/cloud/trello/)

---

**Seção criada por:** Research & Strategic Planning Lane  
**Última atualização:** 2026-01-29
