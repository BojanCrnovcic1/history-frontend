import { useState } from "react";
import "./login.scss";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleRegister = () => {
    navigate('/register');
  };

  const handleRestartPassword = () => {
    navigate('/reset-password');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(t("login.error"));
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
        {t("loginPage.back")}
      </button>
      <form className="login-form" onSubmit={handleLogin}>
        <h2>{t("loginPage.title")}</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <input
          type="email"
          placeholder={t("loginPage.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder={t("loginPage.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? t("loginPage.buttonLoading") : t("loginPage.buttonSubmit")}
        </button>

        <div className="login-links">
          <span onClick={handleRegister}>{t("loginPage.noAccount")}</span>
          <span onClick={handleRestartPassword}>{t("loginPage.forgotPassword")}</span>
        </div>
      </form>
    </div>
  );
};

export default Login;
