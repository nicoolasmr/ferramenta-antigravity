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
            "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-500",
            !isOnline ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                isSyncing ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
        )}>
            {!isOnline ? (
                <>
                    <WifiOff className="w-3 h-3" />
                    Offline
                </>
            ) : isSyncing ? (
                <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Sincronizando...
                </>
            ) : (
                <>
                    <CheckCircle2 className="w-3 h-3" />
                    Sincronizado
                </>
            )}
        </div>
    );
}
