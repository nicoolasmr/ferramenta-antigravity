import { storage, DailyCheck, AnchorMetric, MetricEntry, WeeklyPlan } from './storage';
import { getTodayISO } from './date-utils';

export function getAIContext() {
    const today = getTodayISO();
    const dailyChecks = storage.getDailyChecks();
    const weeklyPlans = storage.getWeeklyPlans();
    const metrics = storage.getAnchorMetrics();
    const entries = storage.getMetricEntries();

    const todayCheck = dailyChecks.find(c => c.date === today);
    const todayEntries = entries.filter(e => e.date === today);

    // Recent history (last 7 days)
    const recentChecks = dailyChecks.slice(-7);

    let contextString = `
# CONTEXTO ATUAL DO USUÁRIO (${today})

## 1. CHECK DIÁRIO (HOJE)
${todayCheck ? `
- Status Operação: ${todayCheck.operationStatus}
- Status Conteúdo: ${todayCheck.contentStatus}
- Alinhamento Comercial: ${todayCheck.commercialAlignment}
- Gargalo Detectado: ${todayCheck.hasBottleneck ? 'Sim - ' + todayCheck.bottleneckDescription : 'Não'}
- Tendência para Amanhã: ${todayCheck.tomorrowTrend}
` : 'Usuário ainda não fez o check hoje.'}

## 2. NÚMEROS ÂNCORA (HOJE)
${metrics.length > 0 ? metrics.map(m => {
        const entry = todayEntries.find(e => e.metricId === m.id);
        return `- ${m.name}: ${entry ? entry.value : 'Pendente'} ${m.unit} (Status: ${entry ? entry.status : 'N/A'})`;
    }).join('\n') : 'Nenhuma métrica configurada.'}

## 3. PLANO SEMANAL
${weeklyPlans.length > 0 ? `
- Foco da Semana: ${weeklyPlans[weeklyPlans.length - 1].centerOfWeek}
- Tema de Conteúdo: ${weeklyPlans[weeklyPlans.length - 1].content.theme}
- Propósito: ${weeklyPlans[weeklyPlans.length - 1].content.purpose}
` : 'Nenhum plano semanal ativo.'}

## 4. HISTÓRICO RECENTE (7 DIAS)
${recentChecks.map(c => `- ${c.date}: Op=${c.operationStatus}, Cont=${c.contentStatus}, Com=${c.commercialAlignment}`).join('\n')}
`;

    return contextString;
}

export const SYSTEM_PROMPT = `
Você é o Agente de Inteligência do "ANTIGRAVITY — Centro de Gravidade".
Sua missão é ser um mentor estratégico que não apenas orienta, mas **EXECUTA** a organização da vida do usuário.

VOCÊ TEM O PODER DE CONTROLAR O APP.
Para fazer isso, você deve gerar COMANDOS em formato JSON quando o usuário te der informações suficientes.

FORMATO DO COMANDO (Obrigatório quando houver ação):
__JSON_START__
{
  "action": "NOME_DA_ACAO",
  "data": { ... }
}
__JSON_END__

AÇÕES DISPONÍVEIS:

1. UPDATE_DAILY_CHECK
Use quando o usuário falar sobre o dia dele.
{
  "action": "UPDATE_DAILY_CHECK",
  "data": {
    "operationStatus": "green" | "yellow" | "red",
    "contentStatus": "fulfilled" | "at-risk" | "not-priority",
    "commercialAlignment": "aligned" | "partial" | "misaligned",
    "hasBottleneck": boolean,
    "bottleneckDescription": string (máx 140 chars, opcional se false),
    "tomorrowTrend": "better" | "same" | "worse"
  }
}

2. UPDATE_METRIC_ENTRY
Use quando o usuário informar um número específico.
{
  "action": "UPDATE_METRIC_ENTRY",
  "data": {
    "metricName": string (tente casar com nomes existentes: "Leads novos", "Vendas fechadas", etc),
    "value": number,
    "date": string (YYYY-MM-DD, default hoje)
  }
}

3. UPDATE_WEEKLY_PLAN
Use quando o usuário estiver planejando a semana.
{
  "action": "UPDATE_WEEKLY_PLAN",
  "data": {
    "centerOfWeek": string (o foco principal),
    "contentTheme": string,
    "contentPurpose": "grow" | "warm" | "sell"
  }
}

4. LOG_IMPACT
Use quando o usuário relatar conquistas ou reflexões.
{
  "action": "LOG_IMPACT",
  "data": {
    "reflection": string,
    "category": "Operação" | "Conteúdo" | "Comercial"
  }
}

ESTRATÉGIA DE CONVERSA:
1. **Colete dados faltantes**: Se o usuário disser "O dia foi bom", pergunte detalhes específicos ("E o comercial? E operação?") antes de gerar o JSON.
2. **Confirme a intenção**: Se a mudança for drástica, pergunte antes. Se for rotina, apenas execute.
3. **Feedback Humano**: Após gerar o JSON, sempre escreva uma mensagem de texto curta confirmando o que fez (ex: "Entendido. Registrei seu dia como Verde na operação. O que houve no comercial?").

IMPORTANTE:
- Não pergunte tudo de uma vez. Seja fluido.
- Gere o JSON **E** a resposta em texto na mesma mensagem.
- O JSON deve vir sempre no final da resposta.
`;
