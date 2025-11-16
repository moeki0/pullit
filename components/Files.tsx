"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Tooltip } from "react-tooltip";
import Markdown from "react-markdown";
import Image from "next/image";
import { DiffHunk } from "./DiffHunk";

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

const filesFetcher = async ({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: string;
}) => {
  const res = await fetch(`/api/${owner}/${repo}/pulls/${number}/files`);
  const json = await res.json();
  return json.data;
};

export function Files({ visible }: { visible: boolean }) {
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
  const { data: files } = useSWR(
    `/api/${owner}/${repo}/pulls/${number}/files`,
    async () => await filesFetcher({ owner, repo, number })
  );

  const title = editingTitle || data?.title;

  if (!visible) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      {files?.map((file) => (
        <div key={file.id} className="p-5 bg-white rounded">
          <code className="block text-sm mb-2">{file.filename}</code>
          {(() => {
            let language = "typescript";
            if (file?.path?.endsWith(".rs")) {
              language = "rust";
            }
            return <DiffHunk hunk={file.patch} language={language} />;
          })()}
        </div>
      ))}
    </div>
  );
}
