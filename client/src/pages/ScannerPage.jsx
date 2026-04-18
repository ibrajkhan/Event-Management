import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";
import { recordScan } from "../api";

function extractToken(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  const parts = value.split("/");
  return parts[parts.length - 1];
}

export default function ScannerPage() {
  const [scanType, setScanType] = useState("entry");
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraState, setCameraState] = useState("idle");
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      readerRef.current?.reset();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const data = await recordScan(scanType, extractToken(token));
      setResult(data);
      setToken("");
    } catch (requestError) {
      setResult(null);
      setError(requestError.response?.data?.message || "Scan failed.");
    }
  }

  async function startCameraScanner() {
    setError("");
    setCameraState("starting");

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, async (result) => {
        if (!result) {
          return;
        }

        const scannedToken = extractToken(result.getText());
        controlsRef.current?.stop();
        reader.reset();
        setCameraState("idle");
        setToken(scannedToken);

        try {
          const data = await recordScan(scanType, scannedToken);
          setResult(data);
        } catch (requestError) {
          setResult(null);
          setError(requestError.response?.data?.message || "Scan failed.");
        }
      });
      setCameraState("live");
    } catch (cameraError) {
      setCameraState("idle");
      setError("Unable to access camera. Please allow camera permission or paste the QR token manually.");
    }
  }

  function stopCameraScanner() {
    controlsRef.current?.stop();
    readerRef.current?.reset();
    setCameraState("idle");
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

        <div className="camera-panel">
          <video ref={videoRef} className="scanner-video" muted playsInline />
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
          <button type="submit">Record Scan</button>
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
    </div>
  );
}
