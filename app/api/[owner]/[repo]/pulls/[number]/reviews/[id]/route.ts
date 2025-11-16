import { github } from "@/lib/github";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      owner: string;
      repo: string;
      number: string;
      id: string;
    }>;
  }
) {
  const { owner, repo, number, id } = await params;
  const { pulls } = github();
  const data = (
    await pulls.getReview({
      owner,
      repo,
      pull_number: Number(number),
      review_id: Number(id),
    })
  ).data;
  return Response.json({ data });
}
