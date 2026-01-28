'use client';

import AIDailyBriefing from './AIDailyBriefing';
import AIChat from './AIChat';

export default function NumerosInteligencia() {
    return (
        <div className="container-wide space-y-8 pb-12 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Briefing (Main view) */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-4xl font-bold tracking-tight">Cérebro Antigravity</h2>
                        <p className="text-muted-foreground text-lg italic">"Dê-me um ponto de apoio e eu moverei o mundo." — Arquimedes.</p>
                    </div>

                    <AIDailyBriefing />
                </div>

                {/* Right Column: Interactive Chat */}
                <div className="lg:col-span-12 xl:col-span-5">
                    <AIChat />
                </div>
            </div>
        </div>
    );
}
