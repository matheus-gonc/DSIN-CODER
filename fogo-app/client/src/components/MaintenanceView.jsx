import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  MapPin,
  Edit2
} from 'lucide-react';
import { getEquipmentType } from '../constants/equipmentTypes';

export default function MaintenanceView({ equipments, onEditEquipment }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'urgent', 'scheduled'

  const urgentList = equipments.filter(
    (e) =>
      e.maintenance_need === 'imediata' ||
      e.status === 'mau_funcionamento' ||
      e.status === 'furtado'
  );

  const scheduledList = equipments.filter(
    (e) => e.maintenance_need === 'agendada_periodica'
  );

  return (
    <div className="space-y-4 max-w-[1720px] mx-auto">
      {/* Sub-Navbar de Manutenção */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Título & Resumo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Gestão de Manutenção Preventiva e Corretiva</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
                {urgentList.length} ocorrências urgentes
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Controle de reparos técnicos, calibrações periódicas e vistorias de campo.
            </p>
          </div>
        </div>

        {/* Filtro de Abas Rápidas */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas as Ordens ({urgentList.length + scheduledList.length})
          </button>
          <button
            onClick={() => setFilterType('urgent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'urgent'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Urgentes ({urgentList.length})</span>
          </button>
          <button
            onClick={() => setFilterType('scheduled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'scheduled'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Preventivas ({scheduledList.length})</span>
          </button>
        </div>
      </div>

      {/* Grid de Duas Colunas: Urgentes vs Preventivas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna 1: Intervenções Imediatas / Falhas */}
        {(filterType === 'all' || filterType === 'urgent') && (
          <div className="rounded-2xl bg-slate-900/70 border border-rose-500/30 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Intervenções Imediatas (Falhas / Furtos)</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  {urgentList.length} pendentes
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {urgentList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500/60 mx-auto mb-2" />
                    Nenhuma manutenção de emergência pendente.
                  </div>
                ) : (
                  urgentList.map((eq) => {
                    const typeInfo = getEquipmentType(eq.type);
                    const Icon = typeInfo.icon;
                    return (
                      <div
                        key={eq.id}
                        className="rounded-xl bg-slate-950/80 border border-rose-500/20 p-3.5 hover:border-rose-500/40 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-slate-900 text-orange-400 border border-slate-800">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-100 text-xs sm:text-sm">
                                {typeInfo.label} — {eq.model}
                              </div>
                              <span className="font-mono text-[11px] text-orange-400 font-medium">
                                Série: {eq.serial_number}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            {eq.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="mt-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {eq.street} ({eq.neighborhood})
                          </span>
                        </div>

                        <div className="mt-2 text-xs bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/15 text-rose-300">
                          <strong className="text-rose-400">Diagnóstico Técnico: </strong>
                          {eq.maintenance_notes || 'Requer envio emergencial de equipe técnica para vistoria e reparo.'}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            Prioridade: <strong className="text-rose-400">Máxima</strong>
                          </span>
                          <button
                            onClick={() => onEditEquipment(eq)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Atualizar Ordem</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Coluna 2: Manutenções Preventivas Agendadas */}
        {(filterType === 'all' || filterType === 'scheduled') && (
          <div className="rounded-2xl bg-slate-900/70 border border-amber-500/30 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Manutenções Preventivas e Calibrações</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  {scheduledList.length} agendadas
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {scheduledList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500/60 mx-auto mb-2" />
                    Nenhuma manutenção preventiva pendente no cronograma.
                  </div>
                ) : (
                  scheduledList.map((eq) => {
                    const typeInfo = getEquipmentType(eq.type);
                    const Icon = typeInfo.icon;
                    return (
                      <div
                        key={eq.id}
                        className="rounded-xl bg-slate-950/80 border border-amber-500/20 p-3.5 hover:border-amber-500/40 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-slate-900 text-orange-400 border border-slate-800">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-100 text-xs sm:text-sm">
                                {typeInfo.label} — {eq.model}
                              </div>
                              <span className="font-mono text-[11px] text-orange-400 font-medium">
                                Série: {eq.serial_number}
                              </span>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            Prevista: {eq.next_maintenance_date || 'A definir'}
                          </span>
                        </div>

                        <div className="mt-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {eq.street} ({eq.neighborhood})
                          </span>
                        </div>

                        <div className="mt-2 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                          <strong className="text-amber-400">Plano de Ação: </strong>
                          {eq.maintenance_notes || 'Calibração semestral de sensores, limpeza de ópticos e teste de conectividade.'}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            Tipo: <strong className="text-amber-400">Preventiva</strong>
                          </span>
                          <button
                            onClick={() => onEditEquipment(eq)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Editar Agendamento</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
