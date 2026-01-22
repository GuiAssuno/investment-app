import cota as ct
import pandas as pd
import time

caminho_csv = 'investment-app/busca/ativos.csv'
simbolos, nomes = ct.ativos(caminho_csv)

dados_ativo = {
        "simbolo": [],
        "preço": [],
        "variação": [],
        "variação_porcentagem": [],
        "horario": []}

for simbulo in simbolos:
    preco, variacao, variacao_porcentagem = ct.extrair_dados(simbulo)
    dados_ativo["simbolo"].append(simbulo)
    dados_ativo["preço"].append(preco)
    dados_ativo["variação"].append(variacao)
    dados_ativo["variação_porcentagem"].append(variacao_porcentagem)
    dados_ativo["horario"].append(pd.Timestamp.now().strftime('%d/%m/%Y - %H:%M:%S'))
    time.sleep(2)

hora = pd.Timestamp.now().strftime('%Y_%m_%d_%H-%M-%S')

with open (f'investment-app/busca/dado-do-dia/precos-{hora}.csv', 'a') as f:
    f.write('ID,Preço,Variação,Variação (%),Horário\n')
    for i in range (len(dados_ativo['simbolo'])):
        f.write(f"{dados_ativo['simbolo'][i]},{dados_ativo['preço'][i]},{dados_ativo['variação'][i]},{dados_ativo['variação_porcentagem'][i]},{dados_ativo['horario'][i]}\n")