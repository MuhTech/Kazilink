import { api } from "./client";
import type { Job, JobCreate } from "../types";

export const fetchJobs = (params?: { q?: string; location?: string }) =>
  api.get<Job[]>("/jobs", { params }).then((r) => r.data);

export const fetchJob = (id: number) => api.get<Job>(`/jobs/${id}`).then((r) => r.data);

export const createJob = (d: JobCreate) => api.post<Job>("/jobs", d).then((r) => r.data);