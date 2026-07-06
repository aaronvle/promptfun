import Console from "@/components/noir/Console";
import { supabaseAdmin } from "@/lib/supabase";
import { getLatestRun, type LatestRun } from "@/lib/runs";

// Refresh the prerendered homepage every minute so the last-run panel
// stays current; live updates happen client-side in the Console.
export const revalidate = 60;

async function fetchLastRun(): Promise<LatestRun | null> {
  try {
    return await getLatestRun(supabaseAdmin());
  } catch {
    return null;
  }
}

export default async function Home() {
  const lastRun = await fetchLastRun();

  return (
    <div className="flex flex-1 justify-center bg-noir-bg px-4 py-[34px] sm:px-[34px]">
      <main className="w-full max-w-[960px]">
        <Console initialLastRun={lastRun} />
      </main>
    </div>
  );
}
