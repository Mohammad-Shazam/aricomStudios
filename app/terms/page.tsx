import { PageHeader } from "@/components/ui/page-header"

export const metadata = {
  title: "Terms of Service | Aricom House Plans",
  description: "Terms and conditions for using Aricom House Plans services and purchasing our house plans.",
}

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <PageHeader title="Terms of Service" />

      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-8">Last updated: April 26, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to Aricom House Plans. These Terms of Service govern your use of our website, products, and
            services. By accessing our website or purchasing our house plans, you agree to these terms. Please read them
            carefully.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
          <p>
            <strong>"Company"</strong> refers to Aricom House Plans.
            <br />
            <strong>"Website"</strong> refers to aricomstudios.co.tz.
            <br />
            <strong>"Plans"</strong> refers to the house plans and related documents available for purchase.
            <br />
            <strong>"User"</strong> refers to any individual accessing the Website or purchasing Plans.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. House Plan Purchases</h2>
          <p>
            When you purchase a house plan from Aricom House Plans, you are purchasing a limited license to use the plan
            for the construction of a single home. The purchase does not transfer copyright ownership of the plan to
            you.
          </p>
          <h3 className="text-xl font-semibold mt-4 mb-2">3.1 License Terms</h3>
          <p>Each house plan purchase includes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>A one-time, non-exclusive license to build one home from the purchased plan</li>
            <li>Digital delivery of complete construction documents</li>
            <li>Permission to make minor modifications as needed for local building codes</li>
          </ul>
          <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Restrictions</h3>
          <p>You may not:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Build multiple homes from a single plan purchase</li>
            <li>Share, distribute, or resell the plan</li>
            <li>Use the plan for commercial purposes beyond building a single home</li>
            <li>Claim authorship or copyright ownership of the plan</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Payment and Refunds</h2>
          <p>
            All payments are processed securely through our payment processors. Due to the digital nature of our
            products, all sales are final. We do not offer refunds once the digital plans have been delivered.
          </p>
          <p className="mt-2">
            If you have not yet received your digital plans, you may request a cancellation and refund by contacting our
            customer service team.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <p>
            All house plans, images, and content on our website are protected by copyright and other intellectual
            property laws. The plans are the intellectual property of Aricom House Plans and our affiliated architects
            and designers.
          </p>
          <p className="mt-2">
            You may not copy, reproduce, distribute, or create derivative works from our content without explicit
            permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
          <p>
            Our house plans are provided "as is" without warranty of any kind, either expressed or implied, including,
            but not limited to, the implied warranties of merchantability, fitness for a particular purpose, or
            non-infringement.
          </p>
          <p className="mt-2">
            We do not guarantee that our plans will meet all local building codes and regulations. It is the
            responsibility of the purchaser to ensure compliance with all applicable laws, codes, and regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>
            Aricom House Plans shall not be liable for any direct, indirect, incidental, special, consequential, or
            punitive damages resulting from the use or inability to use our plans or services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately
            upon posting to the website. Your continued use of our services after any changes indicates your acceptance
            of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without
            regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p className="mt-2">
            Aricom House Plans
            <br />
            Email: legal@aricomstudios.co.tz
            <br />
            Phone: +255 765 060 068
          </p>
        </section>
      </div>
    </main>
  )
}
