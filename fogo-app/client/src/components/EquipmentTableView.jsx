import React from 'react';
import {
  Search,
  MapPin,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import {
  EQUIPMENT_TYPES,
  STATUS_CONFIG,
  MAINTENANCE_CONFIG,
  getEquipmentType
} from '../constants/equipmentTypes';

export default function EquipmentTableView({
  equipments,
  search,
  setSearch,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterMaintenance,
  setFilterMaintenance,
  onRefresh,
  onEdit,
  onDelete
}) {
  const hasActiveFilters =
    Boolean(search) ||
    Boolean(filterType) ||
    Boolean(filterStatus) ||
    Boolean(filterMaintenance);

  const handleClearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterStatus('');
    setFilterMaintenance('');
  };

  // Quick Chips
  const quickFilters = [
    { label: 'Todos', status: '' },
    { label: 'Operacionais', status: 'operacional' },
    { label: 'Mau Funcionamento', status: 'mau_funcionamento' },
    { label: 'Furtados / Alertas', status: 'furtado' }
  ];

  return (
    <div className="space-y-4 max-w-[1720px] mx-auto">
      {/* Sub-Navbar & Barra de Ferramentas / Filtros */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl space-y-3.5 backdrop-blur-md">
        
        {/* Linha 1: Busca e Seletores Principais */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número de série, logradouro, modelo ou bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-orange-500/60 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Dropdowns Limpos */}
          <div className="flex flex-wrap gap-2 items-center">
            
            {/* Filtro por Tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500/50 cursor-pointer"
            >
              <option value="">Todos os Tipos de Dispositivo</option>
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Filtro por Situação */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500/50 cursor-pointer"
            >
              <option value="">Todas as Situações</option>
              <option value="operacional">Operacional</option>
              <option value="mau_funcionamento">Mau Funcionamento</option>
              <option value="furtado">Furtado / Vandalizado</option>
              <option value="ainda_nao_instalado">Aguardando Instalação</option>
              <option value="desativado">Desativado</option>
            </select>

            {/* Filtro por Manutenção */}
            <select
              value={filterMaintenance}
              onChange={(e) => setFilterMaintenance(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500/50 cursor-pointer"
            >
              <option value="">Manutenção (Todas)</option>
              <option value="imediata">🚨 Urgente / Imediata</option>
              <option value="agendada_periodica">📅 Agendada / Periódica</option>
              <option value="nenhuma">Regular (Sem pendência)</option>
            </select>

            {/* Botão Limpar Filtros se houver filtro ativo */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                title="Limpar todos os filtros"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}

            {/* Botão de Refresh */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
              title="Recarregar lista"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linha 2: Chips de Acesso Rápido & Contador de Itens */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-medium mr-1">Filtrar por:</span>
            {quickFilters.map((q) => {
              const isActive = filterStatus === q.status;
              return (
                <button
                  key={q.label}
                  onClick={() => setFilterStatus(q.status)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-xs'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Exibindo <span className="text-slate-100 font-bold">{equipments.length}</span> equipamento(s)
          </div>
        </div>

      </div>

      {/* Tabela de Dados Estilizada (Human-Friendly) */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            {/* Header da Tabela */}
            <thead className="bg-slate-950/90 text-[11px] uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Equipamento & Série</th>
                <th className="py-3.5 px-4 font-semibold">Marca / Modelo</th>
                <th className="py-3.5 px-4 font-semibold">Localização & Coordenadas</th>
                <th className="py-3.5 px-4 font-semibold">Situação</th>
                <th className="py-3.5 px-4 font-semibold">Manutenção</th>
                <th className="py-3.5 px-4 font-semibold">Telemetria & IoT</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>

            {/* Linhas da Tabela */}
            <tbody className="divide-y divide-slate-800/50 font-sans">
              {equipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 px-4">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="p-3 rounded-2xl bg-slate-800/60 text-slate-400 mb-3 border border-slate-700/50">
                        <SlidersHorizontal className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-200">
                        Nenhum equipamento encontrado
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Nenhum registro corresponde aos filtros selecionados. Tente ajustar os termos de busca.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 transition cursor-pointer"
                        >
                          Limpar todos os filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                equipments.map((eq) => {
                  const typeInfo = getEquipmentType(eq.type);
                  const Icon = typeInfo.icon;
                  const statusInfo =
                    STATUS_CONFIG[eq.status] || {
                      label: eq.status,
                      dotColor: '#94a3b8',
                      pillClass: 'bg-slate-800 text-slate-300 border-slate-700'
                    };
                  const maintInfo =
                    MAINTENANCE_CONFIG[eq.maintenance_need] || {
                      label: eq.maintenance_need || 'Regular',
                      colorClass: 'text-slate-400',
                      badgeClass: 'bg-slate-800 text-slate-400'
                    };

                  return (
                    <tr
                      key={eq.id}
                      className="hover:bg-slate-800/40 transition-colors duration-150 group"
                    >
                      {/* Equipamento & Série */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-orange-400 shadow-inner group-hover:border-orange-500/30 transition"
                            title={typeInfo.category}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 text-xs sm:text-sm">
                              {typeInfo.label}
                            </div>
                            <div className="text-[11px] font-mono text-orange-400 font-medium">
                              {eq.serial_number}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Marca / Modelo */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 text-xs sm:text-sm">
                          {eq.brand}
                        </div>
                        <div className="text-xs text-slate-400">
                          {eq.model}
                        </div>
                      </td>

                      {/* Localização & Coordenadas */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span>{eq.street}</span>
                        </div>
                        <div className="text-slate-400 pl-5 text-[11px] mt-0.5">
                          {eq.reference ? `${eq.reference} • ` : ''}
                          {eq.neighborhood} — {eq.city}/{eq.state}
                        </div>
                        <div className="text-slate-500 font-mono pl-5 text-[10px] mt-0.5">
                          GPS: {eq.latitude.toFixed(4)}, {eq.longitude.toFixed(4)}
                        </div>
                      </td>

                      {/* Situação */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.pillClass}`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: statusInfo.dotColor }}
                          />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Manutenção */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className={maintInfo.colorClass}>
                          {maintInfo.label}
                        </div>
                        {eq.next_maintenance_date && (
                          <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {eq.next_maintenance_date}
                          </div>
                        )}
                        {eq.maintenance_notes && (
                          <div
                            className="text-[11px] text-slate-400/80 italic truncate max-w-[200px] mt-0.5"
                            title={eq.maintenance_notes}
                          >
                            {eq.maintenance_notes}
                          </div>
                        )}
                      </td>

                      {/* Propriedades IoT */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {Object.entries(eq.custom_properties || {}).slice(0, 3).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] bg-slate-950/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 font-mono"
                              title={`${k}: ${String(v)}`}
                            >
                              <span className="text-slate-500">{k}:</span> {String(v)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(eq)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
                            title="Editar equipamento"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(eq.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                            title="Excluir equipamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
