import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";

export default function Register() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ full_name: "", email: "", password: "", role: "worker" as Role });
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(f);
      await login(f.email, f.password);
      nav("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail?.toString() ?? "Registration failed");
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <h2>Create account</h2>
      {error && <p className="error">{error}</p>}
      <input placeholder="Full name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} required />
      <input type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
      <input type="password" placeholder="Password (min 6)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required minLength={6} />
      <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
        <option value="worker">I'm looking for work</option>
        <option value="employer">I'm hiring</option>
      </select>
      <button>Register</button>
    </form>
  );
}