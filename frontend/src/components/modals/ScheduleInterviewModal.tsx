import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
}

const ScheduleInterviewModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [date, setDate] = useState("");

  if (!isOpen) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Schedule Interview</h3>

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={() => onSubmit(date)}>Confirm</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
};

const modal = {
  background: "#fff",
  padding: 20,
  margin: "100px auto",
  width: 300,
};

export default ScheduleInterviewModal;