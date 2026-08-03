import { NextRequest } from "next/server";
import { storeAnswer, getAnswer } from "@/lib/saga/sessionStore";

export const dynamic = "force-dynamic";

/**
 * POST /api/sessions/[id]/answer
 *
 * Called by saga-launch.js after running `codex exec` to post the AI answer
 * back to the frontend.
 *
 * Expected body: { questionId: string, answer: string, confidence?: string, referencedCommits?: string[] }
 *
 * GET /api/sessions/[id]/answer?questionId=<id>
 *
 * Called by the frontend to check if an answer is available for a given question.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;

  try {
    const body = await request.json();
    const { questionId, answer, confidence, referencedCommits } = body;

    if (!questionId || typeof questionId !== "string") {
      return Response.json(
        { error: "Missing or invalid 'questionId'" },
        { status: 400 },
      );
    }

    if (!answer || typeof answer !== "string") {
      return Response.json(
        { error: "Missing or invalid 'answer'" },
        { status: 400 },
      );
    }

    storeAnswer(sessionId, questionId, answer, confidence, referencedCommits);

    return Response.json({ status: "ok" }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to parse request body" },
      { status: 400 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;

  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("questionId");

  if (!questionId) {
    return Response.json(
      { error: "Missing 'questionId' query parameter" },
      { status: 400 },
    );
  }

  const answer = getAnswer(sessionId, questionId);

  if (!answer) {
    return Response.json({ answer: null, pending: true });
  }

  return Response.json({
    answer: answer.answer,
    confidence: answer.confidence || null,
    referencedCommits: answer.referencedCommits || [],
    timestamp: answer.timestamp,
    pending: false,
  });
}
