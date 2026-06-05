// Seed file - Initial data for Desa Bicara

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const initialDictionary = [
  // Common Lampung - Indonesia words (Dialek Api / A)
  { lampungWord: "nyak", indonesiaWord: "saya", dialect: "A", partOfSpeech: "pronoun" },
  { lampungWord: "mengan", indonesiaWord: "makan", dialect: "A", partOfSpeech: "verb" },
  { lampungWord: "nyakop", indonesiaWord: "sekolah", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "nappa", indonesiaWord: "kenapa", dialect: "A", partOfSpeech: "question" },
  { lampungWord: "nihan", indonesiaWord: "bagaimana", dialect: "A", partOfSpeech: "question" },
  { lampungWord: "pipit", indonesiaWord: "burung", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "bua", indonesiaWord: "buah", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "sang", indonesiaWord: "yang", dialect: "A", partOfSpeech: "article" },
  { lampungWord: "ndu", indonesiaWord: "ini", dialect: "A", partOfSpeech: "pronoun" },
  { lampungWord: "gok", indonesiaWord: "pergi", dialect: "A", partOfSpeech: "verb" },
  { lampungWord: "nge", indonesiaWord: "ke", dialect: "A", partOfSpeech: "preposition" },
  { lampungWord: "ngok", indonesiaWord: "pergi", dialect: "A", partOfSpeech: "verb" },
  { lampungWord: "nak", indonesiaWord: "aku", dialect: "A", partOfSpeech: "pronoun" },
  { lampungWord: "tuk", indonesiaWord: "untuk", dialect: "A", partOfSpeech: "preposition" },
  { lampungWord: "ti", indonesiaWord: "ke", dialect: "A", partOfSpeech: "preposition" },
  { lampungWord: "ka", indonesiaWord: "ke", dialect: "A", partOfSpeech: "preposition" },
  { lampungWord: "jua", indonesiaWord: "juga", dialect: "A", partOfSpeech: "adverb" },
  { lampungWord: "te", indonesiaWord: "di", dialect: "A", partOfSpeech: "preposition" },
  { lampungWord: "on", indonesiaWord: "di", dialect: "A", partOfSpeech: "preposition" },
  { lampungWord: "an", indonesiaWord: "dan", dialect: "A", partOfSpeech: "conjunction" },
  { lampungWord: "gulo", indonesiaWord: "gula", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "sigak", indonesiaWord: "berdiri", dialect: "A", partOfSpeech: "verb" },
  { lampungWord: "dudu", indonesiaWord: "duduk", dialect: "A", partOfSpeech: "verb" },
  { lampungWord: "tidop", indonesiaWord: "tidur", dialect: "A", partOfSpeech: "verb" },
  { lampungWord: "minom", indonesiaWord: "minum", dialect: "A", partOfSpeech: "verb" },
  { lampungWord: "ngakap", indonesiaWord: "mengerti", dialect: "A", partOfSpeech: "verb" },
  { lampungWord: "taha", indonesiaWord: "ayah", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "ina", indonesiaWord: "ibu", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "sapah", indonesiaWord: "rumah", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "oghan", indonesiaWord: "orang", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "konco", indonesiaWord: "teman", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "cung", indonesiaWord: "seperti", dialect: "A", partOfSpeech: "preposition" },
  { lampungWord: "nagari", indonesiaWord: "kampung", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "pager", indonesiaWord: "pagar", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "bayam", indonesiaWord: "bayam", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "kangkung", indonesiaWord: "kangkung", dialect: "A", partOfSpeech: "noun" },
  { lampungWord: "lah", indonesiaWord: "lah", dialect: "A", partOfSpeech: "particle" },
  { lampungWord: "kan", indonesiaWord: "kan", dialect: "A", partOfSpeech: "particle" },

  // Common Lampung words (Dialek Nyo / O)
  { lampungWord: "nako", indonesiaWord: "saya", dialect: "O", partOfSpeech: "pronoun" },
  { lampungWord: "megin", indonesiaWord: "makan", dialect: "O", partOfSpeech: "verb" },
  { lampungWord: "napo", indonesiaWord: "kenapa", dialect: "O", partOfSpeech: "question" },
  { lampungWord: "nihon", indonesiaWord: "bagaimana", dialect: "O", partOfSpeech: "question" },
  { lampungWord: "gok", indonesiaWord: "pergi", dialect: "O", partOfSpeech: "verb" },
  { lampungWord: "ngo", indonesiaWord: "ke", dialect: "O", partOfSpeech: "preposition" },
  { lampungWord: "ndoo", indonesiaWord: "ini", dialect: "O", partOfSpeech: "pronoun" },
  { lampungWord: "sango", indonesiaWord: "yang", dialect: "O", partOfSpeech: "article" },
  { lampungWord: "tuko", indonesiaWord: "untuk", dialect: "O", partOfSpeech: "preposition" },
  { lampungWord: "dio", indonesiaWord: "ke", dialect: "O", partOfSpeech: "preposition" },
  { lampungWord: "indo", indonesiaWord: "dan", dialect: "O", partOfSpeech: "conjunction" },
  { lampungWord: "ogi", indonesiaWord: "orang", dialect: "O", partOfSpeech: "noun" },
  { lampungWord: "sopo", indonesiaWord: "rumah", dialect: "O", partOfSpeech: "noun" },
  { lampungWord: "tio", indonesiaWord: "di", dialect: "O", partOfSpeech: "preposition" },
  { lampungWord: "ono", indonesiaWord: "ada", dialect: "O", partOfSpeech: "verb" },
];

async function main() {
  console.log('🔄 Database seed - starting...');

  // Create admin user (if not exists)
  console.log('👤 Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin', 10);

  try {
    await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword,
        email: 'admin@desabicara.com',
      },
      create: {
        username: 'admin',
        email: 'admin@desabicara.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
      },
    });
    console.log('✅ Admin user: admin@desabicara.com / admin');
  } catch (error) {
    console.log('⚠️  Admin user already exists');
  }

  // Seed dictionary
  console.log('📚 Seeding dictionary...');
  for (const word of initialDictionary) {
    try {
      await prisma.dictionary.upsert({
        where: {
          lampungWord_indonesiaWord_dialect: {
            lampungWord: word.lampungWord,
            indonesiaWord: word.indonesiaWord,
            dialect: word.dialect,
          },
        },
        update: {
          partOfSpeech: word.partOfSpeech,
          isActive: true,
        },
        create: {
          lampungWord: word.lampungWord,
          indonesiaWord: word.indonesiaWord,
          dialect: word.dialect,
          partOfSpeech: word.partOfSpeech,
          isActive: true,
        },
      });
    } catch (error) {
      console.log(`⚠️  Skipped: ${word.lampungWord}`);
    }
  }

  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('📋 Summary:');
  console.log('   - Admin: admin@desabicara.com / admin');
  console.log(`   - Dictionary: ${initialDictionary.length} words loaded`);
  console.log('');
  console.log('🚀 Ready for deployment!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });