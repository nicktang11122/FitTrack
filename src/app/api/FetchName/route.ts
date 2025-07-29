import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1]; // Extract the token

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    // Fetch user data using the token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Return user data
    return NextResponse.json(
      { username: user.user_metadata?.name || "User" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
