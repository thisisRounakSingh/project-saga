import { SagaSession } from "./schema";
import { getSession } from "./sessionStore";

export async function getSagaSession(
  sessionId: string,
): Promise<SagaSession | null> {
  // Delegate to the new in-memory session store which handles both
  // dynamically uploaded sessions (via API) and fallback to fixtures.
  return getSession(sessionId);
}
