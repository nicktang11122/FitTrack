"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [suscess, setSuccess] = useState(false);
  const router = useRouter();
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      // Send a POST request to the backend registration endpoint
      const response = await fetch("/api/RegisterUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      console.log("Registration successful:", result);
      setSuccess(true);

      //Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <div className="card-body p-8">
        <form onSubmit={handleRegister}>
          <label className="label">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="input input-bordered w-full"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="input input-bordered w-full"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="input input-bordered w-full"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-center mt-4">
            <button type="submit" className="btn btn-primary">
              Sign Up
            </button>
          </div>
        </form>
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
        {suscess && (
          <p className="text-green-600 mt-4 text-center">
            Registration successful! Redirecting to login...
          </p>
        )}
      </div>
    </div>
  );
}
