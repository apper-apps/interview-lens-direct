import interviewsData from "@/services/mockData/interviews.json";

// Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

class InterviewService {
  constructor() {
    this.interviews = [...interviewsData];
    this.recordings = new Map(); // Store recordings in memory
  }

  async getInterview(id) {
    await delay();
    const interview = this.interviews.find(item => item.Id === parseInt(id));
    if (!interview) {
      throw new Error("Interview not found");
    }
    return {
      ...interview,
      questions: interview.questions.sort((a, b) => a.order - b.order)
    };
  }

  async getAllInterviews() {
    await delay();
    return [...this.interviews];
  }

  async saveRecording(interviewId, questionId, videoBlob, duration) {
    await delay(200);
    
    const recordingKey = `${interviewId}-${questionId}`;
    const recording = {
      interviewId: parseInt(interviewId),
      questionId: parseInt(questionId),
      videoBlob,
      duration,
      timestamp: new Date(),
      size: videoBlob.size
    };

    this.recordings.set(recordingKey, recording);
    return recording;
  }

  async getRecording(interviewId, questionId) {
    await delay(100);
    const recordingKey = `${interviewId}-${questionId}`;
    return this.recordings.get(recordingKey);
  }

  async getAllRecordings(interviewId) {
    await delay(200);
    const recordings = [];
    for (const [key, recording] of this.recordings.entries()) {
      if (recording.interviewId === parseInt(interviewId)) {
        recordings.push(recording);
      }
    }
    return recordings;
  }

  async submitInterview(interviewId) {
    await delay(500);
    
    const recordings = await this.getAllRecordings(interviewId);
    if (recordings.length === 0) {
      throw new Error("No recordings found to submit");
    }

    // In a real app, this would upload to a server
    const submission = {
      interviewId: parseInt(interviewId),
      submittedAt: new Date(),
      recordingCount: recordings.length,
      totalDuration: recordings.reduce((sum, r) => sum + r.duration, 0),
      status: "submitted"
    };

    return submission;
  }

  async deleteRecording(interviewId, questionId) {
    await delay(100);
    const recordingKey = `${interviewId}-${questionId}`;
    return this.recordings.delete(recordingKey);
  }
}

export default new InterviewService();