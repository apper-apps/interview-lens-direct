import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";

const RecordingTimer = ({ isRecording, onTimeUpdate, maxDuration = null }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          if (onTimeUpdate) {
            onTimeUpdate(newSeconds);
          }
          return newSeconds;
        });
      }, 1000);
    } else if (!isRecording && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRecording, seconds, onTimeUpdate]);

  useEffect(() => {
    if (!isRecording) {
      setSeconds(0);
    }
  }, [isRecording]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

const getTimeColor = () => {
    if (!maxDuration) return "text-neutral-700";
    const remaining = maxDuration - seconds;
    if (remaining <= 30) return "text-recording-500";
    if (remaining <= 60) return "text-yellow-600";
    return "text-neutral-700";
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-neutral-200 shadow-lg">
      <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-recording-500 recording-dot" : "bg-neutral-400"}`} />
      
      <span className={`font-mono text-lg font-bold ${getTimeColor()}`}>
        {formatTime(seconds)}
      </span>
      
{maxDuration && (
        <div className="flex items-center gap-1 text-sm text-neutral-500">
          <ApperIcon name="Clock" size={14} />
          <span>/ {formatTime(maxDuration)}</span>
        </div>
      )}
      
      {isRecording && (
        <span className="text-xs text-recording-500 font-medium animate-pulse">
          RECORDING
        </span>
      )}
    </div>
  );
};

export default RecordingTimer;