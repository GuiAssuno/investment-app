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
            comando = f"SELECT * FROM ativos" 
            df_tabela = pd.read_sql_query(comando, con) 
            con.close()
            return list(df_tabela['ticker'])

        except Exception as e:
            return e
    

    def criar_tabela(self):
        con = sqlite3.connect(self.path)
        con.close()


if __name__ == "__main__":
    c = BaDa()

    lista = c.carregar_ticker()

    print(lista)