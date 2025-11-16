import { github } from "@/lib/github";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const { owner, repo, number } = await params;
  const { issues } = github();
  try {
    const data = (
      await issues.listComments({
        owner,
        repo,
        issue_number: Number(number),
      })
    ).data;
    return Response.json({ data });
  } catch (e) {
    return Response.json({ error: e });
  }
}
