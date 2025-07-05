// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // If we're in development (localhost), use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }
  
  // For production deployment, we need to either:
  // 1. Deploy the backend somewhere (like Railway, Render, etc.)
  // 2. Use a mock API for demo purposes
  
  // For now, let's use mock data for the deployed version
  return null; // This will trigger mock mode
};

const API_BASE_URL = getApiBaseUrl();

// Mock data for when backend is not available
const mockBoards = [
  {
    id: '1',
    name: '/tech/',
    description: 'Technology discussions, programming, and software development',
    category: 'Technology',
    threadCount: 42,
    postCount: 1337,
    lastActivity: new Date().toISOString(),
    isNSFW: false
  },
  {
    id: '2',
    name: '/gaming/',
    description: 'Video games, esports, and gaming culture',
    category: 'Entertainment',
    threadCount: 28,
    postCount: 892,
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    isNSFW: false
  },
  {
    id: '3',
    name: '/art/',
    description: 'Digital art, traditional art, and creative works',
    category: 'Creative',
    threadCount: 15,
    postCount: 456,
    lastActivity: new Date(Date.now() - 7200000).toISOString(),
    isNSFW: false
  },
  {
    id: '4',
    name: '/random/',
    description: 'Random discussions and off-topic conversations',
    category: 'General',
    threadCount: 67,
    postCount: 2341,
    lastActivity: new Date(Date.now() - 1800000).toISOString(),
    isNSFW: false
  }
];

const mockThreads = [
  {
    id: '1',
    boardId: '1',
    title: 'Welcome to the Tech Board!',
    content: 'This is a sample thread to demonstrate the application functionality.',
    author: {
      id: '1',
      username: 'TechModerator',
      email: '',
      isAnonymous: false,
      joinDate: new Date().toISOString(),
      postCount: 100
    },
    createdAt: new Date().toISOString(),
    lastReply: new Date().toISOString(),
    replyCount: 5,
    isSticky: true,
    isLocked: false,
    images: [],
    tags: ['welcome', 'announcement']
  }
];

const mockPosts = [
  {
    id: '1',
    threadId: '1',
    content: 'Welcome to NeoBoard! This is a demonstration of the message board functionality.',
    author: {
      id: '1',
      username: 'TechModerator',
      email: '',
      isAnonymous: false,
      joinDate: new Date().toISOString(),
      postCount: 100
    },
    createdAt: new Date().toISOString(),
    images: [],
    isOP: true
  }
];

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // If no API_BASE_URL, we're in mock mode
  if (!API_BASE_URL) {
    console.log(`🎭 Mock API Request: ${options.method || 'GET'} ${endpoint}`);
    return handleMockRequest(endpoint, options);
  }

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

// Mock API handler
const handleMockRequest = async (endpoint: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  
  // Handle different endpoints
  if (endpoint === '/boards' && method === 'GET') {
    return { success: true, boards: mockBoards };
  }
  
  if (endpoint.startsWith('/threads/board/') && method === 'GET') {
    const boardId = endpoint.split('/')[3];
    const boardThreads = mockThreads.filter(t => t.boardId === boardId);
    return { success: true, threads: boardThreads };
  }
  
  if (endpoint.startsWith('/posts/thread/') && method === 'GET') {
    const threadId = endpoint.split('/')[3];
    const threadPosts = mockPosts.filter(p => p.threadId === threadId);
    return { success: true, posts: threadPosts };
  }
  
  if (endpoint === '/auth/anonymous' && method === 'POST') {
    const mockUser = {
      id: 'demo-user',
      username: 'Anonymous',
      email: '',
      isAnonymous: true,
      joinDate: new Date().toISOString(),
      postCount: 0
    };
    
    // Store a demo token
    localStorage.setItem('authToken', 'demo-token-' + Date.now());
    
    return {
      success: true,
      token: 'demo-token-' + Date.now(),
      user: mockUser
    };
  }
  
  if (endpoint === '/auth/me' && method === 'GET') {
    const token = getAuthToken();
    if (token && token.startsWith('demo-token')) {
      return {
        success: true,
        user: {
          id: 'demo-user',
          username: 'Anonymous',
          email: '',
          isAnonymous: true,
          joinDate: new Date().toISOString(),
          postCount: 0
        }
      };
    }
    throw new Error('Not authenticated');
  }
  
  // For create operations, return success with mock data
  if (method === 'POST') {
    if (endpoint === '/boards') {
      const newBoard = {
        id: Date.now().toString(),
        ...JSON.parse(options.body as string),
        threadCount: 0,
        postCount: 0,
        lastActivity: new Date().toISOString()
      };
      mockBoards.unshift(newBoard);
      return { success: true, board: newBoard };
    }
    
    if (endpoint === '/threads') {
      const threadData = JSON.parse(options.body as string);
      const newThread = {
        id: Date.now().toString(),
        ...threadData,
        author: {
          id: 'demo-user',
          username: 'Anonymous',
          email: '',
          isAnonymous: true,
          joinDate: new Date().toISOString(),
          postCount: 0
        },
        createdAt: new Date().toISOString(),
        lastReply: new Date().toISOString(),
        replyCount: 0,
        isSticky: false,
        isLocked: false,
        images: []
      };
      mockThreads.unshift(newThread);
      return { success: true, thread: newThread };
    }
    
    if (endpoint === '/posts') {
      const postData = JSON.parse(options.body as string);
      const newPost = {
        id: Date.now().toString(),
        ...postData,
        author: {
          id: 'demo-user',
          username: 'Anonymous',
          email: '',
          isAnonymous: true,
          joinDate: new Date().toISOString(),
          postCount: 0
        },
        createdAt: new Date().toISOString(),
        images: [],
        isOP: false
      };
      mockPosts.push(newPost);
      return { success: true, post: newPost };
    }
  }
  
  // Default response for unhandled endpoints
  throw new Error(`Mock API: Endpoint ${method} ${endpoint} not implemented`);
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