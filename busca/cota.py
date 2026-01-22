import os
import time
import secrets
import pathlib
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from concurrent.futures import ThreadPoolExecutor
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


def ativos(caminho_csv):

    try:
        df_negra = pd.read_csv((pathlib.Path(__file__).parent.resolve()) / 'lista-negra.csv')
        lista_negra = list(df_negra)
    except FileNotFoundError:
        lista_negra = []

    df = pd.read_csv(caminho_csv)
    df = df[ ~df['id'].isin(lista_negra) ]

    return list(df['id']), list(df['Nome'])

def isnumeric(s):
    """Verifica se uma string é numérica"""
    try:
        float(s)
        return True
    except ValueError:
        return False

def configurar_driver():
    """Configura o Chrome para rodar leve"""
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--log-level=3") # Menos avisos no terminal
    
    # Otimização para bloquear imagens
    prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", prefs)
    
    servico = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=servico, options=chrome_options)

def extrair_dados(cota, lista_negra=((pathlib.Path(__file__).parent.resolve()) / 'lista-negra.csv')):

    driver = configurar_driver()
    try:
        driver.get(f"https://www.google.com/finance/quote/{cota}:BVMF")
        
        time.sleep(4) 

        texto_pagina = driver.find_element(By.TAG_NAME, "body").text
        linhas = texto_pagina.replace(',','.').replace(' Today','').replace('%','').replace('R$','').split('\n')
        
        if len(linhas) > 36:
            dado_linha_34 = linhas[34]
            dado_linha_35 = linhas[35]
            dado_linha_36 = linhas[36]

            if (dado_linha_35 == '0' or (not isnumeric(dado_linha_35))) and (dado_linha_36 == '0'):
                with open(lista_negra, 'a') as f:
                    f.write(f"{cota}\n")


            print("\n" + "="*10)
            print(f"  {cota}  ")
            print("="*10)
            print(f"R$ {dado_linha_34}")
            print(f"   {dado_linha_35}")
            print(f"  {dado_linha_36}")
            print("="*10 + "\n")
            
            return dado_linha_34, dado_linha_36, dado_linha_35

        else:
            print("Ops! A página carregou menos linhas do que o esperado. Tente rodar o 'Raio-X' novamente.")
            return None, None, None
    except Exception as e:
        print(f"Erro: {e}")
        return None, None, None
    finally:
        driver.quit()

def teste_extrair_dados(cota):
    opcao = [_ for _ in range(1000)]
    inicial = secrets.choice(opcao)
    atual = secrets.choice(opcao)

    return inicial, (atual - inicial), ((atual - inicial) / inicial) * 100
        
def salvar_dados(dados_ativo):
    hora = pd.Timestamp.now().strftime('%Y_%m_%d_%H-%M-%S')

    with open (f'{(pathlib.Path(__file__).parent.resolve())}/dado-do-dia/{hora}.csv', 'a') as f:
        f.write('ID,Preço,Variação,Variação (%),Horário\n')
        for i in range (len(dados_ativo['simbolo'])):
            f.write(f"{dados_ativo['simbolo'][i]},{dados_ativo['preço'][i]},{dados_ativo['variação'][i]},{dados_ativo['variação_porcentagem'][i]},{dados_ativo['horario'][i]}\n")

def iniciar_extracao(caminho_csv, qtd_workers = 2):
    simbolos, nomes = ativos(caminho_csv)
    dados_ativo = {
        "simbolo": [],
        "preço": [],
        "variação": [],
        "variação_porcentagem": [],
        "horario": []}

    if os.name == 'nt':
        
        inicio = time.time()

        with ThreadPoolExecutor(max_workers=qtd_workers) as executor:
            resultados = list(executor.map(extrair_dados, simbolos))


        for linha, simbolo in zip(resultados, simbolos):
            dados_ativo["simbolo"].append(simbolo)
            dados_ativo["preço"].append(linha[0])
            dados_ativo["variação"].append(linha[2])
            dados_ativo["variação_porcentagem"].append(linha[1])
            dados_ativo["horario"].append(pd.Timestamp.now().strftime('%d/%m/%Y - %H:%M:%S'))
        
        print("="*30)

        print(f"\nTempo total: {time.time() - inicio:.2f} segundos")
        
        salvar_dados(dados_ativo)
    
    else:

        for simbolo in simbolos:
            preco, variacao, variacao_porcentagem = extrair_dados(simbolo)
            dados_ativo["simbolo"].append(simbolo)
            dados_ativo["preço"].append(preco)
            dados_ativo["variação"].append(variacao)
            dados_ativo["variação_porcentagem"].append(variacao_porcentagem)
            dados_ativo["horario"].append(pd.Timestamp.now().strftime('%d/%m/%Y - %H:%M:%S'))
            time.sleep(2)
        
        salvar_dados(dados_ativo)