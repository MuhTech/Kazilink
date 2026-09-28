import { useState } from "react";
import JobCard from "../components/JobCard";
import { useJobs } from "../hooks/useJobs";

export default function Home() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const { jobs, loading } = useJobs(q, location);

  return (
    <div>
      <h1>Find work. Find workers.</h1>
      <div className="filters">
        <input placeholder="Search jobs..." value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      {loading ? <p>Loading...</p> : jobs.length === 0 ? <p>No jobs found.</p> :
        <div className="grid">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>}
    </div>
  );
}