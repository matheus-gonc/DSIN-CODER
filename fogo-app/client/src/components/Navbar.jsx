import React, { useState, useEffect } from 'react';
import {
  Radio,
  Plus,
  Users,
  RefreshCw,
  LayoutDashboard,
  Layers,
  Map,
  Wrench,
  ShieldAlert
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  analytics,
  loading,
  onRefresh,
  onNewEquipment,
  onNewAgent
}) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'inventory', label: 'Catálogo de Equipamentos', icon: Layers },
    { id: 'map', label: 'Mapa Tático GPS', icon: Map },
    { id: 'agents', label: 'Agentes & Patrulha', icon: Users },
    { id: 'maintenance', label: 'Manutenções', icon: Wrench },
    { id: 'operations', label: 'CCO // Central de Operações', icon: ShieldAlert }
  ];

  const healthScore = analytics?.prometheusHealthScore ?? 0;
  const isHealthy = healthScore >= 70;
  const criticalEvents = analytics?.criticalEvents ?? 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
      {/* Barra Superior Principal */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Marca & Contexto do Sistema */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 shadow-lg shadow-orange-500/25 ring-1 ring-orange-400/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                PROMETHEUS
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">//</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/25">
                F.O.G.O. v2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>Marília-SP</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Operações Urbanas</span>
            </div>
          </div>
        </div>

        {/* Navegação Desktop (oculta em mobile) */}
        <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center">
          <div className="flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar px-1 py-2 -my-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isCCO = item.id === 'operations';
              const hasCritical = isCCO && criticalEvents > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? isCCO
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : isCCO
                        ? 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {/* Badge de alertas críticos na aba CCO */}
                  {hasCritical && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse ring-1 ring-slate-950">
                      {criticalEvents > 9 ? '9+' : criticalEvents}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Lado Direito: Status + Ações */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Índice de Saúde da Rede */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="relative flex items-center justify-center">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`absolute w-4 h-4 rounded-full opacity-30 animate-ping ${
                  isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-200">
                  {analytics ? `${healthScore}%` : '---'}
                </span>
                <span className="text-[10px] text-slate-400">Online</span>
              </div>
            </div>
            {time && (
              <span className="pl-2 border-l border-slate-800 font-mono text-[11px] text-slate-400">
                {time}
              </span>
            )}
          </div>

          {/* Botão de Atualização */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Atualizar dados do F.O.G.O."
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`}
            />
          </button>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewEquipment}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Equipamento</span>
              <span className="sm:hidden">Equipamento</span>
            </button>

            <button
              onClick={onNewAgent}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Cadastrar Agente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Mobile */}
      <div className="lg:hidden px-4 py-2 bg-slate-950/95 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isCCO = item.id === 'operations';
          const hasCritical = isCCO && criticalEvents > 0;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                isActive
                  ? isCCO
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {hasCritical && (
                <span className="ml-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse">
                  {criticalEvents}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
