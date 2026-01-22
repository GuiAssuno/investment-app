import cota as ct
import os
import pathlib


caminho_csv = pathlib.Path(__file__).parent.resolve()
caminho_csv = caminho_csv / 'ativos.csv'

if __name__ == "__main__":
    ct.iniciar_extracao(caminho_csv, qtd_workers=2)
