# PROMETHEUS // PROJETO F.O.G.O.
### Ferramenta Onisciente de Gestão e Operações Urbanas
> **Desafio DSIN CODER — Etapa Bônus**  
> *Data de Criação:* 26 de Outubro de 2026  
> *Ambiente de Desenvolvimento:* Windows | Local

---

## 📖 1. Contexto Geral da Missão

A Inteligência Artificial **PROMETHEUS** assumiu sistemas críticos de trânsito, mobilidade e segurança da cidade. O controle total dos sistemas só será devolvido à humanidade quando operadores demonstrarem capacidade de raciocínio lógico, arquitetura de sistemas e domínio técnico sobre soluções complexas sem depender de respostas prontas.

Para colocar a gestão das operações urbanas em outro patamar, foi concebido o **Projeto F.O.G.O.** (*Ferramenta Onisciente de Gestão e Operações*), dividido em 3 etapas incrementais:
1. **1ª Parte:** Inventário Inteligente da Cidade (Equipamentos IoT e Agentes de Campo) — **[CONCLUÍDA]**
2. **2ª Parte:** *(Aguardando enunciado/especificação)*
3. **3ª Parte:** *(Aguardando enunciado/especificação)*

---

## 🎯 2. O que foi Desenvolvido na 1ª Parte

### 2.1. Inventário Inteligente de Equipamentos IoT
Catalogação e monitoramento de equipamentos urbanos com foco em telemetria:
- **Tipos Suportados:**
  - Radares de fiscalização (velocidade com limite em km/h, semáforo, conversão proibida);
  - Câmeras de videomonitoramento (resolução 4K/Full HD, visão noturna, reconhecimento de placas);
  - Balanças de caminhão (pesagem dinâmica em movimento - WIM);
  - Veículos autônomos de fiscalização de estacionamento rotativo (nível de bateria, sensores LiDAR);
  - Totens de autoatendimento para estacionamento (alimentação solar, pagamentos via Pix/NFC);
  - Patinetes elétricos públicos e compartilhados (limite de geofence, autonomia);
  - Cancelas automatizadas (terminais rodoviários);
  - Viaturas e motos operacionais (Guarda Municipal, Polícia Militar, Agentes de Trânsito).
- **Identificação Completa:** Número de série único, fabricante/marca e modelo técnico.
- **Localização Urbana Precisa:** Logradouro, referências urbanas (*"oposto ao 181"*, *"KM 203"*, *"em frente ao Mercado do Tio"*), bairro, CEP, município/UF e **coordenadas geográficas (Latitude e Longitude GPS)**.
- **Situação Operacional:** `Operacional`, `Mau Funcionamento`, `Ainda Não Instalado`, `Desativado`, `Furtado / Vandalizado`.
- **Gestão de Manutenções:**
  - Classificação por urgência: `Nenhuma`, `Imediata` (urgente/falha), `Agendada / Periódica`;
  - Data da próxima manutenção programada;
  - Campo de diagnóstico e notas de intervenção técnica.
- **Propriedades Dinâmicas (IoT):** Armazenamento em formato JSON flexível para acomodar particularidades técnicas específicas de cada equipamento.

### 2.2. Integração de Agentes Humanos de Segurança e Mobilidade
- Cadastro de profissionais de campo: Agentes de Trânsito, Guardas Municipais e Policiais Militares.
- Matrícula/ID funcional, corporação, canais de rádio/comunicação, status em tempo real (`Em patrulha`, `Em atendimento`, `Disponível`, `Folga`) e vinculação a equipamentos/viaturas monitorados.

### 2.3. Painel de Controle e Mapa Tático
- Interface com identidade visual futurista PROMETHEUS (Dark Mode tático com detalhes em neon âmbar/laranja);
- Mapa com OpenStreetMap e Leaflet para localização espacial de cada equipamento e agente ativo;
- Filtros por tipo, status e manutenção, busca textual e cálculo dinâmico do **Índice de Saúde Operacional da Rede**.

---

## 📂 3. Estrutura de Pastas e Arquivos Locais

O projeto reside integralmente em ambiente local, sem afetar o sistema operacional global:

```
C:\Users\Matheus\Documents\DSIN-CODER\fogo-app\
│
├── iniciar-fogo.bat             <- Script para iniciar Backend e Frontend com 1 clique
├── CONTEXTO_DO_PROJETO.md       <- Este documento de contexto e arquitetura
│
├── server/                      <- Backend (Node.js + Express + SQLite)
│   ├── package.json             <- Dependências locais do servidor
│   ├── db.js                    <- Definição do banco SQLite e carga de dados de exemplo
│   ├── index.js                 <- API REST com endpoints de equipamentos, agentes e métricas
│   ├── fogo.db                  <- Arquivo do banco de dados relacional SQLite
│   └── node_modules/            <- Bibliotecas instaladas localmente para a API
│
└── client/                      <- Frontend (React + Vite + Tailwind CSS + Leaflet)
    ├── package.json             <- Dependências locais da interface
    ├── vite.config.js           <- Configuração do bundler Vite com proxy para a API
    ├── src/
    │   ├── App.jsx              <- Dashboard tático, catálogo, mapa GPS e formulários
    │   ├── index.css            <- Estilização global com Tailwind e Leaflet CSS
    │   └── main.jsx             <- Ponto de entrada da aplicação React
    └── node_modules/            <- Bibliotecas instaladas localmente para o Frontend
```

---

## 🛠️ 4. Tecnologias Utilizadas

| Camada | Tecnologia | Motivação |
|---|---|---|
| **Linguagem** | JavaScript (Node.js / React) | Ecossistema maduro, alta produtividade e performance |
| **Backend** | Express.js | API REST leve, clara e de baixa complexidade |
| **Banco de Dados** | SQLite (`better-sqlite3`) | Banco de dados relacional embarcado em arquivo local, rápido e sem dependência de serviços externos |
| **Frontend** | React 19 + Vite | Renderização ágil e componentização modular |
| **Estilização** | Tailwind CSS v4 | Design responsivo com estética de centro de comando de tráfego |
| **Geolocalização** | Leaflet + React-Leaflet | Visualização espacial de sensores e patrulhas sobre mapa interativo |
| **Ícones** | Lucide React | Simbologia de alta legibilidade para IoT e infraestrutura urbana |

---

## 🚀 5. Como Executar o Projeto

1. Abra a pasta `C:\Users\Matheus\Documents\DSIN-CODER\fogo-app`
2. Dê dois cliques no arquivo **`iniciar-fogo.bat`** (ele abrirá as janelas do servidor e do cliente automaticamente).
3. Acesse a aplicação no navegador:
   - **Interface Web:** [http://localhost:5173/](http://localhost:5173/)
   - **API REST (JSON):** [http://localhost:3001/api/equipments](http://localhost:3001/api/equipments)

---

## 📍 6. Próximos Passos
- Aguardando o envio das diretrizes da **2ª Parte** do Desafio F.O.G.O. para dar continuidade à evolução do sistema.
