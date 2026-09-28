import { Link } from "react-router-dom";
import type { Job } from "../types";

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card">
      <h3>{job.title}</h3>
      <p>{job.category} · {job.location}</p>
      {job.pay_tzs && <strong>TZS {job.pay_tzs.toLocaleString()}</strong>}
    </Link>
  );
}