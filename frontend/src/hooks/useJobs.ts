import { useEffect, useState } from "react";
import { fetchJobs } from "../api/jobs";
import type { Job } from "../types";

export function useJobs(q: string, location: string) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchJobs({ q: q || undefined, location: location || undefined })
      .then(setJobs).finally(() => setLoading(false));
  }, [q, location]);

  return { jobs, loading };
}