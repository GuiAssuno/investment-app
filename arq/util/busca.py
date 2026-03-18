import os

# Define a pasta atual como local para arquivos temporários
os.environ['TMPDIR'] = os.getcwd() 

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

# 2. Inicialização do Driver com Gerenciador Automático
# A mágica do webdriver_manager acontece aqui, ele baixa e acha o driver certo no Linux
servico = Service(GeckoDriverManager().install())

try:
    print("Iniciando o navegador...")
    driver = webdriver.Firefox(service=servico, options=options)

    #  Navegar até o site 
    driver.get("https://www.google.com")
    
    # Encontrar elementos e interagir
    # O Google muda os IDs, então usaR o atributo 'name="q"' que é a barra de busca
    search_box = driver.find_element(By.NAME, "q") 
    
    termo = "Automação com Python e Selenium"
    search_box.send_keys(termo)
    search_box.send_keys(Keys.RETURN) # Aperta Enter

    # Espera até que os resultados apareçam 
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.ID, "search")))

    # Pegando os títulos dos resultados
    resultados = driver.find_elements(By.TAG_NAME, "h3")
    
    print(f"\n--- Resultados para: {termo} ---\n")
    for resultado in resultados:
        texto = resultado.text
        if texto: 
            print(f"Título: {texto}")

except Exception as e:
    print(f"Ocorreu um erro: {e}")

finally:
    # SEMPRE feche o navegador para não travar a memória RAM
    if 'driver' in locals():
        driver.quit()
