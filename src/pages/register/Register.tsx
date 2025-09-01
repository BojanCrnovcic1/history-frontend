import axios from 'axios';
import { useState } from 'react';
import { ApiConfig } from '../../config/ApiConfig';
import { Link, useNavigate } from 'react-router-dom';
import './register.scss';

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

  const doRegister = async () => {
    if (!email || !password || !username) {
      return setErrorMessage('Molimo vas da popunite obavezna polja.');
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
        setSuccessMessage(
          "Registracija je uspešno obavljena! Potvrdite svoj nalog putem mejla kako biste mogli da se prijavite i rezervišete svoje slavlje iz snova."
        );
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      setErrorMessage('Greška prilikom registracije. Molimo Vas pokušajte ponovo.');
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="register">
      <button className="archive-back-button" onClick={handleBackClick}>
        &larr; Nazad
      </button>

      <div className="register-card">
        <h1>Registracija</h1>
        <p className="info-text">
          Registracija je <strong>potpuno besplatna</strong>.  
          Kada budete želeli, uvek možete kupiti <strong>premium sadržaj</strong> i otključati dodatne funkcionalnosti.
        </p>

        <form>
          <label htmlFor="username">Korisničko ime:</label>
          <input
            type="text"
            id="username"
            name="firstName"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Lozinka:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="button" onClick={doRegister}>
            Registruj se
          </button>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="register-back">
          <span>Već imate nalog?</span>
          <Link to={'/login'}>
            <p>Prijavite se ovde...</p>
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

