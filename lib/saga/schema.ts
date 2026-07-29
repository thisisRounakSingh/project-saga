import { z } from "zod";

export const DateRangeSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export const RepoSchema = z.object({
  name: z.string(),
  url: z.string(),
  totalCommits: z.number(),
  dateRange: DateRangeSchema,
  contributors: z.number(),
});

export const GenerationSchema = z.object({
  model: z.string(),
  generatedAt: z.string(),
  estTokens: z.number(),
  estCostUsd: z.number(),
});

export const ConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  kind: z.string(),
});

export const ModuleSchema = z.object({
  name: z.string(),
  path: z.string(),
  status: z.enum(["new", "modified", "deleted", "unchanged"]),
  linesChanged: z.number().optional(),
  summary: z.string(),
});

export const KeyCommitSchema = z.object({
  hash: z.string(),
  message: z.string(),
  date: z.string(),
});

export const NarrationSchema = z.object({
  text: z.string(),
  revealed: z.boolean(),
});

export const QaSchema = z.object({
  question: z.string(),
  answer: z.string(),
  confidence: z.enum(["inferred", "confirmed"]),
  supportingCommits: z.array(z.string()).optional(),
});

export const ActSchema = z.object({
  id: z.string(),
  order: z.number(),
  codename: z.string(),
  dateRange: DateRangeSchema,
  commitCount: z.number(),
  narration: z.array(NarrationSchema),
  keyCommits: z.array(KeyCommitSchema).optional(),
  connections: z.array(ConnectionSchema),
  modules: z.array(ModuleSchema),
  qa: z.array(QaSchema),
});

export const TechStackSchema = z.object({
  name: z.string(),
  role: z.string(),
  introducedAct: z.string(),
  docsUrl: z.string().optional(),
});

export const SagaSessionSchema = z.object({
  repo: RepoSchema,
  generation: GenerationSchema,
  acts: z.array(ActSchema),
  techStack: z.array(TechStackSchema),
});

export type SagaSession = z.infer<typeof SagaSessionSchema>;
export type Act = z.infer<typeof ActSchema>;
export type ModuleNodeData = z.infer<typeof ModuleSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
