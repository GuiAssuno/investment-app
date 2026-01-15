import pandas as pd 

def extrair_dados(caminho_arquivo):
    try:
        # Lê o arquivo Excel usando pandas
        df = pd.read_csv(caminho_arquivo)
        return list(df[df.columns[0]])
    except FileNotFoundError:
        print(f"Erro: O arquivo '{caminho_arquivo}' não foi encontrado.")
    except Exception as e:
        print(f"Ocorreu um erro ao ler o arquivo Excel: {e}")
        return None

def salvar_dados(df, caminho):
    try:
        for index in df:
            empresa = index[5:]
            if empresa:
                with open(caminho, 'a') as f:
                    f.write(f"{index[:5]},{index[5:]}\n")
            else:
                return None
    except Exception as e:
        print(f"Ocorreu um erro ao salvar o arquivo Excel: {e}")    


if __name__ == "__main__":

    # Caminho do arquivo Excel de exemplo
    caminho_entrada = 'investment-app/ferramentas/Planilha.csv'
    caminho_saida = 'investment-app/ferramentas/dados_salvos.csv'

    # Extrai dados do arquivo Excel
    df_dados = extrair_dados(caminho_entrada)
    
    salvar_dados(df_dados, caminho_saida)