import { github } from "@/lib/github";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const { owner, repo, number } = await params;
  const { pulls } = github();
  const data = (
    await pulls.listFiles({
      owner,
      repo,
      pull_number: Number(number),
    })
  ).data;
  return Response.json({ data });
}
