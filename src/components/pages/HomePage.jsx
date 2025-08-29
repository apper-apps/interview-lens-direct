import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import interviewService from "@/services/api/interviewService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const HomePage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
const data = await interviewService.getAllInterviews();
      setInterviews(data);
    } catch (err) {
      console.error("Failed to load interviews:", err);
      setError(err.message);
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const startInterview = (interviewId) => {
    navigate(`/interview/${interviewId}`);
  };

  if (loading) {
    return <Loading message="Loading available interviews..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadInterviews} />;
  }

  if (interviews.length === 0) {
    return (
      <Empty
        title="No Interviews Available"
        message="There are currently no interviews available for you to complete."
        actionLabel="Refresh"
        action={loadInterviews}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl">
              <ApperIcon name="Video" size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              InterviewLens
            </h1>
          </div>
          
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Complete your video interview at your own pace. Answer questions clearly 
            and showcase your skills in a comfortable environment.
          </p>
        </motion.div>

        {/* Available Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Available Interviews
          </h2>

          <div className="grid gap-6">
            {interviews.map((interview, index) => (
              <motion.div
key={interview.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Interview Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex-shrink-0">
                          <ApperIcon name="Building" size={24} className="text-primary-600" />
                        </div>
                        <div>
<h3 className="text-xl font-bold text-neutral-900 mb-1">
                            {interview.title}
                          </h3>
                          <p className="text-neutral-600 font-medium">
                            {interview.company}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {interview.position}
                          </p>
                        </div>
                      </div>

                      {/* Interview Details */}
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
<ApperIcon name="HelpCircle" size={16} className="text-primary-500" />
                          <span>{interview.questions.length} questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
<ApperIcon name="Clock" size={16} className="text-primary-500" />
                          <span>~{Math.ceil((interview.questions.length || 0) * 120 / 60)} min estimated</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
<ApperIcon name="Calendar" size={16} className="text-primary-500" />
                          <span>Available until {new Date(interview.expiresAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ApperIcon name="CheckCircle" size={16} className="text-success-500" />
                          <span className="text-success-600 font-medium">Active</span>
                        </div>
                      </div>

                      {/* Questions Preview */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h4 className="font-medium text-neutral-900 mb-2 flex items-center gap-2">
                          <ApperIcon name="List" size={16} />
                          Sample Questions:
                        </h4>
                        <ul className="text-sm text-neutral-600 space-y-1">
                          {interview.questions.slice(0, 2).map((question, qIndex) => (
<li key={qIndex} className="flex items-start gap-2">
                              <span className="text-primary-500 font-bold mt-0.5">
                                {qIndex + 1}.
                              </span>
                              <span className="line-clamp-1">
                                Sample Interview Question
                              </span>
                            </li>
                          ))}
                          {interview.questions.length > 2 && (
                            <li className="text-neutral-500 italic">
                              + {interview.questions.length - 2} more questions...
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="lg:w-64 flex flex-col justify-center">
                      <div className="text-center mb-4">
                        <p className="text-sm text-neutral-600 mb-2">
                          Ready to get started?
                        </p>
                        <p className="text-xs text-neutral-500">
                          Make sure you have a quiet environment and good lighting
                        </p>
                      </div>
                      
                      <Button
onClick={() => startInterview(interview.Id)}
                        size="lg"
                        className="w-full"
                      >
                        <ApperIcon name="Play" size={20} />
                        Start Interview
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Info" size={20} className="text-primary-600" />
              Before You Begin
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-sm text-neutral-700">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ApperIcon name="Camera" size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Camera & Audio:</strong> Ensure your camera and microphone are working properly
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ApperIcon name="Sun" size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Lighting:</strong> Position yourself in a well-lit area facing the light source
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ApperIcon name="Volume2" size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Environment:</strong> Choose a quiet space without background noise
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ApperIcon name="Clock" size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Time:</strong> Each question has a time limit - prepare your thoughts beforehand
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;