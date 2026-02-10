from pathlib import Path
import sys
# sys.path.append(str(Path(__file__).parent.parent / 'arq' / 'src'))
# import BuscaDados
sys.path.append(str(Path(__file__).parent.parent / 'banco' / 'connection'))
print((Path(__file__).parent.parent / 'banco' / 'connection'))
import classBanco
import time
import requests
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor
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



# def busca_noticia():
#     links = {
#         "https://investnews.com.br/economia/page/540/?_gl=1%2Ali6itt%2Agclid%2AQ2p3S0NBanctYi1rQmhCLUVpd0E0ZnZLckVuMS1NV1lpRWswLTJWalpSbURoX2tGTU43b3dWQXpKNE1tc3V0SnBMZkhKN3FzNXRESm1Cb0NELXNRQXZEX0J3RQ..%2A_gcl_aw%2AR0NMLjE2ODcyODU1NzIuQ2p3S0NBanctYi1rQmhCLUVpd0E0ZnZLckVuMS1NV1lpRWswLTJWalpSbURoX2tGTU43b3dWQXpKNE1tc3V0SnBMZkhKN3FzNXRESm1Cb0NELXNRQXZEX0J3RQ..&noamp=mobile&gad_source=1&gad_campaignid=17459268635&gclid=CjwKCAiAqKbMBhBmEiwAZ3UboPjtNpeA1nAIdZIkw3sKxjCBLdy0mo8WZ4oz3Hjq9ft6ih084H4oeRoC_ncQAvD_BwE": ["category-posts-content","h2"],
#         "https://g1.globo.com/economia/" : ["column areatemplate-esquerda large-15 large-offset-0 xlarge-14 xlarge-offset-1 float-left","h2"],
#         "https://www.infomoney.com.br/economia/" : ["max-w-9xl mx-auto","h2"],
#         "https://www.cnnbrasil.com.br/economia/": ["grid lg:grid-cols-3 lg:gap-8 lg:border-t lg:border-neutral-300 lg:py-0 lg:pb-8 lg:pt-8 lg:*:py-0","h2"],
#         "https://g1.globo.com/politica/": ["theme","h2"],
#         "https://www.cnnbrasil.com.br/politica/": ["lg:mt-2","h3"],
#         "https://noticias.uol.com.br/politica/": ["flex-wrap ","h3"],
#         "https://jovempan.com.br/noticias/politica": ["main col-md-8","h2"]
#     }

#     noticias = []

#     for link, acha in links.items():
#         try:
#             resposta = requests.get(link)
#             soup = BeautifulSoup(resposta.content, 'html.parser')
                
#             news_lista = soup.find(class_= f'{acha[0]}')
#             ultimas = news_lista.find_all(f'{acha[1]}')

#             noticias.append(ultimas)

#         except:
#              print(f'Erro no {link}' )
    
#     dic_news={}

#     for news in ultimas:
#         link = news.find('a')
#         dic_news[f'{news.text}'] = link.attrs['href']
#         #print(f"Artigo: {news.text}\n  Link: {link.attrs['href']}")

#     return dic_news

# dicio = busca_noticia()

# for chave, valor in dicio.items():
#     print(f"Artigo: {chave}\n  Link: {valor}")

def processo_de_busca():
    bd_invest = classBanco.BaDa()
    lista_tickers = bd_invest.carregar_ticker()

    inicio = time.time()

    tickers_formatados = [t + ".SA" 
                          if not t.endswith(".SA") else t 
                          for t in lista_tickers]
    
    string_tickers = " ".join(tickers_formatados)

    dados = yf.download(string_tickers, period="2d", group_by='ticker', threads=True, progress=False)

    lista_final = []

    for ticker in tickers_formatados:
        try:
            # Acessa os dados desse ticker
            df_ativo = dados[ticker]
            df_ativo = df_ativo.dropna()

            if len(df_ativo) < 1:
                continue

            # Pega preço atual
            preco_atual = df_ativo['Close'].iloc[-1]
            
            # Tenta calcular variação
            if len(df_ativo) >= 2:
                fechamento_ontem = df_ativo['Close'].iloc[-2]
                var_reais = preco_atual - fechamento_ontem
                var_pct = (var_reais / fechamento_ontem) * 100
            else:
                var_reais = 0.0
                var_pct = 0.0

            # Limpa o nome
            simbolo_limpo = ticker.replace(".SA", "")
            
            lista_final.append({
                "Ativo": simbolo_limpo,
                "Preço": f"R$ {preco_atual:.2f}",
                "Var R$": f"{var_reais:+.2f}",
                "Var %": f"{var_pct:+.2f}%",
                "Status": "Alta" if var_reais > 0 else ("Baixa" if var_reais < 0 else "Neutro")
            })

        except KeyError:
            print(f"Erro: Dados não encontrados para {ticker}")
            continue

    fim = time.time()
    print(f"Tempo {fim - inicio:.2f}")

    df_final = pd.DataFrame(lista_final)

    print("Sem Problemas")
    return df_final


def adicionar_acao( df_resultado):
        """Adiciona uma linha na tabela com a cor certa"""

        try:       
            #print(df_resultado)
            #print(type(df_resultado))
            print(len(df_resultado))
            total = len(df_resultado)

            for i, linha in df_resultado.iterrows():
                print(" ==================entrou no for ==========")
                #print(linha)
                ativo = linha['Ativo']
                #  CALLBACK DA BARRA DE PROGRESSO 
                print(f'0, atualizar_barra, {(i)+1}, {total}, Lendo {ativo}...')

                preco = f"R$ {linha['Preço']}"
                var_r = f"{linha['Var R$']}"
                var_p = f"{linha['Var %']}%"


                try:
                    # valor_teste = float(preco.replace(",", ".").replace("+", ""))
                    # valor_teste = float(preco.replace(",", ".").replace("+", ""))

                    tag = linha['Status']
                except Exception as c:
                    print(f'Erro => {c}')
                print(f'"", "end", values=({ativo}, {preco}, {var_r}, {var_p}), tags=({tag},)')
        
        except Exception as x:
            print(f'Erro:  {x}')

if __name__ == "__main__":
    d = processo_de_busca()
    adicionar_acao(d)