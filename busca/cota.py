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
import interface

def ativos(caminho_csv):
    #lista_teste_negra = ['NORD3','OIBR3','OSXB3','PEAB3','REDE3','RRIOS','RPAD3','RSID3','SNSY3','SOND3','TKNO3','TRIS3','VVAR3','TOTS3','WIZS3']
    path = (pathlib.Path(__file__).parent.resolve()) / 'lista-negra.csv'
    print("Caminho lista negra:", caminho_csv)
    try:
        df_negra = pd.read_csv(path)
        lista_negra = list(df_negra)
    except Exception as e:
        print("Erro no carregamento da lista negra:", {e})
        lista_negra = []
        pass
    
    print("Carregando ativos do CSV...")

    try:
        df = pd.read_csv(caminho_csv)
        if lista_negra != []:
            df = df[ ~df['id'].isin(lista_negra) ]
        print(f"Ativos na lista negra: {len(df['id'])}")
        return list(df['id']), list(df['Nome'])
    except KeyError as e:
        print("ERRO:", e)

def lista_negra(caminho_arquivo, cota):
    ja_existe = False
    try:
        if os.path.exists(caminho_arquivo):
            with open(caminho_arquivo, 'r') as f:
                conteudo = f.read()
                if cota in conteudo:
                    ja_existe = True
                print(f"O ativo {cota} já estava na lista negra. Não fiz nada.")
    except Exception as e:
        print("Erro ao verificar lista negra: ", e)
        return
    
    try:
        if not ja_existe:
            with open(caminho_arquivo, 'a') as f:
                f.write(f"{cota}\n")
                print(f"Sucesso! {cota} adicionado à lista negra.")
    except Exception as e:
        print("Erro ao adicionar à lista negra: ", e)
            
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

def extrair_dados(cota):

    driver = configurar_driver()
    try:
        driver.get(f"https://www.google.com/finance/quote/{cota}:BVMF")
        time.sleep(4) 
        if os.name == 'nt':
            ls = 'Today' #meu sistema é em inglês no windowns
        else:
            ls = 'Hoje' #meu sistema é em português no linux


        texto_pagina = driver.find_element(By.TAG_NAME, "body").text
        linhas = texto_pagina.replace(',','.').replace(f' {ls}','').replace('%','').replace('R$','').split('\n')
        
        dado_linha_34 = linhas[34]
        dado_linha_35 = linhas[35]
        dado_linha_36 = linhas[36]
        print(f"DADOS EXTRAÍDOS DA {cota}: {dado_linha_34}, {dado_linha_35}, {dado_linha_36}")
        try:
            c1 = (dado_linha_35 == '0.00' or (not isnumeric(dado_linha_35)))
            c2 = (dado_linha_36 == '0.00' or (not isnumeric(dado_linha_36)))
        except KeyError as e:
            print("Erro ao verificar condições: ", e)
        
        try:
            if c1 and c2:
                lista_negra(((pathlib.Path(__file__).parent.resolve()) / 'lista-negra.csv'), cota)
                
                return
        except KeyError as e:
            print("Erro ao adicionar à lista negra: ", e)
        
        print("\n" + "="*10)
        print(f"  {cota}  ")
        print("="*10)
        print(f"R$ {dado_linha_34}")
        print(f"   {dado_linha_35}")
        print(f"  {dado_linha_36}")
        print("="*10 + "\n")

        return dado_linha_34, dado_linha_36, dado_linha_35    
            
    except KeyError as e:
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

def iniciar_extracao(caminho_csv, qtd_workers):
    try:
        print("Carregando ativos...")
        simbolos, nomes = ativos(caminho_csv)
        print(f"Total de ativos para extrair: {len(simbolos)}")
        dados_ativo = {
            "simbolo": [],
            "preço": [],
            "variação": [],
            "variação_porcentagem": [],
            "horario": []}
    except Exception as e:
        print(f"Erro ao carregar ativos: {e}")
        return

    if os.name == 'nt':
        
        inicio = time.time()

        with ThreadPoolExecutor(max_workers=qtd_workers) as executor:
            resultados = list(executor.map(extrair_dados, simbolos))

        try:
            reresultados.remove((None, None, None))
            if len(resultados) == 0:
                raise ValueError("Nenhum dado válido foi extraído.")
            else:
                for linha, simbolo in (resultados, simbolos):
                    if None in linha:
                        continue
                    dados_ativo["simbolo"].append(simbolo)
                    dados_ativo["preco"].append(linha[0])
                    dados_ativo["variacao"].append(linha[2])
                    dados_ativo["variacao_porcentagem"].append(linha[1])
                    dados_ativo["horario"].append(pd.Timestamp.now().strftime('%d/%m/%Y - %H:%M:%S'))
        except ValueError:
            print("Nenhum dado válido foi extraído.")
    
        print("="*30)

        print(f"\nTempo total: {time.time() - inicio:.2f} segundos")
        
        try:
            if len(dados_ativo["simbolo"]) > 0:
                salvar_dados(dados_ativo)
            else:
                print("Nenhum dado válido para salvar.")
        except:
            print("Erro ao salvar os dados.")
    else:

        try:
            progress = len(simbolos)
            carregar = interface.Main()
            print("Iniciando extração sequencial...")
            for simbolo in simbolos:
                print(f"Extraindo dados para {simbolo}...")
                resultado = extrair_dados(simbolo)
                if resultado == None:
                    print(f"Dados inválidos para {simbolo}, pulando...")
                    continue
                preco, variacao, variacao_porcentagem = resultado
                dados_ativo["simbolo"].append(simbolo)
                dados_ativo["preço"].append(preco)
                dados_ativo["variação"].append(variacao)
                dados_ativo["variação_porcentagem"].append(variacao_porcentagem)
                dados_ativo["horario"].append(pd.Timestamp.now().strftime('%d/%m/%Y - %H:%M:%S'))
                carregar.prograss["value"] += (100 / progress)
                carregar.update_idletasks()
                progress -= 1
                time.sleep(2)
        except Exception as e:
            print(f"Erro durante a extração: {e}")    
        salvar_dados(dados_ativo)


if __name__ == "__main__":
    caminho_csv = pathlib.Path(__file__).parent.resolve()
    caminho_csv = caminho_csv / 'ativos.csv'
    iniciar_extracao(caminho_csv, qtd_workers=2)