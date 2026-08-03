import { NextRequest } from "next/server";
import { getSession } from "@/lib/saga/sessionStore";

/**
 * GET /api/sessions/[id]
 *
 * Returns the full saga session data for the given session ID.
 * Checks in-memory store first, then falls back to fixture files.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = getSession(id);

  if (!session) {
    return Response.json(
      { error: `Session "${id}" not found` },
      { status: 404 },
    );
  }

  return Response.json(session);
}
