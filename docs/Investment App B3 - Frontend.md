# Investment App B3 - Frontend

Aplicativo desktop de investimentos na B3 desenvolvido com **Electron**, **React**, **TypeScript** e **Tailwind CSS**.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Arquitetura](#arquitetura)
- [Componentes Principais](#componentes-principais)
- [Gerenciamento de Estado](#gerenciamento-de-estado)
- [API e WebSocket](#api-e-websocket)
- [Otimizações de Performance](#otimizações-de-performance)
- [Testes](#testes)
- [Build e Deploy](#build-e-deploy)

## 🎯 Visão Geral

Este é o frontend de um aplicativo desktop completo para investimentos na B3, oferecendo:

- ✅ **Autenticação segura** com JWT e 2FA
- 📊 **Dashboard em tempo real** com cotações e gráficos
- 💹 **Mesa de operações** com book de ofertas e entrada de ordens
- 📈 **Análise de portfólio** com métricas e performance
- 🔍 **Análise de mercado** com screener e fundamentalista
- ⚙️ **Configurações** de perfil, segurança e preferências

## 🛠 Stack Tecnológica

### Core
- **Electron 28+** - Framework desktop
- **React 18+** - UI library
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server

### Gerenciamento de Estado
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching e caching

### UI e Estilização
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Componentes acessíveis (shadcn/ui)
- **Lucide React** - Ícones

### Formulários e Validação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Gráficos e Tabelas
- **TradingView Lightweight Charts** - Gráficos de candlestick
- **Recharts** - Gráficos de análise
- **TanStack Table** - Tabelas avançadas

### Comunicação
- **Axios** - Cliente HTTP
- **Socket.IO Client** - WebSocket para dados em tempo real

### Roteamento
- **React Router DOM** - Navegação SPA

## 📁 Estrutura do Projeto

\`\`\`
frontend/
├── public/                 # Arquivos públicos estáticos
│   ├── index.html
│   └── assets/
│       ├── icons/
│       └── images/
├── src/
│   ├── main/              # Processo principal do Electron
│   │   ├── main.js
│   │   ├── ipc-handlers.js
│   │   └── window-manager.js
│   ├── preload/           # Scripts de preload
│   │   └── preload.js
│   └── renderer/          # Aplicação React
│       ├── App.jsx
│       ├── index.jsx
│       ├── components/    # Componentes reutilizáveis
│       │   ├── common/    # Botões, Inputs, Modais
│       │   ├── charts/    # Gráficos
│       │   ├── tables/    # Tabelas
│       │   └── widgets/   # Widgets
│       ├── pages/         # Páginas/Telas
│       │   ├── auth/      # Login, Registro
│       │   ├── dashboard/ # Dashboard principal
│       │   ├── trading/   # Mesa de operações
│       │   ├── portfolio/ # Portfólio
│       │   ├── analysis/  # Análise de mercado
│       │   └── settings/  # Configurações
│       ├── services/      # Serviços
│       │   ├── api/       # APIs REST (RTK Query)
│       │   ├── websocket/ # Cliente WebSocket
│       │   └── storage/   # LocalStorage/IndexedDB
│       ├── store/         # Redux Store
│       │   ├── store.js
│       │   ├── slices/    # Slices do Redux
│       │   └── middleware/
│       ├── hooks/         # Custom Hooks
│       ├── utils/         # Utilitários
│       │   ├── formatters.js
│       │   ├── validators.js
│       │   ├── calculations.js
│       │   └── constants.js
│       └── styles/        # Estilos
│           ├── global.css
│           └── themes/
├── package.json
├── vite.config.js
├── tsconfig.json
├── tailwind.config.js
└── README.md
\`\`\`

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Passos

\`\`\`bash
# Clonar o repositório
git clone <repository-url>
cd investment-app/frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar em modo desenvolvimento
npm run electron:dev
\`\`\`

## 📜 Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run electron:dev      # Iniciar Electron + React em modo dev
npm run react:dev         # Apenas React dev server
npm run react:preview     # Preview da build React

# Build
npm run react:build       # Build da aplicação React
npm run electron:build    # Build completo do Electron

# Qualidade de código
npm run lint              # Executar ESLint
npm run lint:fix          # Corrigir problemas do ESLint
npm run type-check        # Verificar tipos TypeScript

# Testes
npm test                  # Executar testes
npm run test:watch        # Testes em modo watch
\`\`\`

## 🏗 Arquitetura

### Processo Principal (Main)

O processo principal do Electron gerencia:
- Criação e gerenciamento de janelas
- Comunicação IPC com o renderer
- Acesso a APIs nativas do sistema operacional

### Processo Renderer (React)

A aplicação React roda no processo renderer e inclui:
- Componentes UI
- Gerenciamento de estado com Redux
- Comunicação com APIs via RTK Query
- WebSocket para dados em tempo real

### Preload Script

Script de segurança que expõe APIs controladas do Electron para o renderer através do `contextBridge`.

## 🧩 Componentes Principais

### Componentes Comuns

- **Button** - Botão com variantes (buy, sell, success, etc)
- **Input** - Input com validação e ícones
- **Modal** - Modal acessível com Radix UI
- **LoadingSpinner** - Indicadores de carregamento

### Componentes de Gráficos

- **CandlestickChart** - Gráfico de candlestick com TradingView
- **LineChart** - Gráfico de linha
- **BarChart** - Gráfico de barras

### Componentes de Tabelas

- **OrderBook** - Book de ofertas em tempo real
- **PortfolioTable** - Tabela de portfólio com TanStack Table
- **TradeHistory** - Histórico de trades

## 🔄 Gerenciamento de Estado

### Redux Slices

- **authSlice** - Autenticação e usuário
- **marketSlice** - Dados de mercado e cotações
- **portfolioSlice** - Posições e performance
- **ordersSlice** - Ordens e histórico

### RTK Query APIs

- **authApi** - Endpoints de autenticação
- **tradingApi** - Endpoints de trading
- **marketApi** - Endpoints de dados de mercado
- **portfolioApi** - Endpoints de portfólio

## 🌐 API e WebSocket

### REST API

Todas as chamadas HTTP são feitas através do RTK Query, com:
- Cache automático
- Invalidação de cache
- Retry automático
- Loading states

### WebSocket

Conexão Socket.IO para dados em tempo real:
- Cotações de ativos
- Atualizações de book de ofertas
- Notificações de ordens
- Atualizações de posições

## ⚡ Otimizações de Performance

### Implementadas

- **Code Splitting** - Lazy loading de rotas
- **Memoização** - React.memo, useMemo, useCallback
- **Debouncing** - Atualizações de busca e filtros

### A Implementar

- **Virtualização** - react-window para listas longas
- **Web Workers** - Cálculos pesados em background
- **Service Workers** - Cache de assets
- **Compression** - Gzip/Brotli para assets

## 🧪 Testes

### Ferramentas

- **Jest** - Framework de testes
- **React Testing Library** - Testes de componentes

### Executar Testes

\`\`\`bash
npm test                  # Executar todos os testes
npm run test:watch        # Modo watch
npm run test:coverage     # Relatório de cobertura
\`\`\`

## 📦 Build e Deploy

### Build de Produção

\`\`\`bash
# Build completo
npm run electron:build

# Arquivos de saída em:
# - dist/ (executáveis)
# - build/ (assets React)
\`\`\`

### Plataformas Suportadas

- **Windows** - NSIS installer
- **macOS** - DMG
- **Linux** - AppImage

## 📝 Variáveis de Ambiente

\`\`\`env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
NODE_ENV=development
\`\`\`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- **Investment App Team**

## 🙏 Agradecimentos

- TradingView por Lightweight Charts
- Radix UI pela biblioteca de componentes
- Vercel pelo Tailwind CSS
- Redux Toolkit pela excelente DX
