from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent / 'arq' / 'src'))
import BuscaDados
import requests
from bs4 import BeautifulSoup
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


# teste = [        
#         "ITUB4", "VALE3", "PETR4", "WEGE3", "BBAS3", 
#         "MGLU3", "BBDC4", "ABEV3", "PRIO3"]

# BuscaDados.salvar_dados((BuscaDados.consulta(teste)))



def busca_noticia():
    links = {
        "https://investnews.com.br/economia/page/540/?_gl=1%2Ali6itt%2Agclid%2AQ2p3S0NBanctYi1rQmhCLUVpd0E0ZnZLckVuMS1NV1lpRWswLTJWalpSbURoX2tGTU43b3dWQXpKNE1tc3V0SnBMZkhKN3FzNXRESm1Cb0NELXNRQXZEX0J3RQ..%2A_gcl_aw%2AR0NMLjE2ODcyODU1NzIuQ2p3S0NBanctYi1rQmhCLUVpd0E0ZnZLckVuMS1NV1lpRWswLTJWalpSbURoX2tGTU43b3dWQXpKNE1tc3V0SnBMZkhKN3FzNXRESm1Cb0NELXNRQXZEX0J3RQ..&noamp=mobile&gad_source=1&gad_campaignid=17459268635&gclid=CjwKCAiAqKbMBhBmEiwAZ3UboPjtNpeA1nAIdZIkw3sKxjCBLdy0mo8WZ4oz3Hjq9ft6ih084H4oeRoC_ncQAvD_BwE": ["category-posts-content","h2"],
        "https://g1.globo.com/economia/" : ["column areatemplate-esquerda large-15 large-offset-0 xlarge-14 xlarge-offset-1 float-left","h2"],
        "https://www.infomoney.com.br/economia/" : ["max-w-9xl mx-auto","h2"],
        "https://www.cnnbrasil.com.br/economia/": ["grid lg:grid-cols-3 lg:gap-8 lg:border-t lg:border-neutral-300 lg:py-0 lg:pb-8 lg:pt-8 lg:*:py-0","h2"],
        "https://g1.globo.com/politica/": ["theme","h2"],
        "https://www.cnnbrasil.com.br/politica/": ["lg:mt-2","h3"],
        "https://noticias.uol.com.br/politica/": ["flex-wrap ","h3"],
        "https://jovempan.com.br/noticias/politica": ["main col-md-8","h2"]
    }

    noticias = []

    for link, acha in links.items():
        try:
            resposta = requests.get(link)
            soup = BeautifulSoup(resposta.content, 'html.parser')
                
            news_lista = soup.find(class_= f'{acha[0]}')
            ultimas = news_lista.find_all(f'{acha[1]}')

            noticias.append(ultimas)

        except:
             print(f'Erro no {link}' )
    
    dic_news={}

    for news in ultimas:
        link = news.find('a')
        dic_news[f'{news.text}'] = link.attrs['href']
        #print(f"Artigo: {news.text}\n  Link: {link.attrs['href']}")

    return dic_news

dicio = busca_noticia()

for chave, valor in dicio.items():
    print(f"Artigo: {chave}\n  Link: {valor}")