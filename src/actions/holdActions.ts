import { ensureSupabase } from "../lib/supabaseClient";

type HoldIntentResponse = {
  holdId?: string;
  client_secret?: string;
};

export async function requestHoldIntent(
  matchId: string,
  amountCents = 10_000,
  options?: { startDate?: string; endDate?: string }
): Promise<HoldIntentResponse> {
  const payload = { matchId, amountCents, startDate: options?.startDate, endDate: options?.endDate };
  const response = await fetch("/api/holds/create-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Hold intent failed with status ${response.status}`);
  }

  return response.json();
}

export async function expireHolds() {
  await fetch("/api/holds/expire", { method: "POST" }).catch(() => undefined);
}

export async function loadHoldForMatch(matchId: string) {
  const supabase = await ensureSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("holds").select("*").eq("match_id", matchId).order("created_at", { ascending: false }).maybeSingle();
  if (error) {
    console.warn("[holds] loadHoldForMatch", error);
    return null;
  }
  return data;
}
