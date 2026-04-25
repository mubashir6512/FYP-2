import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, colorName, colorHex, action } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (action === "analyze") {
      // Step 1: Analyze room - detect walls, damage, surfaces
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `You are a professional room analysis AI for a paint visualization app. Analyze this room image and return a JSON response with:
{
  "walls_detected": number (how many wall surfaces detected),
  "wall_condition": "good" | "fair" | "poor",
  "damage_found": [{"type": "crack" | "stain" | "peel" | "moisture", "severity": "minor" | "moderate" | "severe", "location": "description"}],
  "room_type": "living room" | "bedroom" | "kitchen" | "bathroom" | "office" | "other",
  "current_color": "approximate color name",
  "lighting": "natural" | "artificial" | "mixed",
  "paintable_area_percent": number (estimated % of visible area that is paintable wall),
  "recommendations": ["string"]
}
Return ONLY valid JSON, no markdown.`,
                  },
                  {
                    type: "image_url",
                    image_url: { url: imageUrl },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const text = await response.text();
        console.error("AI gateway error:", response.status, text);
        throw new Error("AI analysis failed");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // Parse JSON from response (handle potential markdown wrapping)
      let analysis;
      try {
        const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        analysis = JSON.parse(jsonStr);
      } catch {
        analysis = {
          walls_detected: 2,
          wall_condition: "good",
          damage_found: [],
          room_type: "other",
          current_color: "unknown",
          lighting: "mixed",
          paintable_area_percent: 60,
          recommendations: ["Upload a clearer image for better analysis"],
        };
      }

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "visualize") {
      // Step 2: Generate painted room visualization using image editing
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `You are a professional room painter visualization tool. Take this room photo and repaint ALL the walls with the color "${colorName}" (hex: ${colorHex}). 
                    
Rules:
- Only change the wall color, keep everything else exactly the same (furniture, floor, ceiling, decorations, windows)
- The paint should look realistic with proper lighting and shadows
- Maintain the room's perspective and geometry
- The color should be ${colorName} (${colorHex})
- Make it look like a professional paint job
- Keep the same image composition and angle`,
                  },
                  {
                    type: "image_url",
                    image_url: { url: imageUrl },
                  },
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const text = await response.text();
        console.error("AI visualization error:", response.status, text);
        throw new Error("AI visualization failed");
      }

      const data = await response.json();
      const resultImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!resultImage) {
        throw new Error("No image generated");
      }

      // Upload result to storage
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const base64Data = resultImage.replace(/^data:image\/\w+;base64,/, "");
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
        const errText = await uploadResp.text();
        console.error("Storage upload error:", errText);
        // Fall back to returning base64 directly
        return new Response(
          JSON.stringify({ visualizedImageUrl: resultImage }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await uploadResp.text();
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/room-images/${fileName}`;

      return new Response(
        JSON.stringify({ visualizedImageUrl: publicUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'analyze' or 'visualize'." }),
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
