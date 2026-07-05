import { supabaseAdmin } from "@/lib/supabase";
import { getOpenWindow } from "@/lib/window";

// Deliberately tiny response: the client only ever learns open/closed.
// Future opens_at values never leave the server, or the random time
// could be read from the network tab.
export async function GET() {
  try {
    const win = await getOpenWindow(supabaseAdmin());
    return Response.json(
      { open: win !== null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ open: false, error: "unavailable" }, { status: 500 });
  }
}
