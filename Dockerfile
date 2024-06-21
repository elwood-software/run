FROM public.ecr.aws/amazonlinux/amazonlinux:latest

# set some environment variables
ENV ELWOOD_RUNNER_ROOT /elwood/run
ENV ELWOOD_RUNNER_WORKSPACE_DIR /elwood/run/runner/workspace
ENV ELWOOD_RUNNER_EXECUTION_UID 3982
ENV ELWOOD_RUNNER_EXECUTION_GID 3982
ENV ELWOOD_RUNNER_DENO_BIN /elwood/run/runner/bin/deno

RUN mkdir -p /elwood/build

COPY ./build/build.sh /elwood/build/build.sh

RUN chmod +x /elwood/build/build.sh \
    && ./elwood/build/build.sh

COPY ./actions /elwood/run/actions
COPY ./src /elwood/run/runtime
COPY ./deno.json /elwood/run/deno.json
COPY ./deno.lock /elwood/run/deno.lock

RUN tar --version \
    && curl --version \
    && unzip -v \
    && python --version \
    && pip --version \
    && /elwood/run/bin/deno --version 

# remove the builder
RUN rm -r /elwood/build

ENTRYPOINT ["/elwood/run/bin/deno", "--quiet", "run", "--config", "/elwood/run/deno.json", "-A", "--unstable-worker-options", "/elwood/run/runtime/launch.ts"]

CMD ["serve"]