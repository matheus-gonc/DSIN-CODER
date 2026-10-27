import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import OverviewView from './components/OverviewView';
import EquipmentTableView from './components/EquipmentTableView';
import TacticalMapView from './components/TacticalMapView';
import AgentsView from './components/AgentsView';
import MaintenanceView from './components/MaintenanceView';
import EquipmentModal from './components/EquipmentModal';
import AgentModal from './components/AgentModal';
import OperationsCenterView from './components/OperationsCenterView';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'inventory', 'map', 'agents', 'maintenance', 'operations'
  const [equipments, setEquipments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros de Equipamentos
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMaintenance, setFilterMaintenance] = useState('');

  // Modais
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);

  // Form State Equipamento
  const [equipForm, setEquipForm] = useState({
    serial_number: '',
    type: 'radar_fiscalizacao',
    brand: '',
    model: '',
    cep: '17500-000',
    neighborhood: 'Centro',
    city: 'Marília',
    state: 'SP',
    street: '',
    reference: '',
    latitude: -22.2155,
    longitude: -49.9501,
    status: 'operacional',
    maintenance_need: 'nenhuma',
    next_maintenance_date: '',
    maintenance_notes: '',
    custom_prop_1_key: 'velocidade_maxima',
    custom_prop_1_val: '60 km/h',
    custom_prop_2_key: 'alimentacao',
    custom_prop_2_val: 'Solar IoT + Bateria'
  });

  // Form State Agente
  const [agentForm, setAgentForm] = useState({
    badge_number: '',
    name: '',
    role: 'agente_transito',
    department: 'Departamento de Trânsito',
    phone_radio: '',
    status: 'disponivel',
    assigned_equipment_id: '',
    latitude: -22.2155,
    longitude: -49.9501
  });

  // Carregar dados da API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      if (filterMaintenance) params.append('maintenance_need', filterMaintenance);

      const [resEq, resAg, resAn] = await Promise.all([
        fetch(`/api/equipments?${params.toString()}`),
        fetch('/api/agents'),
        fetch('/api/analytics/summary')
      ]);

      const dataEq = await resEq.json();
      const dataAg = await resAg.json();
      const dataAn = await resAn.json();

      setEquipments(dataEq);
      setAgents(dataAg);
      setAnalytics(dataAn);
    } catch (err) {
      console.error('Erro ao conectar com API PROMETHEUS:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterStatus, filterMaintenance]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Abertura de Modal de Equipamento
  const handleOpenNewEquipment = () => {
    setSelectedEquip(null);
    setEquipForm({
      serial_number: `EQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'radar_fiscalizacao',
      brand: '',
      model: '',
      cep: '17500-000',
      neighborhood: 'Centro',
      city: 'Marília',
      state: 'SP',
      street: '',
      reference: '',
      latitude: -22.2155,
      longitude: -49.9501,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '',
      maintenance_notes: '',
      custom_prop_1_key: 'resolucao_sensor',
      custom_prop_1_val: '4K UltraHD',
      custom_prop_2_key: 'alimentacao',
      custom_prop_2_val: 'Solar IoT + Bateria'
    });
    setShowEquipModal(true);
  };

  // Edição de Equipamento Existente
  const handleEditEquipment = (eq) => {
    setSelectedEquip(eq);
    const keys = Object.keys(eq.custom_properties || {});
    setEquipForm({
      serial_number: eq.serial_number,
      type: eq.type,
      brand: eq.brand,
      model: eq.model,
      cep: eq.cep || '',
      neighborhood: eq.neighborhood || '',
      city: eq.city || 'Marília',
      state: eq.state || 'SP',
      street: eq.street,
      reference: eq.reference || '',
      latitude: eq.latitude,
      longitude: eq.longitude,
      status: eq.status,
      maintenance_need: eq.maintenance_need,
      next_maintenance_date: eq.next_maintenance_date || '',
      maintenance_notes: eq.maintenance_notes || '',
      custom_prop_1_key: keys[0] || 'caracteristica_1',
      custom_prop_1_val: keys[0] ? String(eq.custom_properties[keys[0]]) : '',
      custom_prop_2_key: keys[1] || 'caracteristica_2',
      custom_prop_2_val: keys[1] ? String(eq.custom_properties[keys[1]]) : ''
    });
    setShowEquipModal(true);
  };

  // Salvar Equipamento (POST ou PUT)
  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    try {
      const customProps = {};
      if (equipForm.custom_prop_1_key) {
        customProps[equipForm.custom_prop_1_key] = equipForm.custom_prop_1_val;
      }
      if (equipForm.custom_prop_2_key) {
        customProps[equipForm.custom_prop_2_key] = equipForm.custom_prop_2_val;
      }

      const payload = {
        serial_number: equipForm.serial_number,
        type: equipForm.type,
        brand: equipForm.brand,
        model: equipForm.model,
        cep: equipForm.cep,
        neighborhood: equipForm.neighborhood,
        city: equipForm.city,
        state: equipForm.state,
        street: equipForm.street,
        reference: equipForm.reference,
        latitude: parseFloat(equipForm.latitude),
        longitude: parseFloat(equipForm.longitude),
        status: equipForm.status,
        maintenance_need: equipForm.maintenance_need,
        next_maintenance_date: equipForm.next_maintenance_date || null,
        maintenance_notes: equipForm.maintenance_notes,
        custom_properties: customProps
      };

      const url = selectedEquip ? `/api/equipments/${selectedEquip.id}` : '/api/equipments';
      const method = selectedEquip ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Erro ao salvar equipamento');
        return;
      }

      setShowEquipModal(false);
      setSelectedEquip(null);
      fetchData();
    } catch (err) {
      console.error('Falha ao salvar equipamento:', err);
      alert('Falha na comunicação com o servidor F.O.G.O.');
    }
  };

  // Excluir Equipamento
  const handleDeleteEquipment = async (id) => {
    if (!confirm('Deseja realmente remover este equipamento do sistema F.O.G.O.?')) return;
    try {
      await fetch(`/api/equipments/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir equipamento:', err);
      alert('Erro ao excluir');
    }
  };

  // Abertura de Modal de Agente
  const handleOpenNewAgent = () => {
    setAgentForm({
      badge_number: '',
      name: '',
      role: 'agente_transito',
      department: 'Departamento de Trânsito',
      phone_radio: '',
      status: 'disponivel',
      assigned_equipment_id: '',
      latitude: -22.2155,
      longitude: -49.9501
    });
    setShowAgentModal(true);
  };

  // Salvar Agente
  const handleSaveAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentForm)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Erro ao cadastrar agente');
        return;
      }

      setShowAgentModal(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao cadastrar agente:', err);
      alert('Erro ao salvar agente');
    }
  };

  // Excluir Agente
  const handleDeleteAgent = async (id) => {
    if (!confirm('Deseja realmente remover este agente do sistema?')) return;
    try {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Erro ao remover agente:', err);
      alert('Erro ao remover agente');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-300">
      
      {/* Navbar Superior Principal */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        analytics={analytics}
        loading={loading}
        onRefresh={fetchData}
        onNewEquipment={handleOpenNewEquipment}
        onNewAgent={handleOpenNewAgent}
      />

      {/* Conteúdo Principal com Espaçamento Limpo */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        
        {/* ABA: Visão Geral */}
        {activeTab === 'overview' && (
          <OverviewView
            analytics={analytics}
            equipments={equipments}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* ABA: Catálogo de Equipamentos */}
        {activeTab === 'inventory' && (
          <EquipmentTableView
            equipments={equipments}
            search={search}
            setSearch={setSearch}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterMaintenance={filterMaintenance}
            setFilterMaintenance={setFilterMaintenance}
            onRefresh={fetchData}
            onEdit={handleEditEquipment}
            onDelete={handleDeleteEquipment}
          />
        )}

        {/* ABA: Mapa Tático GPS */}
        {activeTab === 'map' && (
          <TacticalMapView
            equipments={equipments}
            agents={agents}
          />
        )}

        {/* ABA: Agentes & Patrulha */}
        {activeTab === 'agents' && (
          <AgentsView
            agents={agents}
            onNewAgent={handleOpenNewAgent}
            onDeleteAgent={handleDeleteAgent}
          />
        )}

        {/* ABA: Cronograma de Manutenções */}
        {activeTab === 'maintenance' && (
          <MaintenanceView
            equipments={equipments}
            onEditEquipment={handleEditEquipment}
          />
        )}

        {/* ABA: CCO — Central de Operações PROMETHEUS (Etapa 2) */}
        {activeTab === 'operations' && (
          <OperationsCenterView
            equipments={equipments}
            agents={agents}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Modal de Equipamento */}
      <EquipmentModal
        isOpen={showEquipModal}
        onClose={() => setShowEquipModal(false)}
        selectedEquip={selectedEquip}
        equipForm={equipForm}
        setEquipForm={setEquipForm}
        onSave={handleSaveEquipment}
      />

      {/* Modal de Agente */}
      <AgentModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        agentForm={agentForm}
        setAgentForm={setAgentForm}
        onSave={handleSaveAgent}
      />

      {/* Rodapé Minimalista & Elegante */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 px-6 py-3.5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">PROMETHEUS ENGINE v2.0</span>
          <span>•</span>
          <span>Projeto F.O.G.O. (Desafio DSIN CODER)</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Núcleo Operacional 100% Online
          </span>
          <span className="text-slate-600">|</span>
          <span>Marília/SP</span>
        </div>
      </footer>
    </div>
  );
}
