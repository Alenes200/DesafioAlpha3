# Assistente de Manutenção

O Assistente de Manutenção é uma aplicação web full-stack projetada para ajudar usuários a gerenciar seus ativos (equipamentos) e agendar/registrar manutenções preventivas e corretivas. Ele fornece alertas para manutenções futuras ou vencidas, garantindo que os equipamentos estejam sempre em bom estado de funcionamento.
![projetofoto1](https://github.com/user-attachments/assets/7dcdb160-b5af-444b-88de-3de03f445a3a)


## Funcionalidades Principais

*   **Autenticação de Usuários:**
    *   Registro de novos usuários.
    *   Login para usuários existentes.
    *   Sessões protegidas usando JSON Web Tokens (JWT).
*   **Gerenciamento de Ativos:**
    *   CRUD (Criar, Ler, Atualizar, Deletar) completo para ativos.
    *   Cada ativo pertence a um usuário específico.
*   **Gerenciamento de Manutenções:**
    *   CRUD completo para registros de manutenção associados a cada ativo.
    *   Campos para serviço realizado, data, descrição detalhada.
    *   Agendamento da próxima manutenção com data e descrição.
*   **Dashboard Intuitivo:**
    *   Exibição de alertas para manutenções vencidas.
    *   Exibição de alertas para manutenções próximas (nos próximos 7 dias).
    *   Listagem visual dos ativos do usuário com acesso rápido às suas manutenções.
*   **Interface Responsiva:**
    *   Construída com Material-UI para uma experiência de usuário agradável em desktops e dispositivos móveis.

## Tecnologias

*   **Frontend:**
    *   React.js
    *   Material-UI (MUI)
*   **Backend:**
    *   Node.js
    *   Express.js
    *   TypeScript
    *   PostgreSQL (como banco de dados)
    *   `pg` (driver PostgreSQL para Node.js)
    *   `jsonwebtoken` (para autenticação baseada em token)


## Configuração e Instalação

### 1. Backend

1.  **Clone o repositório (se ainda não o fez):**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd <NOME_DO_PROJETO>/backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na pasta `backend` 
    ```
    *   **Importante:** `JWT_SECRET` deve ser uma string longa, aleatória e segura em um ambiente de produção.

4.  **Configure o Banco de Dados PostgreSQL:**
    *   Certifique-se de que o PostgreSQL está rodando.
    *   Crie o banco de dados especificado em `DATABASE_URL` (ex: `bancoprojeto`).
    *   Crie o usuário e senha especificados (ex: `user` com senha `123`).
    *   Conecte-se ao seu banco de dados usando `psql` ou uma ferramenta gráfica (como DBeaver, pgAdmin) e execute o script SQL abaixo para criar as tabelas (veja a seção "Esquema do Banco de Dados" para detalhes).

### 2. Frontend

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd ../frontend
    ```
    (Se você estava na pasta `backend`)

2.  **Instale as dependências:**
    (Assumindo que você tem um `package.json` na pasta `frontend` similar ao do backend)
    ```bash
    npm install
    ```
    O frontend está configurado para se conectar ao backend em `http://localhost:3001`. Se o backend rodar em uma porta diferente, ajuste a constante `API_BASE_URL` em `frontend/src/pages/UserDashboard.jsx` e outras chamadas `fetch`.

## Executando a Aplicação

1.  **Backend:**
    Na pasta `backend`:
    ```bash
    npm run dev
    ```
    O servidor backend iniciará na porta especificada no `.env` (padrão: 3001).

2.  **Frontend:**
    Na pasta `frontend`:
    ```bash
    npm run dev
    ```
    (Este comando pode variar dependendo de como seu projeto React foi configurado, e.g., `npm start` para Create React App, `npm run dev` para Vite. Dado o `main.jsx`, provavelmente é Vite).
    A aplicação frontend estará acessível geralmente em `http://localhost:5173` (Vite) ou `http://localhost:3000` (CRA).

### Script SQL para Criação das Tabelas (DDL)

```sql
-- Tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ativos
CREATE TABLE ativos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Manutenções
CREATE TABLE manutencoes (
    id SERIAL PRIMARY KEY,
    ativo_id INTEGER NOT NULL,
    servico VARCHAR(255) NOT NULL,
    data_realizada DATE NOT NULL,
    descricao TEXT,
    proxima_manutencao_data DATE,
    proxima_manutencao_descricao VARCHAR(255),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ativo_id) REFERENCES ativos(id) ON DELETE CASCADE
);
