const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://road-safety-app-djj6.onrender.com/api';

export const loginUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

export const createIncident = async (incidentData: any) => {
  const response = await fetch(`${API_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incidentData)
  });
  return response.json();
};

export const getIncidents = async () => {
  const response = await fetch(`${API_URL}/incidents`);
  return response.json();
};

export const updateIncidentStatus = async (id: number, status: string) => {
  const response = await fetch(`${API_URL}/incidents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return response.json();
};

export const getFacilities = async () => {
  const response = await fetch(`${API_URL}/facilities`);
  return response.json();
};

export const getContacts = async (email: string) => {
  const response = await fetch(`${API_URL}/users/${email}/contacts`);
  return response.json();
};

export const addContact = async (email: string, contactData: any) => {
  const response = await fetch(`${API_URL}/users/${email}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData)
  });
  return response.json();
};

export const deleteContact = async (id: number) => {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};

export const getActiveIncident = async (email: string) => {
  const response = await fetch(`${API_URL}/users/${email}/active-incident`);
  if (!response.ok) return null;
  return response.json();
};

export const dispatchUnit = async (id: number, data: { assignedUnit: string, eta: string }) => {
  const response = await fetch(`${API_URL}/incidents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'DISPATCHED', ...data })
  });
  return response.json();
};


