import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import interviewService from "@/services/api/interviewService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import QuestionCard from "@/components/molecules/QuestionCard";
import VideoRecorder from "@/components/organisms/VideoRecorder";
import InterviewNavigation from "@/components/organisms/InterviewNavigation";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const InterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState(new Map());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInterview();
  }, [id]);

  const loadInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewService.getInterview(id);
      setInterview(data);
      
      // Load existing recordings
      const existingRecordings = await interviewService.getAllRecordings(id);
      const recordingsMap = new Map();
      existingRecordings.forEach(recording => {
        recordingsMap.set(recording.questionId, recording);
      });
      setRecordings(recordingsMap);
      
    } catch (err) {
      console.error("Failed to load interview:", err);
      setError(err.message);
      toast.error("Failed to load interview questions");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = async (videoBlob, duration) => {
    try {
      const currentQuestion = interview.questions[currentQuestionIndex];
      await interviewService.saveRecording(
        interview.Id, 
        currentQuestion.Id, 
        videoBlob, 
        duration
      );
      
      // Update local recordings map
      const newRecordings = new Map(recordings);
      newRecordings.set(currentQuestion.Id, {
        questionId: currentQuestion.Id,
        videoBlob,
        duration,
        timestamp: new Date()
      });
      setRecordings(newRecordings);
      
    } catch (err) {
      console.error("Failed to save recording:", err);
      toast.error("Failed to save recording. Please try again.");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitInterview = async () => {
    try {
      setSubmitting(true);
      await interviewService.submitInterview(interview.Id);
      
      toast.success("Interview submitted successfully!");
      
      // Navigate to success page
      navigate("/interview-complete", { 
        state: { 
          interviewTitle: interview.title,
          recordingCount: recordings.size
        }
      });
      
    } catch (err) {
      console.error("Failed to submit interview:", err);
      toast.error("Failed to submit interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading interview questions..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadInterview} />;
  }

  if (!interview) {
    return <Error message="Interview not found" />;
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const hasRecordedCurrent = recordings.has(currentQuestion.Id);
  const canSubmit = recordings.size > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
              <ApperIcon name="Video" size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              {interview.title}
            </h1>
          </div>
          <p className="text-neutral-600 text-lg">
            {interview.company} • {interview.position}
          </p>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.Id}
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={interview.questions.length}
          />
        </AnimatePresence>

        {/* Video Recorder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <VideoRecorder
            key={currentQuestion.Id}
            question={currentQuestion}
            onRecordingComplete={handleRecordingComplete}
            hasExistingRecording={hasRecordedCurrent}
          />
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <InterviewNavigation
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={interview.questions.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmitInterview}
            canSubmit={canSubmit && !submitting}
            hasRecordedCurrent={hasRecordedCurrent}
          />
        </motion.div>

        {/* Submitting Overlay */}
        <AnimatePresence>
          {submitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-xl p-8 shadow-2xl text-center max-w-md mx-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-r-transparent rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Submitting Interview
                </h3>
                <p className="text-neutral-600">
                  Please wait while we process your submission...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewPage;