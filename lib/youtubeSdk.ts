declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, number | string | boolean>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTVideoData {
  video_id: string;
  title: string;
  author: string;
}

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  playVideoAt: (index: number) => void;
  setLoop: (loopPlaylists: boolean) => void;
  getPlaylist: () => string[];
  getPlaylistIndex: () => number;
  getVideoData: () => YTVideoData;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string) => void;
  loadPlaylist: (playlist: string | string[] | { listType?: string; list?: string; index?: number; startSeconds?: number }, index?: number, startSeconds?: number) => void;
  cuePlaylist: (playlist: string | string[] | { listType?: string; list?: string; index?: number; startSeconds?: number }, index?: number, startSeconds?: number) => void;
  destroy: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  unMute: () => void;
  isMuted: () => boolean;
}

let isScriptLoading = false;
let isScriptLoaded = false;

export const loadYouTubeIframeApi = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (isScriptLoaded && window.YT && window.YT.Player) {
      resolve();
      return;
    }

    if (isScriptLoading) {
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          isScriptLoaded = true;
          resolve();
        }
      }, 100);
      return;
    }

    isScriptLoading = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve();
    };
  });
};
