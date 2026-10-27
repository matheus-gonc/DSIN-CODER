import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Users, Radio } from 'lucide-react';

const NEIGHBORHOODS = ['Centro', 'Alto Cafezal', 'Fragata', 'Distrito Industrial', 'Cascata', 'Maria Izabel', 'Zona Sul'];

const EVENT_TYPES = [
  { id: 'acidente', label: 'Acidente de Trânsito' },
  { id: 'pane_eletrica', label: 'Pane Elétrica / Infraestrutura' },
  { id: 'congestionamento', label: 'Congestionamento Severo' },
  { id: 'vandalismo', label: 'Vandalismo / Furto' },
  { id: 'sensor_offline', label: 'Sensor / Equipamento Offline' },
  { id: 'alarme_seguranca', label: 'Alarme de Segurança' },
  { id: 'outros', label: 'Outros' }
];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  equipments = [],
  agents = [],
  editingEvent = null
}) {
  const [form, setForm] = useState(editingEvent ? {
    title: editingEvent.title || '',
    description: editingEvent.description || '',
    severity: editingEvent.severity || 'alerta',
    event_type: editingEvent.event_type || 'sensor_offline',
    neighborhood: editingEvent.neighborhood || 'Centro',
    street: editingEvent.street || '',
    latitude: editingEvent.latitude ?? -22.2155,
    longitude: editingEvent.longitude ?? -49.9501,
    status: editingEvent.status || 'ativo',
    equipment_id: editingEvent.equipment_id || '',
    agent_id: editingEvent.agent_id || ''
  } : {
    title: '',
    description: '',
    severity: 'alerta',
    event_type: 'sensor_offline',
    neighborhood: 'Centro',
    street: '',
    latitude: -22.2155,
    longitude: -49.9501,
    status: 'ativo',
    equipment_id: '',
    agent_id: ''
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      equipment_id: form.equipment_id ? Number(form.equipment_id) : null,
      agent_id: form.agent_id ? Number(form.agent_id) : null
    });
  };

  const severityConfig = {
    critico: { label: 'Crítico', classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    alerta: { label: 'Alerta', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    informativo: { label: 'Informativo', classes: 'bg-sky-500/15 text-sky-400 border-sky-500/30' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden my-6">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingEvent ? 'Editar Evento' : 'Registrar Novo Evento'}
              </h3>
              <p className="text-xs text-slate-400">Central de Operações — CCO PROMETHEUS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">

          {/* Severidade — destaque visual */}
          <div>
            <label className="block text-slate-400 font-medium mb-2">Nível de Severidade *</label>
            <div className="flex gap-2">
              {Object.entries(severityConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('severity', key)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wide transition cursor-pointer ${
                    form.severity === key ? cfg.classes : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Título do Evento *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Ex: Câmera offline na Av. Brasil"
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500/60 placeholder-slate-600"
            />
          </div>

          {/* Tipo de Evento + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tipo de Evento *</label>
              <select
                required
                value={form.event_type}
                onChange={e => handleChange('event_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                {EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Status *</label>
              <select
                required
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="ativo">Ativo</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="resolvido">Resolvido</option>
              </select>
            </div>
          </div>

          {/* Localização */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Bairro *
              </label>
              <select
                required
                value={form.neighborhood}
                onChange={e => handleChange('neighborhood', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Logradouro</label>
              <input
                type="text"
                value={form.street}
                onChange={e => handleChange('street', e.target.value)}
                placeholder="Ex: Av. Tiradentes"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500/60 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={e => handleChange('latitude', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500/60"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={e => handleChange('longitude', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500/60"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Descrição / Diagnóstico</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Detalhes do evento, causa raiz, ações recomendadas..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500/60 placeholder-slate-600 resize-none"
            />
          </div>

          {/* Vinculações opcionais */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                <Radio className="w-3 h-3" /> Equipamento Vinculado
              </label>
              <select
                value={form.equipment_id}
                onChange={e => handleChange('equipment_id', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="">Nenhum</option>
                {equipments.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.serial_number} — {eq.type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Agente Responsável
              </label>
              <select
                value={form.agent_id}
                onChange={e => handleChange('agent_id', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="">Nenhum</option>
                {agents.map(ag => (
                  <option key={ag.id} value={ag.id}>{ag.name} ({ag.badge_number})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              {editingEvent ? 'Salvar Alterações' : 'Registrar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
