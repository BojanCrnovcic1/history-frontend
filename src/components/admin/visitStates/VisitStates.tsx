import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";


import "./visitStates.scss";
import type { VisitStatus, Granularity } from "../../../types/Visits";
import { ApiConfig } from "../../../config/ApiConfig";

const granularities: Granularity[] = ["day", "week", "month", "year"];

const VisitStates: React.FC = () => {
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [data, setData] = useState<VisitStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get<VisitStatus[]>(
          `${ApiConfig.API_URL}api/visits/stats`,
          { params: { granularity } }
        );
        setData(res.data.reverse()); 
      } catch (err) {
        console.error("Greška prilikom dohvaćanja statistike:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [granularity]);

  return (
    <div className="visit-states">
      <h2>📊 Statistika poseta ({granularity})</h2>

      <div className="granularity-buttons">
        {granularities.map((g) => (
          <button
            key={g}
            className={g === granularity ? "active" : ""}
            onClick={() => setGranularity(g)}
          >
            {g.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Učitavanje...</p>
      ) : (
        <>
          <div className="numbers">
            <div className="card">
              <h3>Ukupno poseta</h3>
              <p>
                {data.reduce((sum, d) => sum + d.totalVisits, 0).toLocaleString()}
              </p>
            </div>
            <div className="card">
              <h3>Jedinstveni posetioci</h3>
              <p>
                {data.reduce((sum, d) => sum + d.uniqueVisitors, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodKey" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalVisits"
                stroke="#82ca9d"
                name="Ukupno poseta"
              />
              <Line
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="#8884d8"
                name="Jedinstveni posetioci"
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default VisitStates;
