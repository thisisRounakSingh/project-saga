import { NextRequest } from "next/server";
import { getQuestionsSince } from "@/lib/saga/sessionStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/sessions/[id]/questions
 *
 * Called by saga-launch.js in a polling loop to pick up pending user questions.
 * Supports cursor-based pagination via ?since=<questionId>.
 *
 * Returns: { questions: [{ id: string, text: string }, ...] }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const sinceCursor = searchParams.get("since") || undefined;

  const pending = getQuestionsSince(id, sinceCursor);

  // Return the shape saga-launch.js expects: { questions: [{ id, text }] }
  return Response.json({
    questions: pending.map((q) => ({
      id: q.id,
      text: q.text,
    })),
  });
}
