// RAG Chat: embeds the user query, retrieves top knowledge chunks, streams an answer.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function embed(text: string): Promise<number[]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/text-embedding-004",
      input: text,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Embedding failed ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data.data[0].embedding;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lastUser = [...messages]
      .reverse()
      .find((m: any) => m.role === "user");
    const query = lastUser?.content ?? "";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Retrieve relevant knowledge
    let context = "";
    if (query) {
      try {
        const queryEmbedding = await embed(query);
        const { data: matches, error } = await supabase.rpc("match_knowledge", {
          query_embedding: queryEmbedding as unknown as string,
          match_count: 6,
        });
        if (error) console.error("match_knowledge error", error);
        if (matches && matches.length > 0) {
          context = matches
            .map(
              (m: any, i: number) =>
                `[Source ${i + 1} â€¢ ${m.source_type}] ${m.title}\n${m.content}`,
            )
            .join("\n\n---\n\n");
        }
      } catch (e) {
        console.error("Retrieval failed:", e);
      }
    }

    const systemPrompt = `You are PaintVerse Assistant â€” a friendly, expert chatbot for the PaintVerse multi-vendor paint marketplace.

Your knowledge covers:
- Paint products (brands, colors, prices, stock availability)
- Verified painters (ratings, specialties, contact)
- Paint dealers / stores (inventory, brands carried)

RULES:
- ONLY answer using the CONTEXT below. If the context doesn't contain the answer, say you don't have that information yet and suggest browsing the relevant section (Products, Painters, etc.).
- Be concise, helpful, and conversational. Use markdown when useful (lists, bold).
- Quote prices in â‚¹ (INR). Mention stock when relevant.
- For painter recommendations, mention rating and jobs completed.
- Never invent products, painters, or prices.

CONTEXT:
${context || "No relevant context found in the knowledge base."}`;

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          stream: true,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
        }),
      },
    );

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit reached. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please add funds in workspace settings.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiRes.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("rag-chat error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});


