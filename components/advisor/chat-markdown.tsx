import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="min-w-0 text-sm leading-6 text-[var(--ink)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--signal)] underline decoration-[var(--signal)]/30 underline-offset-4 hover:decoration-[var(--signal)]"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 rounded-r-lg border-l-2 border-amber-400 bg-amber-50 px-2.5 py-1.5 text-amber-900">
              {children}
            </blockquote>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)] first:mt-0">
              {children}
            </h3>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
          table: ({ children }) => (
            <div className="my-2 max-w-full overflow-x-auto rounded-lg border border-[var(--line)]">
              <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-[var(--line)]">{children}</tbody>,
          td: ({ children }) => <td className="whitespace-nowrap px-2.5 py-2 text-[var(--ink-soft)]">{children}</td>,
          th: ({ children }) => <th className="whitespace-nowrap bg-[var(--panel)] px-2.5 py-2 font-bold text-[var(--ink)]">{children}</th>,
          ul: ({ children }) => <ul className="my-1.5 list-disc space-y-0.5 pl-5">{children}</ul>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export { ChatMarkdown };
