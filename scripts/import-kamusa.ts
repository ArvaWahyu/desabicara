/**
 * Import script for Kamus Budaya Lampung-Indonesia Dialek A
 *
 * Usage: npm run import:kamusa
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE = 'Kamus Budaya Lampung-Indonesia Dialek A 2023';
const DIALECT = 'A';
const DICTIONARY_FILE = 'kamusa.txt';

// Part of speech markers to detect new entries
const POS_MARKERS = [
  ' n. ',
  ' v. ',
  ' a. ',
  ' adj. ',
  ' pron. ',
  ' adv. ',
  ' p. ',
  ' ukp. ',
  ' n;',
  ' v;',
  ' a;',
  ' adj;',
  ' pron;',
  ' adv;',
  ' p;',
  ' ukp;',
];

// Lines to skip (dates, page numbers, headers)
const SKIP_PATTERNS = [
  /^\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d+$/,  // 11/10/2025 3
  /^[A-Z]\s*-\s*[a-z]\s*$/,               // A - a, B - b, etc.
  /^\s*$/,                                 // empty lines
  /^[A-Z]{2,}.*$/,                         // ALL CAPS headers
];

function findPosMarker(line: string): { marker: string; pos: number } | null {
  for (const marker of POS_MARKERS) {
    const pos = line.indexOf(marker);
    if (pos !== -1) {
      return { marker, pos };
    }
  }
  return null;
}

function cleanLine(line: string): string {
  // Replace OCR-damaged characters
  let cleaned = line
    .replace(/â€/g, '"')
    .replace(/â€"/g, '"')
    .replace(/â€"/g, '"')
    .replace(/Â/g, '')
    .replace(/â€/g, '')
    .replace(/â€/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'");

  // Normalize multiple spaces to single space
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned.trim();
}

function isValidEntry(line: string): boolean {
  const marker = findPosMarker(line);
  if (!marker) return false;

  // Check if line starts with a word (has content before the marker)
  const before = line.substring(0, marker.pos).trim();
  if (before.length < 2) return false;

  return true;
}

function shouldSkipLine(line: string): boolean {
  const cleaned = cleanLine(line);

  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(cleaned)) {
      return true;
    }
  }

  return false;
}

function parsePartOfSpeech(marker: string): string {
  // Extract part of speech from marker like " n. "
  const match = marker.match(/^\s*(\w+)\./);
  if (match) {
    return match[1];
  }
  return '';
}

function extractIndonesiaWord(description: string): string {
  // Remove numbering at start like "1. ", "2. "
  let text = description.replace(/^\d+\.\s*/, '');

  // Get first phrase before ; . , (
  const separators = [';', '.', ',', '('];
  let result = text;

  for (const sep of separators) {
    const pos = result.indexOf(sep);
    if (pos !== -1) {
      result = result.substring(0, pos).trim();
      break;
    }
  }

  // If result is too short, take first 2-3 words
  const words = result.split(' ').filter(w => w.length > 0);
  if (words.length < 1) {
    words.push(...text.split(' ').filter(w => w.length > 0).slice(0, 2));
    result = words.join(' ');
  }

  return result.toLowerCase().trim();
}

interface ParsedEntry {
  lampungWord: string;
  indonesiaWord: string;
  partOfSpeech: string;
  description: string;
  dialect: string;
  source: string;
}

function parseEntry(rawEntry: string): ParsedEntry | null {
  const marker = findPosMarker(rawEntry);
  if (!marker) return null;

  const before = rawEntry.substring(0, marker.pos).trim();
  const after = rawEntry.substring(marker.pos + marker.marker.length).trim();

  if (before.length < 1 || after.length < 1) return null;

  const lampungWord = before.toLowerCase();
  const partOfSpeech = parsePartOfSpeech(marker.marker);
  const description = after.toLowerCase();
  const indonesiaWord = extractIndonesiaWord(description);

  if (lampungWord.length < 1 || indonesiaWord.length < 1) return null;

  return {
    lampungWord,
    indonesiaWord,
    partOfSpeech,
    description,
    dialect: DIALECT,
    source: SOURCE,
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Import Kamus Budaya Lampung-Indonesia Dialek A');
  console.log('='.repeat(60));
  console.log();

  const filePath = path.join(process.cwd(), DICTIONARY_FILE);

  console.log(`Reading file: ${DICTIONARY_FILE}`);

  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  console.log(`Total lines in file: ${lines.length}`);
  console.log();

  // Process lines and combine multi-line entries
  const rawEntries: string[] = [];
  let currentEntry = '';
  let skippedLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanedLine = cleanLine(line);

    // Check if line should be skipped
    if (shouldSkipLine(line)) {
      skippedLines++;
      continue;
    }

    // Check if this line starts a new entry
    const marker = findPosMarker(cleanedLine);

    if (marker && isValidEntry(cleanedLine)) {
      // Save previous entry if exists
      if (currentEntry) {
        rawEntries.push(currentEntry);
      }
      // Start new entry
      currentEntry = cleanedLine;
    } else if (currentEntry) {
      // Continue current entry
      currentEntry += ' ' + cleanedLine;
    }
  }

  // Don't forget the last entry
  if (currentEntry) {
    rawEntries.push(currentEntry);
  }

  console.log(`Skipped lines: ${skippedLines}`);
  console.log(`Raw entries extracted: ${rawEntries.length}`);
  console.log();

  // Parse all entries
  const entries: ParsedEntry[] = [];
  const parseErrors: string[] = [];

  for (const raw of rawEntries) {
    const parsed = parseEntry(raw);
    if (parsed) {
      entries.push(parsed);
    } else {
      parseErrors.push(raw.substring(0, 100));
    }
  }

  console.log(`Successfully parsed: ${entries.length}`);
  console.log(`Parse errors: ${parseErrors.length}`);
  console.log();

  // Preview first 10 entries
  if (entries.length > 0) {
    console.log('Preview (first 10 entries):');
    console.log('-'.repeat(60));
    for (let i = 0; i < Math.min(10, entries.length); i++) {
      const e = entries[i];
      console.log(`${i + 1}. ${e.lampungWord} | ${e.indonesiaWord} | ${e.partOfSpeech} | ${e.dialect}`);
      if (e.description.length > 50) {
        console.log(`   Desc: ${e.description.substring(0, 50)}...`);
      } else {
        console.log(`   Desc: ${e.description}`);
      }
    }
    console.log('-'.repeat(60));
    console.log();
  }

  if (entries.length === 0) {
    console.log('No entries to import. Exiting.');
    await prisma.$disconnect();
    return;
  }

  // Import to database
  console.log('Importing to database...');
  console.log();

  try {
    // Use createMany with skipDuplicates
    const result = await prisma.dictionary.createMany({
      data: entries.map(e => ({
        lampungWord: e.lampungWord,
        indonesiaWord: e.indonesiaWord,
        dialect: e.dialect,
        partOfSpeech: e.partOfSpeech || null,
        description: e.description || null,
        source: e.source,
      })),
      skipDuplicates: true,
    });

    console.log(`Inserted: ${result.count} new entries`);
    console.log();

    // Get total count after import
    const totalCount = await prisma.dictionary.count();
    const dialectACount = await prisma.dictionary.count({ where: { dialect: 'A' } });
    const dialectOCount = await prisma.dictionary.count({ where: { dialect: 'O' } });

    console.log('Database summary:');
    console.log(`  Total entries: ${totalCount}`);
    console.log(`  Dialect A: ${dialectACount}`);
    console.log(`  Dialect O: ${dialectOCount}`);
    console.log();

    console.log('='.repeat(60));
    console.log('Import completed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('ERROR during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });