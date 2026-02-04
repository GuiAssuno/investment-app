import os
import time
import secrets
import pathlib
from pathlib import Path
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from concurrent.futures import ThreadPoolExecutor
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import interface

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

def isnumeric(s):
    """Verifica se uma string é numérica"""
    try:
        float(s)
        return True
    except ValueError:
        return False

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

def ativos():
    # Caminho lista negra
    path = (pathlib.Path(__file__).parent.parent.resolve()) 
    black_list = path / 'lista_tickers' / 'lista-negra.csv'

    # Caminho ativos
    caminho_csv = path / 'lista_tickers' / 'ativos.csv'

    try: # Tenta pegar o conteudo dentro da lista negra
        df_negra = pd.read_csv(black_list)

        # Transforma o conteudo em uma lista
        lista_negra = list(df_negra) 
    except Exception as e:
        print("Erro no carregamento da lista negra:", {e})
        lista_negra = []
        pass

    try: # Tenta obter o conteudo do arquivo ativos.csv
        df = pd.read_csv(caminho_csv)

        # Se a lista negra não estiver vazia 
        if lista_negra != []:
            # Retira todos os ativos que estão na lista negra
            df = df[ ~df['id'].isin(lista_negra) ] 

        #print(f"Quantdade lista negra: {type(lista_negra)}")
        return list(df['id']), list(df['Nome']), lista_negra
    
    except KeyError as e:
        print("ERRO:", e)

def detecta_ruido(dado_linha_35,dado_linha_36, cota):
        
    try: # As linhas 35 e 36 quando a cota está inativa ou sem movimentação 
        c1 = (dado_linha_35 == '0.00' or (not isnumeric(dado_linha_35))) # Recebe True or False, ao checar a linha 35
        c2 = (dado_linha_36 == '0.00' or (not isnumeric(dado_linha_36))) # Recebe True or False, ao checar a linha 36
        
        # Caso detecta os ruidos a cota é adicionada a lista negra para evitar raspagem desnecessarias
        if c1 and c2:
            lista_negra(((pathlib.Path(__file__).parent.resolve()) / 'lista-negra.csv'), cota)
            return True
        else: 
            return False
    except KeyError as e:
        print("Erro ao verificar condições: ", e)
        return True

def extrair_dados(cota):

    driver = configurar_driver() # Configuração de uso e drive do chrome 
    try:
        # Site do google finance que atualiza em tempo real
        driver.get(f"https://www.google.com/finance/quote/{cota}:BVMF")

        # Time é usado aqui para dar um delay esperar a pagina carregar e evitar block
        time.sleep(4) 
        if os.name == 'nt':
            ls = 'Today' #meu sistema é em inglês no windowns
        else:
            ls = 'Hoje' #meu sistema é em português no linux

        # Raspa toda a pagina e retorna uma lista das linhas da pagina
        texto_pagina = driver.find_element(By.TAG_NAME, "body").text
        # Limpo a "sujeira" dos dados da pagina
        linhas = texto_pagina.replace(',','.').replace(f' {ls}','').replace('%','').replace('R$','').split('\n')
        
        # Breviamente foi feito um teste e assim foi descoberto que as linha que tem as informações de valor são
        dado_linha_34 = linhas[34] # Preço
        dado_linha_35 = linhas[35] # Variação
        dado_linha_36 = linhas[36] # Variação porcentagem

        # print(f"DADOS EXTRAÍDOS DA {cota}: {dado_linha_34}, {dado_linha_35}, {dado_linha_36}")

        # Função para detectar ruidos nas linha 35 e 36
        if detecta_ruido(dado_linha_35, dado_linha_36, cota):
            return None

        # print("\n" + "="*10)
        # print(f"  {cota}  ")
        # print("="*10)
        # print(f"R$ {dado_linha_34}")
        # print(f"   {dado_linha_35}")
        # print(f"  {dado_linha_36}")
        # print("="*10 + "\n")

        return dado_linha_34, dado_linha_36, dado_linha_35    
            
    except KeyError as e:
        print(f"Erro extrair dados: {e}")
        return None, None, None
    
    # Caso dê erro na raspagem fecha o navegador para não lotar a memoria
    finally:
        driver.quit()

def salvar_dados(dados_ativo):
    # Salvas os dados como data e hora
    hora = pd.Timestamp.now().strftime('%H-%M-%S_-_%Y_%m_%d')
    
    # Abre ou crie caso não exista um arquivo e salva todo os dados
    with open (f'{(pathlib.Path(__file__).parent.resolve())}/dado-do-dia/{hora}.csv', 'a') as f:
        # Cria o cabeçalho das colunas
        f.write('id,preco,variacao,porcento,horario\n')
        
        # Pega linha por linha e salva no arquivo 
        for i in range (len(dados_ativo['simbolo'])):
            f.write(f"{dados_ativo['simbolo'][i]},{dados_ativo['preço'][i]},{dados_ativo['variação'][i]},{dados_ativo['variação_porcentagem'][i]},{dados_ativo['horario'][i]}\n")

def iniciar_extracao(simbolos, nomes, quanti_nucleo=4):
    
    dados_ativo = {
            "simbolo": [],
            "preço": [],
            "variação": [],
            "variação_porcentagem": [],
            "horario": []}
    
    # try:
    #     # print("Carregando ativos...")
    #     # simbolos, nomes = ativos(caminho_csv)
    #     # print(f"Total de ativos para extrair: {len(simbolos)}")
        
    # except Exception as e:
    #     print(f"Erro ao carregar ativos: {e}")
    #     return

    
    inicio = time.time()

    # Inicia a extração usando paralelismo para acelerar o o processo de extração
    with ThreadPoolExecutor(max_workers=quanti_nucleo) as executor:
        resultados = list(executor.map(extrair_dados, simbolos)) # Guarda os dados em resultados

    try:
        # Remove todos os dados que retornou vazio (None)
        resultados.remove((None, None, None))

        # Verifica se resultados está vazio
        if len(resultados) == 0:
            # Envia uma mensagem de Erro em meio da execução
            raise ValueError("Nenhum dado válido foi extraído.")
        else:
            # Extrai os dados de resultados e organiza em um dicionario
            for linha, simbolo in (resultados, simbolos): # Os simbolos são como os id 
                
                # Verificação adicional para evitar dados vazios (None)
                if None in linha: 
                    continue # Proximo  da fila

                dados_ativo["simbolo"].append(simbolo)                   #
                dados_ativo["preco"].append(linha[0])                    #
                dados_ativo["variacao"].append(linha[2])                 #
                dados_ativo["variacao_porcentagem"].append(linha[1])     # 
                # Guarda o momento em que foi feito a extração
                dados_ativo["horario"].append( pd.Timestamp.now().strftime('%d/%m/%Y - %H:%M:%S'))  
    except ValueError:
        print("Nenhum dado válido foi extraído.")

    # print("="*30)

    print(f"\nTempo total: {time.time() - inicio:.2f} segundos")
    
    try:
        # Salva apenas se a lista não estiver vazia
        if len(dados_ativo["simbolo"]) > 0:
            salvar_dados(dados_ativo)
        else:
            print("Nenhum dado válido para salvar.")
    except:
        print("Erro ao salvar os dados.")

    #     try:
    #         progress = len(simbolos)
    #         carregar = interface.Main()
    #         print("Iniciando extração sequencial...")
    #         for simbolo in simbolos:
    #             print(f"Extraindo dados para {simbolo}...")
    #             resultado = extrair_dados(simbolo)
    #             if resultado == None:
    #                 print(f"Dados inválidos para {simbolo}, pulando...")
    #                 continue
    #             preco, variacao, variacao_porcentagem = resultado
    #             dados_ativo["simbolo"].append(simbolo)
    #             dados_ativo["preço"].append(preco)
    #             dados_ativo["variação"].append(variacao)
    #             dados_ativo["variação_porcentagem"].append(variacao_porcentagem)
    #             dados_ativo["horario"].append(pd.Timestamp.now().strftime('%d/%m/%Y - %H:%M:%S'))
    #             carregar.prograss["value"] += (100 / progress)
    #             carregar.update_idletasks()
    #             progress -= 1
    #             time.sleep(2)
    #     except Exception as e:
    #         print(f"Erro durante a extração: {e}")    
    #    salvar_dados(dados_ativo)


if __name__ == "__main__":
    caminho_csv = pathlib.Path(__file__).parent.parent.resolve()
    caminho_csv = caminho_csv / 'ativos.csv'

    simbolos, nomes, ln = ativos()
    iniciar_extracao(simbolos, nomes, 2)




    import pandas as pd
import glob
import os
import sys
from pathlib import Path

# Configuração
caminho = Path(__file__).parent.resolve()
print(caminho)
PASTA_DADOS = caminho / 'dado-do-dia' #"busca/dado-do-dia" # Nome da sua pasta 
ARQUIVO_SAIDA_SEQUENCIAL = "analise_sequencial.csv"
ARQUIVO_SAIDA_HORARIO = "analise_horario.csv"

def ler_csv_flexivel(caminho_arquivo):
    """Tenta ler o arquivo com diferentes encodings e separadores"""
    encodings = ['utf-8', 'latin-1', 'cp1252'] # Lista de tentativas
    separadores = [',', ';']
    
    for enc in encodings:
        for sep in separadores:
            try:
                df = pd.read_csv(caminho_arquivo, sep=sep, encoding=enc)
                # Teste básico: se leu só 1 coluna, provavelmente o separador está errado
                if df.shape[1] > 1:
                    return df
            except Exception:
                continue
    return None

def encontrar_coluna(df, possiveis_nomes):
    """Procura uma coluna no DataFrame ignorando maiúsculas/minúsculas"""
    colunas_df = [c.lower().strip() for c in df.columns]
    
    for nome in possiveis_nomes:
        if nome.lower() in colunas_df:
            # Retorna o nome REAL que está no DataFrame (ex: 'Preço')
            index = colunas_df.index(nome.lower())
            return df.columns[index]
    return None

def carregar_e_limpar_dados():
    print("--- 1. CARREGANDO DADOS ---")
    arquivos = glob.glob(os.path.join(PASTA_DADOS, "*.csv"))
    
    if not arquivos:
        print(f"Erro: Nenhum arquivo encontrado em '{PASTA_DADOS}'")
        return None

    lista_dfs = []
    coluna_preco_real = None
    coluna_data_real = None
    coluna_simbolo_real = None

    for arquivo in arquivos:
        df_temp = ler_csv_flexivel(arquivo)
        
        if df_temp is None:
            print(f"-> Erro ao ler {os.path.basename(arquivo)} (Arquivo corrompido?)")
            continue

        # Normaliza nomes das colunas na primeira passada bem sucedida
        if coluna_preco_real is None:
            coluna_preco_real = encontrar_coluna(df_temp, ['preço', 'preco', 'price', 'valor'])
            coluna_data_real = encontrar_coluna(df_temp, ['horario', 'data', 'hora', 'time', 'date'])
            coluna_simbolo_real = encontrar_coluna(df_temp, ['id', 'simbolo', 'ativo', 'ticker', 'code'])

            if not all([coluna_preco_real, coluna_data_real, coluna_simbolo_real]):
                print(f"-> Ignorando {os.path.basename(arquivo)}: Colunas não identificadas.")
                print(f"   Colunas encontradas: {list(df_temp.columns)}")
                coluna_preco_real = None # Reseta para tentar no próximo
                continue
            else:
                print(f"   Mapeamento detectado: ID='{coluna_simbolo_real}', Preço='{coluna_preco_real}', Hora='{coluna_data_real}'")

        # Garante que este arquivo tem as colunas que decidimos usar
        if coluna_preco_real in df_temp.columns and coluna_data_real in df_temp.columns:
            # Padroniza para nomes internos genéricos para facilitar o concat
            df_temp = df_temp.rename(columns={
                coluna_preco_real: 'preco_limpo',
                coluna_data_real: 'data_limpa',
                coluna_simbolo_real: 'simbolo_limpo'
            })
            # Seleciona apenas as colunas úteis para evitar erros de concatenação
            df_temp = df_temp[['simbolo_limpo', 'preco_limpo', 'data_limpa']]
            lista_dfs.append(df_temp)

    if not lista_dfs:
        print("Nenhum dado válido foi carregado.")
        return None

    # Junta tudo
    df_geral = pd.concat(lista_dfs, ignore_index=True)

    # --- LIMPEZA DE VALORES ---
    # Limpa o R$ e converte para float
    df_geral['preco_limpo'] = df_geral['preco_limpo'].astype(str).str.replace('R$', '', regex=False)
    df_geral['preco_limpo'] = df_geral['preco_limpo'].str.replace('.', '', regex=False) # Remove milhar (1.000)
    df_geral['preco_limpo'] = df_geral['preco_limpo'].str.replace(',', '.', regex=False) # Vírgula decimal
    df_geral['preco_limpo'] = pd.to_numeric(df_geral['preco_limpo'], errors='coerce')

    # Converte data
    df_geral['data_limpa'] = pd.to_datetime(df_geral['data_limpa'], dayfirst=True, errors='coerce')

    # Remove linhas que falharam na conversão (NaN)
    df_geral = df_geral.dropna(subset=['preco_limpo', 'data_limpa'])

    # Ordena
    df_geral = df_geral.sort_values(by=['simbolo_limpo', 'data_limpa'])

    print(f"Total carregado: {len(df_geral)} registros.")
    return df_geral

def analise_1_sequencial(df):
    print("\n--- 2. ANÁLISE SEQUENCIAL (Volatilidade) ---")
    
    df['preco_anterior'] = df.groupby('simbolo_limpo')['preco_limpo'].shift(1)
    df['horario_anterior'] = df.groupby('simbolo_limpo')['data_limpa'].shift(1)

    df['delta_valor'] = df['preco_limpo'] - df['preco_anterior']
    df['delta_tempo'] = df['data_limpa'] - df['horario_anterior']
    
    # Classificação
    df['tipo_movimento'] = df['delta_valor'].apply(
        lambda x: 'SUBIU' if x > 0.001 else ('CAIU' if x < -0.001 else 'ESTÁVEL')
    )

    # Filtra apenas onde temos comparação válida
    df_final = df.dropna(subset=['delta_valor'])
    
    colunas_saida = ['simbolo_limpo', 'data_limpa', 'preco_limpo', 'delta_valor', 'tipo_movimento', 'delta_tempo']
    df_final[colunas_saida].to_csv(ARQUIVO_SAIDA_SEQUENCIAL, index=False)
    print(f"Salvo: {ARQUIVO_SAIDA_SEQUENCIAL}")

def analise_2_horario(df):
    print("\n--- 3. ANÁLISE POR HORÁRIO (Sazonalidade) ---")
    
    df = df.copy() # Evita avisos
    df['hora'] = df['data_limpa'].dt.hour
    
    # Recalcula direção para garantir
    prev = df.groupby('simbolo_limpo')['preco_limpo'].shift(1)
    change = df['preco_limpo'] - prev
    df['direcao'] = change.apply(lambda x: 'Alta' if x > 0.001 else ('Baixa' if x < -0.001 else 'Neutro'))
    
    # Tabela dinâmica
    resumo = df.groupby(['hora', 'direcao']).size().unstack(fill_value=0)
    
    if 'Alta' in resumo.columns and 'Baixa' in resumo.columns:
        resumo['Saldo_Alta_vs_Baixa'] = resumo['Alta'] - resumo['Baixa']
    
    print(resumo)
    resumo.to_csv(ARQUIVO_SAIDA_HORARIO)
    print(f"Salvo: {ARQUIVO_SAIDA_HORARIO}")

if __name__ == "__main__":
    dados = carregar_e_limpar_dados()
    if dados is not None:
        analise_1_sequencial(dados)
        analise_2_horario(dados)