from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from datetime import datetime

app = Flask(__name__, static_folder='.')
CORS(app)

# Route cho trang chính
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Route cho các file tĩnh (CSS, JS)
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# Cấu hình
UPLOAD_FOLDER = 'uploads'
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin123'  # Đổi mật khẩu này!

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

# Database đơn giản (danh sách bài hát)
songs_db = []

# Token đơn giản cho admin
admin_token = None

# ============ ROUTES API ============

# Đăng nhập admin
@app.route('/api/login', methods=['POST'])
def login():
    global admin_token
    data = request.json
    
    if data.get('username') == ADMIN_USERNAME and data.get('password') == ADMIN_PASSWORD:
        admin_token = str(uuid.uuid4())
        return jsonify({'success': True, 'token': admin_token, 'isAdmin': True})
    return jsonify({'success': False, 'message': 'Sai tên đăng nhập hoặc mật khẩu'}), 401

# Kiểm tra đăng nhập
@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    token = request.headers.get('Authorization')
    if token == admin_token:
        return jsonify({'isAdmin': True})
    return jsonify({'isAdmin': False})

# Đăng xuất
@app.route('/api/logout', methods=['POST'])
def logout():
    global admin_token
    admin_token = None
    return jsonify({'success': True})

# Lấy danh sách bài hát (ai cũng xem được)
@app.route('/api/songs', methods=['GET'])
def get_songs():
    return jsonify(songs_db)

# Upload nhạc (chỉ admin)
@app.route('/api/upload', methods=['POST'])
def upload_song():
    token = request.headers.get('Authorization')
    
    if token != admin_token:
        return jsonify({'success': False, 'message': 'Bạn không có quyền upload'}), 403
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'Không có file'}), 400
    
    file = request.files['file']
    title = request.form.get('title', file.filename)
    
    if file:
        # Tạo tên file unique
        ext = os.path.splitext(file.filename)[1]
        filename = str(uuid.uuid4()) + ext
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Thêm vào database
        song = {
            'id': str(uuid.uuid4()),
            'title': title,
            'filename': filename,
            'url': f'/api/stream/{filename}',
            'uploaded_at': datetime.now().strftime('%Y-%m-%d %H:%M')
        }
        songs_db.append(song)
        
        return jsonify({'success': True, 'song': song})
    
    return jsonify({'success': False, 'message': 'Upload thất bại'}), 400

# Phát nhạc (ai cũng nghe được)
@app.route('/api/stream/<filename>')
def stream_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Xóa bài hát (chỉ admin)
@app.route('/api/songs/<song_id>', methods=['DELETE'])
def delete_song(song_id):
    token = request.headers.get('Authorization')
    
    if token != admin_token:
        return jsonify({'success': False, 'message': 'Bạn không có quyền xóa'}), 403
    
    for song in songs_db:
        if song['id'] == song_id:
            # Xóa file
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], song['filename'])
            if os.path.exists(filepath):
                os.remove(filepath)
            songs_db.remove(song)
            return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Bài hát không tồn tại'}), 404

# Thêm bài hát mẫu (demo)
@app.route('/api/add-sample', methods=['GET'])
def add_sample():
    if len(songs_db) == 0:
        songs_db.extend([
            {'id': '1', 'title': 'Demo Song 1', 'filename': 'demo1.mp3', 'url': '/api/stream/demo1.mp3', 'uploaded_at': '2024-01-01'},
            {'id': '2', 'title': 'Demo Song 2', 'filename': 'demo2.mp3', 'url': '/api/stream/demo2.mp3', 'uploaded_at': '2024-01-01'}
        ])
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
