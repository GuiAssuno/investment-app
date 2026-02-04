# tenho que procurar um pradrão na variação de preço dos ativos para fazer uma análise de compra e venda

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import datetime
import os
import time
import cota as ct
import pathlib 
from pathlib import Path



def carregar_dados():
    caminho_arquivo = Path(__file__).parent.resolve()
    quantidade = 1
    armario = {}

    while True:

        arquivo = caminho_arquivo / 'dado-do-dia' / f'lista{quantidade}'
        df = pd.read_csv(arquivo)
        
        for linha in df:
            armario[df['id']]
        try:
            dados = pd.read_csv(caminho_arquivo)
            return dados
        except Exception as e:
            print(f"Erro ao carregar dados: {e}")
            return None




def tab (caminho_arquivo = (Path(__file__).parent.resolve() / 'analise',)):

    with open (caminho_arquivo, "a") as f:
        f.write('')






def analisar_ativo(dados_ativo):
    analise_resultados = []
    
    for i in range(len(dados_ativo["simbolo"])):
        simbolo = dados_ativo["simbolo"][i]
        preco = dados_ativo["preço"][i]
        variacao = dados_ativo["variação"][i]
        variacao_porcentagem = dados_ativo["variação_porcentagem"][i]
