from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent / 'arq' / 'src'))
import BuscaDados

import os
import pandas as pd

# Lista todos os arquivos no diretório atual
# pasta = Path(__file__).parent.resolve()
# print (pasta)
# arquivos = [f for f in pasta.iterdir() if f.is_file()]

#print(arquivos)

# for arquivo in arquivos:
#     print(arquivo.name)
# Caminho lista negra
# path = (Path(__file__).parent.resolve()) 
# black_list = path / 'lista_tickers' / 'lista-negra.csv'

# # Caminho ativos
# caminho_csv = path / 'lista_tickers' / 'ativos.csv'

# print(black_list)
# print (caminho_csv)
# def carregar (caminho_arquivo = Path(__file__).parent.resolve(),):
#     caminho_arquivo = Path(__file__).parent.resolve()
#     quantidade = 1
#     armario = {}


#     arquivo = caminho_arquivo / 'dado-do-dia' / f'2026_01_26_12-30-40.csv'
#     print(arquivo)
#     df = pd.read_csv(arquivo)
#     linhas = len(df)
#     print(linhas)

#     for _ in range(linhas):
#         nome = str(df['ID'][_])
#         valor = [(str(df['Preço'][_]), str(df['Variação'][_]), str(df['Variação (%)'][_]))]
        
#         try:
#             armario[nome] = {f"{[df['Horario'][_]]}": valor}
#             print(armario)
#         except Exception as e:
#             print(f"Erro ao carregar dados: {e}")
#             break

#         if _ == 10:
#             break


teste = [        
        "ITUB4", "VALE3", "PETR4", "WEGE3", "BBAS3", 
        "MGLU3", "BBDC4", "ABEV3", "PRIO3"]

BuscaDados.salvar_dados((BuscaDados.consulta(teste)))