import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { isRequestAdmin } from "@/lib/admin/auth";
import { AI_TOOLS, executeAiTool } from "@/lib/admin/ai-tools";
import { getKnowledgeForPrompt } from "@/lib/admin/knowledge";

const MAX_TOOL_ROUNDS = 6;

function buildSystemPrompt(): string {
  const knowledge = getKnowledgeForPrompt();
  return `You are BoofMap Admin Assistant — a live AI operator for the BoofMap admin panel (nationwide cannabis community reports; launching in Michigan).

You have TOOLS to read live data and take actions (moderate, search, list users). Always use tools when the admin asks about current stats, queue items, reports, or users — do not guess.

## Your knowledge base
${knowledge}

## Operating rules
- Be concise, actionable, and direct.
- When moderating, confirm what you did and cite report/queue IDs.
- Before approve/reject, briefly summarize what you're acting on.
- Boof score 1–5 (1=boof, 5=fire). Statuses: pending, approved, rejected, flagged.
- Never expose API keys, env vars, or secrets.
- If a tool fails, explain and suggest a manual fix in the admin panel.`;
}

type ChatMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: {
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }[];
    }
  | { role: "tool"; tool_call_id: string; content: string };

export async function POST(req: NextRequest) {
  if (!(await isRequestAdmin())) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "OPENAI_API_KEY is not configured. Add it to .env.local to enable the AI assistant.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: { role: "user" | "assistant"; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userMessages = body.messages ?? [];
  const { getToken } = await auth();
  const convexToken = await getToken({ template: "convex" });

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    ...userMessages.slice(-20),
  ];

  const toolLog: string[] = [];

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          tools: AI_TOOLS,
          tool_choice: round === 0 ? "auto" : "auto",
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ error: err }), {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      const data = (await res.json()) as {
        choices: {
          message: {
            content: string | null;
            tool_calls?: {
              id: string;
              type: "function";
              function: { name: string; arguments: string };
            }[];
          };
          finish_reason: string;
        }[];
      };

      const choice = data.choices[0];
      const assistantMsg = choice.message;

      if (assistantMsg.tool_calls?.length) {
        messages.push({
          role: "assistant",
          content: assistantMsg.content,
          tool_calls: assistantMsg.tool_calls,
        });

        for (const tc of assistantMsg.tool_calls) {
          const toolName = tc.function.name;
          let toolArgs: Record<string, unknown> = {};
          try {
            toolArgs = JSON.parse(tc.function.arguments) as Record<
              string,
              unknown
            >;
          } catch {
            toolArgs = {};
          }

          toolLog.push(formatToolLabel(toolName, toolArgs));

          let result: unknown;
          try {
            result = await executeAiTool(toolName, toolArgs, convexToken);
          } catch (err) {
            result = {
              error: err instanceof Error ? err.message : "Tool failed",
            };
          }

          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }
        continue;
      }

      const finalText =
        assistantMsg.content ??
        "I couldn't generate a response. Try rephrasing your question.";

      return new Response(
        JSON.stringify({
          content: finalText,
          toolsUsed: toolLog,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        content:
          "I hit the tool limit for this request. Try a simpler question or use the admin panel directly.",
        toolsUsed: toolLog,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Agent failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function formatToolLabel(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case "get_dashboard_stats":
      return "Fetched live dashboard stats";
    case "list_moderation_queue":
      return "Checked moderation queue";
    case "list_pending_reports":
      return "Listed pending product reports";
    case "list_pending_meetups":
      return "Listed pending meetup reports";
    case "search_reports":
      return `Searched reports for "${args.query ?? ""}"`;
    case "list_users":
      return "Listed users";
    case "moderate_content":
      return `${args.action === "approve" ? "Approved" : "Rejected"} ${args.source_type}`;
    case "get_knowledge":
      return `Looked up docs: ${args.topic ?? "general"}`;
    default:
      return name;
  }
}
