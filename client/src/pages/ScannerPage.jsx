import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";
import { recordScan } from "../api";

function extractToken(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  try {
    const parsedUrl = new URL(value);
    const parts = parsedUrl.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    const sanitized = value.split("?")[0].split("#")[0].replace(/\/+$/, "");
    const parts = sanitized.split("/").filter(Boolean);
    return parts[parts.length - 1] || sanitized;
  }
}

function buildNotice(type, title, message, attendee = null) {
  return { type, title, message, attendee };
}

export default function ScannerPage() {
  const [scanType, setScanType] = useState("entry");
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraState, setCameraState] = useState("idle");
  const [scanStatus, setScanStatus] = useState("Camera is off.");
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const scanLockRef = useRef(false);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      readerRef.current?.reset();
    };
  }, []);

  async function submitScan(rawToken) {
    const normalizedToken = extractToken(rawToken);

    if (!normalizedToken) {
      setResult(null);
      setError("No QR token found. Please scan again.");
      setScanStatus("QR detected, but token could not be read.");
      setNotice(buildNotice("error", "Scan Failed", "No QR token found. Please scan again."));
      return;
    }

    setIsSubmitting(true);
    setError("");
    setScanStatus("QR detected. Recording attendance...");

    try {
      const data = await recordScan(scanType, normalizedToken);
      setResult(data);
      setToken("");
      setScanStatus("Attendance recorded successfully.");
      setNotice(buildNotice("success", "Scan Successful", data.message, data.attendee));
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Scan failed.";
      const attendee = requestError.response?.data?.attendee || null;
      setResult(null);
      setError(message);
      setScanStatus(message);
      setNotice(buildNotice("error", "Scan Failed", message, attendee));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitScan(token);
  }

  async function startCameraScanner() {
    setError("");
    setCameraState("starting");
    setScanStatus("Starting camera...");

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const rearCamera =
        devices.find((device) => /back|rear|environment/i.test(device.label)) ||
        devices[devices.length - 1];

      controlsRef.current = await reader.decodeFromVideoDevice(
        rearCamera?.deviceId,
        videoRef.current,
        async (decodedResult) => {
          if (!decodedResult || scanLockRef.current) {
            return;
          }

          scanLockRef.current = true;
          setScanStatus("QR detected. Processing...");
          const scannedToken = extractToken(decodedResult.getText());
          controlsRef.current?.stop();
          reader.reset();
          setCameraState("idle");
          setToken(scannedToken);
          await submitScan(scannedToken);
          window.setTimeout(() => {
            scanLockRef.current = false;
          }, 1200);
        }
      );
      setCameraState("live");
      setScanStatus("Camera is live. Point it at the badge QR.");
    } catch {
      setCameraState("idle");
      setError("Unable to access the rear camera. Please allow camera permission and try again.");
      setScanStatus("Camera could not be started.");
      setNotice(buildNotice("error", "Camera Error", "Unable to access the rear camera. Please allow camera permission and try again."));
    }
  }

  function stopCameraScanner() {
    controlsRef.current?.stop();
    readerRef.current?.reset();
    scanLockRef.current = false;
    setCameraState("idle");
    setScanStatus("Camera stopped.");
  }

  return (
    <div className="page scanner-page">
      <section className="hero">
        <p className="eyebrow">Mobile Scanner</p>
        <h2>Record event entry, lunch, and dinner in real time.</h2>
        <p className="status-text">
          Open this page on a mobile device during the event, choose the scan type, allow camera access, and scan the attendee QR.
        </p>
      </section>

      <section className="panel">
        <div className="scanner-actions">
          <button type="button" onClick={startCameraScanner} disabled={cameraState === "starting" || cameraState === "live"}>
            {cameraState === "live" ? "Camera Running" : cameraState === "starting" ? "Starting Camera..." : "Start Camera Scanner"}
          </button>
          <button type="button" onClick={stopCameraScanner} disabled={cameraState !== "live"}>
            Stop Camera
          </button>
        </div>

        <p className="status-text">{scanStatus}</p>

        <div className="camera-panel">
          <video ref={videoRef} className="scanner-video" muted playsInline autoPlay />
        </div>

        <form className="scanner-form" onSubmit={handleSubmit}>
          <label>
            Scan Type
            <select value={scanType} onChange={(event) => setScanType(event.target.value)}>
              <option value="entry">Event Entry</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </label>
          <label>
            QR Token
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste the QR URL/token or scan with camera"
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Scan"}
          </button>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
        {result ? (
          <div className="result-card">
            <strong>{result.attendee.name}</strong>
            <p>{result.message}</p>
            <span>{result.attendee.registrationNumber}</span>
          </div>
        ) : null}
      </section>

      {notice ? (
        <div className="scan-notice-backdrop" onClick={() => setNotice(null)}>
          <div className={`scan-notice scan-notice-${notice.type}`} onClick={(event) => event.stopPropagation()}>
            <h3>{notice.title}</h3>
            <p>{notice.message}</p>
            {notice.attendee ? (
              <div className="scan-notice-meta">
                <strong>{notice.attendee.name}</strong>
                <span>{notice.attendee.registrationNumber}</span>
              </div>
            ) : null}
            <button type="button" onClick={() => setNotice(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
