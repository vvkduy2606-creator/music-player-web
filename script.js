// ============ BIẾN TOÀN CỤC ============
let isAdmin = false;
let adminToken = localStorage.getItem('adminToken');
let playlist = [];
let currentSongIndex = -1;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const loginForm = document.getElementById('login-form');
const playlistEl = document.getElementById('playlist');
const playIcon = document.getElementById('play-icon');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressSlider = document.getElementById('progress-slider');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const albumArt = document.querySelector('.album-art');
const fileInput = document.getElementById('file-input');
const uploadProgress = document.getElementById('upload-progress');
const progressFill = document.getElementById('progress-fill');
const uploadStatus = document.getElementById('upload-status');
const uploadSection = document.getElementById('upload-section');

// ============ KIỂM TRA ĐĂNG NHẬP KHI TẢI TRANG ============
window.addEventListener('load', async () => {
    if (adminToken) {
        // Kiểm tra token còn hợp lệ không
        try {
            const response = await fetch('/api/check-auth', {
                headers: { 'Authorization': adminToken }
            });
            const data = await response.json();
            if (data.isAdmin) {
                isAdmin = true;
                showMainPage();
            }
        } catch (e) {
            localStorage.removeItem('adminToken');
        }
    }
    
    // Load danh sách bài hát
    loadSongs();
});

// ============ XỬ LÝ ĐĂNG NHẬP ============
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            adminToken = data.token;
            localStorage.setItem('adminToken', adminToken);
            isAdmin = true;
            showMainPage();
            alert('Đăng nhập thành công!');
        } else {
            alert(data.message || 'Đăng nhập thất bại!');
        }
    } catch (error) {
        alert('Lỗi kết nối server!');
        console.error(error);
    }
});

// Vào chế độ khách (không đăng nhập)
function enterGuestMode() {
    showMainPage();
}

// Hiển thị trang chính
function showMainPage() {
    loginPage.style.display = 'none';
    mainPage.style.display = 'flex';
    
    // Hiển thị nút đăng xuất nếu là admin
    if (isAdmin) {
        document.getElementById('btn-logout').style.display = 'block';
        document.getElementById('btn-login').style.display = 'none';
        uploadSection.style.display = 'block';
        document.getElementById('user-display').textContent = 'Admin';
    } else {
        document.getElementById('btn-logout').style.display = 'none';
        document.getElementById('btn-login').style.display = 'block';
        uploadSection.style.display = 'none';
        document.getElementById('user-display').textContent = 'Khách';
    }
}

// Hiển thị form đăng nhập
function showLogin() {
    loginPage.style.display = 'flex';
    mainPage.style.display = 'none';
}

// Đăng xuất
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (e) {}
    
    localStorage.removeItem('adminToken');
    adminToken = null;
    isAdmin = false;
    showLogin();
}

// ============ LOAD DANH SÁCH BÀI HÁT ============
async function loadSongs() {
    try {
        const response = await fetch('/api/songs');
        playlist = await response.json();
        renderPlaylist();
        
        if (playlist.length > 0) {
            loadSong(0);
        }
    } catch (error) {
        console.error('Lỗi load bài hát:', error);
    }
}

// ============ XỬ LÝ UPLOAD NHẠC ============
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length === 0 || !isAdmin) return;
    
    uploadProgress.style.display = 'block';
    let uploadedCount = 0;
    
    Array.from(files).forEach(async (file, index) => {
        if (!file.type.startsWith('audio/')) {
            alert(`File "${file.name}" không phải là file nhạc!`);
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': adminToken },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                uploadedCount++;
                const progress = ((index + 1) / files.length) * 100;
                progressFill.style.width = `${progress}%`;
                uploadStatus.textContent = `Đã tải lên ${index + 1}/${files.length} file`;
                
                if (index === files.length - 1) {
                    setTimeout(() => {
                        uploadProgress.style.display = 'none';
                        progressFill.style.width = '0%';
                        uploadStatus.textContent = 'Đang tải lên...';
                        loadSongs();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    });
}

// ============ XỬ LÝ PLAYLIST ============
function renderPlaylist() {
    playlistEl.innerHTML = '';
    
    playlist.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="song-name">${song.title}</span>
            ${isAdmin ? `<button class="delete-btn" onclick="deleteSong('${song.id}')"><i class="fas fa-trash"></i></button>` : ''}
        `;
        li.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-btn')) {
                loadSong(index);
                playSong();
            }
        });
        
        if (index === currentSongIndex) {
            li.classList.add('active');
        }
        
        playlistEl.appendChild(li);
    });
}

async function deleteSong(songId) {
    if (!confirm('Bạn có chắc muốn xóa bài hát này?')) return;
    
    try {
        const response = await fetch(`/api/songs/${songId}`, {
            method: 'DELETE',
            headers: { 'Authorization': adminToken }
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadSongs();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
}

// ============ XỬ LÝ PLAYER ============
function loadSong(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentSongIndex = index;
    const song = playlist[index];
    
    audioPlayer.src = song.url;
    currentTitle.textContent = song.title;
    currentArtist.textContent = 'Unknown Artist';
    
    renderPlaylist();
}

function playSong() {
    if (playlist.length === 0) return;
    
    if (currentSongIndex === -1) {
        currentSongIndex = 0;
        loadSong(0);
    }
    
    audioPlayer.play();
    isPlaying = true;
    playIcon.classList.remove('fa-play');
    playIcon.classList.add('fa-pause');
    albumArt.classList.remove('paused');
}

function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    playIcon.classList.remove('fa-pause');
    playIcon.classList.add('fa-play');
    albumArt.classList.add('paused');
}

function togglePlay() {
    if (playlist.length === 0) {
        alert('Chưa có bài hát nào!');
        return;
    }
    
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function nextSong() {
    if (playlist.length === 0) return;
    
    if (isShuffle) {
        currentSongIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
    }
    
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

function prevSong() {
    if (playlist.length === 0) return;
    
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

function shuffle() {
    isShuffle = !isShuffle;
    const btn = document.querySelector('.fa-random').parentElement;
    btn.style.color = isShuffle ? '#6c5ce7' : 'white';
}

function repeat() {
    isRepeat = !isRepeat;
    const btn = document.querySelector('.fa-redo').parentElement;
    btn.style.color = isRepeat ? '#6c5ce7' : 'white';
    audioPlayer.loop = isRepeat;
}

// Cập nhật thanh tiến trình
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBarFill.style.width = `${progress}%`;
        progressSlider.value = progress;
        
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        durationEl.textContent = formatTime(audioPlayer.duration);
    }
});

// Xử lý khi click vào thanh tiến trình
progressSlider.addEventListener('input', () => {
    if (audioPlayer.duration) {
        const time = (progressSlider.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = time;
    }
});

// Xử lý khi hết bài
audioPlayer.addEventListener('ended', () => {
    if (!isRepeat) {
        nextSong();
        if (isPlaying) playSong();
    }
});

// Xử lý âm lượng
volumeSlider.addEventListener('input', () => {
    audioPlayer.volume = volumeSlider.value / 100;
});

// Format thời gian
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
