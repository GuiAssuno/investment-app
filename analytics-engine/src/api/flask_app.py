# src/api/flask_app.py

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import pandas as pd
import numpy as np

# 1. Definição do Modelo de Dados de Saída (Resposta da API)
# Isso ajuda o Node.js a entender o que esperar.
class RiskAnalysisResponse(BaseModel):
    asset: str
    risk_score: float
    volatility: float
    message: str

# 2. Inicialização do FastAPI
app = FastAPI(
    title="Motor de Análise e IA (Python)",
    description="Serviço de análise de dados e modelos de Machine Learning para o Back-end principal.",
    version="1.0.0"
)

# 3. Módulo de Lógica (Simulação do Modelo de Risco)
# Em um projeto real, esta função carregaria modelos scikit-learn/TensorFlow
# e faria cálculos complexos usando Pandas/NumPy.
def analyze_asset_risk(symbol: str) -> dict:
    """Simula a execução de um modelo de IA para calcular risco e volatilidade."""
    
    # Simulação de dados (usando lógica de tempo real)
    np.random.seed(hash(symbol) % 100) # Garante que o mesmo símbolo tenha o mesmo resultado
    
    risk_score = np.random.uniform(0.1, 0.9)
    volatility = np.random.uniform(0.1, 0.5)

    if risk_score > 0.7:
        message = "Risco elevado. Modelo sugere cautela."
    else:
        message = "Risco moderado. Seguir análise fundamentalista."

    return {
        "asset": symbol,
        "risk_score": round(risk_score, 4),
        "volatility": round(volatility, 4),
        "message": message
    }


# 4. Definição do Endpoint da API
@app.get("/api/v1/analyze/risk/{asset_symbol}", response_model=RiskAnalysisResponse)
async def get_risk_analysis(asset_symbol: str):
    """
    Endpoint principal para o Back-end Node.js consumir.
    Executa a análise de risco para um determinado símbolo de ativo.
    """
    analysis_data = analyze_asset_risk(asset_symbol.upper())
    return analysis_data

# 5. Ponto de Entrada para Execução Local com Uvicorn
# O Uvicorn é o servidor ASGI que você está usando (listado no requirements.txt)
if __name__ == "__main__":
    # Rodar na porta 5000, que é a porta padrão para APIs de IA
    uvicorn.run(app, host="0.0.0.0", port=5000)