import { httpRequest } from '../utils/httpClient';

const CLIENTS_ENDPOINT = '/clients';

const buildQuery = (params = {}) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `?${query}` : '';
};

export const clientAPI = {
  list: async (params = {}) => {
    const response = await httpRequest(`${CLIENTS_ENDPOINT}${buildQuery(params)}`);
    return Array.isArray(response?.data) ? response.data : (response?.data ?? []);
  },

  getByDocumento: async (documento) => {
    const response = await httpRequest(`${CLIENTS_ENDPOINT}${buildQuery({ documento })}`);
    const data = Array.isArray(response?.data) ? response.data : (response?.data ?? []);
    return Array.isArray(data) ? data[0] ?? null : data;
  },

  create: async (payload) => {
    const response = await httpRequest(CLIENTS_ENDPOINT, { method: 'POST', body: payload });
    return response?.data ?? response;
  },

  update: async (id, payload) => {
    const response = await httpRequest(`${CLIENTS_ENDPOINT}/${id}`, { method: 'PUT', body: payload });
    return response?.data ?? response;
  },
};
