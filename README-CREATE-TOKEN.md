# Tính năng Quản lý Token

## Tổng quan
Tính năng quản lý token cho phép admin tạo, chỉnh sửa và xóa các token trong hệ thống Bittworld.

## Các chức năng chính

### 1. Tạo Token Mới
- **Form tạo token** với các trường:
  - Tên token (bắt buộc)
  - Ký hiệu token (bắt buộc, tối đa 10 ký tự)
  - Địa chỉ token (bắt buộc, unique)
  - URL logo (tùy chọn)
  - Trạng thái kích hoạt (true/false)

- **Validation** sử dụng Zod schema:
  - Kiểm tra các trường bắt buộc
  - Validate URL logo
  - Giới hạn độ dài ký hiệu

### 2. Hiển thị Danh sách Token
- **Bảng hiển thị** với các cột:
  - Logo token (fallback về placeholder nếu lỗi)
  - Tên token
  - Ký hiệu (badge)
  - Địa chỉ token (truncated nếu quá dài)
  - Trạng thái (Hoạt động/Ẩn với icon)
  - Ngày tạo
  - Các nút thao tác (Edit/Delete)

### 3. Chỉnh sửa Token
- **Modal edit** với form pre-filled
- **Không cho phép** thay đổi địa chỉ token (disabled)
- Có thể cập nhật:
  - Tên token
  - Ký hiệu
  - URL logo
  - Trạng thái

### 4. Xóa Token
- **Alert dialog** xác nhận trước khi xóa
- Hiển thị tên token sẽ bị xóa
- Cảnh báo hành động không thể hoàn tác

## API Endpoints

### 1. Lấy danh sách token
```
GET /admin/bittworld-token
```

### 2. Tạo token mới
```
POST /admin/bittworld-token
Body: {
  "bt_name": "Bitcoin",
  "bt_symbol": "BTC", 
  "bt_address": "So11111111111111111111111111111111111111112",
  "bt_logo_url": "https://example.com/logo.png",
  "bt_status": true
}
```

### 3. Cập nhật token
```
PUT /admin/bittworld-token/:id
Body: {
  "bt_name": "Bitcoin Updated",
  "bt_symbol": "BTC", 
  "bt_logo_url": "https://example.com/new-logo.png",
  "bt_status": false
}
```

### 4. Xóa token
```
DELETE /admin/bittworld-token/:id
```

## Cấu trúc dữ liệu

### BittworldToken Interface
```typescript
interface BittworldToken {
  bt_id: number;
  bt_name: string;
  bt_symbol: string;
  bt_address: string;
  bt_logo_url: string;
  bt_status: boolean;
  created_at: string;
  updated_at: string;
}
```

## Xử lý lỗi

### 1. Validation Errors
- Hiển thị lỗi validation dưới mỗi field
- Sử dụng react-hook-form với Zod resolver

### 2. API Errors
- Toast notifications cho các lỗi API
- Hiển thị message từ server
- Fallback message nếu không có response

### 3. Network Errors
- Loading states cho tất cả async operations
- Disable buttons khi đang loading
- Skeleton loading cho danh sách

## UI/UX Features

### 1. Responsive Design
- Mobile-friendly layout
- Responsive table với horizontal scroll
- Collapsible sidebar

### 2. Visual Feedback
- Loading spinners
- Success/error toasts
- Hover effects trên buttons
- Active states cho navigation

### 3. Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader friendly

## Dependencies

### Core Dependencies
- `react-hook-form` - Form management
- `@hookform/resolvers/zod` - Zod validation
- `zod` - Schema validation
- `axios` - HTTP client
- `sonner` - Toast notifications

### UI Components
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-alert-dialog` - Confirmation dialogs
- `@radix-ui/react-switch` - Toggle switches
- `lucide-react` - Icons

## File Structure

```
app/create-token/
├── page.tsx          # Main component
└── loading.tsx       # Loading skeleton

services/api/
└── TokenBittWorldService.ts  # API service

components/ui/        # Reusable UI components
```

## Usage

1. Navigate to `/create-token` từ sidebar
2. Click "Tạo Token Mới" để mở form
3. Fill in required fields và submit
4. Use Edit/Delete buttons trong table để quản lý tokens
5. Confirm deletion trong alert dialog

## Error Handling

### Common Error Scenarios
1. **Duplicate Address**: Token với địa chỉ đã tồn tại
2. **Invalid URL**: Logo URL không hợp lệ
3. **Network Issues**: Không thể kết nối server
4. **Validation Errors**: Form validation failures

### Error Messages
- Tất cả error messages được hiển thị qua toast
- Form validation errors hiển thị inline
- Network errors có fallback messages
