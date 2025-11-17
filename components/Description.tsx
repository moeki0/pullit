"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);

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

export function Description({ visible }) {
  const { owner, repo, number } = useParams<{
    owner: string;
    repo: string;
    number: string;
  }>();
  const { data } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}`,
    async () => await fetcher({ owner, repo, number })
  );

  if (!visible) {
    return <></>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-3 markdown max-w-full">
      <Markdown remarkPlugins={[remarkGfm]}>{data?.body}</Markdown>
    </div>
  );
}
