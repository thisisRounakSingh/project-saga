import fs from "fs";
import path from "path";
import { SagaSessionSchema } from "../lib/saga/schema";

function validateFixture() {
  const fixturePath = path.join(process.cwd(), "fixtures", "sessions", "vscode-demo.saga.json");
  
  if (!fs.existsSync(fixturePath)) {
    console.error(`Fixture file not found at: ${fixturePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(fixturePath, "utf-8");
  
  try {
    const jsonData = JSON.parse(rawData);
    const result = SagaSessionSchema.safeParse(jsonData);

    if (result.success) {
      console.log("✅ Fixture validated successfully against the schema.");
      console.log(`Repo: ${result.data.repo.name}`);
      console.log(`Acts loaded: ${result.data.acts.length}`);
    } else {
      console.error("❌ Fixture validation failed!");
      console.error(JSON.stringify(result.error.format(), null, 2));
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Failed to parse fixture JSON:", err);
    process.exit(1);
  }
}

validateFixture();
