import React, { useEffect, useState, useRef, type JSX, useMemo } from "react";
import axios from "axios";
import "./map.scss";
import type { TimePeriods } from "../../types/TimePeriods";
import type { Events } from "../../types/Events";
import { useAuth } from "../../context/AuthContext";
import { ApiConfig } from "../../config/ApiConfig";
import TimePeriodDescriptionModal from "../../modals/timePeroid/TimePeriodDescriptionModal";
import { useNavigate } from "react-router-dom";
import EventModal from "../../modals/events/EventModal";
import { LocateFixed, Music, Scroll, Swords, VolumeX } from "lucide-react";
import PremiumMapModal from "../../modals/events/PremiumMapModal";
import { useMusic } from "../../context/MusicContext";
import { useTranslation } from "react-i18next";

const MAP_BOUNDS = {
  north: 60,
  south: 25,
  west: -10,
  east: 65,
};

const Map: React.FC = () => {
  const { accessToken } = useAuth();
  const { isPlaying, toggleMusic, setTrack } = useMusic();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { i18n, t } = useTranslation();


  const [mapSize, setMapSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [timePeriods, setTimePeriods] = useState<TimePeriods[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriods | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>("event");
  const [openPeriod, setOpenPeriod] = useState<TimePeriods | null>(null);
  const [openEvent, setOpenEvent] = useState<Events | null>(null); 
  const [openPremium, setOpenPremium] = useState<boolean>(false);
  const [availableEventTypes, setAvailableEventTypes] = useState<string[]>([]);
  

  const coordsToPixel = (
    lat: number,
    lon: number,
    rectWidth: number,
    rectHeight: number
  ) => {
    const x =
      ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) *
      rectWidth;
    const y =
      ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) *
      rectHeight;
    return { x, y };
  };

  // Funkcija za prikupljanje svih događaja iz perioda
  const collectEvents = (period: TimePeriods | null): Events[] => {
    if (!period) return [];
    let events: Events[] = [];
    if (period.events) {
      events = [...events, ...period.events];
    }
    if (period.children) {
      for (const child of period.children) {
        events = [...events, ...collectEvents(child)];
      }
    }
    return events;
  };

  const currentEvents = useMemo(() => {
    return collectEvents(selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    if (currentEvents.length === 0) {
      setAvailableEventTypes([]);
      return;
    }

    const types = new Set<string>();
    currentEvents.forEach(event => {
      if (event.eventType?.name) {
        types.add(event.eventType.name);
      }
    });

    if (types.size > 0) {
      types.add("event");
    }

    setAvailableEventTypes(Array.from(types));
  }, [currentEvents]);

  useEffect(() => {
    if (selectedEventType !== "event" && !availableEventTypes.includes(selectedEventType)) {
      setSelectedEventType("event");
    }
  }, [availableEventTypes, selectedEventType]);

  useEffect(() => {
    switch (selectedEventType) {
      case "battle":
        setTrack("/assets/audio/war-preparations-epic-orchestral-music-387985.mp3");
        break;
      case "biography":
        setTrack("/assets/audio/documentary-music-362550.mp3");
        break;
      case "event":
        setTrack("/assets/audio/history-historical-documentary-music-334820.mp3");
        break;
      default:
        setTrack("/assets/audio/history-historical-documentary-music-334820.mp3");
        break;
    }
  }, [selectedEventType, setTrack]);
  

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await axios.get(
          `${ApiConfig.API_URL}api/time-periods/roots`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
  
        const roots: TimePeriods[] = response.data;
  
        const addTranslation = (period: TimePeriods): TimePeriods => {
          const translation = period.translations?.find(t => t.language === i18n.language);
          const newPeriod: TimePeriods = {
            ...period,
            name: translation?.name || period.name,
            startYear: translation?.startYear || period.startYear,
            endYear: translation?.endYear || period.endYear,
            description: translation?.description || period.description,
            children: period.children?.map(addTranslation) || [],
            events: period.events?.map(ev => {
              const evTranslation = ev.translates?.find(t => t.language === i18n.language);
              return {
                ...ev,
                title: evTranslation?.title || ev.title,
                description: evTranslation?.description || ev.description,
              }
            }) || [],
          };
          return newPeriod;
        };
  
        const translatedRoots = roots.map(addTranslation);
  
        setTimePeriods(translatedRoots);
        if (translatedRoots.length > 0) setSelectedPeriod(translatedRoots[0]);
  
      } catch (error) {
        console.error("Greška pri dohvaćanju perioda:", error);
      }
    };
    fetchPeriods();
  }, [accessToken, i18n.language]);
  

  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        const img = mapRef.current.querySelector("img");
        if (img && img.complete) { 
          setMapSize({
            width: img.clientWidth,
            height: img.clientHeight,
          });
          setIsImageLoaded(true);
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleImageLoad = () => {
    if (mapRef.current) {
      const img = mapRef.current.querySelector("img");
      if (img) {
        setMapSize({
          width: img.clientWidth,
          height: img.clientHeight,
        });
        setIsImageLoaded(true);
      }
    }
  };

  const renderEvents = (events: Events[]) => {
    return events
      .filter((ev) => {
        if (selectedEventType === "event") {
          return ev.eventType?.name === "event"; 
        }
        return ev.eventType?.name === selectedEventType; 
      })
      .map((ev) => {
        if (!ev.location) return null;
  
        const { x, y } = coordsToPixel(
          parseFloat(ev.location.latitude),
          parseFloat(ev.location.longitude),
          mapSize.width,
          mapSize.height
        );
  
        let IconComponent: React.ElementType = LocateFixed;
        if (ev.eventType?.name === "battle") {
          IconComponent = Swords;
        } else if (ev.eventType?.name === "biography") {
          IconComponent = Scroll;
        }
  
        return (
          <div
            key={ev.eventId}
            className="marker"
            style={{ left: x, top: y }}
            onClick={() => {
              if (ev.isPremium) {
                setOpenPremium(true);
              } else {
                setOpenEvent(ev);
              }
            }}
            data-label={ev.title}
          >
            <IconComponent
              size={28}
              color={ev.isPremium ? "#FFD700" : "silver"}
              strokeWidth={2.5}
            />
          </div>
        );
      });
  };  
  
  const renderPeriodOptions = (periods: TimePeriods[], prefix = ""): JSX.Element[] => {
    return periods.flatMap((p) => {
      const years =
        p.startYear && p.endYear ? ` (${p.startYear} - ${p.endYear})` :
        p.startYear ? ` (od ${p.startYear})` :
        p.endYear ? ` (do ${p.endYear})` : "";
  
      return [
        <option key={p.timePeriodId} value={p.timePeriodId}>
          {prefix + p.name + years}
        </option>,
        ...(p.children ? renderPeriodOptions(p.children, prefix + "— ") : []),
      ];
    });
  };  

  return (
    <div className="map-container">
      <div className="map-bg">
        <div className="map-page">
          <div className="nav-button">
            <div className="nav-left">
              <button className="close-btn" onClick={() => navigate('/')}>{t("map.back")}</button>
            </div>
            <div className="nav-right">
              <select 
                title={t("map.events")}
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
              >
                <option 
                  value="event"
                  disabled={!availableEventTypes.includes("event")}
                >
                  {t("map.events")}
                </option>
                <option 
                  value="battle"
                  disabled={!availableEventTypes.includes("battle")}
                >
                  {t("map.battles")}
                </option>
                <option 
                  value="biography"
                  disabled={!availableEventTypes.includes("biography")}
                >
                  {t("map.biographies")}
                </option>
              </select>
              <select 
                title={t("map.timePeriods")}
                value={selectedPeriod?.timePeriodId || ""}
                onChange={(e) => {
                  const findPeriodById = (periods: TimePeriods[], id: number): TimePeriods | null => {
                    for (const p of periods) {
                      if (p.timePeriodId === id) return p;
                      const child = findPeriodById(p.children || [], id);
                      if (child) return child;
                    }
                    return null;
                  };

                  const id = Number(e.target.value);
                  const period = findPeriodById(timePeriods, id);
                  setSelectedPeriod(period || null);

                  if (period) setOpenPeriod(period);
                }}
              >
                {renderPeriodOptions(timePeriods)}
              </select>
              <div className="music-toggle" onClick={toggleMusic}>
                  {isPlaying ? <Music size={22} /> : <VolumeX size={22} />}
              </div>
            </div>
          </div>

          <div className="map" ref={mapRef}>
            <img 
              src="/assets/map.png" 
              alt={t("map.mapAlt")} 
              className="map-image" 
              onLoad={handleImageLoad} 
            />

            {isImageLoaded && mapSize.width > 0 && mapSize.height > 0 && selectedPeriod && (
              renderEvents(currentEvents)
            )}
          </div>
        </div>

        <TimePeriodDescriptionModal
          isOpen={!!openPeriod}
          onClose={() => setOpenPeriod(null)}
          timePeriodId={openPeriod?.timePeriodId ?? null}
          defaultTitle={openPeriod?.name}
          defaultDescription={openPeriod?.description || ""}
        />
        <EventModal
          isOpen={!!openEvent}
          onClose={() => setOpenEvent(null)}
          event={openEvent}
        />
        <PremiumMapModal
          isOpen={openPremium}
          onClose={() => setOpenPremium(false)}
        />
      </div>
    </div>
  );
};

export default Map;