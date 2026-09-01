// components/bulletin/AnomalyBadge.tsx
export function AnomalyBadge({ gravite }: { gravite: string }) {
  const color =
    gravite === "critical"
      ? "bg-red-600"
      : gravite === "warning"
      ? "bg-yellow-500"
      : "bg-blue-500";

  return (
    <span className={`text-white text-xs px-2 py-1 rounded ${color}`}>
      {gravite.toUpperCase()}
    </span>
  );
}
