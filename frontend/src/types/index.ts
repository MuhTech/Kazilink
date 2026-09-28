export type Role = "worker" | "employer";

export interface User { id: number; email: string; full_name: string; role: Role }

export interface JobCreate {
  title: string; description: string; location: string; category: string; pay_tzs: number | null;
}
export interface Job extends JobCreate { id: number; is_open: boolean; employer_id: number; created_at: string }

export type AppStatus = "pending" | "accepted" | "rejected";
export interface Application {
  id: number; job_id: number; status: AppStatus; message: string;
  created_at: string; job: Job; worker: User;
}