import time
from typing import Dict
from database import db_connector
from services.translator import TextPreprocessor, DictionaryTranslator


class NLPProcessor:
    """Main NLP processor that orchestrates all NLP steps"""

    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.translator = DictionaryTranslator()
        self.last_reload_time = 0

        print("[NLP] Initializing NLP Processor...")
        db_connector.connect()

    def reload_dictionary(self) -> None:
        """Reload dictionary from database"""
        rows = db_connector.get_all_dictionary_raw()
        self.translator.set_dictionary(rows)
        self.last_reload_time = time.time()

    def process_translation(self, text: str, direction: str = "auto", auto_detect: bool = True) -> Dict:
        """
        Complete NLP translation pipeline

        Args:
            text: Input text to translate
            direction: User-selected direction (auto, lampung-to-indonesia, indonesia-to-lampung)
            auto_detect: Whether to auto-detect language

        Returns:
            Dictionary containing complete NLP pipeline results
        """
        start_time = time.time()

        # Validate direction
        valid_directions = ["auto", "lampung-to-indonesia", "indonesia-to-lampung"]
        if direction not in valid_directions:
            raise ValueError(f"Direction tidak valid. Gunakan: {', '.join(valid_directions)}")

        # Always reload dictionary from database for fresh data
        self.reload_dictionary()

        # Translate using the translator
        result = self.translator.translate(text, direction, auto_detect)

        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)

        # Add processing time to result
        result['processing_time_ms'] = processing_time
        result['success'] = True

        print(f"[NLP] ✓ Completed in {processing_time}ms")
        return result

    def get_service_stats(self) -> Dict:
        """Get statistics about the NLP service"""
        counts = db_connector.get_dictionary_counts()
        return {
            "dictionary_count": counts['total'],
            "dialect_counts": {
                "A": counts.get('A', 0),
                "O": counts.get('O', 0)
            },
            "database_connected": db_connector.connection is not None and db_connector.connection.is_connected()
        }