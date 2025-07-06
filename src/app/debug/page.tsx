"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.userTag) {
      fetchDbUser();
    }
  }, [session]);

  const fetchDbUser = async () => {
    if (!session?.user?.userTag) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${session.user.userTag}`);
      const data = await response.json();
      setDbUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleSignIn = async () => {
    console.log("🔥 Testing Google Sign In...");
    try {
      const result = await signIn("google", {
        callbackUrl: "/debug",
        redirect: false,
      });
      console.log("Sign in result:", result);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-black border border-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          🐛 Auth Debug Page
        </h1>

        {/* Session Status */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-blue-400 mb-3">
            Session Status
          </h2>
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <p className="text-white">
              Status: <span className="text-yellow-400">{status}</span>
            </p>
            <p className="text-white">
              Session exists:{" "}
              <span className="text-yellow-400">{session ? "Yes" : "No"}</span>
            </p>
            {session && (
              <div className="mt-2">
                <p className="text-white">
                  Email:{" "}
                  <span className="text-green-400">{session.user?.email}</span>
                </p>
                <p className="text-white">
                  Name:{" "}
                  <span className="text-green-400">{session.user?.name}</span>
                </p>
                <p className="text-white">
                  UserTag:{" "}
                  <span className="text-green-400">
                    {session.user?.userTag}
                  </span>
                </p>
                <p className="text-white">
                  ID: <span className="text-green-400">{session.user?.id}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Database User */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-blue-400 mb-3">
            Database User
          </h2>
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            {loading ? (
              <p className="text-yellow-400">Loading...</p>
            ) : dbUser ? (
              <pre className="text-green-400 text-sm overflow-auto">
                {JSON.stringify(dbUser, null, 2)}
              </pre>
            ) : (
              <p className="text-red-400">No database user found</p>
            )}
          </div>
        </div>

        {/* Auth Actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-blue-400">Auth Actions</h2>

          {!session ? (
            <div className="space-x-4">
              <button
                onClick={testGoogleSignIn}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🔥 Test Google Sign In
              </button>
              <button
                onClick={() => signIn("credentials")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign In with Credentials
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Sign Out
              </button>
              <button
                onClick={fetchDbUser}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Refresh DB User
              </button>
            </div>
          )}
        </div>

        {/* Environment Info */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-blue-400 mb-3">
            Environment Info
          </h2>
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <p className="text-white">
              NEXTAUTH_URL:{" "}
              <span className="text-yellow-400">http://localhost:3000</span>
            </p>
            <p className="text-white">
              Google Callback:{" "}
              <span className="text-yellow-400">
                http://localhost:3000/api/auth/callback/google
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
