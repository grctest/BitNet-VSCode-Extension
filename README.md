# BitNet VSCode Extension

This VSCode extension fully automates the deployment and management of the [FastAPI-BitNet](https://github.com/grctest/FastAPI-BitNet) backend. It runs the powerful REST API inside a Docker container and exposes its capabilities directly to GitHub Copilot Chat as a set of tools.

With this extension, you can initialize, manage, and communicate with multiple BitNet model instances (both `llama-server` and persistent `llama-cli` sessions) directly from your editor's chat panel.

## Core Features

This extension empowers GitHub Copilot with a rich set of tools to manage the entire lifecycle of BitNet instances.

*   **Automated Backend Management**:
    *   Automatically pulls the required Docker image from Docker Hub.
    *   Starts the Docker container with the FastAPI-BitNet service.
    *   Gracefully shuts down the container when you close VSCode.

*   **Seamless Copilot Integration**:
    *   Exposes all API endpoints as tools for GitHub Copilot via the Model Context Protocol (MCP).

*   **Resource & Server Management (`llama-server`)**:
    *   **Estimate Capacity**: Check how many servers can be run based on available RAM and CPU.
    *   **Initialize/Shutdown**: Start and stop single or multiple `llama-server` instances in batches.
    *   **Check Status**: Query the status, PID, and configuration of any running server.

*   **Persistent CLI Session Management (`llama-cli`)**:
    *   **Start/Stop Sessions**: Create and terminate persistent, conversational `llama-cli` processes, each identified by a unique alias.
    *   **Batch Operations**: Manage multiple CLI sessions with a single command.
    *   **Check Status**: Get the status and configuration of any active CLI session.

*   **Advanced Interaction**:
    *   **Chat**: Send prompts to specific `llama-server` instances.
    *   **Multi-Chat**: Broadcast a prompt to multiple servers concurrently and get all responses.
    *   **Conversational Chat**: Maintain an ongoing conversation with a persistent `llama-cli` session.

*   **Model Utilities**:
    *   **Benchmark**: Programmatically run `llama-bench` to evaluate model performance.
    *   **Perplexity**: Calculate model perplexity for a given text using `llama-perplexity`.
    *   **Model Info**: Get the file sizes of all available BitNet models.

## Requirements

*   **Docker Desktop**: You must have Docker installed and running on your computer.
*   **Disk Space**: At least **8GB** of free disk space is required for the uncompressed Docker image.
*   **RAM**: Each BitNet instance consumes ~1.5GB of RAM. While this is manageable for a few instances, it can add up quickly. Ensure your system has enough memory for the number of instances you plan to run.

## Setup Instructions

1.  Install this extension from the VSCode Marketplace.
2.  Ensure Docker Desktop is running.
3.  Open the VSCode Command Palette using `Ctrl+Shift+P`.
4.  Type `BitNet: Initialize MCP Server` and press Enter. This will download the large Docker image and may take some time.
5.  Once initialization is complete, run `BitNet: Start Server` from the Command Palette.
6.  Open the GitHub Copilot Chat panel (it must be in "Chat" view, not "Inline Chat").
7.  Click the wrench icon (**Configure Tools...**) at the top of the chat panel.
8.  Scroll to the bottom and select **+ Add MCP Server**, then choose **HTTP**.
9.  Enter the URL: `http://127.0.0.1:8080/mcp`
10. Copilot will now detect the available tools. You may need to click the refresh icon next to the wrench if they don't appear immediately.

## AI Chat Instructions & Examples

Once set up, you can instruct GitHub Copilot to use the new tools. You can always ask "What tools can you use?" to get a fresh list of available actions.

### 1. Estimate Server Capacity

Before starting, see what your system can handle.

> **Your Prompt:** "Estimate how many BitNet servers I can run."

### 2. Manage `llama-server` Instances

You're able to launch one/many llama-server processes, however cnv/instruction mode is currently unsupported.

> **Start a single server:** "Initialize a BitNet server, with 1 thread each, and a system prompt of you're a helpful assistant."
>
> **Start multiple servers:** "Initialize a batch of two BitNet servers. The first on port 9001 with 2 threads and the second on port 9002 with 2 threads, with system prompts of you're a helpful assistant."
>
> **Check status:** "What is the status of the server on port 9001?"
>
> **Shut down a server:** "Shut down the server on port 9002."

### 3. Manage Persistent `llama-cli` Sessions

You're able to launch one/many llama-cli processes which fully support cnv/instruction mode by default!

> **Start a session:** "Start a persistent llama-cli session with the alias 'research-chat' using the default model, with 1 thread each, and a system prompt of you're a helpful assistant."
>
> **Start many sessions:** "Start 5 llama-cli sessions, with 1 thread each, and a system prompt of you're a helpful assistant."
>
> **Check status:** "What is the status of the llama-cli session 'research-chat'?"
>
> **Shut down a session:** "Stop the llama-cli session named 'research-chat'."

### 4. Chat with Models

You can talk to servers or conversational CLI sessions.

> **Chat with a server:** "Using the server on port 9000, tell me about the BitNet architecture."
>
> **Multi-chat with servers:** "Ask both the server on port 9000 and the server on port 9001 to explain the concept of perplexity. Compare their answers."
>
> **Chat with a CLI session:** "Using the llama-cli session 'research-chat', what is the capial of France?"

### 5. Run Utilities

Analyze model performance directly from the chat.

> **Run a benchmark:** "Run a benchmark on the default BitNet model with 128 tokens and 4 threads."
>
> **Calculate perplexity:** "Calculate the perplexity of the text 'The quick brown fox jumps over the lazy dog' using the default model and a context size of 10."
