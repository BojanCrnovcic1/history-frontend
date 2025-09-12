import { useNavigate } from 'react-router-dom';
import './navBar.scss';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Globe, Music, VolumeX } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { isPlaying, toggleMusic } = useMusic();
  const { t, i18n } = useTranslation();

  const savedLang = localStorage.getItem("lang");
  const initialLang = savedLang || i18n.language || "sr";
  const [language, setLanguage] = useState(initialLang);

  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("lang", language);
  }, [language, i18n]);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHideNav(true);
      } else {
        setHideNav(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div className={`navBar ${hideNav ? 'navBar--hidden' : ''}`} ref={menuRef}>
      <div className='navBar-overlay'>
        <div className='navBar-left'>
          <img src="/assets/logo.png" alt="logo" onClick={() => navigate('/')} />
          <h1 onClick={() => navigate('/')}>HistoTrails</h1>
        </div>
        
        <div className='rightBar'>
          <div className="desktop-controls">
            {role === 'USER' ? (
              <>
                <button onClick={() => navigate('/subscription')}>{t("subscription")}</button>
                <button onClick={() => { logout(); }}>{t("logout")}</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')}>{t("login")}</button>
                <button onClick={() => navigate('/register')}>{t("register")}</button>
              </>
            )}
            
            <div className="music-toggle" onClick={toggleMusic}>
              {isPlaying ? <Music size={22} /> : <VolumeX size={22} />}
            </div>

            <div className="language-selector">
              <select 
                value={language} 
                onChange={handleLanguageChange} 
                aria-label="Select language"
              >
                <option value="en">English</option>
                <option value="sr">Srpski</option>
              </select>
            </div>
          </div>

          <div className={`navBar-hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div className={`mobile-dropdown ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-dropdown-content">
          {role === 'USER' ? (
            <>
              <button onClick={() => { navigate('/subscription'); closeMenu(); }}>{t("subscription")}</button>
              <button onClick={() => { logout(); closeMenu(); }}>{t("logout")}</button>
            </>
          ) : (
            <>
              <button onClick={() => { navigate('/login'); closeMenu(); }}>{t("login")}</button>
              <button onClick={() => { navigate('/register'); closeMenu(); }}>{t("register")}</button>
            </>
          )}
          
          <div className="mobile-controls">
            <div className="control-item" onClick={toggleMusic}>
              {isPlaying ? <Music size={20} /> : <VolumeX size={20} />}
              <span>{isPlaying ? t("musicOn") : t("musicOff")}</span>
            </div>
            
            <div className="control-item language-item">
              <Globe size={20} />
              <select 
                title='jezik'
                value={language} 
                onChange={handleLanguageChange}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="en">En</option>
                <option value="sr">Sr</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;


