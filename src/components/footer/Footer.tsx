import { useNavigate } from 'react-router-dom';
import './footer.scss';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-overlay">
        
        {/* O aplikaciji */}
        <div className="footer-section about">
          <h2>{t("footerAboutTitle")}</h2>
          <p>{t("footerAboutText")}</p>
        </div>

        {/* Informacije */}
        <div className="footer-section info">
          <h3>{t("footerInfoTitle")}</h3>
          <ul>
            <li onClick={() => navigate('/terms')}>{t("footerInfoTerms")}</li>
            <li onClick={() => navigate('/privacy')}>{t("footerInfoPrivacy")}</li>
            <li onClick={() => navigate('/sources')}>{t("footerInfoSources")}</li>
          </ul>
        </div>

        {/* Kontakt */}
        <div className="footer-section contact">
          <h3>{t("footerContactTitle")}</h3>
          <p>{t("footerContactEmail")}: <a href="mailto:info@histotrails.com">info@histotrails.com</a></p>
        </div>

        {/* Društvene mreže */}
        <div className="footer-section social">
          <h3>{t("footerSocialTitle")}</h3>
          <div className="social-icons">
            <a href="#"><Facebook size={28} /></a>
            <a href="#"><Instagram size={28} /></a>
            <a href="#"><Twitter size={28} /></a>
          </div>
        </div>
      </div>

      {/* Donji deo footera */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} HistoTrails. {t("footerBottom")}</p>
      </div>
    </footer>
  );
};

export default Footer;

