import { AnchorMetric, MetricEntry, MetricStatus } from './storage';
import { format } from 'date-fns';

// Calculate metric status based on value and guardrails
export function calculateMetricStatus(value: number, metric: AnchorMetric): MetricStatus {
    const { guardrails, direction } = metric;

    if (direction === 'higher_better') {
        // Higher is better (e.g., leads, sales, posts)
        if (guardrails.green.min !== undefined && value >= guardrails.green.min) {
            return 'green';
        }
        if (guardrails.yellow.min !== undefined && value >= guardrails.yellow.min) {
            return 'yellow';
        }
        return 'red';
    } else {
        // Lower is better (e.g., delays, bottlenecks)
        if (guardrails.green.max !== undefined && value <= guardrails.green.max) {
            return 'green';
        }
        if (guardrails.yellow.max !== undefined && value <= guardrails.yellow.max) {
            return 'yellow';
        }
        return 'red';
    }
}

// Red alert interface
export interface RedAlert {
    metricId: string;
    metricName: string;
    value: number;
    unit: string;
    action: string;
    addressed: boolean;
}

// Get radar de vermelhos for a specific date
export function getRadarDeVermelhos(
    date: string,
    metrics: AnchorMetric[],
    entries: MetricEntry[]
): RedAlert[] {
    const dateEntries = entries.filter(e => e.date === date && e.status === 'red');
    const redAlerts: RedAlert[] = [];

    for (const entry of dateEntries) {
        const metric = metrics.find(m => m.id === entry.metricId);
        if (metric && metric.isActive) {
            redAlerts.push({
                metricId: metric.id,
                metricName: metric.name,
                value: entry.value,
                unit: metric.unit,
                action: metric.playbook.actionIfRed,
                addressed: entry.addressed || false,
            });
        }
    }

    return redAlerts;
}

// Create default metrics for first-time users
export function createDefaultMetrics(): AnchorMetric[] {
    const now = new Date().toISOString();

    return [
        // Operação 1: Leads novos (daily, higher is better)
        {
            id: 'default-leads',
            name: 'Leads novos',
            category: 'Operação',
            frequency: 'daily',
            direction: 'higher_better',
            unit: 'leads',
            sourceNote: 'Planilha comercial / CRM',
            guardrails: {
                green: { min: 10 },
                yellow: { min: 5 },
                red: { min: 0 },
            },
            playbook: {
                actionIfYellow: 'Revisar canais de aquisição e ajustar CTAs',
                actionIfRed: 'Avisar comercial + puxar lista quente + ajustar CTA do dia',
            },
            isActive: true,
            createdAt: now,
        },
        // Operação 2: Tarefas críticas atrasadas (daily, lower is better)
        {
            id: 'default-delays',
            name: 'Tarefas críticas atrasadas',
            category: 'Operação',
            frequency: 'daily',
            direction: 'lower_better',
            unit: 'tarefas',
            sourceNote: 'Sistema de gestão / Planilha de acompanhamento',
            guardrails: {
                green: { max: 0 },
                yellow: { max: 2 },
                red: { max: 999 },
            },
            playbook: {
                actionIfYellow: 'Revisar prioridades e realocar recursos se necessário',
                actionIfRed: 'Redistribuir carga imediatamente ou escalar para liderança',
            },
            isActive: true,
            createdAt: now,
        },
        // Conteúdo 1: Posts publicados (weekly, higher is better)
        {
            id: 'default-posts',
            name: 'Posts publicados',
            category: 'Conteúdo',
            frequency: 'weekly',
            direction: 'higher_better',
            unit: 'posts',
            sourceNote: 'Instagram / LinkedIn / Redes sociais',
            guardrails: {
                green: { min: 5 },
                yellow: { min: 3 },
                red: { min: 0 },
            },
            playbook: {
                actionIfYellow: 'Revisar calendário editorial e simplificar formatos',
                actionIfRed: 'Pausar outras atividades e focar em conteúdo essencial',
            },
            isActive: true,
            createdAt: now,
        },
        // Conteúdo 2: Salvamentos/Compartilhamentos (weekly, higher is better)
        {
            id: 'default-engagement',
            name: 'Salvamentos + Compartilhamentos',
            category: 'Conteúdo',
            frequency: 'weekly',
            direction: 'higher_better',
            unit: 'interações',
            sourceNote: 'Instagram Insights / Analytics',
            guardrails: {
                green: { min: 50 },
                yellow: { min: 20 },
                red: { min: 0 },
            },
            playbook: {
                actionIfYellow: 'Testar novos formatos e revisar propósito do conteúdo',
                actionIfRed: 'Revisar estratégia completa: formato, distribuição e propósito',
            },
            isActive: true,
            createdAt: now,
        },
        // Comercial 1: Agendamentos (daily, higher is better)
        {
            id: 'default-meetings',
            name: 'Agendamentos',
            category: 'Comercial',
            frequency: 'daily',
            direction: 'higher_better',
            unit: 'reuniões',
            sourceNote: 'Calendário / CRM',
            guardrails: {
                green: { min: 3 },
                yellow: { min: 1 },
                red: { min: 0 },
            },
            playbook: {
                actionIfYellow: 'Ativar outbound e revisar follow-ups pendentes',
                actionIfRed: 'Campanha intensiva de reativação + prospecção ativa',
            },
            isActive: true,
            createdAt: now,
        },
        // Comercial 2: Vendas fechadas (weekly, higher is better)
        {
            id: 'default-sales',
            name: 'Vendas fechadas',
            category: 'Comercial',
            frequency: 'weekly',
            direction: 'higher_better',
            unit: 'vendas',
            sourceNote: 'CRM / Planilha de vendas',
            guardrails: {
                green: { min: 5 },
                yellow: { min: 2 },
                red: { min: 0 },
            },
            playbook: {
                actionIfYellow: 'Revisar pipeline e acelerar negociações em andamento',
                actionIfRed: 'Reunião de emergência comercial + revisar objeções comuns',
            },
            isActive: true,
            createdAt: now,
        },
    ];
}

// Get metric trend over time
export type MetricTrend = 'improving' | 'stable' | 'declining';

export function getMetricTrend(
    metricId: string,
    entries: MetricEntry[],
    days: number = 7
): MetricTrend {
    const metricEntries = entries
        .filter(e => e.metricId === metricId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, days);

    if (metricEntries.length < 3) return 'stable';

    const greenCount = metricEntries.filter(e => e.status === 'green').length;
    const redCount = metricEntries.filter(e => e.status === 'red').length;

    const greenRate = greenCount / metricEntries.length;
    const redRate = redCount / metricEntries.length;

    if (greenRate >= 0.6) return 'improving';
    if (redRate >= 0.6) return 'declining';
    return 'stable';
}

// Get status color for UI
export function getStatusColor(status: MetricStatus): string {
    switch (status) {
        case 'green':
            return 'emerald';
        case 'yellow':
            return 'amber';
        case 'red':
            return 'rose';
        default:
            return 'slate';
    }
}

// Format date for display
export function formatMetricDate(date: string): string {
    try {
        return format(new Date(date), 'dd/MM/yyyy');
    } catch {
        return date;
    }
}
