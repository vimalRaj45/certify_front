import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://certify-vsgrps.onrender.com';

const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('quiz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const quizApi = {
  // User Management
  registerUser: async (email, name) => {
    const res = await api.post(`/quiz/users`, { email, name });
    return res.data;
  },
  getUser: async (id) => {
    const res = await api.get(`/quiz/users/${id}`);
    return res.data;
  },
  getUserHistory: async (userId) => {
    const res = await api.get(`/quiz/users/${userId}/history`);
    return res.data;
  },

  // Quiz Management
  createQuiz: async (title, userId, metadata = {}) => {
    const res = await api.post(`/quiz/quizzes`, {
      title,
      created_by: userId,
      ...metadata
    });
    return res.data;
  },

  updateQuiz: async (id, data) => {
    const res = await api.put(`/quiz/quizzes/${id}`, data);
    return res.data;
  },


  deleteQuiz: async (id, userId) => {
    const res = await api.delete(`/quiz/quizzes/${id}`, {
      params: { user_id: userId }
    });
    return res.data;
  },

  updateWhitelist: async (quizId, emails) => {
    const res = await api.post(`/quiz/quizzes/${quizId}/whitelist`, { emails });
    return res.data;
  },
  getQuizzes: async () => {
    const res = await api.get(`/quiz/quizzes`);
    return res.data;
  },
  getQuiz: async (id) => {
    const res = await api.get(`/quiz/quizzes/${id}`);
    return res.data;
  },
  addQuestion: async (quizId, questionData) => {
    const res = await api.post(`/quiz/quizzes/${quizId}/questions`, questionData);
    return res.data;
  },
  deleteQuestion: async (quizId, questionId) => {
    const res = await api.delete(`/quiz/quizzes/${quizId}/questions/${questionId}`);
    return res.data;
  },

  // Attempts & Results
  startAttempt: async (quiz_id, user_id, access_key = null) => {
    const res = await api.post(`/quiz/attempts`, { quiz_id, user_id, access_key });
    return res.data;
  },
  submitAttempt: async (attemptId, answers) => {
    const res = await api.post(`/quiz/attempts/${attemptId}/submit`, { answers });
    return res.data;
  },
  getAttemptResult: async (attemptId) => {
    const res = await api.get(`/quiz/attempts/${attemptId}/result`);
    return res.data;
  },
  getLeaderboard: async (quizId, limit = 10) => {
    const res = await api.get(`/quiz/leaderboard/${quizId}?limit=${limit}`);
    return res.data;
  },
  getQuizAnalytics: async (quizId) => {
    const res = await api.get(`/quiz/quizzes/${quizId}/analytics`);
    return res.data;
  },
  exportQuizResults: async (quizId) => {
    const res = await api.get(`/quiz/quizzes/${quizId}/export`);
    return res.data;
  }
};

export default quizApi;
