import yfinance as yf
import pandas as pd
import time
from pathlib import Path
import os

def consulta(lista_tickers):
    print("Iniciando consulta")
    inicio = time.time()

    tickers_formatados = [t + ".SA" 
                          if not t.endswith(".SA") else t 
                          for t in lista_tickers]
    
    string_tickers = " ".join(tickers_formatados)

    dados = yf.download(string_tickers, period="2d", group_by='ticker', threads=True, progress=False)

    lista_final = []

    for ticker in tickers_formatados:
        try:
            # Acessa os dados desse ticker
            df_ativo = dados[ticker]
            df_ativo = df_ativo.dropna()

            if len(df_ativo) < 1:
                continue

            # Pega preço atual
            preco_atual = df_ativo['Close'].iloc[-1]
            
            # Tenta calcular variação
            if len(df_ativo) >= 2:
                fechamento_ontem = df_ativo['Close'].iloc[-2]
                var_reais = preco_atual - fechamento_ontem
                var_pct = (var_reais / fechamento_ontem) * 100
            else:
                var_reais = 0.0
                var_pct = 0.0

            # Limpa o nome
            simbolo_limpo = ticker.replace(".SA", "")
            
            lista_final.append({
                "Ativo": simbolo_limpo,
                "Preço": f"R$ {preco_atual:.2f}",
                "Var R$": f"{var_reais:+.2f}",
                "Var %": f"{var_pct:+.2f}%",
                "Status": "Alta" if var_reais > 0 else ("Baixa" if var_reais < 0 else "Neutro")
            })

        except KeyError:
            print(f"Erro: Dados não encontrados para {ticker}")
            continue

    fim = time.time()
    print(f"Tempo {fim - inicio:.2f}")
    
    return pd.DataFrame(lista_final)

def salvar_dados(arquivo):
    data = pd.Timestamp.now().strftime("%Hh-%Mm-%Ss_-_%d-%m")

    path = Path(__file__).parent.parent.parent.resolve()
    nome_arquivo = path /'banco'/ 'esquemas' / 'dado-do-dia' / f'{data}.json'

    arquivo.to_json(
        nome_arquivo, 
        orient="records",   # Cria uma lista de objetos [{...}, {...}] (Mais comum)
        indent=4,           # Deixa o JSON bonitinho e legível (identado)
        force_ascii=False   # Permite acentos e R$ (não transforma em códigos estranhos)
    )
    
    print(f"\nArquivo salvo com sucesso em: {os.path.abspath(nome_arquivo)}")

if __name__ == "__main__":
   # Teste 
    meus_ativos = [
        "ITUB4", "VALE3", "PETR4", "WEGE3", "BBAS3", 
        "MGLU3", "BBDC4", "ABEV3", "PRIO3"
    ]
    
    df_resultado = consulta(meus_ativos)

    salvar_dados(df_resultado)
    