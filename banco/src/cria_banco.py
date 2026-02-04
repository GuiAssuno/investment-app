import sqlite3
from pathlib import Path
import pandas as pd

caminho_banco = Path(__file__).parent.parent.resolve() / "data" / "Investimento.db"

con = sqlite3.connect(caminho_banco)
cur = con.cursor()

cur.execute("CREATE TABLE ativos (id,empresa,ticker)")

df = pd.read_csv("/home/lola/VScode/investment-app/banco/esquemas/lista_tickers/ativos.csv")
df_negra = pd.read_csv("/home/lola/VScode/investment-app/banco/esquemas/lista_tickers/lista_negra")

for 

