import { supabaseAdmin } from "@/lib/supabase";

// Lightweight list for the gallery quick-view: newest runs, no
// response bodies. Public data (runs has a public read policy).
export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("runs")
      .select("id, prompt, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw new Error(error.message);
    return Response.json(
      { runs: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ runs: null }, { status: 500 });
  }
}
