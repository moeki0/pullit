import { github } from "@/lib/github";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const { pulls } = github();
  const data = (
    await pulls.list({
      owner,
      repo,
      per_page: 100,
    })
  ).data;
  return Response.json({ data });
}
