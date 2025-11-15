import { github } from "@/lib/github";

export default async function Page({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { pulls, markdown } = github();
  const pull = (
    await pulls.get({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      pull_number: Number((await params).number),
    })
  ).data;
  const html = (await markdown.render({ text: pull.body! })).data;

  return (
    <div>
      <textarea className="w-full" value={pull.title} />
      <div
        className="prose max-w-[800px] mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
