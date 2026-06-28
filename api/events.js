const CALENDAR_ID =
  'a423b7f3776240d3a12658889e9931f0e45f86dff71773ce00ccac8285e33ecb@group.calendar.google.com';

const CALENDAR_ICS_URL =
  'https://calendar.google.com/calendar/ical/' +
  encodeURIComponent(CALENDAR_ID) +
  '/public/basic.ics';

const MAX_LIMIT = 8;
const MIN_LIMIT = 1;

const TEXT_DECODER = {
  newline: /\\n/gi,
  comma: /\\,/g,
  semicolon: /\\;/g,
  slash: /\\\\/g,
};

const PLATFORM_LABELS = [
  { host: 'facebook.com', label: 'Facebook' },
  { host: 'tiktok.com', label: 'TikTok' },
  { host: 'youtube.com', label: 'YouTube' },
  { host: 'youtu.be', label: 'YouTube' },
  { host: 'instagram.com', label: 'Instagram' },
  { host: 'ticket', label: 'Tickets' },
];

function decodeIcsText(value = '') {
  return String(value)
    .replace(TEXT_DECODER.newline, '\n')
    .replace(TEXT_DECODER.comma, ',')
    .replace(TEXT_DECODER.semicolon, ';')
    .replace(TEXT_DECODER.slash, '\\')
    .trim();
}

function unfoldIcs(content = '') {
  return String(content).replace(/\r?\n[ \t]/g, '');
}

function parseIcsField(line = '') {
  const idx = line.indexOf(':');
  if (idx === -1) {
    return { key: line.trim(), value: '' };
  }

  return {
    key: line.slice(0, idx).trim(),
    value: line.slice(idx + 1).trim(),
  };
}

function parseIcsDate(value = '', isAllDay = false) {
  const clean = String(value || '').replace(/Z$/, '').trim();

  if (!clean) {
    return { key: '', label: '', isAllDay: false };
  }

  if (isAllDay || /^\d{8}$/.test(clean)) {
    const year = clean.slice(0, 4);
    const month = clean.slice(4, 6);
    const day = clean.slice(6, 8);

    return {
      key: `${year}${month}${day}0000`,
      label: `${day}/${month}/${year}`,
      isAllDay: true,
    };
  }

  if (/^\d{8}T\d{6}$/.test(clean)) {
    const year = clean.slice(0, 4);
    const month = clean.slice(4, 6);
    const day = clean.slice(6, 8);
    const hour = clean.slice(9, 11);
    const minute = clean.slice(11, 13);

    return {
      key: `${year}${month}${day}${hour}${minute}`,
      label: `${day}/${month}/${year} - ${hour}:${minute}`,
      isAllDay: false,
    };
  }

  return { key: '', label: '', isAllDay: false };
}

function nowBrusselsKey() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value || '00';

  return `${get('year')}${get('month')}${get('day')}${get('hour')}${get('minute')}`;
}

function extractLinks(text = '') {
  const links = [];
  const matches = decodeIcsText(text).match(/https?:\/\/[^\s<>"]+/gi) || [];

  for (const url of matches) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();

      const known = PLATFORM_LABELS.find((item) => host.includes(item.host));
      const label = known ? known.label : 'Link';

      if (!links.some((item) => item.url === url)) {
        links.push({ label, url });
      }
    } catch {
      // ignore invalid urls
    }
  }

  return links;
}

function parseEventsFromIcs(icsText = '', limit = 5) {
  const unfolded = unfoldIcs(icsText);
  const blocks = unfolded
    .split('BEGIN:VEVENT')
    .slice(1)
    .map((chunk) => chunk.split('END:VEVENT')[0]);

  const nowKey = nowBrusselsKey();
  const items = [];

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const event = {
      title: '',
      location: '',
      description: '',
      status: '',
      start: '',
      when: '',
      isAllDay: false,
      links: [],
    };

    for (const line of lines) {
      const { key, value } = parseIcsField(line);

      if (key.startsWith('SUMMARY')) {
        event.title = decodeIcsText(value);
      } else if (key.startsWith('LOCATION')) {
        event.location = decodeIcsText(value);
      } else if (key.startsWith('DESCRIPTION')) {
        event.description = decodeIcsText(value);
      } else if (key.startsWith('STATUS')) {
        event.status = decodeIcsText(value).toUpperCase();
      } else if (key.startsWith('DTSTART')) {
        const isAllDay = key.includes('VALUE=DATE');
        const parsedStart = parseIcsDate(value, isAllDay);
        event.start = parsedStart.key;
        event.when = parsedStart.label;
        event.isAllDay = parsedStart.isAllDay;
      }
    }

    if (!event.start) continue;
    if (event.status === 'CANCELLED') continue;
    if (event.start < nowKey) continue;

    event.links = extractLinks(`${event.description}\n${event.location}`).slice(0, 3);
    items.push(event);
  }

  items.sort((a, b) => a.start.localeCompare(b.start));
  return items.slice(0, limit);
}

module.exports = async (req, res) => {
  const requested = Number.parseInt(String(req.query?.limit || '4'), 10);
  const limit = Number.isFinite(requested)
    ? Math.max(MIN_LIMIT, Math.min(requested, MAX_LIMIT))
    : 4;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');

  try {
    const response = await fetch(CALENDAR_ICS_URL, {
      method: 'GET',
      headers: { 'User-Agent': 'kwkr-events-feed/1.0' },
    });

    if (!response.ok) {
      throw new Error(`calendar_fetch_failed_${response.status}`);
    }

    const icsText = await response.text();
    const events = parseEventsFromIcs(icsText, limit);

    res.status(200).end(
      JSON.stringify({
        updatedAt: new Date().toISOString(),
        calendarId: CALENDAR_ID,
        count: events.length,
        events,
      })
    );
  } catch (error) {
    res.status(200).end(
      JSON.stringify({
        updatedAt: new Date().toISOString(),
        calendarId: CALENDAR_ID,
        count: 0,
        events: [],
        error: 'unavailable',
      })
    );
  }
};
