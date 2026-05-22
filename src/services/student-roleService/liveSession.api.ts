import api from '../api';

export const joinLiveSession = async (sessionId: number) => {
  const response = await api.get(`/api/v1/liveSession/join/${sessionId}`);
  return response.data;
};
