"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";

export function DiffHunk({
  hunk,
  language,
}: {
  hunk: string;
  language: string;
}) {
  return (
    <div className="rounded">
      {hunk?.split("\n").map((line, index) => (
        <div
          key={index}
          className={`[&>div]:m-0! [&>div]:p-0! ${
            line.startsWith("+") &&
            "[&_div]:bg-green-100! [&_span]:bg-green-100!"
          } ${
            line.startsWith("-") && "[&_div]:bg-red-100! [&_span]:bg-red-100!"
          }`}
        >
          <SyntaxHighlighter
            style={oneLight}
            language={language}
            wrapLines
            PreTag="div"
            customStyle={{
              fontSize: "0.75rem",
            }}
          >
            {line}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  );
}
