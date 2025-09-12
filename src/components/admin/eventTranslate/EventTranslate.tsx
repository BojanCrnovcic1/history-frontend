import { useState, useEffect } from "react";
import axios from "axios";
import "./eventTranslate.scss";
import { useAuth } from "../../../context/AuthContext";
import type { Events } from "../../../types/Events";
import { ApiConfig } from "../../../config/ApiConfig";
import type { EventTranslations } from "../../../types/EventTranslations";

const EventTranslate = () => {
  const { accessToken } = useAuth();

  const [events, setEvents] = useState<Events[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Events | null>(null);

  const [language, setLanguage] = useState("en"); // podrazumevano prevod na engleski
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");

  const [loading, setLoading] = useState(false);

  // Učitaj sve evente za dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${ApiConfig.API_URL}api/events`);
        setEvents(res.data || []);
      } catch (err) {
        console.error("Greška kod učitavanja eventa:", err);
      }
    };
    fetchEvents();
  }, []);

  // Kada se izabere event, povući detalje + prevod ako postoji
  useEffect(() => {
    if (!selectedEventId) return;

    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${ApiConfig.API_URL}api/events/${selectedEventId}`);
        const ev: Events = res.data;

        setSelectedEvent(ev);

        // Ako već ima prevod za izabrani jezik, popunimo polja
        const existing = ev.translates?.find((t: EventTranslations) => t.language === language);
        if (existing) {
          setTitle(existing.title);
          setDescription(existing.description);
        } else {
          setTitle("");
          setDescription("");
          setYear("");
        }
      } catch (err) {
        console.error("Greška kod učitavanja eventa:", err);
      }
    };

    fetchEvent();
  }, [selectedEventId, language]);

  const handleSave = async () => {
    if (!selectedEventId) return;

    setLoading(true);
    try {
      await axios.post(
        `${ApiConfig.API_URL}api/events/${selectedEventId}/translation`,
        {
          language,
          title,
          description,
          year
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      alert("Prevod uspješno sačuvan!");
      setTitle("");
      setDescription("");
      setYear("");
      setSelectedEventId(null);
      setSelectedEvent(null);
    } catch (err: any) {
      console.error("Greška kod snimanja prevoda:", err);
      alert(err?.response?.data?.message || "Greška!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-translate">
      <h2>Dodaj/uredi prevod eventa</h2>

      {/* Izbor eventa */}
      <div className="form-group">
        <label>Izaberi Event</label>
        <select
          value={selectedEventId ?? ""}
          onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Izaberi --</option>
          {events.map((ev) => (
            <option key={ev.eventId} value={ev.eventId}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div className="translation-form">
          <h3>Original: {selectedEvent.title}</h3>

          <div className="form-group">
            <label>Jezik prevoda</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              {/* možeš dodati još jezika */}
            </select>
          </div>

          <div className="form-group">
            <label>Naslov (prevod)</label>
            <input
              type="text"
              placeholder="Unesi naslov na izabranom jeziku"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Opis (prevod)</label>
            <textarea
              placeholder="Unesi opis na izabranom jeziku"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label>Godina (prevod)</label>
            <input
              type="text"
              placeholder="Unesi godinu"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Čuvam..." : "Sačuvaj prevod"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventTranslate;
