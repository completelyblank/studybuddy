"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Section, Card, Button, Input, Grid, LoadingSpinner } from "../components/ui";

interface ProfileData {
  name: string;
  email: string;
  avatar: string;
  academicLevel: string;
  subjects: string;
  learningStyle: string;
  studyGoals: string;
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    avatar: "",
    academicLevel: "",
    subjects: "",
    learningStyle: "",
    studyGoals: "",
  });
  const [preferredStudyTimes, setPreferredStudyTimes] = useState<TimeSlot[]>([
    { day: "Monday", startTime: "", endTime: "" },
  ]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/users/me");
        const userData = response.data;
        
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          avatar: userData.avatar || "",
          academicLevel: userData.academicLevel || "",
          subjects: userData.subjects?.join(", ") || "",
          learningStyle: userData.learningStyle || "",
          studyGoals: userData.studyGoals || "",
        });

        if (userData.preferredStudyTimes && userData.preferredStudyTimes.length > 0) {
          setPreferredStudyTimes(userData.preferredStudyTimes);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeSlotChange = (index: number, field: keyof TimeSlot, value: string) => {
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

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setSaving(true);
    try {
      // Update avatar if changed
      if (profileData.avatar) {
        await axios.put("/api/users/avatar", {
          userId: session.user.id,
          avatar: profileData.avatar,
        });
      }

      // Update other profile data
      await axios.put("/api/users/update", {
        userId: session.user.id,
        name: profileData.name,
        academicLevel: profileData.academicLevel,
        subjects: profileData.subjects.split(",").map((s) => s.trim()).filter((s) => s),
        preferredStudyTimes: preferredStudyTimes.filter(
          (slot) => slot.startTime && slot.endTime
        ),
        learningStyle: profileData.learningStyle,
        studyGoals: profileData.studyGoals,
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <Section title="Profile Settings" subtitle="Manage your account and preferences">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Avatar Section */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">Profile Picture</h3>
            <div className="flex items-center space-x-6">
              <img
                src={profileData.avatar || "/default.jpeg"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-teal-400"
                onError={(e) => {
                  e.currentTarget.src = "/default.jpeg";
                }}
              />
              <div className="flex-1">
                <Input
                  label="Avatar URL"
                  value={profileData.avatar}
                  onChange={(e) => handleInputChange('avatar', e.target.value)}
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  helperText="Enter a valid image URL for your profile picture"
                />
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
            <Grid cols={2} gap="md">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
              <Input
                label="Email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
          </Card>

          {/* Academic Information */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-6">Academic Information</h3>
            <Grid cols={2} gap="md">
              <Input
                label="Academic Level"
                value={profileData.academicLevel}
                onChange={(e) => handleInputChange('academicLevel', e.target.value)}
                placeholder="e.g., Undergraduate, Graduate, High School"
              />
              <Input
                label="Learning Style"
                value={profileData.learningStyle}
                onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                placeholder="e.g., Visual, Auditory, Kinesthetic"
              />
            </Grid>
            <div className="mt-4">
              <Input
                label="Subjects"
                value={profileData.subjects}
                onChange={(e) => handleInputChange('subjects', e.target.value)}
                placeholder="e.g., Mathematics, Physics, Computer Science"
                helperText="Separate multiple subjects with commas"
              />
            </div>
            <div className="mt-4">
              <Input
                label="Study Goals"
                value={profileData.studyGoals}
                onChange={(e) => handleInputChange('studyGoals', e.target.value)}
                placeholder="Describe your study goals and objectives"
                helperText="What do you want to achieve in your studies?"
              />
            </div>
          </Card>

          {/* Study Times */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Preferred Study Times</h3>
              <Button variant="outline" size="sm" onClick={addTimeSlot}>
                Add Time Slot
              </Button>
            </div>
            <div className="space-y-4">
              {preferredStudyTimes.map((slot, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <select
                    value={slot.day}
                    onChange={(e) => handleTimeSlotChange(index, 'day', e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <span className="text-gray-300">to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  {preferredStudyTimes.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              size="lg"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Section>
      <ToastContainer position="top-right" />
    </div>
  );
} 