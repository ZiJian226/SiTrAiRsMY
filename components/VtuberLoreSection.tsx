"use client";

import { useMemo, useState } from "react";

type Props = {
  text: string;
  title?: string;
};

export default function VtuberLoreSection({ text, title = "📖 Vtuber Lore / Model Description" }: Props) {
  const [expanded, setExpanded] = useState(false);

  const trimmed = useMemo(() => text.trim(), [text]);
  const canFold = trimmed.length > 220 || trimmed.includes("\n");

  if (!trimmed) {
    return null;
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">{title}</h2>
        <p
          className="whitespace-pre-wrap"
          style={expanded ? undefined : {
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {trimmed}
        </p>

        {canFold && (
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
