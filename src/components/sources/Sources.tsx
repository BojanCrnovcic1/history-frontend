import { useNavigate } from 'react-router-dom';
import './sources.scss';
import { useTranslation } from "react-i18next";

const Sources = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="sources-container">
      <button className="back-button" onClick={() => navigate('/')}>
        &larr; {t("sources.back")}
      </button>

      <h1>{t("sources.title")}</h1>
      <p>{t("sources.intro")}</p>

      <h2>{t("sources.musicTitle")}</h2>
      <p>{t("sources.musicText1")}</p>
      <p>{t("sources.musicExample")}</p>

      <h2>{t("sources.historyTitle")}</h2>
      <p>{t("sources.history1")}</p>
      <p>{t("sources.history2")}</p>
      <p>{t("sources.history3")}</p>
      <p>{t("sources.history4")}</p>
      <p>{t("sources.history5")}</p>
    </div>
  );
};

export default Sources;
