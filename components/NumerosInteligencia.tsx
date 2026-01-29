import AIDailyBriefing from './AIDailyBriefing';
import RadarVermelhos from './RadarVermelhos';
import AlertasHumanos from './AlertasHumanos';
import { Activity, Shield } from 'lucide-react';

export default function NumerosInteligencia() {
    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* 1. Global Vision Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 border-l-4 border-primary pl-6 py-1">
                    <h2 className="text-3xl font-bold tracking-tight text-white uppercase">Centro de Inteligência</h2>
                    <p className="text-muted-foreground text-sm font-medium italic opacity-70">"Dê-me um ponto de apoio e eu moverei o mundo."</p>
                </div>
                <AIDailyBriefing />
            </div>

            {/* 2. Signals & Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Activity className="w-4 h-4 text-rose-500" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Radar de Vermelhos</h3>
                    </div>
                    <RadarVermelhos />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Sinais Humanos</h3>
                    </div>
                    <AlertasHumanos />
                </div>
            </div>
        </div>
    );
}
