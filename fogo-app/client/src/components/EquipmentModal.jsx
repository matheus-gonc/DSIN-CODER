import React, { useState } from 'react';
import {
  Cpu,
  MapPin,
  Wrench,
  Activity,
  X,
  Layers
} from 'lucide-react';
import { EQUIPMENT_TYPES } from '../constants/equipmentTypes';

export default function EquipmentModal({
  isOpen,
  onClose,
  selectedEquip,
  equipForm,
  setEquipForm,
  onSave
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'location', 'maintenance', 'iot'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {selectedEquip ? 'Editar Equipamento IoT' : 'Novo Equipamento no Parque'}
              </h3>
              <p className="text-xs text-slate-400">
                Parâmetros de telemetria, localização urbana e manutenção PROMETHEUS.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Internas para Não Poluir a Visualização */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-2 text-xs overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 font-medium transition cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            1. Identificação Básica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`pb-2.5 px-3 font-medium transition cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'location'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            2. Localização & GPS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`pb-2.5 px-3 font-medium transition cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            3. Manutenção
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('iot')}
            className={`pb-2.5 px-3 font-medium transition cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'iot'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            4. Propriedades IoT
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={onSave} className="p-6 space-y-4 text-xs">
          
          {/* ABA 1: Identificação Básica */}
          {activeTab === 'general' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Número de Série Único *
                  </label>
                  <input
                    type="text"
                    required
                    value={equipForm.serial_number}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, serial_number: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: RAD-VEL-104"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Tipo de Dispositivo IoT *
                  </label>
                  <select
                    value={equipForm.type}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, type: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    {EQUIPMENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Fabricante / Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={equipForm.brand}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, brand: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: Hikvision, Visiolog, Perkons..."
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Modelo Técnico *
                  </label>
                  <input
                    type="text"
                    required
                    value={equipForm.model}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, model: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none"
                    placeholder="Ex: SpeedEye Pro 4000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Situação Operacional Inicial *
                </label>
                <select
                  value={equipForm.status}
                  onChange={(e) =>
                    setEquipForm({ ...equipForm, status: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  <option value="operacional">Operacional (Em pleno funcionamento)</option>
                  <option value="mau_funcionamento">Mau Funcionamento (Falha técnica / sensor)</option>
                  <option value="furtado">Furtado / Vandalizado (Ocorrência policial)</option>
                  <option value="ainda_nao_instalado">Aguardando Instalação em Campo</option>
                  <option value="desativado">Desativado</option>
                </select>
              </div>
            </div>
          )}

          {/* ABA 2: Localização & GPS */}
          {activeTab === 'location' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">CEP</label>
                  <input
                    type="text"
                    value={equipForm.cep}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, cep: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none"
                    placeholder="17500-010"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Bairro</label>
                  <input
                    type="text"
                    value={equipForm.neighborhood}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, neighborhood: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none"
                    placeholder="Centro, Fragata, etc."
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Município / UF</label>
                  <input
                    type="text"
                    disabled
                    value={`${equipForm.city}/${equipForm.state}`}
                    className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-3 py-2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Logradouro (Rua / Avenida) *
                </label>
                <input
                  type="text"
                  required
                  value={equipForm.street}
                  onChange={(e) =>
                    setEquipForm({ ...equipForm, street: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none"
                  placeholder="Ex: Av. Tiradentes"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Referência Urbana
                </label>
                <input
                  type="text"
                  value={equipForm.reference}
                  onChange={(e) =>
                    setEquipForm({ ...equipForm, reference: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none"
                  placeholder='Ex: "oposto ao 181", "KM 203", "próximo ao Mercado Central"'
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Latitude GPS (Ex: -22.2155) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={equipForm.latitude}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, latitude: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Longitude GPS (Ex: -49.9501) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={equipForm.longitude}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, longitude: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: Manutenção */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Necessidade de Intervenção *
                  </label>
                  <select
                    value={equipForm.maintenance_need}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, maintenance_need: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="nenhuma">Regular (Sem intervenção pendente)</option>
                    <option value="imediata">🚨 Imediata / Urgente (Falha ou risco)</option>
                    <option value="agendada_periodica">📅 Agendada / Periódica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Data da Próxima Manutenção
                  </label>
                  <input
                    type="date"
                    value={equipForm.next_maintenance_date}
                    onChange={(e) =>
                      setEquipForm({ ...equipForm, next_maintenance_date: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Notas de Manutenção / Diagnóstico Técnico
                </label>
                <textarea
                  rows="3"
                  value={equipForm.maintenance_notes}
                  onChange={(e) =>
                    setEquipForm({ ...equipForm, maintenance_notes: e.target.value })
                  }
                  placeholder="Ex: Sensor com calibração alterada devido a choque térmico. Equipe acionada."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ABA 4: Propriedades IoT */}
          {activeTab === 'iot' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <p className="text-slate-400 text-xs">
                Defina atributos específicos deste equipamento urbano em formato Chave-Valor.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Propriedade IoT 1</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Chave (ex: velocidade_limite)"
                      value={equipForm.custom_prop_1_key}
                      onChange={(e) =>
                        setEquipForm({ ...equipForm, custom_prop_1_key: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Valor (ex: 60 km/h)"
                      value={equipForm.custom_prop_1_val}
                      onChange={(e) =>
                        setEquipForm({ ...equipForm, custom_prop_1_val: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 font-medium block mb-1">Propriedade IoT 2</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Chave (ex: visao_noturna)"
                      value={equipForm.custom_prop_2_key}
                      onChange={(e) =>
                        setEquipForm({ ...equipForm, custom_prop_2_key: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Valor (ex: Infravermelho 4K)"
                      value={equipForm.custom_prop_2_val}
                      onChange={(e) =>
                        setEquipForm({ ...equipForm, custom_prop_2_val: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé e Botões de Submissão */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex gap-1">
              {['general', 'location', 'maintenance', 'iot'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTab === t ? 'w-5 bg-orange-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition cursor-pointer"
              >
                {selectedEquip ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
