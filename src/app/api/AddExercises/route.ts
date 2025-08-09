import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { user_id, exercises } = await req.json();

    if (!user_id || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize input exercise names
    const exerciseNames = exercises.map((ex: { name: string }) =>
      ex.name.trim().toLowerCase()
    );

    // Fetch existing exercises for this user with those names
    const { data: existing } = await supabase
      .from("exercises")
      .select("name")
      .eq("created_by", user_id)
      .in("name", exerciseNames);

    const existingNames = existing ? existing.map((e) => e.name) : [];

    // Filter out exercises that already exist
    const newExercises = exercises.filter(
      (ex: { name: string }) =>
        !existingNames.includes(ex.name.trim().toLowerCase())
    );

    if (newExercises.length === 0) {
      return NextResponse.json(
        { message: "No new exercises to add." },
        { status: 200 }
      );
    }

    // Prepare insert data for new exercises
    const insertData = newExercises.map((ex: { name: string }) => ({
      name: ex.name.trim().toLowerCase(),
      created_by: user_id,
    }));

    // Insert only the new exercises
    const { data, error } = await supabase
      .from("exercises")
      .insert(insertData)
      .select();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { message: "No exercises were added." },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "Exercises added successfully",
        added: data.length,
        skipped: exercises.length - newExercises.length,
        data,
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
