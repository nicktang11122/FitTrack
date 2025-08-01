"use client";
import React, { useState } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
export default function AddWorkoutButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "", weight: "" },
  ]);

  const handleExercises = () => {
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
    const updatedExercises = [...exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setExercises(updatedExercises);
  };

  const handleSave = () => {
    // For now, just log the data
    console.log({
      workoutName,
      workoutDate,
      exercises,
    });
    setShowDialog(false);
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
        {" "}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <DialogTitle className="font-bold">Deactivate account</DialogTitle>
            <Description>
              This will permanently deactivate your account
            </Description>
            <p>
              Are you sure you want to deactivate your account? All of your data
              will be permanently removed.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowDialog(false)}>Cancel</button>
              <button onClick={() => setShowDialog(false)}>Deactivate</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
