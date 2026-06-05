"use server";

import { db } from "@/lib/db";

export interface TranslationRequest {
  text: string;
  dialect?: "Api" | "Nyo";
  simplify?: boolean;
}

export interface TranslationResponse {
  success: boolean;
  original: string;
  case_folding: string;
  tokens: string[];
  normalized_tokens: string[];
  translated_tokens: string[];
  translated_text: string;
  simplified_text: string | null;
  dialect: string;
  processing_time_ms: number;
  nlp_steps: {
    case_folding: string;
    tokenization: string[];
    normalization: string[];
    translation: string[];
  };
  error?: string;
}

// NLP Processing Functions
function caseFolding(text: string): string {
  return text.toLowerCase().trim();
}

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(token => token.length > 0);
}

function normalizeToken(token: string): string {
  // Remove punctuation and special characters
  return token.replace(/[^\w\s]/gi, '').toLowerCase();
}

async function translateToken(token: string, dialect: string): Promise<string> {
  const entry = await db.dictionary.findFirst({
    where: {
      lampungWord: token,
      dialect: dialect,
      isActive: true,
    },
  });

  return entry?.indonesiaWord || token; // Return original if not found
}

async function translateTokens(tokens: string[], dialect: string): Promise<string[]> {
  const translated = await Promise.all(
    tokens.map(token => translateToken(token, dialect))
  );
  return translated;
}

function simplifyText(text: string): string {
  // Simple text simplification rules
  const simplifications: Record<string, string> = {
    "tidak mau": "enggan",
    "sangat besar": "raksasa",
    "sangat kecil": "mungil",
    "sedang makan": "sedang menyantap",
    "sedang tidur": "sedang beristirahat",
  };

  let simplified = text;
  for (const [formal, simple] of Object.entries(simplifications)) {
    simplified = simplified.replace(new RegExp(formal, "gi"), simple);
  }

  return simplified;
}

export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const startTime = Date.now();
  const { text, dialect = "Api", simplify = false } = request;

  try {
    // Step 1: Case Folding
    const caseFolded = caseFolding(text);

    // Step 2: Tokenization
    const tokens = tokenize(caseFolded);

    // Step 3: Normalization
    const normalizedTokens = tokens.map(normalizeToken);

    // Step 4: Translation
    const translatedTokens = await translateTokens(normalizedTokens, dialect);
    const translatedText = translatedTokens.join(" ");

    // Step 5: Simplification (optional)
    let simplifiedText: string | null = null;
    if (simplify) {
      simplifiedText = simplifyText(translatedText);
    }

    const processingTime = Date.now() - startTime;

    // Save to history
    await db.translationHistory.create({
      data: {
        inputText: text,
        translatedText: translatedText,
        simplifiedText: simplifiedText,
        direction: "lampung_to_indonesia",
        nlpSteps: {
          caseFolding: caseFolded,
          tokenization: tokens,
          normalization: normalizedTokens,
          translationResult: translatedTokens,
        },
        processingTime: processingTime,
      },
    });

    return {
      success: true,
      original: text,
      case_folding: caseFolded,
      tokens: tokens,
      normalized_tokens: normalizedTokens,
      translated_tokens: translatedTokens,
      translated_text: translatedText,
      simplified_text: simplifiedText,
      dialect: dialect,
      processing_time_ms: processingTime,
      nlp_steps: {
        case_folding: caseFolded,
        tokenization: tokens,
        normalization: normalizedTokens,
        translation: translatedTokens,
      },
    };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      success: false,
      original: text,
      case_folding: "",
      tokens: [],
      normalized_tokens: [],
      translated_tokens: [],
      translated_text: "",
      simplified_text: null,
      dialect: dialect,
      processing_time_ms: 0,
      nlp_steps: {
        case_folding: "",
        tokenization: [],
        normalization: [],
        translation: [],
      },
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat menerjemahkan",
    };
  }
}

export async function getTranslationHistory(limit: number = 10) {
  try {
    const history = await db.translationHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return { success: true, history };
  } catch (error) {
    console.error("Error fetching translation history:", error);
    return {
      success: false,
      history: [],
      error: error instanceof Error ? error.message : "Gagal mengambil riwayat terjemahan",
    };
  }
}
