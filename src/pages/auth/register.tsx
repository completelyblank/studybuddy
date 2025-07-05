import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Button, Input, Card, Badge, Grid, LoadingSpinner } from "../../components/ui";
import Link from "next/link";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.subjects.trim()) {
      newErrors.subjects = "At least one subject is required";
    }

    // Validate time slots
    for (let i = 0; i < preferredStudyTimes.length; i++) {
      const slot = preferredStudyTimes[i];
      if (slot.startTime && !validateTime(slot.startTime)) {
        newErrors[`timeSlot${i}`] = "Invalid start time format (use HH:MM)";
      }
      if (slot.endTime && !validateTime(slot.endTime)) {
        newErrors[`timeSlot${i}`] = "Invalid end time format (use HH:MM)";
      }
      if ((slot.startTime && !slot.endTime) || (!slot.startTime && slot.endTime)) {
        newErrors[`timeSlot${i}`] = "Both start and end times are required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post("/api/auth/register", {
        ...formData,
        subjects: formData.subjects.split(",").map((s) => s.trim()).filter((s) => s),
        preferredStudyTimes: preferredStudyTimes.filter(
          (slot) => slot.startTime && slot.endTime
        ),
      });

      toast.success("Registration successful! Redirecting...", {
        onClose: () => router.push("/auth/signin"),
        autoClose: 2000,
      });

    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-2xl">
        <Card variant="elevated" className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-xl" />
              <h1 className="text-3xl font-bold text-teal-300">StudyBuddy</h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
            <p className="text-gray-300">Join thousands of students learning together</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <Grid cols={2} gap="md">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="Enter your email"
                  required
                />
              </Grid>
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a strong password"
                helperText="Must be at least 6 characters long"
                required
              />
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Academic Information</h3>
              <Grid cols={2} gap="md">
                <Input
                  label="Academic Level"
                  name="academicLevel"
                  type="text"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  placeholder="e.g., Undergraduate, Graduate"
                />
                <Input
                  label="Learning Style"
                  name="learningStyle"
                  type="text"
                  value={formData.learningStyle}
                  onChange={handleChange}
                  placeholder="e.g., Visual, Auditory, Kinesthetic"
                />
              </Grid>
              <Input
                label="Subjects (comma separated)"
                name="subjects"
                type="text"
                value={formData.subjects}
                onChange={handleChange}
                error={errors.subjects}
                placeholder="e.g., Mathematics, Physics, Computer Science"
                helperText="Enter the subjects you're studying or interested in"
                required
              />
            </div>

            {/* Preferred Study Times */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Preferred Study Times</h3>
              <p className="text-gray-300 mb-4">When are you typically available to study?</p>
              
              {preferredStudyTimes.map((slot, index) => (
                <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="info" size="sm">Time Slot {index + 1}</Badge>
                    {preferredStudyTimes.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <Grid cols={3} gap="md">
                    <div>
                      <label className="block text-sm font-medium text-teal-200 mb-1">Day</label>
                      <select
                        value={slot.day}
                        onChange={(e) => handleTimeSlotChange(index, "day", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                      >
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Start Time"
                      placeholder="HH:MM"
                      value={slot.startTime}
                      onChange={(e) => handleTimeSlotChange(index, "startTime", e.target.value)}
                      error={errors[`timeSlot${index}`]}
                    />
                    <Input
                      label="End Time"
                      placeholder="HH:MM"
                      value={slot.endTime}
                      onChange={(e) => handleTimeSlotChange(index, "endTime", e.target.value)}
                      error={errors[`timeSlot${index}`]}
                    />
                  </Grid>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addTimeSlot}
                className="w-full"
              >
                + Add Another Time Slot
              </Button>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link 
                href="/auth/signin" 
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
