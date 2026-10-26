const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. ENDPOINTS DE EQUIPAMENTOS
// ==========================================

// Listar todos os equipamentos (com filtros opcionais por tipo, status e manutenção)
app.get('/api/equipments', (req, res) => {
  try {
    const { type, status, maintenance_need, search } = req.query;
    let query = 'SELECT * FROM equipments WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (maintenance_need) {
      query += ' AND maintenance_need = ?';
      params.push(maintenance_need);
    }
    if (search) {
      query += ` AND (
        serial_number LIKE ? OR
        brand LIKE ? OR
        model LIKE ? OR
        street LIKE ? OR
        neighborhood LIKE ? OR
        reference LIKE ?
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }

    query += ' ORDER BY id DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    // Converte custom_properties de volta para JSON object
    const result = rows.map(r => ({
      ...r,
      custom_properties: r.custom_properties ? JSON.parse(r.custom_properties) : {}
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar equipamentos', details: err.message });
  }
});

// Buscar equipamento por ID
app.get('/api/equipments/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM equipments WHERE id = ?');
    const eq = stmt.get(req.params.id);
    if (!eq) return res.status(404).json({ error: 'Equipamento não encontrado' });

    eq.custom_properties = eq.custom_properties ? JSON.parse(eq.custom_properties) : {};
    res.json(eq);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar equipamento', details: err.message });
  }
});

// Cadastrar novo equipamento
app.post('/api/equipments', (req, res) => {
  try {
    const {
      serial_number, type, brand, model,
      cep, neighborhood, city, state, street, reference, latitude, longitude,
      status, maintenance_need, next_maintenance_date, maintenance_notes,
      custom_properties
    } = req.body;

    if (!serial_number || !type || !brand || !model || !street || latitude === undefined || longitude === undefined || !status || !maintenance_need) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const stmt = db.prepare(`
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

    const info = stmt.run({
      serial_number,
      type,
      brand,
      model,
      cep: cep || '',
      neighborhood: neighborhood || '',
      city: city || 'Marília',
      state: state || 'SP',
      street,
      reference: reference || '',
      latitude: Number(latitude),
      longitude: Number(longitude),
      status,
      maintenance_need,
      next_maintenance_date: next_maintenance_date || null,
      maintenance_notes: maintenance_notes || '',
      custom_properties: typeof custom_properties === 'object' ? JSON.stringify(custom_properties) : (custom_properties || '{}')
    });

    res.status(201).json({ id: info.lastInsertRowid, message: 'Equipamento cadastrado com sucesso' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: equipments.serial_number')) {
      return res.status(400).json({ error: 'Número de série já cadastrado no sistema PROMETHEUS.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar equipamento', details: err.message });
  }
});

// Atualizar equipamento existente
app.put('/api/equipments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      serial_number, type, brand, model,
      cep, neighborhood, city, state, street, reference, latitude, longitude,
      status, maintenance_need, next_maintenance_date, maintenance_notes,
      custom_properties
    } = req.body;

    const stmt = db.prepare(`
      UPDATE equipments SET
        serial_number = @serial_number,
        type = @type,
        brand = @brand,
        model = @model,
        cep = @cep,
        neighborhood = @neighborhood,
        city = @city,
        state = @state,
        street = @street,
        reference = @reference,
        latitude = @latitude,
        longitude = @longitude,
        status = @status,
        maintenance_need = @maintenance_need,
        next_maintenance_date = @next_maintenance_date,
        maintenance_notes = @maintenance_notes,
        custom_properties = @custom_properties,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    const result = stmt.run({
      id,
      serial_number,
      type,
      brand,
      model,
      cep,
      neighborhood,
      city,
      state,
      street,
      reference,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status,
      maintenance_need,
      next_maintenance_date: next_maintenance_date || null,
      maintenance_notes: maintenance_notes || '',
      custom_properties: typeof custom_properties === 'object' ? JSON.stringify(custom_properties) : (custom_properties || '{}')
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado para atualização' });
    }

    res.json({ message: 'Equipamento atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar equipamento', details: err.message });
  }
});

// Remover equipamento
app.delete('/api/equipments/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM equipments WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json({ message: 'Equipamento removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover equipamento', details: err.message });
  }
});

// ==========================================
// 2. ENDPOINTS DE AGENTES DE MOBILIDADE E SEGURANÇA
// ==========================================

// Listar todos os agentes
app.get('/api/agents', (req, res) => {
  try {
    const { role, status } = req.query;
    let query = `
      SELECT a.*, e.serial_number as assigned_serial, e.type as assigned_type, e.model as assigned_model
      FROM agents a
      LEFT JOIN equipments e ON a.assigned_equipment_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ' AND a.role = ?';
      params.push(role);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.id ASC';

    const agents = db.prepare(query).all(...params);
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar agentes', details: err.message });
  }
});

// Cadastrar novo agente
app.post('/api/agents', (req, res) => {
  try {
    const { badge_number, name, role, department, phone_radio, status, assigned_equipment_id, latitude, longitude } = req.body;

    if (!badge_number || !name || !role || !status) {
      return res.status(400).json({ error: 'Matrícula, nome, função e status são obrigatórios' });
    }

    const stmt = db.prepare(`
      INSERT INTO agents (
        badge_number, name, role, department, phone_radio, status, assigned_equipment_id, latitude, longitude
      ) VALUES (
        @badge_number, @name, @role, @department, @phone_radio, @status, @assigned_equipment_id, @latitude, @longitude
      )
    `);

    const info = stmt.run({
      badge_number,
      name,
      role,
      department: department || '',
      phone_radio: phone_radio || '',
      status,
      assigned_equipment_id: assigned_equipment_id ? Number(assigned_equipment_id) : null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null
    });

    res.status(201).json({ id: info.lastInsertRowid, message: 'Agente cadastrado com sucesso no F.O.G.O.' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: agents.badge_number')) {
      return res.status(400).json({ error: 'Matrícula já cadastrada para outro agente.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar agente', details: err.message });
  }
});

// Atualizar agente
app.put('/api/agents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { badge_number, name, role, department, phone_radio, status, assigned_equipment_id, latitude, longitude } = req.body;

    const stmt = db.prepare(`
      UPDATE agents SET
        badge_number = @badge_number,
        name = @name,
        role = @role,
        department = @department,
        phone_radio = @phone_radio,
        status = @status,
        assigned_equipment_id = @assigned_equipment_id,
        latitude = @latitude,
        longitude = @longitude
      WHERE id = @id
    `);

    const result = stmt.run({
      id,
      badge_number,
      name,
      role,
      department: department || '',
      phone_radio: phone_radio || '',
      status,
      assigned_equipment_id: assigned_equipment_id ? Number(assigned_equipment_id) : null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null
    });

    if (result.changes === 0) return res.status(404).json({ error: 'Agente não encontrado' });
    res.json({ message: 'Agente atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar agente', details: err.message });
  }
});

// Remover agente
app.delete('/api/agents/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM agents WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Agente não encontrado' });
    res.json({ message: 'Agente removido' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover agente', details: err.message });
  }
});

// ==========================================
// 3. TELEMETRIA E ESTATÍSTICAS PARA O DASHBOARD (PROMETHEUS ENGINE)
// ==========================================
app.get('/api/analytics/summary', (req, res) => {
  try {
    const totalEquipments = db.prepare('SELECT COUNT(*) as count FROM equipments').get().count;
    const operational = db.prepare("SELECT COUNT(*) as count FROM equipments WHERE status = 'operacional'").get().count;
    const malfunction = db.prepare("SELECT COUNT(*) as count FROM equipments WHERE status = 'mau_funcionamento'").get().count;
    const stolen = db.prepare("SELECT COUNT(*) as count FROM equipments WHERE status = 'furtado'").get().count;
    const urgentMaintenance = db.prepare("SELECT COUNT(*) as count FROM equipments WHERE maintenance_need = 'imediata'").get().count;
    const scheduledMaintenance = db.prepare("SELECT COUNT(*) as count FROM equipments WHERE maintenance_need = 'agendada_periodica'").get().count;
    
    const byType = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM equipments 
      GROUP BY type 
      ORDER BY count DESC
    `).all();

    const totalAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;
    const agentsOnPatrol = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'em_patrulha'").get().count;

    res.json({
      totalEquipments,
      operational,
      malfunction,
      stolen,
      urgentMaintenance,
      scheduledMaintenance,
      byType,
      totalAgents,
      agentsOnPatrol,
      prometheusHealthScore: Math.round(((operational) / (totalEquipments || 1)) * 100)
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao calcular telemetria', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[F.O.G.O. BACKEND CORE] Servidor PROMETHEUS ativo na porta ${PORT}`);
});
