import { StepCard } from "@/components/advisor/step-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import type { AdvisorAnswer, AdvisorConversation, OrganizationSession } from "@/lib/types";

const promptSuggestions = [
  "Show me all defaulted loans with principal above $50,000.",
  "How many loans are overdue?",
  "Does this loan agreement allow a six-month extension?",
  "Remove the last condition and show me the original list again.",
];

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
}: {
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
}) {
  const isConnected = connectionState === "Connected";
  const hasMessages = Boolean(conversation?.messages.length || streamedAnswer);

  return (
    <StepCard
      eyebrow="AI advisor"
      title="Organization conversation"
      description="Answers stream in real time and include the organization evidence used to produce them."
      status={conversation ? "Ready" : connectionState}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)]">
          <span className="inline-flex items-center gap-2 font-semibold text-[var(--ink-soft)]">
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
            {connectionState}
          </span>
          <span className="hidden h-4 w-px bg-[var(--line)] sm:block" />
          <span className="max-w-52 truncate">{conversation?.id ?? "No active conversation"}</span>
          {lastProvider ? <Badge tone="neutral">{lastProvider}</Badge> : null}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={!session} onClick={onReconnect}>Reconnect</Button>
          {conversation ? (
            <Button variant="secondary" disabled={!session} onClick={onLoadConversation}>Reload</Button>
          ) : (
            <Button disabled={!session || !isConnected} onClick={onCreateConversation}>New conversation</Button>
          )}
        </div>
      </div>

      <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-[var(--line)] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col bg-white">
          <div className="flex min-h-[380px] flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
            {!hasMessages ? (
              <div className="m-auto max-w-lg py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--signal-soft)] text-[var(--signal)]">
                  <Icon name="spark" className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">What would you like to know?</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">Ask about loans, policies, or any document indexed for this organization.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {promptSuggestions.slice(0, 3).map((prompt) => (
                    <button key={prompt} type="button" onClick={() => onApplyPrompt(prompt)} className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-medium text-[var(--ink-soft)] transition hover:border-[var(--signal)] hover:text-[var(--signal)]">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {conversation?.messages.map((message, index) => (
              <div key={`${message.createdAt}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[var(--nav)] text-white" : "rounded-bl-md bg-[var(--panel-strong)] text-[var(--ink)]"}`}>
                  {message.content}
                </div>
              </div>
            ))}

            {streamedAnswer && streamedAnswer !== conversation?.messages.at(-1)?.content ? (
              <div className="flex gap-3">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[var(--signal-soft)] px-4 py-3 text-sm leading-6 text-[var(--ink)]">
                  {streamedAnswer}
                  {!lastAnswer ? <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-[var(--signal)] align-middle" /> : null}
                </div>
              </div>
            ) : null}

            {lastAnswer?.warnings.map((warning) => (
              <div key={warning} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{warning}</div>
            ))}
          </div>

          <div className="border-t border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4">
            {lastAnswer?.followUpSuggestions.length ? (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {lastAnswer.followUpSuggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => onApplyPrompt(suggestion)} className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs text-[var(--ink-soft)] hover:border-[var(--signal)]">{suggestion}</button>
                ))}
              </div>
            ) : null}
            <Field label="Ask Cresflo Advisor">
              <div className="flex items-end gap-2">
                <Textarea value={chatMessage} onChange={(event) => onChatMessageChange(event.target.value)} placeholder="Ask a question about this organization..." className="min-h-12 flex-1 py-2.5" />
                <Button disabled={!conversation || !chatMessage.trim()} onClick={onSendMessage} className="mb-0.5 shrink-0">Send</Button>
              </div>
            </Field>
          </div>
        </div>

        <aside className="border-t border-[var(--line)] bg-[var(--panel)] p-4 xl:border-l xl:border-t-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--ink)]">Sources</h3>
            <span className="text-xs text-[var(--ink-muted)]">{lastAnswer?.evidence.length ?? 0} found</span>
          </div>
          <div className="mt-4 space-y-3">
            {lastAnswer?.evidence.length ? lastAnswer.evidence.map((item) => (
              <article key={`${item.type}-${item.id}`} className="rounded-xl border border-[var(--line)] bg-white p-3.5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--signal)]">{item.type}</p>
                <p className="mt-1.5 text-sm font-semibold text-[var(--ink)]">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--ink-muted)]">{item.detail}</p>
              </article>
            )) : (
              <div className="rounded-xl border border-dashed border-[var(--line)] px-4 py-8 text-center text-xs leading-5 text-[var(--ink-muted)]">Sources used for an answer will appear here.</div>
            )}
          </div>
        </aside>
      </div>
    </StepCard>
  );
}

export { AdvisorChatPanel };
