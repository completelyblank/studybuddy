// src/pages/auth/register.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    academicLevel: "",
    subjects: "",
    preferredStudyTimes: "",
    learningStyle: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/api/auth/register", {
        ...formData,
        subjects: formData.subjects.split(",").map((s) => s.trim()),
        preferredStudyTimes: formData.preferredStudyTimes.split(",").map((s) => s.trim()),
      });
      alert("Registration successful!");
      router.push("/auth/signin");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input name="name" placeholder="Name" required onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="email" placeholder="Email" required type="email" onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="password" placeholder="Password" required type="password" onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        
        <input name="academicLevel" placeholder="Academic Level" onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="subjects" placeholder="Subjects (comma separated)" onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="preferredStudyTimes" placeholder="Preferred Times (comma separated)" onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />
        <input name="learningStyle" placeholder="Learning Style (optional)" onChange={handleChange} className="w-full p-2 rounded bg-gray-800" />

        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
