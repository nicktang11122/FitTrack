import Welcome from "@/app/components/Welcome";
import Logout from "@/app/components/LogoutButton";
import Image from "next/image";
import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect if not logged in
  if (!session) {
    redirect("/");
  }
  return (
    <div className="relative min-h-screen min-w-screen bg-base-100 flex flex-col items-center justify-center px-4 pb-7">
      <div className="absolute top-4 right-4">
        <Logout />
      </div>
      <div className="mt-30">
        <Welcome />
      </div>
      <p className="text-lg text-center text-pink-400 font-serif justify-center mb-6">
        Come track your workouts here!
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <button className="flex-1 p-6 rounded-lg shadow text-center bg-pink-500 hover:bg-pink-600 text-white font-semibold transition duration-200 btn-lg">
          Track Your Workouts
        </button>

        <button className="flex-1 p-6 rounded-lg shadow text-center bg-pink-500 hover:bg-pink-600 text-white font-semibold transition duration-20 btn-lg">
          View Progress
        </button>
      </div>
      <div className="text-center mt-4">
        <Image
          src="/TomPlatzMotivation.jpg"
          alt="Logo"
          width={500}
          height={400}
          className="mx-auto mb-4 bg-base-100 square-full shadow-lg"
        />
      </div>
    </div>
  );
}
