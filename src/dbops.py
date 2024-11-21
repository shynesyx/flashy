import os
from pathlib2 import Path
import sqlite3
from datetime import datetime

# if __name__ == '__main__':
#     CWD = Path(os.path.dirname(__file__))
# else:
#     CWD = Path(os.path.dirname(os.path.realpath(__file__)))

CWD = Path('/home/yanxiang/learning/electron/hello_world/src/')

def create_db(name: str) -> None:
    """Create a SQLite database based on the given name.

    Args:
        name - name of the SQLite database

    Returns:
        None
    """
    conn = sqlite3.connect(CWD / name)
    cursor = conn.cursor()

    # Create a table
    cursor.execute('''CREATE TABLE IF NOT EXISTS subject (
                        subject_id    INTEGER PRIMARY KEY AUTOINCREMENT,
                        subject_name  TEXT,
                        date_created  TEXT,
                        date_accessed TEXT
                      );''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS card (
                        card_id       INTEGER PRIMARY KEY AUTOINCREMENT,
                        front         TEXT,
                        back          TEXT,
                        subject_id    INTEGER,
                        FOREIGN KEY(subject_id) REFERENCES subject(subject_id)
                      );''')

    conn.commit()
    conn.close()


def insert_data(db_file: str, table_name: str, data: dict[str: str]) -> None:
    """Insert data into a SQLite database.

    Args:
        db_file    - Path to the SQList database file.
        table_name - Name of the table for data insertion.
        data       - Dictionary of data as in {column_name: value}.

    Returns:
        None
    """
    conn = sqlite3.connect(CWD / db_file)
    cursor = conn.cursor()

    columns_str = ','.join(data.keys())
    values_str = "'" + "','".join(data.values()) + "'"
    query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({values_str});'
    cursor.execute(query)

    conn.commit()
    conn.close()


def fetch_data_from_db(db_file: str, query: str) -> list:
    """Fetch data from a SQLite database based on the given query.

    Args:
        db_file - Path to the SQList database file.
        query   - SQL query to execute.

    Returns:
        list: A list of tuples, where each tuple represents a row of data
    """
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    return rows


def fetch_all(table_name: str) -> None:
    """Fetch all data from the table `table_name`."""
    database_file = CWD / 'flashcards.db'
    query = f'SELECT * FROM {table_name}'

    data = fetch_data_from_db(database_file, query)

    for row in data:
        print(row)


def fetch_subjects() -> None:
    """Fetch all subjects."""
    fetch_all('subject')


def fetch_cards() -> None:
    """Fetch all cards."""
    fetch_all('card')


def today_str() -> None:
    """Return today's date and time in the format %Y-%m-%d %H:%M:%S."""
    return datetime.strftime(datetime.now(), format='%Y-%m-%d %H:%M:%S')
