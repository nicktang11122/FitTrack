"use client";
import React, { useEffect, useState } from "react";
import WorkoutButtons from "./WorkoutButtons";
type Workout = {
  id: number;
  date: string;
  sessionName: string;
};
export default function WorkoutTable() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  // Move fetchWorkouts outside so both effects can access it
  const fetchWorkouts = async () => {
    try {
      const response = await fetch("/api/FetchWorkouts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workouts");
      }

      const data = await response.json();
      console.log("Fetched workouts:", data);
      setWorkouts(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };

  // Fetch on initial load
  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Re-fetch when "workout-added" event is dispatched
  useEffect(() => {
    const handler = () => fetchWorkouts();
    window.addEventListener("workout-added", handler);
    return () => window.removeEventListener("workout-added", handler);
  }, []);

  return (
    <table className="table-auto w-full border-collapse border border-black-100">
      <thead className="bg-base-100">
        <tr>
          <th className="border border-black-300 px-4 py-2 text-left">Date</th>
          <th className="border border-black-300 px-4 py-2 text-left">Name</th>
          <th className="border border-black-300 px-4 py-2 text-left">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {workouts.map((workout) => (
          <tr key={workout.id} className="hover:bg-gray-50">
            <td className="border border-black-300 px-4 py-2">
              {workout.date}
            </td>
            <td className="border border-black-300 px-4 py-2">
              {workout.sessionName}
            </td>
            <td className="border border-black-300 px-4 py-2">
              <div className="flex space-x-2">
                <WorkoutButtons workoutId={workout.id} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
