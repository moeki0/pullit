import { Octokit } from "octokit";

export function github() {
  return new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN }).rest;
}
