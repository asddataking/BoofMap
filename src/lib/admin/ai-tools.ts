import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_dashboard_stats",
      description:
        "Get live dashboard stats: users, reports, pending counts, recent signups.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_moderation_queue",
      description: "List pending moderation queue items with reasons and preview text.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_pending_reports",
      description:
        "List product reports awaiting review (pending or flagged status).",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max results (default 10)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_pending_meetups",
      description: "List meetup/seller reports awaiting review.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max results (default 10)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_reports",
      description:
        "Search product reports by strain, brand, dispensary, or city name.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search text" },
          limit: { type: "number", description: "Max results (default 8)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_users",
      description: "List registered users with roles and signup dates.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max results (default 15)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "moderate_content",
      description:
        "Approve or reject a report or meetup report. Use queue item IDs when available.",
      parameters: {
        type: "object",
        properties: {
          source_type: {
            type: "string",
            enum: ["report", "meetupReport"],
          },
          source_id: { type: "string", description: "Convex document ID" },
          queue_id: {
            type: "string",
            description: "Optional moderation queue item ID",
          },
          action: { type: "string", enum: ["approve", "reject"] },
        },
        required: ["source_type", "source_id", "action"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_knowledge",
      description:
        "Retrieve BoofMap documentation on a topic: product, boof-score, moderation, policies, admin-panel, issue-tags.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Topic keyword, e.g. moderation, boof-score",
          },
        },
        required: ["topic"],
      },
    },
  },
];

type ToolArgs = Record<string, unknown>;

export async function executeAiTool(
  name: string,
  args: ToolArgs,
  token: string | null
): Promise<unknown> {
  const opts = { token: token ?? undefined };

  switch (name) {
    case "get_dashboard_stats":
      return fetchQuery(api.admin.getDashboardStats, {}, opts);

    case "list_moderation_queue":
      return fetchQuery(api.admin.listModerationQueue, {}, opts);

    case "list_pending_reports":
      return fetchQuery(api.admin.listFlaggedReports, {}, opts);

    case "list_pending_meetups":
      return fetchQuery(api.admin.listFlaggedMeetupReports, {}, opts);

    case "search_reports":
      return fetchQuery(
        api.admin.searchReportsForAi,
        {
          query: String(args.query ?? ""),
          limit: (args.limit as number) ?? 8,
        },
        opts
      );

    case "list_users":
      return fetchQuery(
        api.admin.listUsers,
        { limit: (args.limit as number) ?? 15 },
        opts
      );

    case "moderate_content": {
      const sourceType = args.source_type as "report" | "meetupReport";
      const action = args.action as "approve" | "reject";
      await fetchMutation(
        api.admin.moderate,
        {
          sourceType,
          sourceId: String(args.source_id),
          queueId: args.queue_id
            ? (String(args.queue_id) as Id<"moderationQueue">)
            : undefined,
          action,
        },
        opts
      );
      return { success: true, action, source_id: args.source_id };
    }

    case "get_knowledge": {
      const { getKnowledgeForPrompt } = await import("./knowledge");
      return {
        topic: args.topic,
        content: getKnowledgeForPrompt([String(args.topic ?? "")]),
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
