import { api } from "./client";
import type { Application } from "../types";

export const applyToJob = (jobId: number, message: string) =>
  api.post<Application>(`/jobs/${jobId}/apply`, { message }).then((r) => r.data);

export const fetchMyApplications = () =>
  api.get<Application[]>("/applications/mine").then((r) => r.data);

export const fetchJobApplications = (jobId: number) =>
  api.get<Application[]>(`/jobs/${jobId}/applications`).then((r) => r.data);