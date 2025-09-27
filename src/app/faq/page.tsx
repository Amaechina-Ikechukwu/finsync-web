import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "FAQ — Finsync",
  description:
    "Frequently asked questions about Finsync's services, security, and accounts.",
};

export default function FAQPage() {
  return (
    <LegalPage
      title="Frequently Asked Questions"
      lastUpdated="September 27, 2025"
      description="Answers to common questions about Finsync and our services."
    >
      <section>
        <h2 className="text-lg font-semibold">General Questions</h2>
        <div>
          <h3 className="font-medium">What is Finsync?</h3>
          <p>
            Finsync is an all-in-one digital payments platform that allows you
            to manage all your daily transactions from a single, secure app. You
            can buy airtime, pay bills, trade cryptocurrency, create virtual
            cards for online shopping, and send money to any bank account in
            Nigeria.
          </p>
        </div>

        <div>
          <h3 className="font-medium">
            Is my money and personal information safe with Finsync?
          </h3>
          <p>
            Absolutely. Security is our top priority. We use bank-grade security
            measures, including multi-layer encryption and secure protocols, to
            protect all your data and transactions. You can transact with
            complete peace of mind.
          </p>
        </div>

        <div>
          <h3 className="font-medium">How do I create a Finsync account?</h3>
          <p>
            Getting started is easy and free! You can sign up in under two
            minutes on our website or by downloading our mobile app. All you
            need is a valid phone number and email address.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Service Questions</h2>

        <div>
          <h3 className="font-medium">
            What types of bills can I pay on Finsync?
          </h3>
          <p>
            You can pay for a wide range of services, including electricity
            (both prepaid and postpaid), cable TV subscriptions (like DStv and
            GOtv), and internet data bundles from all major providers.
          </p>
        </div>

        <div>
          <h3 className="font-medium">
            How fast are airtime top-ups and bill payments?
          </h3>
          <p>
            All VTU and bill payment transactions are processed instantly. As
            soon as you confirm the transaction, the value is delivered in
            seconds.
          </p>
        </div>

        <div>
          <h3 className="font-medium">
            Can I use Finsync virtual cards for international payments?
          </h3>
          <p>
            Yes! We offer both Naira and Dollar virtual cards. You can create a
            virtual dollar card in minutes to pay for international
            subscriptions like Netflix, Spotify, and for online shopping on
            global websites like Amazon and ASOS.
          </p>
        </div>

        <div>
          <h3 className="font-medium">What cryptocurrencies can I trade?</h3>
          <p>
            Finsync provides a simple and secure way to buy, sell, and manage
            popular cryptocurrencies, including Bitcoin (BTC) and USDT, at very
            competitive rates.
          </p>
        </div>

        <div>
          <h3 className="font-medium">
            Can I send money to someone who doesn't have a Finsync account?
          </h3>
          <p>
            Yes. You can send money from your Finsync wallet directly to any
            bank account in Nigeria. The recipient does not need to have a
            Finsync account to receive the funds.
          </p>
        </div>
      </section>
    </LegalPage>
  );
}
