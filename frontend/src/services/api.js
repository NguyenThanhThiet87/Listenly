import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const analyzeVideo = async (youtubeUrl) => {
    const response = await api.post('/videos/analyze', { youtube_url: youtubeUrl });
    return response.data;
};

export const getLessonStatus = async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
};

export const checkSegmentAnswer = async (segmentId, answer) => {
    const response = await api.post(`/segments/${segmentId}/check`, { answer });
    return response.data;
};
