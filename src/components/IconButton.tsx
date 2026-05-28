import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  showLabel?: boolean;
}

export function IconButton({
  icon,
  label,
  showLabel = false,
  className = "",
  type = "button",
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={[
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm transition",
        "hover:bg-black/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      ].join(" ")}
      {...buttonProps}
    >
      <span className="flex h-5 w-5 items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      {showLabel ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}
