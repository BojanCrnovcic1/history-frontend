import { useNavigate } from 'react-router-dom';
import './navBar.scss';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Globe, Music, VolumeX } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role;

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [hideNav, setHideNav] = useState<boolean>(false);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const [language, setLanguage] = useState<string>('sr');

  const menuRef = useRef<HTMLDivElement>(null);

  const { isPlaying, toggleMusic } = useMusic();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

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
          {/* Desktop controls */}
          <div className="desktop-controls">
            {role === 'USER' ? (
              <>
                <button onClick={() => navigate('/subscription')}>Pretplata</button>
                <button onClick={() => { closeMenu(); logout(); }}>Odjavi se</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')}>Prijava</button>
                <button onClick={() => navigate('/register')}>Registracija</button>
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
              <button onClick={() => { navigate('/subscription'); closeMenu(); }}>
                Pretplata
              </button>
              <button onClick={() => { logout(); closeMenu(); }}>
                Odjavi se
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { navigate('/login'); closeMenu(); }}>
                Prijava
              </button>
              <button onClick={() => { navigate('/register'); closeMenu(); }}>
                Registracija
              </button>
            </>
          )}
          
          <div className="mobile-controls">
            <div className="control-item" onClick={toggleMusic}>
              {isPlaying ? <Music size={20} /> : <VolumeX size={20} />}
              <span>{isPlaying ? 'Muzika: Uključeno' : 'Muzika: Isključeno'}</span>
            </div>
            
            <div className="control-item language-item">
              <Globe size={20} />
              <select title='jezik'
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
