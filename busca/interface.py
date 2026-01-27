import tkinter as tk
from tkinter import ttk
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

        # --- ESTILOS ---
        style = ttk.Style()
        style.theme_use("clam") # 'clam', 'alt', 'default', 'classic'
        style.configure("Treeview", rowheight=20, font=('Arial', 10))
        style.configure("Treeview.Heading", font=('Arial', 11, 'bold'))

       # --- 1. PAINEL MESTRE (Divide Esquerda vs Direita) ---
        # orient=HORIZONTAL significa: coloque um ao lado do outro
        self.painel_mestre = ttk.PanedWindow(orient=tk.HORIZONTAL)
        self.painel_mestre.pack(fill="both", expand=True, padx=5, pady=5)

        # --- 2. PREPARANDO O LADO ESQUERDO (Que vai ser dividido de novo) ---
        # Criamos um NOVO PanedWindow vertical para ser o "container" da esquerda
        self.painel_esquerdo = ttk.PanedWindow(orient=tk.VERTICAL)
        
        # Adicionamos ele ao mestre (Ele entra na esquerda pq é o primeiro add)
        # weight=3 dá mais espaço para o conteúdo principal
        self.painel_mestre.add(self.painel_esquerdo, weight=3) 

        # --- 3. PREPARANDO O LADO DIREITO (Sua coluna de cotação teto-chão) ---
        self.frame_cotacoes = tk.LabelFrame(self.painel_mestre, text="Cotações (Ao Vivo)")
        
        # Adicionamos ao mestre (Ele entra na direita)
        # weight=1 deixa ele mais estreito (barra lateral)
        self.painel_mestre.add(self.frame_cotacoes,weight=3)

        # ---------------------------------------------------------
        # AGORA VAMOS ENCHER O LADO ESQUERDO (Cima e Baixo)
        # ---------------------------------------------------------

        # A. Parte Superior Esquerda (Gráfico, Resumo, Data)
        self.frame_conteudo_topo = tk.Frame(self.painel_esquerdo, bg="#e0e0e0") # Cinza claro pra ver a diferença
        self.lbl_titulo = tk.Label(self.frame_conteudo_topo, text="Área de Gráficos / Resumo Geral", font=("Arial", 16))
        self.lbl_titulo.pack(pady=50)
        
        # Adiciona na parte de CIMA do painel esquerdo
        self.painel_esquerdo.add(self.frame_conteudo_topo, weight=1)

        # B. Parte Inferior Esquerda (Notícias)
        self.frame_noticias = tk.LabelFrame(self.painel_esquerdo, text="Últimas Notícias")
        
        # Adiciona na parte de BAIXO do painel esquerdo
        self.painel_esquerdo.add(self.frame_noticias, weight=1)

        # ---------------------------------------------------------
        # AGORA ENCHEMOS A COLUNA DA DIREITA (Cotações)
        # ---------------------------------------------------------
        # Aqui entra a sua Treeview (Tabela) como fizemos antes
        
       # Tabela (Treeview)
        colunas = ("ativo", "preco", "var_reais", "var_porcent")
        self.tree = ttk.Treeview(self.frame_cotacoes, columns=colunas, show="headings")
        
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
        
        
        self.tree.pack(fill="both", expand=True)

        # Barra de rolagem para a tabela
        scrollbar = ttk.Scrollbar(self.tree, orient="vertical", command=self.tree.yview)
        scrollbar.pack(side="right", fill="y")
        self.tree.configure(yscroll=scrollbar.set)
        self.tree.pack(fill="both", expand=True)

 # --- BARRA DE PROGRESSO NO RODAPÉ GERAL (Opcional) ---
        # Se quiser que fique fora de tudo, use pack no root
        self.frame_base = tk.Frame(root)
        self.frame_base.pack(fill="x", side="bottom")
        self.progresso = ttk.Progressbar(self.frame_base, length=200)
        self.progresso.pack(side="right", padx=10, pady=5)














        self.search_button = tk.Button(root, text="Search Investments", command=self.buscar_investments)
        self.search_button.pack(pady=10)
        
        self.frame_bottom = tk.Frame(root, relief="solid", borderwidth=1, pady=5)
        self.frame_bottom.pack(fill="x")
        self.status_label = tk.Label(self.frame_bottom, text="Status: ", font=("Arial", 10))
        self.status_label.pack(fill="x", padx=20, side ="left",)
        self.lbl_data = tk.Label(self.frame_bottom, text="Carregando data...", font=("Arial", 10))
        self.lbl_data.pack(side="right") 
        self.atualizar_relogio()

    def buscar_investments(self):
        print("...........")
        caminho_csv = pathlib.Path(__file__).parent.resolve()
        caminho_csv = caminho_csv / 'ativos.csv'
        cota.iniciar_extracao(caminho_csv, qtd_workers=4)
    
    def atualizar_relogio(self):
        agora = datetime.now().strftime("%d/%m/%Y - %H:%M:%S")
        self.lbl_data.config(text=f"{agora}")
        self.root.after(1000, self.atualizar_relogio)



if __name__ == "__main__":
    root = tk.Tk()
    app = Main(root)
    root.mainloop()