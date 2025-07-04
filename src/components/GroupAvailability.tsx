import { useState, useEffect } from "react";
import axios from "axios";

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  users: string[];
}

interface Props {
  groupId: string;
}

export default function GroupAvailability({ groupId }: Props) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await axios.get(`/api/groups/availability?groupId=${groupId}`, {
          withCredentials: true,
        });
        setAvailability(response.data);
      } catch (err: any) {
        console.error("Error fetching availability:", err);
        setError(err.response?.data?.error || "Failed to load availability");
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [groupId]);

  if (loading) return <p className="text-white">Loading availability...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-white">
      <h3 className="text-lg font-semibold mb-2">Group Availability</h3>
      {availability.length === 0 ? (
        <p>No common availability found.</p>
      ) : (
        <ul className="space-y-2">
          {availability.map((slot, index) => (
            <li key={index}>
              {slot.day}: {slot.startTime} - {slot.endTime}, Available:{" "}
              {slot.users.join(", ")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
