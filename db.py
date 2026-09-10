import mysql.connector
from mysql.connector import pooling, errors
from config import Config
import time, logging

logging.basicConfig(level=logging.INFO)

db_config = {
    'host': Config.DB_HOST,
    'user': Config.DB_USER,
    'password': Config.DB_PASSWORD,
    'database': Config.DB_NAME,
    'pool_name': Config.DB_POOL_NAME,
    'pool_size': Config.DB_POOL_SIZE,
}
connection_pool = mysql.connector.pooling.MySQLConnectionPool(**db_config)

class DBConnection:
    def __init__(self, retries=3, delay=0.5):
        self.retries = retries
        self.delay = delay
        self.conn = None
        self.cursor = None

    def __enter__(self):
        for attempt in range(self.retries):
            try:
                self.conn = connection_pool.get_connection()
                self.cursor = self.conn.cursor(dictionary=True)
                return self
            except errors.PoolError:
                if attempt == self.retries - 1:
                    raise
                time.sleep(self.delay)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.cursor: self.cursor.close()
        if self.conn: self.conn.close()

def get_db_connection():
    return DBConnection()