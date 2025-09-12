import { useNavigate } from "react-router-dom";
import "./hero.scss";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleMap = () => {
    navigate('/map');
  };

  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <p>{t("heroText")}</p>
          <button className="btn" onClick={handleMap}>
            {t("heroButton")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

