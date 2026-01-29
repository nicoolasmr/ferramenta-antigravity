'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
    status?: string;
    label: string;
    icon: LucideIcon;
}

export function StatusIndicator({ status, label, icon: Icon }: StatusIndicatorProps) {
    const getColor = (s?: string) => {
        if (s === 'green' || s === 'aligned' || s === 'fulfilled') return 'bg-emerald-500 text-emerald-50 border-emerald-500/20';
        if (s === 'yellow' || s === 'partial' || s === 'at-risk') return 'bg-amber-500 text-amber-50 border-amber-500/20';
        if (s === 'red' || s === 'misaligned' || s === 'not-priority') return 'bg-rose-500 text-rose-50 border-rose-500/20';
        return 'bg-slate-200 text-slate-400 border-slate-200/50'; // Default/Empty
    };

    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-500",
            getColor(status),
            status ? "shadow-lg scale-100" : "opacity-60 scale-95"
        )}>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-[10px] uppercase font-bold opacity-80 tracking-wider transition-colors">{label}</div>
                <div className="text-sm font-extrabold capitalize">{status ? status.replace('-', ' ') : 'Pendente'}</div>
            </div>
        </div>
    );
}
