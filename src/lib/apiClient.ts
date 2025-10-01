import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/u, "") || "";

export interface CurrentUserResponse {
  success: boolean;
  data: {
    fullname: string;
    phone: string;
    email: string;
    hasTransactionPin: boolean;
    hasWallet: boolean;
    bvnVerified: boolean;
  };
}

// Account details endpoint response shape
export interface AccountDetailsResponse {
  success: boolean;
  data: {
    account_number: string;
    account_status: string; // e.g. ACTIVE
    amount: number; // raw minor or major units? Assuming major units from example
    bank_name: string;
  };
}

// Transaction summary stats (period based) response shape
export interface TransactionSummaryResponse {
  success: boolean;
  message?: string;
  data: {
    period: number; // days covered, e.g. 30
    summary: {
      total: number;
      completed: number;
      failed: number;
      pending: number;
      totalAmount: string; // keeping as string to avoid precision issues
    };
  };
}

export async function fetchCurrentUser(
  token: string,
): Promise<CurrentUserResponse> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const res = await fetch(`${API_BASE}/accounts/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch user (${res.status}): ${text}`);
  }
  return (await res.json()) as CurrentUserResponse;
}

export async function fetchAccountDetails(
  token: string,
): Promise<AccountDetailsResponse> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const res = await fetch(`${API_BASE}/accounts/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch account details (${res.status}): ${text}`);
  }
  return (await res.json()) as AccountDetailsResponse;
}

export async function fetchTransactionSummary(
  token: string,
): Promise<TransactionSummaryResponse> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const res = await fetch(`${API_BASE}/transactions/stats/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch transaction summary (${res.status}): ${text}`,
    );
  }
  return (await res.json()) as TransactionSummaryResponse;
}

// Small client hook to load current user profile once authenticated.
export function useCurrentUserProfile() {
  const { getIdToken, user } = useAuth();
  const [profile, setProfile] = useState<CurrentUserResponse["data"] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) throw new Error("No auth token available");
        const result = await fetchCurrentUser(token);
        if (!cancelled) setProfile(result.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [getIdToken, user]);

  return { profile, loading, error };
}

// Hook for account details
export function useAccountDetails() {
  const { getIdToken, user } = useAuth();
  const [data, setData] = useState<AccountDetailsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) throw new Error("No auth token available");
        const result = await fetchAccountDetails(token);
        if (!cancelled) setData(result.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [getIdToken, user]);

  return { details: data, loading, error };
}

// Hook for transaction summary statistics
export function useTransactionSummary() {
  const { getIdToken, user } = useAuth();
  const [data, setData] = useState<TransactionSummaryResponse["data"] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) throw new Error("No auth token available");
        const result = await fetchTransactionSummary(token);
        if (!cancelled) setData(result.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [getIdToken, user]);

  return { summary: data, loading, error };
}
