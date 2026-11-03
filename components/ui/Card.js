// The surface used for every panel: soft border, subtle depth, rounded corners.
export default function Card({ as: Tag = "section", title, action, className = "", children, ...rest }) {
  return (
    <Tag
      className={`animate-rise rounded-xl border border-white/[0.07] bg-panel/80 shadow-card backdrop-blur ${className}`}
      {...rest}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-4">
          {title && <h2 className="eyebrow">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-4 pt-3">{children}</div>
    </Tag>
  );
}

export const linkAction =
  "inline-flex min-h-9 items-center rounded-md px-2 text-xs font-semibold text-brand hover:bg-white/5";
