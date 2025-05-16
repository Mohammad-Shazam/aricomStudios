"use client"

import type React from "react"
import { useState, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveModificationRequest } from "@/lib/firestore"
import { sendEmailNotification } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface RequestFormProps {
  planId?: string
  planTitle?: string
}

export function RequestForm({ planId, planTitle }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      const requestData = {
        planId,
        planTitle,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        modifications: formData.get("modifications") as string,
        createdAt: new Date().toISOString(),
        status: "pending",
      }

      const { success, error } = await saveModificationRequest(requestData)

      if (!success) {
        throw new Error(error)
      }

      // Send email notification
      const emailResult = await sendEmailNotification('modification', requestData)

      if (!emailResult.success) {
        console.error('Email notification failed:', {
          error: emailResult.error,
          type: emailResult.type,
          formData: {
            email: requestData.email,
            modifications: requestData.modifications
          },
          timestamp: new Date().toISOString(),
          ...(emailResult.debug ? { debug: emailResult.debug } : {})
        })
        
        const userMessage = emailResult.error?.includes('timeout')
          ? 'The email service is not responding. Please try again later.'
          : emailResult.error?.includes('unavailable')
          ? 'Email service is currently unavailable'
          : 'Failed to send your request. Please try again.'
          
        throw new Error(userMessage)
      }

      console.log('Email notification sent successfully:', {
        type: 'modification',
        email: requestData.email,
        timestamp: new Date().toISOString()
      })

      // Reset the form using the ref
      if (formRef.current) {
        formRef.current.reset()
      }

      toast({
        title: "Request Submitted",
        description: "Your modification request has been submitted. We'll contact you soon!",
      })
    } catch (error) {
      console.error("Error submitting modification request:", error)
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Modifications</CardTitle>
        <CardDescription>
          Need changes to this plan? Let us know what modifications you'd like, and our team will contact you.
        </CardDescription>
      </CardHeader>
      <form ref={formRef} onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {planTitle && (
            <div className="space-y-2">
              <Label htmlFor="plan">House Plan</Label>
              <Input id="plan" name="plan" value={planTitle} readOnly />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" placeholder="(123) 456-7890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modifications">Requested Modifications</Label>
            <Textarea
              id="modifications"
              name="modifications"
              placeholder="Please describe the modifications you'd like to make to this house plan..."
              className="min-h-[120px]"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
