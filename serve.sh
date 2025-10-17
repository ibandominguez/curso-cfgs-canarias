#!/usr/bin/env sh

DIR="$(cd "$(dirname "$0")" && pwd)"
DIR_NAME="$(basename "$DIR")"

cd "$DIR/.."
php -S localhost:8000 &
xdg-open "http://localhost:8000/$DIR_NAME/"

