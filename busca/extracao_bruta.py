import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

servico = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=servico)

try:
    print("Acessando Google Finance...")
    driver.get("https://www.google.com/finance/quote/ITUB3:BVMF")
    time.sleep(4) # Espera um pouco mais para garantir

    # Pega TODO o texto da página
    texto_pagina = driver.find_element(By.TAG_NAME, "body").text
    
    # Divide o texto em uma lista de linhas
    linhas = texto_pagina.split('\n')
    
    print("\n--- MAPA DA PÁGINA (Raio-X) ---")
    print("Procure onde o preço aparece e anote o número da linha (Índice)\n")
    
    # Vamos imprimir apenas as primeiras 30 linhas, onde o preço costuma ficar
    for indice, linha in enumerate(linhas[:50]):
        # Se a linha não estiver vazia, imprime
        if linha.strip():
            print(f"[{indice}] {linha}")

    print("\n---------------------------------")
    
except Exception as e:
    print(e)
finally:
    driver.quit()