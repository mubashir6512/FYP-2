// Indexes products, painters, and dealers into knowledge_chunks with embeddings.
// Call POST with optional { source_type?: 'product' | 'painter' | 'dealer' }
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json().catch(() => ({}));
    const onlyType: string | undefined = body.source_type;

    const chunks: Array<{
      source_type: string;
      source_id: string;
      title: string;
      content: string;
      metadata: Record<string, unknown>;
    }> = [];

    // ---- Products ----
    if (!onlyType || onlyType === "product") {
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      for (const p of products ?? []) {
        const content = [
          `Product: ${p.name}`,
          p.brand ? `Brand: ${p.brand}` : null,
          `Category: ${p.category}`,
          p.description ? `Description: ${p.description}` : null,
          `Price: â‚¹${p.price} per ${p.unit}`,
          `Stock: ${p.stock_quantity} ${p.unit}(s) available`,
          p.color_hex ? `Color: ${p.color_hex}` : null,
          p.sku ? `SKU: ${p.sku}` : null,
        ]
          .filter(Boolean)
          .join("\n");
        chunks.push({
          source_type: "product",
          source_id: p.id,
          title: p.name,
          content,
          metadata: {
            price: p.price,
            stock: p.stock_quantity,
            brand: p.brand,
            category: p.category,
            color_hex: p.color_hex,
            dealer_id: p.dealer_id,
          },
        });
      }
    }

    // ---- Painters (from profiles + user_roles) ----
    if (!onlyType || onlyType === "painter") {
      const { data: painterRoles, error: prErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "painter");
      if (prErr) throw prErr;
      const painterIds = (painterRoles ?? []).map((r: any) => r.user_id);

      if (painterIds.length > 0) {
        const { data: painters } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", painterIds);

        // Aggregate ratings + jobs
        const { data: reviews } = await supabase
          .from("painter_reviews")
          .select("painter_id, rating");
        const { data: jobs } = await supabase
          .from("painter_jobs")
          .select("painter_id, status, job_type");

        for (const painter of painters ?? []) {
          const myReviews = (reviews ?? []).filter(
            (r: any) => r.painter_id === painter.user_id,
          );
          const avgRating =
            myReviews.length > 0
              ? (
                  myReviews.reduce((a: number, b: any) => a + b.rating, 0) /
                  myReviews.length
                ).toFixed(1)
              : "No ratings yet";
          const myJobs = (jobs ?? []).filter(
            (j: any) => j.painter_id === painter.user_id,
          );
          const completed = myJobs.filter(
            (j: any) => j.status === "completed",
          ).length;
          const specialties = [
            ...new Set(myJobs.map((j: any) => j.job_type)),
          ].join(", ");

          const content = [
            `Painter: ${painter.full_name || "Unnamed Painter"}`,
            painter.phone ? `Phone: ${painter.phone}` : null,
            `Average Rating: ${avgRating} (${myReviews.length} reviews)`,
            `Jobs Completed: ${completed}`,
            specialties ? `Specialties: ${specialties}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          chunks.push({
            source_type: "painter",
            source_id: painter.user_id,
            title: painter.full_name || "Painter",
            content,
            metadata: {
              avg_rating: avgRating,
              reviews_count: myReviews.length,
              jobs_completed: completed,
              phone: painter.phone,
            },
          });
        }
      }
    }

    // ---- Dealers (from profiles + user_roles + their products) ----
    if (!onlyType || onlyType === "dealer") {
      const { data: dealerRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "dealer");
      const dealerIds = (dealerRoles ?? []).map((r: any) => r.user_id);

      if (dealerIds.length > 0) {
        const { data: dealers } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", dealerIds);
        const { data: dealerProducts } = await supabase
          .from("products")
          .select("dealer_id, name, brand, category")
          .in("dealer_id", dealerIds)
          .eq("is_active", true);

        for (const dealer of dealers ?? []) {
          const myProducts = (dealerProducts ?? []).filter(
            (p: any) => p.dealer_id === dealer.user_id,
          );
          const brands = [
            ...new Set(myProducts.map((p: any) => p.brand).filter(Boolean)),
          ].join(", ");
          const categories = [
            ...new Set(myProducts.map((p: any) => p.category)),
          ].join(", ");

          const content = [
            `Dealer / Paint Store: ${dealer.full_name || "Unnamed Dealer"}`,
            dealer.phone ? `Phone: ${dealer.phone}` : null,
            `Total Products: ${myProducts.length}`,
            brands ? `Brands Stocked: ${brands}` : null,
            categories ? `Categories: ${categories}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          chunks.push({
            source_type: "dealer",
            source_id: dealer.user_id,
            title: dealer.full_name || "Dealer",
            content,
            metadata: {
              product_count: myProducts.length,
              brands,
              phone: dealer.phone,
            },
          });
        }
      }
    }

    // Wipe old chunks for the affected types
    const types = onlyType ? [onlyType] : ["product", "painter", "dealer"];
    for (const t of types) {
      await supabase.from("knowledge_chunks").delete().eq("source_type", t);
    }

    // Embed and insert
    let inserted = 0;
    for (const c of chunks) {
      try {
        const embedding = await embed(`${c.title}\n${c.content}`);
        const { error: insErr } = await supabase
          .from("knowledge_chunks")
          .insert({
            source_type: c.source_type,
            source_id: c.source_id,
            title: c.title,
            content: c.content,
            metadata: c.metadata,
            embedding: embedding as unknown as string,
          });
        if (insErr) {
          console.error("Insert error", insErr);
        } else {
          inserted++;
        }
      } catch (e) {
        console.error("Embedding error for", c.title, e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        chunks_total: chunks.length,
        chunks_inserted: inserted,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("index-knowledge error:", e);
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


