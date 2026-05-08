const audio = document.getElementById('audio-element');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loopBtn = document.getElementById('loop-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeIcon = document.getElementById('volume-icon');

const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const volumeSlider = document.getElementById('volume-slider');

const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const albumArt = document.getElementById('album-art');

const audioUpload = document.getElementById('audio-upload');
const playlistEl = document.getElementById('playlist');
const searchInput = document.getElementById('search-input');

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

let playlist = [];
let currentIndex = -1;
let isPlaying = false;
let isLooping = false;
let isMuted = false;

// Format Time
const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Handle File Upload
audioUpload.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('audio/')) {
            const track = {
                id: Date.now() + Math.random(),
                name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
                artist: "Unknown Artist",
                file: file,
                url: URL.createObjectURL(file)
            };
            playlist.push(track);
        }
    });
    
    renderPlaylist();
    if (currentIndex === -1 && playlist.length > 0) {
        loadTrack(0);
    }
});

// Render Playlist
const renderPlaylist = (filter = "") => {
    playlistEl.innerHTML = '';
    
    if (playlist.length === 0) {
        playlistEl.innerHTML = '<li class="empty-state">No tracks added. Upload some music to get started!</li>';
        return;
    }
    
    playlist.forEach((track, index) => {
        if (track.name.toLowerCase().includes(filter.toLowerCase())) {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="track-info-list">
                    <span class="track-name-list">${track.name}</span>
                </div>
                ${currentIndex === index && isPlaying ? '<i class="ph-fill ph-waves" style="color: var(--accent-color)"></i>' : '<i class="ph-fill ph-play-circle"></i>'}
            `;
            
            if (currentIndex === index) li.classList.add('active');
            
            li.addEventListener('click', () => {
                loadTrack(index);
                playTrack();
            });
            
            playlistEl.appendChild(li);
        }
    });
};

// Search Filter
searchInput.addEventListener('input', (e) => {
    renderPlaylist(e.target.value);
});

// Load Track
const loadTrack = (index) => {
    currentIndex = index;
    const track = playlist[currentIndex];
    
    audio.src = track.url;
    trackTitle.textContent = track.name;
    trackArtist.textContent = track.artist;
    
    // reset progress
    progressBar.value = 0;
    
    renderPlaylist(searchInput.value);
};

// Play/Pause
const playTrack = () => {
    if (currentIndex === -1 && playlist.length > 0) loadTrack(0);
    if (currentIndex === -1) return;
    
    audio.play();
    isPlaying = true;
    playIcon.classList.remove('ph-play');
    playIcon.classList.add('ph-pause');
    albumArt.classList.add('playing');
    renderPlaylist(searchInput.value);
};

const pauseTrack = () => {
    audio.pause();
    isPlaying = false;
    playIcon.classList.add('ph-play');
    playIcon.classList.remove('ph-pause');
    albumArt.classList.remove('playing');
    renderPlaylist(searchInput.value);
};

playBtn.addEventListener('click', () => {
    if (isPlaying) pauseTrack();
    else playTrack();
});

// Next/Prev
const nextTrack = () => {
    if (currentIndex === -1) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) {
        nextIndex = 0; // Wrap around
    }
    loadTrack(nextIndex);
    if (isPlaying) playTrack();
};

const prevTrack = () => {
    if (currentIndex === -1) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
        prevIndex = playlist.length - 1; // Wrap around
    }
    loadTrack(prevIndex);
    if (isPlaying) playTrack();
};

nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Audio Events
audio.addEventListener('timeupdate', () => {
    const duration = audio.duration;
    const current = audio.currentTime;
    
    if (!isNaN(duration)) {
        const progressPercent = (current / duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(current);
        totalTimeEl.textContent = formatTime(duration);
    }
});

audio.addEventListener('ended', () => {
    if (isLooping) {
        playTrack();
    } else {
        nextTrack();
        playTrack(); // play next track automatically
    }
});

audio.addEventListener('loadeddata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

// Progress Bar interaction
progressBar.addEventListener('input', (e) => {
    if (audio.duration) {
        const seekTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    }
});

// Loop
loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    loopBtn.classList.toggle('active-loop');
});

// Volume
volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    audio.volume = vol;
    
    if (vol === 0) {
        volumeIcon.className = 'ph ph-speaker-none';
        isMuted = true;
    } else if (vol < 0.5) {
        volumeIcon.className = 'ph ph-speaker-low';
        isMuted = false;
    } else {
        volumeIcon.className = 'ph ph-speaker-high';
        isMuted = false;
    }
});

muteBtn.addEventListener('click', () => {
    if (isMuted) {
        audio.volume = volumeSlider.value / 100 || 0.5; // restore previous or set to 50%
        volumeIcon.className = audio.volume > 0.5 ? 'ph ph-speaker-high' : 'ph ph-speaker-low';
        isMuted = false;
    } else {
        audio.volume = 0;
        volumeIcon.className = 'ph ph-speaker-x';
        isMuted = true;
    }
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const htmlEl = document.documentElement;
    if (htmlEl.getAttribute('data-theme') === 'dark') {
        htmlEl.setAttribute('data-theme', 'light');
        themeIcon.classList.remove('ph-sun');
        themeIcon.classList.add('ph-moon');
    } else {
        htmlEl.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('ph-moon');
        themeIcon.classList.add('ph-sun');
    }
});
