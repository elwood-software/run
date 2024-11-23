#!/usr/bin/bash

mkdir ./ffmpeg
cd ../ffmpeg
wget https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz
tar xvf ffmpeg-master-latest-linux64-gpl.tar.xz
mv ffmpeg-master-latest-linux64-gpl/bin/* /usr/local/bin
ln -s /usr/local/bin/ffmpeg /usr/bin/ffmpeg
cp ffmpeg-master-latest-linux64-gpl/LICENSE.txt /tmp/LICENSE.txt
/usr/local/bin/ffmpeg -version >/tmp/version.txt
cd ..
