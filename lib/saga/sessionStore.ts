/**
 * In-memory session store for the Saga bridge relay.
 *
 * This replaces the fixture-only approach with a store that can accept
 * dynamically uploaded sessions via POST /api/sessions and queue live
 * Q&A messages between the bridge (saga-launch.js) and the frontend.
 *
 * NOTE: This is an in-memory store — all data is lost on server restart.
 * For a hackathon / dev-mode setup this is intentional: sessions are
 * re-uploaded by the bridge on every launch. A production deployment
 * would swap this for a database or KV store.
 */

import { SagaSession, SagaSessionSchema } from "./schema";
import fs from "fs";
import path from "path";

export interface PendingQuestion {
  id: string;
  sessionId: string;
  text: string;
  context?: {
    quotedNarration?: { actId: string; text: string }[];
    pinnedFiles?: string[];
    selectedNodeIds?: string[];
  };
  actId?: string;
  timestamp: number;
  answered: boolean;
}

export interface QueuedAnswer {
  questionId: string;
  answer: string;
  confidence?: "confirmed" | "inferred";
  referencedCommits?: string[];
  timestamp: number;
}

interface SessionEntry {
  session: SagaSession;
  uploadedAt: number;
}

// --- In-memory stores ---
// We keep sessions in memory/disk, but Q&A MUST go to disk because Next.js dev server
// spawns isolated worker threads for different API routes.
const globalForSaga = globalThis as unknown as {
  sagaStoreState: {
    sessions: Map<string, SessionEntry>;
  };
};

if (!globalForSaga.sagaStoreState) {
  globalForSaga.sagaStoreState = {
    sessions: new Map<string, SessionEntry>(),
  };
}

const { sessions } = globalForSaga.sagaStoreState;

// --- Disk state helpers for Q&A ---
function getQaFilePath(sessionId: string) {
  const fixtureDir = path.join(process.cwd(), "fixtures", "sessions");
  if (!fs.existsSync(fixtureDir)) {
    fs.mkdirSync(fixtureDir, { recursive: true });
  }
  return path.join(fixtureDir, `${sessionId}.qa.json`);
}

function loadQaState(sessionId: string) {
  try {
    const data = fs.readFileSync(getQaFilePath(sessionId), "utf-8");
    return JSON.parse(data) as {
      questions: PendingQuestion[];
      answers: QueuedAnswer[];
    };
  } catch {
    return { questions: [], answers: [] };
  }
}

function saveQaState(
  sessionId: string,
  state: { questions: PendingQuestion[]; answers: QueuedAnswer[] },
) {
  try {
    fs.writeFileSync(getQaFilePath(sessionId), JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to write QA state to disk:", err);
  }
}

// --- Session management ---

export function storeSession(
  sessionId: string,
  session: SagaSession,
): void {
  // Store in memory for this worker
  sessions.set(sessionId, { session, uploadedAt: Date.now() });

  // Next.js development mode runs API routes and Server Components in separate
  // workers or module scopes, meaning this in-memory Map isn't shared with the
  // page.tsx server component. We MUST write to disk for the UI to see it.
  try {
    const fixtureDir = path.join(process.cwd(), "fixtures", "sessions");
    if (!fs.existsSync(fixtureDir)) {
      fs.mkdirSync(fixtureDir, { recursive: true });
    }
    const fixturePath = path.join(fixtureDir, `${sessionId}.saga.json`);
    fs.writeFileSync(fixturePath, JSON.stringify(session, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write session to disk:", err);
  }
}

export function getSession(sessionId: string): SagaSession | null {
  // First check in-memory store (uploaded sessions)
  const entry = sessions.get(sessionId);
  if (entry) return entry.session;

  // Fallback to fixture files for backwards compatibility
  try {
    const fixturePath = path.join(
      process.cwd(),
      "fixtures",
      "sessions",
      `${sessionId}.saga.json`,
    );
    const rawData = fs.readFileSync(fixturePath, "utf-8");
    const jsonData = JSON.parse(rawData);
    const parsed = SagaSessionSchema.safeParse(jsonData);
    if (parsed.success) {
      // Cache in memory for subsequent requests
      storeSession(sessionId, parsed.data);
      return parsed.data;
    }
  } catch {
    // Fixture doesn't exist — that's fine
  }

  return null;
}

export function generateSessionId(session: SagaSession): string {
  // Use repo name as the base, sanitized for URL safety
  const base = session.repo.name
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase();
  // Check if this ID already exists; if so, add a timestamp suffix
  if (sessions.has(base)) {
    return `${base}-${Date.now()}`;
  }
  return base;
}

// --- Question queue ---

export function addQuestion(
  sessionId: string,
  text: string,
  context?: PendingQuestion["context"],
  actId?: string,
): PendingQuestion {
  const q: PendingQuestion = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sessionId,
    text,
    context,
    actId,
    timestamp: Date.now(),
    answered: false,
  };

  const state = loadQaState(sessionId);
  state.questions.push(q);
  saveQaState(sessionId, state);

  return q;
}

export function getQuestionsSince(
  sessionId: string,
  sinceCursor?: string,
): PendingQuestion[] {
  const state = loadQaState(sessionId);
  const sessionQuestions = state.questions;

  if (!sinceCursor) {
    return sessionQuestions.filter((q) => !q.answered);
  }

  const cursorIndex = sessionQuestions.findIndex((q) => q.id === sinceCursor);
  if (cursorIndex === -1) {
    return sessionQuestions.filter((q) => !q.answered);
  }

  return sessionQuestions
    .slice(cursorIndex + 1)
    .filter((q) => !q.answered);
}

// --- Answer management ---

export function storeAnswer(
  sessionId: string,
  questionId: string,
  answerText: string,
  confidence?: "confirmed" | "inferred",
  referencedCommits?: string[],
): void {
  const state = loadQaState(sessionId);

  state.answers.push({
    questionId,
    answer: answerText,
    confidence,
    referencedCommits,
    timestamp: Date.now(),
  });

  // Mark the question as answered
  const q = state.questions.find((q) => q.id === questionId);
  if (q) {
    q.answered = true;
  }

  saveQaState(sessionId, state);
}

export function getAnswer(sessionId: string, questionId: string): QueuedAnswer | null {
  const state = loadQaState(sessionId);
  return state.answers.find((a) => a.questionId === questionId) || null;
}

export function getAnswersForSession(
  sessionId: string,
): QueuedAnswer[] {
  const state = loadQaState(sessionId);
  const sessionQuestions = state.questions;
  return sessionQuestions
    .filter((q) => q.answered)
    .map((q) => state.answers.find((a) => a.questionId === q.id))
    .filter((a): a is QueuedAnswer => a !== undefined);
}
