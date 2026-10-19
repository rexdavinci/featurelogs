"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Download, ShieldCheck, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/app/components/PasswordField";
import { deleteAccountAction } from "./actions";

export function AccountControls({
  email,
  enabled,
}: {
  email: string;
  enabled: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exported, setExported] = useState(false);
  const download = async () => {
    setExporting(true);
    setExportError("");
    try {
      const response = await fetch("/api/account/export", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `featurelogs-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setExported(true);
    } catch {
      setExportError(
        "We couldn’t download your data. Please try again before deleting your account.",
      );
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="space-y-6">
      {!enabled && (
        <p
          role="status"
          className="rounded-xl border border-(--border) bg-(--surface-muted) p-4 text-sm"
        >
          Self-service export and account deletion currently require Neon
          storage and authentication. Contact the deployment owner for other
          provider combinations.
        </p>
      )}
      <section className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8">
        <Download className="mb-4 text-(--accent)" aria-hidden="true" />
        <h2 className="text-xl font-semibold">Your data, to keep</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--text-secondary)">
          Download your profile, every project, saved marketing kit, voice
          settings, and activity history in one JSON file. Passwords and
          security tokens are excluded.
        </p>
        <button
          type="button"
          onClick={download}
          disabled={!enabled || exporting}
          className="button button-dark mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />{" "}
          {exporting ? "Preparing download…" : "Download my data"}
        </button>
        {exportError && (
          <p role="alert" className="mt-3 text-sm text-(--danger)">
            {exportError}
          </p>
        )}
        {exported && (
          <p role="status" className="mt-3 text-sm text-(--hope)">
            Your download has started. Check that the JSON file is saved before
            deleting your account.
          </p>
        )}
      </section>
      <section className="rounded-2xl border border-(--error-border) bg-(--surface) p-6 sm:p-8">
        <Trash2 className="mb-4 text-(--danger)" aria-hidden="true" />
        <h2 className="text-xl font-semibold">Delete your account</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--text-secondary)">
          Permanently delete your account, projects, drafts, settings, and
          activity from FeatureLogs. You’ll be signed out on every device.
          Download a copy of your data first if you want to keep it.
        </p>
        <p className="mt-3 text-xs leading-5 text-(--text-muted)">
          This removes live app data. Deployment backups and records already
          held by email or AI providers follow their own retention policies.
        </p>
        <button
          type="button"
          disabled={!enabled || exporting}
          onClick={() => setConfirming(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-(--error-border) bg-(--error-surface) px-5 py-3 text-sm font-semibold text-(--danger) hover:opacity-80 disabled:opacity-50 cursor-pointer"
        >
          <Trash2 size={16} /> Delete account
        </button>
      </section>
      <p className="flex items-center gap-2 text-xs text-(--text-muted)">
        <ShieldCheck size={15} /> Account actions apply only to {email}.
      </p>
      {confirming && (
        <DeleteAccountDialog
          email={email}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

function DeleteAccountDialog({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-(--border) bg-(--surface) p-6 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="delete-account-title" className="text-xl font-semibold">
          Delete your account?
        </h2>
        <button
          type="button"
          aria-label="Cancel account deletion"
          disabled={pending}
          onClick={onClose}
          className="icon-button"
        >
          <X size={20} />
        </button>
      </div>
      <p
        id="delete-account-description"
        className="mt-3 text-sm leading-6 text-(--text-secondary)"
      >
        This permanently removes all live FeatureLogs data for{" "}
        <strong>{email}</strong>. This cannot be undone.
      </p>
      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          startTransition(async () => {
            try {
              const result = await deleteAccountAction(password, confirmation);
              if (!result.ok)
                setError(result.error || "Unable to delete account.");
              else {
                router.replace("/login?deleted=1");
                router.refresh();
              }
            } catch {
              setError("Unable to delete your account. Please try again.");
            }
          });
        }}
      >
        <PasswordField
          id="delete-account-password"
          label="Current password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          disabled={pending}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="delete-confirmation"
            className="block text-sm font-semibold"
          >
            Type DELETE to confirm
          </label>
          <input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
            disabled={pending}
            className="w-full rounded-xl border border-(--border) bg-(--surface) px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-(--danger)">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="button button-outline"
          >
            Keep my account
          </button>
          <button
            type="submit"
            disabled={pending || confirmation !== "DELETE" || !password}
            className="rounded-xl bg-(--danger) px-4 py-3 text-sm font-semibold text-(--surface) disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Deleting…" : "Permanently delete account"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
