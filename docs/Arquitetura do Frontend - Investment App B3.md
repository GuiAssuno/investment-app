# Arquitetura do Frontend - Investment App B3

**Autor:** Manus AI  
**Data:** 13 de outubro de 2025  
**Versão:** 1.0

## Sumário Executivo

Este documento descreve a arquitetura completa do frontend do **Investment App B3**, um aplicativo desktop desenvolvido com **Electron**, **React** e **TypeScript**. A arquitetura foi projetada para oferecer alta performance, escalabilidade e uma experiência de usuário excepcional para operações de investimento em tempo real.

O sistema utiliza uma arquitetura moderna baseada em componentes reutilizáveis, gerenciamento de estado centralizado com Redux Toolkit, comunicação em tempo real via WebSocket e otimizações de performance para lidar com grandes volumes de dados financeiros.

## 1. Visão Geral da Arquitetura

### 1.1 Modelo de Processos do Electron

O Electron utiliza uma arquitetura multi-processo que separa responsabilidades entre o processo principal e os processos renderer. Esta separação garante segurança e estabilidade da aplicação.

**Processo Principal (Main Process)**

O processo principal é responsável por gerenciar o ciclo de vida da aplicação, criar janelas do navegador e lidar com eventos do sistema operacional. No Investment App, o processo principal implementa:

- Gerenciamento de janelas através do `WindowManager`
- Handlers IPC para comunicação segura com o renderer
- Acesso a APIs nativas do sistema operacional
- Gerenciamento de atualizações automáticas
- Controle de notificações do sistema

**Processo Renderer (Renderer Process)**

Cada janela do Electron executa um processo renderer separado que hospeda a aplicação React. O processo renderer é isolado do sistema operacional por razões de segurança e só pode acessar APIs nativas através do preload script.

**Preload Script**

O preload script atua como uma ponte segura entre o processo principal e o renderer. Ele expõe uma API controlada através do `contextBridge`, permitindo que a aplicação React acesse funcionalidades do Electron sem comprometer a segurança.

### 1.2 Arquitetura da Aplicação React

A aplicação React segue uma arquitetura em camadas que separa claramente as responsabilidades:

**Camada de Apresentação (Components)**

Componentes React reutilizáveis organizados em categorias funcionais: common (componentes básicos), charts (gráficos), tables (tabelas) e widgets (componentes especializados). Todos os componentes seguem princípios de design atômico e são totalmente tipados com TypeScript.

**Camada de Lógica de Negócio (Hooks e Utils)**

Custom hooks encapsulam lógica complexa e efeitos colaterais, enquanto utilitários fornecem funções puras para formatação, validação e cálculos financeiros. Esta camada garante que a lógica de negócio seja testável e reutilizável.

**Camada de Gerenciamento de Estado (Redux)**

Redux Toolkit gerencia o estado global da aplicação através de slices especializados. RTK Query fornece cache automático e sincronização de dados com o backend. A camada de estado é completamente tipada e oferece selectors otimizados.

**Camada de Serviços (Services)**

Serviços encapsulam toda a comunicação externa: APIs REST através do Axios e RTK Query, WebSocket através do Socket.IO Client, e armazenamento local através de localStorage e IndexedDB.

## 2. Estrutura de Diretórios

A estrutura de diretórios foi projetada para maximizar a manutenibilidade e facilitar o desenvolvimento em equipe. Cada diretório tem uma responsabilidade clara e bem definida.

### 2.1 Diretório `src/main/`

Contém o código do processo principal do Electron:

- **main.js**: Ponto de entrada da aplicação, gerencia o ciclo de vida e cria a janela principal
- **ipc-handlers.js**: Define handlers para comunicação IPC entre main e renderer
- **window-manager.js**: Classe responsável por criar e gerenciar janelas

### 2.2 Diretório `src/preload/`

Contém o script de preload que expõe APIs seguras:

- **preload.js**: Expõe APIs do Electron através do contextBridge de forma controlada

### 2.3 Diretório `src/renderer/`

Contém toda a aplicação React:

**components/**: Componentes reutilizáveis organizados por categoria
- `common/`: Componentes básicos (Button, Input, Modal, LoadingSpinner)
- `charts/`: Componentes de gráficos (CandlestickChart, LineChart, BarChart)
- `tables/`: Componentes de tabelas (OrderBook, PortfolioTable, TradeHistory)
- `widgets/`: Widgets especializados (NewsPanel, TickerTape, AlertsWidget)

**pages/**: Páginas completas da aplicação
- `auth/`: Páginas de autenticação (Login, Register, KYC)
- `dashboard/`: Dashboard principal e visões gerais
- `trading/`: Mesa de operações e entrada de ordens
- `portfolio/`: Gerenciamento de portfólio e análise
- `analysis/`: Análise de mercado e screener
- `settings/`: Configurações do usuário

**services/**: Serviços de comunicação
- `api/`: APIs REST com RTK Query
- `websocket/`: Cliente WebSocket para dados em tempo real
- `storage/`: Gerenciamento de armazenamento local

**store/**: Gerenciamento de estado Redux
- `store.js`: Configuração da store
- `slices/`: Slices do Redux para diferentes domínios
- `middleware/`: Middleware customizado (WebSocket)

**hooks/**: Custom hooks React
- Hooks para WebSocket, dados de mercado, portfólio e order book

**utils/**: Funções utilitárias
- `formatters.js`: Formatação de valores financeiros
- `validators.js`: Validação com Zod
- `calculations.js`: Cálculos financeiros e indicadores técnicos
- `constants.js`: Constantes da aplicação

**styles/**: Estilos globais e temas
- `global.css`: Estilos base com Tailwind
- `themes/`: Temas claro e escuro

## 3. Gerenciamento de Estado

### 3.1 Redux Toolkit

O Redux Toolkit foi escolhido por oferecer uma API moderna e simplificada para gerenciamento de estado, com recursos como imutabilidade automática através do Immer e serialização otimizada.

**Slices Principais**

A aplicação utiliza quatro slices principais, cada um responsável por um domínio específico:

**authSlice**: Gerencia autenticação e dados do usuário. Armazena token JWT, informações do usuário e estado de autenticação. Fornece actions para login, logout e atualização de perfil.

**marketSlice**: Gerencia dados de mercado em tempo real. Armazena cotações, book de ofertas, watchlist e configurações de visualização. Atualizado continuamente via WebSocket.

**portfolioSlice**: Gerencia posições e performance do portfólio. Calcula automaticamente métricas como valor total, P&L e alocação de ativos.

**ordersSlice**: Gerencia ordens abertas e histórico. Separa automaticamente ordens pendentes de ordens finalizadas e fornece filtros por símbolo.

### 3.2 RTK Query

RTK Query fornece uma camada de cache e sincronização de dados extremamente eficiente. Cada API é definida como um serviço separado:

**authApi**: Endpoints de autenticação, perfil e segurança. Implementa refresh automático de tokens e invalidação de cache ao fazer logout.

**tradingApi**: Endpoints para criação, modificação e cancelamento de ordens. Valida ordens antes do envio e fornece limites de trading.

**marketApi**: Endpoints para cotações, dados históricos, notícias e fundamentalista. Implementa polling automático para dados em tempo real.

**portfolioApi**: Endpoints para posições, performance, dividendos e relatórios. Calcula métricas de diversificação e risco.

### 3.3 Middleware WebSocket

O middleware WebSocket intercepta ações específicas e processa mensagens em tempo real. Ele:

- Conecta automaticamente ao servidor quando o usuário faz login
- Reconecta automaticamente em caso de desconexão
- Distribui mensagens recebidas para os slices apropriados
- Implementa heartbeat para detectar conexões inativas
- Gerencia inscrições e cancelamentos de canais

## 4. Comunicação com Backend

### 4.1 REST API

Todas as requisições HTTP são feitas através do Axios, com interceptors que adicionam automaticamente o token de autenticação e tratam erros comuns.

**Interceptor de Requisição**

Adiciona o token JWT no header Authorization de todas as requisições. Em desenvolvimento, registra logs detalhados de cada requisição.

**Interceptor de Resposta**

Trata erros HTTP comuns: redireciona para login em caso de 401 (não autorizado), exibe mensagens apropriadas para 403 (proibido) e 500 (erro interno do servidor).

**Retry Automático**

Implementa retry exponencial para requisições que falham devido a problemas de rede. Tenta até 3 vezes com delay crescente entre tentativas.

### 4.2 WebSocket

O cliente WebSocket é implementado com Socket.IO Client e fornece comunicação bidirecional em tempo real.

**Eventos Principais**

- `quote_update`: Atualização de cotação de um ativo
- `orderbook_update`: Atualização do book de ofertas
- `order_update`: Atualização de status de ordem
- `position_update`: Atualização de posição no portfólio

**Gerenciamento de Conexão**

O cliente implementa reconexão automática com backoff exponencial, heartbeat para detectar conexões inativas e gerenciamento de inscrições por canal.

## 5. Componentes Principais

### 5.1 Componentes Comuns

**Button**

Componente de botão altamente customizável com variantes específicas para trading (buy, sell) e estados de loading. Implementado com class-variance-authority para gerenciamento eficiente de variantes.

**Input**

Campo de entrada com suporte a validação, ícones, mensagens de erro e helper text. Totalmente acessível e compatível com React Hook Form.

**Modal**

Modal acessível implementado com Radix UI Dialog. Suporta animações de entrada/saída e trap de foco para acessibilidade.

**LoadingSpinner**

Indicador de carregamento com múltiplos tamanhos e suporte a texto. Inclui variantes LoadingOverlay e LoadingPage para diferentes contextos.

### 5.2 Componentes de Gráficos

**CandlestickChart**

Gráfico de candlestick implementado com TradingView Lightweight Charts. Suporta múltiplos intervalos de tempo, indicadores técnicos e personalização completa de cores e estilos. Otimizado para renderização de grandes volumes de dados.

**LineChart e BarChart**

Gráficos de linha e barra implementados com Recharts. Utilizados para visualização de performance, alocação de ativos e métricas de portfólio.

### 5.3 Componentes de Tabelas

**OrderBook**

Exibe o book de ofertas em tempo real com barras de volume proporcionais. Atualizado via WebSocket com debouncing para evitar re-renders excessivos. Calcula e exibe o spread entre melhor compra e venda.

**PortfolioTable**

Tabela avançada implementada com TanStack Table. Suporta ordenação, filtragem global, paginação e seleção de linhas. Calcula automaticamente métricas de P&L e alocação.

## 6. Otimizações de Performance

### 6.1 Otimizações Implementadas

**Code Splitting**

Rotas são carregadas de forma lazy com React.lazy e Suspense, reduzindo o tamanho do bundle inicial e melhorando o tempo de carregamento.

**Memoização**

Componentes pesados são memoizados com React.memo. Cálculos complexos utilizam useMemo e callbacks são estabilizados com useCallback.

**Debouncing**

Atualizações de busca, filtros e WebSocket são debounced para evitar re-renders excessivos e melhorar a responsividade.

### 6.2 Otimizações Planejadas

**Virtualização de Listas**

Implementar react-window ou react-virtual para tabelas longas de ordens e posições, renderizando apenas os itens visíveis.

**Web Workers**

Mover cálculos de indicadores técnicos e análises complexas para Web Workers, liberando a thread principal.

**Service Workers**

Implementar cache de assets estáticos e dados de mercado para funcionamento offline parcial.

**Compression**

Habilitar compressão Gzip/Brotli para todos os assets estáticos, reduzindo o tamanho de transferência.

## 7. Segurança

### 7.1 Isolamento de Contexto

O Electron é configurado com `contextIsolation: true` e `nodeIntegration: false`, garantindo que o código do renderer não tenha acesso direto às APIs do Node.js.

### 7.2 Preload Script Seguro

Apenas APIs específicas e controladas são expostas através do contextBridge. Nenhuma API perigosa é exposta diretamente.

### 7.3 Content Security Policy

Headers CSP são configurados para prevenir ataques XSS e injection. Apenas scripts e estilos de origens confiáveis são permitidos.

### 7.4 Validação de Dados

Todos os dados de entrada são validados com Zod antes de serem enviados ao backend. Validação client-side e server-side garantem integridade dos dados.

## 8. Testes

### 8.1 Estratégia de Testes

A aplicação implementa uma estratégia de testes em três níveis:

**Testes Unitários**: Testam funções utilitárias, formatadores, validadores e cálculos financeiros isoladamente.

**Testes de Componentes**: Testam componentes React com React Testing Library, verificando renderização, interações e estados.

**Testes de Integração**: Testam fluxos completos como login, criação de ordens e atualização de portfólio.

### 8.2 Ferramentas

- **Jest**: Framework de testes com suporte a mocks e snapshots
- **React Testing Library**: Testes de componentes focados em comportamento do usuário
- **MSW (Mock Service Worker)**: Mock de APIs para testes de integração

## 9. Build e Deploy

### 9.1 Processo de Build

O processo de build é dividido em duas etapas:

**Build React**: Vite compila a aplicação React em assets otimizados (HTML, CSS, JS) com code splitting automático.

**Build Electron**: electron-builder empacota a aplicação com o runtime do Electron para as plataformas alvo.

### 9.2 Plataformas Suportadas

- **Windows**: Instalador NSIS com auto-update
- **macOS**: DMG com assinatura de código
- **Linux**: AppImage universal

### 9.3 Auto-Update

Implementado com electron-updater para verificar e instalar atualizações automaticamente. Suporta canais stable, beta e alpha.

## 10. Próximos Passos

### 10.1 Funcionalidades Planejadas

- Implementação completa de todos os gráficos e indicadores técnicos
- Sistema de alertas com notificações push
- Modo offline com sincronização posterior
- Suporte a múltiplas contas
- Exportação de relatórios em PDF

### 10.2 Melhorias de Performance

- Virtualização de todas as tabelas longas
- Web Workers para cálculos pesados
- Service Workers para cache avançado
- Otimização de bundle size

### 10.3 Melhorias de UX

- Onboarding interativo para novos usuários
- Tutoriais contextuais
- Atalhos de teclado customizáveis
- Layouts personalizáveis com drag-and-drop

## Conclusão

A arquitetura do Investment App B3 foi projetada para oferecer uma base sólida, escalável e de alta performance para um aplicativo de investimentos profissional. A separação clara de responsabilidades, o uso de tecnologias modernas e as otimizações implementadas garantem uma experiência de usuário excepcional mesmo com grandes volumes de dados em tempo real.

A estrutura modular facilita a manutenção e evolução do código, enquanto o sistema de tipos do TypeScript e a validação com Zod garantem robustez e confiabilidade. O projeto está preparado para crescer e incorporar novas funcionalidades conforme as necessidades do negócio evoluem.
