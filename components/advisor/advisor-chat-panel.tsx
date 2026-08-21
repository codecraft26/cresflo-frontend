"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ChatMarkdown } from "@/components/advisor/chat-markdown";
import type { AdvisorAnswer, AdvisorConversation, OrganizationSession } from "@/lib/types";

const promptSuggestions = [
  { title: "Review overdue loans", prompt: "Show me all defaulted loans with principal above $50,000." },
  { title: "Summarize portfolio risk", prompt: "How many loans are overdue?" },
  { title: "Check agreement terms", prompt: "Does this loan agreement allow a six-month extension?" },
  { title: "Refine the last result", prompt: "Remove the last condition and show me the original list again." },
];

type AdvisorChatPanelProps = {
  session: OrganizationSession | null;
  connectionState: string;
  conversation: AdvisorConversation | null;
  conversationHistory: AdvisorConversation[];
  isConversationHistoryLoading: boolean;
  chatMessage: string;
  pendingChatMessage: string;
  activityLabel: string | null;
  streamedAnswer: string;
  lastAnswer: AdvisorAnswer | null;
  lastProvider: string | null;
  onCreateConversation: () => void;
  onReconnect: () => void;
  onChatMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onApplyPrompt: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onLoadConversation: () => void;
};

function AdvisorMark() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--nav)] text-white shadow-sm">
      <Icon name="spark" className="h-3.5 w-3.5" />
    </span>
  );
}

const getConversationTitle = (conversation: AdvisorConversation) =>
  conversation.messages.find((message) => message.role === "user")?.content ||
  "New conversation";

const formatHistoryDate = (value: string) => {
  const date = new Date(value);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getUTCMonth()];

  return `${month} ${date.getUTCDate()}`;
};

function ConversationHistory({
  activeConversationId,
  conversations,
  isDisabled,
  isLoading,
  onSelect,
}: {
  activeConversationId?: string;
  conversations: AdvisorConversation[];
  isDisabled: boolean;
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
}) {
  if (isLoading && conversations.length === 0) {
    return (
      <div className="space-y-1.5 p-2" aria-label="Loading conversation history">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-12 animate-pulse rounded-lg bg-[var(--panel-strong)]" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-6 text-center">
        <Icon name="chat" className="mx-auto h-5 w-5 text-[#aab3c0]" />
        <p className="mt-2 text-xs leading-5 text-[var(--ink-muted)]">Your saved chats will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto p-2 xl:block xl:max-h-[calc(100%-61px)] xl:space-y-0.5 xl:overflow-y-auto">
      {conversations.map((item) => {
        const isActive = item.id === activeConversationId;

        return (
          <button
            key={item.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "true" : undefined}
            className={`min-w-48 rounded-lg px-2.5 py-2 text-left transition xl:min-w-0 xl:w-full ${
              isActive
                ? "bg-white text-[var(--ink)] shadow-sm ring-1 ring-[var(--line)]"
                : "text-[var(--ink-soft)] hover:bg-white/70 hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
            }`}
          >
            <p className="truncate text-xs font-semibold">{getConversationTitle(item)}</p>
            <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-[var(--ink-muted)]">
              <span>{item.messages.length} message{item.messages.length === 1 ? "" : "s"}</span>
              <span>{formatHistoryDate(item.updatedAt)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AdvisorChatPanel({
  session,
  connectionState,
  conversation,
  conversationHistory,
  isConversationHistoryLoading,
  chatMessage,
  pendingChatMessage,
  activityLabel,
  streamedAnswer,
  lastAnswer,
  lastProvider,
  onCreateConversation,
  onReconnect,
  onChatMessageChange,
  onSendMessage,
  onApplyPrompt,
  onSelectConversation,
  onLoadConversation,
}: AdvisorChatPanelProps) {
  const threadEndRef = useRef<HTMLDivElement>(null);
  const pendingFirstMessageRef = useRef(false);
  const isConnected = connectionState === "Connected";
  const isBusy = Boolean(activityLabel);
  const hasMessages = Boolean(
    conversation?.messages.length || pendingChatMessage || streamedAnswer || activityLabel,
  );
  const lastStoredMessage = conversation?.messages.at(-1)?.content;
  const showStreamedAnswer = Boolean(streamedAnswer && streamedAnswer !== lastStoredMessage);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation?.messages.length, streamedAnswer]);

  const sendPendingFirstMessage = useEffectEvent(() => {
    onSendMessage();
  });

  useEffect(() => {
    if (!conversation || !pendingFirstMessageRef.current) {
      return;
    }

    pendingFirstMessageRef.current = false;
    sendPendingFirstMessage();
  }, [conversation]);

  useEffect(() => {
    if (connectionState === "Connected" || connectionState === "Connecting") {
      return;
    }

    pendingFirstMessageRef.current = false;
  }, [connectionState]);

  const sendMessage = () => {
    if (!session || !isConnected || !chatMessage.trim() || pendingFirstMessageRef.current || isBusy) {
      return;
    }

    if (conversation) {
      onSendMessage();
      return;
    }

    pendingFirstMessageRef.current = true;
    onCreateConversation();
  };

  return (
    <section className="flex h-[calc(100dvh-112px)] min-h-[560px] flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(16,27,45,0.04)] lg:h-[calc(100dvh-144px)]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <AdvisorMark />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-[var(--ink)]">Cresflo Advisor</h2>
              {lastProvider ? <span className="hidden sm:inline-flex"><Badge tone="neutral">{lastProvider}</Badge></span> : null}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isConnected ? "Connected" : connectionState}
              {conversation ? <span className="hidden sm:inline">· Conversation active</span> : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isConnected ? (
            <Button className="h-8 rounded-lg px-2.5 text-xs" variant="ghost" disabled={!session} onClick={onReconnect}>
              <Icon name="refresh" className="h-4 w-4" /> Reconnect
            </Button>
          ) : null}
          {conversation ? (
            <>
              <Button className="h-8 rounded-lg px-2.5 text-xs" variant="ghost" disabled={isBusy} onClick={onLoadConversation}>
                <Icon name="refresh" className="h-4 w-4" />
                <span className="hidden sm:inline">Reload</span>
              </Button>
              <Button className="h-8 rounded-lg px-2.5 text-xs" variant="secondary" disabled={isBusy} onClick={onCreateConversation}>
                <Icon name="plus" className="h-4 w-4" /> New chat
              </Button>
            </>
          ) : (
            <Button className="h-8 rounded-lg px-2.5 text-xs" disabled={!session || !isConnected || isBusy} onClick={onCreateConversation}>
              <Icon name="plus" className="h-4 w-4" /> Start chat
            </Button>
          )}
        </div>
      </header>

      <div className="shrink-0 border-b border-[var(--line)] bg-[var(--panel)] xl:hidden">
        <div className="flex items-center justify-between px-3 pt-2">
          <p className="text-xs font-bold text-[var(--ink)]">Recent chats</p>
          <span className="text-[10px] text-[var(--ink-muted)]">{conversationHistory.length} saved</span>
        </div>
        <ConversationHistory
          activeConversationId={conversation?.id}
          conversations={conversationHistory}
          isDisabled={isBusy}
          isLoading={isConversationHistoryLoading}
          onSelect={onSelectConversation}
        />
      </div>

      <div className="grid min-h-0 flex-1 xl:grid-cols-[200px_minmax(0,1fr)_240px]">
        <aside className="hidden min-h-0 overflow-hidden border-r border-[var(--line)] bg-[var(--panel)] xl:block">
          <div className="h-[61px] border-b border-[var(--line)] px-3 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--ink)]">Chat history</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--ink-muted)] ring-1 ring-[var(--line)]">{conversationHistory.length}</span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--ink-muted)]">Private to this user</p>
          </div>
          <ConversationHistory
            activeConversationId={conversation?.id}
            conversations={conversationHistory}
            isDisabled={isBusy}
            isLoading={isConversationHistoryLoading}
            onSelect={onSelectConversation}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-3 py-4 sm:px-5 sm:py-5">
              {!hasMessages ? (
                <div className="my-auto py-4">
                  <div className="mx-auto max-w-xl text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nav)] text-white shadow-md shadow-slate-900/15">
                      <Icon name="spark" className="h-4 w-4" />
                    </div>
                    <h3 className="mt-3 text-xl font-bold tracking-tight text-[var(--ink)]">How can I help today?</h3>
                    <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-[var(--ink-muted)]">
                      Ask about loans, portfolio risk, policies, or documents indexed for {session?.organization.name ?? "your organization"}.
                    </p>
                  </div>
                  <div className="mx-auto mt-5 grid max-w-2xl gap-1.5 sm:grid-cols-2">
                    {promptSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.prompt}
                        type="button"
                        onClick={() => onApplyPrompt(suggestion.prompt)}
                        className="group rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-left transition hover:border-[#c4ccd8] hover:bg-[var(--panel)] hover:shadow-sm"
                      >
                        <span className="block text-xs font-semibold text-[var(--ink)]">{suggestion.title}</span>
                        <span className="mt-1 block truncate text-xs text-[var(--ink-muted)]">{suggestion.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                {conversation?.messages.map((message, index) => (
                  <div key={`${message.createdAt}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex items-start gap-3"}>
                    {message.role === "assistant" ? <AdvisorMark /> : null}
                    <div className={message.role === "user" ? "max-w-[82%] rounded-xl rounded-br-sm bg-[var(--panel-strong)] px-3 py-2 text-sm leading-5 text-[var(--ink)]" : "min-w-0 max-w-[calc(100%-40px)] text-sm leading-6 text-[var(--ink)]"}>
                      {message.role === "assistant" ? (
                        <ChatMarkdown content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {pendingChatMessage && pendingChatMessage !== lastStoredMessage ? (
                  <div className="flex justify-end">
                    <div className="max-w-[82%] rounded-xl rounded-br-sm bg-[var(--panel-strong)] px-3 py-2 text-sm leading-5 text-[var(--ink)]">
                      <p className="whitespace-pre-wrap">{pendingChatMessage}</p>
                    </div>
                  </div>
                ) : null}

                {activityLabel && !streamedAnswer ? (
                  <div className="flex items-start gap-3" role="status" aria-live="polite">
                    <AdvisorMark />
                    <div className="rounded-2xl rounded-tl-md border border-[var(--line)] bg-[var(--panel)] px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex gap-1" aria-hidden="true">
                          {[0, 1, 2].map((dot) => (
                            <span
                              key={dot}
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--signal)]"
                              style={{ animationDelay: `${dot * 120}ms` }}
                            />
                          ))}
                        </span>
                        <span className="text-xs font-semibold text-[var(--ink-soft)]">{activityLabel}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {showStreamedAnswer ? (
                  <div className="flex items-start gap-3">
                    <AdvisorMark />
                    <div className="min-w-0 max-w-[calc(100%-44px)] pt-1 text-sm leading-7 text-[var(--ink)]">
                      <ChatMarkdown content={streamedAnswer} />
                      {!lastAnswer ? <span className="mt-1 inline-block h-4 w-1 animate-pulse rounded-full bg-[var(--signal)]" /> : null}
                    </div>
                  </div>
                ) : null}

                <div ref={threadEndRef} />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-[var(--line)] bg-white px-3 py-2 sm:px-4">
            <div className="mx-auto max-w-4xl">
              {lastAnswer?.followUpSuggestions.length ? (
                <div className="mb-1.5 flex gap-1.5 overflow-x-auto pb-1">
                  {lastAnswer.followUpSuggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => onApplyPrompt(suggestion)} className="shrink-0 rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[10px] text-[var(--ink-soft)] transition hover:border-[var(--signal)] hover:text-[var(--signal)]">{suggestion}</button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-end gap-1.5 rounded-xl border border-[#cfd6e0] bg-white p-1.5 shadow-[0_3px_12px_rgba(16,27,45,0.07)] transition focus-within:border-[var(--signal)] focus-within:ring-2 focus-within:ring-[var(--signal-soft)]">
                <textarea
                  aria-label="Message Cresflo Advisor"
                  value={chatMessage}
                  onChange={(event) => onChatMessageChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={1}
                  placeholder="Message Cresflo Advisor"
                  disabled={!session || isBusy}
                  className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-6 text-[var(--ink)] outline-none placeholder:text-[#99a2af] disabled:cursor-not-allowed"
                />
                <button type="button" onClick={sendMessage} disabled={!session || !isConnected || !chatMessage.trim() || isBusy} aria-label="Send message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--signal)] text-white transition hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:bg-[#d6dbe2]">
                  {isBusy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Icon name="send" className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-center text-[9px] text-[var(--ink-muted)]">Verify important lending decisions against cited sources.</p>
            </div>
          </div>
        </div>

        <aside className="hidden min-h-0 overflow-hidden border-l border-[var(--line)] bg-[var(--panel)] xl:block">
          <div className="h-[61px] border-b border-[var(--line)] px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="document" className="h-4 w-4 text-[var(--ink-muted)]" />
                <h3 className="text-sm font-bold text-[var(--ink)]">Sources</h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[var(--ink-muted)] ring-1 ring-[var(--line)]">{lastAnswer?.evidence.length ?? 0}</span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--ink-muted)]">Latest response evidence</p>
          </div>
          <div className="h-[calc(100%-61px)] space-y-2 overflow-y-auto p-2">
            {lastAnswer?.evidence.length ? (
              lastAnswer.evidence.map((item, index) => (
                <article key={`${item.type}-${item.id}`} className="rounded-lg border border-[var(--line)] bg-white p-2.5 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[10px] font-bold text-[var(--signal)]">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--signal)]">{item.type}</p>
                      <p className="mt-0.5 text-xs font-semibold leading-4 text-[var(--ink)]">{item.label}</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-4 text-[10px] leading-4 text-[var(--ink-muted)]">{item.detail}</p>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--line)] bg-white/60 px-4 py-10 text-center">
                <Icon name="document" className="mx-auto h-5 w-5 text-[#aab3c0]" />
                <p className="mt-3 text-xs leading-5 text-[var(--ink-muted)]">Sources will appear after the advisor answers a question.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

export { AdvisorChatPanel };
