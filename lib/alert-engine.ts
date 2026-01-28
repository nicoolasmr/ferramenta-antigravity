import { DailyCheck, WeeklyPlan, Alert, AnchorMetric, MetricEntry } from './storage';
import { parseISO, subDays, subWeeks } from 'date-fns';

// Analyze patterns and generate alerts
export function analyzePatterns(
    dailyChecks: DailyCheck[],
    weeklyPlans: WeeklyPlan[],
    metrics?: AnchorMetric[],
    metricEntries?: MetricEntry[]
): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();

    // Sort by date descending
    const sortedChecks = [...dailyChecks].sort((a, b) =>
        parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
    const sortedPlans = [...weeklyPlans].sort((a, b) =>
        parseISO(b.weekStart).getTime() - parseISO(a.weekStart).getTime()
    );

    // Alert 1: Sustaining too much alone
    const twoWeeksAgo = subDays(now, 14);
    const recentChecks = sortedChecks.filter(c => parseISO(c.date) >= twoWeeksAgo);
    const redOperationDays = recentChecks.filter(c => c.operationStatus === 'red').length;

    if (redOperationDays >= 3) {
        alerts.push({
            id: 'sustaining-alone',
            type: 'warning',
            message: 'Você está sustentando coisas demais sozinha.',
            suggestion: 'Considere delegar ou pedir apoio em algumas áreas. Seu trabalho é importante demais para se esgotar.',
            createdAt: new Date().toISOString(),
        });
    }

    // Alert 2: Focus changed frequently
    const fourWeeksAgo = subWeeks(now, 4);
    const recentPlans = sortedPlans.filter(p => parseISO(p.weekStart) >= fourWeeksAgo);
    const uniqueFocuses = new Set(recentPlans.map(p => p.centerOfWeek.toLowerCase().trim()));

    if (recentPlans.length >= 3 && uniqueFocuses.size >= 3) {
        alerts.push({
            id: 'focus-changing',
            type: 'info',
            message: 'O foco mudou muitas vezes nas últimas semanas.',
            suggestion: 'Isso pode indicar dispersão ou mudanças de prioridade. Vale revisar o que realmente importa agora.',
            createdAt: new Date().toISOString(),
        });
    }

    // Alert 3: Commercial over-dependency
    const commercialIssues = recentChecks.filter(c =>
        c.commercialAlignment === 'misaligned' || c.commercialAlignment === 'partial'
    ).length;
    const commercialIssueRate = recentChecks.length > 0 ? commercialIssues / recentChecks.length : 0;

    if (commercialIssueRate > 0.5) {
        alerts.push({
            id: 'commercial-dependency',
            type: 'warning',
            message: 'O comercial está dependendo excessivamente de você.',
            suggestion: 'Pode ser hora de criar processos ou materiais que reduzam essa dependência.',
            createdAt: new Date().toISOString(),
        });
    }

    // Alert 4: Content without clear purpose
    const plansWithoutPurpose = recentPlans.filter(p => !p.content.theme || !p.content.purpose).length;

    if (plansWithoutPurpose >= 3) {
        alerts.push({
            id: 'content-no-purpose',
            type: 'caution',
            message: 'Conteúdo está sendo produzido sem objetivo claro.',
            suggestion: 'Definir o propósito (crescer, aquecer ou vender) ajuda a medir o impacto real.',
            createdAt: new Date().toISOString(),
        });
    }

    // Alert 5: Crisis mode
    const bottlenecks = recentChecks.filter(c => c.hasBottleneck).length;

    if (bottlenecks >= 5) {
        alerts.push({
            id: 'crisis-mode',
            type: 'warning',
            message: 'Você tem resolvido mais crises do que deveria.',
            suggestion: 'Gargalos frequentes podem indicar problemas estruturais. Vale investigar a raiz.',
            createdAt: new Date().toISOString(),
        });
    }

    // Alert 6: No weekly planning
    if (recentPlans.length === 0) {
        alerts.push({
            id: 'no-planning',
            type: 'info',
            message: 'Você ainda não definiu o foco semanal.',
            suggestion: 'Dedicar 20 minutos para planejar a semana pode transformar sua clareza e impacto.',
            createdAt: new Date().toISOString(),
        });
    }

    // Alert 7: Tomorrow trending worse
    const recentTrends = sortedChecks.slice(0, 5).filter(c => c.tomorrowTrend === 'worse').length;

    if (recentTrends >= 3) {
        alerts.push({
            id: 'negative-trend',
            type: 'caution',
            message: 'As coisas têm parecido cada vez mais difíceis.',
            suggestion: 'Pode ser um bom momento para pausar, respirar e revisar prioridades.',
            createdAt: new Date().toISOString(),
        });
    }

    // Alert 8: Projects not advancing
    const latestPlan = sortedPlans[0];
    if (latestPlan) {
        const stuckProjects = latestPlan.projects.filter(p => !p.isAdvancing).length;
        const totalProjects = latestPlan.projects.length;

        if (totalProjects > 0 && stuckProjects / totalProjects > 0.5) {
            alerts.push({
                id: 'projects-stuck',
                type: 'warning',
                message: 'Mais da metade dos projetos não está avançando.',
                suggestion: 'Pode ser hora de reduzir o número de frentes ou destavar dependências.',
                createdAt: new Date().toISOString(),
            });
        }
    }

    // Metrics-based alerts (if metrics data is provided)
    if (metrics && metricEntries) {
        const metricsAlerts = analyzeMetricPatterns(metrics, metricEntries);
        alerts.push(...metricsAlerts);
    }

    return alerts;
}

// Analyze metric patterns for alerts
function analyzeMetricPatterns(
    metrics: AnchorMetric[],
    entries: MetricEntry[]
): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    // Get active metrics only
    const activeMetrics = metrics.filter(m => m.isActive);

    // Alert 1: Persistent metric drop (any metric in red for ≥3 consecutive entries)
    for (const metric of activeMetrics) {
        const metricEntries = entries
            .filter(e => e.metricId === metric.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        if (metricEntries.length >= 3) {
            const consecutiveReds = metricEntries.slice(0, 3).every(e => e.status === 'red');

            if (consecutiveReds) {
                const period = metric.frequency === 'daily' ? 'dias' : 'semanas';
                alerts.push({
                    id: `metric-drop-${metric.id}`,
                    type: 'warning',
                    message: `A métrica "${metric.name}" está em vermelho há 3 ${period} seguidos.`,
                    suggestion: metric.playbook.red,
                    createdAt: new Date().toISOString(),
                });
            }
        }
    }

    // Alert 2: Content without practical results
    const contentMetrics = activeMetrics.filter(m => m.category === 'Conteúdo');
    for (const metric of contentMetrics) {
        const recentEntries = entries
            .filter(e => e.metricId === metric.id && new Date(e.date) >= sevenDaysAgo);

        const problematicEntries = recentEntries.filter(
            e => e.status === 'yellow' || e.status === 'red'
        );

        if (recentEntries.length >= 3 && problematicEntries.length >= 3) {
            alerts.push({
                id: `content-no-results-${metric.id}`,
                type: 'caution',
                message: `Seu conteúdo (${metric.name}) não está gerando os resultados esperados.`,
                suggestion: 'Revisar propósito, formato ou distribuição pode ajudar.',
                createdAt: new Date().toISOString(),
            });
        }
    }

    // Alert 3: Operations accumulating delays
    const operationMetrics = activeMetrics.filter(
        m => m.category === 'Operação' && m.direction === 'lower_better'
    );

    for (const metric of operationMetrics) {
        const recentEntries = entries
            .filter(e => e.metricId === metric.id && new Date(e.date) >= sevenDaysAgo)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const redDays = recentEntries.filter(e => e.status === 'red').length;

        if (recentEntries.length >= 3 && redDays >= 3) {
            alerts.push({
                id: `operation-delays-${metric.id}`,
                type: 'warning',
                message: `A operação está acumulando atrasos (${metric.name}).`,
                suggestion: 'Considere redistribuir carga ou revisar prioridades.',
                createdAt: new Date().toISOString(),
            });
        }
    }

    return alerts;
}

// Get alert color
export function getAlertColor(type: Alert['type']): string {
    switch (type) {
        case 'warning':
            return 'rose';
        case 'caution':
            return 'amber';
        case 'info':
            return 'emerald';
        default:
            return 'slate';
    }
}

// Get alert icon
export function getAlertIcon(type: Alert['type']): string {
    switch (type) {
        case 'warning':
            return '⚠️';
        case 'caution':
            return '⚡';
        case 'info':
            return '💡';
        default:
            return 'ℹ️';
    }
}
