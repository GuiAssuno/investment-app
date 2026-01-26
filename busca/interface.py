import tkinter as tk
from tkinter import ttk
import cota # Assuming cota is a module in the project
import pathlib

class Main (tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Investment App")
        self.geometry("800x600")
        self.menu_bar()
        self.create_widgets()

    def create_widgets(self):
        self.label = ttk.Label(self, text="Welcome to the Investment Search App")
        self.label.pack(pady=20)

        self.search_button = ttk.Button(self, text="Search Investments", command=self.search_investments)
        self.search_button.pack(pady=10)

        self.quit_button = ttk.Button(self, text="Quit", command=self.quit)
        self.quit_button.pack(pady=10, side=tk.BOTTOM)

    def menu_bar(self):
        menu_bar = tk.Menu(self)
        self.config(menu=menu_bar)

        file_menu = tk.Menu(menu_bar, tearoff=0)
        menu_bar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Exit", command=self.quit)

        help_menu = tk.Menu(menu_bar, tearoff=0)
        menu_bar.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="About", command=self.show_about)

    def show_about(self):
        about_window = tk.Toplevel(self)
        about_window.title("About")
        about_window.geometry("300x200")
        about_label = ttk.Label(about_window, text="Investment App v1.0\nDeveloped by OpenAI", justify="center")
        about_label.pack(expand=True)

    def progress(self):
        self.prograss = ttk.Progressbar(self, orient="horizontal", length=200, mode="determinate")
        self.prograss.pack(pady=10)
        self.prograss["value"] = 0
        self.prograss["maximum"] = 100
        
    def treevew(self):
        self.tree = ttk.Treeview(self, columns=("Investment", "Value", "Date"), show="headings")
        self.tree.heading("Investment", text="Investment")
        self.tree.heading("Value", text="Value")
        self.tree.heading("Date", text="Date")
        self.tree.pack(expand=True, fill=tk.BOTH, pady=10)

    def search_investments(self):
        print("Searching for investments...")
        caminho_csv = pathlib.Path(__file__).parent.resolve()
        caminho_csv = caminho_csv / 'ativos.csv'
        cota.iniciar_extracao(caminho_csv, qtd_workers=4)
        


if __name__ == "__main__":
    app = Main()
    app.mainloop()