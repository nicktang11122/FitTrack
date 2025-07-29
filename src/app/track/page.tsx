import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
      <button className="btn btn-primary absolute top-4 right-4 hover:btn-secondary">
        + Add Workout
      </button>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Workout Type</th>
            <th>Duration</th>
            <th>Calories Burned</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2023-10-01</td>
            <td>Running</td>
            <td>30 mins</td>
            <td>300 kcal</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
