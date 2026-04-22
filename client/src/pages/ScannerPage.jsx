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
  const [decodedValue, setDecodedValue] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraState, setCameraState] = useState("idle");
  const [scanStatus, setScanStatus] = useState("Camera is off.");
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const scanLockRef = useRef(false);
  const keepCameraRunningRef = useRef(false);
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      readerRef.current?.reset();
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  function clearNoticeTimer() {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
  }

  function closeNotice() {
    clearNoticeTimer();
    setNotice(null);
  }

  function scheduleNextScan(type = "success") {
    if (!keepCameraRunningRef.current || !isContinuousMode) {
      return;
    }

    clearNoticeTimer();
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      startCameraScanner(true);
    }, type === "success" ? 900 : 1400);
  }

  async function submitScan(rawToken) {
    const normalizedToken = extractToken(rawToken);
    setDecodedValue(String(rawToken || ""));

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
      scheduleNextScan("success");
    } catch (requestError) {
      const message =
        requestError.code === "ECONNABORTED"
          ? "Scan request timed out. Please try again."
          : requestError.response?.data?.message || requestError.message || "Scan failed.";
      const attendee = requestError.response?.data?.attendee || null;
      setResult(null);
      setError(message);
      setScanStatus(message);
      setNotice(buildNotice("error", "Scan Failed", message, attendee));
      scheduleNextScan("error");
    } finally {
      setIsSubmitting(false);
      scanLockRef.current = false;
    }
  }

  function handleDetectedQr(rawText) {
    const scannedToken = extractToken(rawText);
    setDecodedValue(String(rawText || ""));
    setToken(scannedToken);
    setScanStatus("QR detected. Preparing attendance request...");

    controlsRef.current?.stop();
    readerRef.current?.reset();
    setCameraState("idle");

    window.setTimeout(() => {
      submitScan(rawText);
    }, 150);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitScan(token);
  }

  async function startCameraScanner(isRestart = false) {
    setError("");
    setCameraState("starting");
    setScanStatus("Starting camera...");
    if (!isRestart) {
      keepCameraRunningRef.current = true;
    }
    clearNoticeTimer();
    setNotice(null);

    try {
      controlsRef.current?.stop();
      readerRef.current?.reset();
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
          const rawText = decodedResult.getText();
          handleDetectedQr(rawText);
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
    keepCameraRunningRef.current = false;
    clearNoticeTimer();
    controlsRef.current?.stop();
    readerRef.current?.reset();
    scanLockRef.current = false;
    setCameraState("idle");
    setScanStatus("Camera stopped.");
    setNotice(null);
  }

  return (
    <div className="page scanner-page">
      <section className="hero">
        <p className="eyebrow">Mobile Scanner</p>
        <h2>Record event entry, lunch, dinner, and kit distribution in real time.</h2>
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

        <label className="scanner-toggle">
          <input
            type="checkbox"
            checked={isContinuousMode}
            onChange={(event) => setIsContinuousMode(event.target.checked)}
          />
          Continuous scanning for event use
        </label>

        <p className="status-text">{scanStatus}</p>
        {decodedValue ? <p className="status-text">Decoded QR: {decodedValue}</p> : null}

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
              <option value="kitDistribution">Kit Distribution</option>
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
        <div className="scan-notice-backdrop" onClick={closeNotice}>
          <div className={`scan-notice scan-notice-${notice.type}`} onClick={(event) => event.stopPropagation()}>
            <h3>{notice.title}</h3>
            <p>{notice.message}</p>
            {notice.attendee ? (
              <div className="scan-notice-meta">
                <strong>{notice.attendee.name}</strong>
                <span>{notice.attendee.registrationNumber}</span>
              </div>
            ) : null}
            <button type="button" onClick={closeNotice}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
