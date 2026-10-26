import React from 'react';
import { Users, X } from 'lucide-react';

export default function AgentModal({
  isOpen,
  onClose,
  agentForm,
  setAgentForm,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Cadastrar Agente de Campo
              </h3>
              <p className="text-xs text-slate-400">
                Integração de agente de trânsito, guarda civil ou policial militar.
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

        {/* Formulário */}
        <form onSubmit={onSave} className="p-6 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Matrícula / ID Funcional *
            </label>
            <input
              type="text"
              required
              value={agentForm.badge_number}
              onChange={(e) =>
                setAgentForm({ ...agentForm, badge_number: e.target.value })
              }
              placeholder="Ex: AGT-5042 ou GCM-908"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Nome Completo do Profissional *
            </label>
            <input
              type="text"
              required
              value={agentForm.name}
              onChange={(e) =>
                setAgentForm({ ...agentForm, name: e.target.value })
              }
              placeholder="Ex: Tenente Marcos Santos"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Corporação / Função *
              </label>
              <select
                value={agentForm.role}
                onChange={(e) =>
                  setAgentForm({ ...agentForm, role: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none cursor-pointer"
              >
                <option value="agente_transito">Agente de Trânsito</option>
                <option value="guarda_municipal">Guarda Municipal</option>
                <option value="policial_militar">Polícia Militar</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Status Operacional *
              </label>
              <select
                value={agentForm.status}
                onChange={(e) =>
                  setAgentForm({ ...agentForm, status: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none cursor-pointer"
              >
                <option value="disponivel">Disponível</option>
                <option value="em_patrulha">Em Patrulha</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="folga">Folga</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Divisão / Base de Lotação
            </label>
            <input
              type="text"
              value={agentForm.department}
              onChange={(e) =>
                setAgentForm({ ...agentForm, department: e.target.value })
              }
              placeholder="Ex: 2ª Cia - Patrulhamento Tático Urbano"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Canal de Rádio / Frequência
            </label>
            <input
              type="text"
              value={agentForm.phone_radio}
              onChange={(e) =>
                setAgentForm({ ...agentForm, phone_radio: e.target.value })
              }
              placeholder="Ex: Canal 03 - 148.5 MHz"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition cursor-pointer"
            >
              Confirmar Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
