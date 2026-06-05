from flask import Flask, request, jsonify
from flask_cors import CORS
from services.nlp_processor import NLPProcessor
from database import db_connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow API calls from Next.js

# Initialize NLP processor
nlp_processor = NLPProcessor()

# Debug: print startup info
print(f"\n{'='*60}")
print("🇮🇩 DESA BICARA NLP ENGINE - WITH DIALECT SUPPORT")
print(f"{'='*60}")
print(f"Port: {os.getenv('PORT', 5000)}")
print(f"DB Host: {os.getenv('DB_HOST', 'localhost')}")
print(f"DB Name: {os.getenv('DB_NAME', 'desa_bicara')}")
print(f"{'='*60}\n")


@app.route('/translate', methods=['POST'])
def translate():
    """
    Main translation endpoint with auto language and dialect detection

    Request:
    {
        "text": "nyak",
        "direction": "auto"  // or "lampung-to-indonesia", "indonesia-to-lampung"
        "auto_detect": true  // optional, default true
    }

    Response:
    {
        "success": true,
        "input": "nyak",
        "selected_direction": "auto",
        "detected_language": "lampung",
        "detected_direction": "lampung-to-indonesia",
        "detected_dialect": "A",
        "auto_switched": false,
        "case_folding": "nyak",
        "tokens": ["nyak"],
        "normalized_tokens": ["nyak"],
        "language_detection": {
            "lampung_matches": 1,
            "indonesia_matches": 0,
            "dialect_matches": {"A": 1, "O": 0},
            "total_tokens": 1
        },
        "mapping": [...],
        "translations_by_dialect": null,
        "translated_tokens": ["saya"],
        "translated_text": "saya",
        "not_found": [],
        "message": null,
        "processing_time_ms": 45
    }
    """
    try:
        data = request.get_json() or {}
        text = data.get('text', '')
        direction = data.get('direction', 'auto')
        auto_detect = data.get('auto_detect', True)

        print(f"\n[API] /translate called")
        print(f"  text: '{text}'")
        print(f"  direction: '{direction}'")
        print(f"  auto_detect: {auto_detect}")

        # Validate input
        if not text:
            return jsonify({
                'success': False,
                'error': 'Teks tidak boleh kosong'
            }), 400

        if not isinstance(text, str):
            return jsonify({
                'success': False,
                'error': 'Teks harus berupa string'
            }), 400

        # Validate direction
        valid_directions = ["auto", "lampung-to-indonesia", "indonesia-to-lampung"]
        if direction not in valid_directions:
            return jsonify({
                'success': False,
                'error': f'Direction tidak valid. Gunakan: {", ".join(valid_directions)}'
            }), 400

        # Process translation
        result = nlp_processor.process_translation(text, direction, auto_detect)

        print(f"  ✓ Success: '{result.get('translated_text')}'")
        if result.get('auto_switched'):
            print(f"  ✓ Auto-switched: {result.get('detected_language')} / Dialek {result.get('detected_dialect')}")

        return jsonify(result)

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        print(f"  ✗ Exception: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint with dictionary count by dialect"""
    try:
        db_connected = db_connector.ensure_connection()
        counts = db_connector.get_dictionary_counts()

        return jsonify({
            'service': 'Desa Bicara NLP Engine',
            'status': 'healthy' if db_connected else 'unhealthy',
            'database_connected': db_connected,
            'dictionary_count': counts.get('total', 0),
            'dialect_counts': {
                'A': counts.get('A', 0),
                'O': counts.get('O', 0)
            }
        })
    except Exception as e:
        print(f"  ✗ Health check failed: {e}")
        return jsonify({
            'service': 'Desa Bicara NLP Engine',
            'status': 'unhealthy',
            'database_connected': False,
            'error': str(e)
        }), 500


@app.route('/dictionary', methods=['GET'])
def get_dictionary():
    """Get all dictionary entries for debugging"""
    try:
        rows = db_connector.get_all_dictionary_raw()
        return jsonify({
            'success': True,
            'count': len(rows),
            'entries': rows
        })
    except Exception as e:
        print(f"  ✗ Dictionary fetch failed: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint tidak ditemukan'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)