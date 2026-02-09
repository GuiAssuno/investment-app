import sqlite3
from pathlib import Path
import pandas as pd

def consultar_banco (caminho_banco= None):
    if caminho_banco is None:
        path = Path(__file__).parent.parent.parent.resolve()
        caminho_banco = path / 'data' / 'Investimento.db'

    con = sqlite3.connect(caminho_banco)
    comando = "SELECT * FROM ativos"

    df_tabela = pd.read_sql_query(comando, con)
    con.close()

    return df_tabela



if __name__ == '__main__':
    df = consultar_banco(None)
    print(df)