import { NextRequest } from "next/server";
import { addQuestion, getSession } from "@/lib/saga/sessionStore";

/**
 * POST /api/sessions/[id]/ask
 *
 * Called by the frontend when a user submits a question from the chat panel.
 * Queues the question for the bridge (saga-launch.js) to pick up via polling.
 *
 * Expected body: { question: string, context?: {...}, actId?: string }
 * Returns: { questionId: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Verify session exists
  const session = getSession(id);
  if (!session) {
    return Response.json(
      { error: `Session "${id}" not found` },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const { question, context, actId } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return Response.json(
        { error: "Missing or empty 'question' field" },
        { status: 400 },
      );
    }

    const pendingQuestion = addQuestion(id, question.trim(), context, actId);

    return Response.json(
      { questionId: pendingQuestion.id },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Failed to parse request body" },
      { status: 400 },
    );
  }
}
