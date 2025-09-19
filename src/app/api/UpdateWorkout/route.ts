import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { user_id, workout_id, workoutName, workoutDate, exercises } =
      await req.json();

    // Validate required fields
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

    const seen = new Set();
    const duplicates: string[] = [];

    for (const ex of exercises) {
      if (seen.has(ex.name)) {
        duplicates.push(ex.name);
      }
      seen.add(ex.name);
    }

    if (duplicates.length > 0) {
      return NextResponse.json(
        {
          message:
            "Duplicate exercise(s) in request. Please remove duplicates.",
          data: duplicates,
        },
        { status: 400 }
      );
    }

    // Extract exercise names from payload
    const exerciseNames = exercises.map((ex: { name: string }) => ex.name);

    // Fetch matching exercise IDs from Supabase
    const { data: existing, error: fetchError } = await supabase
      .from("exercises")
      .select("id, name, created_by")
      .eq("created_by", user_id)
      .in("name", exerciseNames);

    if (fetchError) {
      return NextResponse.json(
        { message: fetchError.message },
        { status: 400 }
      );
    }

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

    const nameToId = new Map(existing?.map((e) => [e.name, e.id]));

    // Build exercise log entries
    const logEntries = exercises.map((ex) => ({
      workout_id: workout_id,
      exercise_id: nameToId.get(ex.name), // assumes exercise already exists in DB
      set_number: Number(ex.sets),
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
