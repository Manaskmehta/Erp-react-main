import { API_CONFIG, buildApiUrl, TOKEN_STORAGE } from '@/config/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  admin: {
    id: number;
    name: string;
    email: string;
    phone_no: string;
    gstno: string;
    created_at: string;
    updated_at: string;
  };
  token: string;
  tokenType?: string;
  expiresIn?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Vendor {
  id: number;
  name: string;
  gstno: string;
  address: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorCreateRequest {
  name: string;
  gstno: string;
  address: string;
  phone_number: string;
}

export interface VendorListResponse {
  data: Vendor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface DirectVendorListResponse {
  success: boolean;
  data: Vendor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface VendorResponse {
  data: Vendor;
  message?: string;
}

// HSN Master types
export interface HSN {
  id: number;
  hsn_no: string;
  gst_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HSNCreateRequest {
  hsn_no: string;
  gst_rate: number;
}

export interface HSNListResponse {
  data: HSN[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface DirectHSNListResponse {
  success: boolean;
  data: HSN[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface HSNResponse {
  data: HSN;
  message?: string;
}

export interface HSNNumbersItem {
  id: number;
  hsn_no: string;
  GST: number;
}

export interface HSNNumbersResponse {
  success: boolean;
  data: HSNNumbersItem[];
}

// Category Master types
export interface Category {
  id: number;
  category_name: string;
  prefix: string;
  hsn_master_id?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hsn_no?: string | null;
  GST?: string | number | null;
}

export interface CategoryCreateRequest {
  category_name: string;
  prefix: string;
  hsn_master_id?: number | null;
}

export interface DirectCategoryListResponse {
  success: boolean;
  data: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface CategoryResponse {
  data: Category;
  message?: string;
}

// Category with HSN details for getAllCategories endpoint
export interface CategoryWithHSN {
  id: number;
  category_name: string;
  prefix: string;
  hsn_master_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hsn_id: number;
  hsn_no: string;
  GST: number;
}

export interface AllCategoriesResponse {
  success: boolean;
  data: CategoryWithHSN[];
  message: string;
}

// Customer Master types
export interface Customer {
  id: number;
  client_name: string;
  email: string;
  mobile_no: string;
  address: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  pan_no: string;
  gst_no: string;
  aadhaar_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateRequest {
  client_name: string;
  email: string;
  mobile_no: string;
  address: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  pan_no: string;
  gst_no: string;
  aadhaar_number: string;
}

export interface CustomerListResponse {
  data: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface DirectCustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface CustomerResponse {
  data: Customer;
  message?: string;
}

// Product interfaces
export interface Product {
  id: number;
  name: string;
  description?: string;
  product_code: string;
  category_id?: number;
  min_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface ProductCreateRequest {
  name: string;
  product_code: string;
  description?: string;
  category_id?: number;
  min_stock?: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface DirectProductListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface ProductResponse {
  data: Product;
  message?: string;
}

// Product Stock types

export interface ProductStock {
  id: number;
  barcode: string;
  product_id: number;
  product_name: string;
  particulars: string;
  purchase_price: number;
  quantity: number;
  sales_price_per_piece: number;
  total_sales_price: number;
  created_at: string;
}

export interface ProductStockCreateRequest {
  barcode: string;
  product_id: number;
  particulars: string;
  purchase_price: number;
  quantity: number;
  sales_price_per_piece: number;
  total_sales_price: number;
}

export interface ProductStockUpdateRequest {
  quantity?: number;
  sales_price_per_piece?: number;
  total_sales_price?: number;
  particulars?: string;
}

export interface ProductStockListResponse {
  data: ProductStock[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface DirectProductStockListResponse {
  success: boolean;
  data: ProductStock[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface ProductStockResponse {
  data: ProductStock;
  message?: string;
}

// Barcode Generation types
export interface BarcodeGenerationResponse {
  product_id: string;
  product_code: string;
  next_barcode: string;
}

// API Service class
class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(TOKEN_STORAGE.ACCESS_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response, isLoginRequest = false): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format');
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration - but not during login attempts
      if (response.status === 401 && !isLoginRequest) {
        this.clearTokens();
        window.location.href = '/auth';
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE.USER_DATA);
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isLoginRequest = false
  ): Promise<ApiResponse<T>> {
    const url = buildApiUrl(endpoint);
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'include',
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response, isLoginRequest);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, true);
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
      this.clearTokens();
      return response;
    } catch (error) {
      // Clear tokens even if logout request fails
      this.clearTokens();
      throw error;
    }
  }

  // Token management
  saveTokens(token: string, userData: any): void {
    localStorage.setItem(TOKEN_STORAGE.ACCESS_TOKEN, token);
    localStorage.setItem(TOKEN_STORAGE.USER_DATA, JSON.stringify(userData));
  }

  getStoredUser(): any {
    const userData = localStorage.getItem(TOKEN_STORAGE.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem(TOKEN_STORAGE.ACCESS_TOKEN);
    if (!token) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Vendor Master API methods
  async getVendors(search = '', page = 1, limit = 10): Promise<ApiResponse<VendorListResponse>> {
    const queryParams = new URLSearchParams({
      search,
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return this.request<VendorListResponse>(
      `${API_CONFIG.ENDPOINTS.VENDOR_MASTER.LIST}?${queryParams}`
    );
  }

  async getVendorById(id: number): Promise<ApiResponse<VendorResponse>> {
    return this.request<VendorResponse>(
      `${API_CONFIG.ENDPOINTS.VENDOR_MASTER.GET_BY_ID}/${id}`
    );
  }

  async createVendor(vendorData: VendorCreateRequest): Promise<ApiResponse<VendorResponse>> {
    return this.request<VendorResponse>(
      API_CONFIG.ENDPOINTS.VENDOR_MASTER.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(vendorData),
      }
    );
  }

  async updateVendor(id: number, vendorData: VendorCreateRequest): Promise<ApiResponse<VendorResponse>> {
    return this.request<VendorResponse>(
      `${API_CONFIG.ENDPOINTS.VENDOR_MASTER.UPDATE}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(vendorData),
      }
    );
  }

  async deleteVendor(id: number): Promise<ApiResponse> {
    return this.request(
      `${API_CONFIG.ENDPOINTS.VENDOR_MASTER.DELETE}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  // HSN Master API methods
  async getHSNs(search = '', gst_rate?: number, page = 1, limit = 10): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (gst_rate !== undefined) params.append('gst_rate', gst_rate.toString());
    
    return this.request<DirectHSNListResponse>(`/api/hsn-master?${params}`);
  }

  async getHSNById(id: number): Promise<ApiResponse<HSNResponse>> {
    return this.request<HSNResponse>(`/api/hsn-master/${id}`);
  }

  async getHSNByCode(hsn_no: string): Promise<ApiResponse<HSNResponse>> {
    return this.request<HSNResponse>(`/api/hsn-master/code/${hsn_no}`);
  }

  async createHSN(hsnData: HSNCreateRequest): Promise<ApiResponse<HSNResponse>> {
    return this.request<HSNResponse>('/api/hsn-master', {
      method: 'POST',
      body: JSON.stringify(hsnData),
    });
  }

  async updateHSN(id: number, hsnData: HSNCreateRequest): Promise<ApiResponse<HSNResponse>> {
    return this.request<HSNResponse>(`/api/hsn-master/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hsnData),
    });
  }

  async deleteHSN(id: number): Promise<ApiResponse> {
    return this.request(`/api/hsn-master/${id}`, {
      method: 'DELETE',
    });
  }

  async getHSNNumbers(): Promise<any> {
    return this.request<HSNNumbersResponse>('/api/hsn-master/numbers');
  }

  // Category Master API methods
  async getCategories(
    search = '',
    page = 1,
    limit = 10,
    sortBy: string = 'id',
    order: 'asc' | 'desc' = 'asc'
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      order,
    });
    if (search) params.append('search', search);
    return this.request<DirectCategoryListResponse>(`${API_CONFIG.ENDPOINTS.CATEGORY_MASTER.LIST}?${params}`);
  }

  // Master dashboard totals
  async getMasterDashboard(): Promise<any> {
    return this.request<any>('/api/dashboard/master-dashboard');
  }

  async getCategoryById(id: number): Promise<ApiResponse<CategoryResponse>> {
    return this.request<CategoryResponse>(`${API_CONFIG.ENDPOINTS.CATEGORY_MASTER.GET_BY_ID}/${id}`);
  }

  async createCategory(payload: CategoryCreateRequest): Promise<ApiResponse<CategoryResponse>> {
    return this.request<CategoryResponse>(API_CONFIG.ENDPOINTS.CATEGORY_MASTER.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCategory(id: number, payload: CategoryCreateRequest): Promise<ApiResponse<CategoryResponse>> {
    return this.request<CategoryResponse>(`${API_CONFIG.ENDPOINTS.CATEGORY_MASTER.UPDATE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteCategory(id: number): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.CATEGORY_MASTER.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllCategories(): Promise<ApiResponse<AllCategoriesResponse>> {
    return this.request<AllCategoriesResponse>('/api/category-master/all');
  }

  // Customer Master methods
  async getCustomers(search = '', page = 1, limit = 10): Promise<ApiResponse<CustomerListResponse>> {
    const params = new URLSearchParams({
      search,
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return this.request<CustomerListResponse>(`/api/customer-master?${params}`);
  }

  async getCustomerById(id: number): Promise<ApiResponse<CustomerResponse>> {
    return this.request<CustomerResponse>(`/api/customer-master/${id}`);
  }

  async createCustomer(customerData: CustomerCreateRequest): Promise<ApiResponse<CustomerResponse>> {
    return this.request<CustomerResponse>('/api/customer-master', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id: number, customerData: CustomerCreateRequest): Promise<ApiResponse<CustomerResponse>> {
        return this.request<CustomerResponse>(`/api/customer-master/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id: number): Promise<ApiResponse> {
    return this.request(`/customer-master/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllCustomers(): Promise<ApiResponse<{ success: boolean; data: Customer[] }>> {
    return this.request('/api/customer-master/all');
  }

  // Product API methods
  async getProducts(
    search = '',
    page = 1,
    limit = 10,
    category_id?: number,
    is_active?: boolean
  ): Promise<DirectProductListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(category_id && { category_id: category_id.toString() }),
      ...(is_active !== undefined && { is_active: is_active.toString() })
    });

    const response = await fetch(buildApiUrl(`/api/product-master?${params}`), {
      headers: this.getAuthHeaders()
    });
    
    return response.json();
  }

  async getProductById(id: number): Promise<ApiResponse<ProductResponse>> {
    return this.request(`/api/product-master/${id}`);
  }

  async createProduct(productData: ProductCreateRequest): Promise<ApiResponse<ProductResponse>> {
    return this.request('/api/product-master', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: ProductCreateRequest): Promise<ApiResponse<ProductResponse>> {
    return this.request(`/api/product-master/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number): Promise<ApiResponse> {
    return this.request(`/api/product-master/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteProductPermanent(id: number): Promise<ApiResponse> {
    return this.request(`/api/product-master/${id}/permanent`, {
      method: 'DELETE',
    });
  }

  // Get all products with category and GST details for stock management
  async getAllProductDetails(): Promise<ApiResponse<any>> {
    return this.request('/api/product-master/all-details');
  }

  // Product Stock methods
  async getProductStocks(
    search = '',
    page = 1,
    limit = 10
  ): Promise<ApiResponse<DirectProductStockListResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    return this.request(`/api/product-stocks?${params}`);
  }

  async getProductStockById(id: number): Promise<ApiResponse<ProductStockResponse>> {
    return this.request(`/api/product-stocks/${id}`);
  }

  async createProductStock(stockData: ProductStockCreateRequest): Promise<ApiResponse<ProductStockResponse>> {
    return this.request('/api/product-stocks', {
      method: 'POST',
      body: JSON.stringify(stockData)
    });
  }

  async updateProductStock(id: number, stockData: ProductStockUpdateRequest): Promise<ApiResponse<ProductStockResponse>> {
    return this.request(`/api/product-stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData)
    });
  }

  async deleteProductStock(id: number): Promise<ApiResponse> {
    return this.request(`/api/product-stocks/${id}`, {
      method: 'DELETE'
    });
  }

  // Barcode Generation API
  async generateBarcode(productId: string): Promise<ApiResponse<BarcodeGenerationResponse>> {
    return this.request(`/api/product-stocks/generate-barcode/${productId}`, {
      method: 'GET'
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();