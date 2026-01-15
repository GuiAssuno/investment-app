import os
import time
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

# --- CONFIGURAÇÃO (Mantendo a correção para seu Linux) ---
os.environ['TMPDIR'] = os.getcwd()

options = Options()
# O site da B3 as vezes bloqueia robôs. Vamos definir um tamanho de janela real.
options.add_argument("--window-size=1920,1080") 

servico = Service(GeckoDriverManager().install())
driver = webdriver.Firefox(service=servico, options=options)

try:
    print("Acessando B3...")
    driver.get("https://www.b3.com.br/pt_br/busca/?query=ITUB3")

    # 1. O DESAFIO DA B3 (Shadow DOM e iFrames)
    # A B3 demora para carregar os resultados. Precisamos de uma espera explícita robusta.
    # Vamos esperar até que o container de resultados apareça.
    # Dica: Ao inspecionar a B3, vemos que os resultados ficam em uma div com classe 'fundo-busca-resultados' 
    # ou os links possuem uma classe específica.
    
    wait = WebDriverWait(driver, 20) # B3 é lenta, aumentei para 20s
    
    print("Aguardando carregamento dos resultados...")
    
    # Estratégia: Esperar pelo primeiro link de resultado aparecer.
    # Na busca da B3, os títulos geralmente são tags <h2> ou <a> dentro de uma lista.
    # Vamos procurar por elementos que contêm o termo "ITUB" no link ou título.
    # Uma classe comum em resultados de busca é often 'resultado-busca' ou similar.
    # Porém, vamos usar uma estratégia genérica poderosa: CSS Selector.
    
    # Este seletor procura: qualquer <a> (link) que tenha um <h3> (título) dentro
    # OU procura pela div específica de resultados (ajuste conforme o layout atual da B3)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".s-results"))) 

    # 2. EXTRAINDO OS DADOS
    # Na B3, cada bloco de resultado costuma ter uma classe como "s-result-item"
    resultados = driver.find_elements(By.CSS_SELECTOR, ".s-result-item")

    print(f"\nEncontrados {len(resultados)} resultados. Extraindo dados:\n")

    for item in resultados:
        try:
            # Tenta pegar o título (geralmente num h3 ou h4)
            titulo_element = item.find_element(By.TAG_NAME, "h3")
            titulo = titulo_element.text
            
            # Tenta pegar o link (tag 'a')
            link_element = item.find_element(By.TAG_NAME, "a")
            link = link_element.get_attribute("href")
            
            # Tenta pegar o resumo/descrição (geralmente tag p)
            try:
                resumo = item.find_element(By.TAG_NAME, "p").text
            except:
                resumo = "Sem descrição"

            if titulo:
                print(f"INFO: {titulo}")
                print(f"LINK: {link}")
                print("-" * 30)
                
        except Exception as erro_interno:
            # As vezes um elemento específico falha, mas não queremos parar o loop
            continue

except Exception as e:
    print(f"Erro principal: {e}")
    # Dica de Debug: Tire um print da tela se der erro para ver o que o robô estava vendo
    driver.save_screenshot("erro_b3.png")

finally:
    driver.quit()



try:
    # 1. Aguarda o preço aparecer na tela para garantir que o site carregou
    wait = WebDriverWait(driver, 20)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tv-widget-chart__price-value")))

    # --- AQUI COMEÇA A EXTRAÇÃO BASEADA NA SUA FOTO ---

    # PREÇO (R$ 37.12)
    # A classe é aquele texto longo verde na sua foto
    elemento_preco = driver.find_element(By.CLASS_NAME, "tv-widget-chart__price-value")
    preco = elemento_preco.text  # O .text junta automaticamente o "37.1" com o "2"

    # MOEDA (BRL)
    # Na foto, tem uma classe chamada 'js-symbol-currency'
    elemento_moeda = driver.find_element(By.CLASS_NAME, "js-symbol-currency")
    moeda = elemento_moeda.text

    # VARIAÇÃO (+0.49)
    # Na foto, veja que existe um id="delta"
    elemento_delta = driver.find_element(By.ID, "delta")
    var_valor = elemento_delta.text

    # PORCENTAGEM (+1.34%)
    # Na foto, logo abaixo, tem um id="delta-pt"
    elemento_porcent = driver.find_element(By.ID, "delta-pt")
    var_porcent = elemento_porcent.text

    # --- EXIBINDO OS RESULTADOS ---
    print("-" * 30)
    print(f"Preço Atual: {moeda} {preco}")
    print(f"Variação R$: {var_valor}")
    print(f"Variação % : {var_porcent}")
    print("-" * 30)

except Exception as e:
    print(f"Erro ao encontrar os elementos: {e}")