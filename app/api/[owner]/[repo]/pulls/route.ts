import { github } from "@/lib/github";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const searchParams = req.nextUrl.searchParams;
  const state = searchParams.get("state");
  const { pulls } = github();
  const data = (
    await pulls.list({
      owner,
      repo,
      per_page: 100,
      state,
    })
  ).data;
  return Response.json({ data });
}
