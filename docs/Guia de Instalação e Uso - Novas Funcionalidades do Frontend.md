# Guia de Instalação e Uso - Novas Funcionalidades do Frontend

Este guia fornece instruções detalhadas para instalar, configurar e utilizar as novas funcionalidades implementadas no frontend do Investment App B3.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18+ ([Download](https://nodejs.org/))
- **npm** ou **pnpm** (gerenciador de pacotes)
- **Git** para controle de versão

## 🚀 Instalação

### 1. Navegue até o diretório do frontend

```bash
cd investment-app/frontend
```

### 2. Instale as dependências

```bash
npm install
# ou
pnpm install
```

### 3. Verifique as dependências necessárias

As seguintes dependências já estão listadas no `package.json`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "recharts": "^2.10.3",
    "lucide-react": "^0.294.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

## 📁 Arquivos Criados

Os seguintes arquivos foram adicionados ao projeto:

### Componentes

1. **`src/renderer/components/market/MarketTicker.jsx`**
   - Barra de cotações animada

2. **`src/renderer/components/news/NewsFeed.jsx`**
   - Feed de notícias em tempo real

3. **`src/renderer/components/analysis/AnalysisPanel.jsx`**
   - Painel de análise com gráficos e tabelas

4. **`src/renderer/components/trading/StartInvestingButton.jsx`**
   - Botão "Começar a Investir" com modal

5. **`src/renderer/components/common/ThemeToggle.jsx`**
   - Componente de alternância de tema

### Hooks

6. **`src/renderer/hooks/useTheme.js`**
   - Hook personalizado para gerenciamento de tema

### Páginas

7. **`src/renderer/pages/dashboard/MainDashboard.jsx`**
   - Dashboard principal integrado

### Documentação

8. **`frontend/FEATURES.md`**
   - Documentação completa das funcionalidades

## ⚙️ Configuração

### 1. Configurar Tailwind CSS para Tema Escuro

O Tailwind CSS já está configurado para suportar o modo escuro. Certifique-se de que o `tailwind.config.js` inclui:

```javascript
module.exports = {
  darkMode: 'class', // Habilita modo escuro baseado em classe
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 2. Atualizar App.jsx

O arquivo `App.jsx` já foi atualizado para importar e usar o `MainDashboard`:

```jsx
import MainDashboard from '@/pages/dashboard/MainDashboard';

// Na rota /dashboard
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <MainDashboard />
    </ProtectedRoute>
  }
/>
```

### 3. Configurar Alias de Importação

Certifique-se de que o `vite.config.js` ou `tsconfig.json` inclui o alias `@`:

**vite.config.js:**
```javascript
import path from 'path';

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
    },
  },
};
```

## 🎯 Como Usar

### 1. Iniciar o Aplicativo

```bash
npm run dev
# ou
pnpm dev
```

### 2. Acessar o Dashboard

Após fazer login, você será redirecionado para `/dashboard`, onde verá:

- **Barra de cotações animada** no topo
- **Toolbar** com busca, botão "Começar a Investir" e alternância de tema
- **Painel de análise** com gráficos interativos
- **Feed de notícias** na coluna direita

### 3. Alternar Tema

Na toolbar, clique no menu **"Tools"** e depois no botão com ícone de **Sol** (tema claro) ou **Lua** (tema escuro).

O tema será salvo no `localStorage` e aplicado automaticamente nas próximas sessões.

### 4. Começar a Investir

Clique no botão verde **"Começar a Investir"** na toolbar para abrir o modal com opções:

- **Investimento Rápido**: Para compras rápidas
- **Investimento Estratégico**: Para ordens com limite
- **Montar Carteira**: Para criar carteira diversificada

### 5. Explorar Gráficos e Análises

No painel de análise, alterne entre as tabs:

- **Índices**: Visualize IBOVESPA, S&P 500 e NASDAQ
- **Portfólio**: Veja rendimento mensal vs. meta
- **Ações**: Confira top ações da carteira

## 🔧 Personalização

### Adicionar Novos Ativos ao Ticker

Edite `MarketTicker.jsx` e atualize o hook `useMarketData`:

```jsx
const { quotes, loading } = useMarketData([
  'IBOV', 'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'B3SA3', 'MGLU3',
  'WEGE3', // Adicione novos símbolos aqui
]);
```

### Integrar API de Notícias Real

Edite `NewsFeed.jsx` e substitua os dados mockados por chamadas à API:

```jsx
useEffect(() => {
  const fetchNews = async () => {
    try {
      const response = await fetch('https://api.newsapi.org/v2/top-headlines?category=business&country=br&apiKey=YOUR_API_KEY');
      const data = await response.json();
      setNews(data.articles);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    }
  };

  fetchNews();
}, []);
```

### Customizar Cores do Tema

Edite os arquivos de tema:

- **Tema Claro**: `src/renderer/styles/themes/light.css`
- **Tema Escuro**: `src/renderer/styles/themes/dark.css`

Ou use as classes do Tailwind diretamente nos componentes.

## 🐛 Solução de Problemas

### Erro: "Module not found: Can't resolve '@/...'"

**Solução**: Verifique se o alias `@` está configurado corretamente no `vite.config.js` ou `tsconfig.json`.

### Gráficos não aparecem

**Solução**: Certifique-se de que a biblioteca `recharts` está instalada:

```bash
npm install recharts
```

### Tema não muda

**Solução**: Verifique se o `tailwind.config.js` tem `darkMode: 'class'` configurado.

### Animação do ticker não funciona

**Solução**: Certifique-se de que o CSS está sendo aplicado corretamente. Verifique se há conflitos de estilos.

## 📚 Recursos Adicionais

- [Documentação do React](https://react.dev/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contribuição

Para contribuir com melhorias:

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Faça suas alterações
3. Commit: `git commit -m "Adiciona nova funcionalidade"`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT.

---

**Autor**: Manus AI  
**Data**: Janeiro 2025  
**Versão**: 1.0.0

