import React, { useEffect, useState } from "react";
import "./timePeriodDescriptionModal.scss";
import axios from "axios";
import { ApiConfig } from "../../config/ApiConfig";
import { useTranslation } from "react-i18next";

interface TimePeriodDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;

  /** ID perioda koji prikazujemo (obavezno da bi se povukao prevod) */
  timePeriodId: number | null;

  /** Fallback vrednosti iz već učitanog perioda (na SR), ako prevod izostane */
  defaultTitle?: string;
  defaultDescription?: string;
}

type TranslatedTimePeriod = {
  timePeriodId: number;
  name: string;
  startYear: string | null;
  endYear: string | null;
  description: string | null;
};

const TimePeriodDescriptionModal: React.FC<TimePeriodDescriptionModalProps> = ({
  isOpen,
  onClose,
  timePeriodId,
  defaultTitle,
  defaultDescription,
}) => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<TranslatedTimePeriod | null>(null);

  // Kad se modal otvori ili promeni jezik/ID -> povuci prevod
  useEffect(() => {
    if (!isOpen || !timePeriodId) {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    const fetchTranslation = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get<TranslatedTimePeriod>(
          `${ApiConfig.API_URL}api/time-periods/${timePeriodId}/translate?lang=${i18n.language}`
        );
        setData(res.data);
      } catch (e: any) {
        console.error("Greška pri dohvaćanju prevoda time perioda:", e);
        setError(e?.response?.data?.message || "Greška pri dohvaćanju prevoda.");
        setData(null); // fallback će se prikazati
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [isOpen, timePeriodId, i18n.language]);

  if (!isOpen) return null;

  const title = data?.name || defaultTitle || "Period";
  const descriptionHtml = data?.description || defaultDescription || "Nema opisa za ovaj period.";

  return (
    <div className="tpd-modal-overlay">
      <div className="tpd-modal">
        <div className="content">
          <div className="tpd-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="tpd-close">✖</button>
          </div>

          <div className="tpd-content">
            {loading && <p>Učitavanje…</p>}
            {!loading && error && (
              <p className="tpd-error">{error}</p>
            )}
            {!loading && !error && (
              <div
                className="tpd-description"
                // ako opis može sadržati HTML formatiranje, ovo omogućava render
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePeriodDescriptionModal;
