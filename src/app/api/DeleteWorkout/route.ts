import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  try {
    const { workout_id, user_id } = await request.json();

    if (!workout_id || !user_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Delete exercise_logs associated with the workout session
    const { error: logsError } = await supabase
      .from("exercise_logs")
      .delete()
      .eq("workout_id", workout_id);

    if (logsError) {
      console.log("logsError");
      console.log(logsError);
      return NextResponse.json({ message: logsError.message }, { status: 400 });
    }

    // Delete the workout session
    const { error: sessionError } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", workout_id)
      .eq("user_id", user_id);

    if (sessionError) {
      console.log("sessionError");
      console.log(sessionError);
      return NextResponse.json(
        { message: sessionError.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Workout session and associated logs deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
