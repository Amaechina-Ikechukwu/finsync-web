"use client";

import { ChangeEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import { createDollarCard, createStrowalletCustomer } from "@/lib/apiClient";
import { getFirebaseStorage } from "@/lib/firebaseClient";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

type DocumentField = "idImage" | "userPhoto";

interface CreateDollarCardForm {
  firstName: string;
  lastName: string;
  customerEmail: string;
  phoneNumber: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;
  idImage: string;
  idImageName: string;
  userPhoto: string;
  userPhotoName: string;
  houseNumber: string;
  line1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardName: string;
}

const INITIAL_FORM: CreateDollarCardForm = {
  firstName: "",
  lastName: "",
  customerEmail: "",
  phoneNumber: "",
  dateOfBirth: "",
  idType: "NIN",
  idNumber: "",
  idImage: "",
  idImageName: "",
  userPhoto: "",
  userPhotoName: "",
  houseNumber: "",
  line1: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Nigeria",
  cardName: "",
};

const ID_TYPE_OPTIONS = [
  { label: "National Identification Number (NIN)", value: "NIN" },
  { label: "International Passport", value: "INTL_PASSPORT" },
  { label: "Driver's License", value: "DRIVERS_LICENSE" },
  { label: "Voter's Card", value: "VOTERS_CARD" },
  { label: "Bank Verification Number (BVN)", value: "BVN" },
];

function createDocumentPath(field: DocumentField, fileName: string) {
  const safeName = fileName.trim().replace(/[^a-zA-Z0-9._-]/gu, "-");
  const uniqueSegment =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `strowallet/${field}/${Date.now()}-${uniqueSegment}-${safeName}`;
}

export default function CreateDollarCardPage() {
  const router = useRouter();
  const { push } = useToast();
  const { getIdToken } = useAuth();
  const [form, setForm] = useState<CreateDollarCardForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocument, setUploadingDocument] =
    useState<DocumentField | null>(null);
  const storage = useMemo(() => getFirebaseStorage(), []);

  const handleFieldChange =
    (
      field: Exclude<
        keyof CreateDollarCardForm,
        DocumentField | `${DocumentField}Name`
      >,
    ) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleDocumentChange = async (
    field: DocumentField,
    files: FileList | null,
  ) => {
    const labelKey = field === "idImage" ? "idImageName" : "userPhotoName";
    if (!files?.[0]) {
      setForm((prev) => ({ ...prev, [field]: "", [labelKey]: "" }));
      return;
    }
    const file = files[0];
    setUploadingDocument(field);
    try {
      const storageRef = ref(storage, createDocumentPath(field, file.name));
      await uploadBytes(storageRef, file, {
        contentType: file.type || "application/octet-stream",
      });
      const downloadUrl = await getDownloadURL(storageRef);
      setForm((prev) => ({
        ...prev,
        [field]: downloadUrl,
        [labelKey]: file.name,
      }));
    } catch (error) {
      setForm((prev) => ({ ...prev, [field]: "", [labelKey]: "" }));
      push({
        variant: "error",
        title: "File upload failed",
        description:
          error instanceof Error
            ? error.message
            : "We couldn't process the selected file.",
      });
    } finally {
      setUploadingDocument((current) => (current === field ? null : current));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uploadingDocument) {
      push({
        variant: "error",
        title: "Upload in progress",
        description:
          "Please wait for the document uploads to finish before submitting.",
      });
      return;
    }
    setSubmitting(true);
    if (!form.idImage || !form.userPhoto) {
      push({
        variant: "error",
        title: "Documents required",
        description:
          "Please upload both the government ID image and a selfie before continuing.",
      });
      setSubmitting(false);
      return;
    }
    try {
      const token = await getIdToken(true);
      if (!token) {
        throw new Error("Authentication token unavailable");
      }

      const normalizedEmail = form.customerEmail.trim().toLowerCase();

      const customer = await createStrowalletCustomer(token, {
        houseNumber: form.houseNumber.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        idNumber: form.idNumber.trim(),
        customerEmail: normalizedEmail,
        phoneNumber: form.phoneNumber.trim(),
        dateOfBirth: form.dateOfBirth,
        idImage: form.idImage,
        userPhoto: form.userPhoto,
        line1: form.line1.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        idType: form.idType,
      });

      const customerData = customer.data;
      const customerResponse =
        customerData?.response &&
        typeof customerData.response === "object" &&
        customerData.response !== null
          ? (customerData.response as {
              customerId?: string;
              customerEmail?: string;
            })
          : undefined;
      const customerId =
        customerData?.customerId ?? customerResponse?.customerId;
      if (!customerId) {
        throw new Error("Customer ID missing from response");
      }

      const resolvedCustomerEmail =
        customerData?.customerEmail ??
        customerResponse?.customerEmail ??
        normalizedEmail;

      await createDollarCard(token, {
        customer_id: customerId,
        customerEmail: resolvedCustomerEmail,
        cardName: form.cardName.trim() || undefined,
      });

      push({
        variant: "success",
        title: "Dollar card ready",
        description: "Redirecting to your card dashboard…",
      });

      router.push("/dashboard/cards?tab=dollar&created=1");
    } catch (err) {
      push({
        variant: "error",
        title: "Unable to provision card",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fileInputsDisabled = submitting || Boolean(uploadingDocument);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Create Dollar Card
          </h2>
          <p className="text-sm text-neutral-600 max-w-prose">
            Sync the customer profile and issue a USD card in one step. We’ll
            guide you back to the dollar tab once setup completes.
          </p>
        </div>
        <Link
          href="/dashboard/cards"
          className="inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-neutral-800"
        >
          ← Back to Cards
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-black/10 bg-white/70 p-6"
      >
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">
            Customer & Card Details
          </h3>
          <p className="text-xs text-neutral-600">
            Enter the customer’s profile details, verify their identity, and
            optionally name the card. We’ll create the customer on Strowallet
            and immediately provision their USD card.
          </p>
        </div>

        <section className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Personal information
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-neutral-700">
              First Name
              <input
                required
                name="firstName"
                value={form.firstName}
                onChange={handleFieldChange("firstName")}
                placeholder="Jane"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Last Name
              <input
                required
                name="lastName"
                value={form.lastName}
                onChange={handleFieldChange("lastName")}
                placeholder="Doe"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Customer Email
              <input
                required
                type="email"
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleFieldChange("customerEmail")}
                placeholder="jane@example.com"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Phone Number
              <input
                required
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleFieldChange("phoneNumber")}
                placeholder="+15559876543"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Date of Birth
              <input
                required
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleFieldChange("dateOfBirth")}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
                max={new Date().toISOString().split("T")[0]}
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              ID Type
              <select
                required
                name="idType"
                value={form.idType}
                onChange={handleFieldChange("idType")}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              >
                {ID_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Identification
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-neutral-700">
              ID Number
              <input
                required
                name="idNumber"
                value={form.idNumber}
                onChange={handleFieldChange("idNumber")}
                placeholder="1234567890"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Government ID Image
              <input
                required
                type="file"
                accept="image/*"
                name="idImage"
                disabled={fileInputsDisabled}
                onChange={(event) =>
                  handleDocumentChange("idImage", event.target.files)
                }
                className="mt-1 w-full rounded-lg border border-dashed border-black/10 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white focus:ring-2 focus:ring-black/20"
              />
              <span className="mt-1 block text-[11px] text-neutral-500">
                {uploadingDocument === "idImage"
                  ? "Uploading document…"
                  : form.idImageName
                    ? `Uploaded: ${form.idImageName}`
                    : "Upload a clear photo of the selected ID (JPEG or PNG)."}
              </span>
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Selfie / User Photo
              <input
                required
                type="file"
                accept="image/*"
                name="userPhoto"
                disabled={fileInputsDisabled}
                onChange={(event) =>
                  handleDocumentChange("userPhoto", event.target.files)
                }
                className="mt-1 w-full rounded-lg border border-dashed border-black/10 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white focus:ring-2 focus:ring-black/20"
              />
              <span className="mt-1 block text-[11px] text-neutral-500">
                {uploadingDocument === "userPhoto"
                  ? "Uploading document…"
                  : form.userPhotoName
                    ? `Uploaded: ${form.userPhotoName}`
                    : "Upload a recent selfie that matches the customer's ID."}
              </span>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Address
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-neutral-700">
              House Number
              <input
                required
                name="houseNumber"
                value={form.houseNumber}
                onChange={handleFieldChange("houseNumber")}
                placeholder="24B"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Address Line 1
              <input
                required
                name="line1"
                value={form.line1}
                onChange={handleFieldChange("line1")}
                placeholder="Ikoyi Crescent"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              City
              <input
                required
                name="city"
                value={form.city}
                onChange={handleFieldChange("city")}
                placeholder="Lagos"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              State / Province
              <input
                required
                name="state"
                value={form.state}
                onChange={handleFieldChange("state")}
                placeholder="Lagos"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Postal / Zip Code
              <input
                required
                name="zipCode"
                value={form.zipCode}
                onChange={handleFieldChange("zipCode")}
                placeholder="100271"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Country
              <input
                required
                name="country"
                value={form.country}
                onChange={handleFieldChange("country")}
                placeholder="Nigeria"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Card Preferences
          </h4>
          <label className="block text-xs font-medium text-neutral-700">
            Card Label (optional)
            <input
              name="cardName"
              value={form.cardName}
              onChange={handleFieldChange("cardName")}
              placeholder="Team Travel USD"
              className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
            />
          </label>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-neutral-500">
            We’ll create the Strowallet customer with these details, then issue
            their USD card immediately.
          </p>
          <button
            type="submit"
            disabled={submitting || Boolean(uploadingDocument)}
            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold shadow transition ${
              submitting || uploadingDocument
                ? "bg-neutral-300 text-neutral-600"
                : "bg-black text-white hover:bg-black/90"
            }`}
          >
            {submitting
              ? "Creating…"
              : uploadingDocument
                ? "Uploading…"
                : "Create Dollar Card"}
          </button>
        </div>
      </form>
    </div>
  );
}
