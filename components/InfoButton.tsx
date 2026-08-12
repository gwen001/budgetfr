"use client";

type Props = {
  onClick: () => void;
};

export default function InfoButton({ onClick }: Props) {
    return (
        <button
        onClick={onClick}
        className="ms-4 lg:ms-0 align-middle cursor-pointer w-6 h-6 lg:flex items-center justify-center rounded-full bg-black text-white text-sm font-bold"
        aria-label="Informations"
        >
        ?
        </button>
    );
}
