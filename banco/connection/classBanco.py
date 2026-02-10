import sqlite3
import pandas as pd
from pathlib import Path

class BaDa:
    def __init__(self):
        self.path = (Path(__file__).parent.parent.resolve()) / 'data' / 'Investimento.db'

    def consulta(self, campo):
        con = sqlite3.connect(self.path)
        con.close()

    def carregar_ticker(self):
    
        try:
            con = sqlite3.connect(self.path)
            cursor = con.cursor()
            cursor.execute("SELECT ticker FROM ativos")
            # List comprehension rápida e nativa, sem Pandas
            resultado = [linha[0] for linha in cursor.fetchall()]
            con.close()
            return resultado
        except Exception as e:
            print(f"Erro no banco: {e}")
            return []
    

    def criar_tabela(self):
        con = sqlite3.connect(self.path)
        con.close()


if __name__ == "__main__":
    c = BaDa()

    lista = c.carregar_ticker()

    print(lista)