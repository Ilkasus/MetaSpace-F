import { useState } from "react";

export default function RegisterForm({ onSuccess, switchToLogin }) {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("https://metaspace-yhja.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      });

      if (!res.ok) {
        let errorMsg;
        try {
          const data = await res.json();
          errorMsg = data.detail || "Registration failed";
        } catch {
          const text = await res.text();
          errorMsg = text || "Registration failed";
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Registration successful:", data);
      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error("Network or other error:", err);
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>

      <input
        type="text"
        placeholder="Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
        className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />

      {error && (
        <p className="text-red-600 mb-4 text-center font-medium" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-3 rounded text-white font-semibold ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        } transition`}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={switchToLogin}
          className="text-blue-600 underline hover:text-blue-800"
          disabled={loading}
        >
          Login
        </button>
      </p>
    </form>
  );
}

