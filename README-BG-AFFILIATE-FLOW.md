# BG Affiliate Flow Change API

## Tổng quan

API này cho phép admin thay đổi luồng BG affiliate (thay đổi người giới thiệu tuyến trên) trong một cây BG affiliate. Đây là một tính năng quan trọng để quản lý cấu trúc affiliate và tối ưu hóa hiệu suất.

## API Endpoint

```
PUT /admin/bg-affiliate/change-flow
```

## Chức năng

- **Thay đổi người giới thiệu tuyến trên** của một wallet trong hệ thống BG affiliate
- **Tự động cập nhật cấu trúc cây** khi thay đổi parent
- **Cập nhật commission percent** theo parent mới
- **Đảm bảo tính nhất quán** với database transaction
- **Ngăn chặn vòng lặp** và cấu trúc không hợp lệ
- **Lý do thay đổi** được ghi mặc định là "Admin request"

## Request Body

```typescript
{
  "walletId": 123,           // ID của ví cần thay đổi luồng
  "newParentWalletId": 456   // ID của ví cha mới
}
```

## Response

```typescript
{
  "success": true,
  "message": "BG affiliate flow changed successfully. Wallet 123 moved from tree 1 to tree 2",
  "walletId": 123,
  "oldParentWalletId": 789,
  "newParentWalletId": 456,
  "treeChanges": {
    "oldTreeId": 1,
    "newTreeId": 2,
    "affectedNodes": 5
  },
  "nodeInfo": {
    "walletId": 123,
    "nickName": "Wallet123",
    "solanaAddress": "ABC123...",
    "oldParentWalletId": 789,
    "newParentWalletId": 456,
    "oldTreeId": 1,
    "newTreeId": 2,
    "newCommissionPercent": 15.5,
    "affectedDescendants": 5,
    "reason": "Admin request for better structure"
  }
}
```

## Quy tắc và Ràng buộc

### ✅ **Cho phép:**
- Thay đổi parent của các node thường (không phải root)
- Di chuyển wallet trong cùng một cây
- Di chuyển wallet sang cây khác (nếu hợp lệ)

### ❌ **Không cho phép:**
- Thay đổi parent của root BG wallet
- Tạo vòng lặp (circular reference)
- Đặt wallet làm parent của chính nó
- Đặt descendant làm parent của ancestor

### 🔒 **Bảo mật:**
- Yêu cầu JWT authentication
- Chỉ admin mới có thể thực hiện
- PARTNER role chỉ được thay đổi cho Bittworld wallets

## Quy trình xử lý

1. **Validation**: Kiểm tra tính hợp lệ của request
2. **Security Check**: Xác thực quyền truy cập
3. **Business Logic**: Kiểm tra ràng buộc nghiệp vụ
4. **Database Transaction**: Thực hiện thay đổi với transaction
5. **Update Descendants**: Cập nhật tất cả node con
6. **Commission Update**: Cập nhật commission percent nếu cần
7. **Response**: Trả về kết quả chi tiết

## Ví dụ sử dụng

### Thay đổi parent trong cùng cây:
```bash
curl -X PUT /admin/bg-affiliate/change-flow \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": 123,
    "newParentWalletId": 456
  }'
```

### Di chuyển sang cây khác:
```bash
curl -X PUT /admin/bg-affiliate/change-flow \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": 789,
    "newParentWalletId": 101
  }'
```

## Xử lý lỗi

### 400 Bad Request:
- `Wallet already belongs to another BG affiliate system`
- `This change would create a circular reference`
- `Cannot set descendant wallet as parent`

### 404 Not Found:
- `Wallet with ID X does not exist`
- `BG affiliate node not found`

### 403 Forbidden:
- `PARTNER role can only change flow for wallets with isBittworld = true`

## Lưu ý quan trọng

1. **Transaction Safety**: Tất cả thay đổi được thực hiện trong database transaction
2. **Cascade Update**: Khi thay đổi parent, tất cả descendants cũng được cập nhật
3. **Commission Inheritance**: Commission percent được kế thừa từ parent mới
4. **Audit Trail**: Lý do thay đổi được ghi lại để theo dõi
5. **Performance**: API được tối ưu để xử lý cây affiliate lớn

## Monitoring và Logging

- Tất cả thay đổi được log chi tiết
- Số lượng node bị ảnh hưởng được báo cáo
- Thông tin cũ và mới được ghi lại để audit
- Error handling toàn diện với rollback tự động
