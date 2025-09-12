import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './terms.scss';

const Terms = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="terms-container">
      <button className="back-button" onClick={() => navigate('/')}>
        {t('terms.back')}
      </button>

      <h1>{t('terms.title')}</h1>
      <p>{t('terms.welcome')}</p>

      <h2>{t('terms.section1Title')}</h2>
      <p>{t('terms.section1Text')}</p>

      <h2>{t('terms.section2Title')}</h2>
      <p>{t('terms.section2Text')}</p>

      <h2>{t('terms.section3Title')}</h2>
      <ul>
        <li>{t('terms.rule1')}</li>
        <li>{t('terms.rule2')}</li>
        <li>{t('terms.rule3')}</li>
      </ul>

      <h2>{t('terms.section4Title')}</h2>
      <p>{t('terms.section4Text')}</p>

      <h2>{t('terms.section5Title')}</h2>
      <p>
        {t('terms.section5Text')} <strong>support@istorija-app.com</strong>
      </p>
    </div>
  );
};

export default Terms;

