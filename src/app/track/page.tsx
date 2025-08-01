import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WorkoutTable from "../components/WorkoutTable";
import AddWorkoutButton from "../components/AddWorkoutButton";

export default async function Home() {
  //   const cookieStore = cookies();
  //   const supabase = await createClient(cookieStore);
  //   const {
  //     data: { session },
  //   } = await supabase.auth.getSession();

  //   // Redirect if not logged in
  //   if (!session) {
  //     redirect("/");
  //   }
  return (
    <div className="relative min-h-screen min-w-screen bg-base-100 flex flex-col items-center justify-center px-4 pb-7">
      <h2 className="text-5xl font-bold absolute top-4 center ">
        Your Workout History
      </h2>
      <AddWorkoutButton />
      <WorkoutTable />
    </div>
  );
}
