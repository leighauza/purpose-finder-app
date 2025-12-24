// app/api/birth-details/current/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error("Auth error in current birth details:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching birth details for user:", user.id)

    // Get active birth detail for this user
    const { data, error } = await supabase
      .from("birth_details")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // ADD THESE LOGS:
    console.log("Raw query result:", { 
      hasData: !!data, 
      dataValue: data,
      hasError: !!error, 
      errorCode: error?.code,
      errorMessage: error?.message 
    })  

    if (error) {
      console.error("Fetch birth_details error:", error)
      return NextResponse.json(
        { error: "Failed to load birth details" },
        { status: 500 }
      )
    }

    console.log("Birth details found:", !!data)

    const safeBirthDetail = JSON.parse(JSON.stringify(data));

    // Return with consistent camelCase naming for frontend
    return NextResponse.json({
      birthDetail: safeBirthDetail,
      success: true,
    });

  } catch (error) {
    console.error("Birth details current error:", error)
    return NextResponse.json(
      { error: "Failed to load birth details" },
      { status: 500 }
    )
  }
}