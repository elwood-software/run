# Elwood Run Workflow

## Example

```yaml
# yaml-language-server: $schema=https://elwood.run/schema.json

name: hello-world
jobs:
  echo:
    steps:
      # simple example uses bash to echo "hello world" to
      # standard output
      - run: echo "Hello, World!"
        description: "Prints 'Hello, World!' to stdout."

      # We can do the same thing with the "echo" action
      # You an check out the echo action in ../actions/echo.ts
      - action: "echo"
        description: "Prints 'Hello, World!' to stdout."
        input:
          content: "Hello, World!"
```
