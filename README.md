# BitNet-VSCode-Extension

This is a VSCode extension which introduces [Microsoft's BitNet LLM](https://github.com/microsoft/BitNet) as a model context provider exposed REST API.

This enables you to initialize and communicate with multiple BitNet servers from within VSCode's GitHub Copilot panel, specifically with Microsoft's [BitNet b1.58 2B4T](https://huggingface.co/microsoft/bitnet-b1.58-2B-4T) model!

Check it out on the Microsoft VSCode extension marketplace: https://marketplace.visualstudio.com/items?itemName=nftea-gallery.bitnet-vscode-extension

## Requirements

You must have docker installed on your computer, otherwise the extension won't work!

You must have at least 8GB of disk space, whilst the dockerfile is 2GB compressed it's closer to 8GB when uncompressed!

Each BitNet server instance will consume several hundred megabytes of RAM, so make sure you have enough RAM for the quantity of BitNet servers you initialize.

## Features

Pulls the docker image from the docker hub repository.

Creates a docker container using the pulled docker image.

The docker container hosts the [FastAPI-BitNet](https://github.com/grctest/FastAPI-BitNet) REST API, which enables you to:
1. Create one/many BitNet server instances.
2. Communicate with one/many BitNet servers in parallel.
3. Integrates with GitHub Copilot, enabling the AI to launch the servers and communicate with them.
4. Run performance and perplexity benchmarks against the BitNet model.
5. Check the BitNet server statuses.
6. Estimate how many BitNet servers you can run and chat with.
7. Shut down LLM server instances via chat.
8. Fetches docker images, creates docker containers, handles container deletion and image updating via extension commands.

Shuts down the docker container when you close VSCode.

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

### Step 0: Check how many BitNet servers your computer can handle

Each BitNet server instance consumes around 1.5GB of RAM, and at a minimum 1 CPU thread each.

You can request an estimate:

![image](https://github.com/user-attachments/assets/7451398d-5754-49a1-bf7c-e664e2ad9686)


### Step 1: Initialize the BitNet servers!

Ask copilot to launch several BitNet servers, specifying the quantity of threads per server and a general system prompt direction.

![GtHLN45WkAA9dLN](https://github.com/user-attachments/assets/fbc02b5b-b92d-49d5-bd75-9d797240baa6)

### Step 2: Optionally check on the status of the BitNet servers you initialized

You can easily ask for a status check on all of the servers - expanding the server response will show how much resources they're consuming each too.

![GtKVqPDWMAAcTiR](https://github.com/user-attachments/assets/769ab617-71f0-4be7-a63f-c6194e0dae7d)

### Step 3: Chat with the BitNet servers!

With the BitNet servers now up and running you can easily chat with the mixture of experts style BitNet server arrangement at will:

![GtKUxzrWUAAGDU2](https://github.com/user-attachments/assets/9157963b-33d7-4842-8f38-6f5ce80473b3)

You will likely be able to initialize more servers than you can chat with, as RAM is more abundant than CPU threads, so please bear in mind the limitations of your computer when running your mixture of experts BitNet setup.
