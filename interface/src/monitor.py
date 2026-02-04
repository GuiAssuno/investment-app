import tkinter as tk
from tkinter import ttk
import webbrowser  # Para abrir links de noticias
from datetime import datetime
import threading
import time

# Simulando sua importação (depois você conecta com seu cota.py real)
# from cota import iniciar_extracao 

class AppInvestimentos:
    def __init__(self, root):
        self.root = root
        self.root.title("Monitor de Mercado v2.0")
        self.root.geometry("1000x700")
        
        # --- ESTILOS (Para não ficar com cara de Windows 95) ---
        style = ttk.Style()
        style.theme_use("clam") # 'clam', 'alt', 'default', 'classic'
        style.configure("Treeview", rowheight=20, font=('Arial', 10))
        style.configure("Treeview.Heading", font=('Arial', 11, 'bold'))

        # --- 1. CABEÇALHO (DATA E HORA) ---
        self.frame_topo = tk.Frame(root, bg="#f0f0f0", pady=10)
        self.frame_topo.pack(fill="x")
        
        self.lbl_data = tk.Label(self.frame_topo, text="Carregando data...", font=("Arial", 14), bg="#f0f0f0")
        self.lbl_data.pack()
        self.atualizar_relogio()

        # --- 2. ÁREA PRINCIPAL (DIVIDIDA EM DOIS) ---
        # PanedWindow permite redimensionar as áreas
        self.painel = tk.PanedWindow(root, orient=tk.HORIZONTAL)
        self.painel.pack(fill="both", expand=True, padx=10, pady=10)

        # --- LADO ESQUERDO: LISTA DE AÇÕES ---
        self.frame_acoes = tk.LabelFrame(self.painel, text="Cotações em Tempo Real")
        self.painel.add(self.frame_acoes)

        # Tabela (Treeview)
        colunas = ("ativo", "preco", "var_reais", "var_porcent")
        self.tree = ttk.Treeview(self.frame_acoes, columns=colunas, show="headings")
        
        # Definindo cabeçalhos
        self.tree.heading("ativo", text="Ativo")
        self.tree.heading("preco", text="Preço (R$)")
        self.tree.heading("var_reais", text="Var (R$)")
        self.tree.heading("var_porcent", text="Var (%)")
        
        # Definindo largura e alinhamento
        self.tree.column("ativo", width=80, anchor="center")
        self.tree.column("preco", width=80, anchor="center")
        self.tree.column("var_reais", width=80, anchor="center")
        self.tree.column("var_porcent", width=80, anchor="center")

        # Configurando as Cores (Tags)
        self.tree.tag_configure("alta", foreground="green")
        self.tree.tag_configure("baixa", foreground="red")
        
        # Barra de rolagem para a tabela
        scrollbar = ttk.Scrollbar(self.frame_acoes, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscroll=scrollbar.set)
        scrollbar.pack(side="right", fill="y")
        self.tree.pack(fill="both", expand=True)

        # --- LADO DIREITO: NOTÍCIAS ---
        self.frame_noticias = tk.LabelFrame(self.painel, text="Últimas Notícias")
        self.painel.add(self.frame_noticias, width=300) # Define largura inicial

        # Container para as notícias (com scroll se precisar)
        self.canvas_news = tk.Canvas(self.frame_noticias)
        self.scroll_news = ttk.Scrollbar(self.frame_noticias, orient="vertical", command=self.canvas_news.yview)
        self.frame_interno_news = tk.Frame(self.canvas_news)

        self.frame_interno_news.bind(
            "<Configure>",
            lambda e: self.canvas_news.configure(scrollregion=self.canvas_news.bbox("all"))
        )
        self.canvas_news.create_window((0, 0), window=self.frame_interno_news, anchor="nw")
        self.canvas_news.configure(yscrollcommand=self.scroll_news.set)

        self.canvas_news.pack(side="left", fill="both", expand=True)
        self.scroll_news.pack(side="right", fill="y")

        # --- 3. RODAPÉ (BARRA DE PROGRESSO E BOTÃO) ---
        self.frame_base = tk.Frame(root, pady=10)
        self.frame_base.pack(fill="x")

        self.btn_buscar = tk.Button(self.frame_base, text="ATUALIZAR DADOS", 
                                    bg="#007acc", fg="white", font=("Arial", 12, "bold"),
                                    command=self.iniciar_busca)
        self.btn_buscar.pack(side="left", padx=20)

        self.progresso = ttk.Progressbar(self.frame_base, orient="horizontal", length=300, mode="determinate")
        self.progresso.pack(side="right", padx=20)
        
        # Label para status textual ("Buscando ITUB3...")
        self.lbl_status = tk.Label(self.frame_base, text="Aguardando...")
        self.lbl_status.pack(side="right", padx=10)

    def atualizar_relogio(self):
        """Atualiza a data e hora no topo a cada segundo"""
        agora = datetime.now().strftime("%d/%m/%Y - %H:%M:%S")
        self.lbl_data.config(text=f"Última atualização: {agora}")
        self.root.after(1000, self.atualizar_relogio)

    def adicionar_acao(self, ativo, preco, var_reais, var_porcent):
        """Adiciona uma linha na tabela com a cor certa"""
        # Limpa formatação de texto para verificar se é positivo ou negativo
        try:
            valor_teste = float(var_reais.replace(",", ".").replace("+", ""))
            tag = "alta" if valor_teste >= 0 else "baixa"
        except:
            tag = "alta" # Padrão se der erro

        self.tree.insert("", "end", values=(ativo, preco, var_reais, var_porcent), tags=(tag,))

    def adicionar_noticia(self, titulo, url):
        """Cria um link clicável no painel de notícias"""
        lbl = tk.Label(self.frame_interno_news, text=f"• {titulo}", 
                       fg="blue", cursor="hand2", font=("Arial", 10, "underline"), wraplength=280, justify="left")
        lbl.pack(anchor="w", pady=5, padx=5)
        # Evento de clique
        lbl.bind("<Button-1>", lambda e: webbrowser.open_new(url))

    def atualizar_barra(self, valor_atual, total, mensagem):
        """Função que será chamada pelo seu script de scraping"""
        porcentagem = (valor_atual / total) * 100
        self.progresso['value'] = porcentagem
        self.lbl_status.config(text=mensagem)
        self.root.update_idletasks() # Força a interface a desenhar agora

    def iniciar_busca(self):
        """Inicia a thread para não travar a tela"""
        self.tree.delete(*self.tree.get_children()) # Limpa tabela
        for widget in self.frame_interno_news.winfo_children(): # Limpa noticias
            widget.destroy()
            
        t = threading.Thread(target=self.processo_de_busca)
        t.start()

    def processo_de_busca(self):
        # AQUI VOCÊ CONECTA COM SEU SCRIPT REAL
        # Exemplo Simulado:
        ativos_exemplo = ["ITUB3", "VALE3", "PETR4", "MGLU3", "WEGE3"]
        
        # Simulando Notícias
        noticias_fake = [
            ("Dólar cai para R$ 4,90 com otimismo externo", "https://google.com"),
            ("Bolsa sobe 1% puxada por bancos", "https://uol.com.br"),
            ("Inflação desacelera em janeiro", "https://g1.globo.com")
        ]
        
        for titulo, link in noticias_fake:
            # Usamos after para mexer na interface de dentro da thread
            self.root.after(0, self.adicionar_noticia, titulo, link)

        total = len(ativos_exemplo)
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

if __name__ == "__main__":
    root = tk.Tk()
    app = AppInvestimentos(root)
    root.mainloop()