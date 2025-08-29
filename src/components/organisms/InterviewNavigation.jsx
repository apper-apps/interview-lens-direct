import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const InterviewNavigation = ({ 
  currentQuestion, 
  totalQuestions, 
  onNext, 
  onPrevious, 
  onSubmit,
  canSubmit = false,
  hasRecordedCurrent = false 
}) => {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Progress Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-600">
            Progress: {currentQuestion} of {totalQuestions}
          </span>
          <div className="w-32 bg-neutral-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(currentQuestion / totalQuestions) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          {!isFirstQuestion && (
            <Button
              variant="secondary"
              onClick={onPrevious}
              size="md"
            >
              <ApperIcon name="ChevronLeft" size={16} />
              Previous
            </Button>
          )}

          {!isLastQuestion ? (
            <Button
              onClick={onNext}
              disabled={!hasRecordedCurrent}
              size="md"
            >
              Next
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={!canSubmit}
              variant="success"
              size="md"
            >
              <ApperIcon name="Send" size={16} />
              Submit Interview
            </Button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-4 text-sm">
        {!hasRecordedCurrent && (
          <div className="flex items-center gap-2 text-amber-600">
            <ApperIcon name="AlertTriangle" size={14} />
            <span>Please record your answer before proceeding</span>
          </div>
        )}
        
        {isLastQuestion && !canSubmit && (
          <div className="flex items-center gap-2 text-neutral-600">
            <ApperIcon name="Info" size={14} />
            <span>Complete at least one recording to submit your interview</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewNavigation;