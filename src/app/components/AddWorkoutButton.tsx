"use client";
import React, { useEffect, useState } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";

export default function AddWorkoutButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "", weight: "" },
  ]);

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

  // need to fix. Submit workouts and exercises separately preferbly in a transaction at the same time, if one fails both fail. Then
  // Submit both the workout id and exercise id to the join table exercise_logs.
  const handleSaveWorkout = async () => {
    try {
      // 1. Create the workout
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutName,
          date: workoutDate,
          userId: "current-user-id", // Replace with actual user ID logic
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create workout");
      }

      const workout = await res.json(); // should contain `id` (UUID)

      // 2. Submit each exercise with workoutId
      for (const ex of exercises) {
        const exerciseRes = await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workoutId: workout.id, // UUID from the created workout
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          }),
        });

        if (!exerciseRes.ok) {
          throw new Error(`Failed to add exercise: ${ex.name}`);
        }
      }

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
              <button className="btn btn-primary" onClick={handleSave}>
                Save Workout
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
