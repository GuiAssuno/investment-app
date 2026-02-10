import tkinter as tk
from tkinter import ttk
from datetime import datetime
import threading
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
import requests
import webbrowser
from bs4 import BeautifulSoup
import yfinance as yf
import time
import os
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.resolve() / 'arq' / 'src'))
import funcoes
sys.path.append(str(Path(__file__).parent.parent.parent / 'banco' / 'connection'))
import classBanco

# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.chrome.options import Options
# from webdriver_manager.chrome import ChromeDriverManager
# from concurrent.futures import ThreadPoolExecutor


class Main:
    def __init__(self, root):

        self.root = root
        self.root.title("Investment App")
        self.root.geometry("1000x700")
        self.frame = tk.Frame(root, bg="#f0f0f0", pady=10)
        self.label = tk.Label(root, text="Investment Search App")
        self.label.pack(pady=20)
        self.bd_invest = classBanco.BaDa()
        self.lista_tickers = self.bd_invest.carregar_ticker()
        self.noticias = {}

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
        self.tree.tag_configure("Alta", foreground="green")
        self.tree.tag_configure("Neutro", foreground="yellow")
        self.tree.tag_configure("Baixa", foreground="red")
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
        tn = threading.Thread(target= self.adiciona_noticia) 
        tn.start()

    def atualizar_relogio(self):
        """Atualiza o relógio no rodapé"""
        agora = datetime.now().strftime("%d/%m/%Y - %H:%M:%S")
        self.label_data.config(text=f"{agora}")
        self.root.after(1000, self.atualizar_relogio)

    def busca_noticia(self):
        links = {
            "https://investnews.com.br/economia/page/540/?_gl=1%2Ali6itt%2Agclid%2AQ2p3S0NBanctYi1rQmhCLUVpd0E0ZnZLckVuMS1NV1lpRWswLTJWalpSbURoX2tGTU43b3dWQXpKNE1tc3V0SnBMZkhKN3FzNXRESm1Cb0NELXNRQXZEX0J3RQ..%2A_gcl_aw%2AR0NMLjE2ODcyODU1NzIuQ2p3S0NBanctYi1rQmhCLUVpd0E0ZnZLckVuMS1NV1lpRWswLTJWalpSbURoX2tGTU43b3dWQXpKNE1tc3V0SnBMZkhKN3FzNXRESm1Cb0NELXNRQXZEX0J3RQ..&noamp=mobile&gad_source=1&gad_campaignid=17459268635&gclid=CjwKCAiAqKbMBhBmEiwAZ3UboPjtNpeA1nAIdZIkw3sKxjCBLdy0mo8WZ4oz3Hjq9ft6ih084H4oeRoC_ncQAvD_BwE": ["category-posts-content","h2"],
            "https://g1.globo.com/economia/" : ["column areatemplate-esquerda large-15 large-offset-0 xlarge-14 xlarge-offset-1 float-left","h2"],
            "https://www.infomoney.com.br/economia/" : ["max-w-9xl mx-auto","h2"],
            "https://www.cnnbrasil.com.br/economia/": ["grid lg:grid-cols-3 lg:gap-8 lg:border-t lg:border-neutral-300 lg:py-0 lg:pb-8 lg:pt-8 lg:*:py-0","h2"],
            "https://g1.globo.com/politica/": ["theme","h2"],
            "https://www.cnnbrasil.com.br/politica/": ["lg:mt-2","h3"],
            "https://noticias.uol.com.br/politica/": ["flex-wrap ","h3"],
            "https://jovempan.com.br/noticias/politica": ["main col-md-8","h2"]
        }

        noticias = []

        for link, acha in links.items():
            try:
                resposta = requests.get(link)
                soup = BeautifulSoup(resposta.content, 'html.parser')
                    
                news_lista = soup.find(class_= f'{acha[0]}')
                ultimas = news_lista.find_all(f'{acha[1]}')

                noticias.append(ultimas)

            except:
                print(f'Erro no {link}' )
        
        dic_news={}

        for news in ultimas:
            link = news.find('a')
            dic_news[f'{news.text}'] = link.attrs['href']
            #print(f"Artigo: {news.text}\n  Link: {link.attrs['href']}")

        return dic_news
    
    def adiciona_noticia(self, tempo=100000):
        """Atualiza a barra de noticias automaticamente a cada um intervalo"""
        NoticiaAntiga = self.noticias

        self.noticias = self.busca_noticia()
        
        if self.noticias != NoticiaAntiga:
            for widget in self.frame_interno_news.winfo_children(): # Limpa noticias
                widget.destroy()
            
            for titulo, link in self.noticias.items():    
                lbl = tk.Label(self.frame_interno_news, text=f"• {titulo}", 
                            fg="blue", cursor="hand2", font=("Arial", 10, "underline"), wraplength=280, justify="left")
                lbl.pack(anchor="w", pady=5, padx=5)
                # Evento de clique
                lbl.bind("<Button-1>", lambda e: webbrowser.open_new(link))
            
        self.root.after(tempo, self.adiciona_noticia)

    def buscar_investimentos(self):
        """Inicia a thread para não travar a tela"""

        self.progresso.pack(side="right", padx=5, pady=5,)  # Mostra a barra de progresso
        self.tree.delete(*self.tree.get_children()) # Limpa tabela
        
        #for widget in self.frame_interno_news.winfo_children(): # Limpa noticias
        #    widget.destroy()
        
        # Inicia a thread para trabalhar em segundo plano
        # with ThreadPoolExecutor() as exe:
        #     result = exe.submit(funcoes.processo_de_busca)
        t = threading.Thread(target= self.processo_de_busca) 
        t.start()
        
    
    def processo_de_busca(self):

        inicio = time.time()

        tickers_formatados = [t + ".SA" 
                            if not t.endswith(".SA") else t 
                            for t in self.lista_tickers]
        
        string_tickers = " ".join(tickers_formatados)

        dados = yf.download(string_tickers, period="2d", group_by='ticker', threads=True, progress=False)

        lista_final = []

        for ticker in tickers_formatados:
            try:
                # Acessa os dados desse ticker
                df_ativo = dados[ticker]
                df_ativo = df_ativo.dropna()

                if len(df_ativo) < 1:
                    continue

                # Pega preço atual
                preco_atual = df_ativo['Close'].iloc[-1]
                
                # Tenta calcular variação
                if len(df_ativo) >= 2:
                    fechamento_ontem = df_ativo['Close'].iloc[-2]
                    var_reais = preco_atual - fechamento_ontem
                    var_pct = (var_reais / fechamento_ontem) * 100
                else:
                    var_reais = 0.0
                    var_pct = 0.0

                # Limpa o nome
                simbolo_limpo = ticker.replace(".SA", "")
                
                lista_final.append({
                    "Ativo": simbolo_limpo,
                    "Preço": f"R$ {preco_atual:.2f}",
                    "Var R$": f"{var_reais:+.2f}",
                    "Var %": f"{var_pct:+.2f}%",
                    "Status": "Alta" if var_reais > 0 else ("Baixa" if var_reais < 0 else "Neutro")
                })

            except KeyError:
                print(f"Erro: Dados não encontrados para {ticker}")
                continue

        fim = time.time()
        print(f"Tempo {fim - inicio:.2f}")

        df_final = pd.DataFrame(lista_final)
        t = threading.Thread(target= funcoes.salvar_dados, args=(df_final,)) 
        t.start()

        print("Sem Problemas")
        self.adicionar_acao( df_final)

    def adicionar_acao(self, df_resultado):
        """Adiciona uma linha na tabela com a cor certa"""
        try:
            total = len(df_resultado)
            for i, linha in df_resultado.iterrows():
                
                ativo = linha['Ativo']
                # BARRA DE PROGRESSO
                self.root.after(0, self.atualizar_barra, i+1, total, f"Lendo {ativo}...")

                preco = f"{linha['Preço']}"
                var_r = f"{linha['Var R$']}"
                var_p = f"{linha['Var %']}"

            # Limpa formatação de texto para verificar se é positivo ou negativo
            #valor_teste = float(var_reais.replace(",", ".").replace("+", ""))
                
                tag = linha['Status']

                self.tree.insert("", "end", values=(ativo, preco, var_r, var_p), tags=(tag,))
        except Exception as c:
                    print(f'Erro => {c}')

    def atualizar_barra(self, valor_atual, total, mensagem):
        """Função que será chamada pelo seu script de scraping"""
        porcentagem = (valor_atual / total) * 100
        self.progresso['value'] = porcentagem
        self.status_label.config(text=mensagem)
        self.root.update_idletasks() # Força a interface a desenhar agora

if __name__ == "__main__":
    root = tk.Tk()
    app = Main(root)
    root.mainloop()

    # '/home/lola/VScode/investment-app/arq/src/funcoes.py'
    # '/home/lola/VScode/investment-app/arq/src'
    # print()