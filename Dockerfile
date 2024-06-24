
## COMPILER
FROM public.ecr.aws/amazonlinux/amazonlinux:latest as compiler

RUN yum -y update \
    && yum -y install unzip
RUN mkdir -p /elwood/run-compiler

# compliele and install deno
RUN curl -fsSL https://deno.land/install.sh | /bin/sh 

COPY ./src /elwood/run-compiler/src
COPY ./deno.json /elwood/run-compiler/src/deno.json
COPY ./deno.lock /elwood/run-compiler/src/deno.lock

RUN cd /elwood/run-compiler/src \
    && ~/.deno/bin/deno compile -A --unstable-worker-options --include ./libs/expression/worker.ts -o ../runtime ./launch.ts


## ENV
FROM public.ecr.aws/amazonlinux/amazonlinux:latest

# set some environment variables
ENV ELWOOD_RUNNER_ROOT /elwood/run
ENV ELWOOD_RUNNER_WORKSPACE_DIR /elwood/run/runner/workspace
ENV ELWOOD_RUNNER_EXECUTION_UID 3982
ENV ELWOOD_RUNNER_EXECUTION_GID 3982
ENV ELWOOD_RUNNER_DENO_BIN /elwood/run/runner/bin/deno


RUN mkdir -p /elwood/build

COPY ./build/bootstrap.sh /elwood/build/bootstrap.sh

RUN chmod +x /elwood/build/bootstrap.sh \
    && ./elwood/build/bootstrap.sh \ 
    && rm -r /elwood/build

COPY --from=compiler /elwood/run-compiler/runtime /elwood/run/bin/runtime

COPY ./actions /elwood/run/actions

RUN tar --version \
    && curl --version \
    && unzip -v \
    && python --version \
    && pip --version \
    && /elwood/run/bin/runtime --version 

ENTRYPOINT ["/elwood/run/bin/runtime"]

CMD ["serve"]