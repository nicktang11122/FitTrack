"use client";
import React, { useEffect, useState, use } from "react";

export default function WorkoutTable() {
  let [workouts, setWorkouts] = useState([]);
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
        setWorkouts(data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };
    fetchWorkouts();
  }, []);
  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {workouts.map((workout: any) => (
          <tr key={workout.id}>
            <td>{workout.date}</td>
            <td>{workout.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
