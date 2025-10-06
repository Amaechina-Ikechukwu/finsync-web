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

// Crypto (buy/sell) types
export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  network: string;
  icon?: string;
  address: string;
  current_price_naira: number;
  available_balance: number;
  decimals: number;
  status: string;
  [key: string]: unknown;
}

export interface CryptoCoinsResponse {
  success: boolean;
  coins: CryptoCoin[];
  message?: string;
}

export interface CryptoSellEstimateRequest {
  coinId: string;
  cryptoAmount: string;
}

export interface CryptoBuyEnhancedRequest {
  coinId: string;
  amountInNaira: string;
  userWalletAddress: string;
}

export interface CryptoSellEstimateResponse {
  success: boolean;
  coin: {
    name: string;
    symbol: string;
    network: string;
    icon?: string;
    [key: string]: unknown;
  };
  crypto_amount: string;
  current_rate: number;
  gross_amount: number;
  service_charge: number;
  net_amount: number;
  our_wallet_address: string;
  minimum_amount: number;
  note?: string;
  message?: string;
  [key: string]: unknown;
}

export interface CryptoSellAddressCoin {
  id: string;
  name: string;
  symbol: string;
  network: string;
  icon?: string;
  our_wallet_address: string;
  current_rate_naira: number;
  service_charge: number;
  minimum_amount: number;
  decimals: number;
  [key: string]: unknown;
}

export interface CryptoSellAddressResponse {
  success: boolean;
  coin: CryptoSellAddressCoin;
  message?: string;
}

export interface CryptoBuyEnhancedResponse {
  success: boolean;
  transaction_id: string;
  coin: {
    name: string;
    symbol: string;
    network: string;
    icon?: string;
    [key: string]: unknown;
  };
  amount_naira: number;
  crypto_amount: number;
  exchange_rate: number;
  service_charge: number;
  total_deducted: number;
  user_wallet_address: string;
  status: string;
  message?: string;
  estimated_delivery?: string;
  [key: string]: unknown;
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

// Dollar card balance
export interface DollarCardBalance {
  card_id: number;
  available_balance: number;
  ledger_balance: number;
  currency: string; // "USD"
  source: string; // e.g. upstream
  updated_at: string; // ISO
}

export interface DollarCardBalanceResponse {
  success: boolean;
  data: DollarCardBalance | { data: DollarCardBalance };
}

// Strowallet customer update
export interface UpdateStrowalletCustomerRequest {
  phoneNumber?: string;
  line1?: string;
  city?: string;
}

export interface UpdateStrowalletCustomerResponse {
  success: boolean;
  data?:
    | {
        success?: boolean;
        message?: string;
        response?: {
          customerId: string;
          createdAt: string | null;
          updatedAt: string | null;
        };
      }
    | { data: unknown };
  message?: string;
}

export interface CreateStrowalletCustomerRequest {
  houseNumber: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  customerEmail: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO yyyy-mm-dd
  idImage: string;
  userPhoto: string;
  line1: string;
  state: string;
  zipCode: string;
  city: string;
  country: string;
  idType: string;
}

export interface CreateStrowalletCustomerData {
  customerId?: string;
  customerEmail?: string;
  message?: string;
  response?: {
    customerId?: string;
    customerEmail?: string;
    [key: string]: unknown;
  };
  success?: boolean;
  [key: string]: unknown;
}

export interface CreateStrowalletCustomerResponse {
  success: boolean;
  data?: CreateStrowalletCustomerData;
  message?: string;
}

export interface CreateDollarCardRequest {
  customerEmail: string;
  mode?: string;
  customer_id?: string;
  cardName?: string;
}

export interface CreateDollarCardData {
  card_id?: string | number;
  reference?: string;
  message?: string;
  response?: {
    card_id?: string | number;
    reference?: string | number;
    customer_id?: string;
    [key: string]: unknown;
  };
  success?: boolean;
  [key: string]: unknown;
}

export interface CreateDollarCardResponse {
  success: boolean;
  data?: CreateDollarCardData;
  message?: string;
}

export interface DollarCardFreezeStatus {
  card_id: number;
  status: string;
  frozen: boolean;
  source?: string;
}

export interface DollarCardFreezeStatusResponse {
  success: boolean;
  data: DollarCardFreezeStatus | { data: DollarCardFreezeStatus };
  message?: string;
}

export interface DollarCardTransactionItem {
  id: string;
  amount: number;
  card_id: string | number;
  description?: string;
  reference?: string;
  savedAt?: string;
  status?: string;
  transaction_date?: string;
  transaction_id?: string;
  txId?: string;
  type?: string;
  flow?: string;
  balance_after?: number;
  [key: string]: unknown;
}

export interface DollarCardTransactionsResponse {
  success: boolean;
  message?: string;
  data: DollarCardTransactionItem[] | { data: DollarCardTransactionItem[] };
  total?: number;
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

// ==================== Crypto (Buy/Sell) ====================
export async function fetchCryptoBuyCoins(
  token: string,
): Promise<CryptoCoin[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/crypto/buy/coins`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  let json: CryptoCoinsResponse | null = null;
  try {
    json = JSON.parse(text) as CryptoCoinsResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const message = json?.message || `Failed to load coins (${res.status})`;
    throw new Error(message);
  }
  if (!Array.isArray(json.coins)) {
    throw new Error("Invalid coins payload");
  }
  return json.coins;
}

export async function createCryptoBuyOrder(
  token: string,
  payload: CryptoBuyEnhancedRequest,
): Promise<CryptoBuyEnhancedResponse> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/crypto/buy/enhanced`, {
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
  let json: CryptoBuyEnhancedResponse | null = null;
  try {
    json = JSON.parse(text) as CryptoBuyEnhancedResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const message =
      json?.message || `Failed to create buy order (${res.status})`;
    throw new Error(message);
  }
  return json;
}

export async function fetchCryptoSellEstimate(
  token: string,
  payload: CryptoSellEstimateRequest,
): Promise<CryptoSellEstimateResponse> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/crypto/sell/estimate`, {
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
  let json: CryptoSellEstimateResponse | null = null;
  try {
    json = JSON.parse(text) as CryptoSellEstimateResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const message = json?.message || `Failed to estimate sell (${res.status})`;
    throw new Error(message);
  }
  return json;
}

export async function fetchCryptoSellAddress(
  token: string,
  coinId: string,
): Promise<CryptoSellAddressCoin> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(
    `${API_BASE}/crypto/sell/address/${encodeURIComponent(coinId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );
  const text = await res.text();
  let json: CryptoSellAddressResponse | null = null;
  try {
    json = JSON.parse(text) as CryptoSellAddressResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const message = json?.message || `Failed to fetch address (${res.status})`;
    throw new Error(message);
  }
  if (!json.coin) throw new Error("Missing coin address payload");
  return json.coin;
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
    if (res.status === 400 && /No\s+dollar\s+card\s+found/i.test(text)) {
      return null;
    }
    throw new Error(
      `Failed to fetch dollar card details (${res.status}): ${text}`,
    );
  }
  const json = (await res.json()) as DollarCardDetailsResponse;
  return unwrapData<DollarCardDetails>(json.data);
}

// Update Strowallet customer profile
export async function updateStrowalletCustomer(
  token: string,
  customerId: string,
  payload: UpdateStrowalletCustomerRequest,
  opts?: { email?: string },
): Promise<UpdateStrowalletCustomerResponse> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const url = new URL(
    `${API_BASE}/strowallet/customer/${encodeURIComponent(customerId)}`,
  );
  if (opts?.email) url.searchParams.set("email", opts.email);
  const res = await fetch(url.toString(), {
    method: "PUT",
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
    let msg = `Failed to update customer (${res.status})`;
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      msg = j.message || j.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  try {
    return JSON.parse(text) as UpdateStrowalletCustomerResponse;
  } catch {
    // In case backend returns minimal/no body
    return { success: true } as UpdateStrowalletCustomerResponse;
  }
}

// Create Strowallet customer profile (assumes POST endpoint mirrors update schema)
export async function createStrowalletCustomer(
  token: string,
  payload: CreateStrowalletCustomerRequest,
): Promise<CreateStrowalletCustomerResponse> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/strowallet/customer`, {
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
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      throw new Error(
        j.message || j.error || `Failed to create customer (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to create customer (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  try {
    const raw = JSON.parse(text) as CreateStrowalletCustomerResponse & {
      data?: unknown;
    };
    const data = raw.data
      ? unwrapData<CreateStrowalletCustomerData>(raw.data)
      : undefined;
    return { ...raw, data };
  } catch {
    return { success: true } as CreateStrowalletCustomerResponse;
  }
}

// Create USD card for an existing customer
export async function createDollarCard(
  token: string,
  payload: CreateDollarCardRequest,
): Promise<CreateDollarCardResponse> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/dollar-card/create`, {
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
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      throw new Error(
        j.message || j.error || `Failed to create dollar card (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to create dollar card (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  try {
    const raw = JSON.parse(text) as CreateDollarCardResponse & {
      data?: unknown;
    };
    const data = raw.data
      ? unwrapData<CreateDollarCardData>(raw.data)
      : undefined;
    return { ...raw, data };
  } catch {
    return { success: true } as CreateDollarCardResponse;
  }
}

// Get Dollar card fund estimate (quote)
export async function getDollarFundEstimate(
  token: string,
  amount: number,
): Promise<unknown | null> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/dollar-card/fund/quote`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      throw new Error(j.message || j.error || `Quote failed (${res.status})`);
    } catch {
      throw new Error(`Quote failed (${res.status}): ${text.slice(0, 120)}`);
    }
  }
  if (!text) return null; // no body response per docs
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Get Dollar card balance
export async function fetchDollarCardBalance(
  token: string,
): Promise<DollarCardBalance> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/dollar-card/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(
        j.message || `Failed to fetch dollar balance (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to fetch dollar balance (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  const json = JSON.parse(text) as DollarCardBalanceResponse;
  return unwrapData<DollarCardBalance>(json.data);
}

// Fetch freeze status for USD card
export async function fetchDollarCardFreezeStatus(
  token: string,
): Promise<DollarCardFreezeStatus> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/dollar-card/freeze-status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(
        j.message || `Failed to fetch freeze status (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to fetch freeze status (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  const json = JSON.parse(text) as DollarCardFreezeStatusResponse;
  return unwrapData<DollarCardFreezeStatus>(json.data);
}

// Fetch USD card ledger transactions (database sourced)
export async function fetchDollarCardTransactions(
  token: string,
  params: { limit?: number; offset?: number; sort?: "asc" | "desc" } = {},
): Promise<{ items: DollarCardTransactionItem[]; total?: number }> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const url = new URL(`${API_BASE}/dollar-card/transactions/db`);
  if (params.limit !== undefined)
    url.searchParams.set("limit", String(params.limit));
  if (params.offset !== undefined)
    url.searchParams.set("offset", String(params.offset));
  if (params.sort) url.searchParams.set("sort", params.sort);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(
        j.message || `Failed to fetch card transactions (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to fetch card transactions (${res.status}): ${text.slice(0, 200)}`,
      );
    }
  }
  const json = JSON.parse(text) as DollarCardTransactionsResponse;
  const itemsRaw = unwrapData<
    DollarCardTransactionItem[] | { data: DollarCardTransactionItem[] }
  >(json.data);
  const items = Array.isArray(itemsRaw)
    ? itemsRaw
    : unwrapData<DollarCardTransactionItem[]>(itemsRaw);
  return { items, total: json.total };
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
    throw new Error(
      `Failed to fetch naira card details (${res.status}): ${text}`,
    );
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
      throw new Error(
        j.message || j.error || `Airtime purchase failed (${res.status})`,
      );
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
    if (json?.message) {
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
  if (!json.data) throw new Error("Missing response data");
  const unwrapped = unwrapData<BuyElectricitySuccessData>(json.data);
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
  try {
    json = JSON.parse(text) as VerifyElectricityResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Verification failed (${res.status})`;
    throw new Error(msg);
  }
  if (!json.data) throw new Error("Missing response data");
  return unwrapData<VerifyElectricitySuccessData>(json.data);
}

// Fetch cable variations (plans) for a given service_id (e.g. gotv, dstv)
export async function fetchCableVariations(
  token: string,
  service_id: string,
  extra?: { customer_id?: string }, // backend example shows body with customer_id although GET
): Promise<CableVariationItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const urlObj = new URL(
    `${API_BASE}/cable/variations/${encodeURIComponent(service_id)}`,
  );
  if (extra?.customer_id)
    urlObj.searchParams.set("customer_id", extra.customer_id);
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
      throw new Error(
        j.message || `Failed to fetch cable variations (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to fetch cable variations (${res.status}): ${text.slice(0, 120)}`,
      );
    }
  }
  let json: CableVariationsResponse;
  try {
    json = JSON.parse(text) as CableVariationsResponse;
  } catch {
    throw new Error("Invalid variations JSON");
  }
  const unwrapped = unwrapData<
    CableVariationItem[] | { data: CableVariationItem[] }
  >(json.data);
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
  try {
    json = JSON.parse(text) as SubscribeCableResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Cable subscription failed (${res.status})`;
    throw new Error(msg.replace(/&#x20a6;/g, "NGN ")); // decode naira symbol entity if present
  }
  if (!json.data) throw new Error("Missing response data");
  return unwrapData<SubscribeCableSuccessData>(json.data);
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
  try {
    json = JSON.parse(text) as VerifyCableResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Cable verification failed (${res.status})`;
    throw new Error(msg);
  }
  if (!json.data) throw new Error("Missing response data");
  return unwrapData<VerifyCableSuccessData>(json.data);
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
  data?:
    | VerifyBettingCustomerSuccessData
    | { data: VerifyBettingCustomerSuccessData };
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
  try {
    json = JSON.parse(text) as VerifyBettingCustomerResponse;
  } catch {
    /* ignore parse error */
  }
  if (!res.ok || !json || json.success === false) {
    const msg =
      json?.message || `Could not verify betting customer (${res.status})`;
    throw new Error(msg);
  }
  if (!json.data) throw new Error("Missing response data");
  return unwrapData<VerifyBettingCustomerSuccessData>(json.data);
}

export interface FundBettingAccountRequest
  extends VerifyBettingCustomerRequest {
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
  data?:
    | FundBettingAccountSuccessData
    | { data: FundBettingAccountSuccessData };
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
  try {
    json = JSON.parse(text) as FundBettingAccountResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Betting funding failed (${res.status})`;
    throw new Error(msg);
  }
  if (!json.data) throw new Error("Missing response data");
  return unwrapData<FundBettingAccountSuccessData>(json.data);
}

// ==================== eSIM (Airalo) ====================
// Note: Endpoints are assumed based on provided spec: may evolve as backend stabilizes.
export interface EsimPurchaseItem {
  id: string | number;
  status?: string; // e.g., active, pending, expired
  country_code?: string;
  country?: string;
  operator_id?: string | number;
  operator?: string;
  package_id?: string | number;
  package_name?: string;
  iccid?: string;
  activation_code?: string;
  qr_code_url?: string;
  created_at?: string;
  expires_at?: string;
  [key: string]: unknown;
}

export interface EsimUserPurchasesResponse {
  success: boolean;
  data: EsimPurchaseItem[] | { data: EsimPurchaseItem[] };
  message?: string;
}

export interface EsimCountryItem {
  // Normalized fields (for UI convenience)
  code?: string; // ISO-2 or slug fallback
  name?: string; // display name
  emoji?: string; // optional flag
  operators_count?: number;

  // Raw fields from backend response
  slug?: string;
  country_code?: string; // e.g., "NG"
  title?: string; // e.g., "Nigeria"
  image?: { width: number; height: number; url: string };
  [key: string]: unknown;
}

export interface EsimCountriesResponse {
  success: boolean;
  data: EsimCountryItem[] | { data: EsimCountryItem[] };
  message?: string;
}

export interface EsimOperatorItem {
  id: string | number;
  name: string;
  country_code: string;
  logo_url?: string;
  image?: { width: number; height: number; url: string };
  packages_count?: number;
  [key: string]: unknown;
}

export interface EsimOperatorsResponse {
  success: boolean;
  data: EsimOperatorItem[] | { data: EsimOperatorItem[] };
  message?: string;
}

export interface EsimPackageItem {
  id: string | number;
  name: string;
  data_amount?: string; // e.g. "3 GB"
  validity_days?: number; // e.g. 7
  price?: number;
  currency?: string; // e.g. USD, NGN
  description?: string;
  [key: string]: unknown;
}

export interface EsimPackagesResponse {
  success: boolean;
  data: EsimPackageItem[] | { data: EsimPackageItem[] };
  message?: string;
}

export interface PurchaseEsimRequest {
  packageId: string | number;
  // Optional contact info or extras if backend requires
  email?: string;
  phone?: string;
  operatorId?: string | number;
}

export interface PurchaseEsimResponse {
  success: boolean;
  message?: string;
  data?: EsimPurchaseItem | { data: EsimPurchaseItem };
}

export async function fetchEsimUserPurchases(
  token: string,
): Promise<EsimPurchaseItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/airalo/user-purchases`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(
        j.message || `Failed to fetch eSIM purchases (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to fetch eSIM purchases (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  const json = JSON.parse(text) as EsimUserPurchasesResponse;
  const unwrapped = unwrapData<
    EsimPurchaseItem[] | { data: EsimPurchaseItem[] }
  >(json.data);
  return Array.isArray(unwrapped)
    ? unwrapped
    : unwrapData<EsimPurchaseItem[]>(unwrapped);
}

export async function fetchEsimCountries(
  token: string,
  opts?: { uid?: string },
): Promise<EsimCountryItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const url = new URL(`${API_BASE}/airalo/countries`);
  if (opts?.uid) url.searchParams.set("uid", opts.uid);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(
        j.message || `Failed to fetch eSIM countries (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to fetch eSIM countries (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  const json = JSON.parse(text) as EsimCountriesResponse;
  const unwrapped = unwrapData<EsimCountryItem[] | { data: EsimCountryItem[] }>(
    json.data,
  );
  const items = Array.isArray(unwrapped)
    ? unwrapped
    : unwrapData<EsimCountryItem[]>(unwrapped);
  // Normalize fields so UI can rely on code/name while preserving originals
  return items.map((it) => ({
    ...it,
    code: it.code ?? it.country_code ?? it.slug,
    name: it.name ?? it.title,
  }));
}

export async function fetchEsimOperators(
  token: string,
  countryCode: string,
  opts?: { uid?: string },
): Promise<EsimOperatorItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const url = new URL(
    `${API_BASE}/airalo/countries/${encodeURIComponent(countryCode)}/operators`,
  );
  if (opts?.uid) url.searchParams.set("uid", opts.uid);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(j.message || `Failed to fetch operators (${res.status})`);
    } catch {
      throw new Error(
        `Failed to fetch operators (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  const json = JSON.parse(text) as EsimOperatorsResponse;
  const unwrapped = unwrapData<
    EsimOperatorItem[] | { data: EsimOperatorItem[] }
  >(json.data);
  const items = Array.isArray(unwrapped)
    ? unwrapped
    : unwrapData<EsimOperatorItem[]>(unwrapped);
  // Normalize fields so UI can rely on name/country_code
  return items.map((raw) => {
    const r = raw as unknown as Record<string, unknown>;
    const name =
      (r["name"] as string | undefined) ??
      (r["title"] as string | undefined) ??
      "";
    const country_code =
      (r["country_code"] as string | undefined) ??
      (r["country"] as { country_code?: string } | undefined)?.country_code ??
      (r["countryCode"] as string | undefined) ??
      "";
    const imageFromImage = r["image"] as
      | { width?: number; height?: number; url?: string }
      | undefined;
    const imageFromLogo = r["logo"] as
      | { width?: number; height?: number; url?: string }
      | undefined;
    const normalizedImage = imageFromImage?.url
      ? {
          width: imageFromImage.width ?? 0,
          height: imageFromImage.height ?? 0,
          url: String(imageFromImage.url),
        }
      : imageFromLogo?.url
        ? {
            width: imageFromLogo.width ?? 0,
            height: imageFromLogo.height ?? 0,
            url: String(imageFromLogo.url),
          }
        : undefined;
    const logo_url =
      (r["logo_url"] as string | undefined) ??
      imageFromImage?.url ??
      imageFromLogo?.url;
    const packages_count =
      (r["packages_count"] as number | undefined) ??
      (r["packagesCount"] as number | undefined);
    const id = (r["id"] as string | number | undefined) ?? "";
    const op: EsimOperatorItem = {
      id,
      name,
      country_code,
      logo_url,
      image: normalizedImage,
      packages_count,
    };
    return op;
  });
}

export async function fetchEsimPackages(
  token: string,
  countryCode: string,
  operatorId: string | number,
  opts?: { uid?: string },
): Promise<EsimPackageItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const url = new URL(
    `${API_BASE}/airalo/countries/${encodeURIComponent(
      countryCode,
    )}/operators/${encodeURIComponent(String(operatorId))}/packages`,
  );
  if (opts?.uid) url.searchParams.set("uid", opts.uid);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(j.message || `Failed to fetch packages (${res.status})`);
    } catch {
      throw new Error(
        `Failed to fetch packages (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  const json = JSON.parse(text) as EsimPackagesResponse;
  const unwrapped = unwrapData<EsimPackageItem[] | { data: EsimPackageItem[] }>(
    json.data,
  );
  const items = Array.isArray(unwrapped)
    ? unwrapped
    : unwrapData<EsimPackageItem[]>(unwrapped);
  // Normalize fields for UI (name, data_amount, validity_days, price, currency)
  return items.map((raw) => {
    const it = raw as unknown as {
      id: string | number;
      name?: string;
      title?: string;
      data_amount?: string;
      data?: string | number;
      amount?: string | number;
      validity_days?: number;
      day?: number;
      price?: number;
      net_price?: number;
      price_ngn?: number;
      net_price_ngn?: number;
      currency?: string;
    };
    const priceNgn = it.price_ngn ?? it.net_price_ngn;
    const priceUsd = it.price ?? it.net_price;
    const currency = priceNgn !== undefined ? "NGN" : (it.currency ?? "USD");
    const price = priceNgn !== undefined ? priceNgn : priceUsd;
    const dataAmount =
      it.data_amount ??
      (it.data ? String(it.data) : it.amount ? `${it.amount} MB` : undefined);
    const validity = it.validity_days ?? it.day;
    return {
      ...(raw as EsimPackageItem),
      name: it.name ?? it.title ?? "",
      data_amount: dataAmount,
      validity_days: validity,
      price,
      currency,
    } as EsimPackageItem;
  });
}

export async function purchaseEsim(
  token: string,
  payload: PurchaseEsimRequest,
): Promise<EsimPurchaseItem> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/airalo/purchase`, {
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
  let json: PurchaseEsimResponse | null = null;
  try {
    json = JSON.parse(text) as PurchaseEsimResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `eSIM purchase failed (${res.status})`;
    throw new Error(msg);
  }
  if (!json.data) throw new Error("Missing eSIM purchase data");
  return unwrapData<EsimPurchaseItem>(json.data);
}

// ==================== Virtual Numbers (Pricing, Purchases, SMS) ====================
export interface VirtualNumberCountryItem {
  iso: string; // e.g., "nigeria", "usa"
  text_en: string; // e.g., "Nigeria"
  // Normalized for UI
  code?: string;
  name?: string;
}

export interface VirtualNumberProductAvailability {
  cost: number;
  count: number;
  rate?: number;
  [key: string]: unknown;
}

export interface VirtualNumberPricesMap {
  // product -> operator -> availability
  [product: string]: {
    [operator: string]: VirtualNumberProductAvailability;
  };
}

export interface VirtualNumberProductEntry {
  product: string;
  offers: Array<{
    operator: string;
    cost: number;
    count: number;
    rate?: number;
  }>;
}

export interface VirtualNumberCountriesResponse {
  success: boolean;
  data: VirtualNumberCountryItem[] | { data: VirtualNumberCountryItem[] };
}

export interface VirtualNumberPricesResponse {
  success: boolean;
  data: VirtualNumberPricesMap | { data: VirtualNumberPricesMap };
}

export interface VirtualNumberPurchaseItem {
  activationId: number;
  id?: number; // may duplicate activationId
  purchaseId?: string;
  product?: string;
  operator?: string;
  country?: string; // slug e.g., nigeria
  phone?: string; // "+234..."
  price?: number;
  status?: string; // RECEIVED, PENDING
  type?: string; // purchase
  createdAt?: string;
  created_at?: string;
  expires?: string;
  [key: string]: unknown;
}

export interface VirtualNumberPurchasesResponse {
  success: boolean;
  data: VirtualNumberPurchaseItem[] | { data: VirtualNumberPurchaseItem[] };
  count?: number;
}

export interface VirtualNumberSmsMessage {
  created_at?: string;
  date?: string;
  sender?: string;
  text?: string;
  code?: string | null;
  [key: string]: unknown;
}

export interface VirtualNumberSmsResponse {
  success: boolean;
  data:
    | { sms: VirtualNumberSmsMessage[] }
    | { data: { sms: VirtualNumberSmsMessage[] } };
}

export async function fetchVirtualNumberCountries(
  token: string,
): Promise<VirtualNumberCountryItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/virtual-numbers/countries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(
        j.message || `Failed to fetch VN countries (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to fetch VN countries (${res.status}): ${text.slice(0, 160)}`,
      );
    }
  }
  const json = JSON.parse(text) as VirtualNumberCountriesResponse;
  const unwrapped = unwrapData<
    VirtualNumberCountryItem[] | { data: VirtualNumberCountryItem[] }
  >(json.data);
  const arr = Array.isArray(unwrapped)
    ? unwrapped
    : unwrapData<VirtualNumberCountryItem[]>(unwrapped);
  return arr.map((c) => ({ ...c, code: c.iso, name: c.text_en }));
}

export async function fetchVirtualNumberPrices(
  token: string,
  country: string,
): Promise<VirtualNumberProductEntry[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(
    `${API_BASE}/virtual-numbers/prices/${encodeURIComponent(country)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(j.message || `Failed to fetch VN prices (${res.status})`);
    } catch {
      throw new Error(
        `Failed to fetch VN prices (${res.status}): ${text.slice(0, 200)}`,
      );
    }
  }
  const raw = JSON.parse(text) as VirtualNumberPricesResponse;
  const mapObj = unwrapData<
    VirtualNumberPricesMap | { data: VirtualNumberPricesMap }
  >(raw.data) as VirtualNumberPricesMap;
  const entries: VirtualNumberProductEntry[] = Object.entries(mapObj || {}).map(
    ([product, byOperator]) => ({
      product,
      offers: Object.entries(byOperator || {}).map(([operator, info]) => ({
        operator,
        cost: Number((info as VirtualNumberProductAvailability).cost ?? 0),
        count: Number((info as VirtualNumberProductAvailability).count ?? 0),
        rate: (info as VirtualNumberProductAvailability).rate,
      })),
    }),
  );
  // Sort offers by cost asc for each product
  entries.forEach((e) => {
    e.offers.sort((a, b) => a.cost - b.cost);
  });
  return entries;
}

export async function fetchVirtualNumberPurchases(
  token: string,
): Promise<VirtualNumberPurchaseItem[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const doFetch = async (path: string) =>
    fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  let res = await doFetch("/virtual-numbers/purchases");
  if (!res.ok && res.status === 404) {
    // try alternate path per examples
    res = await doFetch("/virtual-numbers/history");
  }
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(
        j.message || `Failed to fetch VN purchases (${res.status})`,
      );
    } catch {
      throw new Error(
        `Failed to fetch VN purchases (${res.status}): ${text.slice(0, 200)}`,
      );
    }
  }
  const json = JSON.parse(text) as VirtualNumberPurchasesResponse;
  const unwrapped = unwrapData<
    VirtualNumberPurchaseItem[] | { data: VirtualNumberPurchaseItem[] }
  >(json.data);
  return Array.isArray(unwrapped)
    ? unwrapped
    : unwrapData<VirtualNumberPurchaseItem[]>(unwrapped);
}

export async function fetchVirtualNumberSms(
  token: string,
  activationId: string | number,
): Promise<VirtualNumberSmsMessage[]> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(
    `${API_BASE}/virtual-numbers/sms/${encodeURIComponent(String(activationId))}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text) as { message?: string };
      throw new Error(j.message || `Failed to fetch SMS (${res.status})`);
    } catch {
      throw new Error(
        `Failed to fetch SMS (${res.status}): ${text.slice(0, 200)}`,
      );
    }
  }
  const json = JSON.parse(text) as VirtualNumberSmsResponse;
  const container = unwrapData<
    | { sms: VirtualNumberSmsMessage[] }
    | { data: { sms: VirtualNumberSmsMessage[] } }
  >(json.data) as { sms: VirtualNumberSmsMessage[] };
  const smsArr = Array.isArray(container.sms) ? container.sms : [];
  // Sort newest first by date/created_at
  smsArr.sort((a, b) => {
    const ad = Date.parse(a.date || a.created_at || "");
    const bd = Date.parse(b.date || b.created_at || "");
    const safeAd = Number.isNaN(ad) ? 0 : ad;
    const safeBd = Number.isNaN(bd) ? 0 : bd;
    return safeBd - safeAd;
  });
  return smsArr;
}

// Purchase virtual number
export interface PurchaseVirtualNumberRequest {
  country: string; // slug e.g., "nigeria"
  operator: string; // e.g., "virtual2"
  product: string; // e.g., "amazon"
}

export interface PurchaseVirtualNumberResponse {
  success: boolean;
  data?: VirtualNumberPurchaseItem | { data: VirtualNumberPurchaseItem };
  message?: string;
}

export async function purchaseVirtualNumber(
  token: string,
  payload: PurchaseVirtualNumberRequest,
): Promise<VirtualNumberPurchaseItem> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${API_BASE}/virtual-numbers/buy`, {
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
  let json: PurchaseVirtualNumberResponse | null = null;
  try {
    json = JSON.parse(text) as PurchaseVirtualNumberResponse;
  } catch {
    /* ignore */
  }
  if (!res.ok || !json || json.success === false) {
    const msg = json?.message || `Purchase failed (${res.status})`;
    throw new Error(msg);
  }
  if (!json.data) throw new Error("Missing purchase data");
  return unwrapData<VirtualNumberPurchaseItem>(json.data);
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
        const token = await getIdToken(true);
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
        const token = await getIdToken(true);
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
        const token = await getIdToken(true);
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
        const token = await getIdToken(true);
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

// Hook: Crypto coins
export function useCryptoCoins() {
  const { getIdToken, user } = useAuth();
  const [coins, setCoins] = useState<CryptoCoin[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken(true);
        if (!token) throw new Error("No auth token available");
        const items = await fetchCryptoBuyCoins(token);
        if (!cancelled) setCoins(items);
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
  }, [user, getIdToken]);

  return { coins, loading, error };
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
        const token = await getIdToken(true);
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
    return () => {
      cancelled = true;
    };
  }, [user, getIdToken]);

  return { card, loading, error };
}

// Hook: Dollar card balance
export function useDollarCardBalance() {
  const { getIdToken, user } = useAuth();
  const [balance, setBalance] = useState<DollarCardBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken(true);
        if (!token) throw new Error("No auth token available");
        const data = await fetchDollarCardBalance(token);
        if (!cancelled) setBalance(data);
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
  }, [user, getIdToken]);

  return { balance, loading, error };
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
        const token = await getIdToken(true);
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
    return () => {
      cancelled = true;
    };
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
        const token = await getIdToken(true);
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
        const token = await getIdToken(true);
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
