"use client";
import {
  ShieldCheckIcon,
  BoltIcon,
  LifebuoyIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

interface Reason {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent: string; // border + text colour
  bg: string; // background colour
}

const reasons: Reason[] = [
  {
    id: "security",
    title: "Bank-Grade Security",
    description:
      "Your trust is our priority. Your funds and data are protected with multi-layer security, including PCI-DSS compliant protocols, end-to-end encryption, and biometric authentication.",
    icon: ShieldCheckIcon,
    accent: "border-emerald-300 text-emerald-800",
    bg: "bg-emerald-50/80",
  },
  {
    id: "speed",
    title: "Lightning-Fast Transactions",
    description:
      "Why wait? Your payments, top-ups, and transfers are processed instantly, 24/7. No 'network delays,' just immediate value.",
    icon: BoltIcon,
    accent: "border-amber-300 text-amber-800",
    bg: "bg-amber-50/80",
  },
  {
    id: "support",
    title: "Dedicated 24/7 Support",
    description:
      "Real help from real people. Our friendly support team is always available via live chat, email, or phone to assist you whenever you need help.",
    icon: LifebuoyIcon,
    accent: "border-sky-300 text-sky-800",
    bg: "bg-sky-50/80",
  },
  {
    id: "fees",
    title: "Transparent & Low Fees",
    description:
      "No hidden charges, ever. Enjoy the most competitive rates on all our services with a clear, simple, and upfront fee structure.",
    icon: CheckCircleIcon,
    accent: "border-indigo-300 text-indigo-800",
    bg: "bg-indigo-50/80",
  },
];

export default function WhyChoose() {
  return (
    <section
      aria-labelledby="why-choose-heading"
      className="relative max-w-7xl mx-auto my-24 px-4 sm:px-8 lg:px-12"
    >
      <div className=" ">
        <div className="flex flex-col  gap-8">
          <div className="lg:w-1/3">
            <h2
              id="why-choose-heading"
              className="text-[3.1rem] leading-[1.05] font-serif font-semibold tracking-tight mb-3"
            >
              Designed for Your Peace of Mind
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              We built Finsync with security, speed, and simplicity at its core,
              so you can transact with total confidence.
            </p>
          </div>

          <div className="lg:flex-1 space-y-8">
            {reasons.map((r) => (
              <div
                key={r.id}
                className="relative bg-white h-40 rounded-xl shadow-sm overflow-visible flex items-start"
              >
                {/* Accent stripe */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${r.accent.split(" ")[0].replace("border-", "bg-")}`}
                />

                {/* Card content */}
                <div className="pl-6 pr-4 py-8 w-full">
                  <div className="-mt-6 -ml-6 mb-2 relative">
                    <div
                      className={`absolute -left-6 -top-6 w-14 h-14 rounded-full flex items-center justify-center border ${r.accent} ${r.bg}`}
                    >
                      <r.icon className={`h-6 w-6 ${r.accent.split(" ")[1]}`} />
                    </div>
                  </div>

                  <h3 className="font-medium text-xl mb-1.5 tracking-tight leading-snug w-3/5">
                    {r.title}
                  </h3>
                  <p className="text-xs sm:text-lg text-md text-neutral-600 w-3/5">
                    {r.description}
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
