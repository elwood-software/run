#!/usr/bin/bash 

# update the os
yum -y update
yum -y install systemd unzip tar xz which git python python-pip
yum clean all 
rm -rf /var/cache/yum
ln -sf /usr/bin/pip3 /usr/bin/pip
ln -sf /usr/bin/python3 /usr/bin/python

# add our runner user
groupadd -g 3982 -o elwood_runner 
useradd -m -u 3982 -g 3982 -o -s /bin/bash elwood_runner

# makle our important directories
mkdir -p /elwood/run/bin /elwood/run/runtime /elwood/run/runner/workspace /elwood/run/runner/bin

# install runtime for deno
curl -fsSL https://deno.land/install.sh | DENO_DIR=/elwood/run/deno-data DENO_INSTALL=/elwood/run /bin/sh 

#  install deno for the runner
RUN curl -fsSL https://deno.land/install.sh | DENO_DIR=/elwood/run/runner/deno-cache DENO_INSTALL=/elwood/run/runner /bin/sh 

chown -R 3982:3982 /elwood/run/runner
chmod -R 777 /elwood/run/runner/workspace
chmod -R 755 /elwood/run/runner/bin
