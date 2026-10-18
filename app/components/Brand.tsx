import Link from "next/link";

/** A simple F made from a log's lines, with a small progress dot. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 25V7h17M8 15h12"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="square"
      />
      <circle cx="25" cy="25" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="FeatureLogs home">
      <span className="brand-mark">
        <BrandMark />
      </span>
      <span>
        feature<span className="font-normal">logs</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
