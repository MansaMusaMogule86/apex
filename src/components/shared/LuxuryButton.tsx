"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
};

type LuxuryButtonProps = ButtonProps | LinkProps;

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[10px] tracking-[0.3em]",
  md: "h-11 px-6 text-[11px] tracking-[0.32em]",
  lg: "h-14 px-8 text-[12px] tracking-[0.35em]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-void border border-gold hover:bg-gold-light hover:border-gold-light",
  outline:
    "bg-transparent text-warm-white border border-gold/30 hover:border-gold hover:text-gold-light",
  ghost:
    "bg-transparent text-warm-white border border-transparent hover:text-gold-light",
};

const base =
  "group relative inline-flex items-center justify-center gap-3 rounded-[2px] font-mono uppercase transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden whitespace-nowrap";

function Inner({
  children,
  withArrow,
  loading,
}: {
  children: ReactNode;
  withArrow?: boolean;
  loading?: boolean;
}) {
  return (
    <>
      {/* Sweep highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-warm-white/10 to-transparent transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-full"
      />

      <span className="relative z-10 inline-flex items-center gap-3">
        {loading ? (
          <span
            aria-hidden
            className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin"
          />
        ) : null}
        <span>{children}</span>
        {withArrow ? (
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.5}
          />
        ) : null}
      </span>
    </>
  );
}

const LuxuryButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  LuxuryButtonProps
>(function LuxuryButton(props, ref) {
  const {
    variant = "primary",
    size = "md",
    withArrow = false,
    loading = false,
    className = "",
    children,
    ...restProps
  } = props;

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if ("href" in restProps && restProps.href) {
    const { href, external, ...anchorRest } = restProps as Omit<LinkProps, keyof CommonProps> & { href: string; external?: boolean };
    if (external) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...anchorRest}
        >
          <Inner withArrow={withArrow} loading={loading}>
            {children}
          </Inner>
        </a>
      );
    }
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...anchorRest}
      >
        <Inner withArrow={withArrow} loading={loading}>
          {children}
        </Inner>
      </Link>
    );
  }

  const { href: _href, ...buttonRest } = restProps as any;

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      disabled={loading || buttonRest.disabled}
      {...buttonRest}
    >
      <Inner withArrow={withArrow} loading={loading}>
        {children}
      </Inner>
    </button>
  );
});

export default LuxuryButton;
