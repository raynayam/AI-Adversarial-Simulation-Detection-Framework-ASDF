import axios from 'axios';

const API_BASE = 'http://localhost:5050/api';

export const ping = async () => {
  const res = await axios.get(`${API_BASE}/ping`, { withCredentials: true });
  return res.data;
};

export const login = async (username, password) => {
  const res = await axios.post(`${API_BASE}/login`, { username, password }, { withCredentials: true });
  return res.data;
};

export const register = async (username, password) => {
  const res = await axios.post(`${API_BASE}/register`, { username, password }, { withCredentials: true });
  return res.data;
};

export const logout = async () => {
  const res = await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });
  return res.data;
};

export const runPhishing = async (target_email) => {
  const res = await axios.post(`${API_BASE}/attack/phishing`, { target_email }, { withCredentials: true });
  return res.data;
};

export const runLateral = async (target_host) => {
  const res = await axios.post(`${API_BASE}/attack/lateral`, { target_host }, { withCredentials: true });
  return res.data;
};

export const getTimeline = async () => {
  const res = await axios.get(`${API_BASE}/timeline`, { withCredentials: true });
  return res.data;
};

export const getAIEvasion = async () => {
  const res = await axios.get(`${API_BASE}/ai_evasion`, { withCredentials: true });
  return res.data;
};

export const getEventSummary = async () => {
  const res = await axios.get(`${API_BASE}/event_summary`, { withCredentials: true });
  return res.data;
};

export const getAttackTypesDistribution = async () => {
  const res = await axios.get(`${API_BASE}/attack_types_distribution`, { withCredentials: true });
  return res.data;
};

export const getDetectionRate = async () => {
  const res = await axios.get(`${API_BASE}/detection_rate`, { withCredentials: true });
  return res.data;
};

export const getAIEvasionHistory = async () => {
  const res = await axios.get(`${API_BASE}/ai_evasion`, { withCredentials: true });
  return res.data;
};

export const exportEvents = async () => {
  const res = await axios.get(`${API_BASE}/events/export`, { withCredentials: true });
  return res.data;
}; 