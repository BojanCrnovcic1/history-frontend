import React, { useState, useEffect } from "react";
import "./eventModal.scss";
import type { Events } from "../../types/Events";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { ApiConfig } from "../../config/ApiConfig";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Events | null;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [translatedEvent, setTranslatedEvent] = useState<any>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!isOpen || !event?.eventId) return;

    const fetchTranslatedEvent = async () => {
      try {
        const response = await axios.get(
          `${ApiConfig.API_URL}api/events/${event.eventId}/translate?lang=${i18n.language}`
        );
        setTranslatedEvent(response.data);
      } catch (error) {
        console.error("❌ Greška prilikom dohvatanja prevoda:", error);
        setTranslatedEvent(null);
      }
    };

    fetchTranslatedEvent();
  }, [isOpen, event?.eventId, i18n.language]);

  if (!isOpen || !event) return null;

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <div className="content">
          <h1 className="event-title">
            {translatedEvent?.title || event.title}
          </h1>

          <p className="event-meta">
            {(translatedEvent?.year || event.year) && (
              <span>{translatedEvent?.year || event.year}</span>
            )}
            {event.eventType?.name && <span> | {event.eventType.name}</span>}
            {event.location?.name && <span> | {event.location.name}</span>}
          </p>

          <div className="event-content">
            <div
              className="event-description"
              dangerouslySetInnerHTML={{
                __html: translatedEvent?.description || event.description,
              }}
            />
          </div>
        </div>
      </div>

      {fullscreenImage && (
        <div
          className="fullscreen-overlay"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="fullscreen-content">
            <button
              className="fullscreen-close"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImage(null);
              }}
            >
              ✖
            </button>
            <img src={fullscreenImage} alt="Fullscreen" />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventModal;
