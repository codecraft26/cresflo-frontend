"use client";

import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
  chatMessage: string;
  streamedAnswer: string;
  lastAnswer: AdvisorAnswer | null;
  lastProvider: string | null;
  onCreateConversation: () => void;
  onReconnect: () => void;
  onChatMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onApplyPrompt: (value: string) => void;
  onLoadConversation: () => void;
};

function AdvisorMark() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--nav)] text-white shadow-sm">
      <Icon name="spark" className="h-4 w-4" />
    </span>
  );
}

function AdvisorChatPanel({
  session,
  connectionState,
  conversation,
  chatMessage,
  streamedAnswer,
  lastAnswer,
  lastProvider,
  onCreateConversation,
  onReconnect,
  onChatMessageChange,
  onSendMessage,
  onApplyPrompt,
  onLoadConversation,
}: AdvisorChatPanelProps) {
  const threadEndRef = useRef<HTMLDivElement>(null);
  const isConnected = connectionState === "Connected";
  const hasMessages = Boolean(conversation?.messages.length || streamedAnswer);
  const lastStoredMessage = conversation?.messages.at(-1)?.content;
  const showStreamedAnswer = Boolean(streamedAnswer && streamedAnswer !== lastStoredMessage);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation?.messages.length, streamedAnswer]);

  const sendMessage = () => {
    if (conversation && chatMessage.trim()) {
      onSendMessage();
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(16,27,45,0.04)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <AdvisorMark />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-[var(--ink)]">Cresflo Advisor</h2>
              {lastProvider ? <Badge tone="neutral">{lastProvider}</Badge> : null}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isConnected ? "Connected" : connectionState}
              {conversation ? <span className="hidden sm:inline">· Conversation active</span> : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected ? (
            <Button variant="ghost" disabled={!session} onClick={onReconnect}>
              <Icon name="refresh" className="h-4 w-4" /> Reconnect
            </Button>
          ) : null}
          {conversation ? (
            <>
              <Button variant="ghost" onClick={onLoadConversation}>
                <Icon name="refresh" className="h-4 w-4" />
                <span className="hidden sm:inline">Reload</span>
              </Button>
              <Button variant="secondary" onClick={onCreateConversation}>
                <Icon name="plus" className="h-4 w-4" /> New chat
              </Button>
            </>
          ) : (
            <Button disabled={!session || !isConnected} onClick={onCreateConversation}>
              <Icon name="plus" className="h-4 w-4" /> Start chat
            </Button>
          )}
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-280px)] lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col">
          <div className="h-[calc(100vh-455px)] min-h-[390px] overflow-y-auto scroll-smooth">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-8 sm:py-8">
              {!hasMessages ? (
                <div className="my-auto py-8">
                  <div className="mx-auto max-w-xl text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--nav)] text-white shadow-lg shadow-slate-900/15">
                      <Icon name="spark" className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold tracking-tight text-[var(--ink)]">How can I help today?</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-muted)]">
                      Ask about loans, portfolio risk, policies, or documents indexed for {session?.organization.name ?? "your organization"}.
                    </p>
                  </div>
                  <div className="mx-auto mt-8 grid max-w-2xl gap-2 sm:grid-cols-2">
                    {promptSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.prompt}
                        type="button"
                        onClick={() => onApplyPrompt(suggestion.prompt)}
                        className="group rounded-xl border border-[var(--line)] bg-white p-3.5 text-left transition hover:border-[#c4ccd8] hover:bg-[var(--panel)] hover:shadow-sm"
                      >
                        <span className="block text-sm font-semibold text-[var(--ink)]">{suggestion.title}</span>
                        <span className="mt-1 block truncate text-xs text-[var(--ink-muted)]">{suggestion.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-7">
                {conversation?.messages.map((message, index) => (
                  <div key={`${message.createdAt}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex items-start gap-3"}>
                    {message.role === "assistant" ? <AdvisorMark /> : null}
                    <div className={message.role === "user" ? "max-w-[82%] rounded-2xl rounded-br-md bg-[var(--panel-strong)] px-4 py-2.5 text-sm leading-6 text-[var(--ink)]" : "min-w-0 max-w-[calc(100%-44px)] pt-1 text-sm leading-7 text-[var(--ink)]"}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {showStreamedAnswer ? (
                  <div className="flex items-start gap-3">
                    <AdvisorMark />
                    <div className="min-w-0 max-w-[calc(100%-44px)] pt-1 text-sm leading-7 text-[var(--ink)]">
                      <p className="whitespace-pre-wrap">{streamedAnswer}</p>
                      {!lastAnswer ? <span className="mt-1 inline-block h-4 w-1 animate-pulse rounded-full bg-[var(--signal)]" /> : null}
                    </div>
                  </div>
                ) : null}

                {lastAnswer?.warnings.map((warning) => (
                  <div key={warning} className="ml-11 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">{warning}</div>
                ))}
                <div ref={threadEndRef} />
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--line)] bg-white px-3 pb-3 pt-3 sm:px-6 sm:pb-5">
            <div className="mx-auto max-w-3xl">
              {lastAnswer?.followUpSuggestions.length ? (
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                  {lastAnswer.followUpSuggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => onApplyPrompt(suggestion)} className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs text-[var(--ink-soft)] transition hover:border-[var(--signal)] hover:text-[var(--signal)]">{suggestion}</button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-end gap-2 rounded-2xl border border-[#cfd6e0] bg-white p-2 shadow-[0_4px_18px_rgba(16,27,45,0.08)] transition focus-within:border-[var(--signal)] focus-within:ring-3 focus-within:ring-[var(--signal-soft)]">
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
                  placeholder={conversation ? "Message Cresflo Advisor" : "Start a conversation to ask a question"}
                  disabled={!conversation}
                  className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-[var(--ink)] outline-none placeholder:text-[#99a2af] disabled:cursor-not-allowed"
                />
                <button type="button" onClick={sendMessage} disabled={!conversation || !chatMessage.trim()} aria-label="Send message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--signal)] text-white transition hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:bg-[#d6dbe2]">
                  <Icon name="send" className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-[var(--ink-muted)]">Answers may contain errors. Verify important lending decisions against cited sources.</p>
            </div>
          </div>
        </div>

        <aside className="hidden border-l border-[var(--line)] bg-[var(--panel)] lg:block">
          <div className="border-b border-[var(--line)] px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="document" className="h-4 w-4 text-[var(--ink-muted)]" />
                <h3 className="text-sm font-bold text-[var(--ink)]">Sources</h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[var(--ink-muted)] ring-1 ring-[var(--line)]">{lastAnswer?.evidence.length ?? 0}</span>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-[var(--ink-muted)]">Evidence used for the latest response.</p>
          </div>
          <div className="max-h-[calc(100vh-360px)] space-y-3 overflow-y-auto p-3">
            {lastAnswer?.evidence.length ? (
              lastAnswer.evidence.map((item, index) => (
                <article key={`${item.type}-${item.id}`} className="rounded-xl border border-[var(--line)] bg-white p-3.5 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[10px] font-bold text-[var(--signal)]">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--signal)]">{item.type}</p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-[var(--ink)]">{item.label}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[var(--ink-muted)]">{item.detail}</p>
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
