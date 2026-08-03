import { NextRequest } from "next/server";
import {
  storeSession,
  generateSessionId,
} from "@/lib/saga/sessionStore";
import { SagaSessionSchema } from "@/lib/saga/schema";

/**
 * POST /api/sessions
 *
 * Called by saga-launch.js to upload a project.saga.json file.
 * Validates against the Zod schema, stores in memory, returns { sessionId }.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = SagaSessionSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid saga session data",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const sessionId = generateSessionId(parsed.data);
    storeSession(sessionId, parsed.data);

    return Response.json({ sessionId }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to parse request body" },
      { status: 400 },
    );
  }
}
