# Elwood Run Documentation

## 🚀 Quick Start


## Run your first workflow
```bash
deno task cli ./workflows/hello-world.yml
```

Will output something similar to:
```
[6f3b7634-5386-4c27-80ba-d4201d3bf4e6.J2JD2ED.S1TJD547] Hello, World! (bash)
[6f3b7634-5386-4c27-80ba-d4201d3bf4e6.J2JD2ED.S9JJDC22] Hello, World! (deno)
[6f3b7634-5386-4c27-80ba-d4201d3bf4e6.J2JD2ED.S2TTJB747] Hello, World! (echo)
[6f3b7634-5386-4c27-80ba-d4201d3bf4e6.J3JTJ3864.S1JJJA4F2] Hello World (output)
```

## The Workflow Configuration
The workflow configuration is a yaml file that describes the steps to be executed in a
specific order.

```yaml
# yaml-language-server: $schema=../schema/workflow.json

name: hello-world
description: ":wave: Hello, World! in so many ways"

jobs:
  # A bunch of ways to say hello!
  echo:
    steps:
      # simple example uses bash to echo "hello world" to
      # standard output using bash
      - run: echo "Hello, World! (bash)"
        input:
          bin: "bash"

      # We can also use deno instead of bash
      - run: "Deno.stdout.write(new TextEncoder().encode('Hello, World! (deno)'));"

      # We can do the same thing with the "echo" action
      # You an check out the echo action in ../actions/echo.ts
      - action: "echo"
        input:
          content: "Hello, World! (echo)"

  # Use outputs to say the same thing
  outputs:
    steps:
      # first we use $ELWOOD_OUTPUT to write to the output file
      - name: say_what
        run: echo "say=Hello World (output)" >> $ELWOOD_OUTPUT
        input:
          bin: "bash"

      # then we say hello
      - action: echo
        input:
          content: ${{ steps.say_what.outputs.say }}
```
