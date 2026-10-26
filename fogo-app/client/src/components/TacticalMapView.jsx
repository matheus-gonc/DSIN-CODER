import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Radio,
  Users
} from 'lucide-react';
import {
  STATUS_CONFIG,
  MAINTENANCE_CONFIG,
  getEquipmentType
} from '../constants/equipmentTypes';

// Configuração de marcadores estilizados
const createLeafletIcon = (color, label, isAgent = false) => {
  return L.divIcon({
    className: 'custom-fogo-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: ${isAgent ? '10px' : '50%'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-size: 11px;
        box-shadow: 0 0 16px ${color}88, 0 4px 6px rgba(0,0,0,0.4);
        border: 2px solid #ffffff;
        transition: transform 0.2s ease;
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export default function TacticalMapView({ equipments, agents }) {
  const [showEquipments, setShowEquipments] = useState(true);
  const [showAgents, setShowAgents] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const filteredEquipments = equipments.filter((eq) => {
    if (filterStatus && eq.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-3 max-w-[1720px] mx-auto">
      {/* Sub-Header / HUD de Controle do Mapa */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Indicador de Status GPS */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-slate-300 font-semibold uppercase">
              GPS LIVE // Marília-SP
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>Centro:</span>
            <span className="text-slate-300">-22.2155, -49.9501</span>
          </div>
        </div>

        {/* Controles de Camadas (Toggles) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEquipments(!showEquipments)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
              showEquipments
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Equipamentos ({filteredEquipments.length})</span>
          </button>

          <button
            onClick={() => setShowAgents(!showAgents)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
              showAgents
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Agentes ({agents.length})</span>
          </button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">Status: Todos</option>
            <option value="operacional">Operacionais</option>
            <option value="mau_funcionamento">Mau Funcionamento</option>
            <option value="furtado">Furtados</option>
          </select>
        </div>

        {/* Legenda de Cores */}
        <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            Operacional
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            Atenção / Falha
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            Furtado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-sky-500 shadow-sm shadow-sky-500/50" />
            Agentes
          </span>
        </div>
      </div>

      {/* Container do Mapa */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[650px] w-full">
        <MapContainer
          center={[-22.2155, -49.9501]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcadores de Equipamentos */}
          {showEquipments &&
            filteredEquipments.map((eq) => {
              let color = '#10b981';
              if (eq.status === 'mau_funcionamento') color = '#f59e0b';
              if (eq.status === 'furtado') color = '#ef4444';
              if (eq.status === 'desativado') color = '#64748b';
              if (eq.status === 'ainda_nao_instalado') color = '#38bdf8';

              const typeInfo = getEquipmentType(eq.type);
              const badge = typeInfo.badge || 'EQ';

              return (
                <Marker
                  key={`eq-${eq.id}`}
                  position={[eq.latitude, eq.longitude]}
                  icon={createLeafletIcon(color, badge, false)}
                >
                  <Popup>
                    <div className="p-1 min-w-[220px] font-sans text-slate-800 text-xs space-y-1.5">
                      <div className="border-b pb-1.5 mb-1 flex items-center justify-between">
                        <strong className="text-sm font-bold text-slate-900 flex items-center gap-1">
                          {typeInfo.label}
                        </strong>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {eq.serial_number}
                        </span>
                      </div>
                      <div>
                        <strong>Marca / Modelo:</strong> {eq.brand} - {eq.model}
                      </div>
                      <div>
                        <strong>Endereço:</strong> {eq.street}
                        {eq.reference ? ` (${eq.reference})` : ''}
                      </div>
                      <div>
                        <strong>Bairro:</strong> {eq.neighborhood} — {eq.city}/{eq.state}
                      </div>
                      <div>
                        <strong>Situação:</strong>{' '}
                        <span style={{ color, fontWeight: 'bold' }}>
                          {STATUS_CONFIG[eq.status]?.label || eq.status}
                        </span>
                      </div>
                      <div>
                        <strong>Manutenção:</strong>{' '}
                        {MAINTENANCE_CONFIG[eq.maintenance_need]?.label || 'Regular'}
                      </div>
                      {eq.next_maintenance_date && (
                        <div className="text-[11px] text-slate-600">
                          <strong>Próx. Data:</strong> {eq.next_maintenance_date}
                        </div>
                      )}
                      {eq.maintenance_notes && (
                        <div className="text-[11px] text-slate-600 italic bg-slate-100 p-1.5 rounded mt-1">
                          {eq.maintenance_notes}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Marcadores de Agentes */}
          {showAgents &&
            agents.map((ag) => {
              if (!ag.latitude || !ag.longitude) return null;
              return (
                <Marker
                  key={`ag-${ag.id}`}
                  position={[ag.latitude, ag.longitude]}
                  icon={createLeafletIcon('#0284c7', 'AGT', true)}
                >
                  <Popup>
                    <div className="p-1 min-w-[210px] font-sans text-slate-800 text-xs space-y-1.5">
                      <div className="border-b pb-1.5 mb-1 flex items-center justify-between">
                        <strong className="text-sm font-bold text-blue-700">
                          {ag.name}
                        </strong>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                          {ag.badge_number}
                        </span>
                      </div>
                      <div>
                        <strong>Função:</strong>{' '}
                        {ag.role.replace('_', ' ').toUpperCase()}
                      </div>
                      <div>
                        <strong>Divisão:</strong> {ag.department}
                      </div>
                      <div>
                        <strong>Rádio:</strong> {ag.phone_radio || 'Não informado'}
                      </div>
                      <div>
                        <strong>Status:</strong>{' '}
                        <span className="font-semibold text-blue-600">
                          {ag.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
}
