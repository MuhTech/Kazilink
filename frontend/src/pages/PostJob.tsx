import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/jobs";

export default function PostJob() {
  const nav = useNavigate();
  const [f, setF] = useState({ title: "", description: "", location: "", category: "", pay: "" });
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const job = await createJob({ ...f, pay_tzs: f.pay ? Number(f.pay) : null });
      nav(`/jobs/${job.id}`);
    } catch { setError("Could not post job. Check all fields."); }
  };

  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="form">
      <h2>Post a job</h2>
      {error && <p className="error">{error}</p>}
      <input placeholder="Title" value={f.title} onChange={set("title")} required />
      <input placeholder="Category (e.g. Construction)" value={f.category} onChange={set("category")} required />
      <input placeholder="Location" value={f.location} onChange={set("location")} required />
      <input type="number" placeholder="Pay in TZS (optional)" value={f.pay} onChange={set("pay")} />
      <textarea placeholder="Description" value={f.description} onChange={set("description")} required />
      <button>Publish</button>
    </form>
  );
}