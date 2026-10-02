type NoseProps = {
  className?: string;
};

/** Tiny line nose — used only as a post-submit wink, never as hero. */
export function Nose({ className = "" }: NoseProps) {
  return (
    <svg
      className={className}
      width="14"
      height="18"
      viewBox="0 0 14 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1.5c-1.2 2.8-3.8 7.2-3.8 10.2 0 2.2 1.6 3.8 3.8 3.8s3.8-1.6 3.8-3.8C10.8 8.7 8.2 4.3 7 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M5.2 12.2c.4.5 1 .8 1.8.8s1.4-.3 1.8-.8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
