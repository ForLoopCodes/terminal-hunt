"use client";

import { useEffect, useState } from "react";

export function SecurityWarning() {
  const [isHTTP, setIsHTTP] = useState(false);

  useEffect(() => {
    setIsHTTP(
      window.location.protocol === "http:" &&
        window.location.hostname !== "localhost"
    );
  }, []);

  if (!isHTTP) return null;

  return (
    <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-4">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <p className="font-medium">⚠️ Security Warning</p>
          <p className="text-sm mt-1">
            This site is not using HTTPS. Your password and data are transmitted
            in plain text and can be intercepted. For security, only use this on
            localhost or enable HTTPS.
          </p>
        </div>
      </div>
    </div>
  );
}
