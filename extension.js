// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// --- Constants for Docker MCP Server Management ---
const DOCKER_IMAGE_NAME = 'grctest/fastapi_bitnet:latest';
const CONTAINER_NAME = 'ai_container';
const MCP_PORT = 8080;
// const DOCKER_EXTENSION_ID = 'ms-azuretools.vscode-docker';

// --- Docker utility functions (migrated from docker/*.ts) ---
const { execFile } = require('child_process');

// ...existing code...

async function pullDockerImage(imageName) {
    console.log(`[BitNet] pullDockerImage called with imageName: ${imageName}`);
    return new Promise((resolve, reject) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Pulling Docker image: ${imageName}`,
            cancellable: false
        }, async () => {
            execFile('docker', ['pull', imageName], (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to pull image '${imageName}': ${stderr || error.message}`);
                    console.error(`[BitNet] Error pulling image '${imageName}':`, error, stderr);
                    reject(error);
                } else {
                    vscode.window.showInformationMessage(`Successfully pulled image: '${imageName}'`);
                    console.log(`[BitNet] Docker Pull Output for ${imageName}:\n${stdout}`);
                    resolve();
                }
            });
        });
    });
}

async function runDockerContainer(imageName, containerName, ports = [], detached = true, envVars = []) {
    console.log(`[BitNet] runDockerContainer called with imageName: ${imageName}, containerName: ${containerName}, ports: ${JSON.stringify(ports)}, detached: ${detached}, envVars: ${JSON.stringify(envVars)}`);
    return new Promise((resolve, reject) => {
        const args = ['run', '--name', containerName];
        if (detached) args.push('-d');
        ports.forEach(p => args.push('-p', p));
        envVars.forEach(e => args.push('-e', e));
        args.push(imageName);

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Running Docker image: '${imageName}' as '${containerName}'`,
            cancellable: false
        }, async () => {
            execFile('docker', args, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to run image '${imageName}': ${stderr || error.message}`);
                    console.error(`[BitNet] Error running container '${containerName}':`, error, stderr);
                    reject(error);
                } else {
                    vscode.window.showInformationMessage(`Container '${containerName}' is running.`);
                    console.log(`[BitNet] Docker Run Output for ${containerName}:\n${stdout}`);
                    resolve();
                }
            });
        });
    });
}

// ...existing code...

class DockerManager {
    /**
     * Pulls the required Docker image using the Docker CLI.
     */
    static async ensureDockerImageIsPresent(imageName) {
        console.log(`[BitNet] ensureDockerImageIsPresent called with imageName: ${imageName}`);
        try {
            await pullDockerImage(imageName);
            return true;
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to pull Docker image '${imageName}': ${err.message}`);
            console.error(`[BitNet] Error in ensureDockerImageIsPresent:`, err);
            return false;
        }
    }

    /**
     * Starts the MCP Docker server using the Docker CLI.
     */
    static async startMcpServer() {
        console.log('[BitNet] startMcpServer called');
        try {
            const imagePresent = await DockerManager.ensureDockerImageIsPresent(DOCKER_IMAGE_NAME);
            if (!imagePresent) {
                console.log('[BitNet] Docker image not present, aborting startMcpServer');
                return;
            }

            // Check container status
            const { execFile } = require('child_process');
            execFile('docker', ['ps', '-a', '--filter', `name=${CONTAINER_NAME}`, '--format', '{{.Names}}:{{.Status}}'], async (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to check container status: ${stderr || error.message}`);
                    console.error('[BitNet] Error checking container status:', error, stderr);
                    return;
                }
                const statusLine = stdout.trim();
                if (!statusLine) {
                    vscode.window.showWarningMessage(`Container '${CONTAINER_NAME}' does not exist. Please run the initialization command first.`);
                    console.log(`[BitNet] Container '${CONTAINER_NAME}' does not exist.`);
                    return;
                }
                // statusLine example: ai_container:Exited (0) 2 minutes ago
                if (/Up/.test(statusLine)) {
                    vscode.window.showInformationMessage(`Docker container '${CONTAINER_NAME}' is already running.`);
                    console.log(`[BitNet] Docker container '${CONTAINER_NAME}' is already running.`);
                    return;
                }
                // If container exists but is not running, start it
                execFile('docker', ['start', CONTAINER_NAME], (startErr, startStdout, startStderr) => {
                    if (startErr) {
                        vscode.window.showErrorMessage(`Failed to start Docker container '${CONTAINER_NAME}': ${startStderr || startErr.message}`);
                        console.error(`[BitNet] Error starting container '${CONTAINER_NAME}':`, startErr, startStderr);
                        return;
                    }
                    vscode.window.showInformationMessage(`Docker container "${CONTAINER_NAME}" started successfully and is hosting MCP server on http://127.0.0.1:${MCP_PORT}.`);
                    console.log(`[BitNet] Docker container "${CONTAINER_NAME}" started successfully.`);
                });
            });
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to start MCP server: ${err.message}`);
            console.error('[BitNet] Error starting MCP server:', err);
        }
    }

    /**
     * Removes the MCP Docker container using the Docker CLI.
     */
    static async removeDockerContainer() {
        console.log('[BitNet] removeDockerContainer called');
        const { execFile } = require('child_process');
        return new Promise((resolve) => {
            execFile('docker', ['rm', '-f', CONTAINER_NAME], (error, stdout, stderr) => {
                if (error && !stderr.includes('No such container')) {
                    vscode.window.showWarningMessage(`Failed to remove Docker container '${CONTAINER_NAME}': ${stderr || error.message}`);
                    console.error(`[BitNet] Error removing container '${CONTAINER_NAME}':`, error, stderr);
                } else if (!error) {
                    vscode.window.showInformationMessage(`Docker container '${CONTAINER_NAME}' removed.`);
                    console.log(`[BitNet] Docker container '${CONTAINER_NAME}' removed.`);
                }
                resolve();
            });
        });
    }

    /**
     * Removes the MCP Docker image using the Docker CLI.
     */
    static async removeDockerImage() {
        console.log('[BitNet] removeDockerImage called');
        const { execFile } = require('child_process');
        execFile('docker', ['rmi', '-f', DOCKER_IMAGE_NAME], (error, stdout, stderr) => {
            if (error && !stderr.includes('No such image')) {
                vscode.window.showWarningMessage(`Failed to remove Docker image '${DOCKER_IMAGE_NAME}': ${stderr || error.message}`);
                console.error(`[BitNet] Error removing image '${DOCKER_IMAGE_NAME}':`, error, stderr);
            } else if (!error) {
                vscode.window.showInformationMessage(`Docker image '${DOCKER_IMAGE_NAME}' removed.`);
                console.log(`[BitNet] Docker image '${DOCKER_IMAGE_NAME}' removed.`);
            }
        });
    }

    /**
     * Views the logs of the MCP Docker container using the Docker CLI.
     */
    static async viewMcpServerLogs() {
        console.log('[BitNet] viewMcpServerLogs called');
        const { execFile } = require('child_process');
        execFile('docker', ['logs', '--tail', '100', CONTAINER_NAME], (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Failed to get logs: ${stderr || error.message}`);
                console.error(`[BitNet] Error getting logs for '${CONTAINER_NAME}':`, error, stderr);
            } else {
                vscode.workspace.openTextDocument({ content: stdout, language: 'log' }).then(doc => {
                    vscode.window.showTextDocument(doc, { preview: false });
                });
                vscode.window.showInformationMessage(`Logs for '${CONTAINER_NAME}' displayed.`);
                console.log(`[BitNet] Logs for '${CONTAINER_NAME}' displayed.`);
            }
        });
    }

    /**
     * Restarts the MCP server by stopping and then starting its container using the Docker CLI.
     */
    static async restartMcpServer() {
        console.log('[BitNet] restartMcpServer called');
        const { execFile } = require('child_process');
        execFile('docker', ['restart', CONTAINER_NAME], (error, stdout, stderr) => {
            if (error) {
                vscode.window.showWarningMessage(`Failed to restart Docker container '${CONTAINER_NAME}': ${stderr || error.message}`);
                console.error(`[BitNet] Error restarting container '${CONTAINER_NAME}':`, error, stderr);
            } else {
                vscode.window.showInformationMessage('MCP server restarted.');
                console.log('[BitNet] MCP server restarted.');
            }
        });
    }

    /**
     * Opens the MCP server URL in the default browser.
     */
    static async openMcpServerInBrowser() {
        console.log('[BitNet] openMcpServerInBrowser called');
        const url = `http://127.0.0.1:${MCP_PORT}`;
        try {
            await vscode.env.openExternal(vscode.Uri.parse(url));
            vscode.window.showInformationMessage(`Opening MCP Server in browser: ${url}`);
            console.log(`[BitNet] Opening MCP Server in browser: ${url}`);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to open browser: ${err.message}`);
            console.error('Error opening browser:', err);
            console.error('[BitNet] Error opening browser:', err);
        }
    }

    /**
     * Shows the current status of the MCP Docker server using the Docker CLI.
     */
    static async showMcpServerStatus() {
        console.log('[BitNet] showMcpServerStatus called');
        const { execFile } = require('child_process');
        execFile('docker', ['ps', '-a', '--filter', `name=${CONTAINER_NAME}`, '--format', '{{.Names}}: {{.Status}}'], (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Failed to get MCP server status: ${stderr || error.message}`);
                console.error(`[BitNet] Error getting MCP server status:`, error, stderr);
            } else if (stdout.trim()) {
                vscode.window.showInformationMessage(`MCP Server Status: ${stdout.trim()}`);
                console.log(`[BitNet] MCP Server Status: ${stdout.trim()}`);
            } else {
                vscode.window.showWarningMessage(`MCP Server Status: NOT RUNNING (No container found with name '${CONTAINER_NAME}').`);
                console.log(`[BitNet] MCP Server Status: NOT RUNNING (No container found with name '${CONTAINER_NAME}').`);
            }
        });
    }

    /**
     * Checks if the MCP Docker container is running using the Docker CLI.
     */
    static async checkDockerContainer() {
        console.log('[BitNet] checkDockerContainer called');
        const { execFile } = require('child_process');
        execFile('docker', ['ps', '--filter', `name=${CONTAINER_NAME}`, '--format', '{{.Names}}: {{.Status}}'], (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error checking Docker container: ${stderr || error.message}`);
                console.error(`[BitNet] Error checking Docker container:`, error, stderr);
            } else if (stdout.trim()) {
                vscode.window.showInformationMessage(`Docker container status: ${stdout.trim()}`);
                console.log(`[BitNet] Docker container status: ${stdout.trim()}`);
            } else {
                vscode.window.showWarningMessage(`Docker container '${CONTAINER_NAME}' is NOT found.`);
                console.log(`[BitNet] Docker container '${CONTAINER_NAME}' is NOT found.`);
            }
        });
    }

    /**
     * Stops the MCP Docker container using the Docker CLI.
     */
    static async stopDockerContainer() {
        console.log('[BitNet] stopDockerContainer called');
        const { execFile } = require('child_process');
        execFile('docker', ['stop', CONTAINER_NAME], (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error stopping Docker container: ${stderr || error.message}`);
                console.error(`[BitNet] Error stopping Docker container:`, error, stderr);
            } else {
                vscode.window.showInformationMessage(`Docker container '${CONTAINER_NAME}' stopped.`);
                console.log(`[BitNet] Docker container '${CONTAINER_NAME}' stopped.`);
            }
        });
    }

    /**
     * Opens the VS Code settings for this extension.
     */
    static async configureMcpServerSettings() {
        console.log('[BitNet] configureMcpServerSettings called');
        await vscode.commands.executeCommand('workbench.action.openSettings', `@ext:bitnet-vscode-extension`);
    }
}


// --- Initialization Command (CLI-based, no dependency on dockerode or extension APIs) ---
/**
 * BitNet: Initialize MCP Server - performs initial setup for Docker interaction using Docker CLI.
 */
async function initializeMcpServer() {
    console.log('[BitNet] initializeMcpServer called');
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Initializing BitNet MCP Server',
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ message: 'Checking/pulling Docker image...' });
            // Pull image if needed
            const imagePresent = await DockerManager.ensureDockerImageIsPresent(DOCKER_IMAGE_NAME);
            if (!imagePresent) {
                console.log('[BitNet] Docker image not present, aborting initializeMcpServer');
                progress.report({ message: 'Docker image not present. Aborting.' });
                return; // User cancelled or download failed, initialization stops here
            }

            progress.report({ message: 'Removing any existing container...' });
            // Remove any existing container with the same name (force remove)
            await DockerManager.removeDockerContainer();

            progress.report({ message: 'Creating new Docker container...' });
            // Create container (but do not start it)
            const { execFile } = require('child_process');
            await new Promise((resolve, reject) => {
                execFile('docker', [
                    'create',
                    '--name', CONTAINER_NAME,
                    '-p', `${MCP_PORT}:${MCP_PORT}`,
                    DOCKER_IMAGE_NAME
                ], (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Failed to create Docker container '${CONTAINER_NAME}': ${stderr || error.message}`);
                        console.error(`[BitNet] Error creating Docker container '${CONTAINER_NAME}':`, error, stderr);
                        progress.report({ message: 'Failed to create Docker container.' });
                        reject(error);
                    } else {
                        vscode.window.showInformationMessage(`Docker container '${CONTAINER_NAME}' created.`);
                        console.log(`[BitNet] Docker container '${CONTAINER_NAME}' created.`);
                        progress.report({ message: 'Docker container created.' });
                        resolve();
                    }
                });
            });

            progress.report({ message: 'Initialization complete!' });
            vscode.window.showInformationMessage('BitNet MCP Server initialization complete. You can now start the server and use other commands.');
            console.log('[BitNet] BitNet MCP Server initialization complete.');
        } catch (err) {
            vscode.window.showErrorMessage(`Initialization failed: ${err.message}`);
            console.error('[BitNet] Initialization error:', err);
        }
    });
}


// --- VS Code Extension Activation ---

/**
 * This method is called when your extension is activated
 * Your extension is activated the very first time the command is executed
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "bitnet-vscode-extension" is now active!');

    // Register commands using the DockerManager methods
    // Removed the `isInitialized` flag entirely. Each command is responsible for
    // ensuring Docker availability via `DockerManager.getDockerodeClient()`.
    context.subscriptions.push(
        vscode.commands.registerCommand('bitnet.initializeMcpServer', initializeMcpServer),
        vscode.commands.registerCommand('bitnet.startMcpServer', () => DockerManager.startMcpServer()),
        vscode.commands.registerCommand('bitnet.removeDockerContainer', () => DockerManager.removeDockerContainer()),
        vscode.commands.registerCommand('bitnet.removeDockerImage', () => DockerManager.removeDockerImage()),
        vscode.commands.registerCommand('bitnet.viewMcpServerLogs', () => DockerManager.viewMcpServerLogs()),
        vscode.commands.registerCommand('bitnet.restartMcpServer', () => DockerManager.restartMcpServer()),
        vscode.commands.registerCommand('bitnet.openMcpServerInBrowser', () => DockerManager.openMcpServerInBrowser()),
        vscode.commands.registerCommand('bitnet.showMcpServerStatus', () => DockerManager.showMcpServerStatus()),
        vscode.commands.registerCommand('bitnet.configureMcpServerSettings', DockerManager.configureMcpServerSettings),
        vscode.commands.registerCommand('bitnet.checkDockerContainer', () => DockerManager.checkDockerContainer()),
        vscode.commands.registerCommand('bitnet.stopDockerContainer', () => DockerManager.stopDockerContainer()),
    );

    // Register MCP Server Definition Provider
    if (vscode.mcpServerDefinitions && vscode.mcpServerDefinitions.registerMcpServerDefinitionProvider) {
        const mcpServerProvider = {
            provideMcpServerDefinitions() {
                return [
                    {
                        id: 'bitnet-vscode-extension',
                        label: 'BitNet MCP Server',
                        url: `http://localhost:${MCP_PORT}`,
                        description: 'BitNet Model Context Provider running in Docker',
                    }
                ];
            }
        };
        const providerDisposable = vscode.mcpServerDefinitions.registerMcpServerDefinitionProvider('bitnet-vscode-extension', mcpServerProvider);
        context.subscriptions.push(providerDisposable);
    }
}

// This method is called when your extension is deactivated
function deactivate() {
    const containerName = 'ai_container'; // Use your actual container name

    console.log('[BitNet] Deactivating extension, stopping Docker container...');
    return new Promise((resolve) => {
        execFile('docker', ['stop', containerName], (error, stdout, stderr) => {
            if (error) {
                console.error(`[BitNet] Error stopping Docker container: ${stderr}`);
            } else {
                console.log(`[BitNet] Docker container "${containerName}" stopped.`);
            }
            resolve();
        });
    });
}

module.exports = {
    activate,
    deactivate
}