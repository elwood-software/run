#!/usr/bin/bash

mkdir ./ffmpeg
cd ../ffmpeg
wget https://www.johnvansickle.com/ffmpeg/old-releases/ffmpeg-4.2.1-amd64-static.tar.xz
tar xvf ffmpeg-4.2.1-amd64-static.tar.xz
mv ffmpeg-4.2.1-amd64-static/ffmpeg /usr/local/bin
ln -s /usr/local/bin/ffmpeg/ffmpeg /usr/bin/ffmpeg
/usr/local/bin/ffmpeg -version >/tmp/version.txt
cd ..
