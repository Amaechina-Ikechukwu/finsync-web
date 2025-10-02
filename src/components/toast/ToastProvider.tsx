"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number; // default 4500
  actionLabel?: string;
  onAction?: () => void;
}

interface InternalToast extends Required<Pick<ToastOptions, "id" | "variant">> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  expiresAt: number;
}

interface ToastContextValue {
  push: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function ToastProvider({ children, position = "bottom-right" }: ToastProviderProps) {
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const counterRef = useRef(0);

  const push = useCallback((opts: ToastOptions) => {
    const id = opts.id || `toast_${Date.now()}_${counterRef.current++}`;
    const duration = opts.durationMs ?? 4500;
    const now = Date.now();
    setToasts((t) => [
      ...t,
      {
        id,
        variant: opts.variant || "info",
        title: opts.title,
        description: opts.description,
        actionLabel: opts.actionLabel,
        onAction: opts.onAction,
        expiresAt: now + duration,
      },
    ]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Auto garbage collect expired toasts
  useEffect(() => {
    if (!toasts.length) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setToasts((t) => t.filter((x) => x.expiresAt > now));
    }, 1000);
    return () => clearInterval(interval);
  }, [toasts.length]);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

function variantStyles(v: ToastVariant) {
  switch (v) {
    case "success":
      return "border-emerald-500/30 bg-emerald-50 text-emerald-800";
    case "error":
      return "border-rose-500/30 bg-rose-50 text-rose-700";
    case "warning":
      return "border-amber-500/30 bg-amber-50 text-amber-700";
    default:
      return "border-neutral-300 bg-white text-neutral-800";
  }
}

function ToastViewport({ toasts, onDismiss, position }: { toasts: InternalToast[]; onDismiss: (id: string) => void; position: "top-right" | "top-left" | "bottom-right" | "bottom-left"; }) {
  let layout = "items-end";
  let pos = "top-0 right-0";
  if (position.includes("bottom")) pos = pos.replace("top-0", "bottom-0");
  if (position.includes("left")) pos = pos.replace("right-0", "left-0");
  return (
    <div className={`pointer-events-none fixed ${pos} z-[100] flex max-h-full flex-col ${layout} gap-3 p-4 sm:p-6`}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border p-4 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition-all ${variantStyles(t.variant)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-1">
              {t.title && <p className="text-sm font-semibold leading-snug">{t.title}</p>}
              {t.description && <p className="text-xs leading-snug opacity-90">{t.description}</p>}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => onDismiss(t.id)}
              className="rounded-md p-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 hover:bg-black/5 hover:text-neutral-700"
            >
              ×
            </button>
          </div>
          {t.actionLabel && t.onAction && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  onDismiss(t.id);
                }}
                className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
              >
                {t.actionLabel}
              </button>
            </div>
          )}
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-fuchsia-500 via-amber-500 to-emerald-500 opacity-40" />
        </div>
      ))}
    </div>
  );
}
