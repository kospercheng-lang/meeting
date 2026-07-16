export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  lrcUrl: string;
  pitchUrl: string;
}

export interface QueueItem {
  id: string;
  songId: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  lrcUrl: string;
  pitchUrl: string;
  addedBy: string;
}

export interface Member {
  id: string;
  nickname: string;
  score: number;
}

export interface Playback {
  isPlaying: boolean;
  time: number;
  updatedAt: number;
}

export interface ScoreEntry {
  id: string;
  nickname: string;
  songId: string;
  songTitle: string;
  score: number;
  at: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  members: Member[];
  queue: QueueItem[];
  currentSong: QueueItem | null;
  playback: Playback;
  scores: ScoreEntry[];
}
