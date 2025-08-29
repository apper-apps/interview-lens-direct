import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import interviewService from "@/services/api/interviewService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import JobPostingForm from "@/components/organisms/JobPostingForm";

const AdminPortal = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPosting, setEditingPosting] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadJobPostings();
  }, []);

  const loadJobPostings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewService.getAllJobPostings();
      setJobPostings(data);
    } catch (err) {
      console.error("Failed to load job postings:", err);
      setError(err.message);
      toast.error("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosting = () => {
    setEditingPosting(null);
    setShowForm(true);
  };

  const handleEditPosting = (posting) => {
    setEditingPosting(posting);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingPosting) {
        await interviewService.updateJobPosting(editingPosting.Id, data);
        toast.success("Job posting updated successfully!");
      } else {
        await interviewService.createJobPosting(data);
        toast.success("Job posting created successfully!");
      }
      
      setShowForm(false);
      setEditingPosting(null);
      loadJobPostings();
    } catch (error) {
      console.error("Failed to save job posting:", error);
      toast.error("Failed to save job posting. Please try again.");
    }
  };

  const handleDeletePosting = async (posting) => {
    if (!confirm(`Are you sure you want to delete "${posting.jobTitle}"?`)) {
      return;
    }

    try {
      setDeleting(posting.Id);
      const success = await interviewService.deleteJobPosting(posting.Id);
      
      if (success) {
        toast.success("Job posting deleted successfully!");
        loadJobPostings();
      } else {
        toast.error("Failed to delete job posting");
      }
    } catch (error) {
      console.error("Failed to delete job posting:", error);
      toast.error("Failed to delete job posting. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPosting(null);
  };

  if (loading) {
    return <Loading message="Loading admin portal..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadJobPostings} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-100">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <JobPostingForm
                posting={editingPosting}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl">
                    <ApperIcon name="Settings" size={32} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
                    Admin Portal
                  </h1>
                </div>
                
                <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8">
                  Manage job postings and interview configurations for your organization.
                </p>

                <Button
                  size="lg"
                  onClick={handleCreatePosting}
                  className="inline-flex items-center gap-2"
                >
                  <ApperIcon name="Plus" size={20} />
                  Create Job Posting
                </Button>
              </motion.div>

              {/* Job Postings List */}
              {jobPostings.length === 0 ? (
                <Empty
                  icon="Briefcase"
                  title="No job postings found"
                  description="Create your first job posting to get started with candidate interviews."
                  action={
                    <Button onClick={handleCreatePosting} className="mt-4">
                      <ApperIcon name="Plus" size={16} />
                      Create Job Posting
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {jobPostings.map((posting, index) => (
                    <motion.div
                      key={posting.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="p-6 h-full flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                                {posting.jobTitle}
                              </h3>
                              <p className="text-sm text-neutral-600 mb-2">
                                {posting.companyName}
                              </p>
                              {posting.website && (
                                <a
                                  href={posting.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                >
                                  <ApperIcon name="ExternalLink" size={12} />
                                  {posting.website}
                                </a>
                              )}
                            </div>
                          </div>

                          {posting.instruction && (
                            <div className="mb-4">
                              <p className="text-sm text-neutral-600 line-clamp-3">
                                {posting.instruction}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                            {posting.introVideo && (
                              <div className="flex items-center gap-1">
                                <ApperIcon name="Video" size={12} />
                                <span>Video</span>
                              </div>
                            )}
                            {posting.introImage && (
                              <div className="flex items-center gap-1">
                                <ApperIcon name="Image" size={12} />
                                <span>Image</span>
                              </div>
                            )}
                            {posting.interviewId && (
                              <div className="flex items-center gap-1">
                                <ApperIcon name="MessageCircle" size={12} />
                                <span>Interview</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditPosting(posting)}
                            className="flex-1"
                          >
                            <ApperIcon name="Edit2" size={14} />
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeletePosting(posting)}
                            disabled={deleting === posting.Id}
                            className="flex-1"
                          >
                            {deleting === posting.Id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ApperIcon name="Trash2" size={14} />
                            )}
                            Delete
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPortal;