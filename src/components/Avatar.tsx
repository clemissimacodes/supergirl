type AvatarProps = {
  kind: "anon" | "host";
  className?: string;
};

export function Avatar({ kind, className = "" }: AvatarProps) {
  if (kind === "host") {
    return (
      <div className={`avatar avatar-host ${className}`} aria-hidden>
        <span className="avatar-initial">c</span>
      </div>
    );
  }

  return (
    <div className={`avatar avatar-anon ${className}`} aria-hidden>
      <span className="avatar-dot" />
    </div>
  );
}
