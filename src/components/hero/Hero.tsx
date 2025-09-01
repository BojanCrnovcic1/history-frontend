import { useNavigate } from "react-router-dom";
import "./hero.scss";

const Hero = () => {
  const navigate = useNavigate();

  const handleMap = () => {
    navigate('/map')
  }

  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <p>
            Vaša interaktivna mapa i vodič kroz najvažnije događaje iz istorije.
            Krećite se kroz vreme, otkrivajte fascinantne priče i učite na potpuno nov način.
          </p>
          <button className="btn" onClick={handleMap}>Započni putovanje</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
