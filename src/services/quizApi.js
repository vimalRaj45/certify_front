import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://certify-open.onrender.com';

const quizApi = {
  // User Management
  registerUser: async (email, name) => {
    const res = await axios.post(`${API_BASE}/quiz/users`, { email, name });
    return res.data;
  },
  getUser: async (id) => {
    const res = await axios.get(`${API_BASE}/quiz/users/${id}`);
    return res.data;
  },
  getUserHistory: async (userId) => {
    const res = await axios.get(`${API_BASE}/quiz/users/${userId}/history`);
    return res.data;
  },

  // Quiz Management
  createQuiz: async (title, userId, metadata = {}) => {
    const res = await axios.post(`${API_BASE}/quiz/quizzes`, {
      title,
      created_by: userId,
      ...metadata
    });
    return res.data;
  },

  updateQuiz: async (id, data) => {
    const res = await axios.put(`${API_BASE}/quiz/quizzes/${id}`, data);
    return res.data;
  },


  deleteQuiz: async (id) => {
    const res = await axios.delete(`${API_BASE}/quiz/quizzes/${id}`);
    return res.data;
  },

  updateWhitelist: async (quizId, emails) => {
    const res = await axios.post(`${API_BASE}/quiz/quizzes/${quizId}/whitelist`, { emails });
    return res.data;
  },
  getQuizzes: async () => {
    const res = await axios.get(`${API_BASE}/quiz/quizzes`);
    return res.data;
  },
  getQuiz: async (id) => {
    const res = await axios.get(`${API_BASE}/quiz/quizzes/${id}`);
    return res.data;
  },
  addQuestion: async (quizId, questionData) => {
    const res = await axios.post(`${API_BASE}/quiz/quizzes/${quizId}/questions`, questionData);
    return res.data;
  },
  deleteQuestion: async (quizId, questionId) => {
    const res = await axios.delete(`${API_BASE}/quiz/quizzes/${quizId}/questions/${questionId}`);
    return res.data;
  },

  // Attempts & Results
  startAttempt: async (quiz_id, user_id, access_key = null) => {
    const res = await axios.post(`${API_BASE}/quiz/attempts`, { quiz_id, user_id, access_key });
    return res.data;
  },
  submitAttempt: async (attemptId, answers) => {
    const res = await axios.post(`${API_BASE}/quiz/attempts/${attemptId}/submit`, { answers });
    return res.data;
  },
  getAttemptResult: async (attemptId) => {
    const res = await axios.get(`${API_BASE}/quiz/attempts/${attemptId}/result`);
    return res.data;
  },
  getLeaderboard: async (quizId, limit = 10) => {
    const res = await axios.get(`${API_BASE}/quiz/leaderboard/${quizId}?limit=${limit}`);
    return res.data;
  },
  exportQuizResults: async (quizId) => {
    const res = await axios.get(`${API_BASE}/quiz/quizzes/${quizId}/export`);
    return res.data;
  }
};

export default quizApi;
