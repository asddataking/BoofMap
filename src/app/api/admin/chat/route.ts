import { NextRequest } from "next/server";
import { isRequestAdmin } from "@/lib/admin/auth";

const SYSTEM_PROMPT = `You are BoofMap Admin Assistant — an AI helper for the BoofMap cannabis community reporting app (Michigan-focused).

You help the admin manage:
- Product/dispensary reports (strains, brands, boof scores, issue tags)
- Meetup/seller reports (platform sellers, scam warnings)
- User signups and roles
- Moderation queue (approve/reject flagged content)

Guidelines:
- Be concise, actionable, and direct
- When asked about data, use the app context provided in each message
- Suggest specific admin panel actions (e.g. "Go to Moderation → approve report X")
- Never expose API keys, env vars, or internal secrets
- Boof score is 1-5 (1=boof, 5=fire). Statuses: pending, approved, rejected, flagged
- Users browse reports without signup; signup is needed to submit/vote`;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

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
        error: "OPENAI_API_KEY is not configured. Add it to .env.local to enable the AI assistant.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: ChatMessage[]; context?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userMessages = body.messages ?? [];
  const contextBlock = body.context
    ? `\n\nCurrent app snapshot:\n${JSON.stringify(body.context, null, 2)}`
    : "";

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...userMessages.slice(-20),
  ];

  if (contextBlock && userMessages.length > 0) {
    const last = messages[messages.length - 1];
    if (last.role === "user") {
      last.content = `${last.content}${contextBlock}`;
    }
  }

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.4,
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    return new Response(JSON.stringify({ error: err }), {
      status: openaiRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = openaiRes.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // skip malformed chunks
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
