"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";

// Custom listbox that replaces the native <select>. Keyboard: arrows, Home/End, Enter/Space,
// Esc, Tab and type-to-search. The menu opens upwards when there is no room below.
// options: [{ value, label, hint?, disabled?, icon? }]
export default function Select({
  value,
  onChange,
  options,
  id,
  label,
  placeholder = "Select...",
  leading = null,
  variant = "field", // "field" (forms) | "chip" (toolbars) | "bare" (inside another box)
  align = "left",
  className = "",
}) {
  const uid = useId();
  const listId = `${uid}-list`;
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: "", timer: null });
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [active, setActive] = useState(-1);

  const selectedIndex = useMemo(() => options.findIndex((o) => String(o.value) === String(value)), [options, value]);
  const selected = options[selectedIndex];

  const enabled = useCallback((i) => options[i] && !options[i].disabled, [options]);
  const step = useCallback(
    (from, dir) => {
      for (let n = 1; n <= options.length; n++) {
        const i = (from + dir * n + options.length * n) % options.length;
        if (enabled(i)) return i;
      }
      return from;
    },
    [options.length, enabled]
  );

  const openMenu = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      const wanted = Math.min(options.length * 44 + 12, 288);
      setUp(below < wanted && rect.top > below);
    }
    setActive(selectedIndex >= 0 ? selectedIndex : step(-1, 1));
    setOpen(true);
  }, [options.length, selectedIndex, step]);

  const choose = useCallback(
    (i) => {
      if (!enabled(i)) return;
      onChange(options[i].value);
      setOpen(false);
      rootRef.current?.querySelector("button")?.focus();
    },
    [enabled, onChange, options]
  );

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const down = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    // Esc closes only the list, even if focus is elsewhere (a dialog around us must stay open).
    const esc = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      setOpen(false);
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", esc, true);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", esc, true);
    };
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  useEffect(() => () => clearTimeout(typed.current.timer), []);

  function onKeyDown(e) {
    const { key } = e;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // don't close a dialog around us
      setOpen(false);
    } else if (key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => step(a, 1));
    } else if (key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => step(a, -1));
    } else if (key === "Home") {
      e.preventDefault();
      setActive(step(-1, 1));
    } else if (key === "End") {
      e.preventDefault();
      setActive(step(options.length, -1));
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      choose(active);
    } else if (key === "Tab") {
      setOpen(false);
    } else if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
      clearTimeout(typed.current.timer);
      typed.current.text += key.toLowerCase();
      typed.current.timer = setTimeout(() => (typed.current.text = ""), 600);
      const hit = options.findIndex((o) => !o.disabled && String(o.label).toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  }

  const shell = {
    field: "min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm",
    chip: "min-h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold hover:bg-white/10",
    bare: "h-11 w-full px-1 text-sm font-semibold",
  }[variant];

  return (
    <div ref={rootRef} className={`relative ${variant === "field" ? "w-full" : variant === "bare" ? "min-w-0 flex-1" : "inline-block"} ${className}`}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={`flex cursor-pointer items-center gap-2 text-left outline-none transition focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/25 ${shell} ${
          open ? "border-brand/50" : ""
        }`}
      >
        {leading}
        <span className={`min-w-0 flex-1 truncate ${selected ? "" : "text-zinc-500"}`}>{selected ? selected.label : placeholder}</span>
        <FaChevronDown aria-hidden="true" className={`shrink-0 text-[10px] text-zinc-400 transition-transform ${open ? "rotate-180 text-brand" : ""}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className={`absolute z-40 max-h-72 min-w-full overflow-y-auto rounded-lg border border-white/10 bg-raised/95 p-1 shadow-card animate-rise ${
            up ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${align === "right" ? "right-0" : "left-0"}`}
          style={{ width: "max-content", maxWidth: "min(20rem, calc(100vw - 2rem))" }}
        >
          {options.map((o, i) => {
            const isSelected = i === selectedIndex;
            return (
              <li
                key={String(o.value)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={o.disabled || undefined}
                onMouseEnter={() => enabled(i) && setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm ${
                  o.disabled ? "cursor-not-allowed text-zinc-500" : "cursor-pointer text-zinc-100"
                } ${i === active && !o.disabled ? "bg-brand/15" : ""} ${isSelected ? "font-semibold" : ""}`}
              >
                {o.icon}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.hint && <span className="eyebrow rounded bg-accent/15 px-1.5 py-0.5 text-accent">{o.hint}</span>}
                {isSelected && <FaCheck aria-hidden="true" className="shrink-0 text-xs text-brand" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
