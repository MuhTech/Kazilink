import { api } from "./client";
import type { Role, User } from "../types";

export const registerUser = (d: { email: string; full_name: string; password: string; role: Role }) =>
  api.post<User>("/auth/register", d).then((r) => r.data);

export const loginUser = (email: string, password: string) =>
  api.post<{ access_token: string }>("/auth/login", new URLSearchParams({ username: email, password }))
    .then((r) => r.data);

export const fetchMe = () => api.get<User>("/auth/me").then((r) => r.data);