# Elwood Run Actions
Actions are the building blocks of Elwood Run. They are small, reusable, and composable units of work that can be combined to create workflows. Find out more at [elwood.run](https://elwood.run)

## Documentation
Read the full documentation at [elwood.run/docs](https://elwood.run/docs)

## Standard Actions

 - [echo](./echo.ts) - Print a message to the console
 - [run](./run.ts) - Run a command or execute script code
 - install
   - [ffmpeg](./install/ffmpeg.ts) - Install the ffmpeg & ffprobe
   - [whisper](./install/whisper.ts) - Install the OpenAI's Whisper
 - fs
   - [copy](./fs/copy.ts) - Copy files and directories
   - [mkdir](./fs/mkdir.ts) - Create a directory
   - [read](./fs/read.ts) - Read a file to an output or stdout
   - [write](./fs/write.ts) - Write data to a file

## SDK
The Elwood Run Action SDK provides reusable helpers to make developing actions easier. 

### Installation
```bash
# jsr
jsr add @elwood/run-action-sdk

# deno 
deno add @elwood/run-action-sdk

# npm
npx jsr add @elwood/run-action-sdk
```

### Usage
```deno
# import the SDK
import { sdk } from "https://x.elwood.run/a/sdk@latest.ts"

# using JSR
import { sdk } from "jsr:@elwood/run-action-sdk"


# get an input variable
const value = await sdk.input.get("name")
```

### API
   - [args](./_sdk//args.ts) - Action Arguments
   - [command](./_sdk/command.ts) - Execute Commands
   - [fetch](./_sdk/fetch.ts) - Fetch Data
   - [fs](./_sdk/fs.ts) - File System
   - [input](./_sdk/input.ts) - Action Input Variables
   - [install](./_sdk/install.ts) - Install Dependencies
   - [io](./_sdk/io.ts) - Standard Input/Output
   - [output](./_sdk/output.ts) - Action Output Variables
   - [path](./_sdk/path.ts) - Path Helpers