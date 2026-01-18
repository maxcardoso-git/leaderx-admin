const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.61.52.70:3004/api';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private tenantId: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.tenantId = 'demo-tenant'; // TODO: Get from auth context
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, headers, ...restConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...restConfig,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': this.tenantId,
        ...headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
        statusCode: response.status,
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
