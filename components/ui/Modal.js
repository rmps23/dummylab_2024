"use client";

import { useEffect, useRef } from "react";
import { GrClose } from "react-icons/gr";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Accessible dialog: only mounted while open, closes with Esc or a click on the backdrop,
// keeps focus inside, and gives focus back to the trigger when it closes.
const Modal = ({ show, onClose, content, title = "Dialog" }) => {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!show) return;
    const dialog = dialogRef.current;
    const previous = document.activeElement;
    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);

    (dialog.querySelector("input, select, textarea") || focusables()[0] || dialog).focus();

    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      } else if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return e.preventDefault();
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCloseRef.current()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative mx-auto my-6 sm:my-12 w-[calc(100%-2rem)] max-w-2xl rounded-lg border border-zinc-800 bg-zinc-950 p-6 outline-none"
      >
        <button
          type="button"
          aria-label="Close dialog"
          onClick={() => onCloseRef.current()}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-800"
        >
          <GrClose />
        </button>
        <div className="px-1 pb-2 pt-8">{content}</div>
      </div>
    </div>
  );
};

export default Modal;
