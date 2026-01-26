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
        self.root.geometry("800x600")
        self.frame = tk.Frame(root, bg="#f0f0f0", pady=10)
        self.label = tk.Label(root, text="Investment Search App")
        self.label.pack(pady=20)

        self.painel = tk.PanedWindow(root, orient=tk.HORIZONTAL)
        self.painel.pack(fill="both", expand=True, padx=10, pady=10)

        # --- LADO ESQUERDO: LISTA DE AÇÕES ---
        self.frame_acoes = tk.LabelFrame(self.painel, text=" Cotações ")
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





        self.search_button = tk.Button(root, text="Search Investments", command=self.buscar_investments)
        self.search_button.pack(pady=10)
        

        self.frame_bottom = ttk.Frame(root, relief="solid", borderwidth=1, padding=1)
        self.frame_bottom.pack(fill="x")
        self.status_label = ttk.Label(self.frame_bottom, text="Status: ", anchor="w")
        self.status_label.pack(fill="x", padx=20)

    def buscar_investments(self):
        print("Searching for investments...")
        caminho_csv = pathlib.Path(__file__).parent.resolve()
        caminho_csv = caminho_csv / 'ativos.csv'
        cota.iniciar_extracao(caminho_csv, qtd_workers=4)
    
    def atualizar_relogio(self):
        """Atualiza a data e hora no topo a cada segundo"""
        agora = datetime.now().strftime("%d/%m/%Y - %H:%M:%S")
        self.lbl_data.config(text=f"Última atualização: {agora}")
        self.root.after(1000, self.atualizar_relogio)



if __name__ == "__main__":
    root = tk.Tk()
    app = Main(root)
    root.mainloop()