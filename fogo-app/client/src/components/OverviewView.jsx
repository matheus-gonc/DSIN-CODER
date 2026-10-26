import React from 'react';
import {
  Activity,
  AlertTriangle,
  Users,
  Wrench,
  ArrowRight,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Map
} from 'lucide-react';
import { getEquipmentType } from '../constants/equipmentTypes';

export default function OverviewView({
  analytics,
  equipments,
  onNavigateTab
}) {
  const healthScore = analytics?.prometheusHealthScore ?? 0;
  const urgentItems = equipments.filter(
    (e) =>
      e.maintenance_need === 'imediata' ||
      e.status === 'mau_funcionamento' ||
      e.status === 'furtado'
  );

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto">
      {/* Header com Boas-Vindas Tática & Resumo Executivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>Centro de Gestão de Operações</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              MODO OPERACIONAL
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visão unificada de equipamentos IoT, telemetria urbana e força humana em campo em Marília/SP.
          </p>
        </div>

        {/* Status Rápido de Prontidão */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-400">Status Central: </span>
              <span className="font-semibold text-slate-200">Prontidão Ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Bento: Métricas Principais & Saúde da Cidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Saúde Operacional Geral */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 p-5 shadow-xl hover:border-slate-700/80 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
              Índice de Saúde da Rede
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {healthScore}%
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Estável
            </span>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${healthScore}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-400">
            {analytics?.operational ?? 0} de {analytics?.totalEquipments ?? 0} equipamentos em pleno funcionamento.
          </p>
        </div>

        {/* Card 2: Equipamentos Conectados */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl hover:border-orange-500/40 hover:bg-slate-900 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
              Equipamentos Ativos
            </span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {analytics?.totalEquipments ?? 0}
              </span>
              <span className="block text-xs text-slate-400 mt-1">Dispositivos catalogados</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">{analytics?.operational ?? 0} Online</span>
            <span className="text-amber-400 font-medium">{analytics?.malfunction ?? 0} Falha</span>
            <span className="text-rose-400 font-medium">{analytics?.stolen ?? 0} Furtado</span>
          </div>
        </div>

        {/* Card 3: Força Humana em Campo */}
        <div
          onClick={() => onNavigateTab('agents')}
          className="cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl hover:border-sky-500/40 hover:bg-slate-900 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
              Agentes Integrados
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {analytics?.totalAgents ?? 0}
              </span>
              <span className="block text-xs text-slate-400 mt-1">Profissionais vinculados</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-sky-400 font-medium">
              {analytics?.agentsOnPatrol ?? 0} Em patrulha ativa
            </span>
            <span className="text-slate-400">
              {(analytics?.totalAgents ?? 0) - (analytics?.agentsOnPatrol ?? 0)} Base / Disponíveis
            </span>
          </div>
        </div>

        {/* Card 4: Manutenções Críticas */}
        <div
          onClick={() => onNavigateTab('maintenance')}
          className="cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl hover:border-rose-500/40 hover:bg-slate-900 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
              Intervenções Críticas
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-rose-400 tracking-tight">
                {analytics?.urgentMaintenance ?? 0}
              </span>
              <span className="block text-xs text-slate-400 mt-1">Ordem imediata / Emergência</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-amber-400 font-medium">
              {analytics?.scheduledMaintenance ?? 0} Agendadas
            </span>
            <span className="text-slate-400">Requer atenção</span>
          </div>
        </div>

      </div>

      {/* Seção 2: Bento Grid com Distribuição & Alertas Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Alertas Críticos em Destaque */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Ocorrências e Alertas Prioritários
                </h3>
                <p className="text-xs text-slate-400">
                  Equipamentos que requerem reparo, substituição ou ação policial imediata.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 transition"
            >
              Ver todas ({urgentItems.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {urgentItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
                Nenhum alerta crítico ativo no momento. Toda a rede opera normalmente.
              </div>
            ) : (
              urgentItems.slice(0, 3).map((item) => {
                const typeInfo = getEquipmentType(item.type);
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-900 text-orange-400 border border-slate-800 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {typeInfo.label}
                          </span>
                          <span className="font-mono text-[11px] text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                            {item.serial_number}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase">
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {item.street} {item.reference ? `(${item.reference})` : ''} - {item.neighborhood}
                        </p>
                        {item.maintenance_notes && (
                          <p className="text-[11px] text-rose-400/90 bg-rose-500/5 px-2 py-1 rounded mt-1.5 border border-rose-500/10">
                            {item.maintenance_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('maintenance')}
                      className="self-end sm:self-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0 cursor-pointer"
                    >
                      Acessar Ordem
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 3: Distribuição por Tipo de Equipamento */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-400" />
                Composição do Parque IoT
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {analytics?.totalEquipments ?? 0} unid.
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {(analytics?.byType || []).slice(0, 5).map((t) => {
                const typeInfo = getEquipmentType(t.type);
                const Icon = typeInfo.icon;
                const pct = Math.round((t.count / (analytics?.totalEquipments || 1)) * 100);
                return (
                  <div key={t.type} className="text-xs">
                    <div className="flex items-center justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-2 text-slate-200">
                        <Icon className="w-3.5 h-3.5 text-orange-400" />
                        {typeInfo.label}
                      </span>
                      <span className="font-mono text-slate-400">
                        {t.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => onNavigateTab('map')}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 text-orange-400" />
              Ver no Mapa GPS
            </button>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="flex-1 py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-xs font-medium text-orange-300 border border-orange-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              Inventário Completo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
