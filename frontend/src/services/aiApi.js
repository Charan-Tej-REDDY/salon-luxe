import api from './api';

/**
 * AI Assistant API Service
 * Uses the existing Axios instance (from api.js) which automatically attaches JWT tokens.
 */

export const sendMessage = async (message, conversationId = null) => {
  const payload = { message };
  if (conversationId) {
    payload.conversationId = conversationId;
  }

  const response = await api.post('/ai/chat', payload);
  return response.data;
};
