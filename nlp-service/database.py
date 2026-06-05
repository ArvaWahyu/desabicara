import os
import json
import mysql.connector
from mysql.connector import Error
from typing import List, Dict

class DatabaseConnector:
    """Database connector for MySQL - simple implementation"""

    def __init__(self):
        self.connection = None
        self.host = os.getenv('DB_HOST', 'localhost')
        self.database = os.getenv('DB_NAME', 'desa_bicara')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.port = int(os.getenv('DB_PORT', '3306'))

    def connect(self) -> bool:
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                database=self.database,
                user=self.user,
                password=self.password,
                port=self.port
            )
            if self.connection.is_connected():
                db_info = self.connection.get_server_info()
                print(f"[DB] ✓ Connected to MySQL - Server: {db_info}")
                print(f"[DB]   Host: {self.host}, Database: {self.database}")
                return True
        except Error as e:
            print(f"[DB] ✗ Connection failed: {e}")
            self.connection = None
            return False

    def disconnect(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("[DB] Connection closed")

    def ensure_connection(self) -> bool:
        """Ensure database connection is active"""
        if not self.connection or not self.connection.is_connected():
            return self.connect()
        return True

    def get_all_dictionary_raw(self) -> List[Dict]:
        """Get raw dictionary data from database with dialect"""
        if not self.ensure_connection():
            print("[DB] Cannot fetch - no connection")
            return []

        try:
            cursor = self.connection.cursor(dictionary=True)

            # Simple query with dialect and description
            query = "SELECT id, lampung_word, indonesia_word, dialect, part_of_speech, description FROM dictionary"
            cursor.execute(query)

            rows = cursor.fetchall()
            cursor.close()

            print(f"[DB] Retrieved {len(rows)} dictionary entries")
            return rows

        except Error as e:
            print(f"[DB] ✗ Query failed: {e}")
            return []

    def get_dictionary_counts(self) -> Dict[str, int]:
        """Get dictionary row count by dialect"""
        if not self.ensure_connection():
            return {"total": 0, "A": 0, "O": 0}

        try:
            cursor = self.connection.cursor()

            # Total count
            cursor.execute("SELECT COUNT(*) as count FROM dictionary")
            total = cursor.fetchone()[0]

            # Count by dialect
            cursor.execute("SELECT COUNT(*) as count FROM dictionary WHERE dialect = 'A'")
            dialect_a = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) as count FROM dictionary WHERE dialect = 'O'")
            dialect_o = cursor.fetchone()[0]

            cursor.close()
            return {"total": total, "A": dialect_a, "O": dialect_o}
        except Error as e:
            print(f"[DB] ✗ Count query failed: {e}")
            return {"total": 0, "A": 0, "O": 0}

    def save_translation_history(self, input_text: str, translated_text: str,
                                 direction: str, detected_dialect: str = None,
                                 nlp_steps: Dict = None, processing_time: int = None) -> bool:
        """Save translation history"""
        if not self.ensure_connection():
            return False

        try:
            cursor = self.connection.cursor()
            nlp_steps_json = json.dumps(nlp_steps) if nlp_steps else None

            query = """
                INSERT INTO translation_history (input_text, translated_text, direction, detected_dialect, nlp_steps, processing_time)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (input_text, translated_text, direction, detected_dialect, nlp_steps_json, processing_time))
            self.connection.commit()
            cursor.close()
            return True
        except Error as e:
            print(f"[DB] ✗ Save history failed: {e}")
            return False

# Singleton instance
db_connector = DatabaseConnector()