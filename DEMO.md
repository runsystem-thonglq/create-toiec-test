# 🎯 Demo: Lưu Trữ Câu Trả Lời Vào JSON File

## ✅ Tính Năng Đã Hoàn Thành

### 🔧 Những Gì Đã Được Cài Đặt:

1. **API Endpoints** (`/src/app/api/user-answers/route.ts`):

   - `GET /api/user-answers?testId={id}` - Load câu trả lời của người dùng
   - `POST /api/user-answers` - Lưu câu trả lời của người dùng
   - `DELETE /api/user-answers?testId={id}` - Xóa câu trả lời của người dùng

2. **File JSON Storage** (`/src/data/user-answers.json`):

   - Lưu trữ tất cả câu trả lời của người dùng cho các bài test khác nhau
   - Format: `{ "testId": [userAnswers], ... }`

3. **Cập Nhật TestRunner** (`/src/components/TestRunner.tsx`):
   - Thay thế localStorage bằng API calls
   - Tự động lưu khi người dùng chọn đáp án
   - Tự động load khi vào bài test
   - Reset câu trả lời thông qua API

### 🚀 Cách Hoạt Động:

1. **Khi người dùng chọn đáp án**:

   - Câu trả lời được lưu ngay lập tức vào file JSON
   - Không cần nhấn nút "Save" nào cả

2. **Khi refresh trang (F5)**:

   - Câu trả lời đã chọn được load lại từ file JSON
   - Người dùng có thể tiếp tục làm bài từ nơi đã dừng

3. **Khi nhấn "Reset Kết Quả"**:
   - Tất cả câu trả lời được xóa khỏi file JSON
   - Bài test được reset về trạng thái ban đầu

### 📁 Cấu Trúc File JSON:

```json
{
  "sample_test_1": [
    { "id": 1, "value": "A" },
    { "id": 2, "value": "B" },
    { "id": 3, "value": "C" }
  ],
  "test_1234567890": [
    { "id": 1, "value": "D" },
    { "id": 5, "value": "A" }
  ]
}
```

### 🎮 Cách Test:

1. Mở ứng dụng tại `http://localhost:3001`
2. Chọn một bài test để làm
3. Chọn một vài đáp án
4. Nhấn F5 để refresh trang
5. Kiểm tra xem các đáp án đã chọn có được giữ lại không
6. Nhấn "Reset Kết Quả" để xóa tất cả

### ✨ Lợi Ích:

- ✅ **Persistent Storage**: Dữ liệu được lưu vào file JSON, không bị mất khi refresh
- ✅ **Real-time Saving**: Tự động lưu khi chọn đáp án
- ✅ **Multi-test Support**: Hỗ trợ nhiều bài test cùng lúc
- ✅ **Easy Management**: Dễ dàng backup và restore dữ liệu
- ✅ **Server-side Storage**: Dữ liệu được lưu trên server, không phụ thuộc vào browser

---

**🎉 Tính năng đã sẵn sàng sử dụng!**
