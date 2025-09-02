import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
import { log } from "console";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { user_id, workout_id, workoutName, workoutDate, exercises } =
      await req.json();

    if (
      !user_id ||
      !workout_id ||
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
    // Update workout session details
    const { error: updateError } = await supabase
      .from("workout_sessions")
      .update({ sessionName: workoutName.trim(), date: workoutDate })
      .eq("id", workout_id);

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 400 }
      );
    }

    // Delete existing exercise logs for the workout
    const { error: deleteError } = await supabase
      .from("exercise_logs")
      .delete()
      .eq("workout_id", workout_id);

    if (deleteError) {
      return NextResponse.json(
        { message: deleteError.message },
        { status: 400 }
      );
    }

    // Get just the names from exercises
    const exerciseNames = exercises.map((ex: { name: string }) => ex.name);

    console.log("exerciseNames from request:", exerciseNames);
    console.log("user_id passed in:", user_id);

    const { data: existing, error: fetchError } = await supabase
      .from("exercises")
      .select("id, name, created_by")
      .eq("created_by", user_id)
      .in("name", exerciseNames);

    console.log("existing rows from Supabase:", existing);

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
      workout_id: workout_id,
      exercise_id: nameToId.get(ex.name),
      set_number: Number(ex.sets), // ensure numeric
      reps: Number(ex.reps),
      weight: Number(ex.weight),
    }));

    // Insert new exercise logs
    const { error: insertError } = await supabase
      .from("exercise_logs")
      .insert(logEntries);
    if (insertError) {
      return NextResponse.json(
        { message: insertError.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Workout updated successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the workout." },
      { status: 500 }
    );
  }
}
