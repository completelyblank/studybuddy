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
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time); // HH:MM format
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return;
    }
    if (!formData.subjects.trim()) {
      setError("At least one subject is required");
      return;
    }

    // Validate preferredStudyTimes
    for (const slot of preferredStudyTimes) {
      if (slot.startTime && !validateTime(slot.startTime)) {
        setError("Invalid start time format (use HH:MM, e.g., 09:00)");
        return;
      }
      if (slot.endTime && !validateTime(slot.endTime)) {
        setError("Invalid end time format (use HH:MM, e.g., 11:00)");
        return;
      }
      if ((slot.startTime && !slot.endTime) || (!slot.startTime && slot.endTime)) {
        setError("Both start and end times are required for each time slot");
        return;
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
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            placeholder="Enter your name"
            required
            onChange={handleChange}
            value={formData.name}
            className="w-full p-2 rounded bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            placeholder="Enter your email"
            required
            type="email"
            onChange={handleChange}
            value={formData.email}
            className="w-full p-2 rounded bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            placeholder="Enter your password"
            required
            type="password"
            onChange={handleChange}
            value={formData.password}
            className="w-full p-2 rounded bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Academic Level (Optional)</label>
          <input
            name="academicLevel"
            placeholder="e.g., Undergraduate"
            onChange={handleChange}
            value={formData.academicLevel}
            className="w-full p-2 rounded bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subjects (Comma-separated)</label>
          <input
            name="subjects"
            placeholder="e.g., Math, Physics"
            onChange={handleChange}
            value={formData.subjects}
            className="w-full p-2 rounded bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred Study Times</label>
          {preferredStudyTimes.map((slot, index) => (
            <div key={index} className="mb-2 flex space-x-2">
              <select
                value={slot.day}
                onChange={(e) => handleTimeSlotChange(index, "day", e.target.value)}
                className="w-1/3 p-2 rounded bg-gray-800"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                placeholder="Start (HH:MM)"
                value={slot.startTime}
                onChange={(e) => handleTimeSlotChange(index, "startTime", e.target.value)}
                className="w-1/3 p-2 rounded bg-gray-800"
              />
              <input
                placeholder="End (HH:MM)"
                value={slot.endTime}
                onChange={(e) => handleTimeSlotChange(index, "endTime", e.target.value)}
                className="w-1/3 p-2 rounded bg-gray-800"
              />
              {preferredStudyTimes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="text-red-500 ml-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTimeSlot}
            className="text-teal-500 text-sm mt-2"
          >
            Add Time Slot
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Learning Style (Optional)</label>
          <input
            name="learningStyle"
            placeholder="e.g., Visual, Auditory"
            onChange={handleChange}
            value={formData.learningStyle}
            className="w-full p-2 rounded bg-gray-800"
          />
        </div>

        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
