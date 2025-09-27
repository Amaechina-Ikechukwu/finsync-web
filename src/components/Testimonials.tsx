"use client";

export default function Testimonials() {
  return (
    <div className="mt-12">
      <div className="rounded-2xl overflow-hidden bg-black text-white">
        <div className="px-6 py-10 sm:px-12 sm:py-14">
          <h3
            id="testimonials-heading"
            className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight mb-6"
          >
            Loved by Thousands of Nigerians
          </h3>

          <div className="grid gap-6 sm:grid-cols-3">
            <figure className="bg-white/5 p-5 rounded-lg">
              <blockquote className="text-sm sm:text-base italic text-gray-100">
                “Finsync has simplified my life! I pay all my bills and buy data
                for my whole family from one app. The virtual dollar card works
                flawlessly for my Netflix subscription.”
              </blockquote>
              <figcaption className="mt-4 text-xs sm:text-sm text-gray-300">
                — Adebayo L., Lagos
              </figcaption>
            </figure>

            <figure className="bg-white/5 p-5 rounded-lg">
              <blockquote className="text-sm sm:text-base italic text-gray-100">
                “As a freelancer, receiving payments used to be a hassle. Now,
                clients pay into my Finsync account, and I can even swap some of
                it to crypto easily. The low fees are a huge bonus!”
              </blockquote>
              <figcaption className="mt-4 text-xs sm:text-sm text-gray-300">
                — Chioma N., Abuja
              </figcaption>
            </figure>

            <figure className="bg-white/5 p-5 rounded-lg">
              <blockquote className="text-sm sm:text-base italic text-gray-100">
                “The Finsync POS is the most reliable I have used. My customers
                are happy, and the instant commission settlement has been a
                game-changer for my business.”
              </blockquote>
              <figcaption className="mt-4 text-xs sm:text-sm text-gray-300">
                — Musa S., Port Harcourt
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
