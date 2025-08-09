"use client";
import React, { useEffect, useState } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { createClient } from "../../../utils/supabase/client";

export default function AddWorkoutButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "", weight: "" },
  ]);
  const [userID, setUserID] = useState<string | null>(null);
  const supabase = createClient();
  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "" }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleChangeExercise = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const fetchUserId = async () => {
    try {
      const { data } = await supabase.auth.getSession();

      if (!data.session || !data.session.access_token) {
        console.error("No active session");
        return;
      }

      // Fetch user data from the backend
      const response = await fetch("/api/FetchUserID", {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUserID(result.userID);
        //log the fetched user ID for debugging
        console.log("Fetched user ID:", result.userID);
      } else {
        console.error("Failed to fetch user session.");
      }
    } catch (error) {
      console.error("Error fetching user session:", error);
    }
  };

  const handleSaveWorkout = async () => {
    try {
      // 1. Create the workout
      const res = await fetch("/api/AddWorkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutName,
          date: workoutDate,
          userId: userID, // Use the fetched user ID
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create workout");
      }

      console.log("Workout created successfully");
      const workout = await res.json(); // should contain `id` (UUID)

      // 2. Submit each exercise with workoutId
      for (const ex of exercises) {
        const exerciseRes = await fetch("/api/AddExercise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          }),
        });

        console.log("Exercise data:", {
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        });
        if (!exerciseRes.ok) {
          throw new Error(`Failed to add exercise: ${ex.name}`);
        }

        const exerciseData = await exerciseRes.json();
        // 3. Submit each exerciseID linked to the workout to exercise_log table
        const logRes = await fetch("/api/AddExerciseLog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workoutId: workout.id, // Use the created workout ID
            exerciseId: exerciseData.id, // Use the created exercise ID
          }),
        });
        if (!logRes.ok) {
          throw new Error(`Failed to log exercise: ${ex.name}`);
        }
      }
      // 4. Close the dialog and reset fields
      setShowDialog(false);
      setWorkoutName("");
      setWorkoutDate("");
      setExercises([{ name: "", sets: "", reps: "", weight: "" }]);

      // 5. Optionally, refresh the workout list or show a success message
      console.log("Workout and exercises saved successfully");

      alert("Workout saved successfully!");
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("There was an error saving your workout.");
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary absolute top-4 right-4 hover:btn-secondary"
        onClick={() => setShowDialog(true)}
      >
        + Add Workout
      </button>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg bg-white p-6 space-y-6 shadow-xl">
            <DialogTitle className="text-2xl font-bold">
              Add Workout
            </DialogTitle>
            <Description className="text-gray-600 text-sm">
              Add the exercises you performed during this workout session. Treat
              each set as a separate exercise entry. EX: 3 Sets of bench press =
              3 Entries.
            </Description>
            <div>
              <label className="block mb-1 font-medium">Workout Name:</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Push Day"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Date:</label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
              />
            </div>

            <div>
              <p className="font-medium mb-2">Exercises:</p>
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex flex-wrap gap-2 items-center mb-2"
                >
                  <input
                    className="input input-bordered w-[120px]"
                    placeholder="Exercise"
                    value={exercise.name}
                    onChange={(e) =>
                      handleChangeExercise(index, "name", e.target.value)
                    }
                  />
                  <input
                    className="input input-bordered w-[80px]"
                    placeholder="Set"
                    value={exercise.sets}
                    onChange={(e) =>
                      handleChangeExercise(index, "sets", e.target.value)
                    }
                  />
                  <input
                    className="input input-bordered w-[80px]"
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) =>
                      handleChangeExercise(index, "reps", e.target.value)
                    }
                  />
                  <input
                    className="input input-bordered w-[100px]"
                    placeholder="Weight"
                    value={exercise.weight}
                    onChange={(e) =>
                      handleChangeExercise(index, "weight", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    className="text-red-500 hover:text-red-700 text-xl"
                    title="Remove Exercise"
                  >
                    ✖️
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddExercise}
                className="btn btn-outline mt-2"
              >
                + Add Exercise
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveWorkout}>
                Save Workout
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
