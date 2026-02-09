import os
import time
import secrets
import pathlib
from pathlib import Path
import pandas as pd
import sys
sys.path.append(str(Path(__file__).parent.parent / 'arq' / 'src'))
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
        return resultados
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















import tkinter as tk
from tkinter import ttk
import webbrowser
import cota as ct
import pathlib
from datetime import datetime
import pandas as pd
import threading
import time

import os
import time
import secrets
import pathlib
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from concurrent.futures import ThreadPoolExecutor


class Main:
    def __init__(self, root):

        self.root = root
        self.root.title("Investment App")
        self.root.geometry("1000x700")
        self.frame = tk.Frame(root, bg="#f0f0f0", pady=10)
        self.label = tk.Label(root, text="Investment Search App")
        self.label.pack(pady=20)

        # Carrega os ativos
        self.simbolos, self.nome, self.black_list = ct.ativos()

        # =============================================  ESTILOS ==============================================
        style = ttk.Style()
        style.theme_use("clam") # 'clam', 'alt', 'default', 'classic'
        style.configure("Treeview", rowheight=18, font=('Arial', 10))                                  # estilo das linhas da tabela
        style.configure("Treeview.Heading", font=('Arial', 11, 'bold'))                                # estilo do cabeçalho da tabela
        style.configure("TProgressbar", thickness=20, troughcolor='#d3d3d3', background='#4caf50') # barra de progresso
        style.configure("TButton", thickness=20, font=('Arial', 10,"bold"), background="#3A84CA")    # botões

       # ========================================= ADICIONANDO PAINEIS ========================================
        
        # Painel Mestre 
        self.painel_mestre = ttk.PanedWindow(orient=tk.HORIZONTAL)# orient=HORIZONTAL significa: coloque um ao lado do outro
        self.painel_mestre.pack(fill="both", expand=True, padx=5, pady=5)

        #  Painel esquerdo
        self.painel_esquerdo = ttk.PanedWindow(orient=tk.VERTICAL) # orient=VERTICAL significa: coloque um em cima do outro
        
        # Adicionamos ele ao mestre ai Ele entra na esquerda pq é o primeiro a entrar
        self.painel_mestre.add(self.painel_esquerdo, weight=3) # weight=3 dá mais espaço para o conteúdo principal

        # Frame de cotações lado direito
        self.frame_cotacoes = tk.LabelFrame(self.painel_mestre, text=" Cotações ")
        
        # Adicionamos ao mestre assim Ele entra na direita, barra lateral
        self.painel_mestre.add(self.frame_cotacoes,weight=1) # weight=1 deixa ele mais estreito 

        # ============================== PREENCHANDO LADO ESQUERDO (CIMA - BAIXO) =============================
        
        # Superior Esquerda (Gráficos / Resumo)
        self.frame_conteudo_topo = tk.Frame(self.painel_esquerdo, bg="#e0e0e0") 
        self.lbl_titulo = tk.Label(self.frame_conteudo_topo, text="Área de Gráficos / Resumo Geral", font=("Arial", 16))
        self.lbl_titulo.pack(pady=50)

        # Adicionado na parte de cima do painel esquerdo
        self.painel_esquerdo.add(self.frame_conteudo_topo, weight=2)

        # Inferior Esquerda (Notícias)
        self.frame_noticias = tk.LabelFrame(self.painel_esquerdo, text=" Notícias ")
        
        # Adiciona na parte de baixo do painel esquerdo
        self.painel_esquerdo.add(self.frame_noticias)

        # Configurando a área de notícias com Canvas e Scrollbar
        self.canvas_news = tk.Canvas(self.frame_noticias) # Canvas para rolagem
        self.scroll_news = ttk.Scrollbar(self.frame_noticias, orient="vertical", command=self.canvas_news.yview) 
        self.frame_interno_news = tk.Frame(self.canvas_news) # Onde as notícias vão ficar
        
        # Configuração do scroll
        self.frame_interno_news.bind(
            "<Configure>",
            lambda e: self.canvas_news.configure(scrollregion=self.canvas_news.bbox("all")) # Atualiza a região de scroll
        )
        self.canvas_news.create_window((0, 0), window=self.frame_interno_news, anchor="nw") # Adiciona o frame interno ao canvas
        self.canvas_news.configure(yscrollcommand=self.scroll_news.set) # Liga a scrollbar ao canvas

        self.canvas_news.pack(side="left", fill="both", expand=True) #
        self.scroll_news.pack(side="right", fill="y") # 

        # ============================ PREENCHEMOS A COLUNA DA DIREITA (Cotações) =============================
        
       # Criando Tabela (Treeview)
        colunas = ("ativo", "preco", "var_reais", "var_porcent")
        self.tree = ttk.Treeview(self.frame_cotacoes, columns=colunas, show="headings")
        
        # Definindo cabeçalhos 
        self.tree.heading("ativo", text="Ticker")
        self.tree.heading("preco", text="Preço")
        self.tree.heading("var_reais", text="Var")
        self.tree.heading("var_porcent", text="(%)")
        
        # Definindo largura e alinhamento das colunas
        self.tree.column("ativo", width=70, anchor="center")
        self.tree.column("preco", width=70, anchor="center")
        self.tree.column("var_reais", width=70, anchor="center")
        self.tree.column("var_porcent", width=70, anchor="center")

        # Configurando as Cores para alta e baixa
        self.tree.tag_configure("alta", foreground="green")
        self.tree.tag_configure("baixa", foreground="red")
        
        self.tree.pack(fill="both", expand=True) # 

        # Barra de rolagem para a tabela
        scrollbar = ttk.Scrollbar(self.tree, orient="vertical", command=self.tree.yview) 
        scrollbar.pack(side="right", fill="y")
        self.tree.configure(yscroll=scrollbar.set)
        self.tree.pack(fill="both", expand=True)

        # ================================ BARRA DE PROGRESSO E BOTÃO BUSCAR ==================================

        # Frame base para barra de progresso e botão
        self.frame_base = tk.Frame(self.frame_cotacoes, borderwidth=1,) # Frame para a barra de progresso e botão
        self.frame_base.pack(fill="x") # 
        self.progresso = ttk.Progressbar(self.frame_base, length=200,) # Barra de progresso
        self.progresso.pack_forget()  # Esconde inicialmente
        # Botão de busca
        self.search_button = ttk.Button(self.frame_base, text="Buscar Investimentos", command=self.buscar_investimentos)
        self.search_button.pack(pady=10, side="left", padx=5)

        # ========================================= RODAPÉ COM STATUS =========================================
        
        # Frame inferior para status e data/hora
        self.frame_bottom = tk.Frame(root, relief="solid", borderwidth=1, pady=5)
        self.frame_bottom.pack(fill="x")
        # Labels de status 
        self.status_label = tk.Label(self.frame_bottom, text="Status: ", font=("Arial", 10))
        self.status_label.pack(fill="x", padx=20, side ="left",)
        # Label de data/hora
        self.label_data = tk.Label(self.frame_bottom, text="Carregando data...", font=("Arial", 10))
        self.label_data.pack(side="right") 
        self.atualizar_relogio() # Inicia o relógio

    def atualizar_relogio(self):
        """Atualiza o relógio no rodapé"""
        agora = datetime.now().strftime("%d/%m/%Y - %H:%M:%S")
        self.label_data.config(text=f"{agora}")
        self.root.after(1000, self.atualizar_relogio)

    def buscar_investimentos(self):
        """Inicia a thread para não travar a tela"""

        self.progresso.pack(side="right", padx=5, pady=5,)  # Mostra a barra de progresso
        self.tree.delete(*self.tree.get_children()) # Limpa tabela
        
        #for widget in self.frame_interno_news.winfo_children(): # Limpa noticias
        #    widget.destroy()
        
        # Inicia a thread para trabalhar em segundo plano
        t = threading.Thread(target=self.processo_de_busca) 
        t.start()

    def processo_de_busca(self):
        
        dados_ativo = {
            "simbolo": [],
            "preço": [],
            "variação": [],
            "variação_porcentagem": [],
            "horario": []
            }
        
        # Simulando Ativos
        ativos_exemplo = ["ITUB3", "VALE3", "PETR4", "MGLU3", "WEGE3"]
        
        #Simulando Notícias
        noticias_fake = [
           ("Dólar cai para R$ 4,90 com otimismo externo", "https://google.com"),
           ("Bolsa sobe 1% puxada por bancos", "https://uol.com.br"),
           ("Inflação desacelera em janeiro", "https://g1.globo.com")
        ]
        
        for titulo, link in noticias_fake: 
           # Usamos after para mexer na interface de dentro da thread
           self.root.after(0, self.adicionar_noticia, titulo, link)
        

        inicio = time.time()

    # Inicia a extração usando paralelismo para acelerar o o processo de extração
        with ThreadPoolExecutor(max_workers=6) as executor:
            resultados = list(executor.map(ct.extrair_dados, self.simbolos)) # Guarda os dados em resultados

        try:
            # Remove todos os dados que retornou vazio (None)
            resultados.remove((None, None, None))

            # Verifica se resultados está vazio
            if len(resultados) == 0:
                # Envia uma mensagem de Erro em meio da execução
                raise ValueError("Nenhum dado válido foi extraído.")
            else:
                # Extrai os dados de resultados e organiza em um dicionario
                for linha, simbolo in (resultados, self.simbolos): # Os simbolos são como os id 
                    
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
                ct.salvar_dados(dados_ativo)
            else:
                print("Nenhum dado válido para salvar.")
            return resultados
        except:
            print("Erro ao salvar os dados.")





        total = len(self.simbolos)
        for i, ativo in enumerate(self.simbolos):
         
            extraido = ct.extrair_dados(ativo)
            
            # --- CALLBACK DA BARRA DE PROGRESSO ---
            # Chama a função de atualização da interface
            self.root.after(0, self.atualizar_barra, i+1, total, f"Lendo {ativo}...")

            preco = f"R$ {extraido[0]:.2f}"
            var_r = f"{extraido[2]:+.2f}"
            var_p = f"{extraido[1]:+.2f}%"

            # Adiciona na tabela
            self.root.after(0, self.adicionar_acao, ativo, preco, var_r, var_p)

        self.root.after(0, self.atualizar_barra, 100, 100, "Concluído!")
        self.progresso.pack_forget()  # Esconde a barra de progresso

    def adicionar_noticia(self, titulo, url):
        """Cria um link clicável no painel de notícias"""
        lbl = tk.Label(self.frame_interno_news, text=f"• {titulo}", 
                       fg="blue", cursor="hand2", font=("Arial", 10, "underline"), wraplength=280, justify="left")
        lbl.pack(anchor="w", pady=5, padx=5)
        # Evento de clique
        lbl.bind("<Button-1>", lambda e: webbrowser.open_new(url))

    def adicionar_acao(self, ativo, preco, var_reais, var_porcent):
        """Adiciona uma linha na tabela com a cor certa"""
        # Limpa formatação de texto para verificar se é positivo ou negativo
        try:
            valor_teste = float(var_reais.replace(",", ".").replace("+", ""))
            tag = "alta" if valor_teste >= 0 else "baixa"
        except:
            tag = "alta" # Padrão se der erro

        self.tree.insert("", "end", values=(ativo, preco, var_reais, var_porcent), tags=(tag,))

    def atualizar_barra(self, valor_atual, total, mensagem):
        """Função que será chamada pelo seu script de scraping"""
        porcentagem = (valor_atual / total) * 100
        self.progresso['value'] = porcentagem
        self.status_label.config(text=mensagem)
        self.root.update_idletasks() # Força a interface a desenhar agora


    def extrair_dados(cota):
        driver = ct.configurar_driver() # Configuração de uso e drive do chrome 
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
            if ct.detecta_ruido(dado_linha_35, dado_linha_36, cota):
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


if __name__ == "__main__":
    root = tk.Tk()
    app = Main(root)
    root.mainloop()

    caminho_csv = pathlib.Path(__file__).parent.parent.resolve()
    caminho_csv = caminho_csv / 'ativos.csv'

    simbolos, nomes, ln = ativos()
    iniciar_extracao(simbolos, nomes, 2)




