import cota as ct
import os
import pathlib

from pathlib import Path


caminho_csv = pathlib.Path(__file__)
arquivos = Path(caminho_csv)

print(arquivos)
arquivos = [f for f in arquivos.iterdir() if f.is_file()]

for arquivo in arquivos:
    print(arquivo.name)

w =1
while w == 1:

    if "ativos.csv" not in arquivos:
        caminho_csv = caminho_csv.parent.resolve()
        arquivos = [f for f in arquivos.iterdir() if f.is_file()]
        print(caminho_csv)
w = 0