/**
 * Lightweight site visit tracking for Art by Namrata
 * Logs visits to Google Sheet without collecting sensitive personal data.
 */

function getVisitorId() {
  try {
    const key = 'an_vid';
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'v_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function getDeviceType() {
  const width = window.innerWidth || screen.width;
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet|PlayBook/i.test(ua) || (width >= 600 && width <= 1024 && 'ontouchstart' in window)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua) || width < 768) {
    return 'Mobile';
  }
  return 'Desktop';
}

function getBrowserAndOS() {
  const ua = navigator.userAgent || '';
  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Chrome|CriOS/i.test(ua) && !/Edg|OPR/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) browser = 'Safari';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Instagram/i.test(ua)) browser = 'Instagram In-App';

  return `${browser} on ${os}`;
}

function getReferrerSource() {
  const ref = document.referrer || '';
  if (!ref) return 'Direct';
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();
    if (host.includes('instagram.com')) return 'Instagram';
    if (host.includes('google.')) return 'Google Search';
    if (host.includes('facebook.com') || host.includes('fb.me')) return 'Facebook';
    if (host.includes('whatsapp')) return 'WhatsApp';
    if (host.includes('youtube.com')) return 'YouTube';
    if (host.includes('artbynamrata.com')) return 'Internal';
    return host.replace('www.', '');
  } catch {
    return ref.slice(0, 50);
  }
}

let lastTrackedPage = '';
let lastTrackedTime = 0;

export async function trackSiteVisit(endpoint, pageSection = 'home') {
  if (!endpoint) return;

  const now = Date.now();
  // Prevent duplicate tracks for the same section within 8 seconds
  if (lastTrackedPage === pageSection && now - lastTrackedTime < 8000) {
    return;
  }

  lastTrackedPage = pageSection;
  lastTrackedTime = now;

  const payload = {
    type: 'visit',
    visitorId: getVisitorId(),
    page: `#${pageSection}`,
    fullUrl: window.location.href,
    device: getDeviceType(),
    browser: getBrowserAndOS(),
    referrer: getReferrerSource(),
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-blocking, ignore network glitches
  }
}
