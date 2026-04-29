import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

const FaceMonitor = ({ onViolation, isStarted, isSubmitted }) => {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const detectionInterval = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Using common CDN for weights to avoid local model management for now
        // This is a reliable URL for face-api weights
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          // faceapi.nets.faceLandmark64Net.loadFromUri(MODEL_URL) // Optional for detailed orientation
        ]);
        
        setModelsLoaded(true);
        console.log("✅ [AI MONITOR] FaceAPI Models Loaded");
      } catch (err) {
        console.error("❌ [AI MONITOR] Failed to load FaceAPI models:", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (isStarted && !isSubmitted && modelsLoaded) {
      startVideo();
    } else {
      stopVideo();
    }
    return () => stopVideo();
  }, [isStarted, isSubmitted, modelsLoaded]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          startDetections();
        };
      }
    } catch (err) {
      console.error("❌ [AI MONITOR] Camera Access Denied:", err);
      onViolation("Camera access is mandatory for this assessment. Please enable it to proceed.", true);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    setCameraActive(false);
  };

  const startDetections = () => {
    if (detectionInterval.current) return;
    
    detectionInterval.current = setInterval(async () => {
      if (videoRef.current && modelsLoaded && cameraActive) {
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions()
          );

          if (detections.length === 0) {
            onViolation("⚠️ FACE NOT DETECTED: Please ensure you are visible and looking at the screen.");
          } else if (detections.length > 1) {
            onViolation("⚠️ MULTIPLE PEOPLE DETECTED: Only the participant should be visible.");
          }
        } catch (e) {
          console.error("Detection error:", e);
        }
      }
    }, 4000); // Check every 4 seconds to maintain performance
  };

  // Only show the monitoring window during the quiz
  if (!isStarted || isSubmitted) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '160px',
      height: '120px',
      borderRadius: '16px',
      overflow: 'hidden',
      border: `2px solid ${cameraActive ? '#3b82f6' : '#ef4444'}`,
      boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
      zIndex: 9999,
      background: '#070D1F',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
      />
      
      <div style={{ 
        position: 'absolute', 
        top: 8, 
        right: 8, 
        width: 8, 
        height: 8, 
        borderRadius: '50%', 
        background: cameraActive ? '#10b981' : '#ef4444',
        boxShadow: `0 0 10px ${cameraActive ? '#10b981' : '#ef4444'}`,
        animation: 'pulse 2s infinite'
      }}></div>

      {!cameraActive && (
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 10, textAlign: 'center', fontSize: '0.6rem'
        }}>
          <i className="pi pi-video-slash mb-2" style={{ color: '#ef4444', fontSize: '1.2rem' }}></i>
          <span>CAMERA REQUIRED</span>
        </div>
      )}

      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        background: 'rgba(0,0,0,0.6)', 
        color: '#fff', 
        fontSize: '0.5rem', 
        fontWeight: 800,
        padding: '3px 0', 
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        <i className="pi pi-shield mr-1" style={{ fontSize: '0.5rem' }}></i> AI Proctor Mode
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default FaceMonitor;
