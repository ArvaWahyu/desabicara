/**
 * Simplify Service - Convert formal Indonesian to simple/casual version
 * Works directly in Next.js without external Flask service
 */

interface SimplifyResult {
  simplified: string;
  original: string;
  success: boolean;
  error?: string;
}

// Common formal to casual word mappings
const formalToCasualMap: Record<string, string> = {
  'saya': 'gue',
  'anda': 'kamu',
  'kamu': 'loe',
  'kami': 'kita',
  'mereka': 'mereket',
  'di sini': 'disini',
  'di sana': 'disana',
  'ke sini': 'kesini',
  'ke sana': 'kesana',
  'adalah': 'sih',
  'merupakan': 'itu',
  'terletak': 'berada',
  'sekarang': 'sekarang',
  'nanti': 'ntar',
  'kemudian': 'terus',
  'setelah itu': 'abis itu',
  'sebelum itu': 'sebelum itu',
  'dan juga': ' sama ',
  'serta': ' sama ',
  'bahwa': 'kalo',
  'karena': 'soalnya',
  'oleh karena itu': 'makanya',
  'mengapa': 'kenapa',
  'bagaimana': 'gimana',
  'terima kasih': 'makasih',
  'terima kasih banyak': 'makasih banyak',
  'tidak': 'nggak',
  'bukan': 'bukan',
  'sudah': 'udah',
  'belum': 'belum',
  'akan': 'bakal',
  'dapat': 'bisa',
  'sangat': 'banget',
  'sekali': 'banget',
  'tersebut': 'itu',
};

// Common Lampung words to preserve
const lampungWords = ['nyak', 'mengan', 'nappa', 'nihan', 'pipit', 'bua', 'sang', 'ndu', 'gok', 'nge', 'ngok', 'nak', 'tuk', 'ti', 'ka', 'nak', 'jua'];

// Simplify text
function simplifyText(text: string): string {
  let simplified = text;

  // Apply formal to casual mapping (longest match first)
  const sortedKeys = Object.keys(formalToCasualMap).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(key, 'gi');
    simplified = simplified.replace(regex, formalToCasualMap[key]);
  }

  // Remove excessive spaces
  simplified = simplified.replace(/\s+/g, ' ').trim();

  // Remove common formal suffixes
  simplified = simplified.replace(/\s+-lah/gi, '');
  simplified = simplified.replace(/\s+-kan/gi, '');
  simplified = simplified.replace(/\s+-nya/gi, '');

  return simplified;
}

// Check if text contains Lampung words
function containsLampungWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return lampungWords.some(word => lowerText.includes(word));
}

// Main simplification function
export async function simplify(text: string): Promise<SimplifyResult> {
  try {
    if (!text || text.trim() === "") {
      return {
        simplified: '',
        original: text,
        success: false,
        error: 'Teks tidak boleh kosong',
      };
    }

    // Check if text contains Lampung words (preserve them)
    if (containsLampungWords(text)) {
      return {
        simplified: text,
        original: text,
        success: true,
      };
    }

    // Apply simplification
    const simplified = simplifyText(text);

    return {
      simplified,
      original: text,
      success: true,
    };

  } catch (error: any) {
    console.error('Simplification error:', error);
    return {
      simplified: text,
      original: text,
      success: false,
      error: error.message || 'Terjadi kesalahan saat menyederhanakan',
    };
  }
}