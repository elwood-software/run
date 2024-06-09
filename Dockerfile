FROM amazonlinux:2


RUN yum -y update \
    # systemd is not a hard requirement for Amazon ECS Anywhere, but the installation script currently only supports systemd to run.
    # Amazon ECS Anywhere can be used without systemd, if you set up your nodes and register them into your ECS cluster **without** the installation script.
    && yum -y install systemd unzip tar xz curl \
    && yum clean all

RUN groupadd -g 3982 -o elwood_runner
RUN useradd -m -u 3982 -g 3982 -o -s /bin/bash elwood_runner

RUN mkdir -p /elwood/runner/bin \
             /elwood/runner/workspace \
             /elwood/runner/workspace-bin

RUN curl -fsSL https://deno.land/install.sh | DENO_DIR=/elwood/runner/deno-data DENO_INSTALL=/elwood/runner /bin/sh 

RUN chown -R elwood_runner:elwood_runner /elwood/runner/workspace

ENV ELWOOD_RUNNER_ROOT /elwood/runner
ENV ELWOOD_RUNNER_WORKSPACE_DIR /elwood/runner/workspace
ENV ELWOOD_RUNNER_EXECUTION_UID 3982
ENV ELWOOD_RUNNER_EXECUTION_GID 3982

RUN  tar --version