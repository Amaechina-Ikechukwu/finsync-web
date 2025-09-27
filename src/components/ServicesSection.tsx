"use client";
import {
  DevicePhoneMobileIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  GiftIcon,
  PaperAirplaneIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

// Define the type for a feature
type Feature = {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  categoryLabel?: string;
  accentClass?: string; // CSS classes for border and text color
  bgClass?: string; // CSS class for background color
};

// Define the array of services with associated data and styles
const features: Feature[] = [
  {
    id: "airtime",
    icon: DevicePhoneMobileIcon,
    title: "VTU & Bill Payments",
    description:
      "Never get cut off. Instantly buy airtime/data for any network, and pay for your electricity (prepaid/postpaid) and DStv/GOtv subscriptions in seconds.",
    categoryLabel: "Airtime",
    accentClass: "border-sky-300 text-sky-800",
    bgClass: "bg-sky-50/80",
  },
  {
    id: "cards",
    icon: CreditCardIcon,
    title: "Virtual Cards (Naira & Dollar)",
    description:
      "Shop globally without limits. Create secure virtual Dollar and Naira cards in minutes for all your online subscriptions, international shopping, and ad payments.",
    categoryLabel: "Cards",
    accentClass: "border-rose-300 text-rose-800",
    bgClass: "bg-rose-50/80",
  },
  {
    id: "pos",
    icon: BuildingStorefrontIcon,
    title: "Agent Banking (POS)",
    description:
      "Empower your business. Our reliable POS terminals and robust agent platform provide a new stream of income for merchants across Nigeria.",
    categoryLabel: "POS",
    accentClass: "border-lime-300 text-lime-800",
    bgClass: "bg-lime-50/80",
  },
  {
    id: "esim",
    icon: GlobeAltIcon,
    title: "eSIMs & Virtual Numbers",
    description:
      "Stay connected wherever you go. Get affordable data eSIMs for international travel and secure virtual numbers for privacy, business, or account verifications.",
    categoryLabel: "E-SIM",
    accentClass: "border-red-300 text-red-800",
    bgClass: "bg-red-50/80",
  },
  {
    id: "crypto",
    icon: CurrencyDollarIcon,
    title: "Crypto Trading",
    description:
      "Your simple gateway to the crypto world. Securely buy, sell, and manage top cryptocurrencies like Bitcoin and USDT with competitive rates and ultra-low fees.",
    categoryLabel: "Crypto",
    accentClass: "border-purple-300 text-purple-800",
    bgClass: "bg-purple-50/80",
  },
  {
    id: "giftcards",
    icon: GiftIcon,
    title: "Gift Card Exchange",
    description:
      "Get instant value for your gift cards. Trade a wide range of popular gift cards for instant cash directly into your Finsync wallet.",
    categoryLabel: "Gift Cards",
    accentClass: "border-indigo-300 text-indigo-800",
    bgClass: "bg-indigo-50/80",
  },
  {
    id: "sendmoney",
    icon: PaperAirplaneIcon,
    title: "Send & Receive Money",
    description:
      "Move money effortlessly. Send funds to any bank account in Nigeria instantly, and receive payments from anyone with your unique Finsync account.",
    categoryLabel: "Transfer",
    accentClass: "border-teal-300 text-teal-800",
    bgClass: "bg-teal-50/80",
  },
];

// Helper to find features by ID (may return undefined)
const getFeatureById = (id: string) => features.find((f) => f.id === id);

// List of features for the visual grid at the top (filter out any missing)
const topGridFeatures: Feature[] = [
  getFeatureById("cards"),
  getFeatureById("pos"),
  getFeatureById("esim"),
  getFeatureById("airtime"),
  getFeatureById("crypto"),
].filter(Boolean) as Feature[];

export default function ServicesSection() {
  return (
    <section
      aria-labelledby="services-heading"
      className="relative max-w-7xl mx-auto my-12 px-4 sm:px-8 lg:px-12"
    >
      <div className="bg-white shadow-sm rounded-2xl border border-black/10 px-5 py-12 sm:px-12 sm:py-16 ">
        <div className="space-y-10">
          {/* Top layout: title left, bento grid right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1.5">
              <h2
                id="services-heading"
                className="text-[3.1rem] leading-[1.05] font-serif font-semibold tracking-tight"
              >
                A Universe of Services in Your Pocket
              </h2>
              <p className="mt-3 text-neutral-600 text-sm">
                Discover the full suite of tools Finsync offers — from cards and
                POS to eSIMs and crypto — all accessible in one app.
              </p>
            </div>

            <div className="lg:col-span-2">
              <div className="flex justify-start lg:justify-end">
                <div className="grid grid-cols-3 gap-3">
                  {topGridFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium shadow-sm backdrop-blur-sm border ${feature.accentClass} ${feature.bgClass}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${feature.accentClass} ${feature.bgClass}`}
                      >
                        <feature.icon
                          className={`${feature.accentClass?.split(" ")[1] || "text-gray-600"} h-4 w-4`}
                        />
                      </div>
                      <span className="whitespace-nowrap">
                        {feature.categoryLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mapped Feature List (icon left, content right) */}
          <div className="space-y-6 mt-12 md:mt-0">
            {features.map((f) => (
              <div key={f.id} className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border ${f.accentClass} ${f.bgClass}`}
                >
                  <f.icon
                    className={`h-6 w-6 ${f.accentClass?.split(" ")[1] || "text-gray-600"}`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <span
                    className={`inline-flex items-center text-xs font-medium tracking-tight px-2 py-0.5 rounded border bg-white/70 mb-2 ${f.accentClass}`}
                  >
                    {f.categoryLabel}
                  </span>
                  <h3 className="font-medium text-base mb-1.5 tracking-tight leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
