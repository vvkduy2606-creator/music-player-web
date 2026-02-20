# Music Player - Trang Web Nghe Nhạc

## Tính năng
- ✅ Đăng nhập Admin (chỉ Admin mới upload được nhạc)
- ✅ Người khác chỉ nghe được, không upload được
- ✅ Upload nhạc (MP3, WAV, etc.)
- ✅ Player nghe nhạc đầy đủ
- ✅ Giao diện đẹp, responsive
- ✅ Tự động kết nối server (local hay online đều được)

## Cách chạy local (Test)

### 1. Cài đặt Python và thư viện
```
bash
pip install -r requirements.txt
```

### 2. Chạy server
```
bash
python app.py
```

### 3. Mở trình duyệt
Truy cập: `http://localhost:5000`

## Tài khoản Admin mặc định
- Username: `admin`
- Password: `admin123`

---

## Cách deploy lên Render (Miễn phí) - Để người khác truy cập được

### Bước 1: Tạo tài khoản GitHub
- Vào https://github.com và đăng ký

### Bước 2: Tạo Repository mới
- Tạo repository mới trên GitHub
- Đặt tên là `music-player-web`

### Bước 3: Đẩy code lên GitHub
Trong thư mục `music-player-web`, chạy:
```
bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/music-player-web.git
git push -u origin main
```
(Thay `YOUR_USERNAME` bằng tên GitHub của bạn)

### Bước 4: Deploy trên Render
1. Vào https://render.com và đăng nhập
2. Chọn "New" → "Web Service"
3. Kết nối với GitHub và chọn repo `music-player-web`
4. Cấu hình:
   - **Name**: `music-player`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Chọn "Create Web Service"
6. Đợi khoảng 2-3 phút để deploy

### Bước 5: Truy cập website
- Sau khi deploy thành công, bạn sẽ có link như: `https://music-player-xxx.onrender.com`
- Gửi link này cho người khác để họ nghe nhạc!

---

## Cách sử dụng sau khi deploy

1. **Vào trang web** bằng link Render
2. **Admin (bạn)**:
   - Đăng nhập với username: `admin`, password: `admin123`
   - Upload nhạc để thêm vào danh sách
3. **Khách**:
   - Vào trang web (không cần đăng nhập)
   - Nghe nhạc được nhưng không thể upload

---

## Lưu ý quan trọng
- **Mật khẩu admin**: Nên đổi mật khẩu trong file `app.py` dòng `ADMIN_PASSWORD = 'admin123'`
- **File nhạc**: Khi deploy lên Render, file nhạc sẽ được lưu trên server (miễn phí nhưng có giới hạn)
- **Dữ liệu**: Danh sách nhạc sẽ mất khi restart server (miễn phí). Để lưu vĩnh viễn cần nâng cấp lên paid plan hoặc dùng database.

## Cấu trúc file
```
music-player-web/
├── index.html      # Giao diện web
├── style.css       # Giao diện đẹp
├── script.js       # Logic JavaScript
├── app.py          # Backend Flask
├── requirements.txt # Thư viện Python
├── runtime.txt     # Phiên bản Python
└── README.md       # Hướng dẫn
