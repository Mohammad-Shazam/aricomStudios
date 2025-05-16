'use client'
import { useState } from "react"
import { Mail, MapPin, Phone } from "lucide-react"

import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveContactMessage } from "@/lib/firestore"
import { sendEmailNotification } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Save to Firestore
      const result = await saveContactMessage(formData);
      if (!result.success) {
        throw new Error(result.error || "Failed to save message");
      }
      
      // Send email notification with detailed error handling
      const emailResult = await sendEmailNotification('contact', {
        ...formData,
        createdAt: new Date()
      });

      if (!emailResult.success) {
        const errorDetails = {
          error: emailResult.error,
          type: emailResult.type,
          formData: {
            email: formData.email,
            subject: formData.subject
          },
          timestamp: new Date().toISOString(),
          ...(emailResult.debug ? { debug: emailResult.debug } : {})
        };
        
        console.error('Email notification failed:', errorDetails);
        
        const userMessage = emailResult.error?.includes('timeout')
          ? 'The email service is not responding. Please try again later.'
          : emailResult.error?.includes('unavailable')
          ? 'Email service is currently unavailable'
          : 'Failed to send your message. Please try again.';
          
        throw new Error(userMessage);
      }

      console.log('Email notification sent successfully:', {
        type: 'contact',
        email: formData.email,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us! We'll get back to you soon.",
        variant: "default"
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("[ContactForm] Error saving message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = {...prev}
        delete newErrors[id]
        return newErrors
      })
    }
  }
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Contact Us"
        description="Get in touch with our team for any questions or inquiries about our house plans"
      />

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions about our house plans? Need help finding the perfect design for your needs? Our team is
                here to help. Fill out the form, and we'll get back to you as soon as possible.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 mt-1">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Phone</h3>
                    <p className="text-gray-600">Main Office: +255 765 060 068</p>
                    <p className="text-gray-600">Customer Support: +255 653 779 135</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 mt-1">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email</h3>
                    <p className="text-gray-600">General Inquiries: info@aricomstudios.co.tz</p>
                    <p className="text-gray-600">Customer Support: support@aricomstudios.co.tz</p>
                    <p className="text-gray-600">Custom Designs: custom@aricomstudios.co.tz</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 mt-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Whitesand Road, Africana, Mbezi Beach</h3>
                    <p className="text-gray-600">Serene Annex</p>
                    <p className="text-gray-600">Dar es Salaam, Tanzania</p>
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">Hours:</span> Monday - Friday, 9am - 5pm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className={errors.firstName ? "border-destructive" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className={errors.lastName ? "border-destructive" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="(123) 456-7890"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide details about your inquiry..."
                        className={`min-h-[150px] ${errors.message ? "border-destructive" : ""}`}
                        required
                        value={formData.message}
                        onChange={handleChange}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Find Us</h2>
          <div className="rounded-lg overflow-hidden border h-[400px]">
             <iframe
                width="100%"
                height="100%"
                className="border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=Aricom%20Building%20Contractors%20Limited&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Sample data for FAQs
const faqs = [
  {
    question: "How do I purchase a house plan?",
    answer:
      "You can purchase a house plan directly through our website. Simply browse our collection, select the plan you like, add it to your cart, and proceed to checkout. After your order is confirmed, we'll contact you to finalize the details.",
  },
  {
    question: "Can I modify a house plan?",
    answer:
      "Yes, we offer modification services for all our house plans. You can request changes during the checkout process or contact our design team directly to discuss your specific requirements.",
  },
  {
    question: "How long does it take to receive my house plan?",
    answer:
      "Standard delivery for digital plans is typically within 2-3 business days after order confirmation. Printed plans may take 5-7 business days for delivery, depending on your location.",
  },
  {
    question: "Do you offer custom house plan design services?",
    answer:
      "Yes, we provide custom house plan design services. Contact our design team to discuss your project requirements and get a quote for a completely custom design.",
  },
  {
    question: "What's included in a typical house plan package?",
    answer:
      "Our standard house plan packages include complete construction blueprints, detailed floor plans, exterior elevations, foundation plans, electrical layouts, cross sections, and material specifications.",
  },
  {
    question: "Can I return or exchange a house plan?",
    answer:
      "Due to the digital nature of our products, we do not offer refunds on purchased plans. However, we're happy to work with you to address any concerns or make modifications to ensure the plan meets your needs.",
  },
]
