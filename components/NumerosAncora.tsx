'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Settings, Calendar, TrendingUp, TrendingDown, Minus, AlertCircle, Check } from 'lucide-react';
import { storage, AnchorMetric, MetricEntry, MetricCategory } from '@/lib/storage';
import {
    calculateMetricStatus,
    getRadarDeVermelhos,
    createDefaultMetrics,
    getStatusColor,
    formatMetricDate,
    RedAlert
} from '@/lib/metrics-engine';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NumerosAncora() {
    const [metrics, setMetrics] = useState<AnchorMetric[]>([]);
    const [entries, setEntries] = useState<MetricEntry[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [showConfig, setShowConfig] = useState(false);
    const [editingMetric, setEditingMetric] = useState<AnchorMetric | null>(null);
    const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

    // Load data on mount
    useEffect(() => {
        const loadedMetrics = storage.getAnchorMetrics();

        // If no metrics exist, create defaults
        if (loadedMetrics.length === 0) {
            const defaults = createDefaultMetrics();
            defaults.forEach(m => storage.saveAnchorMetric(m));
            setMetrics(defaults);
        } else {
            setMetrics(loadedMetrics);
        }

        setEntries(storage.getMetricEntries());
    }, []);

    // Get radar de vermelhos for selected date
    const radarAlerts = getRadarDeVermelhos(selectedDate, metrics, entries);
    const unaddressedAlerts = radarAlerts.filter(a => !a.addressed);

    // Group metrics by category
    const metricsByCategory = {
        'Operação': metrics.filter(m => m.category === 'Operação' && m.isActive),
        'Conteúdo': metrics.filter(m => m.category === 'Conteúdo' && m.isActive),
        'Comercial': metrics.filter(m => m.category === 'Comercial' && m.isActive),
    };

    // Handle metric value save
    const handleSaveEntry = (metricId: string, value: number) => {
        const metric = metrics.find(m => m.id === metricId);
        if (!metric) return;

        const status = calculateMetricStatus(value, metric);
        const entry: MetricEntry = {
            metricId,
            date: selectedDate,
            value,
            status,
            addressed: false,
            updatedAt: new Date().toISOString(),
        };

        storage.saveMetricEntry(entry);
        setEntries(storage.getMetricEntries());
    };

    // Mark alert as addressed
    const handleMarkAddressed = (metricId: string) => {
        const entry = entries.find(e => e.metricId === metricId && e.date === selectedDate);
        if (entry) {
            storage.saveMetricEntry({ ...entry, addressed: true });
            setEntries(storage.getMetricEntries());
        }
    };

    // Get entry for metric and date
    const getEntry = (metricId: string, date: string = selectedDate): MetricEntry | undefined => {
        return entries.find(e => e.metricId === metricId && e.date === date);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-2">
                            Números Âncora
                        </h2>
                        <p className="text-slate-300 text-sm md:text-base">
                            Poucos números. Clareza total. Sem ansiedade.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="glass p-3 rounded-xl hover:bg-slate-700/50 transition-all"
                        title="Configurar painel"
                    >
                        <Settings className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </button>
                </div>

                {/* Date Selector */}
                <div className="flex items-center gap-3 mt-6">
                    <Calendar className="w-5 h-5 text-[var(--text-tertiary)]" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="glass px-4 py-2 rounded-lg text-slate-200 bg-slate-800/50 border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                    <button
                        onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        Hoje
                    </button>
                </div>
            </div>

            {/* Radar de Vermelhos */}
            {unaddressedAlerts.length > 0 && (
                <div className="glass rounded-2xl p-6 border-2 border-rose-500/30 bg-rose-500/5">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-rose-400" />
                        <h3 className="text-xl font-bold text-rose-400">
                            TEMOS {unaddressedAlerts.length} {unaddressedAlerts.length === 1 ? 'PONTO' : 'PONTOS'} EM VERMELHO HOJE
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {unaddressedAlerts.map((alert) => (
                            <div key={alert.metricId} className="glass rounded-xl p-4 border border-rose-500/20">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-slate-200">
                                            {alert.metricName}: {alert.value} {alert.unit}
                                        </h4>
                                        <p className="text-sm text-[var(--text-tertiary)] mt-1">
                                            {alert.action}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleMarkAddressed(alert.metricId)}
                                        className="glass px-3 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-1"
                                    >
                                        <Check className="w-3 h-3" />
                                        Endereçado
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty Radar State */}
            {unaddressedAlerts.length === 0 && radarAlerts.length === 0 && (
                <div className="glass rounded-2xl p-6 text-center">
                    <p className="text-[var(--text-tertiary)]">
                        Tudo sob controle por aqui. Se algo mudar, você vai ver.
                    </p>
                </div>
            )}

            {/* Metrics by Category */}
            {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
                categoryMetrics.length > 0 && (
                    <div key={category} className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-200 mb-4">{category}</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {categoryMetrics.map((metric) => (
                                <MetricCard
                                    key={metric.id}
                                    metric={metric}
                                    entry={getEntry(metric.id)}
                                    onSave={handleSaveEntry}
                                    onExpand={() => setExpandedHistory(
                                        expandedHistory === metric.id ? null : metric.id
                                    )}
                                    isExpanded={expandedHistory === metric.id}
                                    entries={entries}
                                />
                            ))}
                        </div>
                    </div>
                )
            ))}

            {/* Footer Message */}
            <div className="text-center text-slate-500 text-sm">
                <p>Você não precisa olhar tudo o tempo todo. Só o que sustenta a semana.</p>
            </div>

            {/* Configuration Modal (simplified for V1) */}
            {showConfig && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-emerald-400 mb-4">
                            Configurar Painel
                        </h3>
                        <p className="text-[var(--text-tertiary)] text-sm mb-6">
                            Configuração avançada em breve. Por enquanto, as 6 métricas padrão estão ativas.
                        </p>
                        <button
                            onClick={() => setShowConfig(false)}
                            className="w-full glass px-4 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Metric Card Component
interface MetricCardProps {
    metric: AnchorMetric;
    entry?: MetricEntry;
    onSave: (metricId: string, value: number) => void;
    onExpand: () => void;
    isExpanded: boolean;
    entries: MetricEntry[];
}

function MetricCard({ metric, entry, onSave, onExpand, isExpanded, entries }: MetricCardProps) {
    const [value, setValue] = useState<string>(entry?.value.toString() || '');
    const [isSaving, setIsSaving] = useState(false);

    const statusColor = entry ? getStatusColor(entry.status) : 'slate';
    const history = storage.getEntriesForMetric(metric.id, 7);

    const handleSave = () => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        setIsSaving(true);
        onSave(metric.id, numValue);
        setTimeout(() => setIsSaving(false), 500);
    };

    return (
        <div className="glass rounded-xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${statusColor}-500`} />
                        <h4 className="font-semibold text-slate-200">{metric.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{metric.sourceNote}</p>
                </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={`0 ${metric.unit}`}
                    className="flex-1 glass px-3 py-2 rounded-lg text-slate-200 bg-slate-800/50 border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="glass px-4 py-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                >
                    {isSaving ? '✓' : 'Salvar'}
                </button>
            </div>

            {/* Last Updated */}
            {entry && (
                <p className="text-xs text-slate-500">
                    Atualizado em {format(new Date(entry.updatedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
            )}

            {/* History Toggle */}
            <button
                onClick={onExpand}
                className="text-xs text-[var(--text-tertiary)] hover:text-slate-300 transition-colors flex items-center gap-1"
            >
                {isExpanded ? '▼' : '▶'} Últimos 7 dias
            </button>

            {/* History */}
            {isExpanded && history.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                    {history.map((h) => (
                        <div key={h.date} className="flex items-center justify-between text-sm">
                            <span className="text-[var(--text-tertiary)]">{formatMetricDate(h.date)}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-300">{h.value} {metric.unit}</span>
                                <div className={`w-2 h-2 rounded-full bg-${getStatusColor(h.status)}-500`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
