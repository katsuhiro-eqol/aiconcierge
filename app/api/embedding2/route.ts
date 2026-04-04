//外国語に対応
import { decode } from "html-entities";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GCP_API_KEY}`;

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** OpenAI SDK の APIError など status を付けるエラーを HTTP ステータスに反映 */
function httpStatusFromError(error: unknown): number {
  if (typeof error === "object" && error !== null && "status" in error) {
    const s = (error as { status: unknown }).status;
    if (typeof s === "number" && s >= 400 && s < 600) return s;
  }
  const msg = errorMessage(error);
  if (/429|rate limit|quota|exceeded your current quota/i.test(msg)) return 429;
  return 500;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const params = await req.json();
    const lang = params.language as string;
    const input = params.input as string | undefined;
    const model = params.model as string | undefined;

    if (typeof input !== "string" || !input.trim()) {
      return NextResponse.json(
        { error: "input is required", embedding: null },
        { status: 400 }
      );
    }
    if (!model?.trim()) {
      return NextResponse.json(
        { error: "model is required", embedding: null },
        { status: 400 }
      );
    }

    if (lang !== "日本語") {
      const translateRes = await fetch(translateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: input, target: "ja-JP" }),
      });
      const translateData = (await translateRes.json()) as {
        data?: { translations?: { translatedText?: string }[] };
        error?: { message?: string };
      };
      if (!translateRes.ok) {
        const msg =
          translateData?.error?.message ??
          `Translation API failed (${translateRes.status})`;
        return NextResponse.json(
          { error: msg, embedding: null },
          { status: 502 }
        );
      }
      const translated =
        translateData?.data?.translations?.[0]?.translatedText;
      if (typeof translated !== "string" || !translated.trim()) {
        return NextResponse.json(
          { error: "Translation returned empty text", embedding: null },
          { status: 502 }
        );
      }
      const decoded = decode(translated);
      const embResponse = await openai.embeddings.create({
        model,
        input: decoded,
        encoding_format: "float",
      });
      const embedding = embResponse.data[0]?.embedding;
      if (!Array.isArray(embedding) || embedding.length === 0) {
        return NextResponse.json(
          { error: "OpenAI returned empty embedding", embedding: null },
          { status: 502 }
        );
      }
      const buffer = new Float32Array(embedding);
      const vectorBase64 = Buffer.from(buffer.buffer).toString("base64");
      return NextResponse.json({ input: decoded, embedding: vectorBase64 });
    }

    const embResponse = await openai.embeddings.create({
      model,
      input,
      encoding_format: "float",
    });
    const embedding = embResponse.data[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length === 0) {
      return NextResponse.json(
        { error: "OpenAI returned empty embedding", embedding: null },
        { status: 502 }
      );
    }
    const buffer = new Float32Array(embedding);
    const vectorBase64 = Buffer.from(buffer.buffer).toString("base64");
    return NextResponse.json({ input, embedding: vectorBase64 });
  } catch (error: unknown) {
    console.error("embedding2:", error);
    const status = httpStatusFromError(error);
    return NextResponse.json(
      { error: errorMessage(error), embedding: null },
      { status }
    );
  }
}
