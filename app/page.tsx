import { github } from "@/lib/github";

export default async function Page() {
  const { pulls } = github();
  const list = (
    await pulls.list({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
    })
  ).data;

  return (
    <div>
      {list.map((pull) => (
        <div key={pull.id}>
          <a href={`/pulls/${pull.number}`}>{pull.title}</a>
        </div>
      ))}
    </div>
  );
}
