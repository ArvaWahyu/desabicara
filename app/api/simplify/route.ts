import { NextResponse } from "next/server";
import { simplify } from "@/lib/simplify-service";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Teks tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Perform simplification using built-in service
    const result = await simplify(text);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error in Simplify Route:", error);
    return NextResponse.json(
      { error: "Internal Server Error: Gagal menyederhanakan teks" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "nlp-simplify",
    mode: "rule-based",
  });
}