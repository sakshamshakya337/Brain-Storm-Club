import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Camera, RefreshCw, XCircle, CheckCircle2, User, Users, Hash, Clock, AlertCircle, ShieldAlert, Video } from 'lucide-react';

export default function EventScanner() {
  const { id } = useParams();
  
  const [cameraState, setCameraState] = useState('idle'); // idle, requesting, starting, ready, permission-denied, unsupported, error, stopped
  const [errorMsg, setErrorMsg] = useState('');
  const [scanResult, setScanResult] = useState(null);
  
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [activeCameraLabel, setActiveCameraLabel] = useState('');
  
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const isProcessingRef = useRef(false);
  
  const beepAudio = useRef(new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVgGAACBhYqPb3J1e4SMj5F3d32DiI+SdnZ9g4iPknd3fYOIj5J2dn2DiI+Sd3d9g4iPknZ2fYOIj5J3d32DiI+SdnZ9g4iPknc='));

  const stopCameraResources = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const stopScanner = useCallback(() => {
    stopCameraResources();
    setCameraState('stopped');
  }, [stopCameraResources]);

  useEffect(() => {
    return () => stopCameraResources();
  }, [stopCameraResources]);

  const mapCameraError = (err) => {
    switch (err.name) {
      case 'NotAllowedError': return { state: 'permission-denied', msg: 'Camera permission was denied or blocked for this site.' };
      case 'NotFoundError': return { state: 'error', msg: 'No camera was found on this device.' };
      case 'NotReadableError': return { state: 'error', msg: 'The camera is unavailable or being used by another application.' };
      case 'SecurityError': return { state: 'error', msg: 'Camera access is disabled by the browser or system.' };
      case 'AbortError': return { state: 'error', msg: 'Camera startup was interrupted. Please try again.' };
      case 'TypeError': return { state: 'error', msg: 'Camera access is not available in the current browser context.' };
      default: return { state: 'error', msg: 'Unable to start the camera. Please try again.' };
    }
  };

  const acquireCameraStream = async (deviceIdToUse = null, retryWithVideoTrue = false) => {
    if (window.isSecureContext === false) {
      setCameraState('error');
      setErrorMsg('Camera requires a secure connection. Open the secure version of this site.');
      return null;
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setErrorMsg('Camera access is not supported by this browser.');
      return null;
    }

    setCameraState('requesting');
    setErrorMsg('');

    try {
      const constraints = {
        audio: false,
        video: deviceIdToUse 
          ? { deviceId: { exact: deviceIdToUse } } 
          : (retryWithVideoTrue ? true : { facingMode: { ideal: 'environment' } })
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (stream.getVideoTracks().length === 0) {
        stream.getTracks().forEach(t => t.stop());
        setCameraState('error');
        setErrorMsg('No usable video camera was returned.');
        return null;
      }
      
      return stream;
    } catch (err) {
      console.error('Camera Request Error:', err);
      if (err.name === 'OverconstrainedError' && !retryWithVideoTrue && !deviceIdToUse) {
        return await acquireCameraStream(null, true);
      }
      
      const mapped = mapCameraError(err);
      setCameraState(mapped.state);
      setErrorMsg(mapped.msg);
      return null;
    }
  };

  const handleScan = async (qrToken) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/events/${id}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qrToken })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setScanResult({ type: 'error', title: 'Invalid Pass', message: data.message || 'Pass verification failed.' });
      } else {
        if (!data.alreadyParticipated) {
          try { beepAudio.current.play(); } catch(e) {}
        }
        setScanResult(data);
      }
    } catch (err) {
      setScanResult({ type: 'error', title: 'System Error', message: err.message });
    } finally {
      setTimeout(() => { isProcessingRef.current = false; }, 2000);
    }
  };

  const startScanner = async (deviceIdToUse = null) => {
    if (!id || id === 'undefined') {
      setCameraState('error');
      setErrorMsg('No event is assigned to this account. Cannot start scanner.');
      return;
    }

    stopCameraResources();
    setCameraState('starting');
    setScanResult(null);
    setErrorMsg('');
    
    const stream = await acquireCameraStream(deviceIdToUse);
    if (!stream) return;

    streamRef.current = stream;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vDevices = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(vDevices);
      
      let actualDeviceId = deviceIdToUse;
      let isRear = false;

      const activeTrack = stream.getVideoTracks()[0];
      const settings = activeTrack.getSettings ? activeTrack.getSettings() : {};
      
      if (!deviceIdToUse && vDevices.length > 0) {
        if (settings.facingMode === 'environment') {
          isRear = true;
          actualDeviceId = settings.deviceId || activeTrack.getCapabilities?.()?.deviceId;
        }

        if (!isRear) {
          const rearCam = vDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment') || d.label.toLowerCase().includes('outward') || d.label.toLowerCase().includes('main camera'));
          
          if (rearCam && rearCam.deviceId !== settings.deviceId) {
            stream.getTracks().forEach(t => t.stop());
            const newStream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: { deviceId: { exact: rearCam.deviceId } }
            });
            streamRef.current = newStream;
            actualDeviceId = rearCam.deviceId;
            isRear = true;
          } else {
            actualDeviceId = settings.deviceId || vDevices[0].deviceId;
          }
        }
      }
      
      if (actualDeviceId) {
        setSelectedDeviceId(actualDeviceId);
      }
      
      setActiveCameraLabel(isRear ? 'Back Camera' : 'Camera');

      if (!videoRef.current) {
         setCameraState('error');
         setErrorMsg('Video element not found.');
         return;
      }

      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserQRCodeReader();
      }

      controlsRef.current = await codeReaderRef.current.decodeFromStream(
        streamRef.current,
        videoRef.current,
        (result, error) => {
          if (result && !isProcessingRef.current) {
            handleScan(result.getText());
          }
        }
      );

      setCameraState('ready');
    } catch (err) {
      console.error('Scanner Init Error:', err);
      stopCameraResources();
      setCameraState('error');
      setErrorMsg('Failed to initialize scanner: ' + err.message);
    }
  };

  const checkPermissionAndStart = async () => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'camera' });
        if (status.state === 'denied') {
          setCameraState('permission-denied');
          setErrorMsg('Camera permission for this site is currently blocked.');
          return;
        }
      } catch (e) {
        // Ignored if unsupported
      }
    }
    startScannerFlow();
  };

  const handleScanNext = () => {
    setScanResult(null);
    startScannerFlow(selectedDeviceId);
  };

  const handleCameraChange = (e) => {
    const newId = e.target.value;
    startScannerFlow(newId);
  };

  if (!id || id === 'undefined') {
    return (
      <div className="min-h-screen bg-[var(--paper)] py-8 px-4 font-body">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto p-6">
          <XCircle className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">No Event Assigned</h2>
          <p className="text-slate-500 text-sm">Your Event Admin account is not currently assigned to a valid event. Please contact a full administrator.</p>
          <Link to="/control/dashboard" className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] py-8 px-4 font-body">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-[var(--ink)]">Event Scanner</h1>
            <p className="font-mono text-[10px] text-[var(--ink-soft)] uppercase tracking-widest mt-1">Scan Registration Passes</p>
          </div>
          <Link to={`/control/events/${id}/entries`} className="font-mono text-xs font-bold uppercase border border-[var(--border)] px-4 py-2 hover:bg-[var(--paper-dim)] transition-colors">
            Back to Entries
          </Link>
        </div>

        {scanResult ? (
          <div className={`border p-8 text-center ${scanResult.alreadyParticipated ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            {scanResult.alreadyParticipated ? (
              <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
            ) : (
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            )}
            
            <h2 className={`font-heading font-bold text-2xl uppercase tracking-tight mb-2 ${scanResult.alreadyParticipated ? 'text-amber-800' : 'text-green-800'}`}>
              {scanResult.alreadyParticipated ? 'Already Participated' : 'Participation Marked'}
            </h2>
            
            <div className="bg-white/60 border border-[var(--border)] p-6 my-6 text-left space-y-4 max-w-sm mx-auto">
              <div>
                <span className="block font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase mb-1">Participant</span>
                <div className="flex items-center gap-2 font-bold text-[var(--ink)]"><User size={16}/> {scanResult.participant.name}</div>
              </div>
              <div>
                <span className="block font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase mb-1">Registration No</span>
                <div className="flex items-center gap-2 text-[var(--ink)]"><Hash size={16}/> {scanResult.participant.registrationNumber}</div>
              </div>
              {scanResult.participant.teamName && (
                <>
                  <div>
                    <span className="block font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase mb-1">Team</span>
                    <div className="flex items-center gap-2 text-[var(--ink)]"><Users size={16}/> {scanResult.participant.teamName}</div>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase mb-1">Team Size</span>
                    <div className="flex items-center gap-2 text-[var(--ink)]"><Hash size={16}/> {scanResult.participant.teamSize || 1}</div>
                  </div>
                </>
              )}
              <div>
                <span className="block font-mono text-[10px] font-bold tracking-widest text-[var(--ink-soft)] uppercase mb-1">Time</span>
                <div className="flex items-center gap-2 text-[var(--ink)]"><Clock size={16}/> {new Date(scanResult.participant.participatedAt).toLocaleTimeString()}</div>
              </div>
            </div>

            <button onClick={handleScanNext} className="font-mono text-[12px] font-bold tracking-widest uppercase bg-[var(--ink)] text-[var(--paper)] px-8 py-4 hover:bg-[var(--circuit)] transition-colors inline-flex items-center gap-2">
              <RefreshCw size={16} /> Scan Next Participant
            </button>
          </div>
        ) : (
          <div className="border border-[var(--border)] bg-[var(--paper-dim)] p-4">
            
            {errorMsg && cameraState !== 'permission-denied' && (
              <div className="bg-red-50 border border-red-200 p-4 flex gap-3 mb-4">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
              </div>
            )}

            <div className="relative aspect-[4/3] bg-black overflow-hidden mb-4 border border-[var(--ink)] flex items-center justify-center">
              
              <video 
                ref={videoRef} 
                className={`w-full h-full object-cover ${cameraState === 'ready' ? 'opacity-100' : 'opacity-0'}`} 
                playsInline 
                autoPlay 
                muted 
              />
              
              {cameraState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                  <Camera size={48} className="mb-4 opacity-50" />
                  <p className="font-mono text-sm uppercase tracking-widest mb-6">Camera is ready to start.</p>
                  <button onClick={checkPermissionAndStart} className="font-mono text-[12px] font-bold tracking-widest uppercase bg-[var(--circuit)] text-[var(--paper)] px-6 py-3 hover:bg-white hover:text-black transition-colors">
                    Start Scanner
                  </button>
                </div>
              )}

              {cameraState === 'requesting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                  <RefreshCw size={32} className="mb-4 animate-spin opacity-70" />
                  <p className="font-mono text-sm uppercase tracking-widest">Requesting camera permission...</p>
                </div>
              )}

              {cameraState === 'starting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                  <RefreshCw size={32} className="mb-4 animate-spin opacity-70" />
                  <p className="font-mono text-sm uppercase tracking-widest">Starting camera...</p>
                </div>
              )}

              {cameraState === 'stopped' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                  <Camera size={48} className="mb-4 opacity-30" />
                  <p className="font-mono text-sm uppercase tracking-widest mb-6 text-white/50">Camera is stopped</p>
                  <button onClick={checkPermissionAndStart} className="font-mono text-[12px] font-bold tracking-widest uppercase bg-[var(--circuit)] text-[var(--paper)] px-6 py-3 hover:bg-white hover:text-black transition-colors">
                    Restart Camera
                  </button>
                </div>
              )}

              {cameraState === 'permission-denied' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center overflow-y-auto">
                  <ShieldAlert size={40} className="mb-3 text-red-400" />
                  <h3 className="font-heading font-bold text-lg text-red-400 mb-2 uppercase">CAMERA PERMISSION BLOCKED</h3>
                  <p className="text-sm text-gray-300 mb-4 max-w-sm">Camera permission for this site is currently blocked.</p>
                  <div className="bg-white/10 text-left p-4 mb-4 text-xs font-mono space-y-2">
                    <p>Step 1: Open browser site settings.</p>
                    <p>Step 2: Allow Camera for this site.</p>
                    <p>Step 3: Return to this page.</p>
                  </div>
                  <button onClick={checkPermissionAndStart} className="font-mono text-[10px] font-bold tracking-widest uppercase bg-white text-black px-4 py-2 hover:bg-gray-200 transition-colors">
                    Check Permission Again
                  </button>
                </div>
              )}

              {cameraState === 'unsupported' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                  <ShieldAlert size={40} className="mb-3 text-amber-400" />
                  <p className="font-mono text-sm uppercase tracking-widest mb-4">Camera Not Supported</p>
                </div>
              )}

              {cameraState === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                  <AlertCircle size={40} className="mb-3 text-red-400" />
                  <p className="font-mono text-sm uppercase tracking-widest mb-4">Camera Error</p>
                  <button onClick={() => startScannerFlow(selectedDeviceId)} className="font-mono text-[10px] font-bold tracking-widest uppercase bg-white text-black px-4 py-2 hover:bg-gray-200 transition-colors">
                    Retry Camera
                  </button>
                </div>
              )}

              {cameraState === 'ready' && (
                <div className="absolute inset-0 pointer-events-none border-[3px] border-[var(--circuit)]/50 m-8 sm:m-12">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-[var(--circuit)] -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-[var(--circuit)] -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-[var(--circuit)] -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-[var(--circuit)] -mb-1 -mr-1"></div>
                  
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-[var(--circuit)]">
                    READY — SCAN QR
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              {videoDevices.length > 1 && cameraState === 'ready' && (
                <select 
                  value={selectedDeviceId} 
                  onChange={handleCameraChange}
                  className="w-full sm:w-auto bg-[var(--paper)] border border-[var(--border)] px-3 py-2 font-mono text-[10px] uppercase outline-none"
                >
                  {videoDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,5)}`}</option>
                  ))}
                </select>
              )}
              
              {videoDevices.length <= 1 && cameraState === 'ready' && activeCameraLabel && (
                <div className="font-mono text-[10px] uppercase text-[var(--ink-soft)] flex items-center gap-2">
                  <Video size={14} /> {activeCameraLabel}
                </div>
              )}
              
              {cameraState === 'ready' && (
                <button onClick={stopScanner} className="w-full sm:w-auto font-mono text-[10px] font-bold tracking-widest uppercase text-red-600 border border-red-200 bg-red-50 px-4 py-2 hover:bg-red-100 transition-colors inline-flex items-center justify-center gap-2">
                  <XCircle size={14} /> Stop Scanner
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
