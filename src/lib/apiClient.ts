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

// Recent transactions response types
export interface TransactionItem {
  id: string; // canonical internal id
  transactionId: string; // may duplicate id per API example
  amount: number; // raw numeric amount (units defined by backend)
  type: string; // e.g. "card", "wallet", etc.
  status: string; // e.g. "refunded", "completed"
  description: string;
  createdAt: string; // ISO timestamp
  // Add any optional fields defensively; using index signature for forward compatibility
  [key: string]: unknown;
}

export interface RecentTransactionsResponse {
  success: boolean;
  message?: string;
  data: TransactionItem[];
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

// Notification response shapes
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string; // e.g. "transaction"
  isRead: boolean;
  createdAt: string; // ISO timestamp
  userId?: string;
  data?: {
    amount?: number;
    description?: string;
    status?: string;
    transactionId?: string;
    transactionType?: string;
    // forward compatibility
    [key: string]: unknown;
  };
  [key: string]: unknown; // forward compatibility top-level
}

export interface NotificationsResponse {
  success: boolean;
  message?: string;
  data: NotificationItem[] | { data: NotificationItem[] }; // support nested variant
}

export interface UnreadNotificationCountResponse {
  success: boolean;
  message?: string;
  data: { count: number } | { data: { count: number } };
}

// Card details (dollar)
export interface DollarCardDetails {
  id: number;
  user_id: number;
  card_holder_name: string;
  card_name: string;
  card_id: string;
  card_created_date: string;
  card_type: string; // 'dollar'
  card_brand: string; // e.g. Visa
  card_user_id: string;
  reference: string;
  card_status: string;
  card_number: string; // full PAN (handle securely)
  last4: string;
  cvv: string;
  expiry: string; // MM/YY
  customer_email: string;
  customer_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  billing_country: string;
  billing_city: string;
  billing_street: string;
  billing_zip_code: string;
}

export interface DollarCardDetailsResponse {
  success: boolean;
  message?: string;
  data: DollarCardDetails | { data: DollarCardDetails };
}

// Card details (naira)
export interface NairaCardDetails {
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  card_type: string; // 'virtual'
  card_brand: string;
  default_pin: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: {
    line1: string;
    city: string;
    state: string;
    country: string;
  };
}

export interface NairaCardDetailsResponse {
  success: boolean;
  message?: string;
  data: NairaCardDetails | { data: NairaCardDetails };
  card_type?: string; // extra top-level card_type per example
}

// Airtime purchase response types
export interface BuyAirtimeRequest {
  phone: string;
  amount: string | number; // backend accepts string per example
  network_id: string; // e.g. mtn
  request_id?: string; // optional client-generated reference for idempotency
}

export interface BuyAirtimeSuccessData {
  order_id: number;
  status: string; // e.g. completed-api
  product_name: string; // Airtime
  service_name: string; // MTN
  phone: string;
  amount: number;
  discount: string; // numeric string
  amount_charged: string; // numeric string
  initial_balance: string;
  final_balance: string;
  request_id: string;
  transactionRef: string;
  [key: string]: unknown; // forward compatibility
}

export interface BuyAirtimeResponse {
  success: boolean;
  message: string;
  data: BuyAirtimeSuccessData | { data: BuyAirtimeSuccessData };
}

// Electricity purchase types
export interface BuyElectricityRequest {
  customer_id: string; // meter number or account id
  service_id: string; // e.g. enugu-electric
  variation_id: string; // prepaid | postpaid (or tariff code)
  amount: number; // purchase amount
  request_id?: string; // optional idempotent reference
}

export interface BuyElectricitySuccessData {
  order_id?: number;
  status?: string;
  token?: string; // for prepaid vend
  units?: string | number; // kWh or units string
  product_name?: string;
  service_name?: string;
  customer_id?: string;
  amount?: number;
  amount_charged?: string | number;
  service_charge?: string | number;
  request_id?: string;
  transactionRef?: string;
  [key: string]: unknown;
}

export interface BuyElectricityErrorData {
  success: false;
  message: string;
  required_amount?: number;
  service_charge?: number;
  total_required?: number;
  current_balance?: number;
  [key: string]: unknown;
}

export interface BuyElectricityResponse {
  success: boolean;
  message: string;
  // When success=false, other top-level fields (required_amount, etc.) may appear
  required_amount?: number;
  service_charge?: number;
  total_required?: number;
  current_balance?: number;
  data?: BuyElectricitySuccessData | { data: BuyElectricitySuccessData };
}

// Electricity meter verification
export interface VerifyElectricityRequest {
  customer_id: string;
  service_id: string;
  variation_id?: string; // optional if required by backend to differentiate prepaid/postpaid
}

export interface VerifyElectricitySuccessData {
  service_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_address?: string;
  customer_arrears?: string | number;
  outstanding?: string | number;
  meter_number?: string;
  account_number?: string;
  district?: string;
  service_band?: string;
  min_purchase_amount?: number;
  max_purchase_amount?: number;
  business_unit?: string;
  customer_account_type?: string;
  [key: string]: unknown;
}

export interface VerifyElectricityResponse {
  success: boolean;
  message: string;
  data?: VerifyElectricitySuccessData | { data: VerifyElectricitySuccessData };
}

// Cable TV (subscription) types
export interface CableVariationItem {
  variation_id: number; // numeric id per example (2697 etc.)
  service_name: string; // e.g. GOtv
  service_id: string; // e.g. gotv
  package_bouquet: string; // e.g. Smallie
  price: string; // keeping as string to preserve formatting
  availability: string; // e.g. Available
  discounted_amount: string | null;
  discount_percentage: string | null; // e.g. "1%"
  [key: string]: unknown; // forward compatibility
}

export interface CableVariationsResponse {
  success: boolean;
  message: string;
  data: CableVariationItem[] | { data: CableVariationItem[] };
}

export interface SubscribeCableRequest {
  customer_id: string; // smartcard / iuc number
  service_id: string; // e.g. gotv, dstv, startimes
  variation_id: number; // selected plan id
  request_id?: string; // optional client reference
}

export interface SubscribeCableSuccessData {
  order_id?: number;
  status?: string; // completed-api etc.
  product_name?: string;
  service_name?: string;
  customer_id?: string;
  amount?: number | string;
  amount_charged?: number | string;
  initial_balance?: string;
  final_balance?: string;
  request_id?: string;
  transactionRef?: string;
  [key: string]: unknown;
}

export interface SubscribeCableResponse {
  success: boolean;
  message: string;
  data?: SubscribeCableSuccessData | { data: SubscribeCableSuccessData };
  // On failure the backend returns only success=false & message
}

// Helper to safely unwrap API shapes that sometimes double-nest payloads as data.data
function unwrapData<T>(maybe: unknown): T {
  // Attempt to unwrap nested { data: ... } structures up to two levels
  if (maybe && typeof maybe === "object" && Object.hasOwn(maybe, "data")) {
    const first = (maybe as { data: unknown }).data;
    if (first && typeof first === "object" && Object.hasOwn(first, "data")) {
      return (first as { data: T }).data;
    }
    return first as T;
  }
  return maybe as T;
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

// Fetch notifications list (optionally filtered by country/operator/product via body even though it's a GET)
export async function fetchNotifications(
  token: string,
  filters?: { country?: string; operator?: string; product?: string },
): Promise<NotificationItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const urlObj = new URL(`${API_BASE}/notifications`);
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v) urlObj.searchParams.set(k, v);
    });
  }
  const res = await fetch(urlObj.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch notifications (${res.status}): ${text}`);
  }
  const json = (await res.json()) as NotificationsResponse;
  const unwrapped = unwrapData<
    NotificationItem[] | { data: NotificationItem[] }
  >(json.data);
  if (Array.isArray(unwrapped)) return unwrapped;
  // otherwise it's an object with data: NotificationItem[]
  return unwrapData<NotificationItem[]>(unwrapped);
}

export async function fetchUnreadNotificationCount(
  token: string,
  filters?: { country?: string; operator?: string; product?: string },
): Promise<number> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const urlObj = new URL(`${API_BASE}/notifications/unread-count`);
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => { if (v) urlObj.searchParams.set(k, v); });
  }
  const res = await fetch(urlObj.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch unread notification count (${res.status}): ${text}`,
    );
  }
  const json = (await res.json()) as UnreadNotificationCountResponse;
  const obj = unwrapData<{ count: number } | { data: { count: number } }>(
    json.data,
  );
  const inner = unwrapData<{ count: number }>(obj);
  return inner.count;
}

// Fetch Dollar Card details
export async function fetchDollarCardDetails(
  token: string,
): Promise<DollarCardDetails | null> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/dollar-card/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    if (
      res.status === 400 &&
      /No\s+dollar\s+card\s+found/i.test(text)
    ) {
      return null;
    }
    throw new Error(`Failed to fetch dollar card details (${res.status}): ${text}`);
  }
  const json = (await res.json()) as DollarCardDetailsResponse;
  return unwrapData<DollarCardDetails>(json.data);
}

// Fetch Naira Card details
export async function fetchNairaCardDetails(
  token: string,
): Promise<NairaCardDetails | null> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/naira-card/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 400 && /No\s+naira\s+card\s+found/i.test(text)) {
      return null;
    }
    throw new Error(`Failed to fetch naira card details (${res.status}): ${text}`);
  }
  const json = (await res.json()) as NairaCardDetailsResponse;
  return unwrapData<NairaCardDetails>(json.data);
}

/**
 * Fetch recent transactions.
 * @param token Auth bearer token
 * @param limit Optional number of transactions to limit (backend default assumed if omitted)
 */
export async function fetchRecentTransactions(
  token: string,
  { limit = 5 }: { limit?: number } = {},
): Promise<RecentTransactionsResponse> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const url = new URL(`${API_BASE}/transactions/recents`);
  if (limit) url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch recent transactions (${res.status}): ${text}`,
    );
  }
  return (await res.json()) as RecentTransactionsResponse;
}

// Purchase airtime
export async function buyAirtime(
  token: string,
  payload: BuyAirtimeRequest,
): Promise<BuyAirtimeSuccessData> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/vtu/buyairtime`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    // Try to parse json error shape if possible
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      throw new Error(j.message || j.error || `Airtime purchase failed (${res.status})`);
    } catch {
      throw new Error(`Airtime purchase failed (${res.status}): ${text}`);
    }
  }
  const json = JSON.parse(text) as BuyAirtimeResponse;
  const unwrapped = unwrapData<BuyAirtimeSuccessData>(json.data);
  return unwrapped;
}

// Purchase electricity (prepaid/postpaid)
export async function buyElectricity(
  token: string,
  payload: BuyElectricityRequest,
): Promise<BuyElectricitySuccessData> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/utility/buy-electricity`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  let json: BuyElectricityResponse | null = null;
  try {
    json = JSON.parse(text) as BuyElectricityResponse;
  } catch {
    // leave json null for non-JSON error shaping
  }
  if (!res.ok || !json || json.success === false) {
    // Attempt structured error message
    if (json && json.message) {
      const parts: string[] = [json.message];
      if (json.required_amount !== undefined) {
        parts.push(
          `Need NGN ${json.total_required ?? json.required_amount} (Balance: ${json.current_balance})`,
        );
      }
      throw new Error(parts.join(" — "));
    }
    throw new Error(
      `Electricity purchase failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }
  const unwrapped = unwrapData<BuyElectricitySuccessData>(json.data!);
  return unwrapped;
}

// Verify electricity meter/account
export async function verifyElectricMeter(
  token: string,
  payload: VerifyElectricityRequest,
): Promise<VerifyElectricitySuccessData> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/utility/verify-meter`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  let json: VerifyElectricityResponse | null = null;
  try { json = JSON.parse(text) as VerifyElectricityResponse; } catch { /* ignore */ }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Verification failed (${res.status})`;
    throw new Error(msg);
  }
  return unwrapData<VerifyElectricitySuccessData>(json.data!);
}

// Fetch cable variations (plans) for a given service_id (e.g. gotv, dstv)
export async function fetchCableVariations(
  token: string,
  service_id: string,
  extra?: { customer_id?: string }, // backend example shows body with customer_id although GET
): Promise<CableVariationItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const urlObj = new URL(`${API_BASE}/cable/variations/${encodeURIComponent(service_id)}`);
  if (extra?.customer_id) urlObj.searchParams.set("customer_id", extra.customer_id);
  const res = await fetch(urlObj.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    // attempt JSON message
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(j.message || `Failed to fetch cable variations (${res.status})`);
    } catch {
      throw new Error(`Failed to fetch cable variations (${res.status}): ${text.slice(0, 120)}`);
    }
  }
  let json: CableVariationsResponse;
  try { json = JSON.parse(text) as CableVariationsResponse; } catch { throw new Error("Invalid variations JSON"); }
  const unwrapped = unwrapData<CableVariationItem[] | { data: CableVariationItem[] }>(json.data);
  if (Array.isArray(unwrapped)) return unwrapped;
  return unwrapData<CableVariationItem[]>(unwrapped);
}

// Subscribe / renew cable plan
export async function subscribeCable(
  token: string,
  payload: SubscribeCableRequest,
): Promise<SubscribeCableSuccessData> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/cable/subscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  let json: SubscribeCableResponse | null = null;
  try { json = JSON.parse(text) as SubscribeCableResponse; } catch { /* ignore */ }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Cable subscription failed (${res.status})`;
    throw new Error(msg.replace(/&#x20a6;/g, 'NGN ')); // decode naira symbol entity if present
  }
  return unwrapData<SubscribeCableSuccessData>(json.data!);
}

// Verify cable customer (smartcard/IUC) before subscription
export interface VerifyCableSuccessData {
  service_name?: string;
  customer_id: string;
  customer_name?: string;
  status?: string;
  due_date?: string;
  balance?: string | number;
  current_bouquet?: string;
  renewal_amount?: string | number;
  [key: string]: unknown;
}

export interface VerifyCableResponse {
  success: boolean;
  message: string;
  data?: VerifyCableSuccessData | { data: VerifyCableSuccessData };
}

export async function verifyCableCustomer(
  token: string,
  payload: { customer_id: string; service_id: string },
): Promise<VerifyCableSuccessData> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/cable/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  let json: VerifyCableResponse | null = null;
  try { json = JSON.parse(text) as VerifyCableResponse; } catch { /* ignore */ }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Cable verification failed (${res.status})`;
    throw new Error(msg);
  }
  return unwrapData<VerifyCableSuccessData>(json.data!);
}

// ==================== Betting (Fund / Verify) ====================
export interface VerifyBettingCustomerRequest {
  customer_id: string; // betting platform user id / account id
  service_id: string; // e.g. Bet9ja, BetKing (backend appears case-sensitive based on example)
}

export interface VerifyBettingCustomerSuccessData {
  customer_id: string;
  service_id: string;
  customer_name?: string;
  status?: string;
  [key: string]: unknown;
}

export interface VerifyBettingCustomerResponse {
  success: boolean;
  message: string;
  data?: VerifyBettingCustomerSuccessData | { data: VerifyBettingCustomerSuccessData };
}

export async function verifyBettingCustomer(
  token: string,
  payload: VerifyBettingCustomerRequest,
): Promise<VerifyBettingCustomerSuccessData> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/betting/verify-customer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  let json: VerifyBettingCustomerResponse | null = null;
  try { json = JSON.parse(text) as VerifyBettingCustomerResponse; } catch { /* ignore parse error */ }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Could not verify betting customer (${res.status})`;
    throw new Error(msg);
  }
  return unwrapData<VerifyBettingCustomerSuccessData>(json.data!);
}

export interface FundBettingAccountRequest extends VerifyBettingCustomerRequest {
  amount: string | number; // backend example shows string; accept number too
}

export interface FundBettingAccountSuccessData {
  customer_id: string;
  service_id: string;
  amount: number | string;
  status?: string;
  balance_before?: string | number;
  balance_after?: string | number;
  transactionRef?: string;
  order_id?: number | string;
  [key: string]: unknown;
}

export interface FundBettingAccountResponse {
  success: boolean;
  message: string;
  data?: FundBettingAccountSuccessData | { data: FundBettingAccountSuccessData };
}

export async function fundBettingAccount(
  token: string,
  payload: FundBettingAccountRequest,
): Promise<FundBettingAccountSuccessData> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/betting/fund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const text = await res.text();
  let json: FundBettingAccountResponse | null = null;
  try { json = JSON.parse(text) as FundBettingAccountResponse; } catch { /* ignore */ }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Betting funding failed (${res.status})`;
    throw new Error(msg);
  }
  return unwrapData<FundBettingAccountSuccessData>(json.data!);
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
        // API may return nested data.data
        const unwrapped = unwrapData<AccountDetailsResponse["data"]>(
          (result as unknown as { data: unknown }).data,
        );
        if (!cancelled) setData(unwrapped);
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

// Hook for notifications list
export function useNotifications({
  filters,
  pollIntervalMs,
  limit,
}: {
  filters?: { country?: string; operator?: string; product?: string };
  pollIntervalMs?: number; // optional polling
  limit?: number; // client-side slice after fetch
} = {}) {
  const { getIdToken, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: NodeJS.Timeout | null = null;
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) throw new Error("No auth token available");
        const items = await fetchNotifications(token, filters);
        if (!cancelled) setNotifications(limit ? items.slice(0, limit) : items);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    if (pollIntervalMs) {
      interval = setInterval(() => void load(), pollIntervalMs);
    }
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [user, getIdToken, filters, pollIntervalMs, limit]);

  return { notifications, loading, error };
}

// Hook for unread notification count (lightweight, with optional polling)
export function useUnreadNotificationCount({
  filters,
  pollIntervalMs,
}: {
  filters?: { country?: string; operator?: string; product?: string };
  pollIntervalMs?: number;
} = {}) {
  const { getIdToken, user } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: NodeJS.Timeout | null = null;
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) throw new Error("No auth token available");
        const c = await fetchUnreadNotificationCount(token, filters);
        if (!cancelled) setCount(c);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    if (pollIntervalMs)
      interval = setInterval(() => void load(), pollIntervalMs);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [user, getIdToken, filters, pollIntervalMs]);

  return { count, loading, error };
}

// Hook: Dollar card details
export function useDollarCardDetails() {
  const { getIdToken, user } = useAuth();
  const [card, setCard] = useState<DollarCardDetails | null>(null);
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
  const data = await fetchDollarCardDetails(token);
  if (!cancelled) setCard(data || null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [user, getIdToken]);

  return { card, loading, error };
}

// Hook: Naira card details
export function useNairaCardDetails() {
  const { getIdToken, user } = useAuth();
  const [card, setCard] = useState<NairaCardDetails | null>(null);
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
  const data = await fetchNairaCardDetails(token);
  if (!cancelled) setCard(data || null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [user, getIdToken]);

  return { card, loading, error };
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

// Hook for recent transactions
/**
 * Hook to retrieve recent transactions for the authenticated user.
 * Automatically re-fetches when the user or limit changes.
 * @param limit Number of recent transactions to request (default 5)
 */
export function useRecentTransactions(limit = 5) {
  const { getIdToken, user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[] | null>(
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
        const result = await fetchRecentTransactions(token, { limit });
        console.log({ result });
        if (!cancelled) setTransactions(result.data);
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
  }, [getIdToken, user, limit]);

  return { transactions, loading, error };
}
