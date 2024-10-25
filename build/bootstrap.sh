#!/usr/bin/bash 

# update the os
yum -y update
yum -y install systemd unzip tar xz which git python python-pip
yum clean all 
rm -rf /var/cache/yum
ln -sf /usr/bin/pip3 /usr/bin/pip
ln -sf /usr/bin/python3 /usr/bin/python

mkdir ./ffmpeg
cd ../ffmpeg
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-arm64-static.tar.xz
tar xvf ffmpeg-release-arm64-static.tar.xz
mv ffmpeg-7.0.2-arm64-static/ffmpeg /usr/local/bin
ln -s /usr/local/bin/ffmpeg/ffmpeg /usr/bin/ffmpeg
cd ..

# add our runner user
groupadd -g 3982 -o elwood_runner 
useradd -m -u 3982 -g 3982 -o -s /bin/bash elwood_runner

# makle our important directories
mkdir -p /elwood/run/bin /elwood/run/runner/workspace /elwood/run/runner/bin

#  install deno for the runner
curl -fsSL https://deno.land/install.sh | DENO_DIR=/elwood/run/runner/deno-cache DENO_INSTALL=/elwood/run/runner /bin/sh 

chown -R 3982:3982 /elwood/run/runner
chmod -R 777 /elwood/run/runner/workspace
chmod -R 755 /elwood/run/runner/bin
