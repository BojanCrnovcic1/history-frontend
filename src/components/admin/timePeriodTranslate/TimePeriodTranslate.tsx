import { useState, useEffect } from "react";
import axios from "axios";
import './timePeriodTranslate.scss';
import { useAuth } from "../../../context/AuthContext";
import { ApiConfig } from "../../../config/ApiConfig";
import type { TimePeriods } from "../../../types/TimePeriods";
import type { TimePeriodTranslations } from "../../../types/TimePeriodTranslations";

const TimePeriodTranslate = () => {
  const { accessToken } = useAuth();

  const [timePeriods, setTimePeriods] = useState<TimePeriods[]>([]);
  const [selectedTimePeriodId, setSelectedTimePeriodId] = useState<number | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriods | null>(null);

  const [language, setLanguage] = useState("en");
  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  // Učitaj sve time periode
  useEffect(() => {
    const fetchTimePeriods = async () => {
      try {
        const res = await axios.get(`${ApiConfig.API_URL}api/time-periods`);
        setTimePeriods(res.data || []);
      } catch (err) {
        console.error("Greška kod učitavanja time perioda:", err);
      }
    };
    fetchTimePeriods();
  }, []);

  // Kada se izabere time period, povući detalje + prevod ako postoji
  useEffect(() => {
    if (!selectedTimePeriodId) return;

    const fetchTimePeriod = async () => {
      try {
        const res = await axios.get(`${ApiConfig.API_URL}api/time-periods/${selectedTimePeriodId}`);
        const tp: TimePeriods = res.data;

        setSelectedTimePeriod(tp);

        // Ako već ima prevod za izabrani jezik, popuni polja
        const existing = tp.translations?.find((t: TimePeriodTranslations) => t.language === language);
        if (existing) {
          setName(existing.name);
          setStartYear(existing.startYear || "");
          setEndYear(existing.endYear || "");
          setDescription(existing.description || "");
        } else {
          setName("");
          setStartYear("");
          setEndYear("");
          setDescription("");
        }
      } catch (err) {
        console.error("Greška kod učitavanja time perioda:", err);
      }
    };

    fetchTimePeriod();
  }, [selectedTimePeriodId, language]);

  const handleSave = async () => {
    if (!selectedTimePeriodId) return;

    setLoading(true);
    try {
      await axios.post(
        `${ApiConfig.API_URL}api/time-periods/${selectedTimePeriodId}/translation`,
        {
          language,
          name,
          startYear,
          endYear,
          description,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      alert("✅ Prevod time perioda uspešno sačuvan!");

      // resetuj polja
      setName("");
      setStartYear("");
      setEndYear("");
      setDescription("");
      setSelectedTimePeriodId(null);
      setSelectedTimePeriod(null);
    } catch (err: any) {
      console.error("Greška kod snimanja prevoda:", err);
      alert(err?.response?.data?.message || "Greška!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="timeperiod-translate">
      <h2>Dodaj/uredi prevod Time Period-a</h2>

      <div className="form-group">
        <label>Izaberi Time Period</label>
        <select
          value={selectedTimePeriodId ?? ""}
          onChange={(e) => setSelectedTimePeriodId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Izaberi --</option>
          {timePeriods.map((tp) => (
            <option key={tp.timePeriodId} value={tp.timePeriodId}>
              {tp.name} {tp.startYear && `(${tp.startYear} - ${tp.endYear || "..."})`}
            </option>
          ))}
        </select>
      </div>

      {selectedTimePeriod && (
        <div className="translation-form">
          <h3>Original: {selectedTimePeriod.name}</h3>

          <div className="form-group">
            <label>Jezik prevoda</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="form-group">
            <label>Naziv (prevod)</label>
            <input
              type="text"
              value={name}
              placeholder="Unesi naziv na izabranom jeziku"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start year (prevod)</label>
              <input
                type="text"
                placeholder="Unesi pocetnu godinu"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End year (prevod)</label>
              <input
                type="text"
                placeholder="Unesi zadnju godinu"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Opis (prevod)</label>
            <textarea
              value={description}
              placeholder="Unesi opis na izabranom jeziku"
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "⏳ Čuvam..." : "Sačuvaj prevod"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TimePeriodTranslate;
