import React from "react";
import "./timePeriodDescriptionModal.scss";

interface TimePeriodDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const TimePeriodDescriptionModal: React.FC<TimePeriodDescriptionModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div className="tpd-modal-overlay">
      <div className="tpd-modal">
        <div className="content">
          <div className="tpd-header">
            <h2>{title || "Period"}</h2>
            <button onClick={onClose} className="tpd-close">
              ✖
            </button>
          </div>
          <div className="tpd-content">
            <p>{description || "Nema opisa za ovaj period."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePeriodDescriptionModal;
