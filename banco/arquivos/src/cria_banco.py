import sqlite3
from pathlib import Path
import pandas as pd


def migrar_dados():
    try:
        # Configuração de Caminhos
        BASE_DIR = Path(__file__).parent.parent.parent.resolve() 
        ARQUIVO_DB = BASE_DIR / "data" / "Investimento.db"
        CSV_ATIVOS = BASE_DIR / "esquemas" / "lista_tickers" / "ativos.csv"
        CSV_NEGRA = BASE_DIR / "esquemas" / "lista_tickers" / "lista-negra.csv"

        # Garantir que a pasta do banco existe
        ARQUIVO_DB.parent.mkdir(parents=True, exist_ok=True)
    except:
        print("Erro ao carregar caminho dos arquivos")
     
    # 2. Carregar Arquivos
    try:
        df = pd.read_csv(CSV_ATIVOS)

        # Se o arquivo não existir, cria lista vazia para não quebrar
        lista_negra = []
        if CSV_NEGRA.exists():
            df_negra = pd.read_csv(CSV_NEGRA)
            lista_negra = df_negra['id'].tolist() # Mais rápido que list(df['id'])
            #print(f"Lista negra carregada com {len(lista_negra)} itens.")
    except Exception as e:
        print(f"Erro crítico ao ler arquivos: {e}")
        return

    # Filtro 
    #qtd_inicial = len(df)

    # Remove quem está na lista negra
    df_limpo = df[ ~df['id'].isin(lista_negra) ].copy()
    
    # print(f"Total inicial: {qtd_inicial}")
    # print(f"Removidos: {qtd_inicial - len(df_limpo)}")
    # print(f"Total a salvar: {len(df_limpo)}")

    # Vamos criar a lista de tuplas para o banco.
    dados_para_inserir = []
    
    for row in df_limpo.itertuples(index=False):
        ticker = row.id
        nome_empresa = str(row.Nome).replace("SAD", "").strip() # Limpeza e segurança
        
        # Guardamos apenas. O ID é com o banco.
        dados_para_inserir.append((ticker, nome_empresa))

    # Banco de Dados
    try:
        con = sqlite3.connect(ARQUIVO_DB)
        cur = con.cursor()
        
        # Cria a tabela SE NÃO EXISTIR
        # id INTEGER PRIMARY KEY AUTOINCREMENT cria um id automatico
        cur.execute("""
            CREATE TABLE IF NOT EXISTS ativos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker TEXT UNIQUE,
                nome TEXT
            )
        """)
        
        # Limpa a tabela antes de inserir 
        print("Limpando banco antigo...")
        cur.execute("DELETE FROM ativos")
        cur.execute("DELETE FROM sqlite_sequence WHERE name='ativos'")
        con.commit() # Importante commitar a limpeza antes de inserir
        
        # INSERT IGNORE ou INSERT OR REPLACE evita erro se já existir o ticker
        cur.executemany("INSERT OR REPLACE INTO ativos (ticker, nome) VALUES (?, ?)", dados_para_inserir)
        
        con.commit()
        print("Migração concluída com Sucesso!")
        
    except sqlite3.Error as e:
        print(f"Erro de Banco de Dados: {e}")
    finally:
        con.close()

if __name__ == "__main__":
    migrar_dados()