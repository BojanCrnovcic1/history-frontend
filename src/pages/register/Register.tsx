import axios from 'axios';
import { useState } from 'react';
import { ApiConfig } from '../../config/ApiConfig';
import { Link, useNavigate } from 'react-router-dom';
import './register.scss';
import { useTranslation } from 'react-i18next';

interface RegisterProps {
  username: string;
  email: string;
  password: string;
}

const Register = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const doRegister = async () => {
    if (!email || !password || !username) {
      return setErrorMessage(t('register.fillFields'));
    }

    const payload: any = { username, email, password };

    try {
      const response = await axios.post<RegisterProps>(
        ApiConfig.API_URL + 'auth/register',
        payload
      );

      if (response.status !== 201) {
        return response.statusText;
      } else {
        setSuccessMessage(t('register.success'));
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      setErrorMessage(t('register.error'));
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="register">
      <button className="archive-back-button" onClick={handleBackClick}>
        &larr; {t('registerPage.back')}
      </button>

      <div className="register-card">
        <h1>{t('registerPage.title')}</h1>
        <p className="info-text">{t('registerPage.info')}</p>

        <form>
          <label htmlFor="username">{t('registerPage.username')}:</label>
          <input
            type="text"
            id="username"
            name="firstName"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="email">{t('registerPage.email')}:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">{t('registerPage.password')}:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="button" onClick={doRegister}>
            {t('registerPage.button')}
          </button>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="register-back">
          <span>{t('registerPage.alreadyAccount')}</span>
          <Link to={'/login'}>
            <p>{t('registerPage.loginHere')}</p>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="overlay-success">
          <div className="overlay-content">
            <h2>{successMessage}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;


