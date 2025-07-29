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
   
  }, []);
  return (
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
  );
}
