import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { user_id, workoutName, workoutDate, exercises } = await req.json();

    // Validate input
    if (
      !user_id ||
      !workoutName ||
      !workoutDate ||
      !Array.isArray(exercises) ||
      exercises.length === 0
    ) {
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

    // If there's an error, return it
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // If no data is returned, return a message
    if (!data) {
      return NextResponse.json(
        { message: "Workout was not added." },
        { status: 200 }
      );
    }

    // Get the ID of the newly created workout session
    const workoutID = data[0].id;

    if (!workoutID) {
      return NextResponse.json(
        { message: "Workout ID is not set. Please try again." },
        { status: 400 }
      );
    }

    // Get just the names from exercises
    const exerciseNames = exercises.map((ex: { name: string }) => ex.name);

    // Fetch existing exercises for this user
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

    // Map exercise names to their IDs
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
      {
        message: "Workout added successfully and exercises logged",
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
