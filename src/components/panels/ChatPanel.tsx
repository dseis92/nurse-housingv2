import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";

export default function ChatPanel() {
  const matches = useAppStore((state) => state.matches);
  const conversations = useAppStore((state) => state.conversations);
  const listings = useAppStore((state) => state.listings);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const appendMessage = useAppStore((state) => state.actions.appendMessage);

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(
    conversations[0]?.id
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const relatedListing = useMemo(() => {
    if (!activeConversation) return undefined;
    return listings.find((listing) => listing.id === activeConversation.listingId);
  }, [activeConversation, listings]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim() || !activeConversation) return;
    setSending(true);
    try {
      await appendMessage(activeConversation.id, { senderId: currentUserId, body: draft.trim() });
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-6 rounded-[36px] border border-[var(--nh-border)] bg-white/95 p-4 shadow-[var(--nh-shadow-soft)] md:grid-cols-[260px_1fr] md:p-6">
      <aside className="space-y-5">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">Matches</p>
          <h2 className="text-lg font-semibold text-[var(--nh-text-primary)]">{matches.length} active</h2>
        </header>
        <nav className="space-y-2">
          {conversations.map((conversation) => {
            const listing = listings.find((item) => item.id === conversation.listingId);
            return (
              <button
                type="button"
                key={conversation.id}
                onClick={() => setActiveConversationId(conversation.id)}
                className={[
                  "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                  activeConversationId === conversation.id
                    ? "border-[var(--nh-accent)] bg-[var(--nh-accent-soft)] text-[var(--nh-accent)] shadow-[var(--nh-shadow-soft)]"
                    : "border-[var(--nh-border)] bg-white text-[var(--nh-text-secondary)] hover:border-[var(--nh-border-strong)] hover:text-[var(--nh-text-primary)]",
                ].join(" ")}
              >
                <p className="font-semibold text-[var(--nh-text-primary)]">{listing?.title ?? "Listing"}</p>
                <p className="text-xs text-[var(--nh-text-secondary)] capitalize">Status: {conversation.status}</p>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="flex flex-col rounded-[32px] border border-[var(--nh-border)] bg-[var(--nh-surface-muted)]">
        {activeConversation ? (
          <>
            <header className="flex items-center justify-between gap-4 border-b border-[var(--nh-border)] bg-white/80 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--nh-text-secondary)]">
                  Owner chat
                </p>
                <h3 className="text-sm font-semibold text-[var(--nh-text-primary)]">
                  {relatedListing?.title ?? "Listing"}
                </h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--nh-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--nh-text-secondary)]">
                <MessageCircle className="h-3.5 w-3.5 text-[var(--nh-accent)]" />
                Mutual match
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6 text-sm">
              {activeConversation.messages.map((message) => {
                const isSelf = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={[
                      "flex",
                      isSelf ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "max-w-sm rounded-3xl px-4 py-3 shadow-sm",
                        isSelf ? "bg-[var(--nh-accent)] text-white" : "bg-white text-[var(--nh-text-primary)]",
                      ].join(" ")}
                    >
                      <p>{message.body}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] opacity-60">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 border-t border-[var(--nh-border)] bg-white px-4 py-3"
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Send an update or ask a question"
                className="flex-1 rounded-full border border-[var(--nh-border)] bg-[var(--nh-surface-muted)] px-4 py-2 text-sm text-[var(--nh-text-primary)] placeholder:text-[var(--nh-text-secondary)] focus:border-[var(--nh-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--nh-accent-soft)]"
              />
              <button
                type="submit"
                className="btn btn-primary gap-2 px-4"
                disabled={sending}
                aria-busy={sending}
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--nh-text-secondary)]">
            Select a match to open the conversation.
          </div>
        )}
      </section>
    </div>
  );
}
