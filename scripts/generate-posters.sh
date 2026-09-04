#!/usr/bin/env bash
# Regenerate real poster frames for every video.
#
# Several posters shipped as 32px LQIP thumbnails (e.g. gallery-01.jpg at
# 32x70, hero-2.jpg at 32x18). Those were fine while a video always autoplayed
# over them within a fraction of a second, but they are now the persistent
# visual for any clip that is waiting on a tap/hover — a 32px image stretched
# across a 400px tile, which reads as a blurry mess.
#
# This grabs a representative frame from each clip and writes a properly sized,
# well-compressed poster. Idempotent: safe to re-run.
#
# Requires ffmpeg on PATH.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VID="$ROOT/public/videos"
OUT="$ROOT/public/videos/posters"

mkdir -p "$OUT"

# Seek a little way in — frame 0 is often a black fade-in on these clips.
SEEK=0.8
# Longest edge. Portrait clips are constrained the same way, otherwise a 9:16
# source yields a 1280x2768 poster — far more pixels than a ~400px tile needs.
MAXEDGE=1280
QUALITY=4   # mjpeg q:v, 2=best .. 31=worst; 4 is visually clean and small

make_poster() {
  local name="$1"
  local src="$VID/$name.mp4"
  local dst="$OUT/$name.jpg"

  if [[ ! -f "$src" ]]; then
    printf "SKIP  %-22s (no source)\n" "$name"
    return
  fi

  local before=0
  [[ -f "$dst" ]] && before=$(stat -c %s "$dst" 2>/dev/null || stat -f %z "$dst")

  # Clamp the seek to the clip duration so very short clips still yield a frame.
  local dur
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src" 2>/dev/null | cut -d. -f1)
  local seek="$SEEK"
  if [[ -n "${dur:-}" && "$dur" -lt 1 ]]; then seek=0; fi

  ffmpeg -y -hide_banner -loglevel error \
    -ss "$seek" -i "$src" \
    -frames:v 1 \
    -vf "scale=w='if(gt(iw,ih),${MAXEDGE},-2)':h='if(gt(iw,ih),-2,${MAXEDGE})':flags=lanczos" \
    -q:v "$QUALITY" \
    "$dst"

  local after
  after=$(stat -c %s "$dst" 2>/dev/null || stat -f %z "$dst")
  local dim
  dim=$(ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$dst")
  printf "OK    %-22s %-11s %7d B -> %7d B\n" "$name" "$dim" "$before" "$after"
}

# Every clip that has a poster referenced anywhere in the app.
for n in \
  about-preview \
  gallery-01 gallery-02 gallery-03 gallery-04 gallery-05 gallery-06 gallery-07 \
  gallery-ai gallery-chile gallery-factory gallery-harvest gallery-largescale gallery-tank \
  ras-system-new \
  hero-1 hero-2 hero-3 hero-4 hero-5
do
  make_poster "$n"
done
