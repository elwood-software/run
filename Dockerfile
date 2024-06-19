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

RUN mkdir -p /elwood/run/bin \
             /elwood/run/runtime \
             /elwood/run/runner/workspace \             
             /elwood/run/runner/bin

COPY ./actions /elwood/run/actions
COPY ./src /elwood/run/runtime
COPY ./deno.json /elwood/run/deno.json
COPY ./deno.lock /elwood/run/deno.lock

# runtime deno
RUN curl -fsSL https://deno.land/install.sh | DENO_DIR=/elwood/run/deno-data DENO_INSTALL=/elwood/run /bin/sh 

# worker deno
RUN curl -fsSL https://deno.land/install.sh | DENO_DIR=/elwood/run/runner/deno-cache DENO_INSTALL=/elwood/run/runner /bin/sh 


RUN chown -R 3982:3982 /elwood/run/runner
RUN chmod -R 777 /elwood/run/runner/workspace
RUN chmod -R 755 /elwood/run/runner/bin

ENV ELWOOD_RUNNER_ROOT /elwood/run
ENV ELWOOD_RUNNER_WORKSPACE_DIR /elwood/run/runner/workspace
ENV ELWOOD_RUNNER_EXECUTION_UID 3982
ENV ELWOOD_RUNNER_EXECUTION_GID 3982
ENV ELWOOD_RUNNER_DENO_BIN /elwood/run/runner/bin/deno


RUN tar --version
RUN curl --version
RUN unzip -v
RUN python --version
RUN pip --version
RUN /elwood/run/bin/deno --version

ENTRYPOINT ["/elwood/run/bin/deno", "--quiet", "run", "--config", "/elwood/run/deno.json", "-A", "--unstable-worker-options", "/elwood/run/runtime/launch.ts"]

CMD ["serve"]