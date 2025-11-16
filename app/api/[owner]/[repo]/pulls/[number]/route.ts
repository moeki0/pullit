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
    await pulls.get({
      owner,
      repo,
      pull_number: Number(number),
    })
  ).data;
  return Response.json({ data });
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const { owner, repo, number } = await params;
  const { title } = await req.json();
  const { pulls } = github();
  await pulls.update({
    owner,
    repo,
    pull_number: Number(number),
    title,
  });
  return Response.json({ message: "updated" });
}
