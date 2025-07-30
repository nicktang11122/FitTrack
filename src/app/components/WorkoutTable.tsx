"use client";
import React, { useEffect, useState, use } from "react";
type Workout = {
  id: number;
  date: string;
  sessionName: string;
};
export default function WorkoutTable() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  useEffect(() => {
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
    fetchWorkouts();
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
                <button className="bg-primary text-white px-3 py-1 rounded hover:bg-blue-700">
                  Update
                </button>
                <button className="bg-secondary text-white px-3 py-1 rounded hover:bg-red-700">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
