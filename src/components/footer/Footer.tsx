import './footer.scss';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-overlay">
        
        {/* O aplikaciji */}
        <div className="footer-section about">
          <h2>HistoTrails</h2>
          <p>
            HistoTrails je interaktivna mapa i vodič kroz najvažnije događaje iz
            istorije. Povezujemo prošlost i sadašnjost kroz edukativne sadržaje,
            multimediju i zanimljive priče iz svih krajeva sveta.
          </p>
        </div>

        {/* Informacije */}
        <div className="footer-section info">
          <h3>Informacije</h3>
          <ul>
            <li><a href="/terms">Uslovi korišćenja</a></li>
            <li><a href="/privacy">Politika privatnosti</a></li>
            <li><a href="/sources">Izvori informacija</a></li>
          </ul>
        </div>

        {/* Kontakt */}
        <div className="footer-section contact">
          <h3>Kontakt</h3>
          <p>Email: <a href="mailto:info@histotrails.com">info@histotrails.com</a></p>
        </div>

        {/* Društvene mreže */}
        <div className="footer-section social">
          <h3>Pratite nas</h3>
          <div className="social-icons">
            <a href="#"><Facebook size={28} /></a>
            <a href="#"><Instagram size={28} /></a>
            <a href="#"><Twitter size={28} /></a>
          </div>
        </div>
      </div>

      {/* Donji deo footera */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} HistoTrails. Sva prava zadržana.</p>
      </div>
    </footer>
  );
};

export default Footer;

