
import requests
from bs4 import BeautifulSoup
import pandas as pd

caminho = "investment-app/busca/ativos.csv"
ativos_df = pd.read_csv(caminho)
sites = []

def coletar_dados_site(url, tag_alvo, classe_alvo,df=ativos_df[0]):
    print(f"Iniciando a coleta de dados da URL: {url}")
    
    # Lista para armazenar os dados coletados
    dados_coletados = []

    try:

        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        
        # Verifica se a requisição foi bem-sucedida (código 200)
        response.raise_for_status() 
        print("Página baixada com sucesso!")

        # 2. ANALISAR O CONTEÚDO HTML
        site = BeautifulSoup(response.text, 'lxml')
        print("HTML analisado. Procurando pelos dados...")

        # 3. LOCALIZAR OS DADOS
        # Encontra TODOS os elementos que correspondem à tag e classe fornecidas.
        elementos_encontrados = site.find_all(tag_alvo, class_=classe_alvo)
        
        if not elementos_encontrados:
            print(f"Atenção: Nenhum elemento encontrado com a tag '{tag_alvo}' e classe '{classe_alvo}'. Verifique o site.")
            return []
    except Exception as e:
        print(f"Ocorreu um erro durante a requisição ou análise do site: {e}")
        return []


#============================  M A I N ====================================

url_alvo = ""
tag = 'div'            
classe = 'col-md-8'   #quesquisando no google MDTDab

dados_brutos = coletar_dados_site(url_alvo, tag, classe)
print(len(dados_brutos))

