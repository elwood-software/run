# Elwood Run

<p> 🚨 Elwood Run is currently in public <strong>ALPHA</strong> and NOT ready for Production. 🚨 <br/>
We are actively developing the code and things will change quickly. If you have any questions, please reach out to us at <a href="mailto:hello@elwood.software">hello@elwood.software</a>.</p>

## Example Workflow
```yaml
# yaml-language-server: $schema=../schema.json

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
  expressions:
    steps:
      - action: "echo"
        input:
          content: ${{ step.name }}
      - action: "echo"
        input:
          content: ${{ "awesome".toUpperCase() }}
  output:
    steps:
      - name: whoami
        run: echo "name=Mr. Awesome" >> $ELWOOD_OUTPUT
      - action: echo
        input:
          content: ${{ steps.whoami.outputs.name }}
```

You can run this example in docker using:
```bash
deno task up
```

## :raised_hand: Support

- [Community Forum](https://github.com/orgs/elwood-software/discussions): Good for developer discussion, help debugging, ask questions. **Not sure, start here**
- [Discord](https://discord.gg/mkhKk5db): Join our Discord Server
- [GitHub Issues](https://github.com/elwood-software/elwood/issues): Good for bugs and errors in running Elwood locally
- [Email Support](mailto:support@elwood.software): Good for saying hi

## 🏛️ License

Distributed under the Apache-2.0 license. See [LICENSE](LICENSE) for more information.

## 📧 Contact

Elwood - [support@elwood.software](mailto:support@elwood.software)
