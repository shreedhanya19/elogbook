"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useRouter } from "next/navigation";

export default function QRScanner() {
  const [qrResult, setQrResult] = useState(""); // Store QR code result
  const [isScanning, setIsScanning] = useState(false); // Scanning state
  const videoRef = useRef(null); // Reference to the video element
  const scannerRef = useRef(null); // Reference to the ZXing scanner

  const router = useRouter();

  const startScanner = async () => {
    if (isScanning) return; // Prevent multiple initializations
    setIsScanning(true);

    try {
      const scanner = new BrowserMultiFormatReader();
      scannerRef.current = scanner;

      // Get available video devices (cameras)
      const videoDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevice = videoDevices.find(
        (device) => device.kind === "videoinput"
      );

      if (videoDevice) {
        // If a camera is found, pass the device ID to the scanner
        await scanner.decodeFromVideoDevice(
          videoDevice.deviceId, // Use the deviceId for the selected camera
          videoRef.current, // Attach video feed
          async (result, error) => {
            if (result) {
              setQrResult(result.getText()); // Update QR code result
              stopScanner(); // Stop scanning after successful result
            }
            if (error && error.name !== "NotFoundException") {
              console.warn(error.message); // Log non-critical errors
            }
          }
        );
      } else {
        console.error("No video input devices found");
        stopScanner();
      }
    } catch (error) {
      console.error("Error initializing scanner:", error);
      stopScanner();
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.reset(); // Stop the scanner
      scannerRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop()); // Stop the video feed
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  useEffect(() => {
    if (qrResult) {
      const finalResult = parseInt(qrResult.split(";")[0]) - 1;
      console.log(finalResult);
      router.push(`/protected/production/${finalResult}`);
    } else {
      console.log("No QR code detected");
    }
  }, [qrResult]);

  useEffect(() => {
    // Clean up resources when the component unmounts
    return () => stopScanner();
  }, []);

  return (
    <div>
      <h2>QR Code Scanner</h2>

      {isScanning ? (
        <div>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              maxHeight: "400px",
              border: "2px solid black",
              marginBottom: "10px",
            }}
            autoPlay
            playsInline
          />
          <button
            onClick={stopScanner}
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Stop Scanning
          </button>
        </div>
      ) : (
        <button
          onClick={startScanner}
          style={{
            padding: "10px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Start Scanning
        </button>
      )}

      <div>
        <h3>Scanned QR Code:</h3>
        <p>{qrResult || "No QR code scanned yet"}</p>
      </div>
    </div>
  );
}
