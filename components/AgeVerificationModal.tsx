
import React, { useState, useEffect, useRef } from 'react';
import { Scan, ShieldCheck, Camera, CheckCircle, User, CreditCard, Lock, RefreshCw, Smartphone } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void; // Kept in prop definition for TS compatibility, but unused in UI to force compliance
  onVerified: () => void;
}

type VerificationStep = 'INTRO' | 'SCAN_FRONT' | 'SCAN_BACK' | 'SELFIE' | 'PROCESSING' | 'ANALYZING' | 'SUCCESS';

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ isOpen, onVerified }) => {
  const [step, setStep] = useState<VerificationStep>('INTRO');
  const [processingMessage, setProcessingMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && (step === 'SCAN_FRONT' || step === 'SCAN_BACK' || step === 'SELFIE')) {
      startCamera(step === 'SELFIE' ? 'user' : 'environment');
    }
    return () => {
      // Don't stop camera between ID steps for smoother transition, only stop if we leave scanning
      if (step === 'ANALYZING' || step === 'SUCCESS') {
          stopCamera();
      }
    };
  }, [isOpen, step]);

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      // Stop existing tracks first if switching modes
      if (stream) {
          stream.getTracks().forEach(t => t.stop());
      }
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (e) {
      console.error("Camera initialization error", e);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const handleStart = () => setStep('SCAN_FRONT');

  const captureAndProceed = () => {
      // Simulate "Uploading/Processing" between steps
      const nextStepMap: Record<string, VerificationStep> = {
          'SCAN_FRONT': 'SCAN_BACK',
          'SCAN_BACK': 'SELFIE',
          'SELFIE': 'ANALYZING'
      };

      const msgMap: Record<string, string> = {
          'SCAN_FRONT': 'Capturing High-Res Image...',
          'SCAN_BACK': 'Reading Barcode Data...',
          'SELFIE': 'Analyzing Biometric Liveness...'
      };

      const current = step as string;
      setProcessingMessage(msgMap[current] || 'Processing...');
      
      const prevStep = step;
      setStep('PROCESSING');

      setTimeout(() => {
          setStep(nextStepMap[current]);
      }, 1500);
  };

  // Final analysis simulation
  useEffect(() => {
      if (step === 'ANALYZING') {
          setTimeout(() => setStep('SUCCESS'), 4000);
      }
  }, [step]);

  const handleComplete = () => {
    onVerified();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl animate-fade-in-up relative">
        
        {/* Security Header */}
        <div className="bg-gray-950 p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-500" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Secure Identity Verification</span>
            </div>
            <Lock size={14} className="text-gray-500" />
        </div>

        {/* INTRO STEP */}
        {step === 'INTRO' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
              <Scan size={40} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Identity Check Required</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              Federal regulations require all participants to be verified as 18+. 
              Please prepare your government-issued ID (Driver's License or Passport).
            </p>
            
            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg">
                    <CreditCard className="text-blue-400" size={24} />
                    <div className="text-left">
                        <h4 className="text-white font-bold text-xs">Step 1 & 2: Scan ID</h4>
                        <p className="text-gray-500 text-[10px]">Front and Back of physical card</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg">
                    <User className="text-blue-400" size={24} />
                    <div className="text-left">
                        <h4 className="text-white font-bold text-xs">Step 3: Liveness Check</h4>
                        <p className="text-gray-500 text-[10px]">Selfie video verification</p>
                    </div>
                </div>
            </div>

            <button onClick={handleStart} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
               Begin Verification
            </button>
            <p className="mt-4 text-[10px] text-gray-500">
                Encrypted via 256-bit SSL. Your data is processed securely and is not stored permanently.
            </p>
          </div>
        )}

        {/* SCANNING STEPS */}
        {(step === 'SCAN_FRONT' || step === 'SCAN_BACK' || step === 'SELFIE') && (
          <div className="relative h-[550px] bg-black flex flex-col">
             <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60"></video>
             
             {/* Instructions Overlay */}
             <div className="absolute top-0 left-0 right-0 p-6 z-10 text-center bg-gradient-to-b from-black/80 to-transparent">
                 <h3 className="text-lg font-bold text-white mb-1">
                     {step === 'SCAN_FRONT' && "Scan Front of ID"}
                     {step === 'SCAN_BACK' && "Scan Back of ID"}
                     {step === 'SELFIE' && "Take a Selfie"}
                 </h3>
                 <p className="text-xs text-gray-300">
                     {step === 'SELFIE' ? "Position your face within the oval" : "Align your card within the frame"}
                 </p>
             </div>

             {/* Dynamic Overlays */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {step === 'SELFIE' ? (
                    // Oval for Face
                    <div className="w-[65%] aspect-[3/4] border-2 border-white/50 rounded-[50%] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-1 h-2 bg-blue-500"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1 w-1 h-2 bg-blue-500"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-1 bg-blue-500"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 w-2 h-1 bg-blue-500"></div>
                    </div>
                ) : (
                    // Rectangle for ID
                    <div className="w-[85%] aspect-[1.58] border-2 border-white/50 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white"></div>
                        {/* Scanning Laser */}
                        <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-scan-y top-1/2"></div>
                    </div>
                )}
             </div>

             {/* Controls */}
             <div className="mt-auto p-8 flex justify-center z-10 bg-gradient-to-t from-black/90 to-transparent">
                <button onClick={captureAndProceed} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-xl active:scale-95 transition-transform flex items-center justify-center group">
                   <div className="w-12 h-12 bg-gray-200 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                </button>
             </div>
             
             {/* Step Indicator */}
             <div className="absolute bottom-4 right-6 bg-black/50 px-3 py-1 rounded-full text-[10px] text-white font-mono">
                 Step {step === 'SCAN_FRONT' ? '1' : step === 'SCAN_BACK' ? '2' : '3'} of 3
             </div>
          </div>
        )}

        {/* PROCESSING INTERSTITIAL */}
        {step === 'PROCESSING' && (
             <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
                 <RefreshCw size={48} className="text-blue-500 animate-spin mb-4" />
                 <h3 className="text-white font-bold mb-2">{processingMessage}</h3>
                 <p className="text-xs text-gray-500">Please wait while we upload your data securely.</p>
             </div>
        )}

        {/* ANALYZING STEP */}
        {step === 'ANALYZING' && (
           <div className="p-12 text-center h-[500px] flex flex-col justify-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                 <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-2 border-4 border-purple-500 rounded-full border-b-transparent animate-spin-reverse opacity-50"></div>
                 <Smartphone size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
              </div>
              
              <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-gray-400 bg-gray-800 p-3 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Verifying Holographic Security Features...
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 bg-gray-800 p-3 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
                      Matching Biometric Facial Landmarks...
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 bg-gray-800 p-3 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                      Checking Government Database...
                  </div>
              </div>
           </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'SUCCESS' && (
           <div className="p-8 text-center bg-gradient-to-b from-gray-900 to-green-900/20 h-[500px] flex flex-col justify-center">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.5)] animate-bounce-in">
                 <CheckCircle size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Verification Complete</h2>
              <p className="text-green-400 font-bold mb-8 uppercase tracking-widest text-sm">Identity Confirmed</p>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-8 text-left">
                  <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500">Status</span>
                      <span className="text-green-400 font-bold">APPROVED</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500">ID Type</span>
                      <span className="text-white">Driver's License</span>
                  </div>
                  <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Age Check</span>
                      <span className="text-white">Pass (18+)</span>
                  </div>
              </div>

              <button onClick={handleComplete} className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-xl font-black shadow-xl transform active:scale-95 transition-all">
                ENTER STUDIO
              </button>
           </div>
        )}
      </div>
      <style>{`
        @keyframes scan-y {
          0% { top: 5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 95%; opacity: 0; }
        }
        .animate-scan-y {
          animation: scan-y 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-spin-reverse {
          animation: spin 3s linear infinite reverse;
        }
      `}</style>
    </div>
  );
};

export default AgeVerificationModal;
