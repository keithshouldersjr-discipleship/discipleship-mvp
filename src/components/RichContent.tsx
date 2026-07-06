// src/components/RichContent.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function RichContent({ markdown }: { markdown: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="dbd-serif mb-6 text-4xl font-semibold tracking-normal text-[var(--ink)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <div className="mt-10 mb-4 flex items-center gap-3">
              <span className="h-5 w-1.5 rounded-full bg-[var(--gold)]" />
              <h2 className="text-xl font-extrabold tracking-tight text-[var(--ink)]">
                {children}
              </h2>
            </div>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--sage-soft)] px-3 py-1 text-sm font-extrabold text-[var(--forest)]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-[var(--muted)]">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 space-y-2 text-sm text-[var(--muted)]">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              <span className="leading-relaxed">{children}</span>
            </li>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--sage-soft)] text-[var(--ink)]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-[var(--line)] px-4 py-3 text-left font-extrabold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[var(--line)] px-4 py-3 align-top text-[var(--muted)]">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[var(--forest)] underline underline-offset-4 hover:text-[var(--ink)]"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => <div className="my-8 h-px w-full bg-[var(--line)]" />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
