# HƯỚNG DẪN DEPLOY LÊN RENDER
## Để người khác có thể truy cập website của bạn từ internet

---

### Bước 1: Tạo tài khoản GitHub
1. Vào https://github.com
2. Đăng ký tài khoản miễn phí
3. Xác minh email

### Bước 2: Tạo Repository (Kho chứa code)
1. Đăng nhập GitHub
2. Bấm nút "+" góc phải → "New repository"
3. Đặt tên: `music-player-web`
4. Chọn "Public"
5. Bấm "Create repository"

### Bước 3: Đẩy code lên GitHub
Mở Terminal (Command Prompt) và chạy các lệnh sau:

```
bash
cd C:\Users\vvkdu\Desktop\music-player-web

git init

git add .

git commit -m "Music Player"

git branch -M main

git remote add origin https://github.com/YOUR_USERNAME/music-player-web.git
```
*(Thay YOUR_USERNAME bằng tên user Gitn)*

```
bash
git push -u origin main
```

### Bước Hub của bạ4: Deploy trên Render
1. Vào https://render.com
2. Đăng nhập bằng tài khoản GitHub
3. Bấm "New" → "Web Service"
4. Kết nối với GitHub:
   - Chọn "GitHub" làm source
   - Chọn repository `music-player-web`
5. Cấu hình:
   - **Name**: `music-player`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Free Instance**: ✓ (đã chọn)
6. Bấm "Create Web Service"
7. Đợi 2-3 phút...

### Bước 5: Truy cập website!
- Khi deploy xong, bạn sẽ thấy link như: `https://music-player-abc1.onrender.com`
- Gửi link này cho bạn bè!
- Họ có thể nghe nhạc mà không cần đăng nhập

### Để upload nhạc (chỉ bạn làm được):
1. Vào website bạn vừa tạo
2. Bấm "Đăng nhập Admin"
3. Nhập: admin / admin123
4. Upload nhạc

---

### Lưu ý:
- **Miễn phí**: Render miễn phí nhưng sau 15 phút không có ai vào, website sẽ "ngủ". Lần sau vào sẽ hơi chậm 1 chút.
- **Dữ liệu**: Nhạc upload lên sẽ mất khi website restart (miễn phí). Để lưu vĩnh viễn cần trả phí.

### Cần giúp gì?
Nếu gặp khó khăn ở bước nào, hãy cho tôi biết!
