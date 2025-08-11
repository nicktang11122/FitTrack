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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  );
  const supabase = createClient();
  const [isVisable, setMessageVisible] = useState(false);

  // Add new exercise to state
  const handleAddExercise = () => {
    setExercises([...exercises, { name: "" }]);
  };

  // Remove exercise from state
  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  // Update exercise name in state
  const handleChangeExercise = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

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

  function fadeOutMessage() {
    setTimeout(() => {
      setMessageVisible(false);
    }, 3000);

    setTimeout(() => {
      setStatusMessage(null);
    }, 3600);
  }

  // Function to handle saving exercises
  const handleSaveExercises = async () => {
    //fetch user id from supabase auth to send to the api route
    const fetchedId = await fetchUserId();
    if (!fetchedId) {
      setStatusType("error");
      setStatusMessage("User ID is not set. Please log in.");
      return;
    }

    // Remove duplicate exercises based on name (case-insensitive)
    const uniqueExercises = exercises.filter(
      (ex, index, self) =>
        index ===
        self.findIndex(
          (e) => e.name.trim().toLowerCase() === ex.name.trim().toLowerCase()
        )
    );

    // Prepare data to send to the API
    const workoutData = {
      user_id: fetchedId,
      exercises: uniqueExercises.map((exercise) => ({
        name: exercise.name,
      })),
    };

    // Send data to the API route
    try {
      const response = await fetch("/api/AddExercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to save exercises");
      // Show success message
      setStatusType("success");
      setStatusMessage(`${data.message}`);
      setMessageVisible(true);
      fadeOutMessage();
    } catch (error) {
      // Show error message
      setStatusType("error");
      setStatusMessage(
        `Error saving exercises: ${
          (error as { message: string }).message || "Unknown error"
        }`
      );
      setMessageVisible(true);
      fadeOutMessage();
    }
    setShowDialog(false);
    setExercises([{ name: "" }]); // Reset exercises after saving
  };

  return (
    <div>
      <button
        className="btn btn-primary absolute top-18 right-4 hover:btn-secondary"
        onClick={() => setShowDialog(true)}
      >
        + Add Exercises
      </button>
      {/* Dialog for Adding Exercises */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg bg-white p-6 space-y-6 shadow-xl">
            {/* Title & Description */}
            <DialogTitle className="text-2xl font-bold">
              Add Exercise
            </DialogTitle>
            <Description className="text-gray-600 text-sm">
              Add all exercises you perform. This will be needed later to add to
              your workouts.
            </Description>

            {/* Exercise List */}
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

            {/* Action Buttons */}
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
      {/* Status Message*/}
      {statusMessage && (
        <div
          className={`p-2 rounded ${
            statusType === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}
