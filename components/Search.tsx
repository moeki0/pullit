"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = async ({
  owner,
  repo,
  state,
}: {
  owner: string;
  repo: string;
  state: "open" | "closed";
}) => {
  const res = await fetch(`/api/${owner}/${repo}/pulls?state=${state}`);
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
  const router = useRouter();
  const pathname = usePathname();
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q"));
  const [openResult, setOpenResult] = useState<Pull[]>([]);
  const [closedResult, setClosedResult] = useState<Pull[]>([]);
  const { data: open } = useSWR(
    `/api/${owner}/${repo}/pulls?state=open`,
    async () => {
      const res = await fetcher({ owner, repo, state: "open" });
      return res;
    }
  );
  const { data: closed } = useSWR(
    `/api/${owner}/${repo}/pulls?state=closed`,
    async () => {
      const res = await fetcher({ owner, repo, state: "closed" });
      return res;
    }
  );

  const search = async ({
    query,
    retry = 0,
  }: {
    query: string;
    retry?: number;
  }) => {
    try {
      setOpenResult(
        open.filter((i: Pull) =>
          i.title.toLowerCase().includes(query.toLowerCase())
        )
      );
      setClosedResult(
        closed.filter((i: Pull) =>
          i.title.toLowerCase().includes(query.toLowerCase())
        )
      );
    } catch (e) {
      await sleep(500);
      if (open) {
        return;
      }
      search({ query, retry: retry + 1 });
    }
  };

  useEffect(() => {
    const q = params.get("q");
    if (q !== null && open && closed) {
      search({ query: q });
    }
  }, [open, closed]);

  const openView = openResult.length > 0 ? openResult : open || [];
  const closedView = closedResult.length > 0 ? closedResult : closed || [];

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="mx-auto max-w-[800px]">
        <input
          onChange={(e) => {
            setQuery(e.target.value);
            const p = new URLSearchParams(params.toString());
            p.set("q", e.target.value);
            router.push(pathname + "?" + p.toString());
            search({ query: e.target.value });
          }}
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          className="border border-gray-200 rounded mx-auto block bg-white text-lg px-3 py-1 w-full "
          autoFocus
        />
        <div className="divide-gray-100 mt-5">
          {openView.map((item) => (
            <Link
              className="flex gap-2 bg-white p-2 text-sm items-center border border-gray-100 cursor-pointer hover:bg-gray-50"
              key={item.number}
              href={`/${owner}/${repo}/pull/${item.number}`}
            >
              <Image
                key={item.user.login}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full"
                src={item.user.avatar_url}
                alt={item.user.login}
              />
              <span className="text-sm font-bold font-mono">
                #{item.number}
              </span>
              <span
                className={`text-xs text-white px-[3px] rounded min-w-[55px] text-center ${
                  item.state === "open" ? "bg-green-500" : "bg-purple-500"
                }`}
              >
                {item.state}
              </span>
              <span className="text-xs font-mono">
                {new Date(item.created_at).getMonth() +
                  "/" +
                  new Date(item.created_at).getDate()}
              </span>

              <span className="truncate">{item.title}</span>
            </Link>
          ))}
        </div>
        <div className="divide-gray-100 py-5">
          {openView.length > 0 &&
            closedView.map((item) => (
              <Link
                className="flex gap-2 bg-white p-2 text-sm items-center border border-gray-100 cursor-pointer hover:bg-gray-50"
                key={item.number}
                href={`/${owner}/${repo}/pull/${item.number}`}
              >
                <Image
                  key={item.user.login}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full"
                  src={item.user.avatar_url}
                  alt={item.user.login}
                />
                <span className="text-sm font-bold font-mono">
                  #{item.number}
                </span>
                <span
                  className={`text-xs text-white px-[3px] rounded min-w-[55px] text-center ${
                    item.state === "open" ? "bg-green-500" : "bg-purple-500"
                  }`}
                >
                  {item.state}
                </span>
                <span className="text-xs font-mono">
                  {new Date(item.created_at).getMonth() +
                    "/" +
                    new Date(item.created_at).getDate()}
                </span>

                <span className="truncate">{item.title}</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
