import React, { useEffect, useState } from "react";
import axios from "axios";
import "./createTimePeriod.scss";
import type { TimePeriods } from "../../../types/TimePeriods";
import { ApiConfig } from "../../../config/ApiConfig";
import { useAuth } from "../../../context/AuthContext";

const CreateTimePeriod: React.FC = () => {
  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [description, setDescription] = useState("");
  const [parentTimePeriodId, setParentTimePeriodId] = useState<number | null>(null);
  const [timePeriods, setTimePeriods] = useState<TimePeriods[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    axios.get<TimePeriods[]>(ApiConfig.API_URL + "api/time-periods")
      .then(res => setTimePeriods(res.data))
      .catch(err => console.error("Error while loading time periods:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        name,
        startYear: startYear || null,
        endYear: endYear || null,
        parentTimePeriodId,
        description: description || null,
      };

      const res = await axios.post(ApiConfig.API_URL + "api/time-periods", payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`, 
        },
      });

      if (res.data.status === "error") {
        setMessage(`❌ ${res.data.message}`);
      } else {
        setMessage("✅ Time period successfully created!");
        setName("");
        setStartYear("");
        setEndYear("");
        setDescription("");
        setParentTimePeriodId(null);
      }
    } catch (err: any) {
      console.error(err);
      setMessage("❌ An error occurred while creating time period.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-time-period">
      <h2>Create new time period</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start year</label>
            <input
              type="text"
              value={startYear}
              onChange={e => setStartYear(e.target.value)}
              placeholder="e.g. 1200"
            />
          </div>

          <div className="form-group">
            <label>End year</label>
            <input
              type="text"
              value={endYear}
              onChange={e => setEndYear(e.target.value)}
              placeholder="e.g. 1450"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Additional description of the time period..."
          />
        </div>

        <div className="form-group">
          <label>Parent time period</label>
          <select
            value={parentTimePeriodId ?? ""}
            onChange={e => setParentTimePeriodId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">(none)</option>
            {timePeriods.map(tp => (
              <option key={tp.timePeriodId} value={tp.timePeriodId}>
                {tp.name} {tp.startYear && `(${tp.startYear} - ${tp.endYear || "..."})`}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "⏳ Creating..." : "Create"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default CreateTimePeriod;
