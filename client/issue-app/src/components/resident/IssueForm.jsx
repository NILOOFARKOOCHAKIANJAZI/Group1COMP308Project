import { useState } from "react";
import MapPickerModal from "../map/MapPickerModal";

const initialForm = {
  title: "",
  description: "",
  category: "",
  priority: "medium",
  address: "",
  neighborhood: "",
  latitude: "",
  longitude: "",
  photoFile: null,
  previewUrl: "",
};

export default function IssueForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      photoFile: file,
      previewUrl: URL.createObjectURL(file),
    }));
  };

  const handleMapSelect = (data) => {
    setForm((prev) => ({
      ...prev,
      address: data.address || "",
      neighborhood: data.neighborhood || "",
      latitude: data.latitude ?? "",
      longitude: data.longitude ?? "",
    }));
  };

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
        category: form.category || "other",
        priority: form.priority || "medium",
        photoUrl,
        location: {
          address: form.address,
          neighborhood: form.neighborhood,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        },
      };

      await onSubmit(input);
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Report a New Issue</h2>

        <div className="form-grid">
          <div className="form-group full-width">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
              placeholder="Enter issue title"
            />
            {!errors.title && (
              <div className="field-hint">5 to 150 characters</div>
            )}
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              className={errors.description ? "input-error" : ""}
              placeholder="Describe the issue"
            />
            {!errors.description && (
              <div className="field-hint">10 to 2000 characters</div>
            )}
            {errors.description && (
              <div className="form-error">{errors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
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
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Upload Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {form.previewUrl && (
              <img src={form.previewUrl} alt="preview" className="issue-photo" />
            )}
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </div>

          <div className="form-group full-width">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowMap(true)}
            >
              Pick on Map
            </button>
          </div>

          <div className="form-group">
            <label>Neighborhood</label>
            <input
              type="text"
              name="neighborhood"
              value={form.neighborhood}
              onChange={handleChange}
              placeholder="Auto-filled from map"
            />
          </div>

          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              readOnly
              placeholder="Auto-filled from map"
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              readOnly
              placeholder="Auto-filled from map"
            />
          </div>
        </div>

        <button
          className="primary-btn"
          type="submit"
          disabled={loading || uploading}
        >
          {uploading ? "Uploading..." : loading ? "Submitting..." : "Submit Issue"}
        </button>
      </form>

      {showMap && (
        <MapPickerModal
          onClose={() => setShowMap(false)}
          onSelect={handleMapSelect}
        />
      )}
    </>
  );
}