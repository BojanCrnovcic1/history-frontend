import React from "react";
import "./premiumMapModal.scss"; // ako hoćeš poseban stil
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


interface PremiumMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumMapModal: React.FC<PremiumMapModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Premium sadržaj</h2>
        {user ? (
            <p>Pretplatite se da vidi te Premium sadržaj laganim klikom <Link to={'/subscription'}><span>ovde...</span></Link></p>
        ): (
            <p>
               Ovaj događaj je dostupan samo Premium korisnicima. Da bi vidjeli njegov 
               sadržaj registrujte se <Link to={'/register'}><span>ovde..</span></Link>
            </p>
        )}
        <button onClick={onClose} className="close-btn">Zatvori</button>
      </div>
    </div>
  );
};

export default PremiumMapModal;
