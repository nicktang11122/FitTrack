import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { workoutID, exercises } = await req.json();

    // Validate input
    if (!Array.isArray(exercises) || exercises.length === 0 || !workoutID) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare insert data for new exercises
    const insertData = {
      sessionName: workoutName.trim(),
      date: workoutDate,
      user_id: user_id,
    };

    // Insert only the new exercises
    const { data, error } = await supabase
      .from("workout_sessions")
      .insert(insertData)
      .select();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { message: "Workout was not added." },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "Workout added successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error adding exercises:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
