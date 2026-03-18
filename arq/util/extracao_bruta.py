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
    time.sleep(4)

    # Pega  o texto da página
    texto_pagina = driver.find_element(By.TAG_NAME, "body").text
    
    # TRANSFORMA EM UMA LISTA DE LINHAS
    linhas = texto_pagina.split('\n')
    
    print("\n--- MAPA DA PÁGINA (Raio-X) ---")
    print("Procure onde o preço aparece e anote o número da linha (Índice)\n")
    
    #  imprimir as 30 primeiras  linhas
    for indice, linha in enumerate(linhas[:50]):
        if linha.strip():
            print(f"[{indice}] {linha}")

    print("\n---------------------------------")
    
except Exception as e:
    print(e)
finally:
    driver.quit()
