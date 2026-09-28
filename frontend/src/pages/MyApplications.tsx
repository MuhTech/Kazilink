import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyApplications } from "../api/applications";
import type { Application } from "../types";

export default function MyApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  useEffect(() => { fetchMyApplications().then(setApps); }, []);

  return (
    <div>
      <h2>My applications</h2>
      {apps.length === 0 && <p>You haven't applied to any jobs yet.</p>}
      {apps.map((a) => (
        <div key={a.id} className="card">
          <Link to={`/jobs/${a.job_id}`}><h3>{a.job.title}</h3></Link>
          <p>Status: <strong>{a.status}</strong></p>
        </div>
      ))}
    </div>
  );
}