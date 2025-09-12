import { useState } from "react";
import axios from "axios";
import "./resetPassword.scss";
import { ApiConfig } from "../../config/ApiConfig";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const requestReset = async () => {
    try {
      setError("");
      const res = await axios.post(ApiConfig.API_URL + "api/users/password-reset", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || t("resetPassword.errorRequest"));
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
      setError(err.response?.data?.message || t("resetPassword.errorReset"));
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-form">
        {step === 1 && (
          <>
            <h2>{t("resetPassword.titleStep1")}</h2>
            <input
              type="email"
              placeholder={t("resetPassword.placeholderEmail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={requestReset}>{t("resetPassword.sendCode")}</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>{t("resetPassword.titleStep2")}</h2>
            <input
              type="text"
              placeholder={t("resetPassword.placeholderCode")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              type="password"
              placeholder={t("resetPassword.placeholderNewPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={confirmReset}>{t("resetPassword.confirm")}</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>{t("resetPassword.titleStep3")}</h2>
            <a href="/login">{t("resetPassword.backToLogin")}</a>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {message && step !== 3 && <p className="success">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
