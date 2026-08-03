import fs from "fs";
import path from "path";
import { SagaSession, SagaSessionSchema } from "./schema";

export async function getSagaSession(
  sessionId: string,
): Promise<SagaSession | null> {
  // Currently we only support the vscode-demo fixture.
  // In the future this will be replaced with a real database/API call.
  const fixturePath = path.join(
    process.cwd(),
    "fixtures",
    "sessions",
    `${sessionId}.saga.json`,
  );

  try {
    const rawData = fs.readFileSync(fixturePath, "utf-8");
    const jsonData = JSON.parse(rawData);

    const parsed = SagaSessionSchema.safeParse(jsonData);

    if (!parsed.success) {
      console.error("Fixture validation failed:", parsed.error);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error(
      `Failed to load saga session fixture for id: ${sessionId}`,
      error,
    );
    return null;
  }
}
