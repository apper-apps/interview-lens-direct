class InterviewService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getInterview(id) {
    try {
      // Fetch interview data
      const interviewParams = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "company_c" } },
          { field: { Name: "position_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "expires_at_c" } }
        ]
      };
      
      const interviewResponse = await this.apperClient.getRecordById("interview_c", parseInt(id), interviewParams);
      
      if (!interviewResponse.success) {
        throw new Error(interviewResponse.message || "Interview not found");
      }
      
      // Fetch related questions
      const questionsParams = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "text_c" } },
          { field: { Name: "order_c" } },
          { field: { Name: "max_duration_c" } },
          { field: { Name: "interview_id_c" } }
        ],
        where: [
          {
            FieldName: "interview_id_c",
            Operator: "EqualTo", 
            Values: [parseInt(id)]
          }
        ],
        orderBy: [
          {
            fieldName: "order_c",
            sorttype: "ASC"
          }
        ]
      };
      
      const questionsResponse = await this.apperClient.fetchRecords("question_c", questionsParams);
      
      if (!questionsResponse.success) {
        console.error("Failed to fetch questions:", questionsResponse.message);
      }
      
      const questions = (questionsResponse.data || []).map(q => ({
        Id: q.Id,
        text: q.text_c,
        order: q.order_c,
        maxDuration: q.max_duration_c
      }));
      
      return {
        Id: interviewResponse.data.Id,
        title: interviewResponse.data.title_c,
        company: interviewResponse.data.company_c, 
        position: interviewResponse.data.position_c,
        status: interviewResponse.data.status_c,
        createdAt: interviewResponse.data.created_at_c,
        expiresAt: interviewResponse.data.expires_at_c,
        questions: questions
      };
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching interview:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async getAllInterviews() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "company_c" } },
          { field: { Name: "position_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "expires_at_c" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords("interview_c", params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // For each interview, fetch question count
      const interviews = await Promise.all(response.data.map(async (interview) => {
        const questionsParams = {
          fields: [
            { field: { Name: "Id" } }
          ],
          where: [
            {
              FieldName: "interview_id_c",
              Operator: "EqualTo",
              Values: [interview.Id]
            }
          ]
        };
        
        const questionsResponse = await this.apperClient.fetchRecords("question_c", questionsParams);
        const questionCount = questionsResponse.success ? questionsResponse.data.length : 0;
        
        return {
          Id: interview.Id,
          title: interview.title_c,
          company: interview.company_c,
          position: interview.position_c,
          status: interview.status_c,
          createdAt: interview.created_at_c,
          expiresAt: interview.expires_at_c,
          questions: { length: questionCount }
        };
      }));
      
      return interviews;
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching interviews:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  async saveRecording(interviewId, questionId, videoBlob, duration) {
    try {
      // Convert video blob to base64 for storage
      const videoData = await this.blobToBase64(videoBlob);
      
      const params = {
        records: [
          {
            Name: `Recording ${questionId} for Interview ${interviewId}`,
            video_blob_c: videoData,
            duration_c: duration,
            timestamp_c: new Date().toISOString(),
            size_c: videoBlob.size,
            interview_id_c: parseInt(interviewId),
            question_id_c: parseInt(questionId)
          }
        ]
      };
      
      const response = await this.apperClient.createRecord("recording_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to save recording ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to save recording");
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return {
          Id: successfulRecord.data.Id,
          interviewId: parseInt(interviewId),
          questionId: parseInt(questionId),
          videoBlob,
          duration,
          timestamp: new Date(),
          size: videoBlob.size
        };
      }
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error saving recording:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async getRecording(interviewId, questionId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "video_blob_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "size_c" } },
          { field: { Name: "interview_id_c" } },
          { field: { Name: "question_id_c" } }
        ],
        where: [
          {
            FieldName: "interview_id_c",
            Operator: "EqualTo",
            Values: [parseInt(interviewId)]
          },
          {
            FieldName: "question_id_c", 
            Operator: "EqualTo",
            Values: [parseInt(questionId)]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords("recording_c", params);
      
      if (!response.success) {
        return null;
      }
      
      if (!response.data || response.data.length === 0) {
        return null;
      }
      
      const recording = response.data[0];
      return {
        Id: recording.Id,
        interviewId: parseInt(interviewId),
        questionId: parseInt(questionId),
        videoBlob: await this.base64ToBlob(recording.video_blob_c),
        duration: recording.duration_c,
        timestamp: new Date(recording.timestamp_c),
        size: recording.size_c
      };
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching recording:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async getAllRecordings(interviewId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "video_blob_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "size_c" } },
          { field: { Name: "interview_id_c" } },
          { field: { Name: "question_id_c" } }
        ],
        where: [
          {
            FieldName: "interview_id_c",
            Operator: "EqualTo", 
            Values: [parseInt(interviewId)]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords("recording_c", params);
      
      if (!response.success) {
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data.map(recording => ({
        Id: recording.Id,
        interviewId: parseInt(interviewId),
        questionId: recording.question_id_c?.Id || recording.question_id_c,
        duration: recording.duration_c,
        timestamp: new Date(recording.timestamp_c),
        size: recording.size_c
      }));
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching recordings:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  async submitInterview(interviewId) {
    try {
      const recordings = await this.getAllRecordings(interviewId);
      if (recordings.length === 0) {
        throw new Error("No recordings found to submit");
      }

      const params = {
        records: [
          {
            Name: `Submission for Interview ${interviewId}`,
            interview_id_c: parseInt(interviewId),
            submitted_at_c: new Date().toISOString(),
            recording_count_c: recordings.length,
            total_duration_c: recordings.reduce((sum, r) => sum + (r.duration || 0), 0),
            status_c: "submitted"
          }
        ]
      };
      
      const response = await this.apperClient.createRecord("submission_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to submit interview ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to submit interview");
        }
        
        return {
          interviewId: parseInt(interviewId),
          submittedAt: new Date(),
          recordingCount: recordings.length,
          totalDuration: recordings.reduce((sum, r) => sum + (r.duration || 0), 0),
          status: "submitted"
        };
      }
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error submitting interview:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }
async deleteRecording(interviewId, questionId) {
    try {
      // First find the recording to delete
      const recording = await this.getRecording(interviewId, questionId);
      if (!recording) {
        return false;
      }

      const params = {
        RecordIds: [recording.Id]
      };
      
      const response = await this.apperClient.deleteRecord("recording_c", params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete recording ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          return false;
        }
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting recording:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return false;
    }
  }

  // Helper methods for blob conversion
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async base64ToBlob(base64) {
    const response = await fetch(base64);
    return await response.blob();
  }

  // Job Posting Methods
  async getAllJobPostings() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "job_title_c" } },
          { field: { Name: "company_name_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "instruction_c" } },
          { field: { Name: "intro_video_c" } },
          { field: { Name: "intro_image_c" } },
          { field: { Name: "interview_id_c" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords("job_posting_c", params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data.map(posting => ({
        Id: posting.Id,
        name: posting.Name,
        jobTitle: posting.job_title_c,
        companyName: posting.company_name_c,
        website: posting.website_c,
        instruction: posting.instruction_c,
        introVideo: posting.intro_video_c,
        introImage: posting.intro_image_c,
        interviewId: posting.interview_id_c,
        createdOn: posting.CreatedOn,
        modifiedOn: posting.ModifiedOn
      }));
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching job postings:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  async getJobPosting(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "job_title_c" } },
          { field: { Name: "company_name_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "instruction_c" } },
          { field: { Name: "intro_video_c" } },
          { field: { Name: "intro_image_c" } },
          { field: { Name: "interview_id_c" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById("job_posting_c", parseInt(id), params);
      
      if (!response.success) {
        throw new Error(response.message || "Job posting not found");
      }
      
      return {
        Id: response.data.Id,
        name: response.data.Name,
        jobTitle: response.data.job_title_c,
        companyName: response.data.company_name_c,
        website: response.data.website_c,
        instruction: response.data.instruction_c,
        introVideo: response.data.intro_video_c,
        introImage: response.data.intro_image_c,
        interviewId: response.data.interview_id_c
      };
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching job posting:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async createJobPosting(data) {
    try {
      const params = {
        records: [
          {
            Name: data.name || data.jobTitle,
            job_title_c: data.jobTitle,
            company_name_c: data.companyName,
            website_c: data.website,
            instruction_c: data.instruction,
            intro_video_c: data.introVideo || '',
            intro_image_c: data.introImage || '',
            interview_id_c: data.interviewId ? parseInt(data.interviewId) : null
          }
        ]
      };
      
      const response = await this.apperClient.createRecord("job_posting_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create job posting ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to create job posting");
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return {
          Id: successfulRecord.data.Id,
          name: data.name || data.jobTitle,
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          website: data.website,
          instruction: data.instruction,
          introVideo: data.introVideo,
          introImage: data.introImage,
          interviewId: data.interviewId
        };
      }
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating job posting:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async updateJobPosting(id, data) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: data.name || data.jobTitle,
            job_title_c: data.jobTitle,
            company_name_c: data.companyName,
            website_c: data.website,
            instruction_c: data.instruction,
            intro_video_c: data.introVideo || '',
            intro_image_c: data.introImage || '',
            interview_id_c: data.interviewId ? parseInt(data.interviewId) : null
          }
        ]
      };
      
      const response = await this.apperClient.updateRecord("job_posting_c", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update job posting ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error("Failed to update job posting");
        }
        
        return {
          Id: parseInt(id),
          name: data.name || data.jobTitle,
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          website: data.website,
          instruction: data.instruction,
          introVideo: data.introVideo,
          introImage: data.introImage,
          interviewId: data.interviewId
        };
      }
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating job posting:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async deleteJobPosting(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord("job_posting_c", params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete job posting ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          return false;
        }
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting job posting:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return false;
    }
  }
}

// Export singleton instance
export default new InterviewService();