# Tài Liệu API Airdrop - Admin

## Tổng Quan

Tài liệu này mô tả 3 API chính để quản lý cấu hình top round và xử lý rút tiền airdrop trong hệ thống.

---

## 1. API Set Top Round

### Endpoint
```
POST /admin/set-top-round
```

### Mô tả
API này được sử dụng để thiết lập cấu hình top round cho airdrop rewards. Admin có thể cấu hình số lượng vị trí top và phần trăm reward tương ứng.

### Quyền truy cập
- Yêu cầu quyền admin
- Sử dụng JWT authentication

### Request Body

```json
{
  "count_top": 3,
  "top_rounds": [
    {
      "atr_num_top": 1,
      "atr_percent": 50
    },
    {
      "atr_num_top": 2,
      "atr_percent": 30
    },
    {
      "atr_num_top": 3,
      "atr_percent": 20
    }
  ]
}
```

#### Tham số

| Tên | Kiểu | Bắt buộc | Mô tả | Giá trị hợp lệ |
|-----|------|----------|-------|----------------|
| `count_top` | number | Có | Số lượng vị trí top | 0-10 (0 = xóa tất cả) |
| `top_rounds` | array | Không* | Mảng cấu hình top round | *Bắt buộc khi count_top > 0 |

#### Cấu trúc TopRoundConfig

| Tên | Kiểu | Bắt buộc | Mô tả | Giá trị hợp lệ |
|-----|------|----------|-------|----------------|
| `atr_num_top` | number | Có | Số thứ tự top | 1-10 (phải tuần tự) |
| `atr_percent` | number | Có | Phần trăm reward | 1-99 |

### Quy tắc validation

1. **count_top**: Phải từ 0-10
2. **top_rounds**: 
   - Độ dài phải bằng count_top
   - atr_num_top phải tuần tự từ 1
   - atr_percent phải từ 1-99
   - Tổng phần trăm không được vượt quá 100%

### Response

#### Success Response (200)
```json
{
  "success": true,
  "message": "Top round configuration set successfully"
}
```

#### Success Response - Clear All (200)
```json
{
  "success": true,
  "message": "All top round configurations cleared"
}
```

#### Error Response (400)
```json
{
  "success": false,
  "message": "count_top must be between 1 and 10"
}
```

### Ví dụ sử dụng

#### Thiết lập 3 vị trí top
```bash
curl -X POST /admin/set-top-round \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "count_top": 3,
    "top_rounds": [
      {"atr_num_top": 1, "atr_percent": 50},
      {"atr_num_top": 2, "atr_percent": 30},
      {"atr_num_top": 3, "atr_percent": 20}
    ]
  }'
```

#### Xóa tất cả cấu hình
```bash
curl -X POST /admin/set-top-round \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"count_top": 0}'
```

---

## 2. API Get Top Round

### Endpoint
```
GET /admin/get-top-round
```

### Mô tả
API này được sử dụng để lấy cấu hình top round hiện tại cho airdrop rewards.

### Quyền truy cập
- Yêu cầu quyền admin
- Sử dụng JWT authentication

### Request
Không cần request body, chỉ cần admin authentication.

### Response

#### Success Response - Có cấu hình (200)
```json
{
  "success": true,
  "message": "Top round configuration retrieved successfully",
  "data": {
    "count_top": 3,
    "top_rounds": [
      {
        "atr_num_top": 1,
        "atr_percent": 50
      },
      {
        "atr_num_top": 2,
        "atr_percent": 30
      },
      {
        "atr_num_top": 3,
        "atr_percent": 20
      }
    ]
  }
}
```

#### Success Response - Không có cấu hình (200)
```json
{
  "success": true,
  "message": "No top round configuration found",
  "data": {
    "count_top": 0,
    "top_rounds": []
  }
}
```

#### Error Response (500)
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Cấu trúc dữ liệu

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `count_top` | number | Số lượng vị trí top được cấu hình |
| `top_rounds` | array | Mảng các cấu hình top round |
| `top_rounds[].atr_num_top` | number | Số thứ tự top (1, 2, 3...) |
| `top_rounds[].atr_percent` | number | Phần trăm reward tương ứng |

### Ví dụ sử dụng

```bash
curl -X GET /admin/get-top-round \
  -H "Authorization: Bearer <jwt_token>"
```

---

## 3. API Airdrop Withdraw

### Endpoint
```
POST /admin/airdrop-withdraw
```

### Mô tả
API này được sử dụng để xử lý việc rút airdrop rewards từ bảng `airdrop_rewards` có trạng thái `"can-withdraw"`. Hệ thống sẽ tự động gửi token từ ví admin đến ví người nhận.

### Quyền truy cập
- Yêu cầu quyền admin
- Sử dụng JWT authentication

### Request
Không cần request body, chỉ cần admin authentication.

### Biến môi trường cần thiết

Thêm vào file `.env`:

```env
# Private key của ví để rút rewards (format: base58 hoặc JSON)
WALLET_WITHDRAW_REWARD=your_private_key_here

# Solana RPC URL (optional, default: mainnet)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Response

#### Success Response (200)
```json
{
  "success": true,
  "message": "Airdrop withdrawal process completed",
  "processed": 5,
  "success_count": 4,
  "error_count": 1,
  "results": [
    {
      "reward_id": 1,
      "status": "success",
      "transaction_hash": "5J7X...abc123",
      "amount": 1000000
    },
    {
      "reward_id": 2,
      "status": "error",
      "error": "Insufficient balance"
    }
  ]
}
```

#### Success Response - Không có rewards (200)
```json
{
  "success": true,
  "message": "No rewards to withdraw",
  "processed": 0,
  "total": 0
}
```

#### Error Response (500)
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Cấu trúc dữ liệu

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `processed` | number | Tổng số rewards được xử lý |
| `success_count` | number | Số rewards xử lý thành công |
| `error_count` | number | Số rewards xử lý thất bại |
| `results` | array | Chi tiết kết quả xử lý từng reward |

#### Cấu trúc Result Item

| Tên | Kiểu | Mô tả |
|-----|------|-------|
| `reward_id` | number | ID của reward |
| `status` | string | Trạng thái: "success" hoặc "error" |
| `transaction_hash` | string | Hash giao dịch (chỉ có khi success) |
| `amount` | number | Số lượng token (chỉ có khi success) |
| `error` | string | Thông báo lỗi (chỉ có khi error) |

### Flow xử lý

```
1. Tìm rewards có ar_status = "can-withdraw"
2. Với mỗi reward:
   - Lấy token mint address
   - Lấy wallet address người nhận
   - Gửi token từ ví admin đến ví người nhận
   - Cập nhật trạng thái thành "withdrawn"
   - Ghi log transaction hash
3. Trả về kết quả tổng hợp
```

### Ví dụ sử dụng

```bash
curl -X POST /admin/airdrop-withdraw \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Lưu ý quan trọng

### 1. Bảo mật
- Tất cả API đều yêu cầu quyền admin
- Private key ví withdraw phải được bảo mật tuyệt đối
- Không commit private key vào source code

### 2. Xử lý lỗi
- Hệ thống có cơ chế retry và error handling
- Mỗi reward được xử lý độc lập
- Lỗi một reward không ảnh hưởng đến các reward khác

### 3. Performance
- API withdraw có thể mất thời gian nếu có nhiều rewards
- Nên gọi API này trong background job
- Có thể sử dụng Redis lock để tránh duplicate processing

### 4. Monitoring
- Tất cả API đều có logging chi tiết
- Theo dõi transaction hash để verify trên blockchain
- Alert khi có lỗi xảy ra

---

## Liên hệ hỗ trợ

Nếu có vấn đề gì, vui lòng liên hệ team development hoặc tạo issue trong repository.
