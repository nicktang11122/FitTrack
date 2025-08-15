import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { user_id, workoutID, exercises } = await req.json();

    // Validate input
    if (
      !user_id ||
      !Array.isArray(exercises) ||
      exercises.length === 0 ||
      !workoutID
    ) {
      console.log("error1");
      console.log(user_id);
      console.log(workoutID);
      console.log(exercises);
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get just the names from exercises
    const exerciseNames = exercises.map((ex: { name: string }) => ex.name);

    // 1️ Fetch existing exercises for this user
    const { data: existing, error: fetchError } = await supabase
      .from("exercises")
      .select("id, name")
      .eq("created_by", user_id)
      .in("name", exerciseNames);

    if (fetchError) {
      console.log("error2");

      return NextResponse.json(
        { message: fetchError.message },
        { status: 400 }
      );
    }

    //
    const nameToId = new Map(existing.map((e) => [e.name, e.id]));

    // 4️ Build log entries with correct IDs
    const logEntries = exercises.map((ex) => ({
      workout_id: workoutID,
      exercise_id: nameToId.get(ex.name),
      set_number: Number(ex.sets), // ensure numeric
      reps: Number(ex.reps),
      weight: Number(ex.weight),
    }));

    // 5 Insert into logs
    const { error: logError } = await supabase
      .from("exercise_logs")
      .insert(logEntries);

    if (logError) {
      console.log("error3");

      return NextResponse.json({ message: logError.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Log added successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error adding log:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
