# bitnet-vscode-extension README

This is the README for your extension "bitnet-vscode-extension". After writing up a brief description, we recommend including the following sections.

## Features

Pulls the docker image from the docker hub repository.

Creates a docker container using the pulled docker image.

The docker container hosts the [FastAPI-BitNet](https://github.com/grctest/FastAPI-BitNet) REST API, which enables you to:
1. Create one/many BitNet server instances.
2. Communicate with one/many BitNet servers in parallel.
3. Integrates with GitHub Copilot, enabling the AI to launch the servers and communicate with them.
4. Run performance and perplexity benchmarks against the BitNet model.
5. Check the BitNet server statuses.

Shuts down the docker container when you close VSCode.

## Requirements

You must have docker installed on your computer, otherwise the extension won't work!

You must have at least 8GB of disk space, whilst the dockerfile is 2GB compressed it's closer to 8GB when uncompressed!

Each BitNet server instance will consume several hundred megabytes of RAM, so make sure you have enough RAM for the quantity of BitNet servers you initialize.

## Setup Instructions

Install this extension, as well as the docker package dependencies (docker on desktop - windows).

Within VSCode press "CTRL + Shift + P" this will launch a command prompt within VSCode!

Within this prompt type 'BitNet' and this extension's commands will shown!

Click 'BitNet: Initialize MCP Server' - This will take a while as it downloads the docker image!

Once it has complete pulling the image, click 'BitNet: Start Server'

Now you must launch the GitHub copilot panel, switch to "Agent" mode away from "Ask" mode, then click the wrench icon "Configure Tools...".

In the tool configuration overview scroll to the bottom and select 'Add more tools...' then '+ Add MCP Server' then 'HTTP'.

Enter into the URL field `http://127.0.0.1:8080/mcp` then your copilot will be able to launch new bitnet server instances and chat with them.

If you see a small red icon next to the 'configure tools' button this is to 'refresh' to detect the endpoints.

If all has gone as planned now your GitHub copilot can communicate with the REST API and it should have detected several 'tools' for the AI to take advantage of.

## AI Chat instructions

After you've followed the setup intructions and the tools have been found by Copilot, you can proceed to use it!

### Step 1: Initialize the BitNet servers!

Ask copilot to launch several servers, best to remind it of the format in the query:
```
    threads: int = Query(os.cpu_count() // 2, gt=0, le=os.cpu_count()),
    ctx_size: int = Query(2048, gt=0),
    port: int = Query(8081, gt=1023),
    system_prompt: str = Query("You are a helpful assistant.", description="Unique system prompt for this server instance"),
    n_predict: int = Query(4096, gt=0, description="Number of tokens to predict for the server instance"),
    temperature: float = Query(0.8, gt=0.0, le=2.0, description="Temperature for sampling")
```

### Step 2: Chat with the BitNet servers!

Each server will have a different port within the dockerfile, when you 'chat' with one of the servers you'll need to provide the port to maintain the conversation with that BitNet server.

When querying the BitNet servers you can remind the AI of the full possible format:
```
    message: str
    port: int = 8081
    threads: int = 1
    ctx_size: int = 2048
    n_predict: int = 256
    temperature: float = 0.8
```

This enables you to pick the specific BitNet server you want to query, but also to change the other fields that are set on BitNet server initialization.

You can both query an individual BitNet server, or query many BitNet servers in parallel through the multi-chat endpoint that's exposed to Copilot (when you ask to perform a multi-chat, not an individual server query).