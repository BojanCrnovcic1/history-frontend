import { useState } from "react";
import "./login.scss";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = () => {
    navigate('/register')
  }

  const handleRestartPassword = () => {
    navigate('/reset-password')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
        await login(email, password);
    } catch (err: any) {
      setError( "Greška pri prijavi");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="login">
      <button className="archive-back-button" onClick={handleBackClick}>
        &larr; Nazad
      </button>
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Prijava</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <input
          type="email"
          placeholder="Email adresa"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Prijava..." : "Prijavi se"}
        </button>

        <div className="login-links">
          <span onClick={handleRegister}>Nemate nalog? Registrujte se</span>
          <span onClick={handleRestartPassword}>Zaboravljena lozinka?</span>
        </div>
      </form>
    </div>
  );
};

export default Login;
