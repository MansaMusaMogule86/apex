import { type HTMLAttributes } from "react";

export default function Skeleton({
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={[
        "relative overflow-hidden rounded-[2px] border border-gold/5 bg-obsidian/60",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.5s_cubic-bezier(0.16,1,0.3,1)_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-gold/10 before:to-transparent",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
