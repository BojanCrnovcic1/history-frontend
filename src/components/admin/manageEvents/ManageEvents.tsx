import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './manageEvents.scss';
import { ApiConfig } from '../../../config/ApiConfig';
import { useAuth } from '../../../context/AuthContext';
import type { Events } from '../../../types/Events';

const ManageEvents: React.FC = () => {
  const [events, setEvents] = useState<Events[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Events | null>(null);
  const [editingMedia, setEditingMedia] = useState<boolean>(false);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [premiumStatus, setPremiumStatus] = useState<boolean>(true);
  const [newMedia, setNewMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaDescription, setMediaDescription] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const { accessToken } = useAuth();

  // Učitavanje svih događaja
  useEffect(() => {
    fetchEvents();
  }, [page, limit]);


  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: Events[]; total: number }>(
        ApiConfig.API_URL + 'api/events/filtered',
        {
          params: {
            page,
            limit,
          },
        }
      );
      setEvents(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await axios.delete(ApiConfig.API_URL + `api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setEvents(events.filter(event => event.eventId !== eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const handleTogglePremium = async (eventId: number, isPremium: boolean) => {
    try {
      const endpoint = isPremium 
        ? ApiConfig.API_URL + `api/events/${eventId}/mark-premium`
        : ApiConfig.API_URL + `api/events/${eventId}/unmark-premium`;
      
      await axios.patch(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setEvents(events.map(event => 
        event.eventId === eventId ? { ...event, isPremium } : event
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update premium status');
    }
  };

  const handleSetPremiumForAll = async () => {
    try {
      await axios.patch(ApiConfig.API_URL + `api/events/premium-all?status=${premiumStatus}`, {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setEvents(events.map(event => ({ ...event, isPremium: premiumStatus })));
      setShowPremiumModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update all events');
    }
  };

  const handleDeleteMedia = async (mediaId: number, eventId: number) => {
    try {
      await axios.delete(ApiConfig.API_URL + `api/media/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setEvents(events.map(event => 
        event.eventId === eventId 
          ? { ...event, media: event.media.filter(m => m.mediaId !== mediaId) }
          : event
      ));

      if (editingEvent && editingEvent.eventId === eventId) {
        setEditingEvent({
          ...editingEvent,
          media: editingEvent.media.filter(m => m.mediaId !== mediaId)
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media');
    }
  };

  const handleAddMedia = async (eventId: number) => {
    if (!newMedia) {
      alert('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', newMedia);
      formData.append('mediaType', mediaType);
      formData.append('description', mediaDescription);
      formData.append('eventId', eventId.toString());

      const response = await axios.post(ApiConfig.API_URL + 'api/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.data.status === 'success') {
        fetchEvents();
        
        setNewMedia(null);
        setMediaType('image');
        setMediaDescription('');
        
        alert('Media uploaded successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload media');
    }
  };

  const handleEditEvent = (event: Events) => {
    setEditingEvent(event);
    setEditingMedia(false);
  };

  const handleSaveEvent = async (updatedEvent: Events) => {
    try {
      await axios.patch(ApiConfig.API_URL + `api/events/${updatedEvent.eventId}`, updatedEvent, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setEvents(events.map(event => 
        event.eventId === updatedEvent.eventId ? updatedEvent : event
      ));
      setEditingEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="manage-events">

<div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>Next</button>

       <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
         </select>
    </div>
      <div className="header">

        <h1>Manage Events</h1>
        <button 
          className="btn-premium-all"
          onClick={() => setShowPremiumModal(true)}
        >
          Set Premium Status for All Events
        </button>
      </div>

      {showPremiumModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Set Premium Status for All Events</h2>
            <div className="modal-content">
              <label>
                <input
                  type="radio"
                  checked={premiumStatus}
                  onChange={() => setPremiumStatus(true)}
                />
                Mark all as Premium
              </label>
              <label>
                <input
                  type="radio"
                  checked={!premiumStatus}
                  onChange={() => setPremiumStatus(false)}
                />
                Mark all as Non-Premium
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={handleSetPremiumForAll}>Confirm</button>
              <button onClick={() => setShowPremiumModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="events-grid">
        {events.map(event => (
          <div key={event.eventId} className={`event-card ${event.isPremium ? 'premium' : ''}`}>
            <div className="event-image-carousel">
              {event.media && event.media.length > 0 ? (
                <>
                  <div className="carousel-main">
                    {event.media[0].mediaType === 'image' ? (
                      <img 
                        src={ApiConfig.PHOTO_PATH + event.media[0].url} 
                        alt={event.media[0].description || event.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <video controls>
                        <source src={ApiConfig.PHOTO_PATH + event.media[0].url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  {event.media.length > 1 && (
                    <div className="carousel-thumbnails">
                      {event.media.slice(0, 4).map((media, index) => (
                        <div key={media.mediaId} className="thumbnail">
                          {media.mediaType === 'image' ? (
                            <img 
                              src={ApiConfig.PHOTO_PATH + media.url} 
                              alt={`Thumbnail ${index + 1}`}
                            />
                          ) : (
                            <div className="video-thumbnail">▶️</div>
                          )}
                        </div>
                      ))}
                      {event.media.length > 4 && (
                        <div className="thumbnail-more">+{event.media.length - 4}</div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-image">No Media</div>
              )}
            </div>
            
            <div className="event-details">
              <h3>{event.title}</h3>
              <p className="description">{event.description}</p>
              
              <div className="event-meta">
                <span>Type: {event.eventType?.name}</span>
                <span>Location: {event.location?.name}</span>
                <span>Period: {event.timePeriod?.name}</span>
                <span>Year: {event.year}</span>
                <span>Media: {event.media?.length || 0} items</span>
              </div>
              
              <div className="premium-status">
                <label>
                  Premium Event:
                  <input
                    type="checkbox"
                    checked={event.isPremium || false}
                    onChange={(e) => handleTogglePremium(event.eventId!, e.target.checked)}
                  />
                </label>
              </div>
              
              <div className="event-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEditEvent(event)}
                >
                  Edit
                </button>
                <button 
                  className="btn-media"
                  onClick={() => {
                    setEditingEvent(event);
                    setEditingMedia(true);
                  }}
                >
                  Manage Media
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteEvent(event.eventId!)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingEvent && !editingMedia && (
        <EditEventModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onCancel={() => setEditingEvent(null)}
        />
      )}

      {editingEvent && editingMedia && (
        <MediaManagementModal
          event={editingEvent}
          onAddMedia={handleAddMedia}
          onDeleteMedia={handleDeleteMedia}
          onClose={() => {
            setEditingEvent(null);
            setEditingMedia(false);
          }}
          newMedia={newMedia}
          setNewMedia={setNewMedia}
          mediaType={mediaType}
          setMediaType={setMediaType}
          mediaDescription={mediaDescription}
          setMediaDescription={setMediaDescription}
        />
      )}
    </div>
  );
};

interface EditEventModalProps {
  event: Events;
  onSave: (event: Events) => void;
  onCancel: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, onSave, onCancel }) => {
  const [editedEvent, setEditedEvent] = useState<Events>(event);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedEvent);
  };

  return (
    <div className="modal-overlay">
      <div className="modal edit-modal">
        <h2>Edit Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor='title'>Title:</label>
            <input
              id='title'
              type="text"
              name="title"
              value={editedEvent.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor='description'>Description:</label>
            <textarea
              id='description'
              name="description"
              value={editedEvent.description}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor='year'>Year:</label>
            <input
              id='year'
              type="text"
              name="year"
              value={editedEvent.year || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MediaManagementModalProps {
  event: Events;
  onAddMedia: (eventId: number) => void;
  onDeleteMedia: (mediaId: number, eventId: number) => void;
  onClose: () => void;
  newMedia: File | null;
  setNewMedia: (file: File | null) => void;
  mediaType: 'image' | 'video';
  setMediaType: (type: 'image' | 'video') => void;
  mediaDescription: string;
  setMediaDescription: (description: string) => void;
}

const MediaManagementModal: React.FC<MediaManagementModalProps> = ({
  event,
  onAddMedia,
  onDeleteMedia,
  onClose,
  newMedia,
  setNewMedia,
  mediaType,
  setMediaType,
  mediaDescription,
  setMediaDescription
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewMedia(e.target.files[0]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal media-modal">
        <h2>Manage Media for: {event.title}</h2>
        
        <div className="media-list">
          <h3>Existing Media</h3>
          {event.media && event.media.length > 0 ? (
            <div className="media-grid">
              {event.media.map(media => (
                <div key={media.mediaId} className="media-item">
                  {media.mediaType === 'image' ? (
                    <img 
                      src={ApiConfig.PHOTO_PATH + media.url} 
                      alt={media.description || 'Event media'}
                    />
                  ) : (
                    <video controls>
                      <source src={ApiConfig.PHOTO_PATH + media.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <div className="media-info">
                    <p>{media.description || 'No description'}</p>
                    <p>Type: {media.mediaType}</p>
                  </div>
                  <button 
                    className="btn-delete"
                    onClick={() => onDeleteMedia(media.mediaId!, event.eventId!)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No media available for this event.</p>
          )}
        </div>

        <div className="add-media-form">
          <h3>Add New Media</h3>
          <div className="form-group">
            <label htmlFor="mediaFile">Select File:</label>
            <input
              id="mediaFile"
              type="file"
              accept={mediaType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="mediaType">Media Type:</label>
            <select
              id="mediaType"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="mediaDescription">Description (optional):</label>
            <input
              id="mediaDescription"
              type="text"
              value={mediaDescription}
              onChange={(e) => setMediaDescription(e.target.value)}
              placeholder="Enter media description"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => onAddMedia(event.eventId!)}
              disabled={!newMedia}
            >
              Upload Media
            </button>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;