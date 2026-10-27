const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'fogo.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// 1. Tabela de Equipamentos Urbanos IoT
db.exec(`
  CREATE TABLE IF NOT EXISTS equipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    
    -- Localização
    cep TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Metrópole Central',
    state TEXT DEFAULT 'SP',
    street TEXT NOT NULL,
    reference TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    
    -- Situação
    status TEXT NOT NULL CHECK(status IN ('ainda_nao_instalado', 'operacional', 'mau_funcionamento', 'desativado', 'furtado')),
    
    -- Manutenção
    maintenance_need TEXT NOT NULL CHECK(maintenance_need IN ('nenhuma', 'imediata', 'agendada_periodica')),
    next_maintenance_date TEXT,
    maintenance_notes TEXT,
    
    -- Propriedades particulares dinâmicas em JSON
    custom_properties TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. Tabela de Agentes de Mobilidade & Segurança
  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('agente_transito', 'guarda_municipal', 'policial_militar')),
    department TEXT,
    phone_radio TEXT,
    status TEXT NOT NULL CHECK(status IN ('em_patrulha', 'em_atendimento', 'disponivel', 'folga')),
    assigned_equipment_id INTEGER,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_equipment_id) REFERENCES equipments(id) ON DELETE SET NULL
  );

  -- 3. Tabela de Eventos Críticos & Telemetria em Tempo Real (Etapa 2 - CCO PROMETHEUS)
  CREATE TABLE IF NOT EXISTS city_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK(severity IN ('critico', 'alerta', 'informativo')),
    event_type TEXT NOT NULL, -- 'acidente', 'pane_eletrica', 'congestiona', 'vandalismo', 'sensor_offline', 'alarme_seguranca'
    neighborhood TEXT NOT NULL,
    street TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('ativo', 'em_atendimento', 'resolvido')),
    equipment_id INTEGER,
    agent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE SET NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
  );
`);

// Seed inicial com dados inteligentes caso o banco esteja vazio
const countEquipments = db.prepare('SELECT COUNT(*) as count FROM equipments').get();
if (countEquipments.count === 0) {
  const insertEquipment = db.prepare(`
    INSERT INTO equipments (
      serial_number, type, brand, model,
      cep, neighborhood, city, state, street, reference, latitude, longitude,
      status, maintenance_need, next_maintenance_date, maintenance_notes,
      custom_properties
    ) VALUES (
      @serial_number, @type, @brand, @model,
      @cep, @neighborhood, @city, @state, @street, @reference, @latitude, @longitude,
      @status, @maintenance_need, @next_maintenance_date, @maintenance_notes,
      @custom_properties
    )
  `);

  const initialEquipments = [
    {
      serial_number: 'RAD-VEL-001',
      type: 'radar_fiscalizacao',
      brand: 'Perkons / Visiolog',
      model: 'SpeedEye 4000',
      cep: '17500-010',
      neighborhood: 'Centro',
      city: 'Marília',
      state: 'SP',
      street: 'Av. Sampaio Vidal',
      reference: 'Oposto ao número 181, sentido B/C',
      latitude: -22.2155,
      longitude: -49.9501,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '2026-12-15',
      maintenance_notes: 'Aferição INMETRO válida até final de 2026.',
      custom_properties: JSON.stringify({
        radar_type: 'velocidade',
        speed_limit_kmh: 50,
        lane_count: 2,
        sensor_type: 'laço_indutivo_laser'
      })
    },
    {
      serial_number: 'RAD-SEM-002',
      type: 'radar_fiscalizacao',
      brand: 'Engebras',
      model: 'RedLight Sentinel Pro',
      cep: '17501-400',
      neighborhood: 'Alto Cafezal',
      city: 'Marília',
      state: 'SP',
      street: 'Rua Nove de Julho x Rua Bahia',
      reference: 'Cruzamento com semáforo nº 42',
      latitude: -22.2189,
      longitude: -49.9463,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '2026-11-20',
      maintenance_notes: 'Câmera de avanço de sinal e faixa de pedestre calibrada.',
      custom_properties: JSON.stringify({
        radar_type: 'semaforo_e_conversao',
        has_yellow_light_timer: true,
        pedestrian_crossing_sensor: true
      })
    },
    {
      serial_number: 'CAM-VID-010',
      type: 'camera_videomonitoramento',
      brand: 'Hikvision / Dahua',
      model: 'DarkFighter PTZ Ultra HD',
      cep: '17509-020',
      neighborhood: 'Fragata',
      city: 'Marília',
      state: 'SP',
      street: 'Av. Tiradentes',
      reference: 'Em frente ao Mercado do Tio, poste 14',
      latitude: -22.2268,
      longitude: -49.9412,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '2027-01-10',
      maintenance_notes: 'Lente limpa e conectividade 5G estável.',
      custom_properties: JSON.stringify({
        night_vision: true,
        resolution: '4K (3840x2160)',
        color_mode: 'colorido_full_time',
        optical_zoom: '36x',
        ai_plate_recognition: true
      })
    },
    {
      serial_number: 'CAM-VID-015',
      type: 'camera_videomonitoramento',
      brand: 'Intelbras',
      model: 'VIP 5220 B',
      cep: '17502-100',
      neighborhood: 'Centro',
      city: 'Marília',
      state: 'SP',
      street: 'Av. Brasil',
      reference: 'KM 203 da ligação rodoviária',
      latitude: -22.2112,
      longitude: -49.9554,
      status: 'mau_funcionamento',
      maintenance_need: 'imediata',
      next_maintenance_date: '2026-10-27',
      maintenance_notes: 'Oscilação no sinal de transmissão óptico e falha no iluminador infravermelho.',
      custom_properties: JSON.stringify({
        night_vision: true,
        resolution: 'Full HD (1080p)',
        color_mode: 'preto_e_branco_noturno',
        optical_zoom: '20x',
        error_code: 'ERR_STREAM_PACKET_LOSS_84%'
      })
    },
    {
      serial_number: 'BAL-PES-003',
      type: 'balanca_caminhao',
      brand: 'Toledo do Brasil',
      model: 'Guardian Weigh-In-Motion (WIM)',
      cep: '17512-000',
      neighborhood: 'Distrito Industrial',
      city: 'Marília',
      state: 'SP',
      street: 'Rodovia SP-294 x Acesso Industrial',
      reference: 'KM 451, Pátio de Pesagem Dinâmica',
      latitude: -22.2031,
      longitude: -49.9723,
      status: 'operacional',
      maintenance_need: 'agendada_periodica',
      next_maintenance_date: '2026-11-05',
      maintenance_notes: 'Calibração semestral de células de carga piezoelétricas agendada.',
      custom_properties: JSON.stringify({
        max_capacity_tons: 80,
        dynamic_weighing: true,
        sensor_type: 'piezoeletrico_alta_precisao',
        auto_fine_dispatcher: true
      })
    },
    {
      serial_number: 'AUT-ROT-004',
      type: 'veiculo_autonomo_estacionamento',
      brand: 'CyberTrax Urban',
      model: 'ScanBot V3',
      cep: '17500-110',
      neighborhood: 'Centro',
      city: 'Marília',
      state: 'SP',
      street: 'Rua Prudente de Moraes',
      reference: 'Circulando entre número 50 e 400',
      latitude: -22.2148,
      longitude: -49.9482,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '2026-12-01',
      maintenance_notes: 'Nível de bateria a 92%, sensores LiDAR calibrados.',
      custom_properties: JSON.stringify({
        battery_level_percent: 92,
        scan_frequency_sec: 15,
        lidar_range_meters: 30,
        auto_ticket_generation: true
      })
    },
    {
      serial_number: 'TOT-ROT-088',
      type: 'totem_autoatendimento',
      brand: 'Digicon',
      model: 'PayStation Solar IoT',
      cep: '17500-020',
      neighborhood: 'Centro',
      city: 'Marília',
      state: 'SP',
      street: 'Praça Saturnino de Brito',
      reference: 'Em frente à Prefeitura Municipal',
      latitude: -22.2139,
      longitude: -49.9472,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '2027-02-10',
      maintenance_notes: 'Leitor NFC e impressora térmica OK.',
      custom_properties: JSON.stringify({
        power_source: 'painel_solar_hibrido',
        accepted_payments: ['pix', 'cartao_aproximacao', 'nfc', 'moedas'],
        display_touch_inches: 15
      })
    },
    {
      serial_number: 'PAT-ELET-552',
      type: 'patinete_eletrico_compartilhado',
      brand: 'Segway-Ninebot',
      model: 'Max Pro Smart IoT',
      cep: '17501-050',
      neighborhood: 'Cascata',
      city: 'Marília',
      state: 'SP',
      street: 'Av. das Esmeraldas',
      reference: 'Estação Ciclovia - Próximo ao quiosque 3',
      latitude: -22.2295,
      longitude: -49.9351,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '2026-11-12',
      maintenance_notes: 'Pneus e freio regenerativo em conformidade.',
      custom_properties: JSON.stringify({
        battery_percentage: 84,
        geofence_speed_limiter: true,
        max_speed_kmh: 20,
        helmets_lock_status: 'disponivel'
      })
    },
    {
      serial_number: 'CAN-AUT-007',
      type: 'cancela_automatizada',
      brand: 'PPA / Wolpac',
      model: 'Barrier FastPass RFID',
      cep: '17500-200',
      neighborhood: 'Centro',
      city: 'Marília',
      state: 'SP',
      street: 'Terminal Rodoviário Central',
      reference: 'Acesso A - Faixa Exclusiva Ônibus',
      latitude: -22.2168,
      longitude: -49.9535,
      status: 'desativado',
      maintenance_need: 'agendada_periodica',
      next_maintenance_date: '2026-10-28',
      maintenance_notes: 'Substituição do motor brushless e braço com fita LED programada para amanhã.',
      custom_properties: JSON.stringify({
        opening_speed_sec: 1.2,
        emergency_manual_release: true,
        vehicle_detection_loop: true
      })
    },
    {
      serial_number: 'VIA-GCM-012',
      type: 'viatura_guarda_municipal',
      brand: 'Toyota',
      model: 'Corolla Cross Híbrido Patrulha',
      cep: '17500-000',
      neighborhood: 'Centro',
      city: 'Marília',
      state: 'SP',
      street: 'Av. Sampaio Vidal',
      reference: 'Base Operacional Central',
      latitude: -22.2142,
      longitude: -49.9495,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '2026-12-30',
      maintenance_notes: 'Sirene, rádio digital TETRA e computador de bordo em funcionamento.',
      custom_properties: JSON.stringify({
        license_plate: 'GCM-2026',
        onboard_computer: true,
        dashcam_stream_active: true,
        bulletproof_level: 'III-A'
      })
    },
    {
      serial_number: 'MOT-AGT-022',
      type: 'moto_agente_transito',
      brand: 'Honda',
      model: 'NC 750X Trânsito Rápido',
      cep: '17501-100',
      neighborhood: 'Maria Izabel',
      city: 'Marília',
      state: 'SP',
      street: 'Av. Vicente Ferreira',
      reference: 'Próximo à Santa Casa',
      latitude: -22.2221,
      longitude: -49.9432,
      status: 'operacional',
      maintenance_need: 'nenhuma',
      next_maintenance_date: '2026-11-18',
      maintenance_notes: 'Revisão de pastilhas e óleo em dia.',
      custom_properties: JSON.stringify({
        license_plate: 'TRA-1044',
        has_speed_radar_gun: true,
        siren_optical_led: true
      })
    },
    {
      serial_number: 'RAD-FUR-099',
      type: 'radar_fiscalizacao',
      brand: 'Visiolog',
      model: 'SpeedEye 3000',
      cep: '17519-150',
      neighborhood: 'Zona Sul',
      city: 'Marília',
      state: 'SP',
      street: 'Av. João Ramalho',
      reference: 'KM 5, próximo à passarela metálica',
      latitude: -22.2415,
      longitude: -49.9320,
      status: 'furtado',
      maintenance_need: 'imediata',
      next_maintenance_date: '2026-10-26',
      maintenance_notes: 'Equipamento vandalizado e cabeamento de alimentação/telemetria furtado às 03:14h.',
      custom_properties: JSON.stringify({
        radar_type: 'velocidade',
        speed_limit_kmh: 60,
        incident_report: 'BO-2026/8941-F'
      })
    }
  ];

  for (const eq of initialEquipments) {
    insertEquipment.run(eq);
  }
}

// Seed inicial para Agentes
const countAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get();
if (countAgents.count === 0) {
  const insertAgent = db.prepare(`
    INSERT INTO agents (
      badge_number, name, role, department, phone_radio, status, assigned_equipment_id, latitude, longitude
    ) VALUES (
      @badge_number, @name, @role, @department, @phone_radio, @status, @assigned_equipment_id, @latitude, @longitude
    )
  `);

  const initialAgents = [
    {
      badge_number: 'AGT-8491',
      name: 'Carlos Alberto Mendonça',
      role: 'agente_transito',
      department: 'Departamento Municipal de Trânsito e Mobilidade',
      phone_radio: 'Canal 4 - Trânsito Centro (ID 401)',
      status: 'em_patrulha',
      assigned_equipment_id: 11, // Moto NC 750X
      latitude: -22.2221,
      longitude: -49.9432
    },
    {
      badge_number: 'GCM-1042',
      name: 'Juliana Vasconcelos de Souza',
      role: 'guarda_municipal',
      department: 'Divisão de Patrulhamento Urbano & Videomonitoramento',
      phone_radio: 'Canal 1 - Comando Geral (ID 114)',
      status: 'em_patrulha',
      assigned_equipment_id: 10, // Viatura Corolla Cross
      latitude: -22.2142,
      longitude: -49.9495
    },
    {
      badge_number: 'PM-99231',
      name: 'Sargento Rodrigo F. Oliveira',
      role: 'policial_militar',
      department: 'Polícia Militar Rodoviária / Trânsito Urbano',
      phone_radio: 'Frequência Copom 190 (VTR-4402)',
      status: 'em_atendimento',
      assigned_equipment_id: 4, // Apoio a ocorrência perto de radar
      latitude: -22.2112,
      longitude: -49.9554
    },
    {
      badge_number: 'AGT-7730',
      name: 'Mariana Duarte Prado',
      role: 'agente_transito',
      department: 'Fiscalização de Estacionamento Rotativo e Sinalização',
      phone_radio: 'Canal 4 - Trânsito Centro (ID 412)',
      status: 'disponivel',
      assigned_equipment_id: 6, // Apoio ao ScanBot
      latitude: -22.2148,
      longitude: -49.9482
    }
  ];

  for (const ag of initialAgents) {
    insertAgent.run(ag);
  }
}

// Seed inicial para Eventos (CCO PROMETHEUS — Etapa 2)
const countEvents = db.prepare('SELECT COUNT(*) as count FROM city_events').get();
if (countEvents.count === 0) {
  const insertEvent = db.prepare(`
    INSERT INTO city_events (
      title, description, severity, event_type,
      neighborhood, street, latitude, longitude,
      status, equipment_id, agent_id
    ) VALUES (
      @title, @description, @severity, @event_type,
      @neighborhood, @street, @latitude, @longitude,
      @status, @equipment_id, @agent_id
    )
  `);

  const initialEvents = [
    {
      title: 'Câmera CAM-VID-015 offline — falha de transmissão',
      description: 'Oscilação no sinal óptico detectada às 03:14h. Perda de 84% dos pacotes de stream. Iluminador infravermelho sem resposta. Cobertura da Av. Brasil comprometida.',
      severity: 'critico',
      event_type: 'sensor_offline',
      neighborhood: 'Centro',
      street: 'Av. Brasil',
      latitude: -22.2112,
      longitude: -49.9554,
      status: 'em_atendimento',
      equipment_id: 4,
      agent_id: 3
    },
    {
      title: 'Radar RAD-FUR-099 furtado — Zona Sul',
      description: 'Equipamento vandalizado e cabeamento de alimentação/telemetria furtado na madrugada. BO registrado: 2026/8941-F. Trecho sem fiscalização eletrônica.',
      severity: 'critico',
      event_type: 'vandalismo',
      neighborhood: 'Zona Sul',
      street: 'Av. João Ramalho',
      latitude: -22.2415,
      longitude: -49.9320,
      status: 'ativo',
      equipment_id: 12,
      agent_id: null
    },
    {
      title: 'Congestionamento severo — Av. Sampaio Vidal',
      description: 'Bloqueio parcial de faixa identificado via sensores de radar. Fluxo veicular reduzido em 60%. Tempo estimado de normalização: 45 min.',
      severity: 'alerta',
      event_type: 'congestionamento',
      neighborhood: 'Centro',
      street: 'Av. Sampaio Vidal',
      latitude: -22.2160,
      longitude: -49.9490,
      status: 'ativo',
      equipment_id: 1,
      agent_id: 1
    },
    {
      title: 'Cancela CAN-AUT-007 desativada para manutenção',
      description: 'Cancela do Terminal Rodoviário desativada para substituição do motor brushless. Previsão de normalização: 28/10/2026 às 18h.',
      severity: 'alerta',
      event_type: 'sensor_offline',
      neighborhood: 'Centro',
      street: 'Terminal Rodoviário Central',
      latitude: -22.2168,
      longitude: -49.9535,
      status: 'em_atendimento',
      equipment_id: 8,
      agent_id: null
    },
    {
      title: 'Balança BAL-PES-003 — calibração periódica próxima',
      description: 'Data de calibração semestral das células de carga piezoelétricas agendada para 05/11/2026. Agendamento confirmado com equipe técnica da Toledo do Brasil.',
      severity: 'informativo',
      event_type: 'sensor_offline',
      neighborhood: 'Distrito Industrial',
      street: 'Rodovia SP-294',
      latitude: -22.2031,
      longitude: -49.9723,
      status: 'ativo',
      equipment_id: 5,
      agent_id: null
    },
    {
      title: 'Alarme de segurança — área da Fragata',
      description: 'Câmera CAM-VID-010 detectou movimentação suspeita às 02:47h na Av. Tiradentes. Guarda Municipal acionada para verificação in loco.',
      severity: 'critico',
      event_type: 'alarme_seguranca',
      neighborhood: 'Fragata',
      street: 'Av. Tiradentes',
      latitude: -22.2268,
      longitude: -49.9412,
      status: 'em_atendimento',
      equipment_id: 3,
      agent_id: 2
    },
    {
      title: 'Patinete PAT-ELET-552 — bateria baixa detectada',
      description: 'Sensor IoT do patinete reportou nível de bateria abaixo do limiar mínimo operacional. Recolhimento automático agendado para a base de carregamento.',
      severity: 'informativo',
      event_type: 'sensor_offline',
      neighborhood: 'Cascata',
      street: 'Av. das Esmeraldas',
      latitude: -22.2295,
      longitude: -49.9351,
      status: 'resolvido',
      equipment_id: 7,
      agent_id: null
    },
    {
      title: 'Manutenção agendada — Radar RAD-SEM-002',
      description: 'Radar de semáforo do cruzamento Rua Nove de Julho com Rua Bahia com calibração periódica agendada para 20/11/2026. Sistema operacional até lá.',
      severity: 'informativo',
      event_type: 'sensor_offline',
      neighborhood: 'Alto Cafezal',
      street: 'Rua Nove de Julho',
      latitude: -22.2189,
      longitude: -49.9463,
      status: 'resolvido',
      equipment_id: 2,
      agent_id: null
    }
  ];

  for (const ev of initialEvents) {
    insertEvent.run(ev);
  }
}

module.exports = db;
