import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import RecordingTimer from "@/components/molecules/RecordingTimer";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const VideoRecorder = ({ 
  question, 
  onRecordingComplete, 
  hasExistingRecording = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(hasExistingRecording);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }

    } catch (err) {
      console.error("Camera initialization failed:", err);
      setError("Unable to access camera and microphone. Please ensure you have granted permission and try again.");
      toast.error("Camera access denied. Please grant permission to continue.");
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      toast.error("Camera not ready. Please try again.");
      return;
    }

    try {
      recordedChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4"
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { 
          type: "video/webm" 
        });
        
        setHasRecorded(true);
        
        if (onRecordingComplete) {
          onRecordingComplete(blob, recordingDuration);
        }
        
        toast.success("Recording saved successfully!");
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started. Speak clearly into your microphone.");
      
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing your recording...");
    }
  };

  const handleTimeUpdate = (seconds) => {
    setRecordingDuration(seconds);
    
    // Auto-stop at max duration
    if (question.maxDuration && seconds >= question.maxDuration) {
      stopRecording();
      toast.warning("Recording stopped - maximum duration reached.");
    }
  };

  const retryCamera = () => {
    cleanup();
    setCameraReady(false);
    setError(null);
    initializeCamera();
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    setCameraReady(false);
  };

  if (error) {
    return (
      <Card className="p-8">
        <Error 
          message={error}
          onRetry={retryCamera}
        />
      </Card>
    );
  }

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="space-y-6">
        {/* Video Preview */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl overflow-hidden shadow-inner">
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loading message="Initializing camera..." />
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover video-mirror transition-opacity duration-300 ${
                cameraReady ? "opacity-100" : "opacity-0"
              }`}
            />
            
            {/* Recording Overlay */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 left-4"
                >
                  <div className="flex items-center gap-2 bg-recording-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full recording-dot" />
                    REC
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer Overlay */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                >
                  <RecordingTimer
                    isRecording={isRecording}
                    onTimeUpdate={handleTimeUpdate}
                    maxDuration={question.maxDuration}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={!cameraReady}
              size="lg"
              className="w-full sm:w-auto"
            >
              <ApperIcon name="Video" size={20} />
              {hasRecorded ? "Record Again" : "Start Recording"}
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="danger"
              size="lg"
              className="w-full sm:w-auto"
            >
              <ApperIcon name="Square" size={20} />
              Stop Recording
            </Button>
          )}

          {/* Recording Status */}
          <div className="flex items-center gap-2 text-sm">
            {hasRecorded && !isRecording && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-success-500 font-medium"
              >
                <ApperIcon name="CheckCircle" size={16} />
                Recording saved
              </motion.div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-neutral-600 bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ApperIcon name="Info" size={16} className="text-primary-500" />
            <span className="font-medium">Recording Tips</span>
          </div>
          <p>
            Look directly at the camera, speak clearly, and ensure you're in a well-lit area. 
            {question.maxDuration && (
              <span className="ml-1">
                You have up to {Math.floor(question.maxDuration / 60)} minutes to answer.
              </span>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default VideoRecorder;