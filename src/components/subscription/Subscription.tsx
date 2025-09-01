import React, { useState} from "react";
import axios from "axios";
import "./subscription.scss";
import { useAuth } from "../../context/AuthContext";

const Subscription: React.FC = () => {
  const {accessToken} = useAuth()
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
        // Ako backend vrati PayPal link ili slično
        window.location.href = response.data.approvalUrl;
      } else {
        setMessage("Pretplata uspešno aktivirana!");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Greška prilikom pretplate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="subscription">
      <div className="subscription-container">
        <h2>Izaberi plan pretplate</h2>
        <p>
          Uživaj u svim premium sadržajima i otključaj ceo istorijski vodič. Možeš
          otkazati pretplatu bilo kada.
        </p>

        <div className="plans">
          <div className="plan-card">
            <h3>Mjesečna</h3>
            <p className="price">2.59 € / mjesec</p>
            <button
              className="btn"
              onClick={() => handleSubscribe("monthly")}
              disabled={loading}
            >
              {loading ? "Obrada..." : "Pretplati se"}
            </button>
          </div>

          <div className="plan-card popular">
            <h3>Godišnja</h3>
            <p className="price">29.99 € / godina</p>
            <button
              className="btn"
              onClick={() => handleSubscribe("yearly")}
              disabled={loading}
            >
              {loading ? "Obrada..." : "Pretplati se"}
            </button>
          </div>
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </section>
  );
};

export default Subscription;
