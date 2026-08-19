const waveform = [
  18, 34, 56, 82, 48, 28, 64, 92, 72, 38, 24, 50,
  78, 100, 66, 42, 30, 58, 86, 70, 46, 26, 54, 74
] as const;

export function MusicWaveformMark() {
  return (
    <div className="music-waveform-mark" aria-hidden="true">
      <div className="music-waveform-bars">
        {waveform.map((height, index) => (
          <span
            key={`${height}-${index}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="motion-mark-meta"><b>01</b><span>Play / 8000</span></div>
    </div>
  );
}

export function LiveStageMark() {
  return (
    <div className="live-stage-mark" aria-hidden="true">
      <span className="live-stage-beam live-stage-beam-a" />
      <span className="live-stage-beam live-stage-beam-b" />
      <span className="live-stage-beam live-stage-beam-c" />
      <div className="live-stage-mark-copy"><b>LIVE</b><span>02 / Brugge</span></div>
    </div>
  );
}

export function MediaFrameMark() {
  return (
    <div className="media-frame-mark" aria-hidden="true">
      <span className="media-frame-corner media-frame-corner-tl" />
      <span className="media-frame-corner media-frame-corner-tr" />
      <span className="media-frame-corner media-frame-corner-bl" />
      <span className="media-frame-corner media-frame-corner-br" />
      <div className="media-rec"><i />REC</div>
      <div className="media-scan-line" />
      <span className="media-frame-code">03 / BEELD / PERS</span>
    </div>
  );
}

export function ProfileCoordinateMark() {
  return (
    <div className="profile-coordinate-mark" aria-hidden="true">
      <span>51°12′ N</span>
      <b>8000</b>
      <span>3°13′ E</span>
    </div>
  );
}

export function BookingCueMark() {
  return (
    <div className="booking-cue-mark" aria-hidden="true">
      <span>06 / BOOKING</span>
      <b>STAGE REQUEST</b>
      <span>BRUGGE / BE</span>
    </div>
  );
}
