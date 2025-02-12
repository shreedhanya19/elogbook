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
        <div>
          <button
            onClick={startScanner}
            className=" bg-teal-200 p-6 rounded-lg w-full text-md font-semibold text-teal-900 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#134e4a"
              className="mr-4 "
            >
              <path d="M80-680v-200h200v80H160v120H80Zm0 600v-200h80v120h120v80H80Zm600 0v-80h120v-120h80v200H680Zm120-600v-120H680v-80h200v200h-80ZM700-260h60v60h-60v-60Zm0-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm120-120h60v60h-60v-60Zm-60 60h60v60h-60v-60Zm-60-60h60v60h-60v-60Zm240-320v240H520v-240h240ZM440-440v240H200v-240h240Zm0-320v240H200v-240h240Zm-60 500v-120H260v120h120Zm0-320v-120H260v120h120Zm320 0v-120H580v120h120Z" />
            </svg>
            <span className="  ">Scan QR Code</span>
          </button>
        </div>
      )}
    </div>
  );
}
