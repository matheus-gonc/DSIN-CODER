import {
  Radio,
  Video,
  Scale,
  Bot,
  CreditCard,
  Bike,
  TrafficCone,
  ShieldCheck,
  ShieldAlert,
  CarFront,
  Cpu
} from 'lucide-react';

export const EQUIPMENT_TYPES = [
  {
    id: 'radar_fiscalizacao',
    label: 'Radar de Fiscalização',
    icon: Radio,
    badge: 'RAD',
    color: '#f97316',
    category: 'Trânsito'
  },
  {
    id: 'camera_videomonitoramento',
    label: 'Câmera de Monitoramento',
    icon: Video,
    badge: 'CAM',
    color: '#38bdf8',
    category: 'Vigilância'
  },
  {
    id: 'balanca_caminhao',
    label: 'Balança de Caminhão',
    icon: Scale,
    badge: 'BAL',
    color: '#a855f7',
    category: 'Pesagem'
  },
  {
    id: 'veiculo_autonomo_estacionamento',
    label: 'Veículo Autônomo Rotativo',
    icon: Bot,
    badge: 'AUT',
    color: '#06b6d4',
    category: 'Autônomo'
  },
  {
    id: 'totem_autoatendimento',
    label: 'Totem de Autoatendimento',
    icon: CreditCard,
    badge: 'TOT',
    color: '#6366f1',
    category: 'Serviço'
  },
  {
    id: 'patinete_eletrico_compartilhado',
    label: 'Patinete Compartilhado',
    icon: Bike,
    badge: 'PAT',
    color: '#10b981',
    category: 'Micromobilidade'
  },
  {
    id: 'cancela_automatizada',
    label: 'Cancela Automatizada',
    icon: TrafficCone,
    badge: 'CAN',
    color: '#f59e0b',
    category: 'Acesso'
  },
  {
    id: 'moto_agente_transito',
    label: 'Moto de Agente de Trânsito',
    icon: Bike,
    badge: 'MOT',
    color: '#f59e0b',
    category: 'Operacional'
  },
  {
    id: 'viatura_guarda_municipal',
    label: 'Viatura Guarda Municipal',
    icon: ShieldCheck,
    badge: 'GCM',
    color: '#0284c7',
    category: 'Segurança'
  },
  {
    id: 'viatura_policia_militar',
    label: 'Viatura Polícia Militar',
    icon: ShieldAlert,
    badge: 'PM',
    color: '#e11d48',
    category: 'Policial'
  },
  {
    id: 'veiculo_transporte_escolar_taxi',
    label: 'Transporte (Táxi / Escolar)',
    icon: CarFront,
    badge: 'TRA',
    color: '#eab308',
    category: 'Mobilidade'
  }
];

export const STATUS_CONFIG = {
  operacional: {
    label: 'Operacional',
    dotColor: '#10b981',
    pillClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    borderClass: 'border-emerald-500/30'
  },
  mau_funcionamento: {
    label: 'Mau Funcionamento',
    dotColor: '#f59e0b',
    pillClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    borderClass: 'border-amber-500/30'
  },
  furtado: {
    label: 'Furtado / Vandalizado',
    dotColor: '#ef4444',
    pillClass: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    borderClass: 'border-rose-500/30'
  },
  desativado: {
    label: 'Desativado',
    dotColor: '#64748b',
    pillClass: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
    borderClass: 'border-slate-500/30'
  },
  ainda_nao_instalado: {
    label: 'Aguardando Instalação',
    dotColor: '#38bdf8',
    pillClass: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    borderClass: 'border-sky-500/30'
  }
};

export const MAINTENANCE_CONFIG = {
  nenhuma: {
    label: 'Regular (Sem pendência)',
    colorClass: 'text-slate-400',
    badgeClass: 'bg-slate-800/60 text-slate-400 border-slate-700/50'
  },
  imediata: {
    label: 'Urgente / Imediata',
    colorClass: 'text-rose-400 font-semibold',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold'
  },
  agendada_periodica: {
    label: 'Agendada / Periódica',
    colorClass: 'text-amber-400 font-medium',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  }
};

export const getEquipmentType = (typeId) => {
  return (
    EQUIPMENT_TYPES.find((t) => t.id === typeId) || {
      id: typeId,
      label: typeId,
      icon: Cpu,
      badge: 'EQ',
      color: '#94a3b8',
      category: 'Geral'
    }
  );
};
