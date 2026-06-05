/**
 * Script Import Kosakata Lampung dari file TXT ke Database
 *
 * Format file: Kata Lampung: Arti Indonesia
 * Setiap entri di-import untuk dialek A dan O
 *
 * Usage: npm run import:kosakata
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Konfigurasi dialek yang akan diimport
const DIALECTS_TO_IMPORT = ['A', 'O'];

// Source untuk data ini
const SOURCE_NAME = 'Kosakata Tambahan Manual Dialek A/O';

interface ParsedEntry {
  lampungWord: string;
  indonesiaWord: string;
  description: string;
}

interface FinalRecord {
  lampungWord: string;
  indonesiaWord: string;
  dialect: string;
  partOfSpeech: string | null;
  description: string;
  source: string;
}

/**
 * Parse satu baris dari file kosakata
 * Format: "Kata Lampung: Arti Indonesia"
 */
function parseLine(line: string): ParsedEntry | null {
  // Skip baris kosong atau tanpa ':'
  if (!line || !line.includes(':')) {
    return null;
  }

  const parts = line.split(':');
  if (parts.length < 2) {
    return null;
  }

  const rawLampungWord = parts[0].trim();
  const rawIndonesia = parts.slice(1).join(':').trim(); // Gabung ulang karena arti bisa mengandung ':'

  // Skip jika kata Lampung kosong
  if (!rawLampungWord) {
    return null;
  }

  // Buat lampungWord lowercase
  const lampungWord = rawLampungWord.toLowerCase();

  // Indonesia word - ambil arti pertama jika ada koma/titik koma
  let indonesiaWord = rawIndonesia.toLowerCase();

  // Cek apakah ada deskripsi tambahan (setelah koma)
  const commaIndex = indonesiaWord.indexOf(',');
  const semicolonIndex = indonesiaWord.indexOf(';');

  // Ambilarti pertama sebelum koma/titik koma
  let description = indonesiaWord;

  if (commaIndex !== -1 || semicolonIndex !== -1) {
    const firstSepIndex = commaIndex !== -1 && semicolonIndex !== -1
      ? Math.min(commaIndex, semicolonIndex)
      : commaIndex !== -1 ? commaIndex : semicolonIndex;

    indonesiaWord = indonesiaWord.substring(0, firstSepIndex).trim();
    description = description.substring(0, firstSepIndex).trim(); // Description = arti pertama saja
  }

  // Validasi minimum
  if (!lampungWord || !indonesiaWord) {
    return null;
  }

  return {
    lampungWord,
    indonesiaWord,
    description
  };
}

/**
 * Pecah kata dengan slash menjadi array
 * Contoh: "Atukh/atokh" -> ["atukh", "atokh"]
 */
function splitVariants(lampungWord: string): string[] {
  // Handle multi-slash seperti "Anak nakan/nakan: keponakan"
  // Split hanya slash pertama, sisanya tetap utuh
  const parts = lampungWord.split('/');
  return parts.map(p => p.trim().toLowerCase()).filter(p => p.length > 0);
}

/**
 * Baca dan parse file kosakata
 */
function readKosakataFile(filePath: string): ParsedEntry[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const validEntries: ParsedEntry[] = [];
  let invalidLines = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip baris kosong
    if (!trimmedLine) {
      continue;
    }

    const parsed = parseLine(trimmedLine);
    if (parsed) {
      validEntries.push(parsed);
    } else {
      invalidLines++;
    }
  }

  return validEntries;
}

/**
 * Generate records dengan semua dialek
 */
function generateDialectRecords(entries: ParsedEntry[], dialects: string[]): FinalRecord[] {
  const records: FinalRecord[] = [];

  for (const entry of entries) {
    const variants = splitVariants(entry.lampungWord);

    for (const variant of variants) {
      for (const dialect of dialects) {
        records.push({
          lampungWord: variant,
          indonesiaWord: entry.indonesiaWord,
          dialect,
          partOfSpeech: null,
          description: entry.description,
          source: SOURCE_NAME
        });
      }
    }
  }

  return records;
}

/**
 * Main import function
 */
async function main() {
  console.log('═'.repeat(60));
  console.log('  IMPORT KOSAKATA LAMPUNG - DESA Bicara');
  console.log('═'.repeat(60));
  console.log('');

  const filePath = path.join(process.cwd(), 'kosakata.txt');
  console.log(`📁 Reading file: ${filePath}`);
  console.log('');

  try {
    // Read and parse file
    const entries = readKosakataFile(filePath);
    const totalLines = entries.length;

    console.log(`📊 Total valid lines: ${totalLines}`);

    // Generate records with dialects
    const records = generateDialectRecords(entries, DIALECTS_TO_IMPORT);
    const totalRecords = records.length;

    console.log(`📊 Total records with dialects (${DIALECTS_TO_IMPORT.join(', ')}): ${totalRecords}`);
    console.log('');

    // Preview first 20 records
    console.log('🔍 Preview (first 20 records):');
    console.log('─'.repeat(60));

    const previewCount = Math.min(20, records.length);
    for (let i = 0; i < previewCount; i++) {
      const r = records[i];
      console.log(`${i + 1}. ${r.lampungWord} | ${r.indonesiaWord} | ${r.dialect}`);
    }

    if (records.length > 20) {
      console.log(`... and ${records.length - 20} more records`);
    }

    console.log('');
    console.log('─'.repeat(60));
    console.log('🚀 Starting import to database...');
    console.log('');

    // Batch insert using createMany with skipDuplicates
    let insertedCount = 0;
    let skippedCount = 0;
    const batchSize = 100;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(records.length / batchSize);

      try {
        const result = await prisma.dictionary.createMany({
          data: batch,
          skipDuplicates: true
        });

        insertedCount += result.count;
        // Estimate skipped (total expected - actual inserted for this batch)
        // Note: createMany doesn't return skipped count directly
        console.log(`   Batch ${batchNum}/${totalBatches}: ${result.count} inserted`);
      } catch (error: any) {
        console.error(`   Batch ${batchNum}/${totalBatches}: Error - ${error.message}`);
      }
    }

    console.log('');
    console.log('═'.repeat(60));
    console.log('  IMPORT SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Total records imported: ${insertedCount}`);
    console.log(`⏭️  Total records skipped (duplicates): ~${totalRecords - insertedCount}`);
    console.log(`📊 Dialects imported: ${DIALECTS_TO_IMPORT.join(', ')}`);
    console.log(`📁 Source file: ${filePath}`);
    console.log('═'.repeat(60));

  } catch (error: any) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run
main().then(() => {
  console.log('');
  console.log('✨ Import completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});