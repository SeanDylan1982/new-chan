const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`🌐 API Request: ${config.method || 'GET'} ${API_BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log(`📡 API Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('❌ API Error:', error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    console.error('🚨 API Request Failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  loginAnonymous: async () => {
    const response = await apiRequest('/auth/anonymous', {
      method: 'POST',
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('authToken');
    }
  },
};

// Boards API
export const boardsAPI = {
  getAll: async () => {
    return apiRequest('/boards');
  },

  getById: async (id: string) => {
    return apiRequest(`/boards/${id}`);
  },

  create: async (boardData: {
    name: string;
    description: string;
    category: string;
    isNSFW: boolean;
  }) => {
    return apiRequest('/boards', {
      method: 'POST',
      body: JSON.stringify(boardData),
    });
  },

  update: async (id: string, boardData: {
    description?: string;
    category?: string;
    isNSFW?: boolean;
  }) => {
    return apiRequest(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(boardData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/boards/${id}`, {
      method: 'DELETE',
    });
  },
};

// Threads API
export const threadsAPI = {
  getByBoard: async (boardId: string, params?: {
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/threads/board/${boardId}${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/threads/${id}`);
  },

  create: async (threadData: {
    boardId: string;
    title: string;
    content: string;
    images?: string[];
    tags?: string[];
  }) => {
    return apiRequest('/threads', {
      method: 'POST',
      body: JSON.stringify(threadData),
    });
  },

  update: async (id: string, threadData: {
    isSticky?: boolean;
    isLocked?: boolean;
  }) => {
    return apiRequest(`/threads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(threadData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/threads/${id}`, {
      method: 'DELETE',
    });
  },
};

// Posts API
export const postsAPI = {
  getByThread: async (threadId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/posts/thread/${threadId}${query ? `?${query}` : ''}`);
  },

  create: async (postData: {
    threadId: string;
    content: string;
    images?: string[];
    replyTo?: string;
  }) => {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  update: async (id: string, postData: {
    content: string;
  }) => {
    return apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};