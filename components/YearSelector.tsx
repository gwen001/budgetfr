"use client";

type Props = {
  years: number[];
  selectedYear: number;
  onChange: (year: number) => void;
};

export default function YearSelector({ years, selectedYear, onChange }: Props) {
    return (
        <div className="mt-3 lg:mt-0 lg:flex items-center text-center gap-6">
            {years.map((year) => (
                <label key={year} className="ms-3 lg:ms-0 lg:flex items-center gap-2 cursor-pointer">
                    <input
                    type="radio"
                    name="year-filter"
                    value={year}
                    checked={selectedYear === year}
                    onChange={() => onChange(year)}
                    className="w-4 h-4"
                    />
                    <span className="ms-1 lg:ms-0">{year}</span>
                </label>
            ))}
        </div>
    );
}
