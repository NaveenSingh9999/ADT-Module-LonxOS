// packages/wget.js

// Define wget as a global function for your OS to call
async function wget(args, lonx) {
    const { shell, vfs } = lonx || {};

    if (!args || args.length < 1) {
        if (shell && shell.print) shell.print("Usage: wget <url> [output-file]");
        return;
    }

    const url = args[0];
    let fileName = args[1];

    if (shell && shell.print) shell.print(`Downloading from ${url}...`);

    function extractFilename(url) {
        const part = url.split('/').pop().split('?')[0];
        return part || 'index.html';
    }

    if (!fileName) {
        fileName = extractFilename(url);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

        // Decide if text or binary
        const contentType = response.headers.get('content-type') || '';
        let data;
        if (contentType.includes('text') || contentType.includes('json')) {
            data = await response.text();
        } else {
            data = await response.arrayBuffer();
        }

        // Try to save in vfs, else fallback to browser download
        if (vfs && typeof vfs.writeFile === 'function') {
            await vfs.writeFile(fileName, data);
            if (shell && shell.print) shell.print(`Saved to ${fileName}`);
        } else {
            const blob = new Blob([data]);
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (shell && shell.print) shell.print(`Downloaded ${fileName}`);
        }
        return fileName;
    } catch (e) {
        if (shell && shell.print) shell.print(`Error: ${e.message}`);
    }
}

// (Optional) Register with your OS's command system if required
// Example: if (window.lonxCommands) window.lonxCommands['wget'] = wget;
