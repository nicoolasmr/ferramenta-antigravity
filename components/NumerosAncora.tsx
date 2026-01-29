'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NumerosConfig from './NumerosConfig';
import NumerosRegistro from './NumerosRegistro';
import RadarVermelhos from './RadarVermelhos';
import { Settings2, Activity } from 'lucide-react';

export default function NumerosAncora() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="space-y-4">
                <div className="flex flex-col gap-1.5 border-l-4 border-primary pl-6 py-1">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase title-glow">Números Âncora</h2>
                    <p className="text-slate-400 text-lg font-medium italic">"Poucos números. Clareza total. Sem ansiedade."</p>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl pl-7">
                    Esta seção é o seu painel de controle operacional. Escolha até 12 métricas vitais que definem a saúde do seu negócio e de sua vida.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-white/5 border border-white/5">
                        <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                            <Activity className="w-4 h-4" />
                            Painel & Radar
                        </TabsTrigger>
                        <TabsTrigger value="config" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                            <Settings2 className="w-4 h-4" />
                            Configuração
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="dashboard" className="space-y-6">
                    {/* 1. Radar Section (Auto-hides if clean) */}
                    <RadarVermelhos />

                    {/* 2. Registry Section */}
                    <NumerosRegistro />
                </TabsContent>

                <TabsContent value="config">
                    <NumerosConfig />
                </TabsContent>
            </Tabs>
        </div>
    );
}
