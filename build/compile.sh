#!/usr/bin/bash 

yum -y update
yum -y install unzip

mkdir -p /elwood/run-compiler

# compliele and install deno
curl -fsSL https://deno.land/install.sh | /bin/sh 

cd /elwood/run-compiler/src
  
~/.deno/bin/deno compile -A --unstable-worker-options --include ./libs/expression/worker.ts -o ../runtime ./launch.ts
