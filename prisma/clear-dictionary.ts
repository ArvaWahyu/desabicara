import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDictionary() {
  try {
    console.log('🗑️  Clearing dictionary entries...');
    
    const result = await prisma.dictionary.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} dictionary entries`);
    
    // Also clear translation history
    const historyResult = await prisma.translationHistory.deleteMany({});
    console.log(`✅ Deleted ${historyResult.count} translation history entries`);
    
    console.log('🎉 Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDictionary();
