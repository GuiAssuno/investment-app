# Guia de Desenvolvimento - Investment App B3

**Autor:** Manus AI  
**Data:** 13 de outubro de 2025

## Introdução

Este guia fornece informações essenciais para desenvolvedores que trabalharão no projeto Investment App B3. Ele cobre convenções de código, fluxos de trabalho, boas práticas e dicas para desenvolvimento eficiente.

## Configuração do Ambiente

### Requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18 ou superior
- **npm** versão 9 ou superior (ou yarn/pnpm)
- **Git** para controle de versão
- **VSCode** (recomendado) com as extensões sugeridas

### Extensões Recomendadas para VSCode

Instale as seguintes extensões para melhor experiência de desenvolvimento:

- **ESLint**: Linting de código JavaScript/TypeScript
- **Prettier**: Formatação automática de código
- **Tailwind CSS IntelliSense**: Autocomplete para classes Tailwind
- **TypeScript Vue Plugin (Volar)**: Suporte TypeScript aprimorado
- **GitLens**: Visualização avançada de Git
- **Error Lens**: Exibição inline de erros
- **Auto Rename Tag**: Renomear tags HTML automaticamente

### Configuração Inicial

Clone o repositório e instale as dependências:

\`\`\`bash
git clone <repository-url>
cd investment-app/frontend
npm install
\`\`\`

Configure as variáveis de ambiente:

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo `.env` com as configurações apropriadas para seu ambiente de desenvolvimento.

### Iniciar Desenvolvimento

Para iniciar o ambiente de desenvolvimento:

\`\`\`bash
npm run electron:dev
\`\`\`

Este comando inicia simultaneamente:
- Servidor de desenvolvimento Vite na porta 3000
- Aplicação Electron conectada ao servidor

## Convenções de Código

### Nomenclatura

**Arquivos e Diretórios**

- Componentes React: PascalCase (ex: `Button.jsx`, `OrderBook.jsx`)
- Utilitários e hooks: camelCase (ex: `formatters.js`, `useWebSocket.js`)
- Páginas: PascalCase (ex: `Dashboard.jsx`, `Login.jsx`)
- Diretórios: kebab-case ou camelCase (ex: `common/`, `auth/`)

**Variáveis e Funções**

- Variáveis: camelCase (ex: `userName`, `totalValue`)
- Constantes: UPPER_SNAKE_CASE (ex: `API_CONFIG`, `MARKET_STATUS`)
- Funções: camelCase (ex: `calculatePnL`, `formatCurrency`)
- Componentes: PascalCase (ex: `Button`, `CandlestickChart`)

**Redux**

- Actions: camelCase (ex: `setCredentials`, `updateQuote`)
- Selectors: prefixo `select` + PascalCase (ex: `selectCurrentUser`, `selectQuotes`)
- Slices: sufixo `Slice` (ex: `authSlice`, `marketSlice`)

### Estrutura de Componentes

Siga esta estrutura padrão para componentes React:

\`\`\`jsx
import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

/**
 * Descrição do componente
 * 
 * @param {Object} props - Props do componente
 * @param {string} props.className - Classes CSS adicionais
 */
const ComponentName = ({ className, ...props }) => {
  // 1. Hooks
  const [state, setState] = React.useState(null);
  
  // 2. Callbacks
  const handleClick = React.useCallback(() => {
    // lógica
  }, []);
  
  // 3. Effects
  React.useEffect(() => {
    // efeito
  }, []);
  
  // 4. Render
  return (
    <div className={cn('base-classes', className)}>
      {/* conteúdo */}
    </div>
  );
};

ComponentName.propTypes = {
  className: PropTypes.string,
};

export default ComponentName;
\`\`\`

### TypeScript

Embora o projeto use principalmente JSX, ao adicionar TypeScript:

- Sempre defina tipos para props de componentes
- Use interfaces para objetos complexos
- Evite `any`, prefira `unknown` quando o tipo for realmente desconhecido
- Use type guards para narrowing de tipos

### Estilos com Tailwind

**Boas Práticas**

- Use classes utilitárias do Tailwind sempre que possível
- Para componentes reutilizáveis, use `cn()` para merge de classes
- Evite estilos inline, prefira classes Tailwind
- Use as cores do tema definidas em `tailwind.config.js`

**Classes Customizadas**

Para estilos específicos de trading, use as classes customizadas:

\`\`\`jsx
<div className="trading-card">
  <span className="price-up">+5.2%</span>
  <span className="price-down">-2.1%</span>
</div>
\`\`\`

## Fluxo de Trabalho

### Git Workflow

Siga o GitFlow para organização de branches:

**Branches Principais**

- `main`: Código em produção
- `develop`: Código em desenvolvimento

**Branches de Feature**

Para novas funcionalidades:

\`\`\`bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature
# desenvolver...
git add .
git commit -m "feat: descrição da feature"
git push origin feature/nome-da-feature
# criar Pull Request
\`\`\`

**Branches de Bugfix**

Para correções:

\`\`\`bash
git checkout develop
git checkout -b bugfix/nome-do-bug
# corrigir...
git commit -m "fix: descrição da correção"
\`\`\`

### Commits Semânticos

Use Conventional Commits para mensagens de commit:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças em documentação
- `style:` Formatação, sem mudanças de código
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Tarefas de manutenção

Exemplos:

\`\`\`
feat: adicionar gráfico de candlestick
fix: corrigir cálculo de P&L no portfólio
docs: atualizar README com instruções de deploy
refactor: extrair lógica de validação para hook customizado
\`\`\`

### Code Review

Ao revisar Pull Requests, verifique:

- **Funcionalidade**: O código faz o que deveria?
- **Testes**: Há testes adequados?
- **Performance**: O código é eficiente?
- **Legibilidade**: O código é fácil de entender?
- **Segurança**: Há vulnerabilidades potenciais?
- **Documentação**: Mudanças complexas estão documentadas?

## Desenvolvimento de Componentes

### Criando Novos Componentes

Ao criar um novo componente:

1. Determine se é um componente comum, específico de página ou widget
2. Crie o arquivo no diretório apropriado
3. Implemente o componente seguindo a estrutura padrão
4. Adicione PropTypes ou tipos TypeScript
5. Documente props e comportamento
6. Crie testes se for um componente complexo

### Componentes Reutilizáveis

Para componentes que serão reutilizados:

- Torne-os o mais genéricos possível
- Use props para customização
- Forneça valores padrão sensatos
- Documente todos os props e variantes
- Considere criar um Storybook para demonstração

### Integração com Redux

Para conectar componentes ao Redux:

\`\`\`jsx
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { updateProfile } from '@/store/slices/authSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  const handleUpdate = (data) => {
    dispatch(updateProfile(data));
  };
  
  return <div>{user.name}</div>;
};
\`\`\`

### Integração com RTK Query

Para buscar dados com RTK Query:

\`\`\`jsx
import { useGetQuoteQuery } from '@/services/api/market.api';

const QuoteDisplay = ({ symbol }) => {
  const { data, isLoading, error } = useGetQuoteQuery(symbol);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{data.price}</div>;
};
\`\`\`

## Trabalhando com WebSocket

### Usando o Hook useWebSocket

Para conectar ao WebSocket:

\`\`\`jsx
import { useWebSocket } from '@/hooks/useWebSocket';

const MyComponent = () => {
  const { send, on, off, isConnected } = useWebSocket();
  
  React.useEffect(() => {
    const handleUpdate = (data) => {
      console.log('Atualização recebida:', data);
    };
    
    on('quote_update', handleUpdate);
    
    return () => {
      off('quote_update', handleUpdate);
    };
  }, [on, off]);
  
  return <div>Conectado: {isConnected ? 'Sim' : 'Não'}</div>;
};
\`\`\`

### Usando o Hook useMarketData

Para dados de mercado em tempo real:

\`\`\`jsx
import { useMarketData } from '@/hooks/useMarketData';

const StockQuote = ({ symbol }) => {
  const { quote, isSubscribed } = useMarketData(symbol);
  
  return (
    <div>
      <div>{symbol}: R$ {quote?.price}</div>
      <div>Status: {isSubscribed ? 'Inscrito' : 'Não inscrito'}</div>
    </div>
  );
};
\`\`\`

## Testes

### Executando Testes

\`\`\`bash
# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
\`\`\`

### Escrevendo Testes

**Testes de Componentes**

\`\`\`jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renderiza corretamente', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });
  
  it('chama onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

**Testes de Utilitários**

\`\`\`javascript
import { formatCurrency } from './formatters';

describe('formatCurrency', () => {
  it('formata valores positivos corretamente', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
  });
  
  it('formata valores negativos corretamente', () => {
    expect(formatCurrency(-1234.56)).toBe('-R$ 1.234,56');
  });
});
\`\`\`

## Debugging

### DevTools do Electron

Acesse as DevTools com `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Option+I` (macOS).

### Redux DevTools

Instale a extensão Redux DevTools no navegador para inspecionar o estado da aplicação.

### Logs

Use os métodos de log apropriados:

\`\`\`javascript
console.log('Informação geral');
console.warn('Aviso');
console.error('Erro');
console.debug('Debug (apenas em desenvolvimento)');
\`\`\`

Em produção, os logs de debug são automaticamente removidos.

## Performance

### Otimizações Recomendadas

**Memoização**

Use React.memo para componentes que renderizam frequentemente:

\`\`\`jsx
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* renderização pesada */}</div>;
});
\`\`\`

Use useMemo para cálculos pesados:

\`\`\`jsx
const expensiveValue = React.useMemo(() => {
  return complexCalculation(data);
}, [data]);
\`\`\`

Use useCallback para callbacks estáveis:

\`\`\`jsx
const handleClick = React.useCallback(() => {
  doSomething(value);
}, [value]);
\`\`\`

**Lazy Loading**

Carregue componentes pesados de forma lazy:

\`\`\`jsx
const HeavyChart = React.lazy(() => import('./HeavyChart'));

const MyComponent = () => {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <HeavyChart />
    </React.Suspense>
  );
};
\`\`\`

### Profiling

Use o React Profiler para identificar componentes lentos:

\`\`\`jsx
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log(\`\${id} (\${phase}) levou \${actualDuration}ms\`);
};

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
\`\`\`

## Solução de Problemas Comuns

### Electron não inicia

Verifique se as portas 3000 e 8000 não estão em uso. Limpe o cache:

\`\`\`bash
rm -rf node_modules
npm install
\`\`\`

### Erros de compilação TypeScript

Execute a verificação de tipos:

\`\`\`bash
npm run type-check
\`\`\`

### WebSocket não conecta

Verifique se o backend está rodando e se a URL do WebSocket está correta no `.env`.

### Componentes não atualizam

Verifique se os selectors do Redux estão corretos e se as actions estão sendo despachadas.

## Recursos Adicionais

### Documentação

- [React](https://react.dev/)
- [Electron](https://www.electronjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/)

### Comunidade

- Slack do time (link interno)
- GitHub Issues para bugs e features
- Wiki do projeto para documentação adicional

## Conclusão

Este guia cobre os aspectos essenciais do desenvolvimento no Investment App B3. Mantenha-o atualizado conforme o projeto evolui e não hesite em contribuir com melhorias e adições.
