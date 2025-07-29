import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  await supabase.auth.signOut();

  //manually clear 
  return NextResponse.json(
    { message: "Signed out" },
    {
      status: 200,
      headers: {
        "Set-Cookie": [
          `sb-access-token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
          `sb-refresh-token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
        ].join(", "),
      },
    }
  );
}
