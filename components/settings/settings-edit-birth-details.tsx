"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Clock, User, Loader2, Info, Search } from "lucide-react"
import { haptic } from "@/lib/haptic"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SettingsEditBirthDetails() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
    birthCountry: "",
    timezone: "",
    latitude: 0,
    longitude: 0,
  })

  const [errors, setErrors] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [filteredCities, setFilteredCities] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)

  // Load current birth details from API
  useEffect(() => {
    async function loadBirthDetails() {
      try {
        const res = await fetch("/api/birth-details/current")
        if (!res.ok) return
        const data = await res.json()

        if (data.birth_detail) {
          const bd = data.birth_detail

          setFormData({
            name: bd.name || "",
            birthDate: bd.birth_date || "",
            birthTime: bd.birth_time || "",
            birthCity: bd.birth_city || "",
            birthCountry: bd.birth_country || "",
            timezone: bd.timezone || "",
            latitude: bd.latitude || 0,
            longitude: bd.longitude || 0,
          })
          setCitySearch(bd.birth_city || "")
        }
      } catch (e) {
        console.error("Failed to load birth details", e)
      }
    }

    loadBirthDetails()
  }, [])

  // Debounced city search (same pattern as onboarding)
  useEffect(() => {
    const searchCities = async () => {
      if (citySearch.length < 2) {
        setFilteredCities([])
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(citySearch)}`)
        const data = await res.json()
        setFilteredCities(data.cities || [])
      } catch (error) {
        console.error("City search failed:", error)
        setFilteredCities([])
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(() => {
      if (citySearch) {
        searchCities()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [citySearch])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const validateField = (field: keyof typeof errors, value: string) => {
    let err = ""

    if (!value.trim()) {
      err = "This field is required"
    } else if (field === "name" && value.trim().length < 2) {
      err = "Name must be at least 2 characters"
    } else if (field === "birthDate") {
      const selectedDate = new Date(value)
      const today = new Date()
      if (selectedDate > today) {
        err = "Birth date cannot be in the future"
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }))
    return err === ""
  }

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleCitySelect = (city: any) => {
    haptic.light()
    setCitySearch(city.displayName)
    handleChange("birthCity", city.name)
    handleChange("birthCountry", city.country)
    handleChange("timezone", city.timezone)
    handleChange("latitude", city.latitude)
    handleChange("longitude", city.longitude)
    setShowCityDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const nameValid = validateField("name", formData.name)
    const dateValid = validateField("birthDate", formData.birthDate)
    const timeValid = validateField("birthTime", formData.birthTime)
    const cityValid = validateField("birthCity", formData.birthCity)

    if (!nameValid || !dateValid || !timeValid || !cityValid) {
      haptic.heavy()
      return
    }

    if (!formData.latitude || !formData.longitude) {
      setError("Please select a city from the dropdown")
      return
    }

    haptic.medium()
    setIsLoading(true)

    try {
      const res = await fetch("/api/birth-details/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          birth_date: formData.birthDate,
          birth_time: formData.birthTime,
          birth_city: formData.birthCity,
          birth_country: formData.birthCountry,
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: formData.timezone,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        console.error("Update error", data)
        haptic.error()
        toast({
          title: "Failed to update birth details",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Webhook on birth_details will now trigger recalculation.

      setIsLoading(false)
      haptic.success()
      toast({
        title: "Birth details updated",
        description: "Your astrological chart has been recalculated.",
      })

      router.push("/settings")
    } catch (err) {
      console.error("Update request error", err)
      haptic.error()
      toast({
        title: "Failed to update birth details",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="mb-6 -ml-2 min-h-[44px]"
          onClick={() => {
            haptic.light()
            router.back()
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Edit Birth Details</CardTitle>
            <CardDescription>Update your astrological birth information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={(e) => validateField("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={`min-h-[48px] ${
                    errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  onBlur={(e) => validateField("birthDate", e.target.value)}
                  className={`min-h-[48px] ${
                    errors.birthDate ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time of Birth <span className="text-destructive">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Birth time is crucial for accurate chart calculations. If unknown, use 12:00 PM as an
                          estimate.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => handleChange("birthTime", e.target.value)}
                  onBlur={(e) => validateField("birthTime", e.target.value)}
                  className={`min-h-[48px] ${
                    errors.birthTime ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                {errors.birthTime && <p className="text-sm text-destructive">{errors.birthTime}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthCity">
                  City of Birth <span className="text-destructive">*</span>
                </Label>
                <div className="relative" ref={cityDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="birthCity"
                      type="text"
                      placeholder="Search for your birth city..."
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value)
                        setShowCityDropdown(true)
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      className={`pl-12 bg-background min-h-[48px] text-base ${
                        errors.birthCity ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {showCityDropdown && filteredCities.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                      {filteredCities.map((city, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between min-h-[48px]"
                        >
                          <span className="text-sm font-medium">{city.name}</span>
                          <span className="text-xs text-muted-foreground">{city.country}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {showCityDropdown &&
                    citySearch.length >= 2 &&
                    filteredCities.length === 0 &&
                    !isSearching && (
                      <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
                        No cities found. Try a different search.
                      </div>
                    )}
                </div>
                {errors.birthCity && <p className="text-sm text-destructive">{errors.birthCity}</p>}

                {formData.timezone && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Timezone: {formData.timezone}</p>
                    <p>
                      Coordinates: {formData.latitude.toFixed(4)}°, {formData.longitude.toFixed(4)}°
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 min-h-[48px] bg-transparent"
                  onClick={() => {
                    haptic.light()
                    router.back()
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 min-h-[48px] bg-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}