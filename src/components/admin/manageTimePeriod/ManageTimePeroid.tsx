import React, { useEffect, useState } from "react";
import axios from "axios";
import type { TimePeriods } from "../../../types/TimePeriods";
import { ApiConfig } from "../../../config/ApiConfig";
import { useAuth } from "../../../context/AuthContext";
import "./manageTimePeroid.scss";

type EditPayload = {
  name: string;                    
  startYear?: string;             
  endYear?: string;               
  parentTimePeriodId?: number;   
  description?: string;         
};

const ManageTimePeriod: React.FC = () => {
  const [timePeriods, setTimePeriods] = useState<TimePeriods[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditPayload | null>(null);
  const { accessToken } = useAuth();

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<TimePeriods[]>(
        `${ApiConfig.API_URL}api/time-periods`
      );
      setTimePeriods(res.data);
    } catch (e) {
      setError("Greška prilikom učitavanja vremenskih perioda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const startEdit = (tp: TimePeriods) => {
    setEditingId(tp.timePeriodId ?? null);
    setEditData({
      name: tp.name ?? "",
      startYear: tp.startYear ?? undefined,
      endYear: tp.endYear ?? undefined,
      description: tp.description ?? undefined,
    });
    setMessage(null);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editData) return;

    const payload: EditPayload = { name: editData.name.trim() };
    if (editData.startYear && editData.startYear.trim().length > 0) {
      payload.startYear = editData.startYear.trim();
    }
    if (editData.endYear && editData.endYear.trim().length > 0) {
      payload.endYear = editData.endYear.trim();
    }
    if (typeof editData.parentTimePeriodId === "number") {
      payload.parentTimePeriodId = editData.parentTimePeriodId;
    }
    if (editData.description && editData.description.trim().length > 0) {
      payload.description = editData.description.trim();
    }

    if (!payload.name) {
      setError("Name je obavezan.");
      return;
    }

    try {
      const res = await axios.patch(
        `${ApiConfig.API_URL}api/time-periods/${editingId}/update`,
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );


      if (res.data?.status === "error") {
        setError(res.data.message ?? "Greška prilikom izmene perioda.");
        return;
      }

      const updated: TimePeriods = res.data?.data ?? res.data;

      setTimePeriods((prev) =>
        prev.map((tp) => (tp.timePeriodId === editingId ? updated : tp))
      );
      setMessage("✅ Time period je uspešno izmenjen.");
      cancelEdit();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Greška prilikom izmene perioda."
      );
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Da li ste sigurni da želite obrisati ovaj period?"))
      return;

    try {
      const res = await axios.delete(
        `${ApiConfig.API_URL}api/time-periods/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.data?.status === "error") {
        setError(res.data.message ?? "Greška prilikom brisanja perioda.");
        return;
      }

      setTimePeriods((prev) => prev.filter((tp) => tp.timePeriodId !== id));
      setMessage("🗑️ Time period je obrisan.");
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Greška prilikom brisanja perioda."
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="manage-time-period">
      <h2>Manage Time Periods</h2>

      {message && <div className="msg success">{message}</div>}
      {error && <div className="msg error">{error}</div>}

      <table className="tp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name *</th>
            <th>Start year</th>
            <th>End year</th>
            <th>Parent ID</th>
            <th>Description</th>
            <th>Children</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {timePeriods.map((tp) => {
            const isEditing = editingId === tp.timePeriodId;

            return (
              <tr key={tp.timePeriodId}>
                <td data-label="ID">{tp.timePeriodId}</td>

                <td data-label="Name">
                  {isEditing ? (
                    <input
                      placeholder="name..."
                      type="text"
                      value={editData?.name ?? ""}
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev ? { ...prev, name: e.target.value } : prev
                        )
                      }
                      required
                    />
                  ) : (
                    tp.name
                  )}
                </td>

                <td data-label="Start year">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.startYear ?? ""}
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev ? { ...prev, startYear: e.target.value } : prev
                        )
                      }
                      placeholder="e.g. 1200"
                    />
                  ) : (
                    tp.startYear || "-"
                  )}
                </td>

                <td data-label="End year">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.endYear ?? ""}
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev ? { ...prev, endYear: e.target.value } : prev
                        )
                      }
                      placeholder="e.g. 1450"
                    />
                  ) : (
                    tp.endYear || "-"
                  )}
                </td>

                <td data-label="Parent ID">
                  {isEditing ? (
                    <select
                      value={
                        typeof editData?.parentTimePeriodId === "number"
                          ? editData!.parentTimePeriodId
                          : ""
                      }
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev
                            ? {
                                ...prev,
                                parentTimePeriodId: e.target.value
                                  ? Number(e.target.value)
                                  : undefined, // undefined = ne šaljemo polje
                              }
                            : prev
                        )
                      }
                    >
                      <option value="">(keep current)</option>
                      {timePeriods
                        .filter((p) => p.timePeriodId !== tp.timePeriodId)
                        .map((p) => (
                          <option key={p.timePeriodId} value={p.timePeriodId}>
                            {p.timePeriodId} — {p.name}
                          </option>
                        ))}
                    </select>
                  ) : (
                    tp.parentTimePeriodId ?? "-"
                  )}
                </td>

                <td data-label="Description">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.description ?? ""}
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev ? { ...prev, description: e.target.value } : prev
                        )
                      }
                      placeholder="Optional"
                    />
                  ) : (
                    tp.description || "-"
                  )}
                </td>

                <td data-label="Children">{tp.children?.length ?? 0}</td>

                <td data-label="Actions" className="actions">
                  {isEditing ? (
                    <>
                      <button className="save" onClick={saveEdit}>
                        💾 Save
                      </button>
                      <button className="cancel" onClick={cancelEdit}>
                        ✖ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="edit" onClick={() => startEdit(tp)}>
                        ✏️ Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDelete(tp.timePeriodId)}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ManageTimePeriod;
