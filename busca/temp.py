import os
import shutil
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from webdriver_manager.firefox import GeckoDriverManager

# 1. LIMPEZA DE TERRENO (Mata processos presos no Linux)
os.system("pkill geckodriver")
os.system("pkill firefox")

# 2. PREPARANDO O TERRENO (Configuração Anti-Erro do Snap)
# Cria uma pasta local para o perfil, fugindo da pasta /tmp bloqueada
caminho_perfil = os.path.abspath("perfil_firefox_temp")
if not os.path.exists(caminho_perfil):
    os.makedirs(caminho_perfil)

options = Options()
# Diz para o Firefox usar essa pasta liberada
options.add_argument("-profile")
options.add_argument(caminho_perfil)

# Se precisar, descomente a linha abaixo para apontar onde o Firefox está instalado
# options.binary_location = "/snap/bin/firefox" 

# 3. INICIANDO
try:
    print("Tentando iniciar o Firefox...")
    servico = Service(GeckoDriverManager().install())
    
    # O SEGREDO ESTÁ AQUI: Passar 'options=options'
    driver = webdriver.Firefox(service=servico, options=options)
    
    print("Navegador aberto com sucesso!")

    # --- SEU CÓDIGO DE EXTRAÇÃO CONTINUA AQUI EMBAIXO ---
    # ... cole a parte do driver.get(...) aqui ...

except Exception as e:
    print(f"\nERRO CRÍTICO: {e}")
    print("Dica: Se o erro persistir, tente reiniciar o computador para limpar a memória.")