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

export default function AddExercisesButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [exercises, setExercises] = useState([{ name: "" }]);
  const supabase = createClient();
  const handleAddExercise = () => {
    setExercises([...exercises, { name: "" }]);
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

  const fetchUserId = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log("Session data:", data, "Error:", error);
      if (!data.session?.access_token) {
        console.error("No access token found.");
        return null;
      }

      const response = await fetch("/api/FetchUserID", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      console.log("FetchUserID status:", response.status);

      if (!response.ok) {
        console.error("FetchUserID failed:", await response.text());
        return null;
      }

      const result = await response.json();
      console.log("FetchUserID result:", result);

      return result.userID || null;
    } catch (error) {
      console.error("Error fetching user session:", error);
      return null;
    }
  };

  const handleSaveExercises = async () => {
    const fetchedId = await fetchUserId();
    if (!fetchedId) {
      console.error("User ID is not set");
      return;
    }

    console.log("Fetched user ID:", fetchedId);
    const workoutData = {
      user_id: fetchedId,
      exercises: exercises.map((exercise) => ({
        name: exercise.name,
      })),
    };

    try {
      const response = await fetch("/api/AddExercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) throw new Error("Failed to save exercises");

      console.log("Exercises saved successfully:", await response.json());
      setShowDialog(false);
    } catch (error) {
      console.error("Error saving exercises:", error);
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary absolute top-18 right-4 hover:btn-secondary"
        onClick={() => setShowDialog(true)}
      >
        + Add Exercises
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
              Add Exercise
            </DialogTitle>
            <Description className="text-gray-600 text-sm">
              Add all exercises you perform. This will be needed later to add to
              your workouts.
            </Description>
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
              <button className="btn btn-primary" onClick={handleSaveExercises}>
                Save Exercises
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
