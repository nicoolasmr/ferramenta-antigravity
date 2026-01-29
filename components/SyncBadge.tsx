'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SyncBadge() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Simulate periodic sync check
        const interval = setInterval(() => {
            if (navigator.onLine) {
                setIsSyncing(true);
                setTimeout(() => {
                    setIsSyncing(false);
                    setLastSync(new Date());
                }, 1500);
            }
        }, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 backdrop-blur-md",
            !isOnline ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]" :
                isSyncing ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]" :
                    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
        )}>
            {!isOnline ? (
                <>
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline
                </>
            ) : isSyncing ? (
                <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sincronizando
                </>
            ) : (
                <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Nuvem Ativa
                </>
            )}
        </div>
    );
}
