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
        <div className="container-wide space-y-8 pb-24">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Números Âncora</h2>
                <p className="text-muted-foreground text-lg">Poucos números. Clareza total. Sem ansiedade.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <TabsList>
                        <TabsTrigger value="dashboard" className="gap-2">
                            <Activity className="w-4 h-4" />
                            Painel & Radar
                        </TabsTrigger>
                        <TabsTrigger value="config" className="gap-2">
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
