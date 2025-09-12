import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './privacy.scss';

const Privacy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="privacy-container">
      <button className="back-button" onClick={() => navigate('/')}>
        {t('privacy.back')}
      </button>

      <h1>{t('privacy.title')}</h1>

      <h2>{t('privacy.section1Title')}</h2>
      <p>{t('privacy.section1Text')}</p>

      <h2>{t('privacy.section2Title')}</h2>
      <p>{t('privacy.section2Text')}</p>
      <ul>
        <li>{t('privacy.email')}</li>
        <li>{t('privacy.password')}</li>
        <li>{t('privacy.fullname')}</li>
      </ul>
      <p>{t('privacy.section2Note')}</p>

      <h2>{t('privacy.section3Title')}</h2>
      <p>{t('privacy.section3Text1')}</p>
      <p dangerouslySetInnerHTML={{ __html: t('privacy.section3Text2') }} />

      <h2>{t('privacy.section4Title')}</h2>
      <ul>
        <li>{t('privacy.rule1')}</li>
        <li dangerouslySetInnerHTML={{ __html: t('privacy.rule2') }} />
        <li>{t('privacy.rule3')}</li>
      </ul>

      <h2>{t('privacy.section5Title')}</h2>
      <p>{t('privacy.section5Text')}</p>

      <h2>{t('privacy.section6Title')}</h2>
      <p>{t('privacy.section6Text')}</p>

      <h2>{t('privacy.section7Title')}</h2>
      <p>{t('privacy.section7Text')}</p>

      <h2>{t('privacy.section8Title')}</h2>
      <p>{t('privacy.section8Text')}</p>
      <p className="contact">{t('privacy.contact')}</p>
    </div>
  );
};

export default Privacy;

