"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const base =
  "peer block w-full bg-transparent font-body text-warm-white outline-none transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder-transparent";

const wrapBase =
  "group relative rounded-[2px] border bg-void/40 px-4 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

type CommonProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

type InputProps = CommonProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
    multiline?: false;
  };

type TextareaProps = CommonProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    multiline: true;
    rows?: number;
  };

type LuxuryFormInputProps = InputProps | TextareaProps;

const LuxuryFormInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  LuxuryFormInputProps
>(function LuxuryFormInput(props, ref) {
  const { label, hint, error, className = "" } = props;
  const reactId = useId();
  const id = props.id ?? reactId;
  const [focused, setFocused] = useState(false);

  const value = props.value;
  const defaultValue = props.defaultValue;
  const isFilled =
    focused ||
    (typeof value === "string" && value.length > 0) ||
    (typeof value === "number" && !Number.isNaN(value)) ||
    (typeof defaultValue === "string" && defaultValue.length > 0);

  const borderClass = error
    ? "border-red-500/50"
    : focused
      ? "border-gold/60"
      : "border-gold/15 group-hover:border-gold/30";

  const labelClass = [
    "pointer-events-none absolute left-4 font-mono uppercase tracking-[0.32em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
    isFilled
      ? "top-2.5 text-[9px] text-gold/80"
      : "top-1/2 -translate-y-1/2 text-[11px] text-mist",
  ].join(" ");

  if (props.multiline) {
    const {
      multiline: _multiline,
      label: _label,
      hint: _hint,
      error: _error,
      className: _className,
      rows = 4,
      onFocus,
      onBlur,
      ...rest
    } = props;
    void _multiline;
    void _label;
    void _hint;
    void _error;
    void _className;
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className={`${wrapBase} ${borderClass} pt-7 pb-3`}>
          <label htmlFor={id} className={labelClass}>
            {label}
          </label>
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            rows={rows}
            className={`${base} resize-none text-sm leading-relaxed`}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
        </div>
        <FieldFoot hint={hint} error={error} />
      </div>
    );
  }

  const {
    multiline: _ignored,
    label: _label2,
    hint: _hint2,
    error: _error2,
    className: _className2,
    onFocus,
    onBlur,
    ...rest
  } = props;
  void _ignored;
  void _label2;
  void _hint2;
  void _error2;
  void _className2;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className={`${wrapBase} ${borderClass} h-[58px]`}>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={id}
          className={`${base} h-full pt-5 text-sm`}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </div>
      <FieldFoot hint={hint} error={error} />
    </div>
  );
});

function FieldFoot({ hint, error }: { hint?: string; error?: string }) {
  if (!hint && !error) return null;
  return (
    <p
      className={`px-1 font-mono text-[9px] uppercase tracking-[0.3em] ${
        error ? "text-red-400" : "text-mist"
      }`}
    >
      {error ?? hint}
    </p>
  );
}

export default LuxuryFormInput;
