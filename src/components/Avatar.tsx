import Image from "next/image";

type AvatarProps = {
  kind: "anon" | "host";
  className?: string;
};

export function Avatar({ kind, className = "" }: AvatarProps) {
  if (kind === "host") {
    return (
      <Image
        className={`avatar avatar-host ${className}`}
        src="/clemi-still.png"
        alt=""
        width={40}
        height={40}
      />
    );
  }

  return (
    <div className={`avatar avatar-anon ${className}`} aria-hidden>
      <span className="avatar-dot" />
    </div>
  );
}
