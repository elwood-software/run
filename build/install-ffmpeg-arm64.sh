#!/usr/bin/bash 

mkdir ./ffmpeg
cd ../ffmpeg
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-static.tar.xz
tar xvf ffmpeg-release-arm64-static.tar.xz
mv ffmpeg-7.0.2-arm64-static/ffmpeg /usr/local/bin
ln -s /usr/local/bin/ffmpeg/ffmpeg /usr/bin/ffmpeg
cd ..
