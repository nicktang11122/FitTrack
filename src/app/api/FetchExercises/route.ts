import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
export async function GET() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  //Fetch User Workouts
  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("name")
    .order("name", { ascending: false });
  if (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { message: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
  console.log("suscess");
  return NextResponse.json(exercises, { status: 200 });
}
