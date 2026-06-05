import re
from typing import List, Dict, Tuple, Optional

try:
    from rapidfuzz import fuzz, process
    FUZZY_AVAILABLE = True
except ImportError:
    FUZZY_AVAILABLE = False
    print("[TRANSLATOR] Warning: rapidfuzz not installed, fuzzy matching disabled")


class TextPreprocessor:
    """Simple text preprocessor for NLP pipeline"""

    def preprocess(self, text: str) -> Dict:
        """Complete preprocessing pipeline"""
        case_folded = self.case_folding(text)
        cleaned = self.remove_punctuation(case_folded)
        tokens = self.tokenize(cleaned)
        normalized = self.normalize_tokens(tokens)

        return {
            'original': text,
            'case_folding': case_folded,
            'cleaned': cleaned,
            'tokens': tokens,
            'normalized_tokens': normalized
        }

    def case_folding(self, text: str) -> str:
        """Convert to lowercase and strip whitespace"""
        return text.lower().strip()

    def remove_punctuation(self, text: str) -> str:
        """Remove basic punctuation: . , ? ! ; :"""
        return re.sub(r'[.,?!;:]', '', text)

    def tokenize(self, text: str) -> List[str]:
        """Split by whitespace, filter empty strings"""
        tokens = text.split()
        return [t for t in tokens if t.strip()]

    def normalize_tokens(self, tokens: List[str]) -> List[str]:
        """Normalize tokens (lowercase + strip)"""
        return [t.lower().strip() for t in tokens if t.strip()]


class DictionaryTranslator:
    """Handles dictionary-based translation with direction-aware matching"""

    def __init__(self):
        self.dictionary_cache = None
        # Structure: {lampung_word: {A: indonesia, O: indonesia}, ...}
        self.lampung_dict = {}
        # Structure: {indonesia_word: {A: lampung, O: lampung}, ...}
        self.indonesia_dict = {}
        # Structure: list of entries with description for meaning search
        self.all_entries = []
        # Fuzzy index
        self.fuzzy_lampung = []
        self.fuzzy_indonesia = []
        # Hyphen/variant index for partial matching
        # e.g., "icak" -> ["icak-icak", "icak icak"]
        self.lampung_variants = {}
        # Description index for meaning search
        self.description_index = []
        self.last_load_time = 0

    def load_dictionary_from_db(self, db_rows: List[Dict]) -> None:
        """Load and build translation dictionaries with all features"""
        self.lampung_dict = {}
        self.indonesia_dict = {}
        self.all_entries = []
        self.fuzzy_lampung = []
        self.fuzzy_indonesia = []
        self.lampung_variants = {}
        self.description_index = []

        for row in db_rows:
            lampung = row.get('lampung_word', '').strip().lower()
            indonesia = row.get('indonesia_word', '').strip().lower()
            dialect = row.get('dialect', 'A').upper()
            description = row.get('description', '') or ''
            part_of_speech = row.get('part_of_speech', '') or ''

            if lampung and indonesia:
                # Build lampung_dict: lampung -> {dialect: indonesia}
                if lampung not in self.lampung_dict:
                    self.lampung_dict[lampung] = {}
                self.lampung_dict[lampung][dialect] = indonesia

                # Build indonesia_dict: indonesia -> {dialect: lampung}
                if indonesia not in self.indonesia_dict:
                    self.indonesia_dict[indonesia] = {}
                self.indonesia_dict[indonesia][dialect] = lampung

                # Store all entries for meaning search
                self.all_entries.append({
                    'lampung_word': lampung,
                    'indonesia_word': indonesia,
                    'dialect': dialect,
                    'description': description.lower(),
                    'part_of_speech': part_of_speech
                })

                # Build fuzzy search index
                self.fuzzy_lampung.append(lampung)
                self.fuzzy_indonesia.append(indonesia)

                # Build hyphen variant index for lampung words
                # Extract base words from hyphenated patterns like "icak-icak" -> "icak"
                if '-' in lampung:
                    parts = lampung.split('-')
                    for part in parts:
                        part = part.strip()
                        if part and part != lampung:
                            if part not in self.lampung_variants:
                                self.lampung_variants[part] = []
                            self.lampung_variants[part].append(lampung)

                # Build description index for meaning search (Indonesia -> Lampung)
                if description:
                    self.description_index.append({
                        'description': description,
                        'lampung_word': lampung,
                        'indonesia_word': indonesia,
                        'dialect': dialect
                    })

        # Remove duplicates from fuzzy index
        self.fuzzy_lampung = list(set(self.fuzzy_lampung))
        self.fuzzy_indonesia = list(set(self.fuzzy_indonesia))

        # Deduplicate variant index
        for key in self.lampung_variants:
            self.lampung_variants[key] = list(set(self.lampung_variants[key]))

        print(f"[TRANSLATOR] Loaded dictionary")
        print(f"[TRANSLATOR]   Unique Lampung words: {len(self.lampung_dict)}")
        print(f"[TRANSLATOR]   Unique Indonesia words: {len(self.indonesia_dict)}")
        print(f"[TRANSLATOR]   Total entries: {len(self.all_entries)}")
        print(f"[TRANSLATOR]   Fuzzy index: {len(self.fuzzy_lampung)} lampung, {len(self.fuzzy_indonesia)} indonesia")
        print(f"[TRANSLATOR]   Variant index: {len(self.lampung_variants)} base words")

    def generate_phrase_candidates(self, tokens: List[str]) -> List[str]:
        """
        Generate phrase candidates from tokens for hyphen normalization.
        This handles repeated words that should match hyphenated dictionary entries.

        Examples:
        - ["icak", "icak"] -> ["icak icak", "icak-icak"]
        - ["asa", "asa"] -> ["asa asa", "asa-asa"]
        - ["ikat", "ikat"] -> ["ikat ikat", "ikat-ikat"]
        - ["icak", "icak", "icak"] -> ["icak icak icak", "icak-icak-icak"]
        """
        candidates = []

        if not tokens:
            return candidates

        # 1. Original text (joined by space)
        original = " ".join(tokens)
        candidates.append(original)

        # 2. Check if all tokens are the same (repeated word pattern)
        all_same = len(set(tokens)) == 1

        if all_same and len(tokens) >= 2:
            # Generate hyphenated version
            hyphenated = "-".join(tokens)
            candidates.append(hyphenated)

        # 3. Also try just replacing spaces with hyphens for mixed inputs
        space_replaced = "-".join(tokens)
        if space_replaced != original:
            candidates.append(space_replaced)

        return candidates

    def phrase_hyphen_match(self, text: str, tokens: List[str], direction: str) -> Optional[Dict]:
        """
        Check for phrase/hyphen match using generated candidates.
        This handles:
        - "icak icak" -> "icak-icak"
        - "asa asa" -> "asa-asa"
        - "ikat ikat" -> "ikat-ikat"

        Returns matched entry info if found, None otherwise.
        """
        if direction != "lampung-to-indonesia":
            return None

        # Generate candidates
        candidates = self.generate_phrase_candidates(tokens)
        print(f"[PHRASE] Checking candidates: {candidates}")

        for candidate in candidates:
            # Check exact match in lampung_dict
            if candidate in self.lampung_dict:
                dialects = self.lampung_dict[candidate]
                return {
                    'found': True,
                    'original_text': text,
                    'matched_word': candidate,
                    'translations': dialects,
                    'match_type': 'hyphen_normalization',
                    'normalized_phrase': candidate,
                    'scope': 'lampung_word_only'
                }

            # Check if candidate is already hyphenated word in dictionary
            if '-' in candidate and candidate in self.lampung_dict:
                dialects = self.lampung_dict[candidate]
                return {
                    'found': True,
                    'original_text': text,
                    'matched_word': candidate,
                    'translations': dialects,
                    'match_type': 'exact',
                    'scope': 'lampung_word_only'
                }

        return None

    def exact_match_lampung(self, token: str) -> Optional[Dict]:
        """Check exact match in Lampung dictionary"""
        if token in self.lampung_dict:
            dialects = self.lampung_dict[token]
            return {
                'found': True,
                'lampung_word': token,
                'translations': dialects,
                'match_type': 'exact'
            }
        return None

    def exact_match_indonesia(self, token: str) -> Optional[Dict]:
        """Check exact match in Indonesia dictionary"""
        if token in self.indonesia_dict:
            dialects = self.indonesia_dict[token]
            return {
                'found': True,
                'indonesia_word': token,
                'translations': dialects,
                'match_type': 'exact'
            }
        return None

    def phrase_match(self, text: str, direction: str) -> Optional[Dict]:
        """Check if input matches a phrase (multi-word entry) based on direction"""
        text_lower = text.lower().strip()

        if direction == "lampung-to-indonesia":
            # Only check in Lampung words for phrase matching
            if text_lower in self.lampung_dict:
                dialects = self.lampung_dict[text_lower]
                return {
                    'found': True,
                    'lampung_word': text_lower,
                    'translations': dialects,
                    'match_type': 'phrase',
                    'scope': 'lampung_word_only'
                }
        else:
            # Indonesia -> Lampung: check in Indonesia words
            if text_lower in self.indonesia_dict:
                dialects = self.indonesia_dict[text_lower]
                return {
                    'found': True,
                    'indonesia_word': text_lower,
                    'translations': dialects,
                    'match_type': 'phrase',
                    'scope': 'indonesia_word_and_description'
                }

        return None

    def partial_hyphen_match(self, token: str, direction: str) -> Optional[Dict]:
        """Match partial token to hyphenated/variant lampung words (only for lampung-to-indonesia)"""
        if direction != "lampung-to-indonesia":
            return None

        # Check if token is a base word that matches a hyphenated variant
        if token in self.lampung_variants:
            variants = self.lampung_variants[token]
            if variants:
                # Use first matching variant
                lampung_word = variants[0]
                dialects = self.lampung_dict.get(lampung_word, {})
                if dialects:
                    return {
                        'found': True,
                        'matched_word': lampung_word,
                        'original_word': token,
                        'translations': dialects,
                        'match_type': 'partial_hyphen_match',
                        'scope': 'lampung_word_only'
                    }
        return None

    def meaning_search(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Search by meaning/description - ONLY for Indonesia -> Lampung direction.
        This searches the description field which contains Indonesian meanings.
        """
        query_tokens = query.lower().split()
        query_tokens = [t.strip() for t in query_tokens if t.strip()]

        if not query_tokens:
            return []

        results = []

        for entry in self.description_index:
            description = entry.get('description', '')
            indonesia_word = entry.get('indonesia_word', '')

            # Combine description and indonesia_word for search
            search_text = f"{description} {indonesia_word}".lower()

            matched_tokens = 0
            for token in query_tokens:
                if token in search_text:
                    matched_tokens += 1

            if matched_tokens > 0:
                # Calculate match score (percentage of tokens matched)
                score = (matched_tokens / len(query_tokens)) * 100

                # Bonus if indonesia word contains query
                if query.lower() in indonesia_word:
                    score += 20

                results.append({
                    'entry': entry,
                    'score': min(score, 100),
                    'matched_tokens': matched_tokens
                })

        # Sort by score
        results.sort(key=lambda x: x['score'], reverse=True)

        # Return top results
        return results[:limit]

    def fuzzy_match_lampung_only(self, token: str, threshold: int = 75) -> Optional[Dict]:
        """Find fuzzy match ONLY in Lampung dictionary - for lampung-to-indonesia"""
        if not FUZZY_AVAILABLE:
            return None

        if not self.fuzzy_lampung:
            return None

        best_lampung = process.extractOne(
            token,
            self.fuzzy_lampung,
            scorer=fuzz.ratio
        )

        if best_lampung and best_lampung[1] >= threshold:
            lampung_word = best_lampung[0]
            dialects = self.lampung_dict.get(lampung_word, {})

            return {
                'found': True,
                'matched_word': lampung_word,
                'original_word': token,
                'score': best_lampung[1],
                'translations': dialects,
                'match_type': 'fuzzy',
                'direction': 'lampung',
                'scope': 'lampung_word_only'
            }

        return None

    def fuzzy_match_indonesia_only(self, token: str, threshold: int = 75) -> Optional[Dict]:
        """Find fuzzy match ONLY in Indonesia dictionary - for indonesia-to-lampung"""
        if not FUZZY_AVAILABLE:
            return None

        if not self.fuzzy_indonesia:
            return None

        best_indonesia = process.extractOne(
            token,
            self.fuzzy_indonesia,
            scorer=fuzz.ratio
        )

        if best_indonesia and best_indonesia[1] >= threshold:
            indonesia_word = best_indonesia[0]
            dialects = self.indonesia_dict.get(indonesia_word, {})

            return {
                'found': True,
                'matched_word': indonesia_word,
                'original_word': token,
                'score': best_indonesia[1],
                'translations': dialects,
                'match_type': 'fuzzy',
                'direction': 'indonesia',
                'scope': 'indonesia_word_and_description'
            }

        return None

    def fuzzy_match(self, token: str, direction: str, threshold: int = 75) -> Optional[Dict]:
        """Find fuzzy match based on direction"""
        if direction == "lampung-to-indonesia":
            return self.fuzzy_match_lampung_only(token, threshold)
        else:
            return self.fuzzy_match_indonesia_only(token, threshold)

    def score_detection(self, tokens: List[str]) -> Tuple[str, Optional[str], Dict]:
        """
        Score-based language detection.
        Returns: (detected_language, detected_dialect, detection_scores)
        """
        lampung_scores = {'exact': 0, 'phrase': 0, 'partial': 0, 'fuzzy': 0}
        indonesia_scores = {'exact': 0, 'phrase': 0, 'meaning': 0, 'fuzzy': 0}
        dialect_a_score = 0
        dialect_o_score = 0

        full_text = " ".join(tokens)

        for token in tokens:
            # Check exact lampung
            if token in self.lampung_dict:
                lampung_scores['exact'] += 1
                dialects = self.lampung_dict[token]
                if 'A' in dialects:
                    dialect_a_score += 1
                if 'O' in dialects:
                    dialect_o_score += 1

            # Check exact indonesia
            if token in self.indonesia_dict:
                indonesia_scores['exact'] += 1
                dialects = self.indonesia_dict[token]
                if 'A' in dialects:
                    dialect_a_score += 0.5
                if 'O' in dialects:
                    dialect_o_score += 0.5

            # Check partial hyphen match for lampung
            if token in self.lampung_variants:
                lampung_scores['partial'] += 1

        # Check phrase match for full text
        if full_text in self.lampung_dict:
            lampung_scores['phrase'] += 1
        if full_text in self.indonesia_dict:
            indonesia_scores['phrase'] += 1

        # Calculate weighted scores
        lampung_total = (
            lampung_scores['exact'] * 10 +
            lampung_scores['phrase'] * 15 +
            lampung_scores['partial'] * 5 +
            lampung_scores['fuzzy'] * 2
        )

        indonesia_total = (
            indonesia_scores['exact'] * 10 +
            indonesia_scores['phrase'] * 15 +
            indonesia_scores['meaning'] * 3 +
            indonesia_scores['fuzzy'] * 2
        )

        # Determine detected language
        if lampung_total > indonesia_total and lampung_total > 0:
            detected_language = "lampung"
        elif indonesia_total > lampung_total and indonesia_total > 0:
            detected_language = "indonesia"
        elif lampung_total > 0:
            detected_language = "lampung"
        elif indonesia_total > 0:
            detected_language = "indonesia"
        else:
            detected_language = "unknown"

        # Determine dialect
        detected_dialect = None
        if detected_language == "lampung":
            if dialect_a_score > dialect_o_score:
                detected_dialect = "A"
            elif dialect_o_score > dialect_a_score:
                detected_dialect = "O"
            elif dialect_a_score > 0 and dialect_o_score > 0:
                detected_dialect = "mixed"
            elif dialect_a_score > 0:
                detected_dialect = "A"
            elif dialect_o_score > 0:
                detected_dialect = "O"

        detection_scores = {
            'lampung': {
                'total': lampung_total,
                'exact': lampung_scores['exact'],
                'phrase': lampung_scores['phrase'],
                'partial': lampung_scores['partial']
            },
            'indonesia': {
                'total': indonesia_total,
                'exact': indonesia_scores['exact'],
                'phrase': indonesia_scores['phrase']
            },
            'dialect_scores': {
                'A': dialect_a_score,
                'O': dialect_o_score
            },
            'total_tokens': len(tokens)
        }

        return detected_language, detected_dialect, detection_scores

    def detect_language(self, tokens: List[str]) -> Tuple[str, Optional[str], Dict]:
        """Alias for score_detection for backward compatibility"""
        return self.score_detection(tokens)

    def translate(self, text: str, selected_direction: str = "auto", auto_detect: bool = True) -> Dict:
        """Complete translation pipeline with direction-aware matching"""
        preprocessor = TextPreprocessor()

        print(f"\n[TRANSLATE] text: '{text}', direction: {selected_direction}, auto_detect: {auto_detect}")

        # Preprocess
        preprocess_result = preprocessor.preprocess(text)
        tokens = preprocess_result['normalized_tokens']
        print(f"[TRANSLATE] tokens: {tokens}")

        # Score-based language detection
        detected_language, detected_dialect, detection_scores = self.score_detection(tokens)
        print(f"[TRANSLATE] detected: {detected_language}, dialect: {detected_dialect}")

        # Determine direction
        auto_switched = False
        direction_used = selected_direction
        message = None
        search_scope = None

        if auto_detect and selected_direction == "auto":
            if detected_language == "lampung":
                direction_used = "lampung-to-indonesia"
                search_scope = "lampung_word_only"
                message = f"Bahasa terdeteksi sebagai Lampung"
                if detected_dialect and detected_dialect != "mixed":
                    message += f" Dialek {detected_dialect}"
                message += ", arah terjemahan disesuaikan."
            elif detected_language == "indonesia":
                direction_used = "indonesia-to-lampung"
                search_scope = "indonesia_word_and_description"
                message = f"Bahasa terdeteksi sebagai Indonesia, arah terjemahan disesuaikan."
            else:
                # Default to lampung-to-indonesia for unknown
                direction_used = "lampung-to-indonesia"
                search_scope = "lampung_word_only"

            if direction_used != selected_direction:
                auto_switched = True
        elif selected_direction == "lampung-to-indonesia":
            search_scope = "lampung_word_only"
        elif selected_direction == "indonesia-to-lampung":
            search_scope = "indonesia_word_and_description"

        # Build result
        mapping = []
        translations_by_dialect: Dict[str, List[str]] = {"A": [], "O": []}
        not_found = []
        detected_dialects: List[str] = []
        match_type = "not_found"
        confidence_score = 0
        suggested_word = None
        matched_entry = None
        final_translations = []
        normalized_phrase = None

        # Process based on direction
        if direction_used == "lampung-to-indonesia":
            # =================================================================
            # LAMPUNG -> INDONESIA TRANSLATION
            # Search ONLY in lampung_word, NEVER in description/indonesia_word
            # =================================================================
            full_text = " ".join(tokens)

            # ================================================================
            # STEP 0: Check hyphen/phrase normalization FIRST
            # This handles "icak icak" -> "icak-icak" -> "berpura-pura"
            # ================================================================
            hyphen_result = self.phrase_hyphen_match(text, tokens, direction_used)
            if hyphen_result and hyphen_result['found']:
                lampung_word = hyphen_result['matched_word']
                dialects = hyphen_result['translations']
                target_dialect = list(dialects.keys())[0]
                translated = dialects[target_dialect]

                mapping.append({
                    'source': text,
                    'original_text': hyphen_result.get('original_text', text),
                    'matched_word': lampung_word,
                    'target': translated,
                    'match_type': hyphen_result.get('match_type', 'hyphen_normalization'),
                    'score': 100,
                    'found': True,
                    'scope': 'lampung_word_only'
                })
                final_translations = [translated]
                match_type = hyphen_result.get('match_type', 'hyphen_normalization')
                confidence_score = 100
                suggested_word = lampung_word
                normalized_phrase = hyphen_result.get('normalized_phrase', lampung_word)
                matched_entry = {
                    'lampung_word': lampung_word,
                    'indonesia_word': translated,
                    'dialect': target_dialect
                }

                for d, t in dialects.items():
                    if t not in translations_by_dialect[d]:
                        translations_by_dialect[d].append(t)
                        if d not in detected_dialects:
                            detected_dialects.append(d)

            # ================================================================
            # STEP 1: Try exact phrase match (multi-word phrase in dictionary)
            # ================================================================
            elif self.phrase_match(full_text, direction_used):
                phrase_result = self.phrase_match(full_text, direction_used)
                if phrase_result and phrase_result['found']:
                    lampung_word = phrase_result['lampung_word']
                    dialects = phrase_result['translations']
                    target_dialect = list(dialects.keys())[0]
                    translated = dialects[target_dialect]

                    mapping.append({
                        'source': full_text,
                        'matched_word': lampung_word,
                        'target': translated,
                        'match_type': 'phrase',
                        'score': 100,
                        'found': True,
                        'scope': 'lampung_word_only'
                    })
                    final_translations = [translated]
                    match_type = 'phrase'
                    confidence_score = 100
                    suggested_word = lampung_word
                    matched_entry = {
                        'lampung_word': lampung_word,
                        'indonesia_word': translated,
                        'dialect': target_dialect
                    }

                    for d, t in dialects.items():
                        if t not in translations_by_dialect[d]:
                            translations_by_dialect[d].append(t)
                            if d not in detected_dialects:
                                detected_dialects.append(d)

            # ================================================================
            # STEP 2: Try exact match per token
            # ================================================================
            else:
                all_exact = True
                temp_translations = []
                temp_mapping = []

                for token in tokens:
                    exact_result = self.exact_match_lampung(token)
                    if exact_result and exact_result['found']:
                        dialects = exact_result['translations']
                        target_dialect = list(dialects.keys())[0]
                        translated = dialects[target_dialect]
                        temp_translations.append(translated)
                        temp_mapping.append({
                            'source': token,
                            'matched_word': token,
                            'target': translated,
                            'match_type': 'exact',
                            'score': 100,
                            'found': True,
                            'scope': 'lampung_word_only'
                        })
                        for d, t in dialects.items():
                            if t not in translations_by_dialect[d]:
                                translations_by_dialect[d].append(t)
                                if d not in detected_dialects:
                                    detected_dialects.append(d)
                    else:
                        all_exact = False
                        break

                if all_exact and temp_translations:
                    final_translations = temp_translations
                    mapping = temp_mapping
                    match_type = 'exact'
                    confidence_score = 100
                else:
                    # ================================================================
                    # STEP 3: Try partial hyphen match (single token -> hyphenated word)
                    # ================================================================
                    temp_mapping = []
                    partial_found = False

                    for token in tokens:
                        # Try exact first
                        exact_result = self.exact_match_lampung(token)
                        if exact_result and exact_result['found']:
                            dialects = exact_result['translations']
                            target_dialect = list(dialects.keys())[0]
                            translated = dialects[target_dialect]
                            final_translations.append(translated)
                            temp_mapping.append({
                                'source': token,
                                'matched_word': token,
                                'target': translated,
                                'match_type': 'exact',
                                'score': 100,
                                'found': True,
                                'scope': 'lampung_word_only'
                            })
                            for d, t in dialects.items():
                                if t not in translations_by_dialect[d]:
                                    translations_by_dialect[d].append(t)
                                if d not in detected_dialects:
                                    detected_dialects.append(d)
                        else:
                            # Try partial hyphen match
                            partial_result = self.partial_hyphen_match(token, direction_used)
                            if partial_result and partial_result['found']:
                                dialects = partial_result['translations']
                                target_dialect = list(dialects.keys())[0]
                                translated = dialects[target_dialect]
                                final_translations.append(translated)
                                temp_mapping.append({
                                    'source': token,
                                    'matched_word': partial_result['matched_word'],
                                    'target': translated,
                                    'match_type': 'partial_hyphen_match',
                                    'score': 90,
                                    'found': True,
                                    'scope': 'lampung_word_only'
                                })
                                partial_found = True
                                suggested_word = partial_result['matched_word']
                                matched_entry = {
                                    'lampung_word': partial_result['matched_word'],
                                    'indonesia_word': translated,
                                    'dialect': target_dialect
                                }
                                for d, t in dialects.items():
                                    if t not in translations_by_dialect[d]:
                                        translations_by_dialect[d].append(t)
                                    if d not in detected_dialects:
                                        detected_dialects.append(d)
                            else:
                                # ================================================================
                                # STEP 4: Try fuzzy match in lampung ONLY
                                # ================================================================
                                fuzzy_result = self.fuzzy_match_lampung_only(token, threshold=75)
                                if fuzzy_result and fuzzy_result['found']:
                                    dialects = fuzzy_result['translations']
                                    target_dialect = list(dialects.keys())[0]
                                    translated = dialects[target_dialect]
                                    final_translations.append(translated)
                                    temp_mapping.append({
                                        'source': token,
                                        'matched_word': fuzzy_result['matched_word'],
                                        'target': translated,
                                        'match_type': 'fuzzy',
                                        'score': fuzzy_result['score'],
                                        'found': True,
                                        'scope': 'lampung_word_only'
                                    })
                                    for d, t in dialects.items():
                                        if t not in translations_by_dialect[d]:
                                            translations_by_dialect[d].append(t)
                                        if d not in detected_dialects:
                                            detected_dialects.append(d)
                                else:
                                    # NOT FOUND in lampung side
                                    # DO NOT search description/indonesia for this direction
                                    final_translations.append(f"[{token}]")
                                    temp_mapping.append({
                                        'source': token,
                                        'found': False,
                                        'match_type': 'not_found',
                                        'scope': 'lampung_word_only'
                                    })
                                    not_found.append(token)

                    mapping = temp_mapping
                    if partial_found:
                        match_type = 'partial_hyphen_match'
                        confidence_score = 90
                    elif any(m.get('match_type') == 'fuzzy' for m in mapping):
                        match_type = 'fuzzy'
                        confidence_score = 80
                    elif not_found:
                        match_type = 'not_found'
                        confidence_score = 0
                        # Suggestion for user
                        if len(tokens) == 1 and len(tokens[0]) > 3:
                            message = f"Input '{tokens[0]}' tidak ditemukan dalam kamus Lampung. Input ini terlihat seperti Bahasa Indonesia. Gunakan Deteksi Otomatis atau ubah arah ke Indonesia → Lampung."

        else:
            # =================================================================
            # INDONESIA -> LAMPUNG TRANSLATION
            # Search in indonesia_word AND description
            # =================================================================
            full_text = " ".join(tokens)

            # 1. Try phrase match first
            phrase_result = self.phrase_match(full_text, direction_used)
            if phrase_result and phrase_result['found']:
                indonesia_word = phrase_result['indonesia_word']
                dialects = phrase_result['translations']

                target_dialect = list(dialects.keys())[0]
                translated = dialects[target_dialect]

                mapping.append({
                    'source': full_text,
                    'matched_word': indonesia_word,
                    'target': translated,
                    'match_type': 'phrase',
                    'score': 100,
                    'found': True,
                    'scope': 'indonesia_word_and_description'
                })
                final_translations = [translated]
                match_type = 'phrase'
                confidence_score = 100
                suggested_word = indonesia_word

                for d, lampung in dialects.items():
                    if lampung not in translations_by_dialect[d]:
                        translations_by_dialect[d].append(lampung)
                        if d not in detected_dialects:
                            detected_dialects.append(d)

            else:
                # 2. Try exact match per token
                all_exact = True
                temp_translations = []
                temp_mapping = []

                for token in tokens:
                    exact_result = self.exact_match_indonesia(token)
                    if exact_result and exact_result['found']:
                        dialects = exact_result['translations']
                        target_dialect = list(dialects.keys())[0]
                        translated = dialects[target_dialect]
                        temp_translations.append(translated)
                        temp_mapping.append({
                            'source': token,
                            'matched_word': token,
                            'target': translated,
                            'match_type': 'exact',
                            'score': 100,
                            'found': True,
                            'scope': 'indonesia_word_and_description'
                        })
                        for d, lampung in dialects.items():
                            if lampung not in translations_by_dialect[d]:
                                translations_by_dialect[d].append(lampung)
                                if d not in detected_dialects:
                                    detected_dialects.append(d)
                    else:
                        all_exact = False
                        break

                if all_exact and temp_translations:
                    final_translations = temp_translations
                    mapping = temp_mapping
                    match_type = 'exact'
                    confidence_score = 100
                else:
                    # 3. Try meaning/description search
                    # ONLY do this for indonesia-to-lampung direction
                    meaning_results = self.meaning_search(full_text, limit=3)

                    if meaning_results and meaning_results[0]['score'] >= 40:
                        best = meaning_results[0]
                        entry = best['entry']

                        lampung_word = entry['lampung_word']
                        dialects = {entry['dialect']: lampung_word}

                        final_translations = [lampung_word]
                        mapping.append({
                            'source': full_text,
                            'matched_word': entry['indonesia_word'],
                            'target': lampung_word,
                            'match_type': 'meaning_search',
                            'score': best['score'],
                            'found': True,
                            'scope': 'indonesia_word_and_description'
                        })
                        matched_entry = entry
                        match_type = 'meaning_search'
                        confidence_score = best['score']

                        if lampung_word not in translations_by_dialect[entry['dialect']]:
                            translations_by_dialect[entry['dialect']].append(lampung_word)
                        if entry['dialect'] not in detected_dialects:
                            detected_dialects.append(entry['dialect'])

                    else:
                        # 4. Try fuzzy match in indonesia ONLY
                        temp_mapping = []
                        fuzzy_found = False

                        for token in tokens:
                            exact_result = self.exact_match_indonesia(token)
                            if exact_result and exact_result['found']:
                                dialects = exact_result['translations']
                                target_dialect = list(dialects.keys())[0]
                                translated = dialects[target_dialect]
                                final_translations.append(translated)
                                temp_mapping.append({
                                    'source': token,
                                    'matched_word': token,
                                    'target': translated,
                                    'match_type': 'exact',
                                    'score': 100,
                                    'found': True,
                                    'scope': 'indonesia_word_and_description'
                                })
                                for d, lampung in dialects.items():
                                    if lampung not in translations_by_dialect[d]:
                                        translations_by_dialect[d].append(lampung)
                                    if d not in detected_dialects:
                                        detected_dialects.append(d)
                            else:
                                fuzzy_result = self.fuzzy_match_indonesia_only(token, threshold=75)
                                if fuzzy_result and fuzzy_result['found']:
                                    dialects = fuzzy_result['translations']
                                    target_dialect = list(dialects.keys())[0]
                                    translated = dialects[target_dialect]
                                    final_translations.append(translated)
                                    temp_mapping.append({
                                        'source': token,
                                        'matched_word': fuzzy_result['matched_word'],
                                        'target': translated,
                                        'match_type': 'fuzzy',
                                        'score': fuzzy_result['score'],
                                        'found': True,
                                        'scope': 'indonesia_word_and_description'
                                    })
                                    fuzzy_found = True
                                    for d, lampung in dialects.items():
                                        if lampung not in translations_by_dialect[d]:
                                            translations_by_dialect[d].append(lampung)
                                        if d not in detected_dialects:
                                            detected_dialects.append(d)
                                else:
                                    final_translations.append(f"[{token}]")
                                    temp_mapping.append({
                                        'source': token,
                                        'found': False,
                                        'match_type': 'not_found',
                                        'scope': 'indonesia_word_and_description'
                                    })
                                    not_found.append(token)

                        mapping = temp_mapping
                        if fuzzy_found:
                            match_type = 'fuzzy'
                            confidence_score = 80
                        else:
                            match_type = 'not_found'
                            confidence_score = 0

        # Build translated text
        translated_text = " ".join(final_translations)

        # Handle multiple dialects for Indonesia -> Lampung
        translations_by_dialect_str: Dict[str, str] = {}
        for d, words in translations_by_dialect.items():
            if words:
                translations_by_dialect_str[d] = " ".join(words)

        if direction_used == "indonesia-to-lampung" and detected_dialects:
            if len(detected_dialects) == 1:
                pass  # Keep simple text
            elif len(detected_dialects) == 2:
                val_a = translations_by_dialect_str.get("A", "")
                val_o = translations_by_dialect_str.get("O", "")

                if val_a == val_o and val_a:
                    translated_text = val_a
                    match_type = 'exact'
                else:
                    dialect_parts = []
                    if "A" in translations_by_dialect_str:
                        dialect_parts.append(f"Dialek A: {translations_by_dialect_str['A']}")
                    if "O" in translations_by_dialect_str:
                        dialect_parts.append(f"Dialek O: {translations_by_dialect_str['O']}")
                    translated_text = " | ".join(dialect_parts)

        print(f"[TRANSLATE] result: {translated_text}")
        print(f"[TRANSLATE] match_type: {match_type}, confidence: {confidence_score}, scope: {search_scope}")

        # Build result
        result = {
            'input': text,
            'selected_direction': selected_direction,
            'detected_language': detected_language,
            'detected_direction': direction_used,
            'detected_dialect': detected_dialect,
            'direction_used': direction_used,
            'search_scope': search_scope,
            'auto_switched': auto_switched,
            'case_folding': preprocess_result['case_folding'],
            'tokens': preprocess_result['tokens'],
            'normalized_tokens': tokens,
            'language_detection': detection_scores,
            'mapping': mapping,
            'translated_tokens': final_translations,
            'translated_text': translated_text,
            'not_found': not_found,
            'message': message,
            'success': True,
            'match_type': match_type,
            'confidence_score': confidence_score,
            'suggested_word': suggested_word
        }

        if matched_entry:
            result['matched_entry'] = matched_entry

        if normalized_phrase:
            result['normalized_phrase'] = normalized_phrase

        if direction_used == "indonesia-to-lampung" and detected_dialects:
            result['translations_by_dialect'] = translations_by_dialect_str
            result['detected_dialects'] = detected_dialects

        return result

    def set_dictionary(self, db_rows: List[Dict]) -> None:
        """Set dictionary from external database rows"""
        self.load_dictionary_from_db(db_rows)