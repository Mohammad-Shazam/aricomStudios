import { PageHeader } from "@/components/ui/page-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "Frequently Asked Questions | Aricom House Plans",
  description:
    "Find answers to common questions about Aricom House Plans, purchasing plans, and building your dream home.",
}

export default function FAQPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <PageHeader title="Frequently Asked Questions" />

      <div className="mb-8">
        <p className="text-muted-foreground">
          Find answers to the most common questions about our house plans and services. If you can't find what you're
          looking for, please{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
          .
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">About Our House Plans</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What's included in a house plan package?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Our standard house plan packages include:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Complete set of construction drawings (PDF format)</li>
                <li>Floor plans for all levels</li>
                <li>Exterior elevations (front, rear, right, left)</li>
                <li>Foundation plan</li>
                <li>Roof plan</li>
                <li>Cross-section details</li>
                <li>Electrical layouts</li>
                <li>General specifications</li>
              </ul>
              <p>
                Premium packages may include additional features like material lists, cost estimates, and 3D renderings.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How are the house plans delivered?</AccordionTrigger>
            <AccordionContent>
              <p>
                All our house plans are delivered digitally as PDF files. After your purchase is complete, you'll
                receive an email with download instructions. You can also access your purchased plans anytime through
                your account dashboard.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Can I modify the house plans?</AccordionTrigger>
            <AccordionContent>
              <p>Yes, our house plans can be modified to suit your needs. You have two options:</p>
              <ol className="list-decimal pl-6 mb-4">
                <li className="mb-2">Work with your local architect or builder to make modifications</li>
                <li>Use our modification services (additional fees apply)</li>
              </ol>
              <p>
                Common modifications include changing dimensions, adding or removing rooms, or adjusting the exterior
                style.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Are your house plans approved by building departments?</AccordionTrigger>
            <AccordionContent>
              <p>
                Our house plans are designed to meet general building codes, but local building codes and regulations
                vary. You'll need to have the plans reviewed by your local building department or a licensed
                professional to ensure compliance with local requirements. This is standard practice for any house plan
                purchase.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Purchasing & Licensing</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-5">
            <AccordionTrigger>How many times can I use a purchased house plan?</AccordionTrigger>
            <AccordionContent>
              <p>
                Each house plan purchase includes a license to build one home. If you want to build the same house
                multiple times, you'll need to purchase additional licenses. Contact us for information about
                multiple-build licenses or developer packages.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
            <AccordionContent>
              <p>
                Due to the digital nature of our products, we do not offer refunds once the plans have been delivered.
                We recommend carefully reviewing all plan details before making a purchase. If you have questions about
                a specific plan, please contact us before purchasing.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>How do I know if a house plan will fit on my lot?</AccordionTrigger>
            <AccordionContent>
              <p>
                You should compare the dimensions of the house plan with your lot size, taking into account local
                setback requirements (minimum distances from property lines). Most of our plan listings include the
                overall dimensions and square footage. If you need help determining if a plan will fit your lot, contact
                us with your lot dimensions and the plan you're interested in.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>Can I share my purchased plans with my builder?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, you can share your purchased plans with your builder, contractor, and local building department for
                the purpose of constructing your home. However, you cannot share the plans with other individuals who
                might want to build the same house, as each construction requires a separate license.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Building Your Home</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-9">
            <AccordionTrigger>How much will it cost to build this house?</AccordionTrigger>
            <AccordionContent>
              <p>
                Construction costs vary significantly based on location, materials, finishes, contractor rates, and
                current market conditions. The cost per square foot can range from $150 to $400 or more, depending on
                these factors.
              </p>
              <p className="mt-2">For a more accurate estimate, we recommend:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Consulting with local builders in your area</li>
                <li>Getting multiple quotes from contractors</li>
                <li>Considering our cost-to-build estimates (available with premium packages) as a starting point</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger>How long does it take to build a house from your plans?</AccordionTrigger>
            <AccordionContent>
              <p>
                Construction time varies depending on the complexity of the design, size of the home, your builder's
                schedule, weather conditions, and other factors. On average:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Small to medium homes (under 2,500 sq ft): 6-10 months</li>
                <li>Larger homes (over 2,500 sq ft): 10-16 months</li>
                <li>Custom luxury homes: 12-24 months</li>
              </ul>
              <p className="mt-2">
                Your builder can provide a more accurate timeline based on your specific circumstances.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-11">
            <AccordionTrigger>Do I need an architect if I purchase your plans?</AccordionTrigger>
            <AccordionContent>
              <p>
                In many cases, you won't need to hire an architect if you purchase our plans. However, you might need an
                architect or engineer in these situations:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Your local building department requires an architect's stamp</li>
                <li>You want significant modifications to the plans</li>
                <li>Your lot has unusual characteristics (steep slope, unusual shape, etc.)</li>
                <li>Local conditions require special engineering (high wind areas, earthquake zones, etc.)</li>
              </ul>
              <p className="mt-2">
                We recommend checking with your local building department about their requirements before beginning
                construction.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-12">
            <AccordionTrigger>Can I see examples of built homes from your plans?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes! Many of our plan listings include photos of completed homes built from those plans. We also have a
                gallery section on our website showcasing customer-built homes. If you're interested in seeing examples
                of a specific plan that doesn't have built photos, contact us and we'll try to connect you with previous
                customers who have built that design (with their permission).
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Custom Design Services</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-13">
            <AccordionTrigger>Do you offer custom house plan design?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, we offer custom house plan design services. Our team of experienced architects and designers can
                create a completely custom home design based on your specific requirements and preferences. Custom
                design services start at $2,500, with the final price depending on the size and complexity of the
                design.
              </p>
              <p className="mt-2">Contact us to schedule a consultation and discuss your custom home project.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-14">
            <AccordionTrigger>How long does the custom design process take?</AccordionTrigger>
            <AccordionContent>
              <p>
                The custom design process typically takes 2-4 months, depending on the complexity of the design and the
                number of revisions needed. Here's a general timeline:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Initial consultation and requirements gathering: 1-2 weeks</li>
                <li>Preliminary design concepts: 2-3 weeks</li>
                <li>Design revisions and refinement: 3-6 weeks</li>
                <li>Final construction documents: 3-4 weeks</li>
              </ul>
              <p className="mt-2">
                We'll provide a more specific timeline during your consultation based on your project's requirements and
                our current workload.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-15">
            <AccordionTrigger>Can you modify an existing plan instead of creating a custom design?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes, we offer modification services for our existing house plans. This is often more cost-effective than
                creating a completely custom design. Common modifications include:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Changing dimensions or room sizes</li>
                <li>Adding or removing rooms</li>
                <li>Altering the exterior style or materials</li>
                <li>Adjusting ceiling heights</li>
                <li>Modifying the foundation type</li>
              </ul>
              <p className="mt-2">
                Modification costs start at $500 and depend on the extent of the changes. Contact us with your desired
                modifications for a custom quote.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
        <p className="mb-4">
          If you couldn't find the answer to your question, please contact our customer support team.
        </p>
        <a
          href="/contact"
          className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </main>
  )
}
