#!/bin/sh
# Copyright 2024 Elwood Technology, LLC
# inspired by the amazing https://deno.land/x/install@v0.3.1/install.sh?source=
# questions: hello@elwood.technology

set -e

if ! command -v unzip >/dev/null && ! command -v 7z >/dev/null; then
	echo "Error: either unzip or 7z is required to install FFremote." 1>&2
	exit 1
fi

if [ "$OS" = "Windows_NT" ]; then
	target="x86_64-pc-windows-msvc"
else
	case $(uname -sm) in
	"Darwin x86_64") target="x86_64-apple-darwin" ;;
	"Darwin arm64") target="aarch64-apple-darwin" ;;
	"Linux aarch64") target="aarch64-unknown-linux-gnu" ;;
	*) target="x86_64-unknown-linux-gnu" ;;
	esac
fi

print_help_and_exit() {
	echo "Setup script for installing ffr

Options:
  -h, --help
    Print help
"
	exit 0
}

for arg in "$@"; do
	case "$arg" in
	"-h")
		print_help_and_exit
		;;
	"--help")
		print_help_and_exit
		;;
	"-"*) ;;
	*)
		if [ -z "$ffr_version" ]; then
			ffr_version="$arg"
		fi
		;;
	esac
done

if [ -z "$ffr_version" ]; then
	ffr_version="$(curl -s https://elwood.run/ffremote/release/latest.txt)"
fi

ffr_uri="https://elwood.run/ffremote/release/${target}@${ffr_version}.zip"
ffr_install="${FFR_INSTALL:-$HOME/.elwood}"
bin_dir="$ffr_install/bin"
exe="$bin_dir/ffremote"

if [ ! -d "$bin_dir" ]; then
	mkdir -p "$bin_dir"
fi

curl --fail --location --progress-bar --output "$exe.zip" "$ffr_uri"
if command -v unzip >/dev/null; then
	unzip -d "$bin_dir" -o "$exe.zip"
else
	7z x -o "$bin_dir" -y "$exe.zip"
fi
chmod +x "$exe"
ln -sf "$exe" "$bin_dir/ffr"
rm "$exe.zip"

echo "FFremote was installed successfully to $exe"

if command -v ffr >/dev/null; then
	echo "Run 'ffr --help' to get started"
else
	echo "Run '$exe --help' to get started"
fi
echo
echo "Stuck? Join our Discord https://elwood.run/ffremote/discord"
