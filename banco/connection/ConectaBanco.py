import sqlite3
from pathlib import Path

class BaDa:
    def __init__(self):
        self.path = (Path(__file__).parent.parent.resolve()) / 'data' / 'Investimento.db'

        