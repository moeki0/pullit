"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

const fetcher = async ({ owner, repo }: { owner: string; repo: string }) => {
  const res = await fetch(`/api/${owner}/${repo}/pulls`);
  const json = await res.json();
  return json.data;
};

interface Pull {
  assignees: { login: string }[];
  number: number;
  title: string;
}

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export function Search() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Pull[]>([]);
  const { data } = useSWR(`/api/${owner}/${repo}/pulls`, async () => {
    const res = await fetcher({ owner, repo });
    setResult(res);
    return res;
  });
  const search = async ({
    query,
    retry = 0,
  }: {
    query: string;
    retry?: number;
  }) => {
    try {
      setResult(
        data.filter((i: Pull) =>
          i.title.toLowerCase().includes(query.toLowerCase())
        )
      );
    } catch (e) {
      await sleep(500);
      search({ query, retry: retry + 1 });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="mx-auto max-w-[800px]">
        <input
          onChange={(e) =>
            search({ query: (e.target as HTMLInputElement).value })
          }
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          className="border border-gray-200 rounded mx-auto block bg-white text-lg px-3 py-1 w-full "
          autoFocus
        />
        <div className="divide-gray-100 py-5">
          {result.map((item) => (
            <a
              className="flex gap-2 bg-white p-2 items-center border border-gray-100 cursor-pointer hover:bg-gray-50"
              key={item.number}
              target="_blank"
              href={`/${owner}/${repo}/pull/${item.number}`}
            >
              <span className="text-sm font-bold">#{item.number}</span>
              {item.title}
              {item.assignees.length > 0 && (
                <>
                  {item.assignees.map((a) => (
                    <Image
                      key={a.login}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full"
                      src={a.avatar_url}
                      alt={a.login}
                    />
                  ))}
                </>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
