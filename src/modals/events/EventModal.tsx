import React, { useState, useEffect } from "react";
import "./eventModal.scss";
import type { Events } from "../../types/Events";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Events | null;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = document.querySelector(".event-description");
    if (!container) return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        setFullscreenImage((target as HTMLImageElement).src);
      }
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [isOpen]);

  if (!isOpen || !event) return null;

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <button className="close-btn" onClick={onClose}>✖</button>

        <div className="content">
        <h1 className="event-title">{event.title}</h1>
        <p className="event-meta">
          {event.year && <span>{event.year}</span>}
          {event.eventType?.name && <span> | {event.eventType.name}</span>}
          {event.location?.name && <span> | {event.location.name}</span>}
        </p>

        <div className="event-content">
          <div
            className="event-description"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </div>
      </div>
        </div>

      {fullscreenImage && (
        <div className="fullscreen-overlay" onClick={() => setFullscreenImage(null)}>
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
