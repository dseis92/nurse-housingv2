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

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const relatedListing = useMemo(() => {
    if (!activeConversation) return undefined;
    return listings.find((listing) => listing.id === activeConversation.listingId);
  }, [activeConversation, listings]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim() || !activeConversation) return;
    appendMessage(activeConversation.id, { senderId: currentUserId, body: draft.trim() });
    setDraft("");
  };

  return (
    <div className="grid gap-6 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[240px_1fr] md:p-6">
      <aside className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-wide text-teal-600">Matches</p>
          <h2 className="text-lg font-semibold text-zinc-900">{matches.length} active</h2>
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
                  "w-full rounded-2xl border px-3 py-3 text-left text-sm transition",
                  activeConversationId === conversation.id
                    ? "border-teal-200 bg-teal-50 text-teal-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900",
                ].join(" ")}
              >
                <p className="font-semibold">{listing?.title ?? "Listing"}</p>
                <p className="text-xs text-zinc-500">Conversation {conversation.status}</p>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="flex flex-col rounded-3xl border border-zinc-200 bg-zinc-50">
        {activeConversation ? (
          <>
            <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-teal-600">Owner chat</p>
                <h3 className="text-sm font-semibold text-zinc-900">{relatedListing?.title ?? "Listing"}</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                <MessageCircle className="h-3.5 w-3.5 text-teal-600" />
                Mutual match
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 text-sm">
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
                        "max-w-xs rounded-2xl px-4 py-2",
                        isSelf ? "bg-teal-600 text-white" : "bg-white text-zinc-800",
                      ].join(" ")}
                    >
                      <p>{message.body}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide opacity-60">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 border-t border-zinc-200 bg-white p-3"
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Send an update or ask a question"
                className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            Select a match to open the conversation.
          </div>
        )}
      </section>
    </div>
  );
}

