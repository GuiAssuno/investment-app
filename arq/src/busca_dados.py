import requests
from bs4 import BeautifulSoup


def busca_cota():

    url = f"https://www.google.com/finance/quote/ITSA4:BVMF"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

# 1. Preço (Classe: YMlKec fxKbKc)
# 2. Porcentagem (Classe: JwB6zf) 
# 3. Variação em Reais (Classe: P2Luy)

    resposta = requests.get(url)
    conteudo = BeautifulSoup(resposta.content, 'html.parser')
    
    c = conteudo.find(class_="ln0Gqe")
    p = conteudo.find(class_="YMlKec fxKbKc")
    v = conteudo.find(class_="JwB6zf")
    q = conteudo.find_all(class_='e1AOyf')
    print(resposta.status_code) 
    print (f"{p.text}\n{v.text}\n{q}\n {c.text}")

    for _, linha in enumerate(q):
        print(f"LINHA[{_}]: {linha.text}")

if __name__ == "__main__":
    busca_cota()
    #test()