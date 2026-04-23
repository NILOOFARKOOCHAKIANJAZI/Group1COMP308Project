import { useCallback, useEffect, useRef, useState } from "react";
import { APIProvider, Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";
import MapPickerModal from "../map/MapPickerModal";
import CameraCaptureModal from "./CameraCaptureModal";

const initialForm = {
  title: "",
  description: "",
  category: "",
  priority: "",
  address: "",
  neighborhood: "",
  latitude: "",
  longitude: "",
  photoFile: null,
  previewUrl: "",
};

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
const MAX_FILE_SIZE_MB = 10;

function extractNeighborhood(components = []) {
  const byPriority = ["locality", "sublocality", "sublocality_level_1", "administrative_area_level_2"];
  for (const type of byPriority) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.long_name;
  }
  return "";
}

function AddressAutocomplete({ value, onTextChange, onPlaceSelect, hasError }) {
  const places = useMapsLibrary("places");
  const inputRef = useRef(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  useEffect(() => {
    if (!places || !inputRef.current) return undefined;

    const ac = new places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "address_components", "name"],
      componentRestrictions: { country: "ca" },
    });

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place?.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const neighborhood = extractNeighborhood(place.address_components);

      onPlaceSelectRef.current({
        address: place.formatted_address || place.name || "",
        latitude: lat,
        longitude: lng,
        neighborhood,
      });
    });

    return () => {
      if (listener) listener.remove();
    };
  }, [places]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onTextChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Start typing an address..."
      className={hasError ? "input-error" : ""}
      aria-required="true"
      autoComplete="off"
    />
  );
}

function LocationToolbar({ onPick, onUseCurrent, hasLocation, locating, locationError }) {
  return (
    <>
      <div className="location-field__actions">
        <button
          type="button"
          className="location-field__action location-field__action--primary"
          onClick={onUseCurrent}
          disabled={locating}
        >
          {locating ? "Locating..." : "Use my location"}
        </button>
        <button
          type="button"
          className="location-field__action"
          onClick={onPick}
          disabled={locating}
        >
          {hasLocation ? "Edit on map" : "Pick on map"}
        </button>
      </div>
      {locationError && (
        <div className="field-warning">{locationError}</div>
      )}
    </>
  );
}

export default function IssueForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const fileInputRef = useRef(null);

  const geocoding = useMapsLibrary("geocoding");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddressTextChange = useCallback((text) => {
    setForm((prev) => ({
      ...prev,
      address: text,
      latitude: "",
      longitude: "",
      neighborhood: "",
    }));
    setErrors((prev) => ({ ...prev, location: "" }));
    setLocationError("");
  }, []);

  const handlePlaceSelect = useCallback((place) => {
    setForm((prev) => ({
      ...prev,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      neighborhood: place.neighborhood || "",
    }));
    setErrors((prev) => ({ ...prev, location: "" }));
    setLocationError("");
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location detection. Pick a point on the map instead.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const applyWithoutAddress = () => {
          setForm((prev) => ({
            ...prev,
            address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            latitude: lat,
            longitude: lng,
            neighborhood: "",
          }));
          setErrors((prev) => ({ ...prev, location: "" }));
          setLocating(false);
        };

        if (!geocoding) {
          applyWithoutAddress();
          return;
        }

        const geocoder = new geocoding.Geocoder();
        geocoder
          .geocode({ location: { lat, lng } })
          .then((response) => {
            const best = response?.results?.[0];
            if (!best) {
              applyWithoutAddress();
              return;
            }
            setForm((prev) => ({
              ...prev,
              address: best.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              latitude: lat,
              longitude: lng,
              neighborhood: extractNeighborhood(best.address_components),
            }));
            setErrors((prev) => ({ ...prev, location: "" }));
            setLocating(false);
          })
          .catch(() => {
            applyWithoutAddress();
          });
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location access was blocked. You can still pick a point on the map.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Could not determine your location. Try again or pick on the map.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Getting your location took too long. Try again or pick on the map.");
        } else {
          setLocationError("Unable to get your location. Pick on the map instead.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [geocoding]);

  const acceptFile = (file) => {
    setFileError("");

    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Please choose an image file (PNG, JPG, GIF, or WebP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`Image must be under ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    if (form.previewUrl) {
      URL.revokeObjectURL(form.previewUrl);
    }

    setForm((prev) => ({
      ...prev,
      photoFile: file,
      previewUrl: URL.createObjectURL(file),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) acceptFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    setShowCamera(true);
  };

  const handleCameraCapture = (file) => {
    acceptFile(file);
  };

  const removeFile = () => {
    if (form.previewUrl) {
      URL.revokeObjectURL(form.previewUrl);
    }
    setForm((prev) => ({ ...prev, photoFile: null, previewUrl: "" }));
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMapSelect = (data) => {
    setForm((prev) => ({
      ...prev,
      address: data.address || "",
      neighborhood: data.neighborhood || "",
      latitude: data.latitude ?? "",
      longitude: data.longitude ?? "",
    }));
    setErrors((prev) => ({ ...prev, location: "" }));
    setLocationError("");
  };

  const hasLocation = form.latitude !== "" && form.longitude !== "";

  const validate = () => {
    const newErrors = {};

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      newErrors.title = "Please enter a title.";
    } else if (title.length < 5) {
      newErrors.title = "Title must be at least 5 characters.";
    } else if (title.length > 150) {
      newErrors.title = "Max 150 characters.";
    }

    if (!description) {
      newErrors.description = "Please enter a description.";
    } else if (description.length < 10) {
      newErrors.description = "Minimum 10 characters.";
    } else if (description.length > 2000) {
      newErrors.description = "Max 2000 characters.";
    }

    if (!hasLocation) {
      newErrors.location = "Please select an address from the suggestions, use your location, or pick a point on the map.";
    }

    return newErrors;
  };

  const uploadImage = async (file) => {
    const cloudName = "dusnohn9w";
    const uploadPreset = "civiccase_upload";

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    let photoUrl = "";

    try {
      if (form.photoFile) {
        setUploading(true);
        photoUrl = await uploadImage(form.photoFile);
      }

      const input = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        photoUrl,
        location: {
          address: form.address,
          neighborhood: form.neighborhood,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        },
      };

      await onSubmit(input);

      if (form.previewUrl) {
        URL.revokeObjectURL(form.previewUrl);
      }
      setForm(initialForm);
      setErrors({});
      setFileError("");
      setLocationError("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapInitialCenter = hasLocation
    ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) }
    : undefined;

  return (
    <APIProvider apiKey={mapApiKey || ""}>
      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-card__header">
          <div className="form-card__heading">
            <h2>Report a New Issue</h2>
            <p className="form-card__subtitle">
              Share what you're seeing in your neighborhood. Staff will review and assign the right team.
            </p>
          </div>
          <button
            className="primary-btn primary-btn--compact"
            type="submit"
            disabled={loading || uploading}
          >
            {uploading ? "Uploading..." : loading ? "Submitting..." : "Submit Issue"}
          </button>
        </div>

        <div className="form-grid">
          <div className="form-column">
            <div className="form-group">
              <label>
                Title <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className={errors.title ? "input-error" : ""}
                placeholder="Enter issue title"
                aria-required="true"
              />
              {!errors.title && <div className="field-hint">5 to 150 characters</div>}
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label>
                Description <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                className={errors.description ? "input-error" : ""}
                placeholder="Describe the issue"
                aria-required="true"
              />
              {!errors.description && <div className="field-hint">10 to 2000 characters</div>}
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Auto-detect</option>
                  <option value="pothole">Pothole</option>
                  <option value="broken_streetlight">Broken Streetlight</option>
                  <option value="flooding">Flooding</option>
                  <option value="sidewalk_damage">Sidewalk Damage</option>
                  <option value="garbage">Garbage</option>
                  <option value="graffiti">Graffiti</option>
                  <option value="traffic_signal">Traffic Signal</option>
                  <option value="safety_hazard">Safety Hazard</option>
                  <option value="other">Other</option>
                </select>
                <div className="field-hint">AI will classify if left blank</div>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="">Auto-detect</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <div className="field-hint">AI will assess if left blank</div>
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label>
                Upload Image <span className="optional-mark">Optional</span>
              </label>
              <div
                className={`dropzone ${isDragging ? "dropzone--active" : ""} ${form.previewUrl ? "dropzone--has-file" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={form.previewUrl ? undefined : openFilePicker}
                role="button"
                tabIndex={form.previewUrl ? -1 : 0}
                onKeyDown={(e) => {
                  if (!form.previewUrl && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    openFilePicker();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="dropzone__input"
                />

                {form.previewUrl ? (
                  <div className="dropzone__preview-wrap">
                    <img src={form.previewUrl} alt="Uploaded preview" className="dropzone__preview" />
                    <div className="dropzone__overlay">
                      <button
                        type="button"
                        className="dropzone__action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePicker();
                        }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        className="dropzone__action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCamera();
                        }}
                      >
                        Retake
                      </button>
                      <button
                        type="button"
                        className="dropzone__action dropzone__action--danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    {form.photoFile && (
                      <div className="dropzone__filename">
                        <strong>{form.photoFile.name}</strong>
                        <span>{(form.photoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="dropzone__empty">
                    <div className="dropzone__icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                    <p className="dropzone__title">Drop an image here</p>
                    <p className="dropzone__hint">or</p>
                    <div className="dropzone__buttons">
                      <button
                        type="button"
                        className="dropzone__button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePicker();
                        }}
                      >
                        Choose file
                      </button>
                      <button
                        type="button"
                        className="dropzone__button dropzone__button--secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCamera();
                        }}
                      >
                        Take photo
                      </button>
                    </div>
                    <p className="dropzone__meta">PNG, JPG, GIF or WebP, up to 10 MB</p>
                  </div>
                )}
              </div>
              {fileError && <div className="form-error">{fileError}</div>}
            </div>

            <div className="form-group">
              <label>
                Location <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <div className="location-card">
                <div className="location-field">
                  {mapApiKey ? (
                    <AddressAutocomplete
                      value={form.address}
                      onTextChange={handleAddressTextChange}
                      onPlaceSelect={handlePlaceSelect}
                      hasError={Boolean(errors.location)}
                    />
                  ) : (
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter address or pick on map"
                      aria-required="true"
                    />
                  )}
                </div>
                <LocationToolbar
                  onPick={() => setShowMap(true)}
                  onUseCurrent={handleUseCurrentLocation}
                  hasLocation={hasLocation}
                  locating={locating}
                  locationError={locationError}
                />
                <div className="field-hint">Type an address, tap Use my location, or drop a pin on the map.</div>

                {hasLocation && (
                  <div
                    className="location-preview"
                    onClick={() => setShowMap(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowMap(true);
                      }
                    }}
                  >
                    <div className="location-preview__map">
                      <Map
                        style={{ width: "100%", height: "100%" }}
                        center={{
                          lat: parseFloat(form.latitude),
                          lng: parseFloat(form.longitude),
                        }}
                        zoom={15}
                        gestureHandling="none"
                        disableDefaultUI
                        clickableIcons={false}
                      >
                        <Marker
                          position={{
                            lat: parseFloat(form.latitude),
                            lng: parseFloat(form.longitude),
                          }}
                        />
                      </Map>
                      <div className="location-preview__click-overlay" aria-hidden="true" />
                    </div>
                    <div className="location-preview__meta">
                      <div className="location-preview__info">
                        <div className="location-preview__label">Selected location</div>
                        <div className="location-preview__address">
                          {form.address || "Pinned location"}
                        </div>
                        <div className="location-preview__tags">
                          {form.neighborhood && (
                            <span className="location-preview__tag">{form.neighborhood}</span>
                          )}
                          <span className="location-preview__tag">
                            {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
                          </span>
                        </div>
                      </div>
                      <button type="button" className="location-preview__edit">
                        Edit on map
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {errors.location && <div className="form-error">{errors.location}</div>}
            </div>
          </div>
        </div>
      </form>

      {showMap && (
        <MapPickerModal
          onClose={() => setShowMap(false)}
          onSelect={handleMapSelect}
          initialCenter={mapInitialCenter}
        />
      )}

      {showCamera && (
        <CameraCaptureModal
          onClose={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />
      )}
    </APIProvider>
  );
}
