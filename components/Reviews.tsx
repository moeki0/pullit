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
import { Comment } from "./Comment";
import { DiffHunk } from "./DiffHunk";
import { diffLines } from "diff";

const fetcher = async ({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: string;
}) => {
  const res = await fetch(`/api/${owner}/${repo}/pulls/${number}`);
  const json = await res.json();
  return json.data;
};

const reviewsFetcher = async ({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: string;
}) => {
  const res = await fetch(`/api/${owner}/${repo}/pulls/${number}/reviews`);
  const json = await res.json();
  return json.data;
};

const reviewCommentsFetcher = async ({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: string;
}) => {
  const res = await fetch(
    `/api/${owner}/${repo}/pulls/${number}/reviewComments`
  );
  const json = await res.json();
  return json.data;
};

export function Reviews({ visible }) {
  const { owner, repo, number } = useParams<{
    owner: string;
    repo: string;
    number: string;
  }>();
  const [editingTitle, setEditingTitle] = useState("");
  const { data, mutate } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}`,
    async () => await fetcher({ owner, repo, number })
  );
  const update = async () => {
    await fetch(`/api/${owner}/${repo}/pulls/${number}`, {
      method: "POST",
      body: JSON.stringify({ title: editingTitle }),
    });
    await mutate();
  };
  const { data: comment } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}/reviewComments`,
    async () => await reviewCommentsFetcher({ owner, repo, number })
  );
  const { data: reviews } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}/reviews`,
    async () => await reviewsFetcher({ owner, repo, number })
  );

  const title = editingTitle || data?.title;

  if (!visible) {
    return null;
  }

  return (
    <>
      {reviews && comment && (
        <div className="flex flex-col gap-2">
          {comment
            .filter((c) => {
              return (
                reviews.find((r) => r.id === c.pull_request_review_id).body
                  .length === 0
              );
            })
            .map((c: any) => (
              <>
                {!c.in_reply_to_id && (
                  <div
                    className="bg-white border border-gray-200 rounded text-sm p-2 "
                    key={c.id}
                  >
                    {(() => {
                      let language = "typescript";
                      if (c?.path?.endsWith(".rs")) {
                        language = "rust";
                      }
                      return (
                        <DiffHunk
                          language={language}
                          hunk={c.diff_hunk
                            ?.split("\n")
                            .toReversed()
                            .slice(0, 7)
                            .toReversed()
                            .join("\n")}
                        />
                      );
                    })()}
                    <div className="flex gap-2 items-center mb-1 mt-3">
                      <Image
                        className="w-5 h-5 rounded-full"
                        alt={c.user.login}
                        src={c.user.avatar_url}
                        width={20}
                        height={20}
                      />
                      <div className="text-sm text-gray-500">
                        {c.user.login}
                      </div>
                      <div className="text-xs text-gray-400">
                        {c.updated_at}
                      </div>
                    </div>
                    <div className="ml-7 break-all [&_a]:underline! [&_a]:text-sky-600!">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }: any) {
                            if (!children?.includes("\n")) {
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                            const rangeStart =
                              c.diff_hunk.split("\n")[0].match(/^@@ -(\d+)/) &&
                              c.diff_hunk.split("\n")[0].match(/^@@ -(\d+)/)[1];
                            const original_lines = c.diff_hunk
                              .split("\n")
                              .slice(
                                (c.start_line || c.original_line) -
                                  rangeStart +
                                  1
                              )
                              .map((l) =>
                                l.replace(/^[+-]/, "").replace(/\n+$/, "")
                              )
                              .join("\n");
                            const suggestion_lines = String(children).replace(
                              /\n+$/,
                              ""
                            );
                            const diff = diffLines(
                              original_lines,
                              suggestion_lines
                            );
                            let lines = "";
                            diff.forEach((d) => {
                              if (d.added && !d.removed) {
                                lines += `${d.value
                                  .split("\n")
                                  .map((l) => `+${l}`)
                                  .join("\n")}\n`;
                              } else if (!d.added && d.removed) {
                                lines += `${d.value
                                  .split("\n")
                                  .map((l) => `-${l}`)
                                  .join("\n")}\n`;
                              } else {
                                lines += `${d.value
                                  .split("\n")
                                  .map((l) => ` ${l}`)
                                  .join("\n")}\n`;
                              }
                            });

                            if (!inline && children) {
                              return (
                                <div className="text-xs">
                                  <DiffHunk
                                    hunk={lines}
                                    language="typescript"
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
                        {c.body}
                      </Markdown>
                    </div>
                    <div className="flex flex-col gap-2 mt-5">
                      {comment
                        .filter((r: any) => r.in_reply_to_id === c.id)
                        .map((r: any) => (
                          <div key={r.id} className="rounded p-2 ml-10">
                            <div className="flex gap-2 items-center mb-1">
                              <Image
                                className="w-5 h-5 rounded-full"
                                alt={r.user.login}
                                src={r.user.avatar_url}
                                width={20}
                                height={20}
                              />
                              <div className="text-sm text-gray-500">
                                {r.user.login}
                              </div>
                              <div className="text-xs text-gray-400">
                                {c.updated_at}
                              </div>
                            </div>
                            <div className="ml-7 break-all [&_a]:underline! [&_a]:text-sky-600!">
                              <Markdown remarkPlugins={[remarkGfm]}>
                                {r.body}
                              </Markdown>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ))}
        </div>
      )}
    </>
  );
}
