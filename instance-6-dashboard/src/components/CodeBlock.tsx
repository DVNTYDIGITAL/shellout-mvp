"use client";

import CopyButton from "./CopyButton";

export default function CodeBlock({ code }: { code: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <span className="text-xs text-gray-400">HTML</span>
        <CopyButton text={code} label="Copy code" />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}
