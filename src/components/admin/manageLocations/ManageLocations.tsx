import React, { useEffect, useState } from "react";
import axios from "axios";
import "./manageLocations.scss";
import type { Locations } from "../../../types/Locations";
import { useAuth } from "../../../context/AuthContext";
import { ApiConfig } from "../../../config/ApiConfig";

const ManageLocations: React.FC = () => {
  const [locations, setLocations] = useState<Locations[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Locations>>({});
  const { accessToken } = useAuth();

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${ApiConfig.API_URL}api/locations`);
      setLocations(res.data);
      console.log('Fetch locations: ', res.data)
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("Da li ste sigurni da želite obrisati ovu lokaciju?")) return;
    try {
      await axios.delete(`${ApiConfig.API_URL}api/locations/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLocations(locations.filter((loc) => loc.locationId !== id));
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  const startEdit = (location: Locations) => {
    setEditingId(location.locationId ?? null);
    setEditData({ ...location });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await axios.patch(
        `${ApiConfig.API_URL}api/locations/${editingId}`,
        editData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setLocations(
        locations.map((loc) =>
          loc.locationId === editingId ? (res.data.data ?? loc) : loc
        )
      );
      cancelEdit();
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  return (
    <div className="manage-locations">
      <h2>Manage Locations</h2>
      <table className="locations-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Number event</th>
            <th>Akcions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.locationId}>
              <td>{loc.locationId}</td>
              <td>
                {editingId === loc.locationId ? (
                  <input 
                    placeholder="Name"
                    type="text"
                    value={editData.name ?? ""}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                ) : (
                  loc.name
                )}
              </td>
              <td>
                {editingId === loc.locationId ? (
                  <input
                    placeholder="Latitude"
                    type="text"
                    value={editData.latitude ?? ""}
                    onChange={(e) =>
                      setEditData({ ...editData, latitude: e.target.value })
                    }
                  />
                ) : (
                  loc.latitude
                )}
              </td>
              <td>
                {editingId === loc.locationId ? (
                  <input
                    placeholder="Longitude"
                    type="text"
                    value={editData.longitude ?? ""}
                    onChange={(e) =>
                      setEditData({ ...editData, longitude: e.target.value })
                    }
                  />
                ) : (
                  loc.longitude
                )}
              </td>
              <td>{loc.events?.length ?? 0}</td>
              <td>
                {editingId === loc.locationId ? (
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
                    <button className="edit" onClick={() => startEdit(loc)}>
                      ✏ Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDelete(loc.locationId)}
                    >
                      🗑 Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageLocations;
