import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    academicLevel: "",
    subjects: "",
    learningStyle: "",
  });
  const [preferredStudyTimes, setPreferredStudyTimes] = useState<TimeSlot[]>([
    { day: "Monday", startTime: "", endTime: "" },
  ]);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTimeSlotChange = (
    index: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    const newTimes = [...preferredStudyTimes];
    newTimes[index] = { ...newTimes[index], [field]: value };
    setPreferredStudyTimes(newTimes);
  };

  const addTimeSlot = () => {
    setPreferredStudyTimes([...preferredStudyTimes, { day: "Monday", startTime: "", endTime: "" }]);
  };

  const removeTimeSlot = (index: number) => {
    if (preferredStudyTimes.length > 1) {
      setPreferredStudyTimes(preferredStudyTimes.filter((_, i) => i !== index));
    }
  };

  const validateTime = (time: string): boolean => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) return setError("Name is required");
    if (!formData.email.trim()) return setError("Email is required");
    if (!formData.password.trim()) return setError("Password is required");
    if (!formData.subjects.trim()) return setError("At least one subject is required");

    for (const slot of preferredStudyTimes) {
      if (slot.startTime && !validateTime(slot.startTime)) {
        return setError("Invalid start time format (use HH:MM)");
      }
      if (slot.endTime && !validateTime(slot.endTime)) {
        return setError("Invalid end time format (use HH:MM)");
      }
      if ((slot.startTime && !slot.endTime) || (!slot.startTime && slot.endTime)) {
        return setError("Both start and end times are required");
      }
    }

    try {
      await axios.post("/api/auth/register", {
        ...formData,
        subjects: formData.subjects.split(",").map((s) => s.trim()).filter((s) => s),
        preferredStudyTimes: preferredStudyTimes.filter(
          (slot) => slot.startTime && slot.endTime
        ),
      });
      alert("Registration successful!");
      router.push("/auth/signin");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-teal-400/40 p-8 rounded-xl shadow-xl space-y-5"
      >
        <h2 className="text-3xl font-bold text-center text-teal-300 drop-shadow">Register</h2>

        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        {[
          { label: "Name", name: "name", type: "text", placeholder: "Enter your name" },
          { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
          { label: "Password", name: "password", type: "password", placeholder: "Enter your password" },
          { label: "Academic Level (Optional)", name: "academicLevel", type: "text", placeholder: "e.g., Undergraduate" },
          { label: "Subjects (Comma-separated)", name: "subjects", type: "text", placeholder: "e.g., Math, Physics" },
          { label: "Learning Style (Optional)", name: "learningStyle", type: "text", placeholder: "e.g., Visual, Auditory" },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-blue-200 mb-1">{label}</label>
            <input
              name={name}
              type={type}
              placeholder={placeholder}
              value={(formData as any)[name]}
              onChange={handleChange}
              required={name !== "academicLevel" && name !== "learningStyle"}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-blue-200 mb-1">Preferred Study Times</label>
          {preferredStudyTimes.map((slot, index) => (
            <div key={index} className="mb-2 flex space-x-2">
              <select
                value={slot.day}
                onChange={(e) => handleTimeSlotChange(index, "day", e.target.value)}
                className="w-1/3 px-2 py-2 rounded bg-white/5 border border-gray-600 text-white"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                placeholder="Start (HH:MM)"
                value={slot.startTime}
                onChange={(e) => handleTimeSlotChange(index, "startTime", e.target.value)}
                className="w-1/3 px-2 py-2 rounded bg-white/5 border border-gray-600 text-white"
              />
              <input
                placeholder="End (HH:MM)"
                value={slot.endTime}
                onChange={(e) => handleTimeSlotChange(index, "endTime", e.target.value)}
                className="w-1/3 px-2 py-2 rounded bg-white/5 border border-gray-600 text-white"
              />
              {preferredStudyTimes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="text-red-400 text-sm ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTimeSlot}
            className="mt-2 text-sm text-teal-400 hover:underline"
          >
            + Add Time Slot
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 py-2 px-4 rounded-lg text-white font-semibold shadow-md transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
