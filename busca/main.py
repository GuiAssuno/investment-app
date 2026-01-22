import cota as ct
import os

caminho_csv = 'investment-app/busca/ativos.csv'


if __name__ == "__main__":
    
    ct.iniciar_extracao(caminho_csv, qtd_workers=2)
