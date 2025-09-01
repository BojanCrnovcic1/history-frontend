import { useState } from "react";
import axios from "axios";
import "./resetPassword.scss";
import { ApiConfig } from "../../config/ApiConfig";

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const requestReset = async () => {
    try {
      setError("");
      const res = await axios.post(ApiConfig.API_URL +"api/users/password-reset", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Greška pri slanju zahteva");
    }
  };

  const confirmReset = async () => {
    try {
      setError("");
      const res = await axios.post(ApiConfig.API_URL + "api/users/password-reset/confirm", {
        email,
        code,
        newPassword,
      });
      setMessage(res.data.message);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Greška pri resetovanju lozinke");
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-form">
        {step === 1 && (
          <>
            <h2>Zaboravljena lozinka</h2>
            <input
              type="email"
              placeholder="Unesite svoj email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={requestReset}>Pošalji kod</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Unesite kod i novu lozinku</h2>
            <input
              type="text"
              placeholder="Kod iz emaila"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              type="password"
              placeholder="Nova lozinka"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={confirmReset}>Potvrdi</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>{message}</h2>
            <a href="/login">Vrati se na prijavu</a>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {message && step !== 3 && <p className="success">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;