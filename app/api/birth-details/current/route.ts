// app/api/birth-details/current/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prefer the active row; if you don't have is_active yet, fallback to latest by created_at.
    const { data, error } = await supabase
      .from("birth_details")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // returns null if none

    if (error) {
      console.error("Fetch birth_details error", error);
      return NextResponse.json(
        { error: "Failed to load birth details" },
        { status: 500 },
      );
    }

    return NextResponse.json({ birth_detail: data });
  } catch (error) {
    console.error("Birth details current error", error);
    return NextResponse.json(
      { error: "Failed to load birth details" },
      { status: 500 },
    );
  }
}
