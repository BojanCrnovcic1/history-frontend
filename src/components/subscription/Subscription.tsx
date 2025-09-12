import React, { useState } from "react";
import axios from "axios";
import "./subscription.scss";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const Subscription: React.FC = () => {
  const { accessToken } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:3000/api/subscription/create",
        { plan },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      } else {
        setMessage(t("subscriptionPage.success"));
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || t("subscriptionPage.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="subscription">
      <div className="subscription-container">
        <h2>{t("subscriptionPage.title")}</h2>
        <p>{t("subscriptionPage.description")}</p>

        <div className="plans">
          <div className="plan-card">
            <h3>{t("subscriptionPage.monthly")}</h3>
            <p className="price">{t("subscriptionPage.monthlyPrice")}</p>
            <button
              className="btn"
              onClick={() => handleSubscribe("monthly")}
              disabled={loading}
            >
              {loading ? t("subscriptionPage.processing") : t("subscriptionPage.subscribe")}
            </button>
          </div>

          <div className="plan-card popular">
            <h3>{t("subscriptionPage.yearly")}</h3>
            <p className="price">{t("subscription.yearlyPrice")}</p>
            <button
              className="btn"
              onClick={() => handleSubscribe("yearly")}
              disabled={loading}
            >
              {loading ? t("subscriptionPage.processing") : t("subscriptionPage.subscribe")}
            </button>
          </div>
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </section>
  );
};

export default Subscription;
