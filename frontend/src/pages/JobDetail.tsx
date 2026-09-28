import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { applyToJob } from "../api/applications";
import { fetchJob } from "../api/jobs";
import { useAuth } from "../hooks/useAuth";
import type { Job } from "../types";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => { fetchJob(Number(id)).then(setJob).catch(() => setStatus("Job not found")); }, [id]);

  const apply = async () => {
    try { await applyToJob(Number(id), message); setStatus("Application sent!"); }
    catch (err: any) { setStatus(err?.response?.data?.detail ?? "Could not apply"); }
  };

  if (!job) return <p>{status || "Loading..."}</p>;
  return (
    <div>
      <h2>{job.title}</h2>
      <p>{job.category} · {job.location}</p>
      {job.pay_tzs && <strong>TZS {job.pay_tzs.toLocaleString()}</strong>}
      <p>{job.description}</p>
      {user?.role === "worker" && (
        <div className="form">
          <textarea placeholder="Short message to the employer" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={apply}>Apply</button>
        </div>
      )}
      {!user && <p>Login as a worker to apply.</p>}
      {status && <p>{status}</p>}
    </div>
  );
}