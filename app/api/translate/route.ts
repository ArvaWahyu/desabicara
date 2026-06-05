import { NextResponse } from "next/server";
import { translate } from "@/lib/nlp-service";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { text, direction = "lampung-to-indonesia", auto_detect = true } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Teks translasi tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Perform translation using built-in NLP service
    const result = await translate(text, direction, auto_detect);

    // Save to translation history
    if (result.success) {
      try {
        await prisma.translationHistory.create({
          data: {
            inputText: text,
            translatedText: result.translatedText,
            direction,
            detectedDialect: result.detectedDialect,
            nlpSteps: result.nlp_steps,
            processingTime: result.processing_time_ms,
          },
        });
      } catch (historyError) {
        console.error("Failed to save translation history:", historyError);
        // Don't fail the translation if history save fails
      }
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error in Translate Route:", error);
    return NextResponse.json(
      { error: "Internal Server Error: Gagal memproses terjemahan" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "nlp-translation",
    mode: "dictionary-based",
  });
}