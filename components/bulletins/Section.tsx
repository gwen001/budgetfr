// components/ui/SectionTitleWithHelp.tsx
"use client";

export function Section({
  title,
  help,
  children
}: {
  title: string;
  help?: string;
  children: React.ReactNode
}) {
  return (
    <div className="mb-8">
        <div className="flex items-center gap-2 relative mb-2">
            <h2 className="text-xl font-bold">{title}</h2>

            {/* Icône "?" */}
            {help &&
                <div className="relative group">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-700 text-white text-xs font-bold cursor-pointer group-hover:bg-black">
                    ?
                    </span>

                    {/* Tooltip */}
                    <div className="absolute left-6 top-0 hidden group-hover:block bg-black text-white text-xs p-2 rounded shadow-lg w-64 z-10">
                    {help}
                    </div>
                </div>
            }
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
            {children}
        </div>
    </div>
  );
}
