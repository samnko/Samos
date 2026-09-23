#!/usr/bin/env bash
# Generates 6 synthetic placeholder clips (assets/videos/V1…V6.mp4) so the hero can be
# developed before the real drone footage is added. Delete them once the real clips are in.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/videos"; mkdir -p "$OUT"
LABELS=("V1 · Vue aérienne de Netanya" "V2 · Approche de la tour" "V3 · Façade du penthouse" "V4 · Salon" "V5 · Balcon et fondateurs" "V6 · Recul drone final")
C0=("0x0b1a2b" "0x10263d" "0x1d2a36" "0x2a2119" "0x2f2a22" "0x0d1824")
C1=("0x2d6f8f" "0x5f7f96" "0x8a7a62" "0xb99a6b" "0xd4b483" "0x33587a")
FONT=$(fc-match -f '%{file}' 'DejaVu Serif')
for i in 0 1 2 3 4 5; do
  ffmpeg -v error -y -f lavfi -i "gradients=s=1920x1080:r=30:d=5:c0=${C0[$i]}:c1=${C1[$i]}:x0=0:y0=0:x1=1920:y1=1080:speed=0.012" \
    -vf "zoompan=z='1+0.0015*on':d=1:s=1920x1080:fps=30,drawtext=fontfile=${FONT}:text='PLACEHOLDER':fontcolor=white@0.25:fontsize=28:x=(w-tw)/2:y=h-120,drawtext=fontfile=${FONT}:text='${LABELS[$i]}':fontcolor=white@0.35:fontsize=40:x=(w-tw)/2:y=h-80" \
    -c:v libx264 -pix_fmt yuv420p "$OUT/V$((i+1)).mp4"
  echo "✓ V$((i+1)).mp4"
done
