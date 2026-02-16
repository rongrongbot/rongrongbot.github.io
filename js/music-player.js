/**
 * Music Player - Korean 갠홈 Style
 * Compact sidebar music player
 */

class GanhomeMusicPlayer {
  constructor() {
    this.audio = new Audio();
    this.playlist = [];
    this.currentTrack = 0;
    this.isPlaying = false;

    // DOM Elements
    this.playBtn = document.getElementById('playBtn');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.progressBar = document.getElementById('progressBar');
    this.currentTimeEl = document.getElementById('currentTime');
    this.durationEl = document.getElementById('duration');
    this.trackTitleEl = document.getElementById('trackTitle');
    this.trackStatusEl = document.getElementById('trackStatus');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.musicPlayer = document.getElementById('musicPlayer');
    this.musicProgress = document.querySelector('.music-progress');

    this.init();
  }

  init() {
    if (!this.playBtn) return;

    // Bind events
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.prevTrack());
    this.nextBtn.addEventListener('click', () => this.nextTrack());

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    }

    if (this.musicProgress) {
      this.musicProgress.addEventListener('click', (e) => this.seek(e));
    }

    // Audio events
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    this.audio.addEventListener('ended', () => this.nextTrack());
    this.audio.addEventListener('error', () => this.handleError());

    // Set initial volume
    if (this.volumeSlider) {
      this.audio.volume = this.volumeSlider.value / 100;
    }

    // Load playlist
    this.loadPlaylist();
  }

  loadPlaylist() {
    // Demo playlist - add your music files to /assets/music/
    this.playlist = [
      { title: 'Sample Track 1', src: 'assets/music/track1.mp3' },
      { title: 'Sample Track 2', src: 'assets/music/track2.mp3' },
      { title: 'Sample Track 3', src: 'assets/music/track3.mp3' },
    ];

    if (this.playlist.length > 0) {
      this.loadTrack(0);
    }
  }

  loadTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;

    this.currentTrack = index;
    const track = this.playlist[index];

    this.audio.src = track.src;
    if (this.trackTitleEl) {
      this.trackTitleEl.textContent = track.title;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.audio.play().catch(() => {
      if (this.trackTitleEl) {
        this.trackTitleEl.textContent = 'No music files';
      }
      this.updateStatus('ERROR');
    });
    this.isPlaying = true;
    this.playBtn.textContent = '❚❚';
    this.updateStatus('PLAYING');

    // Add playing class for CD rotation
    if (this.musicPlayer) {
      this.musicPlayer.classList.add('playing');
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.playBtn.textContent = '▶';
    this.updateStatus('PAUSED');

    // Remove playing class
    if (this.musicPlayer) {
      this.musicPlayer.classList.remove('playing');
    }
  }

  prevTrack() {
    let newIndex = this.currentTrack - 1;
    if (newIndex < 0) newIndex = this.playlist.length - 1;
    this.loadTrack(newIndex);
    if (this.isPlaying) this.play();
  }

  nextTrack() {
    let newIndex = this.currentTrack + 1;
    if (newIndex >= this.playlist.length) newIndex = 0;
    this.loadTrack(newIndex);
    if (this.isPlaying) this.play();
  }

  setVolume(value) {
    this.audio.volume = value / 100;
  }

  seek(e) {
    const rect = this.musicProgress.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (!isNaN(this.audio.duration)) {
      this.audio.currentTime = percent * this.audio.duration;
    }
  }

  updateProgress() {
    const percent = (this.audio.currentTime / this.audio.duration) * 100 || 0;
    if (this.progressBar) {
      this.progressBar.style.width = `${percent}%`;
    }
    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }
  }

  updateDuration() {
    if (this.durationEl) {
      this.durationEl.textContent = this.formatTime(this.audio.duration);
    }
  }

  updateStatus(status) {
    if (this.trackStatusEl) {
      this.trackStatusEl.textContent = status;
    }
  }

  handleError() {
    this.updateStatus('NO FILE');
    if (this.trackTitleEl) {
      this.trackTitleEl.textContent = 'No music';
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// Initialize player
document.addEventListener('DOMContentLoaded', () => {
  window.musicPlayer = new GanhomeMusicPlayer();
});
