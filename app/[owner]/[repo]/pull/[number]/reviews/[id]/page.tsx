import { Review } from "@/components/Review";
import { github } from "@/lib/github";

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string; repo: string; number: string; id: string }>;
}) {
  const { owner, repo, number, id } = await params;
  const { pulls } = github();
  const result = (
    await pulls.getReview({
      owner,
      repo,
      pull_number: Number(number),
      review_id: Number(id),
    })
  ).data;
  return <Review review={result} />;
}
