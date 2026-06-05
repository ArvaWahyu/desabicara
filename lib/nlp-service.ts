/**
 * NLP Service - Dictionary-based translation for Lampung Language
 * Works directly in Next.js without external Flask service
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface NLPResult {
  translatedText: string;
  simplifiedText?: string;
  nlp_steps: {
    original?: string;
    caseFolded?: string;
    tokens?: string[];
    normalized?: string[];
    dictionaryLookups?: Record<string, string>;
    reconstructed?: string;
  };
  processing_time_ms: number;
  detectedDialect?: string;
  success: boolean;
  error?: string;
  auto_switched?: boolean;
  message?: string;
}

// Normalize Lampung text (simplified version)
function caseFold(text: string): string {
  return text.toLowerCase().trim();
}

// Tokenize text into words
function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 0);
}

// Normalize common variations
function normalizeWord(word: string): string {
  let normalized = word.replace(/[.,!?;:]/g, '');
  return normalized;
}

// Dictionary lookup with dialect detection
async function dictionaryLookup(
  tokens: string[],
  direction: 'lampung-to-indonesia' | 'indonesia-to-lampung'
): Promise<{ lookups: Record<string, string>; detectedDialect?: string; unmappedTokens: string[] }> {
  const lookups: Record<string, string> = {};
  const unmappedTokens: string[] = [];
  let detectedDialect: string | undefined;

  const targetField = direction === 'lampung-to-indonesia' ? 'lampungWord' : 'indonesiaWord';
  const translateField = direction === 'lampung-to-indonesia' ? 'indonesiaWord' : 'lampungWord';

  for (const token of tokens) {
    if (lookups[token]) continue;

    try {
      let entry = await prisma.dictionary.findFirst({
        where: {
          [targetField]: token,
          isActive: true,
        },
      });

      if (!entry) {
        entry = await prisma.dictionary.findFirst({
          where: {
            [targetField]: token.toLowerCase(),
            isActive: true,
          },
        });
      }

      if (entry) {
        lookups[token] = entry[translateField];
        if (!detectedDialect && entry.dialect) {
          detectedDialect = entry.dialect;
        }
      } else {
        const normalized = normalizeWord(token);
        if (normalized !== token) {
          entry = await prisma.dictionary.findFirst({
            where: {
              [targetField]: normalized,
              isActive: true,
            },
          });

          if (entry) {
            lookups[token] = entry[translateField];
            if (!detectedDialect && entry.dialect) {
              detectedDialect = entry.dialect;
            }
            continue;
          }
        }

        unmappedTokens.push(token);
      }
    } catch (error) {
      console.error('Dictionary lookup error:', error);
      unmappedTokens.push(token);
    }
  }

  return { lookups, detectedDialect, unmappedTokens };
}

// Reconstruct translated text preserving punctuation and structure
function reconstruct(
  originalTokens: string[],
  lookups: Record<string, string>,
  _unmappedTokens: string[]
): string {
  return originalTokens.map(token => {
    const punctuation = token.match(/[.,!?;:]+$/)?.[0] || '';
    const cleanToken = token.replace(/[.,!?;:]+$/, '');

    if (lookups[cleanToken]) {
      return lookups[cleanToken] + punctuation;
    }
    return token;
  }).join(' ');
}

// Main translation function
export async function translate(
  text: string,
  direction: 'lampung-to-indonesia' | 'indonesia-to-lampung' = 'lampung-to-indonesia',
  autoDetect: boolean = true
): Promise<NLPResult> {
  const startTime = Date.now();

  try {
    const original = text.trim();

    if (!original) {
      return {
        translatedText: '',
        nlp_steps: {},
        processing_time_ms: Date.now() - startTime,
        success: false,
        error: 'Teks tidak boleh kosong',
      };
    }

    // Step 1: Case folding
    const caseFolded = caseFold(original);

    // Step 2: Tokenization
    const tokens = tokenize(caseFolded);

    // Step 3: Dictionary lookup
    const { lookups, detectedDialect, unmappedTokens } = await dictionaryLookup(tokens, direction);

    // Step 4: Reconstruction
    const reconstructed = reconstruct(tokens, lookups, unmappedTokens);

    // Step 5: Auto-detect direction if enabled
    let autoSwitched = false;
    let message = '';

    if (autoDetect && unmappedTokens.length > tokens.length * 0.7 && tokens.length > 2) {
      const oppositeDirection = direction === 'lampung-to-indonesia'
        ? 'indonesia-to-lampung'
        : 'lampung-to-indonesia';

      const reverseLookups = await dictionaryLookup(tokens, oppositeDirection);

      if (reverseLookups.unmappedTokens.length < unmappedTokens.length) {
        const reverseReconstructed = reconstruct(tokens, reverseLookups.lookups, reverseLookups.unmappedTokens);

        autoSwitched = true;

        if (oppositeDirection === 'indonesia-to-lampung') {
          message = 'Arah terjemahan diubah ke Indonesia → Lampung karena teks terdeteksi sebagai Bahasa Indonesia';
        } else {
          message = 'Arah terjemahan diubah ke Lampung → Indonesia karena teks terdeteksi sebagai Bahasa Lampung';
        }

        const nlpSteps = {
          original,
          caseFolded,
          tokens,
          lookups: reverseLookups.lookups,
          unmappedTokens: reverseLookups.unmappedTokens,
          reconstructed: reverseReconstructed,
          autoSwitch: {
            switched: true,
            originalDirection: direction,
            newDirection: oppositeDirection,
          },
        };

        return {
          translatedText: reverseReconstructed,
          nlp_steps: nlpSteps,
          processing_time_ms: Date.now() - startTime,
          detectedDialect: reverseLookups.detectedDialect || detectedDialect,
          success: true,
          auto_switched: true,
          message,
        };
      }
    }

    const nlpSteps = {
      original,
      caseFolded,
      tokens,
      lookups,
      unmappedTokens,
      reconstructed,
      detectedDialect,
    };

    return {
      translatedText: reconstructed,
      nlp_steps: nlpSteps,
      processing_time_ms: Date.now() - startTime,
      detectedDialect,
      success: true,
    };

  } catch (error: any) {
    console.error('Translation error:', error);
    return {
      translatedText: '',
      nlp_steps: {},
      processing_time_ms: Date.now() - startTime,
      success: false,
      error: error.message || 'Terjadi kesalahan saat menerjemahkan',
    };
  }
}