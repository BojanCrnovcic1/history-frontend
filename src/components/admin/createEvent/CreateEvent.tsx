import { useState, useEffect } from "react";
import axios from "axios";
import "./createEvent.scss";
import { useAuth } from "../../../context/AuthContext";
import { ApiConfig } from "../../../config/ApiConfig";
import type { Locations } from "../../../types/Locations";
import type { EventTypes } from "../../../types/EventTypes";
import type { TimePeriods } from "../../../types/TimePeriods";

type Block = {
  type: "text" | "image";
  content: string;
  file?: File | null;
  description?: string;
  tempUrl?: string;
  cid?: string;
};

const genCid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const CreateEvent = () => {
  const { accessToken } = useAuth();

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [locationId, setLocationId] = useState<number | null>(null);
  const [eventTypeId, setEventTypeId] = useState<number | null>(null);
  const [timePeriodId, setTimePeriodId] = useState<number | null>(null);

  const [locations, setLocations] = useState<Locations[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypes[]>([]);
  const [timePeriods, setTimePeriods] = useState<TimePeriods[]>([]);

  const [blocks, setBlocks] = useState<Block[]>([{ type: "text", content: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, typeRes, timeRes] = await Promise.all([
          axios.get(`${ApiConfig.API_URL}api/locations`),
          axios.get(`${ApiConfig.API_URL}api/event-types`),
          axios.get(`${ApiConfig.API_URL}api/time-periods`),
        ]);
        setLocations(locRes.data || []);
        setEventTypes(typeRes.data || []);
        setTimePeriods(timeRes.data || []);
      } catch (err) {
        console.error("Greška kod učitavanja podataka:", err);
      }
    };
    fetchData();
  }, []);

  const addBlock = (type: "text" | "image") => {
    setBlocks((prev) => [
      ...prev,
      type === "text"
        ? { type: "text", content: "" }
        : { type: "image", content: "", cid: genCid() },
    ]);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 1) return;
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlockUp = (index: number) => {
    if (index <= 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleTextChange = (index: number, value: string) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], content: value };
      return copy;
    });
  };

  const handleMediaDescriptionChange = (index: number, value: string) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], description: value };
      return copy;
    });
  };

  const handleFileChange = (index: number, file: File | null) => {
    setBlocks((prev) => {
      const copy = [...prev];
      if (file) {
        const tempUrl = URL.createObjectURL(file);
        const cid = copy[index].cid ?? genCid();
        copy[index] = { ...copy[index], file, tempUrl, cid };
      } else {
        copy[index] = { ...copy[index], file: null, tempUrl: undefined };
      }
      return copy;
    });
  };

  const findCreatedEventId = async (marker: string, titleValue: string): Promise<number> => {
    const listResp = await axios.get(`${ApiConfig.API_URL}api/events`);
    const all = Array.isArray(listResp.data) ? listResp.data : [];
    const found = all.find((e: any) => e?.description === marker && e?.title === titleValue);
    if (!found?.eventId) {
      throw new Error("Ne mogu dohvatiti ID novog eventa.");
    }
    return Number(found.eventId);
  };

  const fetchMediaByEvent = async (eventId: number) => {
    const res = await axios.get(`${ApiConfig.API_URL}api/media/event/${eventId}`);
    return Array.isArray(res.data) ? res.data : [];
  };


  const handleSubmit = async () => {
    if (loading || !title) return;
    setLoading(true);

    try {
      // 1) kreiramo event sa jedinstvenim markerom u description (backend ne vraća ID)
      const marker = `__NEW_EVENT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}__`;

      await axios.post(
        `${ApiConfig.API_URL}api/events`,
        {
          title,
          description: marker,
          year: year || null,
          timePeriodId,
          locationId,
          eventTypeId,
          isPremium: false,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // 2) dohvatimo ID upravo kreiranog eventa
      const eventId = await findCreatedEventId(marker, title);

      // 3) uploadujemo slike, u description ćemo ugraditi [cid:xxxx] da kasnije mapiramo
      for (const block of blocks) {
        if (block.type === "image" && block.file) {
          const cid = block.cid ?? genCid();
          const formData = new FormData();
          formData.append("file", block.file);
          formData.append("mediaType", "image");
          formData.append("eventId", String(eventId));
          const descWithCid = block.description ? `${block.description} [cid:${cid}]` : `[cid:${cid}]`;
          formData.append("description", descWithCid);

          await axios.post(`${ApiConfig.API_URL}api/media`, formData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          });
        }
      }

      // 4) dohvat svih media za event i mapiranje cid -> url
      const eventMedia = await fetchMediaByEvent(eventId);
      const cidToUrl = new Map<string, string>();
      for (const m of eventMedia) {
        const desc: string = m?.description || "";
        const match = desc.match(/\[cid:([a-z0-9-]+)\]/i);
        if (match?.[1] && m?.url) {
          cidToUrl.set(match[1], m.url);
        }
      }

      // 5) generiši finalni opis iz blokova
      const finalDescription = blocks
        .map((block) => {
          if (block.type === "text") {
            const txt = (block.content || "").trim();
            return txt ? `<p>${txt}</p>` : "";
          } else {
            const cid = block.cid;
            const rawUrl = cid ? cidToUrl.get(cid) : undefined;
            if (!rawUrl) return ""; // ako nema URL-a, preskoči
            const fullUrl = `${ApiConfig.PHOTO_PATH}${rawUrl}`;
            const caption = block.description ? `<figcaption>${block.description}</figcaption>` : "";
            return `<figure><img src="${fullUrl}" alt="${block.description || ""}" />${caption}</figure>`;
          }
        })
        .filter(Boolean)
        .join("\n");

      // 6) update opisa (zamjenjujemo marker finalnim HTML-om)
      await axios.patch(
        `${ApiConfig.API_URL}api/events/${eventId}`,
        { description: finalDescription },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      alert("Event uspješno kreiran!");
      setTitle("");
      setYear("");
      setLocationId(null);
      setEventTypeId(null);
      setTimePeriodId(null);
      setBlocks([{ type: "text", content: "" }]);
    } catch (err: any) {
      console.error("Greška pri snimanju eventa:", err);
      alert(err?.response?.data?.message || err?.message || "Greška!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
  <h2>Create New Event</h2>

  {/* Title */}
  <div className="form-group">
    <label>Event Title*</label>
    <input
      type="text"
      placeholder="Enter title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  </div>

  {/* Year */}
  <div className="form-group">
    <label>Year</label>
    <input
      type="text"
      placeholder="e.g. 1389 or 1914-1918"
      value={year}
      onChange={(e) => setYear(e.target.value)}
    />
  </div>

  {/* Drop-down fields */}
  <div className="form-row">
    <div className="form-group">
      <label>Time Period</label>
      <select
        value={timePeriodId ?? ""}
        onChange={(e) =>
          setTimePeriodId(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">-- Select --</option>
        {timePeriods.map((tp) => (
          <option key={tp.timePeriodId} value={tp.timePeriodId}>
            {tp.name}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Location</label>
      <select
        value={locationId ?? ""}
        onChange={(e) =>
          setLocationId(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">-- Select --</option>
        {locations.map((loc) => (
          <option key={loc.locationId} value={loc.locationId}>
            {loc.name}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Event Type</label>
      <select
        value={eventTypeId ?? ""}
        onChange={(e) =>
          setEventTypeId(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">-- Select --</option>
        {eventTypes.map((et) => (
          <option key={et.eventTypeId} value={et.eventTypeId}>
            {et.name}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Editor */}
  <div className="editor">
    <h3>Article Content</h3>
    {blocks.map((block, index) => (
      <div key={index} className="block-container">
        <div className="block-controls">
          <button onClick={() => moveBlockUp(index)} disabled={index === 0}>
            ↑
          </button>
          <button
            onClick={() => moveBlockDown(index)}
            disabled={index === blocks.length - 1}
          >
            ↓
          </button>
          <button
            onClick={() => removeBlock(index)}
            disabled={blocks.length <= 1}
          >
            ✕
          </button>
        </div>

        {block.type === "text" ? (
          <textarea
            placeholder="Enter text..."
            value={block.content}
            onChange={(e) => handleTextChange(index, e.target.value)}
            rows={5}
          />
        ) : (
          <div className="media-block">
            {block.tempUrl ? (
              <div className="image-preview">
                <img src={block.tempUrl} alt="Preview" />
                <button onClick={() => handleFileChange(index, null)}>
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="file-input-label">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleFileChange(index, e.target.files[0])
                  }
                  hidden
                />
              </label>
            )}
            <input
              type="text"
              placeholder="Image description (optional)"
              value={block.description || ""}
              onChange={(e) =>
                handleMediaDescriptionChange(index, e.target.value)
              }
            />
          </div>
        )}
      </div>
    ))}
  </div>

  <div className="editor-controls">
    <button onClick={() => addBlock("text")}>+ Add Text</button>
    <button onClick={() => addBlock("image")}>+ Add Image</button>
  </div>

  <button
    className="submit-btn"
    onClick={handleSubmit}
    disabled={loading || !title}
  >
    {loading ? "Saving..." : "Save Event"}
  </button>
</div>
  )
};

export default CreateEvent;
