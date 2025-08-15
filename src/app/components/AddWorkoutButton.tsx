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

type dbExercises = {
  name: string;
};

//FIXES NEEDED: Refactor save workout to go under one API, so that we can do a transaction request. THis will also hopefully fix getting the workoutID and any code redundency
export default function AddWorkoutButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "", weight: "" },
  ]);
  const [userID, setUserID] = useState<string | null>(null);
  const [dbExercises, setDBExercises] = useState<dbExercises[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  );
  const [isVisable, setMessageVisible] = useState(false);

  const supabase = createClient();

  // FUnction to handle adding exercises to the JSON
  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "" }]);
  };

  // Function to handle removing exercises from the JSON
  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  // Function to handle the change of exercises in the JSON
  const handleChangeExercise = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  // Function to fetch exercises
  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/FetchExercises", {
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
      setDBExercises(data);
      console.log("Exercises Set");
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };

  //Use effect to refetch exercises after opening the workout dialog
  useEffect(() => {
    if (showDialog) fetchExercises();
  }, [showDialog]);

  // Function to fetch user ID from Supabase Auth
  const fetchUserId = async (): Promise<string | null> => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) return null;

      const response = await fetch("/api/FetchUserID", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.userID || null;
    } catch {
      return null;
    }
  };

  // Function to save Workout
  const handleSaveWorkout = async () => {
    const fetchedId = await fetchUserId();

    //validate id
    if (!fetchedId) {
      setStatusType("error");
      setStatusMessage("User ID is not set. Please log in.");
      return;
    }

    //validate input is not empty
    if (!workoutName || !workoutDate || exercises.length === 0) {
      setStatusType("error");
      setStatusMessage("Please fill in all required fields.");
      return;
    }

    // Convert exercise fields to numbers where applicable
    const normalizedExercises = exercises.map((ex) => ({
      ...ex,
      sets: Number(ex.sets),
      reps: Number(ex.reps),
      weight: Number(ex.weight),
    }));

    try {
      // Save workout
      const wResponse = await fetch("/api/AddWorkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: fetchedId,
          workoutName,
          workoutDate,
        }),
      });

      const wData = await wResponse.json();
      if (!wResponse.ok)
        throw new Error(wData.message || "Failed to save workout");

      // Insert exercise log
      const logResponse = await fetch("/api/LogWorkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: fetchedId,
          workoutID: wData.id,
          exercises: normalizedExercises,
        }),
      });

      const log = await logResponse.json();
      if (!logResponse.ok)
        throw new Error(log.message || "Failed to save workout log");

      // Success feedback
      setStatusType("success");
      setStatusMessage("Workout saved successfully!");
      setShowDialog(false);
    } catch (e) {
      setStatusType("error");
      setStatusMessage((e as Error).message || "Failed to save workout");
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
                  <select
                    className=" border rounded-md data-focus:bg-blue-100 data-hover:shadow w-[120px] h-[40px] bg-base-100 text-black-100 pl-1 text-md"
                    value={exercise.name}
                    onChange={(e) =>
                      handleChangeExercise(index, "name", e.target.value)
                    }
                  >
                    <option className="text-sm" value="">
                      Select
                    </option>
                    {dbExercises.map((ex, i) => (
                      <option key={i} value={ex.name}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input input-bordered w-[80px] "
                    placeholder="Set"
                    value={exercise.sets}
                    onChange={(e) =>
                      handleChangeExercise(index, "sets", e.target.value)
                    }
                  />
                  <input
                    className="input input-bordered w-[80px] "
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
