import os

# Define a pasta atual como local para arquivos temporários
# Isso evita o bloqueio do Snap na pasta /tmp do sistema
os.environ['TMPDIR'] = os.getcwd() 
# Ou, se preferir uma subpasta para não bagunçar: 
# os.environ['TMPDIR'] = os.path.join(os.getcwd(), 'temp_selenium')
# if not os.path.exists(os.environ['TMPDIR']): os.makedirs(os.environ['TMPDIR'])

import pandas as pd
from bs4 import BeautifulSoup 
import requests
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

# 1. Configurações do Firefox
options = Options()
# options.add_argument("--headless")  # Descomente para rodar sem abrir a janela (bom para servidores)

# 2. Inicialização do Driver com Gerenciador Automático
# A mágica do webdriver_manager acontece aqui, ele baixa e acha o driver certo no Linux
servico = Service(GeckoDriverManager().install())

try:
    print("Iniciando o navegador...")
    driver = webdriver.Firefox(service=servico, options=options)

    # 3. Navegar até o site (Exemplo: Google)
    driver.get("https://www.google.com")
    
    # 4. Encontrar elementos e interagir
    # O Google muda os IDs, então usamos o atributo 'name="q"' que é a barra de busca
    search_box = driver.find_element(By.NAME, "q") 
    
    termo = "Automação com Python e Selenium"
    search_box.send_keys(termo)
    search_box.send_keys(Keys.RETURN) # Aperta Enter

    # 5. Espera Explícita (Conceito CRUCIAL)
    # Espera até que os resultados apareçam (id 'search' é o container de resultados do Google)
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.ID, "search")))

    # 6. Extração de Dados
    # Pegando os títulos dos resultados (Geralmente são tags <h3>)
    resultados = driver.find_elements(By.TAG_NAME, "h3")
    
    print(f"\n--- Resultados para: {termo} ---\n")
    for resultado in resultados:
        texto = resultado.text
        if texto: # Filtra vazios
            print(f"Título: {texto}")

except Exception as e:
    print(f"Ocorreu um erro: {e}")

finally:
    # 7. Sempre feche o navegador para não travar a memória RAM do Linux
    if 'driver' in locals():
        driver.quit()
