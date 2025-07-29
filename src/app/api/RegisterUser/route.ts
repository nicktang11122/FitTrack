import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

// Handle POST requests
export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sign up the user via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Check if the user object is null or undefined
    if (!data?.user) {
      return NextResponse.json(
        { message: "User creation failed. No user data returned." },
        { status: 400 }
      );
    }

    const userUuid = data.user.id;

    // Log the data before insertion, make sure it works
    console.log("Inserting data:", {
      id: userUuid,
      name: name,
      email,
      created_at: new Date(),
    });

    // Insert user details into the user_table
    const { data: insertData, error: dbError } = await supabase
      .from("users")
      .insert([
        {
          id: userUuid,
          name: name,
          email,
          created_at: new Date(),
        },
      ]);

    // Log the response from Supabase
    console.log("Insert Response:", insertData, dbError);

    if (dbError) {
      console.error("Database insert error:", dbError);
      return NextResponse.json(
        { message: "Database insert failed", error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully", user: data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
