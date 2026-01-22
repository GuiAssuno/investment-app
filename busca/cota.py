import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import secrets

def ativos(caminho_csv):
    df = pd.read_csv(caminho_csv)
    return list(df['id']), list(df['Nome'])

def extrair_dados(cota):
    # Inicializa o Chrome
    servico = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=servico)

    try:
        print("Acessando Google Finance...")
        driver.get(f"https://www.google.com/finance/quote/{cota}:BVMF")
        
        # Espera carregar (segurança)
        time.sleep(4) 

        # 1. Pega TODO o texto
        texto_pagina = driver.find_element(By.TAG_NAME, "body").text
        
        # 2. Divide em linhas
        linhas = texto_pagina.split('\n')
        
        # 3. ACESSA AS LINHAS QUE VOCÊ DESCOBRIU (34, 35 e 36)
        # Importante: O Python conta a partir do 0.
        # Se você viu "[34]" no print anterior, use 34 mesmo.
        
        # Verificação de segurança: Só tenta pegar se a lista for grande o suficiente
        if len(linhas) > 36:
            dado_linha_34 = linhas[34]
            dado_linha_35 = linhas[35]
            dado_linha_36 = linhas[36]

            print("\n" + "="*30)
            print(" RESUMO FINANCEIRO (ITUB3)")
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