import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <nav className="nav">
      <Link to="/" className="brand">KAZILINK</Link>
      <div>
        {user?.role === "employer" && <Link to="/post-job">Post a job</Link>}
        {user?.role === "worker" && <Link to="/my-applications">My applications</Link>}
        {user ? (
          <button onClick={() => { logout(); nav("/"); }}>Logout ({user.full_name})</button>
        ) : (
          <><Link to="/login">Login</Link><Link to="/register">Register</Link></>
        )}
      </div>
    </nav>
  );
}