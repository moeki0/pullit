import { Review } from "@/components/Review";
import { github } from "@/lib/github";

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string; repo: string; number: string; id: string }>;
}) {
  const { owner, repo, number, id } = await params;
  const { issues } = github();
  const result = (
    await issues.getComment({
      owner,
      repo,
      issue_number: Number(number),
      comment_id: Number(id),
    })
  ).data;
  return <Review review={result} />;
}
