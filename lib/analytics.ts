export type AnalyticsEvent = 
  | { name: 'pageview'; properties?: Record<string, string | number> }
  | { name: 'track_play'; properties: { trackId: string; trackTitle: string; artist: string } }
  | { name: 'track_pause'; properties: { trackId: string; progress: number } }
  | { name: 'track_seek'; properties: { trackId: string; seekTo: number } }
  | { name: 'track_complete'; properties: { trackId: string; trackTitle: string } }
  | { name: 'outbound_click'; properties: { platform: 'spotify' | 'ytmusic'; url: string } };

export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined') return;

  // Log in non-production environment for developer verification
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Analytics Event]', event.name, event.properties ?? '');
  }

  // Plausible integration if window.plausible exists
  if (typeof (window as unknown as { plausible?: Function }).plausible === 'function') {
    (window as unknown as { plausible: Function }).plausible(event.name, {
      props: event.properties,
    });
  }

  // Umami integration if window.umami exists
  if (typeof (window as unknown as { umami?: { track: Function } }).umami?.track === 'function') {
    (window as unknown as { umami: { track: Function } }).umami.track(event.name, event.properties);
  }
};
