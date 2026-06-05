/**
 * Script Hapus Semua Entri Kamus dari Database
 *
 * Usage: npm run db:clear-dictionary
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('═'.repeat(60));
  console.log('  DELETE ALL DICTIONARY ENTRIES');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Count before delete
    const countBefore = await prisma.dictionary.count();
    console.log(`📊 Records before delete: ${countBefore}`);

    if (countBefore === 0) {
      console.log('⚠️  No records to delete.');
      return;
    }

    // Delete all
    const result = await prisma.dictionary.deleteMany({});

    console.log(`✅ Deleted: ${result.count} records`);
    console.log('');

    // Verify
    const countAfter = await prisma.dictionary.count();
    console.log(`📊 Records after delete: ${countAfter}`);

  } catch (error: any) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().then(() => {
  console.log('');
  console.log('✨ Delete completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
