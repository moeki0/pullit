import { github } from "@/lib/github";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q");
  const { search } = github();
  const result = (
    await search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:pr ${q as string}`,
      sort: "updated",
    })
  ).data;
  return Response.json({ result });
}
