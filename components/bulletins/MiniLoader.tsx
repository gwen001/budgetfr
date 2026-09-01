import React from "react";

export function MiniLoader({ className }: { className?: string }) {
  return (
    <div
      className={`h-4 w-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin ${className ?? ""}`}
    />
  );
}
