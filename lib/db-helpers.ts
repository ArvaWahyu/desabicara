import { PrismaClient } from '@prisma/client';

// PrismaClient singleton to prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Dictionary helper functions
export const dictionaryHelpers = {
  // Get all dictionary entries
  getAll: async (options?: {
    skip?: number;
    take?: number;
    where?: {
      lampungWord?: { contains: string };
      indonesiaWord?: { contains: string };
      category?: string;
      dialect?: string;
    };
  }) => {
    return await prisma.dictionary.findMany({
      ...options,
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get dictionary entry by ID
  getById: async (id: number) => {
    return await prisma.dictionary.findUnique({
      where: { id },
    });
  },

  // Search dictionary by Lampung word
  searchByLampung: async (query: string) => {
    return await prisma.dictionary.findMany({
      where: {
        lampungWord: { contains: query, mode: 'insensitive' },
        isActive: true,
      },
      take: 20,
    });
  },

  // Search dictionary by Indonesian word
  searchByIndonesia: async (query: string) => {
    return await prisma.dictionary.findMany({
      where: {
        indonesiaWord: { contains: query, mode: 'insensitive' },
        isActive: true,
      },
      take: 20,
    });
  },

  // Create new dictionary entry
  create: async (data: {
    lampungWord: string;
    indonesiaWord: string;
    dialect?: string;
    category: string;
    exampleSentence?: string;
    exampleMeaning?: string;
  }) => {
    return await prisma.dictionary.create({
      data,
    });
  },

  // Update dictionary entry
  update: async (id: number, data: {
    lampungWord?: string;
    indonesiaWord?: string;
    dialect?: string;
    category?: string;
    exampleSentence?: string;
    exampleMeaning?: string;
    isActive?: boolean;
  }) => {
    return await prisma.dictionary.update({
      where: { id },
      data,
    });
  },

  // Delete dictionary entry
  delete: async (id: number) => {
    return await prisma.dictionary.delete({
      where: { id },
    });
  },

  // Get dictionary statistics
  getStats: async () => {
    const total = await prisma.dictionary.count();
    const byCategory = await prisma.dictionary.groupBy({
      by: ['category'],
      _count: true,
    });
    const byDialect = await prisma.dictionary.groupBy({
      by: ['dialect'],
      _count: true,
    });

    return {
      total,
      byCategory,
      byDialect,
    };
  },
};

// Translation history helper functions
export const translationHistoryHelpers = {
  // Get all translation history
  getAll: async (options?: {
    skip?: number;
    take?: number;
    where?: {
      direction?: string;
    };
  }) => {
    return await prisma.translationHistory.findMany({
      ...options,
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get translation history by ID
  getById: async (id: string) => {
    return await prisma.translationHistory.findUnique({
      where: { id },
    });
  },

  // Create new translation history entry
  create: async (data: {
    inputText: string;
    translatedText: string;
    simplifiedText?: string;
    direction?: string;
    nlpSteps: any;
    processingTime?: number;
  }) => {
    return await prisma.translationHistory.create({
      data,
    });
  },

  // Get recent translations
  getRecent: async (limit: number = 10) => {
    return await prisma.translationHistory.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get translation statistics
  getStats: async () => {
    const total = await prisma.translationHistory.count();
    const recent = await prisma.translationHistory.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    return {
      total,
      recent,
    };
  },

  // Delete translation history
  delete: async (id: string) => {
    return await prisma.translationHistory.delete({
      where: { id },
    });
  },
};

// Admin helper functions
export const adminHelpers = {
  // Get admin by email
  getByEmail: async (email: string) => {
    return await prisma.admin.findUnique({
      where: { email },
    });
  },

  // Get admin by username
  getByUsername: async (username: string) => {
    return await prisma.admin.findUnique({
      where: { username },
    });
  },

  // Create new admin
  create: async (data: {
    username: string;
    email: string;
    password: string;
    name?: string;
    role?: string;
  }) => {
    return await prisma.admin.create({
      data,
    });
  },

  // Update admin
  update: async (id: string, data: {
    username?: string;
    email?: string;
    password?: string;
    name?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    return await prisma.admin.update({
      where: { id },
      data,
    });
  },

  // Get all admins
  getAll: async () => {
    return await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  },
};

// Simplification history helper functions
export const simplificationHistoryHelpers = {
  // Create new simplification history
  create: async (data: {
    formalText: string;
    simplifiedText: string;
  }) => {
    return await prisma.simplificationHistory.create({
      data,
    });
  },

  // Get all simplification history
  getAll: async (options?: {
    skip?: number;
    take?: number;
  }) => {
    return await prisma.simplificationHistory.findMany({
      ...options,
      orderBy: { createdAt: 'desc' },
    });
  },
};
