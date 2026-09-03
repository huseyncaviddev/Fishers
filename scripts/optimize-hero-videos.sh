#!/usr/bin/env bash
# Re-encode the heavy hero background videos for web delivery.
#
# Rationale:
#   Hero videos are decorative background loops that sit behind a heavy dark
#   overlay. At the rendered size (viewport width, muted, looped, no audio)
#   the perceptual quality of a well-encoded 720p ~1.5 Mbps clip is
#   indistinguishable from a 1080p ~3.5 Mbps master — but the download is 2-3x
#   smaller and mobile GPUs decode it comfortably.
#
# Behaviour:
#   - Originals are backed up to ../_video_masters/ once. Re-running the script
#     is idempotent — it won't overwrite an existing backup.
#   - The optimized file replaces the original in public/videos/.
#   - The -low.mp4 variants are left untouched (they were already right-sized).
#
# Requires: ffmpeg on PATH.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VID="$ROOT/public/videos"
MASTERS="$ROOT/_video_masters"

mkdir -p "$MASTERS"

encode() {
  local name="$1"      # e.g. hero-2
  local height="$2"    # target height (720)
  local bitrate="$3"   # target avg bitrate (kbps)
  local src="$VID/$name.mp4"
  local backup="$MASTERS/$name.master.mp4"
  local tmp="$VID/$name.opt.mp4"

  if [[ ! -f "$src" ]]; then
    echo "SKIP $name (not found)"
    return
  fi

  # Preserve the master exactly once.
  if [[ ! -f "$backup" ]]; then
    cp "$src" "$backup"
    echo "backup → $backup"
  fi

  # Two-pass H.264, target avg bitrate + peak cap. Slow preset for maximum
  # compression at this bitrate. `-an` strips audio (hero loops are muted).
  # `-pix_fmt yuv420p` guarantees Safari/iOS compatibility.
  # `movflags +faststart` moves the moov atom to the front so playback starts
  # before the whole file is downloaded.
  local maxrate=$((bitrate * 15 / 10))   # 1.5x avg
  local bufsize=$((bitrate * 3))         # 3x avg
  local passlog
  passlog="$(mktemp -u).ffpass"

  ffmpeg -y -hide_banner -loglevel error \
    -i "$backup" \
    -c:v libx264 -profile:v high -level 4.0 \
    -preset slow -pix_fmt yuv420p \
    -vf "scale=-2:${height}:flags=lanczos,fps=30" \
    -b:v "${bitrate}k" -maxrate "${maxrate}k" -bufsize "${bufsize}k" \
    -pass 1 -passlogfile "$passlog" -an -f mp4 /dev/null

  ffmpeg -y -hide_banner -loglevel error \
    -i "$backup" \
    -c:v libx264 -profile:v high -level 4.0 \
    -preset slow -pix_fmt yuv420p \
    -vf "scale=-2:${height}:flags=lanczos,fps=30" \
    -b:v "${bitrate}k" -maxrate "${maxrate}k" -bufsize "${bufsize}k" \
    -pass 2 -passlogfile "$passlog" -movflags +faststart -an \
    "$tmp"

  rm -f "${passlog}"-*.log "${passlog}"-*.log.mbtree

  # Only replace when the optimized file is actually smaller.
  local orig_bytes opt_bytes
  orig_bytes=$(stat -c %s "$src" 2>/dev/null || stat -f %z "$src")
  opt_bytes=$(stat -c %s "$tmp" 2>/dev/null || stat -f %z "$tmp")
  if (( opt_bytes < orig_bytes )); then
    mv "$tmp" "$src"
    printf "OK   %-24s %8d B → %8d B  (%d%% saved)\n" \
      "$name.mp4" "$orig_bytes" "$opt_bytes" \
      $(( 100 - opt_bytes * 100 / orig_bytes ))
  else
    rm -f "$tmp"
    printf "KEEP %-24s optimized was larger (%d B vs %d B)\n" \
      "$name.mp4" "$opt_bytes" "$orig_bytes"
  fi
}

# name              height  avg-kbps
encode hero-2       720     1400
encode hero-3       720     1500
encode ras-system-new 720   1100
encode about-preview  720   1200
