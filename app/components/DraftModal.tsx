"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { LogRecord } from "@/lib/types";
import { MarketingKit, kitFromLog } from "./MarketingKit";

export function DraftModal({
  draft,
  onClose,
}: {
  draft: LogRecord;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!openerRef.current && document.activeElement instanceof HTMLElement)
      openerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (!dialog?.isConnected && openerRef.current?.isConnected)
        openerRef.current.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="draft-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <header className="dialog-heading">
        <div>
          <span className="workspace-eyebrow">SAVED DRAFT</span>
          <h2 id={titleId}>{draft.projectName}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close draft preview"
          autoFocus
        >
          <X size={20} />
        </button>
      </header>
      <div className="dialog-body">
        <MarketingKit
          output={kitFromLog(draft)}
          projectName={draft.projectName}
          createdAt={draft.createdAt}
        />
        <details className="draft-source">
          <summary>View the original notes</summary>
          <p>{draft.rawInput}</p>
        </details>
      </div>
    </dialog>
  );
}
