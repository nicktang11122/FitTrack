"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
export default function Welcome() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session || !data.session.access_token) {
          console.error("No active session");
          router.replace("/");
          return;
        }

        // Fetch user data from the backend
        const response = await fetch("/api/FetchName", {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setUsername(result.username);
        } else {
          console.error("Failed to fetch user session.");
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!username) {
    return null;
  }
  return (
    <h1 className="text-5xl text-pink-500 font-serif font-bold mb-10">
      Welcome, {username}
    </h1>
  );
}
