"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchBanks,
  resolveAccount,
  createPaystackRecipient,
  initiatePaystackTransfer,
} from "@/lib/apiClient";
import type { BankItem } from "@/lib/apiClient";
import Image from "next/image";
import AppButton from "@/components/AppButton";
import Loader from "@/components/Loader";
import { useToast } from "@/components/toast/ToastProvider";

export default function TransfersPage() {
  const { getIdToken } = useAuth();
  const { push } = useToast();
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [pin, setPin] = useState("");
  const [recipientCode, setRecipientCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingBanks(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) throw new Error("Not authenticated");
        const items = await fetchBanks(token);
        if (mounted) {
          setBanks(items);
          if (items.length > 0) setBankCode(items[0].code || "");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        push({
          variant: "error",
          title: "Unable to load banks",
          description: msg,
        });
      } finally {
        if (mounted) setLoadingBanks(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [getIdToken, push]);

  // auto-verify when both bank and account number are present
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!accountNumber || !bankCode) {
        setResolvedName(null);
        return;
      }
      setVerifying(true);
      try {
        const token = await getIdToken();
        if (!token) throw new Error("Not authenticated");
        const res = await resolveAccount(token, {
          account_number: accountNumber,
          account_bank: bankCode,
        });
        if (cancelled) return;
        interface ResolvedInner {
          account_name?: string;
          accountName?: string;
          [kk: string]: unknown;
        }
        let unwrapped: unknown = res.data;
        if (unwrapped && typeof unwrapped === "object" && "data" in unwrapped) {
          unwrapped = (unwrapped as { data: unknown }).data;
        }
        const inner =
          unwrapped && typeof unwrapped === "object"
            ? (unwrapped as ResolvedInner)
            : undefined;
        const name = inner
          ? (inner.account_name ?? inner.accountName ?? null)
          : null;
        setResolvedName(name ?? null);
      } catch (e: unknown) {
        if (!cancelled) {
          setResolvedName(null);
          const msg = e instanceof Error ? e.message : String(e);
          push({
            variant: "error",
            title: "Account verify failed",
            description: msg,
          });
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    };
    const id = window.setTimeout(() => void run(), 450);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [accountNumber, bankCode, getIdToken, push]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");
      if (!bankCode) throw new Error("Please select a bank");
      if (!accountNumber) throw new Error("Enter an account number");
      if (!amount) throw new Error("Enter an amount");
      if (!pin) throw new Error("Enter your transaction PIN");

      const name = resolvedName || "Recipient";
      const rec = await createPaystackRecipient(token, {
        account_number: accountNumber,
        bank_code: bankCode,
        name,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rc =
        (rec as any)?.data?.recipient_code ||
        (rec as any)?.recipient_code ||
        recipientCode;
      if (!rc) throw new Error("Could not obtain recipient code");
      setRecipientCode(rc);

      const res2 = await initiatePaystackTransfer(token, {
        amount,
        pin,
        recipient_code: rc,
      });
      setSuccessMessage(res2.message || "Transfer initiated");
      push({
        variant: "success",
        title: "Transfer initiated",
        description: res2.message || "Request sent",
      });
      setAccountNumber("");
      setAmount("");
      setPin("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      push({ variant: "error", title: "Transfer failed", description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Bank Transfer</h1>

      {error && (
        <div className="mb-4 text-red-700" role="alert">
          Error: {error}
        </div>
      )}
      {successMessage && (
        <p className="mb-4 text-green-700">{successMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bank-picker" className="block text-sm font-medium">
            Bank
          </label>
          {loadingBanks ? (
            <div className="text-sm text-gray-500">
              <Loader size={40} message="Loading banks" />
            </div>
          ) : (
            <>
              <button
                type="button"
                id="bank-picker"
                onClick={() => setBankModalOpen(true)}
                className="w-full text-left rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {banks.find((b) => (b.code || b.slug || b.name) === bankCode)
                  ?.name ?? "Select bank"}
              </button>
              {bankModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <button
                    type="button"
                    aria-label="Close"
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setBankModalOpen(false)}
                  />
                  <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[80vh]">
                    <div className="mb-3">
                      <input
                        id="bank-search"
                        type="text"
                        value={bankQuery}
                        onChange={(e) => setBankQuery(e.target.value)}
                        placeholder="Search banks"
                        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                      />
                    </div>
                    <div
                      className="space-y-2 overflow-y-auto"
                      style={{ maxHeight: 400 }}
                    >
                      {(bankQuery.trim()
                        ? banks.filter(
                            (b) =>
                              (b.name || "")
                                .toLowerCase()
                                .includes(bankQuery.toLowerCase()) ||
                              (b.code || "").includes(bankQuery),
                          )
                        : banks
                      ).map((b) => (
                        <button
                          key={b.code || b.slug || b.name}
                          type="button"
                          onClick={() => {
                            setBankCode(b.code || b.slug || b.name);
                            setBankModalOpen(false);
                            setBankQuery("");
                          }}
                          className="w-full text-left rounded-md border border-black/10 p-3 hover:bg-neutral-50 flex items-center gap-3"
                        >
                          {b.logo ? (
                            <Image
                              src={String(b.logo)}
                              alt={b.name}
                              width={32}
                              height={32}
                              className="rounded-sm object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-sm bg-neutral-100" />
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-medium">{b.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium">
            Account number
          </label>
          <input
            value={accountNumber}
            id="accountNumber"
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 0123456789"
            inputMode="numeric"
          />
          {verifying ? (
            <div className="mt-2 text-sm text-neutral-600 flex items-center gap-2">
              <Loader size={20} message="" />
              <span>Verifying account</span>
            </div>
          ) : resolvedName ? (
            <div className="mt-2 text-sm text-neutral-700">
              Account name: <span className="font-medium">{resolvedName}</span>
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium">
            Amount
          </label>
          <input
            value={amount}
            id="amount"
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 5000"
            inputMode="decimal"
          />
        </div>

        <div>
          <label htmlFor="pin" className="block text-sm font-medium">
            Transaction PIN
          </label>
          <input
            id="pin"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your 4-5 digit PIN"
            inputMode="numeric"
          />
        </div>

        <div>
          <AppButton type="submit" loading={submitting} size="md">
            Initiate Transfer
          </AppButton>
        </div>
      </form>
    </div>
  );
}
