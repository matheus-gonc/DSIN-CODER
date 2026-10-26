import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Plus,
  Search,
  MapPin,
  Car,
  Trash2
} from 'lucide-react';

const ROLE_CONFIG = {
  agente_transito: {
    label: 'Agente de Trânsito',
    badge: 'Trânsito',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    icon: Car
  },
  guarda_municipal: {
    label: 'Guarda Civil Municipal',
    badge: 'GCM',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
    icon: ShieldCheck
  },
  policial_militar: {
    label: 'Polícia Militar',
    badge: 'PM',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    icon: ShieldAlert
  }
};

const STATUS_CONFIG = {
  em_patrulha: {
    label: 'Em Patrulha',
    pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400'
  },
  em_atendimento: {
    label: 'Em Atendimento',
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400'
  },
  disponivel: {
    label: 'Disponível na Base',
    pill: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dot: 'bg-sky-400'
  },
  folga: {
    label: 'Em Folga / Descanso',
    pill: 'bg-slate-800 text-slate-400 border-slate-700',
    dot: 'bg-slate-500'
  }
};

export default function AgentsView({
  agents,
  onNewAgent,
  onDeleteAgent
}) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredAgents = agents.filter((ag) => {
    if (filterStatus && ag.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchName = ag.name?.toLowerCase().includes(s);
      const matchBadge = ag.badge_number?.toLowerCase().includes(s);
      const matchDept = ag.department?.toLowerCase().includes(s);
      if (!matchName && !matchBadge && !matchDept) return false;
    }
    return true;
  });

  const onPatrolCount = agents.filter((a) => a.status === 'em_patrulha').length;

  return (
    <div className="space-y-4 max-w-[1720px] mx-auto">
      {/* Sub-Navbar / Barra de Ferramentas de Agentes */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Identificação da Força Humana */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Efetivo Humano em Operação</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {onPatrolCount} em patrulha ativa
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Profissionais integrados ao núcleo PROMETHEUS com telemetria e rádio.
            </p>
          </div>
        </div>

        {/* Busca, Filtro e Ação */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar agente ou matrícula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">Status: Todos</option>
            <option value="em_patrulha">Em Patrulha</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="disponivel">Disponível</option>
            <option value="folga">Folga</option>
          </select>

          <button
            onClick={onNewAgent}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Agente</span>
          </button>
        </div>
      </div>

      {/* Grid de Cards dos Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAgents.map((ag) => {
          const roleData = ROLE_CONFIG[ag.role] || {
            label: ag.role,
            badge: 'Agente',
            color: 'text-slate-400 bg-slate-800 border-slate-700',
            icon: Users
          };
          const RoleIcon = roleData.icon;
          const statusData =
            STATUS_CONFIG[ag.status] || {
              label: ag.status,
              pill: 'bg-slate-800 text-slate-400 border-slate-700',
              dot: 'bg-slate-500'
            };

          return (
            <div
              key={ag.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition p-4 shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-950 text-orange-400 border border-slate-800">
                    {ag.badge_number}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusData.pill}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusData.dot}`} />
                    {statusData.label}
                  </span>
                </div>

                {/* Nome e Função */}
                <div className="mt-3 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 shrink-0">
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm group-hover:text-sky-300 transition-colors">
                      {ag.name}
                    </h4>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-medium px-2 py-0.2 rounded border ${roleData.color}`}
                    >
                      {roleData.label}
                    </span>
                  </div>
                </div>

                {/* Detalhes de Contato & Unidade */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px]">
                    <span className="text-slate-500 font-medium">Unidade: </span>
                    <span className="text-slate-300">{ag.department || 'Operações Gerais'}</span>
                  </div>

                  <div className="text-[11px] flex items-center gap-1">
                    <Radio className="w-3 h-3 text-orange-400 shrink-0" />
                    <span className="text-slate-500 font-medium">Rádio: </span>
                    <span className="font-mono text-slate-300">{ag.phone_radio || 'Freq. Padrão'}</span>
                  </div>

                  {ag.assigned_serial && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                      <Car className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{ag.assigned_model} ({ag.assigned_serial})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé com GPS e Ações */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-600" />
                  {ag.latitude ? `${ag.latitude.toFixed(3)}, ${ag.longitude.toFixed(3)}` : 'Sem sinal'}
                </span>

                <div className="flex items-center gap-1">
                  {onDeleteAgent && (
                    <button
                      onClick={() => onDeleteAgent(ag.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remover agente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
