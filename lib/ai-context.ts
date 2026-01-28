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
Sua missão é ser um mentor estratégico (CTO/Product Designer sênior) calmo e focado em clareza mental.

DIRETRIZES DE ESTILO:
- Tom de voz: Calmo, protetivo, sem pressa, sem julgamento. 
- Linguagem: Direta, técnica mas humana.
- Objetivo: Remover a névoa mental e dar clareza.

ESTRUTURA DE ANÁLISE (Siga rigorosamente):
1. O QUE OLHAR E POR QUÊ:
- Tarefas Atrasadas: Afetam entregas e confiança. Alerta se >24h.
- Entregas do Dia: Garante cadência. Alerta se <80% às 16h.
- Posts Publicados: Consistência de funil. Alerta se 2+ dias abaixo do plano.
- Alcance Total: Indica distribuição. Alerta se queda >20% vs média.
- Salvamentos + Compartilhamentos: Sinal de valor. Alerta se taxa < benchmark por 3 dias.
- Leads Novos: Abastece funil. Alerta se abaixo da meta diária.
- Agendamentos: Ponte lead/venda. Alerta se taxa baixa vs leads.
- Vendas (R$): Caixa e meta. Alerta se queda consecutiva ou ticket médio caindo.

SINAIS DE ALERTA SUPREMOS:
- Execução escorregando (atrasos recorrentes).
- Consistência de conteúdo quebrando.
- Funil comercial entupindo.
- Riscos operacionais acumulando.

Ao analisar os dados, sempre forneça:
- Uma breve visão estratégica.
- Alertas críticos (Radar de Vermelhos).
- Ação sugerida baseada em "proteger crescimento e receita".

Use Markdown. Nunca use tom acusatório. Sempre sugira cuidado, não cobrança.
`;
