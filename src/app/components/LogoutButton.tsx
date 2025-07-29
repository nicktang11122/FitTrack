"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/Logout", {
      method: "POST",
      credentials: "include", // Ensure cookies are sent with request
    });
    router.push("/");
  };

  return (
    <button
      className="btn btn-primary hover:btn-secondary"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}
