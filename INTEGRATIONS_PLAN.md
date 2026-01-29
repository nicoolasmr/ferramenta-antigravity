# PLAN.md — Arquitetura de Integrações ANTIGRAVITY

**Documento de Pesquisa e Planejamento Estratégico**  
*Última atualização: 2026-01-29*

---

## 🎯 Objetivo

Este documento apresenta as **melhores bibliotecas e abordagens técnicas** para integrar funcionalidades avançadas no ANTIGRAVITY, mantendo compatibilidade com:

- **Next.js 15** (App Router + React Server Components)
- **Arquitetura Serverless** (Vercel, AWS Lambda, Edge Functions)
- **TypeScript** (type-safe)
- **Supabase** (backend atual)

---

## 📋 Categorias de Integração

1. [Notificações (Email, Push, SMS)](#1-notificações)
2. [Exportação de Dados (CSV, Excel, PDF)](#2-exportação-de-dados)
3. [Integração com Calendário](#3-integração-com-calendário)
4. [Backup Automático (Cloud Storage)](#4-backup-automático)
5. [Webhooks para Automações](#5-webhooks)
6. [Ferramentas de Produtividade](#6-ferramentas-de-produtividade)
7. [APIs de CRM e Analytics](#7-apis-de-crm-e-analytics)

---

## 1. Notificações

### 📧 Email

#### **Recomendação: Resend** ⭐ (Primeira Escolha)

**Por quê?**
- API moderna e simples
- Excelente DX (Developer Experience)
- Templates com React Email
- Serverless-first
- Pricing generoso (3.000 emails/mês grátis)

```bash
npm install resend react-email
```

**Exemplo de uso:**
```typescript
// app/api/notifications/email/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, subject, html } = await req.json();
  
  const { data, error } = await resend.emails.send({
    from: 'ANTIGRAVITY <noreply@antigravity.app>',
    to,
    subject,
    html,
  });

  return Response.json({ data, error });
}
```

**Alternativas:**
- **SendGrid**: Mais robusto, mas complexo
- **AWS SES**: Mais barato em escala, requer configuração AWS
- **Postmark**: Focado em transacional, excelente deliverability

---

### 📱 Push Notifications

#### **Recomendação: OneSignal** ⭐

**Por quê?**
- SDK para Web, iOS, Android
- Segmentação avançada
- Free tier generoso (10k subscribers)
- Serverless-friendly API

```bash
npm install react-onesignal
```

**Alternativas:**
- **Firebase Cloud Messaging (FCM)**: Grátis, mas requer Firebase
- **Pusher Beams**: Simples, mas pago

---

### 💬 SMS

#### **Recomendação: Twilio** ⭐

**Por quê?**
- Líder de mercado
- API confiável
- Suporte global
- Serverless-ready

```bash
npm install twilio
```

**Alternativas:**
- **AWS SNS**: Mais barato, mas menos features
- **Vonage (Nexmo)**: Boa alternativa

---

## 2. Exportação de Dados

### 📊 CSV

#### **Recomendação: papaparse** ⭐

**Por quê?**
- Leve e rápido
- Parsing e geração
- Funciona client-side e server-side

```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

**Exemplo:**
```typescript
import Papa from 'papaparse';

const data = [
  { nome: 'João', email: 'joao@example.com' },
  { nome: 'Maria', email: 'maria@example.com' }
];

const csv = Papa.unparse(data);
// Download via Blob API
```

**Alternativas:**
- **json2csv**: Mais simples, menos features
- **export-to-csv**: React-friendly

---

### 📈 Excel (.xlsx)

#### **Recomendação: ExcelJS** ⭐

**Por quê?**
- Controle total sobre formatação
- Suporta fórmulas, estilos, imagens
- TypeScript support
- Funciona server-side (API Routes)

```bash
npm install exceljs
```

**Exemplo:**
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
  
  sheet.addRows([
    { nome: 'João', email: 'joao@example.com' },
    { nome: 'Maria', email: 'maria@example.com' }
  ]);
  
  const buffer = await workbook.xlsx.writeBuffer();
  
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=export.xlsx'
    }
  });
}
```

**Alternativas:**
- **xlsx (SheetJS)**: Mais leve, menos controle
- **json2xls**: Simples, mas limitado

---

### 📄 PDF

#### **Recomendação: Puppeteer (Server-side)** ⭐

**Por quê?**
- Renderiza HTML/CSS como PDF
- Perfeito para relatórios complexos
- Mantém fidelidade visual
- Funciona em API Routes

```bash
npm install puppeteer
```

**Exemplo:**
```typescript
// app/api/export/pdf/route.ts
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  const { html } = await req.json();
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true
  });
  
  await browser.close();
  
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=relatorio.pdf'
    }
  });
}
```

**Alternativas (Client-side):**
- **jsPDF**: Leve, mas limitado em layout
- **react-pdf**: Componentes React, mas curva de aprendizado
- **pdf-lib**: Manipulação de PDFs existentes

> **⚠️ Importante:** Para Puppeteer em serverless (Vercel), use `chrome-aws-lambda` ou configure corretamente.

---

## 3. Integração com Calendário

### 📅 Google Calendar API

#### **Recomendação: googleapis (oficial)** ⭐

**Por quê?**
- SDK oficial do Google
- Suporte completo à API
- OAuth 2.0 integrado
- TypeScript support

```bash
npm install googleapis
```

**Arquitetura:**

```typescript
// lib/google-calendar.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function createEvent(accessToken: string, event: any) {
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event
  });
  
  return response.data;
}
```

**Fluxo OAuth 2.0:**
1. Usuário autoriza app (obtém `refresh_token`)
2. App armazena `refresh_token` no Supabase (criptografado)
3. API Routes usam `refresh_token` para obter `access_token`
4. Tokens expiram? Renovar automaticamente

**Segurança:**
- ✅ Armazenar tokens no Supabase (criptografados)
- ✅ Usar `access_type=offline` para refresh tokens
- ✅ Implementar rate limiting
- ✅ Validar scopes mínimos necessários

**Alternativas:**
- **Microsoft Graph API**: Para Outlook/Office 365
- **next-auth**: Para gerenciar OAuth flows

---

## 4. Backup Automático

### ☁️ Cloud Storage

#### **Recomendação: Cloudflare R2** ⭐ (Custo-benefício)

**Por quê?**
- **Zero egress fees** (diferente do S3)
- API compatível com S3
- Pricing agressivo ($0.015/GB/mês)
- Perfeito para backups

```bash
npm install @aws-sdk/client-s3
```

**Exemplo:**
```typescript
// lib/backup.ts
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

**Estratégia de Backup:**
1. **Diário**: Backup incremental (apenas mudanças)
2. **Semanal**: Backup completo
3. **Retenção**: 90 dias (configurável via lifecycle)

**Alternativas:**
- **AWS S3**: Mais features, mas egress fees
- **Supabase Storage**: Já integrado, mas limitado
- **Vercel Blob**: Simples, mas caro em escala

---

### 🔄 Sincronização com rclone

Para backups cross-cloud (R2 → S3):

```bash
# Instalar rclone
brew install rclone

# Configurar sync automático (cron job)
rclone sync r2:antigravity-backups s3:antigravity-archive --progress
```

---

## 5. Webhooks

### 🔗 Webhook Monitoring

#### **Recomendação: Svix** ⭐

**Por quê?**
- Gerenciamento completo de webhooks
- Retry automático
- Logs e debugging
- Assinaturas verificadas (HMAC)
- Free tier generoso

```bash
npm install svix
```

**Exemplo:**
```typescript
// app/api/webhooks/send/route.ts
import { Svix } from 'svix';

const svix = new Svix(process.env.SVIX_API_KEY!);

export async function POST(req: Request) {
  const { event, data, url } = await req.json();
  
  await svix.message.create('app_id', {
    eventType: event,
    payload: data,
  });
  
  return Response.json({ success: true });
}
```

**Recebimento de Webhooks:**
```typescript
// app/api/webhooks/receive/route.ts
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const payload = await req.text();
  const headers = req.headers;
  
  const wh = new Webhook(process.env.SVIX_WEBHOOK_SECRET!);
  
  try {
    const verified = wh.verify(payload, {
      'svix-id': headers.get('svix-id')!,
      'svix-timestamp': headers.get('svix-timestamp')!,
      'svix-signature': headers.get('svix-signature')!,
    });
    
    // Processar evento verificado
    console.log('Webhook verificado:', verified);
    
    return Response.json({ received: true });
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

**Alternativas:**
- **Hookdeck**: Mais focado em debugging
- **Implementação manual**: Usando Supabase + Queue

---

## 6. Ferramentas de Produtividade

### 📝 Notion API

#### **Recomendação: @notionhq/client** ⭐ (Oficial)

**Por quê?**
- SDK oficial
- TypeScript nativo
- Suporte completo à API
- Bem documentado

```bash
npm install @notionhq/client
```

**Exemplo:**
```typescript
// lib/notion.ts
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function createPage(databaseId: string, properties: any) {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  });
  
  return response;
}

export async function queryDatabase(databaseId: string) {
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  
  return response.results;
}
```

**Use Cases:**
- Sincronizar tarefas do ANTIGRAVITY → Notion
- Usar Notion como CMS (headless)
- Exportar relatórios para Notion

---

### 📋 Trello API

#### **Recomendação: trello.js** ⭐

**Por quê?**
- 100% coverage da API
- Atualizado frequentemente
- TypeScript support
- Browser + Node.js

```bash
npm install trello
npm install --save-dev @types/trello
```

**Exemplo:**
```typescript
// lib/trello.ts
import Trello from 'trello';

const trello = new Trello(
  process.env.TRELLO_API_KEY!,
  process.env.TRELLO_TOKEN!
);

export async function createCard(listId: string, name: string, desc: string) {
  return await trello.addCard(name, desc, listId);
}

export async function getBoards() {
  return await trello.getBoards('me');
}
```

**Use Cases:**
- Criar cards automaticamente de tarefas
- Sincronizar status de projetos
- Integrar com Semana Viva

---

## 7. APIs de CRM e Analytics

### 🎯 HubSpot

#### **Recomendação: @hubspot/api-client** ⭐ (Oficial)

```bash
npm install @hubspot/api-client
```

**Exemplo:**
```typescript
import { Client } from '@hubspot/api-client';

const hubspot = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export async function createContact(email: string, properties: any) {
  return await hubspot.crm.contacts.basicApi.create({
    properties: { email, ...properties }
  });
}
```

---

### 💼 Pipedrive

#### **Recomendação: pipedrive** ⭐

```bash
npm install pipedrive
```

**Exemplo:**
```typescript
import Pipedrive from 'pipedrive';

const pipedrive = new Pipedrive.Client(process.env.PIPEDRIVE_API_KEY!);

export async function createDeal(title: string, value: number) {
  return await pipedrive.Deals.add({ title, value });
}
```

---

### 📊 Google Analytics 4

#### **Recomendação: @google-analytics/data** ⭐

```bash
npm install @google-analytics/data
```

**Exemplo:**
```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analytics = new BetaAnalyticsDataClient();

export async function getPageViews(propertyId: string) {
  const [response] = await analytics.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [{ name: 'screenPageViews' }],
  });
  
  return response;
}
```

---

## 🏗️ Arquitetura Recomendada

### Estrutura de Pastas

```
ferramenta-antigravity/
├── app/
│   └── api/
│       ├── notifications/
│       │   ├── email/route.ts
│       │   ├── push/route.ts
│       │   └── sms/route.ts
│       ├── export/
│       │   ├── csv/route.ts
│       │   ├── excel/route.ts
│       │   └── pdf/route.ts
│       ├── calendar/
│       │   ├── auth/route.ts
│       │   ├── events/route.ts
│       │   └── callback/route.ts
│       ├── backup/
│       │   └── trigger/route.ts
│       ├── webhooks/
│       │   ├── send/route.ts
│       │   └── receive/route.ts
│       └── integrations/
│           ├── notion/route.ts
│           ├── trello/route.ts
│           └── crm/route.ts
├── lib/
│   ├── notifications/
│   │   ├── email.ts
│   │   ├── push.ts
│   │   └── sms.ts
│   ├── export/
│   │   ├── csv.ts
│   │   ├── excel.ts
│   │   └── pdf.ts
│   ├── calendar.ts
│   ├── backup.ts
│   ├── webhooks.ts
│   └── integrations/
│       ├── notion.ts
│       ├── trello.ts
│       └── crm.ts
└── .env.local
```

---

## 🔐 Variáveis de Ambiente

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

## 📊 Comparação de Custos (Estimativa Mensal)

| Serviço | Free Tier | Pago (100 usuários) |
|---------|-----------|---------------------|
| **Resend** | 3k emails | $10/mês (50k emails) |
| **OneSignal** | 10k subscribers | Grátis |
| **Twilio SMS** | - | ~$50/mês (500 SMS) |
| **Cloudflare R2** | 10GB | $1.50/mês (100GB) |
| **Svix** | 50k msgs | $25/mês (250k msgs) |
| **Notion API** | Grátis | Grátis |
| **Trello API** | Grátis | Grátis |
| **HubSpot** | Grátis (limitado) | $50+/mês |
| **Total** | ~$0 | ~$136/mês |

---

## ✅ Próximos Passos (Para o Builder)

1. **Escolher prioridades** (quais integrações implementar primeiro)
2. **Configurar variáveis de ambiente**
3. **Instalar dependências** (`npm install ...`)
4. **Implementar API Routes** (seguir exemplos acima)
5. **Criar UI components** para cada integração
6. **Testar em desenvolvimento**
7. **Deploy para produção**

---

## 📚 Referências

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

**Documento criado por:** Agente de Pesquisa e Planejamento Estratégico  
**Data:** 2026-01-29  
**Status:** ✅ Pronto para execução
