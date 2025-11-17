"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Tooltip } from "react-tooltip";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
import Image from "next/image";
import { DiffHunk } from "./DiffHunk";

const commentsFetcher = async ({
  owner,
  repo,
  number,
  id,
}: {
  owner: string;
  repo: string;
  number: string;
  id: string;
}) => {
  const res = await fetch(
    `/api/${owner}/${repo}/pulls/${number}/reviews/${id}/comments`
  );
  const json = await res.json();
  return json.data;
};

export function Comment({ c, full }: { c; full: boolean }) {
  const { owner, repo, number } = useParams<{
    owner: string;
    repo: string;
    number: string;
  }>();
  const { data: comments } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}/reviews/${c.id}/comments`,
    async () => await commentsFetcher({ owner, repo, number, id: c.id })
  );

  return (
    <div
      key={c.id}
      className="bg-white p-3 rounded border border-gray-200 text-sm"
    >
      <div className="flex gap-2 items-center mb-1">
        <Image
          className="w-5 h-5 rounded-full"
          alt={c.user.login}
          src={c.user.avatar_url}
          width={20}
          height={20}
        />
        <div className="text-xs text-gray-400">
          {c.submitted_at || c.created_at}
        </div>
        <div className="text-xs text-gray-400">
          {!full && comments ? (
            <a
              href={`/${owner}/${repo}/pull/${number}/reviews/${c.id}`}
              className="underline"
            >
              {comments.length > 0 ? (
                <>{comments.length} Comments</>
              ) : (
                "View all"
              )}
            </a>
          ) : (
            !full && (
              <a
                href={`/${owner}/${repo}/pull/${number}/comments/${c.id}`}
                className="underline"
              >
                View all
              </a>
            )
          )}
        </div>
        <div className="text-xs text-gray-400 underline">
          {full && (
            <a href={c.html_url} target="_blank">
              View on GitHub
            </a>
          )}
        </div>
      </div>
      <div className="ml-7 break-all markdown">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              if (!children?.includes("\n")) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }

              if (!inline && children) {
                return (
                  <div className="text-xs my-4">
                    <DiffHunk
                      hunk={children}
                      language={className.match(/language-(.+)/)[1]}
                    />
                  </div>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {full
            ? c.body
            : c.body.slice(0, 200) + (c.body.length > 200 ? "..." : "")}
        </Markdown>
      </div>
    </div>
  );
}
