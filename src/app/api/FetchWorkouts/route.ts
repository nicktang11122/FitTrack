import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
export async function GET() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  //Fetch User Workouts
  const { data: workouts, error } = await supabase
    .from("workout_sessions")
    .select("id, date, sessionName")
    .order("date", { ascending: false });
  if (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { message: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
  return NextResponse.json(workouts, { status: 200 });
}
