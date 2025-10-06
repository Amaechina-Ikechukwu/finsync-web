"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type CryptoCoin,
  type CryptoSellEstimateResponse,
  type CryptoBuyEnhancedResponse,
  fetchCryptoSellEstimate,
  createCryptoBuyOrder,
  useCryptoCoins,
} from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { formatCurrencyDetailed } from "@/lib/format";
import AppButton from "@/components/AppButton";

type CopyScope = "buy" | "sell";

type ConfirmationModalState =
  | {
      kind: "buy";
      response: CryptoBuyEnhancedResponse;
      coin: CryptoCoin | null;
      adminWalletAddress: string;
    }
  | {
      kind: "sell";
      response: CryptoSellEstimateResponse;
      coin: CryptoCoin | null;
    };

export default function CryptoPage() {
  const { getIdToken, user } = useAuth();
  const { coins, loading, error } = useCryptoCoins();

  // Single coin selection across flows
  const [selectedCoinId, setSelectedCoinId] = useState<string>("");
  // Flow mode
  const [mode, setMode] = useState<CopyScope>("buy");
  const [buyAmountNaira, setBuyAmountNaira] = useState<string>("");
  const [buyWalletAddress, setBuyWalletAddress] = useState<string>("");
  const [buyFormError, setBuyFormError] = useState<string | null>(null);
  const [buyConfirmLoading, setBuyConfirmLoading] = useState(false);
  const [sellAmountCrypto, setSellAmountCrypto] = useState<string>("");

  const [sellEstimate, setSellEstimate] =
    useState<CryptoSellEstimateResponse | null>(null);
  const [sellEstimateLoading, setSellEstimateLoading] = useState(false);
  const [sellEstimateError, setSellEstimateError] = useState<string | null>(
    null,
  );

  const [copyMessage, setCopyMessage] = useState<{
    scope: CopyScope;
    message: string;
  } | null>(null);
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const sellEstimateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!coins || coins.length === 0) return;
    setSelectedCoinId((prev) => (prev ? prev : (coins[0]?.id ?? "")));
  }, [coins]);

  const selectedCoin = useMemo<CryptoCoin | null>(
    () => coins?.find((coin) => coin.id === selectedCoinId) ?? null,
    [coins, selectedCoinId],
  );

  const buyEstimateCrypto = useMemo(() => {
    if (!selectedCoin) return null;
    const amount = Number.parseFloat(buyAmountNaira);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    if (selectedCoin.current_price_naira <= 0) return null;
    const rawEstimate = amount / selectedCoin.current_price_naira;
    return rawEstimate;
  }, [buyAmountNaira, selectedCoin]);

  const resetCopyMessage = useCallback(() => {
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
    setCopyMessage(null);
  }, []);

  const handleModeChange = useCallback(
    (nextMode: CopyScope) => {
      setMode(nextMode);
      setBuyAmountNaira("");
      setBuyWalletAddress("");
      setBuyFormError(null);
      setBuyConfirmLoading(false);
      setSellAmountCrypto("");
      setSellEstimate(null);
      setSellEstimateError(null);
      setConfirmationModal(null);
      resetCopyMessage();
    },
    [resetCopyMessage],
  );

  const handleBuyConfirm = useCallback(async () => {
    if (!buyEstimateCrypto) return;
    const trimmedAmount = buyAmountNaira.trim();
    const trimmedAddress = buyWalletAddress.trim();
    if (!selectedCoinId) {
      setBuyFormError("Select the coin you want to buy.");
      return;
    }
    if (!trimmedAmount) {
      setBuyFormError("Enter how much you want to buy in naira.");
      return;
    }
    const amountNumber = Number.parseFloat(trimmedAmount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setBuyFormError("Enter a valid amount in naira.");
      return;
    }
    if (!trimmedAddress) {
      setBuyFormError(
        "Enter the wallet address where FinSync should send your crypto.",
      );
      return;
    }
    if (!user) {
      setBuyFormError("You need to be signed in to create a buy request.");
      return;
    }

    setBuyFormError(null);
    setBuyConfirmLoading(true);
    try {
      const token = await getIdToken(true);
      if (!token) throw new Error("No auth token available");

      const response = await createCryptoBuyOrder(token, {
        coinId: selectedCoinId,
        amountInNaira: trimmedAmount,
        userWalletAddress: trimmedAddress,
      });

      setConfirmationModal({
        kind: "buy",
        response,
        coin: selectedCoin,
        adminWalletAddress: selectedCoin?.address ?? "",
      });
      resetCopyMessage();
    } catch (e) {
      setBuyFormError(
        e instanceof Error
          ? e.message
          : "Failed to create buy request. Please try again.",
      );
    } finally {
      setBuyConfirmLoading(false);
    }
  }, [
    buyAmountNaira,
    buyEstimateCrypto,
    buyWalletAddress,
    getIdToken,
    resetCopyMessage,
    selectedCoin,
    selectedCoinId,
    user,
  ]);

  const handleSellConfirm = useCallback(() => {
    if (!sellEstimate) return;
    setConfirmationModal({
      kind: "sell",
      response: sellEstimate,
      coin: selectedCoin,
    });
    resetCopyMessage();
  }, [resetCopyMessage, sellEstimate, selectedCoin]);

  const handleCopy = async (text: string, scope: CopyScope) => {
    resetCopyMessage();
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage({ scope, message: "Address copied to clipboard." });
    } catch {
      setCopyMessage({
        scope,
        message: "Unable to copy address. Please copy manually.",
      });
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyMessage(null);
      copyTimeoutRef.current = null;
    }, 3000);
  };

  const closeModal = useCallback(() => {
    setConfirmationModal(null);
    resetCopyMessage();
  }, [resetCopyMessage]);

  useEffect(() => {
    if (!confirmationModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, confirmationModal]);

  useEffect(() => {
    if (mode !== "sell") {
      if (sellEstimateTimeoutRef.current) {
        window.clearTimeout(sellEstimateTimeoutRef.current);
        sellEstimateTimeoutRef.current = null;
      }
      setSellEstimateLoading(false);
      return;
    }

    const trimmedAmount = sellAmountCrypto.trim();
    if (!trimmedAmount) {
      if (sellEstimateTimeoutRef.current) {
        window.clearTimeout(sellEstimateTimeoutRef.current);
        sellEstimateTimeoutRef.current = null;
      }
      setSellEstimate(null);
      setSellEstimateError(null);
      setSellEstimateLoading(false);
      return;
    }

    if (!selectedCoinId) {
      if (sellEstimateTimeoutRef.current) {
        window.clearTimeout(sellEstimateTimeoutRef.current);
        sellEstimateTimeoutRef.current = null;
      }
      setSellEstimate(null);
      setSellEstimateError("Please select a coin to sell.");
      setSellEstimateLoading(false);
      return;
    }

    const parsedAmount = Number.parseFloat(trimmedAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      if (sellEstimateTimeoutRef.current) {
        window.clearTimeout(sellEstimateTimeoutRef.current);
        sellEstimateTimeoutRef.current = null;
      }
      setSellEstimate(null);
      setSellEstimateError("Enter a valid crypto amount.");
      setSellEstimateLoading(false);
      return;
    }

    if (!user) {
      if (sellEstimateTimeoutRef.current) {
        window.clearTimeout(sellEstimateTimeoutRef.current);
        sellEstimateTimeoutRef.current = null;
      }
      setSellEstimate(null);
      setSellEstimateError("You need to be signed in to request an estimate.");
      setSellEstimateLoading(false);
      return;
    }

    if (sellEstimateTimeoutRef.current) {
      window.clearTimeout(sellEstimateTimeoutRef.current);
      sellEstimateTimeoutRef.current = null;
    }

    setSellEstimateError(null);
    setSellEstimateLoading(true);

    let cancelled = false;

    sellEstimateTimeoutRef.current = window.setTimeout(() => {
      const run = async () => {
        try {
          const token = await getIdToken(true);
          if (!token) throw new Error("No auth token available");
          const estimate = await fetchCryptoSellEstimate(token, {
            coinId: selectedCoinId,
            cryptoAmount: trimmedAmount,
          });
          if (!cancelled) {
            setSellEstimate(estimate);
            setConfirmationModal(null);
            resetCopyMessage();
          }
        } catch (e) {
          if (!cancelled) {
            setSellEstimate(null);
            setSellEstimateError(
              e instanceof Error ? e.message : "Failed to estimate sell value",
            );
          }
        } finally {
          if (!cancelled) {
            setSellEstimateLoading(false);
          }
        }
      };
      void run();
      sellEstimateTimeoutRef.current = null;
    }, 600);

    return () => {
      cancelled = true;
      if (sellEstimateTimeoutRef.current) {
        window.clearTimeout(sellEstimateTimeoutRef.current);
        sellEstimateTimeoutRef.current = null;
      }
    };
  }, [
    sellAmountCrypto,
    selectedCoinId,
    mode,
    user,
    getIdToken,
    resetCopyMessage,
  ]);

  useEffect(() => () => resetCopyMessage(), [resetCopyMessage]);

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Crypto</h2>
        <p className="text-sm text-neutral-600 max-w-prose">
          Buy and sell supported digital assets with instant on/off-ramp quotes.
          Select a coin, review the estimate, and follow the wallet address
          instructions to complete your trade with an admin.
        </p>
      </header>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {(["buy", "sell"] as const).map((scope) => {
          const isActive = mode === scope;
          return (
            <button
              type="button"
              key={scope}
              onClick={() => handleModeChange(scope)}
              aria-pressed={isActive}
              className={`relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
                isActive
                  ? "bg-black text-white shadow"
                  : "bg-neutral-200/70 text-neutral-700 hover:bg-neutral-300"
              }`}
            >
              {scope.toUpperCase()}
            </button>
          );
        })}
      </div>
      <section className="rounded-2xl border border-black/10 bg-white/70 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.26em] text-neutral-500">
          Select Asset & Action
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          Choose a coin and whether you want to buy or sell. Details will appear
          below.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="coin-select"
              className="block text-xs font-semibold uppercase tracking-wide text-neutral-500"
            >
              Coin
              <div className="mt-1">
                {loading ? (
                  <div className="py-2">
                    <Loader size={32} speed={1.4} message="" />
                  </div>
                ) : error ? (
                  <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                ) : (
                  <select
                    id="coin-select"
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedCoinId}
                    onChange={(e) => {
                      setSelectedCoinId(e.target.value);
                      // Reset estimates/inputs when switching coins
                      setBuyAmountNaira("");
                      setBuyWalletAddress("");
                      setBuyFormError(null);
                      setSellAmountCrypto("");
                      setSellEstimate(null);
                      setSellEstimateError(null);
                      setBuyConfirmLoading(false);
                      setConfirmationModal(null);
                      resetCopyMessage();
                    }}
                  >
                    {coins?.map((coin) => (
                      <option key={coin.id} value={coin.id}>
                        {coin.name} • {coin.network}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Action
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-1">
        {mode === "buy" && (
          <article className="rounded-2xl border border-black/10 bg-white/70 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.26em] text-neutral-500">
              Buy Crypto
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Choose a coin and enter the amount (in naira) you want to
              purchase. Share the request with an admin and send proof of
              payment. You&apos;ll see FinSync&apos;s wallet details after
              confirming your request.
            </p>
            <div className="mt-5 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Amount (₦)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter amount in naira"
                  value={buyAmountNaira}
                  onChange={(event) => {
                    setBuyAmountNaira(event.target.value);
                    setBuyFormError(null);
                    setBuyConfirmLoading(false);
                    setConfirmationModal(null);
                    resetCopyMessage();
                  }}
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Your wallet address
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Paste the ${selectedCoin?.symbol ?? "crypto"} address where you want to receive funds`}
                  value={buyWalletAddress}
                  onChange={(event) => {
                    setBuyWalletAddress(event.target.value);
                    setBuyFormError(null);
                    setConfirmationModal(null);
                    resetCopyMessage();
                  }}
                />
                <span className="mt-1 block text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                  Double-check the network and address before submitting.
                </span>
              </label>
              {selectedCoin && (
                <div className="rounded-lg border border-dashed border-black/10 bg-white/80 px-4 py-3 text-sm text-neutral-700">
                  <p>
                    <span className="font-semibold">Live rate:</span>{" "}
                    {formatCurrencyDetailed(
                      selectedCoin.current_price_naira,
                      "NGN",
                      "en-NG",
                    )}{" "}
                    per {selectedCoin.symbol}
                  </p>
                  {buyEstimateCrypto !== null ? (
                    <p className="mt-2">
                      You&apos;ll receive approximately{" "}
                      <span className="font-semibold">
                        {buyEstimateCrypto.toFixed(
                          Math.min(selectedCoin.decimals, 6),
                        )}{" "}
                        {selectedCoin.symbol}
                      </span>{" "}
                      on confirmation.
                    </p>
                  ) : (
                    <p className="mt-2 text-neutral-500">
                      Enter an amount to see the crypto estimate.
                    </p>
                  )}
                </div>
              )}
              <AppButton
                type="button"
                size="sm"
                variant="primary"
                className="w-full sm:w-auto font-semibold"
                onClick={handleBuyConfirm}
                disabled={!buyEstimateCrypto || buyConfirmLoading}
                loading={buyConfirmLoading}
              >
                Confirm buy request
              </AppButton>
              {buyFormError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {buyFormError}
                </div>
              )}
            </div>
          </article>
        )}

        {mode === "sell" && (
          <article className="rounded-2xl border border-black/10 bg-white/70 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.26em] text-neutral-500">
              Sell Crypto
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Select the coin you&apos;re selling, provide the crypto amount,
              then confirm to reveal FinSync&apos;s wallet instructions. Admins
              will credit your naira balance once the transfer is confirmed.
            </p>
            <div className="mt-5 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Crypto amount
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Enter amount in ${selectedCoin?.symbol ?? "crypto"}`}
                  value={sellAmountCrypto}
                  onChange={(event) => {
                    setSellAmountCrypto(event.target.value);
                    setConfirmationModal(null);
                    resetCopyMessage();
                  }}
                />
              </label>
              {sellEstimateLoading && (
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                  Updating sell estimate…
                </div>
              )}
              {!sellEstimateLoading &&
                !sellEstimateError &&
                sellAmountCrypto.trim() === "" && (
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    Enter an amount to see the latest naira estimate.
                  </p>
                )}
              {sellEstimateError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {sellEstimateError}
                </div>
              )}

              <div className="rounded-lg border border-dashed border-black/10 bg-white/80 px-4 py-3 text-sm text-neutral-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Wallet address
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  You&apos;ll receive the exact FinSync wallet address once you
                  confirm this sell request.
                </p>
              </div>

              {sellEstimate && (
                <div className="rounded-lg border border-black/10 bg-white/90 px-4 py-3 text-sm text-neutral-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Sell estimate
                  </p>
                  <dl className="mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <dt>Crypto amount</dt>
                      <dd className="font-semibold text-neutral-800">
                        {sellEstimate.crypto_amount}{" "}
                        {selectedCoin?.symbol ?? ""}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Current rate</dt>
                      <dd className="font-semibold text-neutral-800">
                        {formatCurrencyDetailed(
                          sellEstimate.current_rate,
                          "NGN",
                          "en-NG",
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Gross amount</dt>
                      <dd className="font-semibold text-neutral-800">
                        {formatCurrencyDetailed(
                          sellEstimate.gross_amount,
                          "NGN",
                          "en-NG",
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Service charge</dt>
                      <dd className="font-semibold text-neutral-800">
                        {formatCurrencyDetailed(
                          sellEstimate.service_charge,
                          "NGN",
                          "en-NG",
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Net amount</dt>
                      <dd className="font-semibold text-neutral-800">
                        {formatCurrencyDetailed(
                          sellEstimate.net_amount,
                          "NGN",
                          "en-NG",
                        )}
                      </dd>
                    </div>
                  </dl>
                  {sellEstimate.note && (
                    <p className="mt-3 text-xs text-neutral-500">
                      {sellEstimate.note}
                    </p>
                  )}
                </div>
              )}
              {sellEstimate && (
                <AppButton
                  type="button"
                  size="sm"
                  variant="primary"
                  className="w-full sm:w-auto font-semibold"
                  onClick={handleSellConfirm}
                  disabled={sellEstimateLoading}
                >
                  Confirm sell request
                </AppButton>
              )}
            </div>
          </article>
        )}
      </section>

      {confirmationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-black/10 px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-neutral-500">
                  {confirmationModal.kind === "buy"
                    ? "Buy request"
                    : "Sell request"}
                </p>
                <h4 className="mt-1 text-base font-semibold text-neutral-900">
                  {confirmationModal.kind === "buy"
                    ? "Share payment details with FinSync"
                    : "Send assets to the provided wallet"}
                </h4>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
                onClick={closeModal}
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            <div className="space-y-5 px-6 py-5 text-sm text-neutral-700">
              {confirmationModal.kind === "buy" &&
                (() => {
                  const { response, coin, adminWalletAddress } =
                    confirmationModal;
                  const decimals = Math.min(coin?.decimals ?? 6, 6);
                  const cryptoAmountNumber = Number(response.crypto_amount);
                  const formattedCryptoAmount = Number.isFinite(
                    cryptoAmountNumber,
                  )
                    ? cryptoAmountNumber.toFixed(decimals)
                    : String(response.crypto_amount);
                  return (
                    <>
                      <p className="text-neutral-600">
                        {response.message ??
                          `Your order to buy ${formattedCryptoAmount} ${coin?.symbol ?? "crypto"} is now processing.`}
                      </p>
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Amount (₦)
                          </dt>
                          <dd className="mt-1 font-semibold text-neutral-800">
                            {formatCurrencyDetailed(
                              response.amount_naira,
                              "NGN",
                              "en-NG",
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Total deducted
                          </dt>
                          <dd className="mt-1 font-semibold text-neutral-800">
                            {formatCurrencyDetailed(
                              response.total_deducted,
                              "NGN",
                              "en-NG",
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Crypto amount
                          </dt>
                          <dd className="mt-1 font-semibold text-neutral-800">
                            {formattedCryptoAmount} {coin?.symbol ?? ""}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Exchange rate
                          </dt>
                          <dd className="mt-1 font-semibold text-neutral-800">
                            {formatCurrencyDetailed(
                              response.exchange_rate,
                              "NGN",
                              "en-NG",
                            )}
                            <span className="text-xs text-neutral-500">
                              {" "}
                              / {coin?.symbol ?? "coin"}
                            </span>
                          </dd>
                        </div>
                      </dl>

                      {adminWalletAddress && (
                        <div className="rounded-lg border border-dashed border-black/10 bg-white px-4 py-3 text-xs text-neutral-700">
                          <p className="font-semibold uppercase tracking-wide text-neutral-500">
                            FinSync wallet address
                          </p>
                          <p className="mt-2 break-all text-neutral-800">
                            {adminWalletAddress}
                          </p>
                          <button
                            type="button"
                            className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                            onClick={() =>
                              handleCopy(adminWalletAddress, "buy")
                            }
                          >
                            Copy wallet address
                          </button>
                          {copyMessage?.scope === "buy" &&
                            copyMessage?.message && (
                              <p className="mt-1 text-[11px] text-neutral-500">
                                {copyMessage.message}
                              </p>
                            )}
                        </div>
                      )}

                      <ol className="list-decimal space-y-1 pl-4 text-xs text-neutral-600">
                        <li>
                          Share this reference with a FinSync admin:{" "}
                          <span className="font-semibold text-neutral-800">
                            {response.transaction_id}
                          </span>
                          .
                        </li>
                        <li>
                          Transfer{" "}
                          {formatCurrencyDetailed(
                            response.total_deducted,
                            "NGN",
                            "en-NG",
                          )}{" "}
                          to the wallet above and keep your transaction proof.
                        </li>
                        <li>
                          Send your payment receipt and wallet address to the
                          admin for verification.
                        </li>
                        <li className="font-medium text-neutral-800">
                          Wait for FinSync to confirm the transfer before
                          considering the order complete.
                        </li>
                      </ol>

                      {response.estimated_delivery && (
                        <p className="text-xs text-neutral-500">
                          Estimated delivery: {response.estimated_delivery}
                        </p>
                      )}
                    </>
                  );
                })()}

              {confirmationModal.kind === "sell" &&
                (() => {
                  const { response, coin } = confirmationModal;
                  const cryptoAmountNumber = Number(response.crypto_amount);
                  const decimals = Math.min(coin?.decimals ?? 6, 6);
                  const formattedCryptoAmount = Number.isFinite(
                    cryptoAmountNumber,
                  )
                    ? cryptoAmountNumber.toFixed(decimals)
                    : String(response.crypto_amount);
                  return (
                    <>
                      <p className="text-neutral-600">
                        Share the wallet address below with your crypto platform
                        and send the assets. FinSync will credit your naira
                        balance once the transfer is confirmed.
                      </p>
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Crypto amount
                          </dt>
                          <dd className="mt-1 font-semibold text-neutral-800">
                            {formattedCryptoAmount} {coin?.symbol ?? ""}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Net amount (₦)
                          </dt>
                          <dd className="mt-1 font-semibold text-neutral-800">
                            {formatCurrencyDetailed(
                              response.net_amount,
                              "NGN",
                              "en-NG",
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Service charge
                          </dt>
                          <dd className="mt-1 font-semibold text-neutral-800">
                            {formatCurrencyDetailed(
                              response.service_charge,
                              "NGN",
                              "en-NG",
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Current rate
                          </dt>
                          <dd className="mt-1 font-semibold text-neutral-800">
                            {formatCurrencyDetailed(
                              response.current_rate,
                              "NGN",
                              "en-NG",
                            )}
                            <span className="text-xs text-neutral-500">
                              {" "}
                              / {coin?.symbol ?? "coin"}
                            </span>
                          </dd>
                        </div>
                      </dl>

                      <div className="rounded-lg border border-dashed border-black/10 bg-white px-4 py-3 text-xs text-neutral-700">
                        <p className="font-semibold uppercase tracking-wide text-neutral-500">
                          FinSync wallet address
                        </p>
                        <p className="mt-2 break-all text-neutral-800">
                          {response.our_wallet_address}
                        </p>
                        <button
                          type="button"
                          className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                          onClick={() =>
                            handleCopy(response.our_wallet_address, "sell")
                          }
                        >
                          Copy wallet address
                        </button>
                        {copyMessage?.scope === "sell" &&
                          copyMessage?.message && (
                            <p className="mt-1 text-[11px] text-neutral-500">
                              {copyMessage.message}
                            </p>
                          )}
                        <dl className="mt-3 space-y-1 text-neutral-600">
                          <div className="flex items-center justify-between">
                            <dt>Minimum amount</dt>
                            <dd className="font-semibold text-neutral-800">
                              {response.minimum_amount} {coin?.symbol ?? ""}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <ol className="list-decimal space-y-1 pl-4 text-xs text-neutral-600">
                        <li>
                          Send the crypto to the wallet above and keep the
                          transaction hash handy.
                        </li>
                        <li>
                          Share the hash/proof with a FinSync admin immediately
                          after sending.
                        </li>
                        <li>
                          Retain your reference until the naira equivalent hits
                          your balance.
                        </li>
                        <li className="font-medium text-neutral-800">
                          Wait for a confirmation message from FinSync before
                          considering the trade complete.
                        </li>
                      </ol>

                      {response.note && (
                        <p className="text-lg text-neutral-700 font-bold">
                          {response.note}
                        </p>
                      )}
                    </>
                  );
                })()}
            </div>

            <div className="border-t border-black/10 bg-neutral-50 px-6 py-4 text-right">
              <AppButton
                type="button"
                variant="primary"
                size="sm"
                onClick={closeModal}
              >
                Done
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
