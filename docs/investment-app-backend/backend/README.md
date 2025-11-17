# Investment App - Backend (Node.js)

Este é o serviço de backend para o aplicativo de investimentos B3, construído com Node.js, Express, Sequelize (PostgreSQL), Redis e Socket.IO. Ele fornece as APIs RESTful e comunicação em tempo real necessárias para o frontend e o motor de análise.

## 🚀 Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework web para construção de APIs RESTful.
- **PostgreSQL**: Banco de dados relacional para persistência de dados.
- **Sequelize**: ORM (Object-Relational Mapper) para interação com o PostgreSQL.
- **Redis**: Banco de dados em memória para cache, sessões e Pub/Sub.
- **Socket.IO**: Biblioteca para comunicação bidirecional em tempo real (WebSockets).
- **JWT (JSON Web Tokens)**: Para autenticação e autorização.
- **Bcrypt**: Para hashing seguro de senhas.
- **Speakeasy**: Para Autenticação de Dois Fatores (2FA).
- **Bull Queue**: Para gerenciamento de filas e tarefas assíncronas.
- **Winston**: Para logging robusto.
- **Joi/Zod**: Para validação de esquemas (ainda não totalmente implementado, mas previsto).
- **Axios**: Cliente HTTP para integração com APIs externas (B3, Brapi, etc.).
- **Helmet, CORS, Compression, Express-Rate-Limit**: Middlewares de segurança e performance.

## 📦 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/              # Configurações de ambiente, DB, Redis
│   ├── controllers/         # Lógica de negócio para rotas HTTP
│   ├── middleware/          # Middlewares de autenticação, validação, etc.
│   ├── models/              # Definições de modelos Sequelize
│   ├── queues/              # Configuração e processadores de filas (BullMQ)
│   ├── routes/              # Definição de rotas da API
│   ├── services/            # Lógica de negócio principal (autenticação, mercado, trading, portfólio)
│   ├── utils/               # Funções utilitárias (logger, criptografia)
│   ├── websocket/           # Configuração do servidor Socket.IO
│   ├── app.js               # Configuração do Express
│   └── server.js            # Ponto de entrada do servidor
├── tests/                   # Testes unitários e de integração
├── .env.example             # Exemplo de variáveis de ambiente
├── .gitignore               # Arquivos e diretórios a serem ignorados pelo Git
├── package.json             # Dependências e scripts do projeto
├── jest.config.js           # Configuração do Jest
└── README.md                # Este arquivo
```

## ⚙️ Configuração

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd investment-app/backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do diretório `backend` e preencha com as variáveis necessárias, baseando-se no `.env.example`.
    ```ini
    # Exemplo de .env
    NODE_ENV=development
    PORT=3000
    DB_HOST=localhost
    DB_NAME=investment_app
    DB_USER=postgres
    DB_PASSWORD=postgres
    JWT_SECRET=sua_chave_secreta_jwt
    # ... outras variáveis
    ```

4.  **Inicie o PostgreSQL e Redis:**
    Certifique-se de que seus serviços de PostgreSQL e Redis estejam rodando. Você pode usar Docker para isso:
    ```bash
    # Exemplo de docker-compose.yml (no diretório raiz do projeto)
    version: '3.8'
    services:
      postgres:
        image: postgres:13
        environment:
          POSTGRES_DB: investment_app
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - "5432:5432"
        volumes:
          - pgdata:/var/lib/postgresql/data

      redis:
        image: redis:6-alpine
        ports:
          - "6379:6379"
        volumes:
          - redisdata:/data

    volumes:
      pgdata:
      redisdata:
    ```
    Para iniciar com Docker Compose:
    ```bash
    docker-compose up -d
    ```

5.  **Execute as migrações do banco de dados:**
    ```bash
    npx sequelize-cli db:migrate
    ```

## ▶️ Como Rodar

-   **Modo Desenvolvimento (com `nodemon`):**
    ```bash
    npm run dev
    ```

-   **Modo Produção:**
    ```bash
    npm start
    ```

O servidor estará disponível em `http://localhost:3000` (ou na porta configurada em `.env`).

## 🧪 Testes

Para rodar os testes unitários e de integração:

```bash
npm test
```

Para rodar os testes em modo `watch`:

```bash
npm run test:watch
```

## 📚 Rotas da API

### Autenticação (`/api/v1/auth`)

-   `POST /register`: Registrar novo usuário.
-   `POST /login`: Autenticar usuário e obter tokens.
-   `POST /verify-2fa`: Verificar token 2FA para completar login.
-   `POST /refresh`: Renovar access token usando refresh token.
-   `POST /forgot-password`: Solicitar reset de senha.
-   `POST /reset-password`: Resetar senha com token.
-   `POST /verify-email`: Verificar email com token.
-   `GET /profile`: Obter perfil do usuário autenticado.
-   `POST /logout`: Desconectar usuário.
-   `POST /2fa/generate`: Gerar secret 2FA e QR Code.
-   `POST /2fa/enable`: Habilitar 2FA.
-   `POST /2fa/disable`: Desabilitar 2FA.

### Mercado (`/api/v1/market`)

-   `GET /quote/:symbol`: Obter cotação de um ativo.
-   `GET /quotes?symbols=SYM1,SYM2`: Obter cotações de múltiplos ativos.
-   `GET /historical/:symbol?interval=1d&range=1mo`: Obter dados históricos.
-   `GET /search?q=query`: Buscar ativos.
-   `GET /available`: Listar ativos disponíveis.
-   `GET /top-gainers`: Maiores altas do dia.
-   `GET /top-losers`: Maiores baixas do dia.
-   `GET /status`: Status de funcionamento do mercado.

### Trading (`/api/v1/trading`)

-   `POST /orders`: Criar nova ordem de compra/venda.
-   `GET /orders?accountId=xxx&status=pending`: Listar ordens de uma conta.
-   `GET /orders/:orderId?accountId=xxx`: Obter detalhes de uma ordem.
-   `DELETE /orders/:orderId`: Cancelar ordem.
-   `POST /orders/:orderId/execute`: Simular execução de ordem (para paper trading).

### Portfólio (`/api/v1/portfolio`)

-   `GET /summary?accountId=xxx`: Resumo do portfólio.
-   `GET /positions?accountId=xxx`: Posições em ativos.
-   `GET /performance?accountId=xxx&period=1m`: Performance do portfólio.
-   `GET /allocation?accountId=xxx`: Alocação de ativos.
-   `GET /diversification?accountId=xxx`: Métricas de diversificação.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, siga as diretrizes de contribuição e o código de conduta.

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

