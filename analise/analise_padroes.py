
#
#
#        FRACO PENSAR EM OUTRA FOMRA EM OUTRO PAD~RAO
#        
#        
#        
#        
#        
#




import pandas as pd
import glob
import os
import sys
from pathlib import Path

# Configuração
caminho = Path(__file__).parent.parent
print(caminho)
PASTA_DADOS = caminho /'banco' / 'arquivos' / 'dado-do-dia' 
ARQUIVO_SAIDA_SEQUENCIAL = "analise_sequencial.csv"
ARQUIVO_SAIDA_HORARIO = "analise_horario.csv"

def ler_csv_flexivel(caminho_arquivo):
    """Tenta ler o arquivo com diferentes encodings e separadores"""
    encodings = ['utf-8', 'latin-1', 'cp1252']
    separadores = [',', ';']
    
    for enc in encodings:
        for sep in separadores:
            try:
                df = pd.read_json(caminho_arquivo, sep=sep, encoding=enc)
                if df.shape[1] > 1:
                    return df
            except Exception:
                continue
    return None

def encontrar_coluna(df, possiveis_nomes):
    """Procura uma coluna no DataFrame ignorando maiúsculas/minúsculas"""
    colunas_df = [c.lower().strip() for c in df.columns]
    
    for nome in possiveis_nomes:
        if nome.lower() in colunas_df:
            index = colunas_df.index(nome.lower())
            return df.columns[index]
    return None

def carregar_e_limpar_dados():
    print("CARREGANDO DADOS")
    arquivos = glob.glob(os.path.join(PASTA_DADOS, "*.csv"))
    
    if not arquivos:
        print(f"Erro: Nenhum arquivo encontrado em '{PASTA_DADOS}'")
        return None

    lista_dfs = []
    coluna_preco_real = None
    coluna_data_real = None
    coluna_simbolo_real = None

    for arquivo in arquivos:
        df_temp = ler_csv_flexivel(arquivo)
        
        if df_temp is None:
            print(f"-> Erro ao ler {os.path.basename(arquivo)} (Arquivo corrompido?)")
            continue

        if coluna_preco_real is None:
            coluna_preco_real = encontrar_coluna(df_temp, ['preço', 'preco', 'price', 'valor'])
            coluna_data_real = encontrar_coluna(df_temp, ['horario', 'data', 'hora', 'time', 'date'])
            coluna_simbolo_real = encontrar_coluna(df_temp, ['id', 'simbolo', 'ativo', 'ticker', 'code'])

            if not all([coluna_preco_real, coluna_data_real, coluna_simbolo_real]):
                print(f"-> Ignorando {os.path.basename(arquivo)}: Colunas não identificadas.")
                print(f"   Colunas encontradas: {list(df_temp.columns)}")
                coluna_preco_real = None # tentar no próximo
                continue
            else:
                print(f"   Mapeamento detectado: ID='{coluna_simbolo_real}', Preço='{coluna_preco_real}', Hora='{coluna_data_real}'")

        if coluna_preco_real in df_temp.columns and coluna_data_real in df_temp.columns:
            df_temp = df_temp.rename(columns={
                coluna_preco_real: 'preco_limpo',
                coluna_data_real: 'data_limpa',
                coluna_simbolo_real: 'simbolo_limpo'
            })
            
            df_temp = df_temp[['simbolo_limpo', 'preco_limpo', 'data_limpa']]
            lista_dfs.append(df_temp)

    if not lista_dfs:
        print("Nenhum dado válido foi carregado.")
        return None

    df_geral = pd.concat(lista_dfs, ignore_index=True)
    df_geral['preco_limpo'] = df_geral['preco_limpo'].astype(str).str.replace('R$', '', regex=False)
    df_geral['preco_limpo'] = df_geral['preco_limpo'].str.replace('.', '', regex=False) 
    df_geral['preco_limpo'] = df_geral['preco_limpo'].str.replace(',', '.', regex=False)
    df_geral['preco_limpo'] = pd.to_numeric(df_geral['preco_limpo'], errors='coerce')
    df_geral['data_limpa'] = pd.to_datetime(df_geral['data_limpa'], dayfirst=True, errors='coerce')
    df_geral = df_geral.dropna(subset=['preco_limpo', 'data_limpa'])
    df_geral = df_geral.sort_values(by=['simbolo_limpo', 'data_limpa'])
    print(f"Total carregado: {len(df_geral)} registros.")
    return df_geral

def analise_1_sequencial(df):
    print("ANÁLISE SEQUENCIAL")
    
    df['preco_anterior'] = df.groupby('simbolo_limpo')['preco_limpo'].shift(1)
    df['horario_anterior'] = df.groupby('simbolo_limpo')['data_limpa'].shift(1)
    df['delta_valor'] = df['preco_limpo'] - df['preco_anterior']
    df['delta_tempo'] = df['data_limpa'] - df['horario_anterior']
    df['tipo_movimento'] = df['delta_valor'].apply(
        lambda x: 'SUBIU' if x > 0.001 else ('CAIU' if x < -0.001 else 'ESTÁVEL')
    )
    df_final = df.dropna(subset=['delta_valor'])
    colunas_saida = ['simbolo_limpo', 'data_limpa', 'preco_limpo', 'delta_valor', 'tipo_movimento', 'delta_tempo']
    df_final[colunas_saida].to_csv(ARQUIVO_SAIDA_SEQUENCIAL, index=False)
    print(f"Salvo: {ARQUIVO_SAIDA_SEQUENCIAL}")

def analise_2_horario(df):
    print("ANÁLISE POR HORÁRIO")
    
    df = df.copy() 
    df['hora'] = df['data_limpa'].dt.hour
    
    prev = df.groupby('simbolo_limpo')['preco_limpo'].shift(1)
    change = df['preco_limpo'] - prev
    
    df['direcao'] = change.apply(lambda x: 'Alta' if x > 0.001 else ('Baixa' if x < -0.001 else 'Neutro'))
    
    resumo = df.groupby(['hora', 'direcao']).size().unstack(fill_value=0)
    
    if 'Alta' in resumo.columns and 'Baixa' in resumo.columns:
        resumo['Saldo_Alta_vs_Baixa'] = resumo['Alta'] - resumo['Baixa']
    
    print(resumo)
    resumo.to_csv(ARQUIVO_SAIDA_HORARIO)
    print(f"Salvo: {ARQUIVO_SAIDA_HORARIO}")

if __name__ == "__main__":
    dados = carregar_e_limpar_dados()
    if dados is not None:
        analise_1_sequencial(dados)
        analise_2_horario(dados)
