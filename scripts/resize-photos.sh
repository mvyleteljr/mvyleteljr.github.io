#!/usr/bin/env bash
#
# Resize photos for the web and drop them in img/ (ready to commit).
# Uses macOS's built-in `sips` — no installs needed.
#
# Usage:
#   ./scripts/resize-photos.sh SOURCE_DIR
#
# Example:
#   ./scripts/resize-photos.sh ~/Desktop/lr-export
#
# Tweak the two knobs below to taste.

set -euo pipefail

MAX=2000      # longest edge, in pixels
QUALITY=82    # JPEG quality, 0-100

SRC="${1:-}"
DEST="img"

if [ -z "$SRC" ] || [ ! -d "$SRC" ]; then
  echo "Source folder '$SRC' not found." >&2
  echo "Usage: ./scripts/resize-photos.sh SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$DEST"
shopt -s nullglob nocaseglob

count=0
for f in "$SRC"/*.jpg "$SRC"/*.jpeg; do
  name="$(basename "$f")"
  out="$DEST/${name%.*}.jpg"
  sips -s format jpeg -s formatOptions "$QUALITY" \
       --resampleHeightWidthMax "$MAX" "$f" --out "$out" >/dev/null
  echo "  $name  ->  $out  ($(du -h "$out" | cut -f1 | tr -d ' '))"
  count=$((count + 1))
done

shopt -u nullglob nocaseglob

if [ "$count" -eq 0 ]; then
  echo "No .jpg/.jpeg files found in '$SRC'."
else
  echo "Done — resized $count photo(s) into $DEST/ (max ${MAX}px, quality ${QUALITY})."
fi
