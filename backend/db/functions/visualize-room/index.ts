import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function aiCall(body: unknown) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function uploadPainted(base64DataUrl: string): Promise<string> {
  const base64Data = base64DataUrl.replace(/^data:image\/\w+;base64,/, "");
  const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  const fileName = `visualized/${crypto.randomUUID()}.png`;
  const uploadResp = await fetch(
    `${SUPABASE_URL}/storage/v1/object/room-images/${fileName}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "image/png",
      },
      body: imageBytes,
    }
  );
  if (!uploadResp.ok) {
    console.error("Storage upload error:", await uploadResp.text());
    return base64DataUrl; // fall back to data URL
  }
  await uploadResp.text();
  return `${SUPABASE_URL}/storage/v1/object/public/room-images/${fileName}`;
}

function paintPrompt(colorName: string, colorHex: string, mode: "interior" | "exterior", side?: string) {
  if (mode === "exterior") {
    return `Task: Repaint the exterior facade walls of the building in this photo to the EXACT color ${colorName} (hex ${colorHex}). Output the edited image.

Repaint ONLY the painted/plastered/stucco/siding wall surfaces of the building${side ? ` (${side} facade)` : ""}.

DO NOT change: windows, glass, doors, roof, gutters, sky, ground, grass, trees, plants, cars, people, signage, lights, or any non-wall element.

Preserve: all architectural details, trim, mouldings, shadows, highlights, lighting direction, perspective, camera angle, framing and composition.

The new wall color must clearly read as ${colorName} (${colorHex}) under the photo's existing lighting, with a realistic matte exterior paint finish.

You MUST return an edited image. Do not respond with text only.`;
  }
  return `Task: Repaint the interior wall surfaces in this photo to the EXACT color ${colorName} (hex ${colorHex}). Output the edited image.

Repaint ONLY the wall surfaces${side ? ` (${side} wall)` : ""}.

DO NOT change: furniture, floor, ceiling, trim, doors, windows, decor, lights, or any non-wall element.

Preserve: lighting, shadows, perspective and image composition.

Realistic, even interior paint finish that clearly reads as ${colorName} (${colorHex}).

You MUST return an edited image. Do not respond with text only.`;
}

const IMAGE_MODELS = [
  "google/gemini-2.5-flash-image",
  "google/gemini-3.1-flash-image-preview",
];

async function callRepaintModel(model: string, imageUrl: string, prompt: string) {
  const response = await aiCall({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    modalities: ["image", "text"],
  });

  if (!response.ok) {
    if (response.status === 429) throw Object.assign(new Error("Rate limit exceeded"), { status: 429 });
    if (response.status === 402) throw Object.assign(new Error("AI usage limit reached"), { status: 402 });
    const text = await response.text();
    console.error(`AI repaint error (${model}):`, response.status, text);
    throw new Error("AI visualization failed");
  }
  const data = await response.json();
  const resultImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  return resultImage as string | undefined;
}

async function repaintOne(imageUrl: string, colorName: string, colorHex: string, mode: "interior" | "exterior", side?: string) {
  const prompt = paintPrompt(colorName, colorHex, mode, side);
  let lastErr: Error | null = null;

  // Try each model up to 2 times before falling back
  for (const model of IMAGE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const resultImage = await callRepaintModel(model, imageUrl, prompt);
        if (resultImage) return uploadPainted(resultImage);
        console.warn(`No image returned by ${model} (attempt ${attempt + 1}) for side=${side}`);
      } catch (err: any) {
        // Hard-stop on rate/quota errors — don't burn retries
        if (err?.status === 429 || err?.status === 402) throw err;
        lastErr = err;
        console.warn(`Repaint attempt failed (${model}, attempt ${attempt + 1}):`, err?.message);
      }
      // small backoff between attempts
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw lastErr || new Error("No image generated after retries");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { action } = payload;

    if (action === "analyze") {
      const { imageUrl } = payload;
      const response = await aiCall({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a professional room analysis AI for a paint visualization app. Analyze this room image and return a JSON response with:
{
  "walls_detected": number,
  "wall_condition": "good" | "fair" | "poor",
  "damage_found": [{"type": "crack" | "stain" | "peel" | "moisture", "severity": "minor" | "moderate" | "severe", "location": "description"}],
  "room_type": "living room" | "bedroom" | "kitchen" | "bathroom" | "office" | "other",
  "current_color": "approximate color name",
  "lighting": "natural" | "artificial" | "mixed",
  "paintable_area_percent": number,
  "recommendations": ["string"]
}
Return ONLY valid JSON, no markdown.`,
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const text = await response.text();
        console.error("AI gateway error:", response.status, text);
        throw new Error("AI analysis failed");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      let analysis;
      try {
        const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        analysis = JSON.parse(jsonStr);
      } catch {
        analysis = {
          walls_detected: 2, wall_condition: "good", damage_found: [],
          room_type: "other", current_color: "unknown", lighting: "mixed",
          paintable_area_percent: 60,
          recommendations: ["Upload a clearer image for better analysis"],
        };
      }

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "visualize") {
      const { imageUrl, colorName, colorHex } = payload;
      try {
        const visualizedImageUrl = await repaintOne(imageUrl, colorName, colorHex, "interior");
        return new Response(JSON.stringify({ visualizedImageUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err: any) {
        const status = err?.status || 500;
        return new Response(JSON.stringify({ error: err.message || "Visualization failed" }),
          { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (action === "visualize_batch") {
      const { sides, colorName, colorHex, mode } = payload as {
        sides: { side: string; imageUrl: string }[];
        colorName: string; colorHex: string; mode: "interior" | "exterior";
      };

      if (!Array.isArray(sides) || sides.length === 0) {
        return new Response(JSON.stringify({ error: "No sides provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const results: { side: string; originalUrl: string; paintedUrl?: string; error?: string }[] = [];
      for (const s of sides) {
        try {
          const paintedUrl = await repaintOne(s.imageUrl, colorName, colorHex, mode, s.side);
          results.push({ side: s.side, originalUrl: s.imageUrl, paintedUrl });
        } catch (err: any) {
          if (err?.status === 429 || err?.status === 402) {
            // hard-stop on quota/rate errors
            return new Response(
              JSON.stringify({ error: err.message, partial: results }),
              { status: err.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          results.push({ side: s.side, originalUrl: s.imageUrl, error: err.message || "Failed" });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'analyze', 'visualize', or 'visualize_batch'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("visualize-room error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
