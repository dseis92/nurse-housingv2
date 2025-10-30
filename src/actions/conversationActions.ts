import { ensureSupabase } from "../lib/supabaseClient";

export async function sendConversationMessage(conversationId: string, body: string) {
  const supabase = await ensureSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      body,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchConversationMessages(conversationId: string) {
  const supabase = await ensureSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("[conversations] fetchConversationMessages", error);
    return [];
  }
  return data ?? [];
}

