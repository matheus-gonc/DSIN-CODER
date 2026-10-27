import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import {
  AlertTriangle,
  CheckCircle2,
  Radio,
  Users,
  Activity,
  MapPin,
  Plus,
  RefreshCw,
  X,
  Clock,
  ShieldAlert,
  Cpu,
  TrendingUp
} from 'lucide-react';
import EventModal from './EventModal';

// ─── Configurações de severidade/status ─────────────────────────────────────
const SEVERITY_CONFIG = {
  critico: {
    label: 'CRÍTICO',
    color: '#ef4444',
    badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/40',
    ringClass: 'ring-rose-500/30',
    dotClass: 'bg-rose-500'
  },
  alerta: {
    label: 'ALERTA',
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/40',
    ringClass: 'ring-amber-500/30',
    dotClass: 'bg-amber-400'
  },
  informativo: {
    label: 'INFO',
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/15 text-sky-400 border border-sky-500/40',
    ringClass: 'ring-sky-500/30',
    dotClass: 'bg-sky-400'
  }
};

const EVENT_STATUS_CONFIG = {
  ativo: { label: 'Ativo', class: 'text-rose-400 font-semibold' },
  em_atendimento: { label: 'Em Atendimento', class: 'text-amber-400' },
  resolvido: { label: 'Resolvido', class: 'text-emerald-400' }
};

const EVENT_TYPE_LABELS = {
  acidente: 'Acidente',
  pane_eletrica: 'Pane Elétrica',
  congestionamento: 'Congestionamento',
  vandalismo: 'Vandalismo / Furto',
  sensor_offline: 'Sensor Offline',
  alarme_seguranca: 'Alarme Segurança',
  outros: 'Outros'
};

// ─── Marcador de equipamento (dark, herda lógica existente) ─────────────────
const createEquipmentMarker = (color, badge) => L.divIcon({
  className: 'custom-fogo-marker',
  html: `<div style="background-color:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-family:ui-monospace,monospace;font-size:9px;box-shadow:0 0 10px ${color}66,0 2px 4px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.85);">${badge}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16]
});

// ─── Marcador de agente ──────────────────────────────────────────────────────
const createAgentMarker = () => L.divIcon({
  className: 'custom-fogo-marker',
  html: `<div style="background-color:#0284c7;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-family:ui-monospace,monospace;font-size:9px;box-shadow:0 0 10px #0284c766,0 2px 4px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.85);">AGT</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16]
});

// ─── Marcador de evento ──────────────────────────────────────────────────────
const createEventMarker = (severity) => {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.informativo;
  const pulseCss = severity === 'critico'
    ? `animation:cco-pulse 1.4s ease-in-out infinite;`
    : '';
  return L.divIcon({
    className: 'custom-fogo-marker',
    html: `<div style="background-color:${cfg.color};width:32px;height:32px;border-radius:6px;transform:rotate(45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px ${cfg.color}88,0 3px 8px rgba(0,0,0,0.6);border:2px solid rgba(255,255,255,0.9);${pulseCss}">
      <span style="transform:rotate(-45deg);color:white;font-size:13px;font-weight:900;">!</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// ─── Utilitário de tempo relativo ────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min atrás`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

// ─── Componente principal: CCO PROMETHEUS ───────────────────────────────────
export default function OperationsCenterView({ equipments, agents, onNavigateTab }) {
  const [events, setEvents] = useState([]);
  const [regional, setRegional] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('ativo,em_atendimento');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [mapLayers, setMapLayers] = useState({ equipamentos: true, agentes: true, eventos: true });
  const [lastRefresh, setLastRefresh] = useState(null);

  // ── Busca de dados ──────────────────────────────────────────────────────
  const fetchCCOData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Para o feed lateral: mostra ativos + em atendimento por padrão, ou filtrando
      const statusParam = filterStatus || undefined;
      if (filterSeverity) params.append('severity', filterSeverity);

      const [resEvents, resRegional] = await Promise.all([
        fetch('/api/events?' + params.toString()),
        fetch('/api/analytics/regional')
      ]);
      const dataEvents = await resEvents.json();
      const dataRegional = await resRegional.json();
      setEvents(Array.isArray(dataEvents) ? dataEvents : []);
      setRegional(Array.isArray(dataRegional) ? dataRegional : []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('[CCO PROMETHEUS] Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [filterSeverity]);

  useEffect(() => {
    fetchCCOData();
    const interval = setInterval(fetchCCOData, 30000);
    return () => clearInterval(interval);
  }, [fetchCCOData]);

  // ── Filtros do feed ─────────────────────────────────────────────────────
  const feedEvents = events.filter(ev => {
    if (filterSeverity && ev.severity !== filterSeverity) return false;
    if (filterStatus) {
      const allowed = filterStatus.split(',');
      if (!allowed.includes(ev.status)) return false;
    }
    return true;
  });

  // ── Métricas derivadas ──────────────────────────────────────────────────
  const activeEvents = events.filter(ev => ev.status !== 'resolvido').length;
  const criticalEvents = events.filter(ev => ev.severity === 'critico' && ev.status !== 'resolvido').length;
  const agentsOnDuty = agents.filter(ag => ag.status === 'em_patrulha' || ag.status === 'em_atendimento').length;
  const totalEquips = equipments.length;
  const operationalEquips = equipments.filter(e => e.status === 'operacional').length;
  const availabilityPct = totalEquips > 0 ? Math.round((operationalEquips / totalEquips) * 100) : 0;
  const offlineEquips = equipments.filter(e => e.status !== 'operacional' && e.status !== 'ainda_nao_instalado').length;

  // ── Ações ───────────────────────────────────────────────────────────────
  const handleResolveEvent = async (ev) => {
    if (!confirm(`Marcar evento "${ev.title}" como resolvido?`)) return;
    try {
      await fetch(`/api/events/${ev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ev, status: 'resolvido' })
      });
      fetchCCOData();
    } catch (err) {
      console.error('Erro ao resolver evento:', err);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Remover este evento permanentemente?')) return;
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      fetchCCOData();
    } catch (err) {
      console.error('Erro ao remover evento:', err);
    }
  };

  const handleSaveEvent = async (formData) => {
    try {
      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Erro ao salvar evento');
        return;
      }
      setShowEventModal(false);
      setEditingEvent(null);
      fetchCCOData();
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Falha na comunicação com o servidor');
    }
  };

  const toggleLayer = (key) => setMapLayers(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Equipamentos filtrados para o mapa ──────────────────────────────────
  const getEquipColor = (eq) => {
    if (eq.status === 'operacional') return '#10b981';
    if (eq.status === 'mau_funcionamento') return '#f59e0b';
    if (eq.status === 'furtado') return '#ef4444';
    if (eq.status === 'desativado') return '#64748b';
    return '#38bdf8';
  };

  const getEquipBadge = (eq) => {
    const map = {
      radar_fiscalizacao: 'RAD', camera_videomonitoramento: 'CAM',
      balanca_caminhao: 'BAL', veiculo_autonomo_estacionamento: 'AUT',
      totem_autoatendimento: 'TOT', patinete_eletrico_compartilhado: 'PAT',
      cancela_automatizada: 'CAN', viatura_guarda_municipal: 'VIA',
      moto_agente_transito: 'MOT'
    };
    return map[eq.type] || 'EQ';
  };

  const eventsForMap = events.filter(ev => ev.status !== 'resolvido');

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4 max-w-[1720px] mx-auto">

      {/* ── Header CCO ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>CCO</span>
            <span className="text-slate-600 font-light">//</span>
            <span>Central de Operações</span>
            {criticalEvents > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {criticalEvents} CRÍTICO{criticalEvents > 1 ? 'S' : ''}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitoramento em tempo real de eventos, equipamentos e agentes em Marília/SP.
            {lastRefresh && (
              <span className="ml-2 text-slate-500">
                Atualizado: {lastRefresh.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCCOData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
          <button
            onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Evento
          </button>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: 'Eventos Ativos',
            value: activeEvents,
            sub: `${criticalEvents} críticos`,
            icon: AlertTriangle,
            color: criticalEvents > 0 ? 'text-rose-400' : 'text-amber-400',
            bg: criticalEvents > 0 ? 'bg-rose-500/10 border-rose-500/25' : 'bg-amber-500/10 border-amber-500/25',
            pulse: criticalEvents > 0
          },
          {
            label: 'Agentes em Atividade',
            value: agentsOnDuty,
            sub: `de ${agents.length} cadastrados`,
            icon: Users,
            color: 'text-sky-400',
            bg: 'bg-sky-500/10 border-sky-500/25'
          },
          {
            label: 'Disponibilidade',
            value: `${availabilityPct}%`,
            sub: `${operationalEquips} de ${totalEquips} online`,
            icon: Activity,
            color: availabilityPct >= 70 ? 'text-emerald-400' : 'text-amber-400',
            bg: availabilityPct >= 70 ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-amber-500/10 border-amber-500/25'
          },
          {
            label: 'Equipamentos Offline',
            value: offlineEquips,
            sub: 'falha, furtado ou desativado',
            icon: Radio,
            color: offlineEquips > 0 ? 'text-rose-400' : 'text-slate-400',
            bg: offlineEquips > 0 ? 'bg-rose-500/10 border-rose-500/25' : 'bg-slate-800/60 border-slate-700/50'
          },
          {
            label: 'Saúde Geral',
            value: `${availabilityPct}%`,
            sub: regional.filter(r => r.healthScore < 50).length > 0 ? `${regional.filter(r => r.healthScore < 50).length} região(ões) crítica(s)` : 'Todas as regiões OK',
            icon: TrendingUp,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10 border-orange-500/25'
          }
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`rounded-2xl bg-slate-900/80 border p-4 shadow-lg ${kpi.bg} ${kpi.pulse ? 'ring-1 ring-rose-500/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg bg-slate-950/60 ${kpi.color}`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.pulse ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              <div className={`text-2xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Layout Principal: Feed + Mapa ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Feed de Alertas (2 colunas) */}
        <div className="lg:col-span-2 flex flex-col gap-3">

          {/* Filtros rápidos */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wide">Filtrar:</span>
            {['', 'critico', 'alerta', 'informativo'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  filterSeverity === sev
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    : 'text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {sev === '' ? 'Todos' : SEVERITY_CONFIG[sev]?.label || sev}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => setFilterStatus('ativo,em_atendimento')}
                className={`px-2.5 py-1 rounded-lg text-xs border transition cursor-pointer ${filterStatus === 'ativo,em_atendimento' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'text-slate-400 border-slate-700 hover:border-slate-600'}`}
              >
                Ativos
              </button>
              <button
                onClick={() => setFilterStatus('')}
                className={`px-2.5 py-1 rounded-lg text-xs border transition cursor-pointer ${filterStatus === '' ? 'bg-slate-700 text-slate-200 border-slate-600' : 'text-slate-400 border-slate-700 hover:border-slate-600'}`}
              >
                Todos
              </button>
            </div>
          </div>

          {/* Lista de eventos */}
          <div className="flex-1 rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Feed de Ocorrências
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {feedEvents.length}
                </span>
              </h3>
              {criticalEvents > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                  LIVE
                </span>
              )}
            </div>

            <div className="overflow-y-auto max-h-[520px]">
              {loading && feedEvents.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">Carregando eventos...</div>
              ) : feedEvents.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                  Nenhum evento{filterSeverity ? ` "${SEVERITY_CONFIG[filterSeverity]?.label}"` : ''} no período selecionado.
                </div>
              ) : (
                feedEvents.map(ev => {
                  const cfg = SEVERITY_CONFIG[ev.severity] || SEVERITY_CONFIG.informativo;
                  const isCritical = ev.severity === 'critico' && ev.status !== 'resolvido';
                  return (
                    <div
                      key={ev.id}
                      className={`px-4 py-3.5 border-b border-slate-800/60 hover:bg-slate-950/40 transition group ${isCritical ? 'border-l-2 border-l-rose-500/70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Dot de severidade */}
                          <div className="mt-1 shrink-0">
                            <span className={`block w-2.5 h-2.5 rounded-full ${cfg.dotClass} ${isCritical ? 'animate-pulse' : ''}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${cfg.badgeClass}`}>
                                {cfg.label}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                              </span>
                              <span className={`text-[10px] ${EVENT_STATUS_CONFIG[ev.status]?.class}`}>
                                • {EVENT_STATUS_CONFIG[ev.status]?.label || ev.status}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{ev.title}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{ev.neighborhood}{ev.street ? ` — ${ev.street}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-600">
                              <Clock className="w-3 h-3 shrink-0" />
                              {timeAgo(ev.created_at)}
                            </div>
                            {ev.description && (
                              <p className="text-[11px] text-slate-400/80 mt-1.5 line-clamp-2">{ev.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                          {ev.status !== 'resolvido' && (
                            <button
                              onClick={() => handleResolveEvent(ev)}
                              title="Marcar como Resolvido"
                              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => { setEditingEvent(ev); setShowEventModal(true); }}
                            title="Editar Evento"
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition cursor-pointer"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            title="Remover Evento"
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Mapa Tático CCO (3 colunas) */}
        <div className="lg:col-span-3 flex flex-col gap-3">

          {/* Controles do mapa */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wide mr-1">Camadas:</span>
            {[
              { key: 'equipamentos', label: `Equip. (${equipments.length})`, color: 'orange' },
              { key: 'agentes', label: `Agentes (${agents.length})`, color: 'sky' },
              { key: 'eventos', label: `Eventos (${eventsForMap.length})`, color: 'rose' }
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                  mapLayers[key]
                    ? `bg-${color}-500/20 text-${color}-300 border-${color}-500/40`
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}

            {/* Legenda rápida */}
            <div className="ml-auto hidden xl:flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Operacional
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Falha
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Crítico
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-rose-500 inline-block" /> Evento
              </span>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[520px]">
            <MapContainer
              center={[-22.2155, -49.9501]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Marcadores de Equipamentos */}
              {mapLayers.equipamentos && equipments.map(eq => (
                <Marker
                  key={`eq-${eq.id}`}
                  position={[eq.latitude, eq.longitude]}
                  icon={createEquipmentMarker(getEquipColor(eq), getEquipBadge(eq))}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px] font-sans text-slate-800 text-xs space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{eq.serial_number}</div>
                      <div><strong>Tipo:</strong> {eq.type.replace(/_/g, ' ')}</div>
                      <div><strong>Status:</strong> <span style={{ color: getEquipColor(eq), fontWeight: 'bold' }}>{eq.status.replace(/_/g, ' ')}</span></div>
                      <div><strong>Local:</strong> {eq.street} — {eq.neighborhood}</div>
                      <div><strong>Manutenção:</strong> {eq.maintenance_need.replace(/_/g, ' ')}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Marcadores de Agentes */}
              {mapLayers.agentes && agents.map(ag => {
                if (!ag.latitude || !ag.longitude) return null;
                return (
                  <Marker
                    key={`ag-${ag.id}`}
                    position={[ag.latitude, ag.longitude]}
                    icon={createAgentMarker()}
                  >
                    <Popup>
                      <div className="p-1 min-w-[200px] font-sans text-slate-800 text-xs space-y-1">
                        <div className="font-bold text-blue-700 text-sm">{ag.name}</div>
                        <div><strong>Matrícula:</strong> {ag.badge_number}</div>
                        <div><strong>Função:</strong> {ag.role.replace(/_/g, ' ')}</div>
                        <div><strong>Status:</strong> <span className="font-semibold text-blue-600">{ag.status.replace(/_/g, ' ')}</span></div>
                        <div><strong>Rádio:</strong> {ag.phone_radio || '—'}</div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Marcadores de Eventos */}
              {mapLayers.eventos && eventsForMap.map(ev => (
                <Marker
                  key={`ev-${ev.id}`}
                  position={[ev.latitude, ev.longitude]}
                  icon={createEventMarker(ev.severity)}
                >
                  <Popup>
                    <div className="p-1 min-w-[220px] font-sans text-xs space-y-1.5">
                      <div className="border-b pb-1.5 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          ev.severity === 'critico' ? 'bg-red-100 text-red-700' :
                          ev.severity === 'alerta' ? 'bg-amber-100 text-amber-700' :
                          'bg-sky-100 text-sky-700'
                        }`}>
                          {SEVERITY_CONFIG[ev.severity]?.label}
                        </span>
                        <p className="font-bold text-slate-900 text-sm mt-1">{ev.title}</p>
                      </div>
                      <div className="text-slate-700"><strong>Tipo:</strong> {EVENT_TYPE_LABELS[ev.event_type]}</div>
                      <div className="text-slate-700"><strong>Local:</strong> {ev.neighborhood}{ev.street ? ` — ${ev.street}` : ''}</div>
                      <div className="text-slate-700"><strong>Status:</strong> {EVENT_STATUS_CONFIG[ev.status]?.label}</div>
                      {ev.description && <p className="text-slate-600 text-[11px] bg-slate-100 p-1.5 rounded">{ev.description}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Badge LIVE sobre o mapa */}
            <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] text-slate-300 font-semibold uppercase tracking-wider">
                CCO LIVE // Marília-SP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Painel de Saúde Regional ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            Saúde Operacional por Região
          </h3>
          <button
            onClick={() => onNavigateTab('map')}
            className="text-xs text-orange-400 hover:text-orange-300 font-medium transition flex items-center gap-1"
          >
            Ver no mapa GPS
          </button>
        </div>

        {regional.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-6">Carregando dados regionais...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {regional.map(reg => {
              const isOk = reg.healthScore >= 70;
              const isCritical = reg.healthScore < 50;
              const barColor = isCritical ? 'bg-rose-500' : isOk ? 'bg-emerald-500' : 'bg-amber-500';
              const borderColor = isCritical ? 'border-rose-500/30' : isOk ? 'border-emerald-500/20' : 'border-amber-500/25';
              const textColor = isCritical ? 'text-rose-400' : isOk ? 'text-emerald-400' : 'text-amber-400';
              return (
                <div
                  key={reg.neighborhood}
                  className={`rounded-xl bg-slate-950/60 border p-3.5 ${borderColor} hover:border-opacity-60 transition`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">{reg.neighborhood}</span>
                    <span className={`text-sm font-extrabold ${textColor}`}>{reg.healthScore}%</span>
                  </div>

                  {/* Barra de saúde */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2.5 overflow-hidden">
                    <div
                      className={`${barColor} h-1.5 rounded-full transition-all duration-700`}
                      style={{ width: `${reg.healthScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      <span className="text-emerald-400 font-medium">{reg.operational}</span>/{reg.total} op.
                    </span>
                    {reg.critical > 0 && (
                      <span className="text-rose-400 font-medium flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {reg.critical} crítico{reg.critical > 1 ? 's' : ''}
                      </span>
                    )}
                    {reg.activeEvents > 0 && (
                      <span className="text-amber-400 font-medium">
                        {reg.activeEvents} evento{reg.activeEvents > 1 ? 's' : ''}
                      </span>
                    )}
                    {reg.critical === 0 && reg.activeEvents === 0 && (
                      <span className="text-emerald-400/70 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Normal
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Evento */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        equipments={equipments}
        agents={agents}
      />
    </div>
  );
}
