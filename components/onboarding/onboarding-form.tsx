"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SuccessAnimation } from "@/components/ui/success-animation"
import { haptic } from "@/lib/haptic"

export function OnboardingForm() {
  const router = useRouter()
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
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [filteredCities, setFilteredCities] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)

  // Debounced city search
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
        console.error('City search failed:', error)
        setFilteredCities([])
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(() => {
      if (citySearch) {
        searchCities()
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [citySearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const validateField = (field: string, value: string) => {
    let error = ""

    if (!value.trim()) {
      error = "This field is required"
    } else if (field === "name" && value.trim().length < 2) {
      error = "Name must be at least 2 characters"
    } else if (field === "birthDate") {
      const selectedDate = new Date(value)
      const today = new Date()
      if (selectedDate > today) {
        error = "Birth date cannot be in the future"
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }))
    return error === ""
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
      const res = await fetch('/api/birth-details/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          birth_date: formData.birthDate,
          birth_time: formData.birthTime,
          birth_city: formData.birthCity,
          birth_country: formData.birthCountry,
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: formData.timezone
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save birth details')
      }

      // Success!
      setIsLoading(false)
      setShowSuccess(true)
      haptic.success()
      
      setTimeout(() => {
        router.push("/subscription-prompt")
      }, 1500)

    } catch (err) {
      haptic.error()
      setError(err instanceof Error ? err.message : 'Failed to save birth details')
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
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

  return (
    <>
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Birth Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={(e) => validateField("name", e.target.value)}
                required
                className={`bg-background min-h-[48px] text-base ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  onBlur={(e) => validateField("birthDate", e.target.value)}
                  required
                  className={`bg-background min-h-[48px] text-base ${errors.birthDate ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="birthTime">
                    Time of Birth <span className="text-destructive">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] text-pretty">
                        <p>
                          Your birth time is essential for calculating your ascendant (rising sign) and house
                          placements, which reveal deep insights about your personality and life path.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => handleChange("birthTime", e.target.value)}
                  onBlur={(e) => validateField("birthTime", e.target.value)}
                  required
                  className={`bg-background min-h-[48px] text-base ${errors.birthTime ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.birthTime && <p className="text-sm text-destructive">{errors.birthTime}</p>}
              </div>
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
                    required
                    className={`pl-12 bg-background min-h-[48px] text-base ${errors.birthCity ? "border-destructive focus-visible:ring-destructive" : ""}`}
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

                {showCityDropdown && citySearch.length >= 2 && filteredCities.length === 0 && !isSearching && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
                    No cities found. Try a different search.
                  </div>
                )}
              </div>
              {errors.birthCity && <p className="text-sm text-destructive">{errors.birthCity}</p>}

              {formData.timezone && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Timezone: {formData.timezone}</p>
                  <p>Coordinates: {formData.latitude.toFixed(4)}°, {formData.longitude.toFixed(4)}°</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">We use this to calculate your birth chart accurately</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full min-h-[48px] text-base bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Calculating your chart...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <SuccessAnimation message="Chart calculated!" show={showSuccess} />
    </>
  )
}