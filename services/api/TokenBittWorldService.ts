import axiosClient from '@/utils/axiosClient';

export interface BittworldToken {
  bt_id: number;
  bt_name: string;
  bt_symbol: string;
  bt_address: string;
  bt_logo_url: string;
  bt_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TokensResponse {
  tokens: BittworldToken[];
  pagination: PaginationInfo;
}

export interface CreateTokenRequest {
  bt_name: string;
  bt_symbol: string;
  bt_address: string;
  bt_logo_url: string;
  bt_status: boolean;
}

export interface UpdateTokenRequest {
  bt_name: string;
  bt_symbol: string;
  bt_logo_url: string;
  bt_status: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

class TokenBittWorldService {
  // Lấy danh sách token
  async getTokens(search?: string, page: number = 1, limit: number = 20): Promise<ApiResponse<TokensResponse>> {
    const params: any = { page, limit }
    if (search && search.trim()) {
      params.search = search.trim()
    }
    const response = await axiosClient.get('/bittworld-token', { params })
    return response.data
  }

  // Tạo token mới
  async createToken(tokenData: CreateTokenRequest): Promise<ApiResponse<BittworldToken>> {
    const response = await axiosClient.post('/bittworld-token', tokenData);
    return response.data;
  }

  // Cập nhật token
  async updateToken(id: number, tokenData: UpdateTokenRequest): Promise<ApiResponse<BittworldToken>> {
    const response = await axiosClient.put(`/bittworld-token/${id}`, tokenData);
    return response.data;
  }

  // Xóa token
  async deleteToken(id: number): Promise<ApiResponse<{ deletedTokenId: number; deletedAt: string }>> {
    const response = await axiosClient.delete(`/bittworld-token/${id}`);
    return response.data;
  }
}

export default new TokenBittWorldService();