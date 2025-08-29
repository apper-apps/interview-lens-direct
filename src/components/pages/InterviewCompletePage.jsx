import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const InterviewCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
const { interviewTitle, recordingCount } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 via-blue-50/30 to-neutral-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success-500 to-green-600 flex items-center justify-center shadow-2xl">
              <ApperIcon name="CheckCircle" size={40} className="text-white" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Interview Submitted Successfully!
            </h1>
            
            <p className="text-lg text-neutral-600 mb-8">
Thank you for completing your video interview{interviewTitle && ` for ${interviewTitle}`}.
              Your responses have been successfully recorded and submitted.
            </p>
          </motion.div>

          {/* Interview Details */}
          {recordingCount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-neutral-50 rounded-lg p-6 mb-8"
            >
              <div className="flex items-center justify-center gap-4 text-neutral-700">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Video" size={20} className="text-primary-600" />
                  <span className="font-medium">{recordingCount} video response{recordingCount > 1 ? 's' : ''}</span>
                </div>
                <div className="w-1 h-1 bg-neutral-400 rounded-full" />
                <div className="flex items-center gap-2">
                  <ApperIcon name="Clock" size={20} className="text-primary-600" />
                  <span className="font-medium">Submitted {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              What happens next?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-600">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <ApperIcon name="Eye" size={18} className="text-primary-600" />
                </div>
                <span>Hiring team reviews your responses</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <ApperIcon name="MessageCircle" size={18} className="text-primary-600" />
                </div>
                <span>We'll contact you with updates</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <ApperIcon name="Calendar" size={18} className="text-primary-600" />
                </div>
                <span>Expect to hear back within 5-7 days</span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="w-full sm:w-auto"
            >
              <ApperIcon name="Home" size={20} />
              Back to Home
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default InterviewCompletePage;