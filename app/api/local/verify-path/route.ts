import fs from "fs";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const localPath = searchParams.get("path");

  if (!localPath) {
    return Response.json({ exists: false });
  }

  try {
    const exists = fs.existsSync(localPath);
    return Response.json({ exists });
  } catch {
    return Response.json({ exists: false });
  }
}
