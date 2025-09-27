import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProfileCard from "../components/ProfileCard";
import ServicesSection from "../components/ServicesSection";
import WhyChoose from "../components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export const metadata = {
  title: "Finsync Digital Services — All Services Working Together",
  description:
    "Finsync Digital Services helps businesses keep financial operations secure, fast, and in perfect sync.",
  openGraph: {
    title: "Finsync Digital Services",
    description:
      "Keep your financial operations secure, fast, and in perfect sync with Finsync Digital Services.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com/",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/file.svg`,
        alt: "Finsync preview",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finsync Digital Services",
    description:
      "Keep your financial operations secure, fast, and in perfect sync with Finsync Digital Services.",
  },
  keywords: [
    "Finsync",
    "financial ops",
    "financial operations",
    "fintech",
    "accounts payable",
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com/",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <header className="pt-8 sm:pt-12">
          <Navbar />
        </header>

        <section className="relative mt-14 sm:mt-20 flex flex-col-reverse lg:flex-row items-start gap-14 lg:gap-24">
          <Hero />
          <div className="w-full max-w-sm lg:mt-4">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-md border border-black/5" />
              <div className="relative rounded-3xl overflow-hidden shadow-sm">
                <ProfileCard />
              </div>
            </div>
          </div>
        </section>

        <ServicesSection />
        <WhyChoose />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
