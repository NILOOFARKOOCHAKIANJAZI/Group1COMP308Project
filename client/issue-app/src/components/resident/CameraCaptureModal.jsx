import { useEffect, useRef, useState } from "react";
import "./CameraCaptureModal.css";

const CAPTURE_QUALITY = 0.88;

function buildFilename() {
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  return `photo-${stamp}.jpg`;
}

// Modal for capturing a photo using the device camera
export default function CameraCaptureModal({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState("environment");
  const [status, setStatus] = useState("requesting");
  const [errorMessage, setErrorMessage] = useState("");
  const [capturedDataUrl, setCapturedDataUrl] = useState("");
  const [capturedBlob, setCapturedBlob] = useState(null);

  useEffect(() => {
    let active = true;

    async function startStream() {
      setStatus("requesting");
      setErrorMessage("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setErrorMessage("Your browser does not support camera access.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(() => {});
            setStatus("streaming");
          };
        }
      } catch (err) {
        if (!active) return;

        setStatus("error");

        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage(
            "Camera access was blocked. Please allow camera permission in your browser settings, then try again."
          );
        } else if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
          setErrorMessage("No camera was found on this device.");
        } else if (err.name === "NotReadableError") {
          setErrorMessage("The camera is being used by another application.");
        } else {
          setErrorMessage(err.message || "Could not access the camera.");
        }
      }
    }

    startStream();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", CAPTURE_QUALITY);
    setCapturedDataUrl(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) setCapturedBlob(blob);
      },
      "image/jpeg",
      CAPTURE_QUALITY
    );
  };

  const handleRetake = () => {
    setCapturedDataUrl("");
    setCapturedBlob(null);
  };

  const handleConfirm = () => {
    if (!capturedBlob) return;

    const file = new File([capturedBlob], buildFilename(), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    onCapture(file);
    onClose();
  };

  const handleSwitchCamera = () => {
    setCapturedDataUrl("");
    setCapturedBlob(null);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleRetry = () => {
    setFacingMode((prev) => prev);
    setStatus("requesting");
    setErrorMessage("");
  };

  return (
    <div
      className="camera-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Take a photo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="camera-modal__panel">
        <header className="camera-modal__head">
          <h3 className="camera-modal__title">Take a photo</h3>
          <button
            type="button"
            className="camera-modal__close"
            onClick={onClose}
            aria-label="Close camera"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="camera-modal__stage">
          {status === "error" ? (
            <div className="camera-modal__message" role="alert">
              <div className="camera-modal__message-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="camera-modal__message-text">{errorMessage}</p>
              <button type="button" className="camera-modal__btn" onClick={handleRetry}>
                Try again
              </button>
            </div>
          ) : capturedDataUrl ? (
            <img
              src={capturedDataUrl}
              alt="Captured preview"
              className="camera-modal__preview"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                className="camera-modal__video"
                playsInline
                muted
                autoPlay
              />
              {status === "requesting" && (
                <div className="camera-modal__loading" aria-live="polite">
                  Requesting camera permission...
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="camera-modal__canvas" />
        </div>

        <footer className="camera-modal__foot">
          {capturedDataUrl ? (
            <>
              <button
                type="button"
                className="camera-modal__btn camera-modal__btn--ghost"
                onClick={handleRetake}
              >
                Retake
              </button>
              <button
                type="button"
                className="camera-modal__btn camera-modal__btn--primary"
                onClick={handleConfirm}
                disabled={!capturedBlob}
              >
                Use this photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="camera-modal__btn camera-modal__btn--ghost"
                onClick={handleSwitchCamera}
                disabled={status !== "streaming"}
              >
                Switch camera
              </button>
              <button
                type="button"
                className="camera-modal__shutter"
                onClick={handleCapture}
                disabled={status !== "streaming"}
                aria-label="Capture photo"
              >
                <span className="camera-modal__shutter-ring" />
                <span className="camera-modal__shutter-core" />
              </button>
              <button
                type="button"
                className="camera-modal__btn camera-modal__btn--ghost"
                onClick={onClose}
              >
                Cancel
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
