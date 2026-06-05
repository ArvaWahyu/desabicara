"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getDictionaryEntries(
  search = "",
  page = 1,
  limit = 10,
  dialectFilter = "all"
) {
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};

  if (search) {
    const searchLower = search.toLowerCase();
    where.OR = [
      { lampungWord: { contains: searchLower } },
      { indonesiaWord: { contains: searchLower } },
      { description: { contains: searchLower } },
    ];
  }

  if (dialectFilter !== "all") {
    where.dialect = dialectFilter;
  }

  const [entries, total] = await Promise.all([
    db.dictionary.findMany({
      where,
      skip,
      take: limit,
      orderBy: { lampungWord: "asc" },
    }),
    db.dictionary.count({ where }),
  ]);

  return {
    entries,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getDictionaryEntryById(id: number) {
  return db.dictionary.findUnique({
    where: { id },
  });
}

export async function createDictionaryEntry(formData: FormData) {
  const lampungInput = formData.get("lampungWord");
  const indonesiaInput = formData.get("indonesiaWord");
  const dialectsInput = formData.get("dialects");

  const lampungWord = lampungInput ? String(lampungInput).trim().toLowerCase() : "";
  const indonesiaWord = indonesiaInput ? String(indonesiaInput).trim().toLowerCase() : "";
  const dialectsStr = dialectsInput ? String(dialectsInput) : "";

  // Parse dialects from comma-separated string
  const dialects = dialectsStr
    .split(",")
    .map((d) => d.trim().toUpperCase())
    .filter((d) => d === "A" || d === "O");

  // Validation
  if (!lampungWord || !indonesiaWord) {
    return { success: false, error: "Kata Lampung dan arti Indonesia wajib diisi" };
  }

  if (lampungWord.length < 2 || indonesiaWord.length < 2) {
    return { success: false, error: "Kata minimal 2 karakter" };
  }

  if (dialects.length === 0) {
    return { success: false, error: "Pilih minimal satu dialek" };
  }

  try {
    // Check existing entries for each dialect
    const existingEntries = await db.dictionary.findMany({
      where: {
        lampungWord,
        indonesiaWord,
        dialect: { in: dialects },
      },
    });

    const existingDialects = new Set(existingEntries.map((e) => e.dialect));
    const newDialects = dialects.filter((d) => !existingDialects.has(d));

    if (newDialects.length === 0) {
      return {
        success: false,
        error: "Kosakata dengan dialek tersebut sudah tersedia"
      };
    }

    // Create only new entries
    const dataToInsert = newDialects.map((dialect) => ({
      lampungWord,
      indonesiaWord,
      dialect,
    }));

    await db.dictionary.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    const addedCount = dataToInsert.length;
    const skippedCount = dialects.length - newDialects.length;

    let message = `Kata berhasil ditambahkan`;
    if (skippedCount > 0 && addedCount > 0) {
      message = `${addedCount} kosakata ditambahkan, ${skippedCount} sudah ada sebelumnya`;
    } else if (skippedCount > 0 && addedCount === 0) {
      message = "Kosakata dengan dialek tersebut sudah tersedia";
    }

    revalidatePath("/admin/dictionary");
    return { success: true, message };

  } catch (err) {
    console.error("[DICTIONARY ACTION] Create error:", err);
    console.error("[DICTIONARY ACTION] Full error details:", JSON.stringify(err, null, 2));

    if (err && typeof err === 'object' && 'code' in err) {
      const prismaError = err as { code?: string; message?: string; meta?: unknown };
      console.error("[DICTIONARY ACTION] Prisma error code:", prismaError.code);

      if (prismaError.code === 'P2002') {
        return { success: false, error: "Kosakata dengan dialek tersebut sudah tersedia" };
      }
      if (prismaError.code === 'P2003') {
        return { success: false, error: "Referensi data tidak valid" };
      }
    }

    const errorMessage = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Gagal menambahkan kata: ${errorMessage}` };
  }
}

export async function updateDictionaryEntry(id: number, formData: FormData) {
  const lampungInput = formData.get("lampungWord");
  const indonesiaInput = formData.get("indonesiaWord");
  const dialectInput = formData.get("dialect");

  const lampungWord = lampungInput ? String(lampungInput).trim().toLowerCase() : "";
  const indonesiaWord = indonesiaInput ? String(indonesiaInput).trim().toLowerCase() : "";
  const dialect = dialectInput ? String(dialectInput).toUpperCase() : "A";

  if (!lampungWord || !indonesiaWord) {
    return { success: false, error: "Kata Lampung dan arti Indonesia wajib diisi" };
  }

  if (lampungWord.length < 2 || indonesiaWord.length < 2) {
    return { success: false, error: "Kata minimal 2 karakter" };
  }

  if (dialect !== "A" && dialect !== "O") {
    return { success: false, error: "Dialek harus A atau O" };
  }

  try {
    await db.dictionary.update({
      where: { id },
      data: {
        lampungWord,
        indonesiaWord,
        dialect,
      },
    });

    revalidatePath("/admin/dictionary");
    return { success: true, message: "Kata berhasil diperbarui" };
  } catch (err) {
    console.error("[DICTIONARY ACTION] Update error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: "Gagal memperbarui: " + errorMessage };
  }
}

export async function deleteDictionaryEntry(id: number) {
  try {
    await db.dictionary.delete({
      where: { id },
    });

    revalidatePath("/admin/dictionary");
    return { success: true, message: "Kata berhasil dihapus" };
  } catch (err) {
    console.error("[DICTIONARY ACTION] Delete error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: "Gagal menghapus: " + errorMessage };
  }
}

export async function getDictionaryStats() {
  const [total, dialectA, dialectO] = await Promise.all([
    db.dictionary.count(),
    db.dictionary.count({ where: { dialect: "A" } }),
    db.dictionary.count({ where: { dialect: "O" } }),
  ]);

  return {
    total: total ?? 0,
    apiDialect: dialectA ?? 0,
    nyoDialect: dialectO ?? 0,
    active: total ?? 0,
  };
}