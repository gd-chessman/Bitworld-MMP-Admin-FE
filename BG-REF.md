# BG Affiliate System API Documentation

## Tổng quan
Hệ thống BG Affiliate là hệ thống giới thiệu đa cấp với logic ưu tiên BG affiliate hơn traditional referral. Hệ thống bao gồm 2 module chính:
- **Module Admin**: Quản lý BG affiliate (chỉ admin có quyền)
- **Module BG-Ref**: API cho user sử dụng

### Tích hợp với hệ thống giao dịch
Hệ thống BG Affiliate được tích hợp tự động vào quá trình giao dịch thông qua API `/api/v1/trade/orders`. Khi một giao dịch được thực hiện thành công:

1. **Kiểm tra hệ thống**: Hệ thống tự động kiểm tra xem wallet có thuộc BG affiliate không
2. **Tính toán commission**:
   - Nếu thuộc BG affiliate: Tính toán và phân chia commission theo cây BG affiliate
   - Nếu không thuộc BG affiliate: Tính toán theo hệ thống referral truyền thống
3. **Lưu dữ liệu**: Commission được lưu vào database tương ứng (`bg_affiliate_commission_rewards` hoặc `wallet_ref_rewards`)

**Ví dụ:**
- Wallet A (BG affiliate, 70%) → Wallet B (40%) → Wallet C (20%)
- Wallet C giao dịch $1000 → Phí giao dịch $10
- Wallet B nhận $4 (40%), Wallet A nhận $3 (30%)

## Module Admin APIs

### 1. Tạo BG Affiliate mới
```
POST /admin/bg-affiliate
```
**Mô tả**: Tạo BG affiliate mới cho wallet (chỉ wallet chưa thuộc hệ thống referral nào)
**Body**:
```json
{
  "walletId": 123456,
  "totalCommissionPercent": 70.00
}
```
**Response**:
```json
{
  "message": "Tạo BG affiliate thành công",
  "treeId": 1,
  "totalCommissionPercent": 70.00,
  "walletInfo": {
    "walletId": 123456,
    "nickName": "User1",
    "solanaAddress": "ABC123...",
    "ethAddress": "0xDEF456...",
    "auth": "member",
    "status": true
  }
}
```

### 2. Cập nhật hoa hồng root BG
```
PUT /admin/bg-affiliate/commission
```
**Mô tả**: Admin cập nhật hoa hồng của root BG (chỉ root BG, với kiểm tra tối thiểu)
**Body**:
```json
{
  "treeId": 1,
  "newPercent": 60.00
}
```
**Response**:
```json
{
  "success": true,
  "message": "Cập nhật hoa hồng root BG thành công",
  "oldPercent": 70.00,
  "newPercent": 60.00,
  "minRequiredPercent": 40.00,
  "treeInfo": {
    "treeId": 1,
    "rootWallet": {
      "walletId": 123456,
      "solanaAddress": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
      "nickName": "Root BG"
    },
    "totalCommissionPercent": 70.00
  }
}
```
**Logic hoạt động:**
- Chỉ có thể cập nhật hoa hồng của **root BG** (ví tạo cây affiliate)
- Hệ thống tự động tính toán commission percent tối thiểu cần thiết để không ảnh hưởng đến tuyến dưới
- Nếu `newPercent` < `minRequiredPercent`, API sẽ trả về lỗi
- Ví dụ: Nếu tuyến dưới có commission cao nhất là 40%, thì root BG phải có commission ≥ 40%

**Lưu ý:** Admin chỉ có thể cập nhật root BG, không thể cập nhật các node khác trong cây.

### 3. Lấy danh sách tất cả BG affiliate trees
```
GET /admin/bg-affiliate/trees
```
**Mô tả**: Lấy danh sách tất cả BG affiliate trees trong hệ thống
**Response**:
```json
[
  {
    "treeId": 1,
    "rootWallet": {
      "walletId": 123456,
      "solanaAddress": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
      "nickName": "Root BG",
      "ethAddress": "0xDEF456789ABC123DEF456789ABC123DEF456789A"
    },
    "totalCommissionPercent": 70.00,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "nodeCount": 5
  }
]
```

### 4. Lấy chi tiết BG affiliate tree
```
GET /admin/bg-affiliate/trees/:treeId
```
**Mô tả**: Lấy thông tin chi tiết của một BG affiliate tree
**Response**:
```json
{
  "treeId": 1,
  "rootWallet": {
    "walletId": 123456,
    "solanaAddress": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    "nickName": "Root BG",
    "ethAddress": "0xDEF456789ABC123DEF456789ABC123DEF456789A"
  },
  "totalCommissionPercent": 70.00,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "nodes": [
    {
      "nodeId": 1,
      "walletId": 123456,
      "parentWalletId": null,
      "commissionPercent": 70.00,
      "effectiveFrom": "2024-01-01T00:00:00.000Z",
      "walletInfo": {
        "nickName": "RootUser",
        "solanaAddress": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
        "ethAddress": "0xDEF456789ABC123DEF456789ABC123DEF456789A"
      }
    }
  ]
}
```

### 5. Lấy thống kê BG affiliate của wallet
```
GET /admin/bg-affiliate/wallet/:walletId/stats
```
**Mô tả**: Lấy thống kê BG affiliate của một wallet cụ thể
**Response**:
```json
{
  "isBgAffiliate": true,
  "currentWallet": {
    "walletId": 123456,
    "solanaAddress": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    "nickName": "Current User",
    "ethAddress": "0xDEF456789ABC123DEF456789ABC123DEF456789A"
  },
  "treeInfo": {
    "treeId": 1,
    "rootWallet": {
      "walletId": 789012,
      "solanaAddress": "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
      "nickName": "Root BG",
      "ethAddress": "0xABC123DEF456789ABC123DEF456789ABC123DEF4"
    },
    "totalCommissionPercent": 70.00
  },
  "nodeInfo": {
    "treeId": 1,
    "parentWallet": {
      "walletId": 345678,
      "solanaAddress": "DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123",
      "nickName": "Parent User",
      "ethAddress": "0xGHI789JKL012MNO345PQR678STU901VWX234YZA567ABC123DEF456"
    },
    "commissionPercent": 25.00,
    "level": 2
  },
  "totalEarnings": 150.75
}
```

### 6. Thêm node mới vào BG affiliate tree
```
POST /admin/bg-affiliate/nodes
```
**Mô tả**: Thêm node mới vào BG affiliate tree
**Body**:
```json
{
  "treeId": 1,
  "walletId": 789012,
  "parentWalletId": 123456,
  "commissionPercent": 25.00
}
```

## Module BG-Ref APIs (User APIs)

### 1. Cập nhật commission percent
```
PUT /bg-ref/nodes/commission
```
**Mô tả**: Cập nhật commission percent của node (chỉ người giới thiệu trực tiếp mới có quyền)
**Body**:
```json
{
  "toWalletId": 789012,
  "newPercent": 25.00
}
```

### 2. Lấy lịch sử hoa hồng
```
GET /bg-ref/commission-history
```
**Mô tả**: Lấy lịch sử hoa hồng của wallet hiện tại
**Response**:
```json
[
  {
    "bacr_id": 1,
    "bacr_tree_id": 1,
    "bacr_order_id": 12345,
    "bacr_wallet": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    "bacr_commission_amount": "25.500000",
    "bacr_level": 1,
    "bacr_created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3. Kiểm tra status BG affiliate
```
GET /bg-ref/bg-affiliate-status/:targetWalletId
```
**Mô tả**: Kiểm tra status của wallet trong luồng BG affiliate (chỉ ví tuyến trên mới có quyền)
**Response**:
```json
{
  "hasPermission": true,
  "isTargetInDownline": true,
  "fromWallet": {
    "walletId": 789012,
    "solanaAddress": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    "nickName": "FromUser",
    "ethAddress": "0xDEF456789ABC123DEF456789ABC123DEF456789A"
  },
  "targetWallet": {
    "walletId": 123456,
    "solanaAddress": "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    "nickName": "TargetUser",
    "ethAddress": "0xABC123DEF456789ABC123DEF456789ABC123DEF4"
  },
  "targetBgAffiliateInfo": {
    "treeId": 1,
    "parentWalletId": 123456,
    "commissionPercent": 25.00,
    "level": 1
  },
  "relationship": {
    "level": 1,
    "commissionPercent": 25.00,
    "effectiveFrom": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Kiểm tra status của wallet hiện tại
```
GET /bg-ref/my-bg-affiliate-status
```
**Mô tả**: Kiểm tra status của wallet hiện tại
**Response**:
```json
{
  "isBgAffiliate": true,
  "currentWallet": {
    "walletId": 123456,
    "solanaAddress": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    "nickName": "CurrentUser",
    "ethAddress": "0xDEF456789ABC123DEF456789ABC123DEF456789A"
  },
  "bgAffiliateInfo": {
    "treeId": 1,
    "parentWalletId": 789012,
    "commissionPercent": 25.00,
    "level": 1
  }
}
```

### 5. Lấy thống kê BG affiliate
```
GET /bg-ref/bg-affiliate-stats
```
**Mô tả**: Lấy thống kê BG affiliate của wallet hiện tại
**Response**:
```json
{
  "isBgAffiliate": true,
  "treeInfo": {
    "treeId": 1,
    "rootWallet": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
    "totalCommissionPercent": 70.00
  },
  "nodeInfo": {
    "treeId": 1,
    "parentWallet": "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
    "commissionPercent": 25.00,
    "level": 1
  },
  "totalEarnings": 125.50
}
```

### 6. Lấy thông tin cây affiliate
```
GET /bg-ref/trees
```
**Mô tả**: Lấy thông tin cây affiliate của wallet hiện tại (chỉ hiển thị tuyến dưới)
**Response**:
```json
{
  "isBgAffiliate": true,
  "treeInfo": {
    "treeId": 1,
    "referrer": {
      "solanaAddress": "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567",
      "nickName": "ReferrerUser"
    },
    "totalCommissionPercent": 70.00,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "downlineNodes": [
    {
      "nodeId": 2,
      "solanaAddress": "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
      "commissionPercent": 35.00,
      "effectiveFrom": "2024-01-15T10:30:00.000Z",
      "level": 1,
      "walletInfo": {
        "nickName": "User1",
        "solanaAddress": "XYZ789ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234",
        "ethAddress": "0xDEF456..."
      }
    }
  ]
}
```

### 7. Lấy thống kê chi tiết downline
```
GET /bg-ref/downline-stats
```
**Mô tả**: Lấy thống kê chi tiết về downline members với bộ lọc
**Query Parameters**:
- `startDate`: Ngày bắt đầu (ISO string)
- `endDate`: Ngày kết thúc (ISO string)
- `minCommission`: Hoa hồng tối thiểu
- `maxCommission`: Hoa hồng tối đa
- `minVolume`: Volume giao dịch tối thiểu
- `maxVolume`: Volume giao dịch tối đa
- `level`: Lọc theo cấp độ
- `sortBy`: Sắp xếp theo (`commission`, `volume`, `transactions`, `level`)
- `sortOrder`: Thứ tự sắp xếp (`asc`, `desc`)

**Response**:
```json
{
  "isBgAffiliate": true,
  "totalMembers": 5,
  "membersByLevel": {
    "level1": 2,
    "level2": 3
  },
  "totalCommissionEarned": 125.50,
  "totalVolume": 5000.00,
  "totalTransactions": 25,
  "stats": {
    "level1": {
      "count": 2,
      "totalCommission": 75.00,
      "totalVolume": 3000.00,
      "totalTransactions": 15
    },
    "level2": {
      "count": 3,
      "totalCommission": 50.50,
      "totalVolume": 2000.00,
      "totalTransactions": 10
    }
  },
  "detailedMembers": [
    {
      "walletId": 789012,
      "level": 1,
      "commissionPercent": 25.00,
      "totalCommission": 75.00,
      "totalVolume": 3000.00,
      "totalTransactions": 15,
      "lastTransactionDate": "2024-01-15T10:30:00.000Z",
      "walletInfo": {
        "nickName": "User1",
        "solanaAddress": "ABC123...",
        "ethAddress": "0xDEF456..."
      }
    }
  ]
}
```

## Authentication

### Admin APIs
- **Required**: JWT Admin Authentication (`@UseGuards(JwtAuthAdminGuard)`)
- **Token**: Phải chứa thông tin admin user

### User APIs
- **Required**: JWT Authentication (`@UseGuards(JwtAuthGuard)`)
- **Token**: Phải chứa `wallet_id` trong payload

## Bảo mật

### 1. Quyền truy cập
- ✅ Admin chỉ có thể quản lý BG affiliate
- ✅ User chỉ có thể xem thông tin của mình và tuyến dưới
- ✅ Không thể xem thông tin tuyến trên

### 2. Dữ liệu nhạy cảm
- ✅ Không lộ private key
- ✅ Không lộ password
- ✅ Chỉ hiển thị địa chỉ Solana thay vì ID khi cần thiết

### 3. Validation
- ✅ Kiểm tra commission percent hợp lệ (0-100%)
- ✅ Kiểm tra quyền cập nhật commission (chỉ parent trực tiếp)
- ✅ Kiểm tra giới hạn commission để không ảnh hưởng tuyến dưới

## Logic ưu tiên BG Affiliate

### 1. Khi có giao dịch
1. Kiểm tra wallet có thuộc BG affiliate không
2. Nếu có: Tính hoa hồng theo BG affiliate logic
3. Nếu không: Tính hoa hồng theo traditional referral logic

### 2. Khi thêm wallet mới
1. Kiểm tra referrer có thuộc BG affiliate không
2. Nếu có: Thêm vào BG affiliate tree
3. Nếu không: Thêm vào traditional referral system

### 3. Commission calculation
- **BG Affiliate**: Không giới hạn level, commission tùy chỉnh
- **Traditional Referral**: Giới hạn 7 level, commission cố định 