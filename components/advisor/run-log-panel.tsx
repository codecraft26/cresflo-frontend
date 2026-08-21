import { Card } from "@/components/ui/card";

function RunLogPanel({
  errorMessage,
  activityLog,
}: {
  errorMessage: string;
  activityLog: string[];
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <p className="text-sm font-bold text-[var(--ink)]">Activity log</p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">Recent requests and realtime connection events.</p>
        </div>
        <span className="rounded-full bg-[var(--panel)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-muted)]">{activityLog.length} events</span>
      </div>
      {errorMessage ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
      <div className="relative space-y-0">
        {activityLog.length > 0 ? (
          activityLog.map((item) => (
            <div key={item} className="relative flex gap-3 border-b border-[var(--line)] py-3 last:border-0">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
              <p className="font-mono text-xs leading-5 text-[var(--ink-soft)]">{item}</p>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-9 text-center text-sm text-[var(--ink-muted)]">
            No activity has been recorded in this session.
          </div>
        )}
      </div>
    </Card>
  );
}

export { RunLogPanel };
