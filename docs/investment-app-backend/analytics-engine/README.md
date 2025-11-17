# Investment App - Analytics Engine (Python)

Este é o motor de análise e machine learning para o aplicativo de investimentos B3, construído com Python e FastAPI. Ele fornece funcionalidades avançadas como cálculo de indicadores técnicos, predição de preços e análise de sentimento de mercado.

## 🚀 Tecnologias Utilizadas

-   **Python**: Linguagem de programação principal.
-   **FastAPI**: Framework web moderno e rápido para construção de APIs.
-   **Pydantic**: Para validação de dados e serialização.
-   **SQLAlchemy**: ORM para interação com bancos de dados (PostgreSQL).
-   **Redis**: Para cache e gerenciamento de tarefas assíncronas (via Celery).
-   **Celery**: Sistema de filas de tarefas distribuídas para processamento em background.
-   **Scikit-learn, Pandas, NumPy, SciPy, Statsmodels**: Bibliotecas para análise de dados e machine learning.
-   **TA-Lib, Pandas-TA**: Para cálculo de indicadores técnicos.
-   **HTTX, Aiohttp**: Clientes HTTP assíncronos.
-   **Loguru**: Para logging robusto.
-   **pytest**: Para testes unitários e de integração.

## 📦 Estrutura do Projeto

```
analytics-engine/
├── src/
│   ├── api/                 # Definições de API e modelos Pydantic
│   ├── config/              # Configurações de ambiente, DB, Redis
│   ├── indicators/          # Implementação de indicadores técnicos
│   ├── ml_models/           # Modelos de Machine Learning
│   ├── scrapers/            # Scripts para coleta de dados (se necessário)
│   └── utils/               # Funções utilitárias
├── tests/                   # Testes unitários e de integração
├── .env.example             # Exemplo de variáveis de ambiente
├── .gitignore               # Arquivos e diretórios a serem ignorados pelo Git
├── main.py                  # Ponto de entrada da aplicação FastAPI
├── requirements.txt         # Dependências do Python
└── README.md                # Este arquivo
```

## ⚙️ Configuração

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd investment-app/analytics-engine
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do diretório `analytics-engine` e preencha com as variáveis necessárias, baseando-se no `.env.example`.
    ```ini
    # Exemplo de .env
    ENVIRONMENT=development
    ANALYTICS_ENGINE_PORT=5000
    DATABASE_URL=postgresql://user:password@host:port/dbname
    REDIS_URL=redis://localhost:6379/0
    # ... outras variáveis
    ```

## ▶️ Como Rodar

-   **Modo Desenvolvimento (com `uvicorn`):**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 5000 --reload
    ```

-   **Modo Produção:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 5000
    ```

O servidor estará disponível em `http://localhost:5000` (ou na porta configurada em `.env`).

## 🧪 Testes

Para rodar os testes unitários e de integração:

```bash
pytest
```

Para rodar os testes com cobertura de código:

```bash
pytest --cov=src
```

## 📚 Rotas da API

### Health Checks

-   `GET /`: Retorna status básico do serviço.
-   `GET /health`: Retorna status detalhado do serviço e suas dependências.

### Indicadores Técnicos (`/api/v1/indicators`)

-   `POST /calculate`: Calcula um indicador técnico para uma série de dados.

### Machine Learning (`/api/v1/ml`)

-   `POST /predict`: Prediz o preço futuro de um ativo com base em dados históricos.

### Análise de Mercado (`/api/v1/analysis`)

-   `GET /sentiment/{symbol}`: Realiza análise de sentimento para um ativo específico.
-   `GET /correlation?symbols=SYM1,SYM2`: Calcula a correlação entre múltiplos ativos.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, siga as diretrizes de contribuição e o código de conduta.

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

