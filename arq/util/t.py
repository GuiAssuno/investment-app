import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
import secrets

def ativos(caminho_csv):
    df = pd.read_csv(caminho_csv)
    return list(df['id']), list(df['Nome'])

def configurar_driver():
    """Configura o Chrome para rodar leve no Windows"""
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--log-level=3") # Menos avisos no terminal
    
    # Otimização para bloquear imagens (Carrega mais rápido)
    prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", prefs)
    
    servico = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=servico, options=chrome_options)

def extrair_dados(cota):
    driver = None

    try:
        time.sleep(random.uniform(0.5, 1.5))

        driver = configurar_driver()
        driver.get(f"https://www.google.com/finance/quote/{cota}:BVMF")
        
        # Espera carregar (segurança)
        time.sleep(4) 
        texto_pagina = driver.find_element(By.TAG_NAME, "body").text
        linhas = texto_pagina.split('\n')

        if len(linhas) > 36:
            dado_linha_34 = linhas[34]
            dado_linha_35 = linhas[35]
            dado_linha_36 = linhas[36]

            print("\n" + "="*30)
            print(f" RESUMO FINANCEIRO {cota}")
            print("="*30)
            print(f" Linha 34: {dado_linha_34}")
            print(f" Linha 35: {dado_linha_35}")
            print(f" Linha 36: {dado_linha_36}")
            print("="*30 + "\n")
            
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