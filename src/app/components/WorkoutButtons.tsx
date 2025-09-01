import React, { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";

type dbExercises = {
  name: string;
};

type Workout = {
  id: number;
  workoutName: string;
  workoutDate: string;
};

type WorkoutExercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

export default function WorkoutButtons({ workoutId }: { workoutId: number }) {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    { name: "", sets: 0, reps: 0, weight: 0 },
  ]);
  const [dbExercises, setDBExercises] = useState<dbExercises[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  );
  const [isVisable, setMessageVisible] = useState(false);

  const supabase = createClient();

  // Add exercise row
  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: 0, reps: 0, weight: 0 }]);
  };

  // Remove exercise row
  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  // Change field
  const handleChangeExercise = (
    index: number,
    field: keyof WorkoutExercise,
    value: string | number
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  // Fetch all exercise options (for dropdown)
  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/FetchExercises");
      if (!response.ok) throw new Error("Failed to fetch exercises");
      const data = await response.json();
      setDBExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  const fetchFullWorkout = async (workoutId: number) => {
    try {
      const response = await fetch("/api/FetchFullWorkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workout_id: workoutId }),
      });

      if (!response.ok) throw new Error("Failed to fetch workout");

      const data = await response.json();

      // If your API returns the structured WorkoutResponse directly:
      setWorkoutName(data.workoutName);
      setWorkoutDate(data.workoutDate);
      setExercises(data.exercises);
    } catch (error) {
      console.error("Error fetching full workout:", error);
      setStatusType("error");
      setStatusMessage("Failed to load workout data.");
    }
  };
  // Load data when opening update dialog
  useEffect(() => {
    if (updateOpen && workoutId) {
      fetchExercises();
      fetchFullWorkout(workoutId);
    }
  }, [updateOpen, workoutId]);

  return (
    <div>
      <div className="flex space-x-2">
        <button
          className="bg-primary text-white px-3 py-1 rounded hover:bg-secondary"
          onClick={() => setUpdateOpen(true)}
        >
          Update
        </button>
        <button
          className="bg-primary text-white px-3 py-1 rounded hover:bg-secondary"
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </button>
      </div>

      {/* UPDATE DIALOG */}
      <Dialog
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg bg-white p-6 space-y-6 shadow-xl">
            <DialogTitle className="text-2xl font-bold">
              Update Workout
            </DialogTitle>
            <Description className="text-gray-600 text-sm">
              Modify your workout details and exercises below.
            </Description>

            {/* Workout name */}
            <div>
              <label className="block mb-1 font-medium">Workout Name:</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block mb-1 font-medium">Date:</label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
              />
            </div>

            {/* Exercises */}
            <div>
              <p className="font-medium mb-2">Exercises:</p>
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex flex-wrap gap-2 items-center mb-2"
                >
                  <select
                    className="border rounded-md w-[120px] h-[40px] bg-base-100 pl-1 text-md"
                    value={exercise.name}
                    onChange={(e) =>
                      handleChangeExercise(index, "name", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {dbExercises.map((ex, i) => (
                      <option key={i} value={ex.name}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input input-bordered w-[80px]"
                    placeholder="Set"
                    value={exercise.sets}
                    onChange={(e) =>
                      handleChangeExercise(
                        index,
                        "sets",
                        Number(e.target.value)
                      )
                    }
                  />
                  <input
                    className="input input-bordered w-[80px]"
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) =>
                      handleChangeExercise(
                        index,
                        "reps",
                        Number(e.target.value)
                      )
                    }
                  />
                  <input
                    className="input input-bordered w-[100px]"
                    placeholder="Weight"
                    value={exercise.weight}
                    onChange={(e) =>
                      handleChangeExercise(
                        index,
                        "weight",
                        Number(e.target.value)
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    className="text-red-500 hover:text-red-700 text-xl"
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

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                className="btn btn-secondary"
                onClick={() => setUpdateOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => console.log("TODO: Update Workout API")}
              >
                Save Workout
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
