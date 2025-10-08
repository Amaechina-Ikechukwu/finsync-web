"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchBanks, initiateTransfer } from "@/lib/apiClient";
import type { BankItem, InitiateTransferRequest } from "@/lib/apiClient";

export default function TransfersPage() {
  const { getIdToken } = useAuth();
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
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
      } finally {
        if (mounted) setLoadingBanks(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");
      const payload: InitiateTransferRequest = {
        account_number: accountNumber,
        account_bank: bankCode,
        amount,
        currency,
      };
      const res = await initiateTransfer(token, payload);
      if (res === null) {
        setSuccessMessage("Transfer initiated (no response body)");
      } else {
        setSuccessMessage(res.message || "Transfer initiated");
      }
      setAccountNumber("");
      setAmount("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Bank Transfer</h1>

      {error && <div className="mb-4 text-red-700">Error: {error}</div>}
      {successMessage && (
        <div className="mb-4 text-green-700">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bank" className="block text-sm font-medium">
            Bank
          </label>
          {loadingBanks ? (
            <div className="text-sm text-gray-500">Loading banks...</div>
          ) : (
            <select
              id="bank"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {banks.map((b) => (
                <option
                  key={b.code || b.slug || b.name}
                  value={b.code || b.slug || b.name}
                >
                  {b.name} {b.code ? `(${b.code})` : ""}
                </option>
              ))}
            </select>
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
            className="w-full p-2 border rounded"
            placeholder="e.g. 0123456789"
            inputMode="numeric"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium">
            Amount
          </label>
          <input
            value={amount}
            id="amount"
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. 5000"
            inputMode="decimal"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium">
            Currency
          </label>
          <input
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Initiate Transfer"}
          </button>
        </div>
      </form>
    </div>
  );
}
