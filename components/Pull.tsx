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
import { Files } from "./Files";
import { Reviews } from "./Reviews";
import { Description } from "./Description";

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

const commentFetcher = async ({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: string;
}) => {
  const res = await fetch(`/api/${owner}/${repo}/pulls/${number}/comments`);
  const json = await res.json();
  return json.data;
};

const commitsFetcher = async ({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: string;
}) => {
  const res = await fetch(`/api/${owner}/${repo}/pulls/${number}/commits`);
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

const commentsFetcher = async ({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: string;
}) => {
  const res = await fetch(`/api/${owner}/${repo}/pulls/${number}/comments`);
  const json = await res.json();
  return json.data;
};

interface Pull {
  assignees: { login: string }[];
  number: number;
  title: string;
}

export function Pull() {
  const { owner, repo, number } = useParams<{
    owner: string;
    repo: string;
    number: string;
  }>();
  const [editingTitle, setEditingTitle] = useState("");
  const { data } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}`,
    async () => await fetcher({ owner, repo, number })
  );
  const { data: commits } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}/commits`,
    async () => await commitsFetcher({ owner, repo, number })
  );
  const { data: reviews } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}/reviews`,
    async () => await reviewsFetcher({ owner, repo, number })
  );
  const { data: comments } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}/comments`,
    async () => await commentsFetcher({ owner, repo, number })
  );
  const [mode, setMode] = useState("comments");

  const items = reviews && comments ? [...reviews, ...comments] : [];
  items.sort((a, b) => {
    let i = a.created_at || a.submitted_at;
    let j = b.created_at || b.submitted_at;
    if (typeof i === "string") {
      i = new Date(i);
    }
    if (typeof j === "string") {
      j = new Date(j);
    }
    i = (i as Date)?.getTime();
    j = (j as Date)?.getTime();
    return j - i;
  });

  const title = editingTitle || data?.title;

  return (
    <>
      <div className={` bg-gray-100 min-h-screen p-5`}>
        <div className="mx-auto max-w-[800px]">
          {data && (
            <>
              <input
                value={title}
                className="w-full font-bold mb-3"
                onChange={(e) => setEditingTitle(e.target.value)}
              />
              <div className="flex gap-4 mb-3 items-center text-sm">
                <div>
                  <button onClick={() => setMode("comments")} className="">
                    Comments
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setMode("reviewComments")}
                    className=""
                  >
                    Review Comments
                  </button>
                </div>
                <div>
                  <button className="" onClick={() => setMode("files")}>
                    Files
                  </button>
                </div>
                <div>
                  <button className="" onClick={() => setMode("description")}>
                    Description
                  </button>
                </div>
              </div>
            </>
          )}
          <Files visible={mode === "files"} />
          <Reviews visible={mode === "reviewComments"} />
          <Description visible={mode === "description"} />
          <div className={` ${mode !== "comments" ? "hidden" : ""}`}>
            {items && (
              <div className="flex flex-col gap-2">
                {items
                  .filter((i) => i.body)
                  .toReversed()
                  .map((c: any) => (
                    <Comment full={false} key={c.id} c={c} />
                  ))}
              </div>
            )}
            {data && commits && (
              <div className="mt-3">
                {commits.map((commit) => (
                  <a
                    href={commit.html_url}
                    target="_blank"
                    className="flex gap-3 py-1"
                    key={commit.sha}
                  >
                    <code className="text-xs">{commit.sha.slice(0, 7)}</code>
                    <div className="text-sm">{commit.commit.message}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
