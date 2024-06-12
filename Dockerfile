FROM public.ecr.aws/amazonlinux/amazonlinux:latest


RUN yum -y update \
    # systemd is not a hard requirement for Amazon ECS Anywhere, but the installation script currently only supports systemd to run.
    # Amazon ECS Anywhere can be used without systemd, if you set up your nodes and register them into your ECS cluster **without** the installation script.
    && yum -y install systemd unzip tar xz which git python python-pip \
    && yum clean all \ 
    && rm -rf /var/cache/yum \
    && ln -sf /usr/bin/pip3 /usr/bin/pip \
    && ln -sf /usr/bin/python3 /usr/bin/python

RUN groupadd -g 3982 -o elwood_runner
RUN useradd -m -u 3982 -g 3982 -o -s /bin/bash elwood_runner

RUN mkdir -p /elwood/runner/bin \
             /elwood/runner/workspace \
             /elwood/runner/runtime \ 
             /elwood/runner/workspace/shared-cache

COPY ./actions /elwood/runner/actions
COPY ./src /elwood/runner/runtime
COPY ./deno.json /elwood/runner/deno.json
COPY ./deno.lock /elwood/runner/deno.lock

RUN curl -fsSL https://deno.land/install.sh | DENO_DIR=/elwood/runner/deno-data DENO_INSTALL=/elwood/runner /bin/sh 

RUN chown -R 3982:3982 /elwood/runner/workspace
RUN chmod -R 777 /elwood/runner/workspace


ENV ELWOOD_RUNNER_ROOT /elwood/runner
ENV ELWOOD_RUNNER_WORKSPACE_DIR /elwood/runner/workspace
ENV ELWOOD_RUNNER_EXECUTION_UID 3982
ENV ELWOOD_RUNNER_EXECUTION_GID 3982
ENV XDG_CACHE_HOME /elwood/runner/workspace/shared-cache
ENV XDG_CONFIG_DIRS /elwood/runner/workspace/shared-cache
ENV HOME /elwood/runner/workspace/shared-cache

RUN ls -lash /elwood/runner/runtime

RUN tar --version
RUN curl --version
RUN unzip -v
RUN python --version
RUN pip --version
RUN /elwood/runner/bin/deno --version

HEALTHCHECK --interval=1m --timeout=3s CMD curl -f http://localhost:8000 || exit 1

ENTRYPOINT ["/elwood/runner/bin/deno", "--quiet", "run", "--config", "/elwood/runner/deno.json", "-A", "--unstable-worker-options", "/elwood/runner/runtime/launch.ts"]

CMD ["serve"]