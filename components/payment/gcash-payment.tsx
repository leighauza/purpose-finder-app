"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SuccessAnimation } from "@/components/ui/success-animation"
import { triggerHaptic } from "@/lib/haptic"
import {
  ArrowLeft,
  Smartphone,
  Send,
  Camera,
  Upload,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import Image from "next/image"

export function GCashPayment() {
  const router = useRouter()
  const [referenceNumber, setReferenceNumber] = useState("")
  const [amount] = useState("299")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submissionDetails, setSubmissionDetails] = useState<{
    reference: string
    timestamp: string
  } | null>(null)
  const [errors, setErrors] = useState<{
    file?: string
    reference?: string
  }>({})
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB"
    }
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      return "Only JPG and PNG files are allowed"
    }
    return null
  }

  const handleFileChange = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setErrors((prev) => ({ ...prev, file: error }))
      return
    }

    setErrors((prev) => ({ ...prev, file: undefined }))
    setReceipt(file)

    // Create preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    triggerHaptic("light")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleRemoveFile = () => {
    setReceipt(null)
    setPreviewUrl(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    triggerHaptic("light")
  }

  const validateReferenceNumber = (value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, reference: "Reference number is required" }))
    } else if (value.length < 5) {
      setErrors((prev) => ({ ...prev, reference: "Reference number is too short" }))
    } else {
      setErrors((prev) => ({ ...prev, reference: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!receipt || !referenceNumber) {
      return
    }

    setIsSubmitting(true)
    triggerHaptic("medium")

    // TODO: Upload receipt and verify payment
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setSubmissionDetails({
        reference: referenceNumber,
        timestamp: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      })
      triggerHaptic("success")
    }, 2000)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/payment/select")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {isSuccess && submissionDetails && (
        <div className="mb-8">
          <SuccessAnimation
            message="Payment submitted for review!"
            onComplete={() => {
              // Keep showing success state
            }}
          />

          <Card className="border-green-200 bg-green-50 mt-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-green-900">We're verifying your payment</p>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>• Usually takes less than 10 minutes</p>
                    <p>• Reference: {submissionDetails.reference}</p>
                    <p>• Submitted: {submissionDetails.timestamp}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4" onClick={() => router.push("/chat")}>
                Continue to Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!isSuccess && (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-serif text-foreground mb-2">GCash Payment</h1>
            <p className="text-muted-foreground">Complete your premium subscription</p>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif">Payment Instructions</CardTitle>
              <CardDescription>Follow these steps to complete your payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="text-sm font-medium text-foreground mb-1">Step 1: Open GCash app</div>
                    <p className="text-sm text-muted-foreground">Launch your GCash mobile application</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="text-sm font-medium text-foreground mb-1">Step 2: Send ₱299</div>
                    <p className="text-sm text-muted-foreground">Send payment to our GCash number or scan QR code</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="text-sm font-medium text-foreground mb-1">Step 3: Take screenshot</div>
                    <p className="text-sm text-muted-foreground">Capture your payment receipt</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="text-sm font-medium text-foreground mb-1">Step 4: Upload below</div>
                    <p className="text-sm text-muted-foreground">Submit your payment proof for verification</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center p-6 bg-muted/30 rounded-xl border border-border">
                <div className="w-64 h-64 bg-white rounded-lg shadow-md flex items-center justify-center mb-4">
                  <div className="text-center p-4">
                    {/* Placeholder for actual QR code */}
                    <div className="w-48 h-48 bg-muted rounded-lg mx-auto mb-2" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Or scan this QR code</p>
                <p className="text-sm font-medium text-foreground">Clarity Astrology • 0917-XXX-XXXX</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="receipt-upload" className="text-base font-medium">
                    Upload Payment Receipt <span className="text-destructive">*</span>
                  </Label>

                  {!receipt ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl transition-all ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <input
                        id="receipt-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          Drop your receipt here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">JPG or PNG, max 5MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-border rounded-xl overflow-hidden bg-muted/20">
                      {previewUrl && (
                        <div className="relative w-full h-64">
                          <Image
                            src={previewUrl || "/placeholder.svg"}
                            alt="Receipt preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between p-4 border-t border-border bg-background">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">{receipt.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById("receipt-upload")?.click()}
                          >
                            Change
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.file && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.file}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-base font-medium">
                    Reference Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reference"
                    type="text"
                    placeholder="Example: GC1234567890"
                    value={referenceNumber}
                    onChange={(e) => {
                      setReferenceNumber(e.target.value)
                      validateReferenceNumber(e.target.value)
                    }}
                    onBlur={(e) => validateReferenceNumber(e.target.value)}
                    className={`h-12 ${errors.reference ? "border-destructive" : ""}`}
                  />
                  <p className="text-xs text-muted-foreground">Found on your GCash receipt (starts with GC)</p>
                  {errors.reference && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.reference}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-base font-medium">
                    Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                    <Input
                      id="amount"
                      type="text"
                      value={amount}
                      readOnly
                      className="h-12 pl-8 bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={isSubmitting || !receipt || !referenceNumber || !!errors.reference}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Payment Proof"
                  )}
                </Button>
              </form>

              <Alert className="bg-blue-50 border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  Payment verified within 24 hours • Access granted immediately after approval
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
