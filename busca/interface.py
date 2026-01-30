import tkinter as tk
from tkinter import ttk
import webbrowser
import cota 
import pathlib
from datetime import datetime
import threading
import time

class Main:
    def __init__(self, root):

        self.root = root
        self.root.title("Investment App")
        self.root.geometry("1000x700")
        self.frame = tk.Frame(root, bg="#f0f0f0", pady=10)
        self.label = tk.Label(root, text="Investment Search App")
        self.label.pack(pady=20)
        self.simbolos, self.nome, self.black_list = cota.ativos()

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

        # ================================ CARREGANDO ATIVOS ==============================================
        caminho_csv = pathlib.Path(__file__).parent.resolve().resolve()
        caminho_csv = caminho_csv / 'lista_tickers' / 'ativos.csv'
        
        # Carrega os ativos
        self.simbolos, self.nomes = cota.ativos(caminho_csv=caminho_csv)

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
        
        # Simulando Notícias
        #noticias_fake = [
        #    ("Dólar cai para R$ 4,90 com otimismo externo", "https://google.com"),
        #    ("Bolsa sobe 1% puxada por bancos", "https://uol.com.br"),
        #    ("Inflação desacelera em janeiro", "https://g1.globo.com")
        #]
        
        #for titulo, link in noticias_fake: 
        #    # Usamos after para mexer na interface de dentro da thread
        #    self.root.after(0, self.adicionar_noticia, titulo, link)
        

        total = len(cota.ativos())
        for i, ativo in enumerate(ativos_exemplo):
         
            
            # --- CALLBACK DA BARRA DE PROGRESSO ---
            # Chama a função de atualização da interface
            self.root.after(0, self.atualizar_barra, i+1, total, f"Lendo {ativo}...")
            
            # Simulando tempo do Selenium...
            time.sleep(1.5) 
            
            # Simulando dados extraídos
            import random
            preco = f"R$ {random.uniform(20, 50):.2f}"
            var = random.uniform(-2, 2)
            var_r = f"{var:+.2f}"
            var_p = f"{var*1.5:+.2f}%"

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


if __name__ == "__main__":
    root = tk.Tk()
    app = Main(root)
    root.mainloop()