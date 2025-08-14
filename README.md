# Juristream - Sistema de Controle Financeiro Jurídico

Um sistema de gestão financeira para escritórios de advocacia, focado no controle de clientes, contratos e acordos financeiros.

## Funcionalidades Principais

- **Controle Financeiro** - Página principal para gestão financeira completa
- **Gestão de Clientes** - Cadastro e acompanhamento de clientes
- **Contratos** - Gerenciamento de contratos e honorários
- **Acordos com Devedores** - Controle de parcelamentos e pagamentos
- **Assistente de IA** - Chat inteligente para consultas sobre a plataforma
- **Relatórios** - Análises e relatórios financeiros
- **Painel de Controle** - Visão geral do sistema

## Mudanças Recentes

Este protótipo foi refocado para ser um **Sistema de Controle Financeiro**, removendo as funcionalidades de:
- Processos jurídicos (CasesPage)
- Tarefas e prazos (TasksPage)
- Agenda/calendário (AgendaPage)

O foco agora é exclusivamente no **controle financeiro de clientes e contratos**.

## Configuração do Assistente de IA

Para ativar o assistente de IA, configure a variável de ambiente:
```bash
OPENROUTER_API_KEY=sua_chave_aqui
```

Sem a chave, o sistema funcionará com respostas mock do assistente.

## Como Executar

**Pré-requisitos:** Node.js

1. Instale as dependências:
   ```bash
   npm install
   ```

2. (Opcional) Configure a chave da API de IA no arquivo `.env.local`:
   ```bash
   OPENROUTER_API_KEY=sua_chave_openrouter
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:5173` - você será redirecionado automaticamente para `/financeiro`

## Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hot Toast
- OpenRouter API (para IA)

## Estrutura do Sistema

- **Rota Principal**: `/financeiro` (Controle Financeiro)
- **Navegação**: Focada em funcionalidades financeiras
- **Design**: Interface limpa e moderna com foco em usabilidade

## Navegação Atualizada

1. **Controle Financeiro** (`/financeiro`) - Página principal
2. **Clientes** (`/clientes`) - Gestão de clientes
3. **Contratos** (`/contratos`) - Gestão de contratos
4. **Painel de Controle** (`/dashboard`) - Visão geral
5. **Assistente AI** (`/ai-assistant`) - Chat inteligente
6. **Relatórios** (`/relatorios`) - Análises e relatórios
