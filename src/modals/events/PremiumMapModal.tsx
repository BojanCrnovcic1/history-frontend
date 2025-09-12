import React from "react";
import "./premiumMapModal.scss";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

interface PremiumMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumMapModal: React.FC<PremiumMapModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{t("premiumModal.title")}</h2>
        {user ? (
          <p>
            {t("premiumModal.subscribe")}{" "}
            <Link to={"/subscription"}>
              <span>{t("premiumModal.here")}</span>
            </Link>
          </p>
        ) : (
          <p>
            {t("premiumModal.registerInfo")}{" "}
            <Link to={"/register"}>
              <span>{t("premiumModal.here")}</span>
            </Link>
          </p>
        )}
        <button onClick={onClose} className="close-btn">
          {t("premiumModal.close")}
        </button>
      </div>
    </div>
  );
};

export default PremiumMapModal;

