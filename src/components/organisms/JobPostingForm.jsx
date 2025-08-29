import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import interviewService from "@/services/api/interviewService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const JobPostingForm = ({ posting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    website: "",
    instruction: "",
    introVideo: "",
    introImage: "",
    interviewId: "",
    questions: []
  });
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ video: false, image: false });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInterviews();
    
    if (posting) {
      setFormData({
        jobTitle: posting.jobTitle || "",
        companyName: posting.companyName || "",
        website: posting.website || "",
        instruction: posting.instruction || "",
        introVideo: posting.introVideo || "",
        introImage: posting.introImage || "",
        interviewId: posting.interviewId || "",
        questions: []
      });
    }
  }, [posting]);

  const loadInterviews = async () => {
    try {
      const data = await interviewService.getAllInterviews();
      setInterviews(data);
    } catch (error) {
      console.error("Failed to load interviews:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    // Validate file type
    const validTypes = {
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'],
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    };

    if (!validTypes[type].includes(file.type)) {
      toast.error(`Invalid ${type} format. Please select a valid ${type} file.`);
      return;
    }

    // Validate file size (max 10MB for video, 5MB for image)
    const maxSize = type === 'video' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size too large. Maximum size is ${type === 'video' ? '10MB' : '5MB'}.`);
      return;
    }

    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        handleInputChange(type === 'video' ? 'introVideo' : 'introImage', base64);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      toast.error(`Failed to upload ${type}. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      text: "",
      required: true,
      options: type === 'multiple_choice' ? [""] : []
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const addOption = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map((opt, idx) => 
                idx === optionIndex ? value : opt
              )
            }
          : q
      )
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
          : q
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    if (!formData.instruction.trim()) {
      newErrors.instruction = "Instructions for candidates are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const questionTypes = [
    { value: 'text', label: 'Single-line Text', icon: 'Type' },
    { value: 'textarea', label: 'Multi-line Text', icon: 'AlignLeft' },
    { value: 'url', label: 'Link/URL', icon: 'Link' },
    { value: 'number', label: 'Number', icon: 'Hash' },
    { value: 'date', label: 'Date', icon: 'Calendar' },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: 'List' },
  ];

  const mediaResponseTypes = [
    { value: 'audio', label: 'Audio Response', icon: 'Mic' },
    { value: 'video', label: 'Video Response', icon: 'Video' },
    { value: 'screen_recording', label: 'Screen Recording', icon: 'Monitor' },
    { value: 'file_upload', label: 'File Upload', icon: 'Upload' },
    { value: 'rich_text', label: 'Rich Text Editor', icon: 'Edit3' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
              <ApperIcon name="Briefcase" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                {posting ? "Edit Job Posting" : "Create Job Posting"}
              </h1>
              <p className="text-neutral-600">
                Configure your job posting and interview requirements
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            Back to Admin
          </Button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
            <ApperIcon name="Info" size={20} className="text-primary-600" />
            Basic Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.jobTitle ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="e.g. Senior Software Engineer"
              />
              {errors.jobTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.companyName ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="e.g. TechCorp Inc."
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Company Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.website ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="https://www.company.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Link to Interview
              </label>
              <select
                value={formData.interviewId}
                onChange={(e) => handleInputChange('interviewId', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select an interview (optional)</option>
                {interviews.map((interview) => (
                  <option key={interview.Id} value={interview.Id}>
                    {interview.title} - {interview.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Instructions for Candidates *
            </label>
            <textarea
              value={formData.instruction}
              onChange={(e) => handleInputChange('instruction', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.instruction ? 'border-red-300' : 'border-neutral-300'
              }`}
              placeholder="Provide clear instructions for candidates on how to complete the interview..."
            />
            {errors.instruction && (
              <p className="mt-1 text-sm text-red-600">{errors.instruction}</p>
            )}
          </div>
        </Card>

        {/* Media Upload */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
            <ApperIcon name="Upload" size={20} className="text-primary-600" />
            Intro Media
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Intro Video
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'video')}
                  className="hidden"
                  id="intro-video"
                  disabled={uploading.video}
                />
                <label
                  htmlFor="intro-video"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading.video ? (
                    <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
                  ) : formData.introVideo ? (
                    <ApperIcon name="CheckCircle" size={32} className="text-green-500" />
                  ) : (
                    <ApperIcon name="Video" size={32} className="text-neutral-400" />
                  )}
                  <span className="text-sm text-neutral-600">
                    {uploading.video 
                      ? "Uploading..." 
                      : formData.introVideo 
                      ? "Video uploaded successfully" 
                      : "Click to upload intro video"
                    }
                  </span>
                  <span className="text-xs text-neutral-500">
                    MP4, AVI, MOV up to 10MB
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Intro Image
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'image')}
                  className="hidden"
                  id="intro-image"
                  disabled={uploading.image}
                />
                <label
                  htmlFor="intro-image"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading.image ? (
                    <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
                  ) : formData.introImage ? (
                    <ApperIcon name="CheckCircle" size={32} className="text-green-500" />
                  ) : (
                    <ApperIcon name="Image" size={32} className="text-neutral-400" />
                  )}
                  <span className="text-sm text-neutral-600">
                    {uploading.image 
                      ? "Uploading..." 
                      : formData.introImage 
                      ? "Image uploaded successfully" 
                      : "Click to upload intro image"
                    }
                  </span>
                  <span className="text-xs text-neutral-500">
                    JPG, PNG, GIF up to 5MB
                  </span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Standard Questions */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <ApperIcon name="MessageSquare" size={20} className="text-primary-600" />
              Standard Questions
            </h2>
            <div className="flex gap-2">
              {questionTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addQuestion(type.value)}
                  className="flex items-center gap-1"
                >
                  <ApperIcon name={type.icon} size={14} />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {formData.questions.filter(q => !mediaResponseTypes.find(m => m.value === q.type)).length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <ApperIcon name="MessageSquare" size={48} className="mx-auto mb-3 text-neutral-300" />
              <p>No standard questions added yet. Click the buttons above to add questions.</p>
            </div>
          )}

          <div className="space-y-4">
            {formData.questions
              .filter(q => !mediaResponseTypes.find(m => m.value === q.type))
              .map((question, index) => (
                <Card key={question.id} className="p-4 bg-neutral-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700">
                          {questionTypes.find(t => t.value === question.type)?.label}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="X" size={14} />
                        </Button>
                      </div>
                      
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        placeholder="Enter your question..."
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />

                      {question.type === 'multiple_choice' && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Options
                          </label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1 px-3 py-1 border border-neutral-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(question.id, optionIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <ApperIcon name="X" size={12} />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="flex items-center gap-1"
                          >
                            <ApperIcon name="Plus" size={12} />
                            Add Option
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </Card>

        {/* Media Response Questions */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <ApperIcon name="Play" size={20} className="text-primary-600" />
              Media Response Questions
            </h2>
            <div className="flex gap-2 flex-wrap">
              {mediaResponseTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addQuestion(type.value)}
                  className="flex items-center gap-1"
                >
                  <ApperIcon name={type.icon} size={14} />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {formData.questions.filter(q => mediaResponseTypes.find(m => m.value === q.type)).length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <ApperIcon name="Play" size={48} className="mx-auto mb-3 text-neutral-300" />
              <p>No media response questions added yet. Click the buttons above to add questions.</p>
            </div>
          )}

          <div className="space-y-4">
            {formData.questions
              .filter(q => mediaResponseTypes.find(m => m.value === q.type))
              .map((question, index) => (
                <Card key={question.id} className="p-4 bg-blue-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary-700">
                          {mediaResponseTypes.find(t => t.value === question.type)?.label}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="X" size={14} />
                        </Button>
                      </div>
                      
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        placeholder="Enter your question..."
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {posting ? "Update" : "Create"} Job Posting
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobPostingForm;