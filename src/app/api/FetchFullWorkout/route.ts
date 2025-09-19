import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

// Types
type WorkoutExercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

type WorkoutResponse = {
  workoutName: string;
  workoutDate: string;
  exercises: WorkoutExercise[];
};

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { workout_id } = await req.json();

    if (!workout_id) {
      return NextResponse.json(
        { message: "Missing workout_id" },
        { status: 400 }
      );
    }

    // 1Fetch workout session details
    const { data: workoutData, error: workoutError } = await supabase
      .from("workout_sessions")
      .select("sessionName, date")
      .eq("id", workout_id)
      .single();

    if (workoutError || !workoutData) {
      console.error("Error fetching workout:", workoutError);
      return NextResponse.json(
        { message: "Failed to fetch workout session details" },
        { status: 500 }
      );
    }

    //  Fetch exercises with logs
    const { data: exerciseLogs, error: logsError } = await supabase
      .from("exercise_logs")
      .select(`set_number, reps, weight, exercises!inner(name)`)
      .eq("workout_id", workout_id);

    if (logsError) {
      console.error("Error fetching exercise logs:", logsError);
      return NextResponse.json(
        { message: "Failed to fetch exercise logs" },
        { status: 500 }
      );
    }

    //  Map exercises
    const exercises: WorkoutExercise[] =
      exerciseLogs?.map((log: any) => ({
        name: log.exercises.name,
        sets: log.set_number,
        reps: log.reps,
        weight: log.weight,
      })) || [];

    // Construct response
    const response: WorkoutResponse = {
      workoutName: workoutData.sessionName,
      workoutDate: workoutData.date,
      exercises,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
