#!/usr/bin/env bash
# Build small "-tile.mp4" renditions for the gallery grid.
#
# Why: gallery tiles render at roughly 170px (2-up phone) to 440px (3-up
# desktop), but the sources are 1280px at 1.3-2.6 Mbps. Decoding a 1280x720
# frame into a 200px box is ~40x more pixels than the tile can show, and it is
# the reason several tiles playing at once used to stall the page.
#
# Decode cost scales with pixels x fps:
#   1280x720 @30  = 27.6 Mpx/s   (source)
#    640x360 @24  =  5.5 Mpx/s   (tile)  -> ~5x cheaper
#
# That headroom is what makes concurrent autoplay affordable: several tile
# clips together cost about what one source clip used to.
#
# Requires ffmpeg on PATH.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VID="$ROOT/public/videos"

MAXEDGE=640      # longest edge; covers a 440px tile at ~1.5x DPR
FPS=24
BITRATE=420      # kbps — plenty for this size, keeps tiles light on mobile data

# Only the clips that appear as gallery tiles.
CLIPS=(
  gallery-harvest gallery-ai
  gallery-01 gallery-02 gallery-03 gallery-04
  gallery-05 gallery-06 gallery-07
)

printf "%-22s %-12s %10s %10s\n" CLIP RES SOURCE TILE

for name in "${CLIPS[@]}"; do
  src="$VID/$name.mp4"
  dst="$VID/$name-tile.mp4"

  if [[ ! -f "$src" ]]; then
    printf "%-22s %s\n" "$name" "(missing source)"
    continue
  fi

  ffmpeg -y -hide_banner -loglevel error \
    -i "$src" \
    -c:v libx264 -profile:v main -level 3.1 \
    -preset slow -pix_fmt yuv420p \
    -vf "scale=w='if(gt(iw,ih),${MAXEDGE},-2)':h='if(gt(iw,ih),-2,${MAXEDGE})':flags=lanczos,fps=${FPS}" \
    -b:v "${BITRATE}k" -maxrate "$((BITRATE * 15 / 10))k" -bufsize "$((BITRATE * 3))k" \
    -movflags +faststart -an \
    "$dst"

  s=$(stat -c %s "$src" 2>/dev/null || stat -f %z "$src")
  d=$(stat -c %s "$dst" 2>/dev/null || stat -f %z "$dst")
  res=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$dst")
  printf "%-22s %-12s %7d KB %7d KB  (-%d%%)\n" \
    "$name" "$res" $((s / 1024)) $((d / 1024)) $((100 - d * 100 / s))
done
