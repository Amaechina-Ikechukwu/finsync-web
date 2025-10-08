"use client";
import { useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import { setTransactionPin } from "@/lib/apiClient";
import AppButton from "@/components/AppButton";

export default function SetTransactionPinModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { push } = useToast();
  const { getIdToken } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"edit" | "confirm">("edit");

  const submit = async () => {
    // Enforce exact 4-digit PIN and require confirmation match
    if (!/^[0-9]{4}$/.test(pin)) {
      push({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "error",
      });
      return;
    }
    if (pin !== confirmPin) {
      push({
        title: "PIN mismatch",
        description: "PIN and confirmation do not match.",
        variant: "error",
      });
      return;
    }
    // Advance to confirm stage so we can show an in-modal confirmation
    setStage("confirm");
    return;
  };

  const confirmAndSet = async () => {
    setLoading(true);
    try {
      const token = await getIdToken(true);
      if (!token) throw new Error("Not authenticated");
      await setTransactionPin(token, pin);
      push({
        title: "PIN set",
        description: "Your transaction PIN was set successfully.",
        variant: "success",
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      push({
        title: "Failed to set PIN",
        description: message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop intentionally non-interactive so users cannot dismiss without setting PIN */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Set Transaction PIN</h3>
        <p className="text-sm text-neutral-700 mb-4">
          For security, set a 4-digit transaction PIN to approve transfers. You
          won't be able to proceed until you set it.
        </p>
        <label className="block">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full rounded-md border border-black/10 px-3 py-2 mb-3"
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            disabled={loading}
          />
        </label>
        <label className="block">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={confirmPin}
            onChange={(e) =>
              setConfirmPin(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full rounded-md border border-black/10 px-3 py-2 mb-3"
            placeholder="Confirm PIN"
            maxLength={4}
            disabled={loading}
          />
        </label>
        {stage === "edit" ? (
          <div className="flex justify-end gap-2">
            <AppButton
              type="button"
              variant="primary"
              size="sm"
              onClick={submit}
              loading={loading}
            >
              Review
            </AppButton>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-neutral-700">
              Please confirm you want to set this PIN. You will need it to
              approve transfers.
            </p>
            <div className="flex justify-end gap-2">
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStage("edit")}
                disabled={loading}
              >
                Back
              </AppButton>
              <AppButton
                type="button"
                variant="primary"
                size="sm"
                onClick={confirmAndSet}
                loading={loading}
              >
                Confirm & Set PIN
              </AppButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
