#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Cohen Real Estate: builds the hero image sequence from the 6 drone clips.
#
#   assets/videos/V1.mp4 … V6.mp4  →  public/frames/{desktop,mobile}/frame_0001.webp …
#                                  →  public/frames/manifest.json (count + scene starts)
#                                  →  public/og.jpg (Open Graph image)
#
# Usage:   npm run frames
# Tuning:  FPS=16 MAX_FRAMES=900 DESKTOP_W=1600 DESKTOP_Q=72 MOBILE_W=900 MOBILE_Q=68 npm run frames
# (defaults chosen for the real drone footage: ~75 KB/desktop frame, ~53 KB/mobile frame)
#          SRC=path/to/videos npm run frames
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${SRC:-$ROOT/assets/videos}"
OUT="$ROOT/public/frames"
FPS="${FPS:-16}"
MAX_FRAMES="${MAX_FRAMES:-900}"   # frame budget: above this, fps is lowered automatically
MIN_FPS="${MIN_FPS:-12}"
DESKTOP_W="${DESKTOP_W:-1600}"
MOBILE_W="${MOBILE_W:-900}"
DESKTOP_Q="${DESKTOP_Q:-72}"
MOBILE_Q="${MOBILE_Q:-68}"

command -v ffmpeg  >/dev/null || { echo "✗ ffmpeg is not installed (brew install ffmpeg / apt install ffmpeg)"; exit 1; }
command -v ffprobe >/dev/null || { echo "✗ ffprobe is not installed"; exit 1; }

CLIPS=()
for i in 1 2 3 4 5 6; do
  f="$SRC/V$i.mp4"
  [[ -f "$f" ]] || { echo "✗ Missing $f"; exit 1; }
  CLIPS+=("$f")
done

# --- 1. Total duration → effective fps within the frame budget -------------
TOTAL_DUR=0
for f in "${CLIPS[@]}"; do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  TOTAL_DUR=$(awk -v a="$TOTAL_DUR" -v b="$d" 'BEGIN{print a+b}')
done
EST=$(awk -v d="$TOTAL_DUR" -v f="$FPS" 'BEGIN{printf "%d", d*f}')
if (( EST > MAX_FRAMES )); then
  NEW_FPS=$(awk -v m="$MAX_FRAMES" -v d="$TOTAL_DUR" -v min="$MIN_FPS" 'BEGIN{f=int(m/d); if(f<min)f=min; print f}')
  echo "ℹ ${TOTAL_DUR}s × ${FPS}fps = ${EST} frames > budget ${MAX_FRAMES} → fps lowered to ${NEW_FPS}"
  FPS=$NEW_FPS
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# --- 2. Normalise each clip (same fps / size / codec) so the concat is exact --
echo "→ Normalising clips at ${FPS}fps…"
STARTS=()
ACC=0
: > "$TMP/list.txt"
for i in "${!CLIPS[@]}"; do
  n=$((i + 1))
  # The clips are one continuous shot: clip N starts on clip N-1's last image, so drop that
  # duplicate (otherwise the scroll "stalls" for one frame at every seam).
  trim=""
  (( i > 0 )) && trim=",trim=start_frame=1,setpts=PTS-STARTPTS"
  ffmpeg -v error -y -i "${CLIPS[$i]}" -an \
    -vf "fps=${FPS}${trim},scale=${DESKTOP_W}:-2:flags=lanczos,format=yuv420p" \
    -c:v libx264 -crf 12 -preset veryfast "$TMP/n$n.mp4"
  c=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$TMP/n$n.mp4")
  STARTS+=("$ACC")
  ACC=$((ACC + c))
  echo "   V$n: $c frames (starts at index $((STARTS[$i] + 1)))"
  echo "file '$TMP/n$n.mp4'" >> "$TMP/list.txt"
done
TOTAL=$ACC

# --- 3. Concat into a single continuous sequence ----------------------------
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -c copy "$TMP/sequence.mp4"

# --- 4. Extract WebP frames ---------------------------------------------------
rm -rf "$OUT/desktop" "$OUT/mobile"
mkdir -p "$OUT/desktop" "$OUT/mobile"

echo "→ Desktop frames (${DESKTOP_W}px, q${DESKTOP_Q})…"
ffmpeg -v error -y -i "$TMP/sequence.mp4" -vsync 0 \
  -c:v libwebp -quality "$DESKTOP_Q" -compression_level 6 -preset photo \
  "$OUT/desktop/frame_%04d.webp"

# Mobile: centred portrait crop (9:16) then MOBILE_W wide, so the canvas stays sharp
# on a portrait phone instead of upscaling a 16:9 frame ~3x.
echo "→ Mobile frames (${MOBILE_W}px portrait crop, q${MOBILE_Q})…"
ffmpeg -v error -y -i "$TMP/sequence.mp4" -vsync 0 \
  -vf "crop=trunc(min(iw\,ih*9/16)/2)*2:ih,scale=${MOBILE_W}:-2:flags=lanczos" \
  -c:v libwebp -quality "$MOBILE_Q" -compression_level 6 -preset photo \
  "$OUT/mobile/frame_%04d.webp"

DESKTOP_COUNT=$(ls "$OUT/desktop" | wc -l)
MOBILE_COUNT=$(ls "$OUT/mobile" | wc -l)
[[ "$DESKTOP_COUNT" == "$MOBILE_COUNT" ]] || { echo "✗ Frame count mismatch ($DESKTOP_COUNT vs $MOBILE_COUNT)"; exit 1; }
TOTAL=$DESKTOP_COUNT

dims() { ffprobe -v error -show_entries stream=width,height -of csv=p=0:s=x "$1"; }
DDIM=$(dims "$OUT/desktop/frame_0001.webp")
MDIM=$(dims "$OUT/mobile/frame_0001.webp")

# --- 5. Open Graph image (1200×630): the founders on the terrace, start of V6 --
OG_FRAME=$(( STARTS[5] + 12 ))
ffmpeg -v error -y -i "$OUT/desktop/$(printf 'frame_%04d.webp' "$OG_FRAME")" \
  -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" -q:v 3 "$ROOT/public/og.jpg"

# --- 6. Manifest consumed by the hero -----------------------------------------
cat > "$OUT/manifest.json" <<JSON
{
  "version": "$(date +%s)",
  "count": $TOTAL,
  "fps": $FPS,
  "pad": 4,
  "desktop": { "path": "/frames/desktop", "width": ${DDIM%x*}, "height": ${DDIM#*x} },
  "mobile":  { "path": "/frames/mobile",  "width": ${MDIM%x*}, "height": ${MDIM#*x} },
  "scenes": [$(IFS=,; echo "${STARTS[*]}")]
}
JSON

DW=$(du -sh "$OUT/desktop" | cut -f1)
MW=$(du -sh "$OUT/mobile" | cut -f1)
DAVG=$(( $(du -sk "$OUT/desktop" | cut -f1) / TOTAL ))
MAVG=$(( $(du -sk "$OUT/mobile" | cut -f1) / TOTAL ))
echo ""
echo "✓ ${TOTAL} frames @ ${FPS}fps (${TOTAL_DUR}s)"
echo "  desktop ${DDIM}  ${DW}  (~${DAVG} KB/frame)"
echo "  mobile  ${MDIM}  ${MW}  (~${MAVG} KB/frame)"
echo "  scene starts (0-based): ${STARTS[*]}"
echo "  manifest → public/frames/manifest.json"
