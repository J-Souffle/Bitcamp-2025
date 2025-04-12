"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleCall = async () => {
    setStatus(""); // Reset status
    try {
      const response = await fetch("/api/makeCall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, message }),
      });
      

      if (response.ok) {
        setStatus("Call initiated successfully!");
      } else {
        setStatus("Failed to initiate the call. Please try again.");
      }
    } catch (error) {
      console.error("Error making call:", error);
      setStatus("An error occurred. Please try again.");
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">Enter a phone number and message below to initiate a call.</li>
        </ol>

        {/* Input fields for phone number and message */}
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="Enter phone number (e.g., +12406015564)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={handleCall}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Call Now
          </button>
          {status && <p className="text-sm text-red-500 mt-2">{status}</p>}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* Footer remains the same */}
      </footer>
    </div>
  );
}
