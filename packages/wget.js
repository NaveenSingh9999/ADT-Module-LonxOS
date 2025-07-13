// packages/wget.js

/**
 * Simple wget using fetch for browser/modern Node.js environments.
 * Usage: wget <url> [output-filename]
 */
module.exports = async function main(args, lonx) {
    const { shell, vfs } = lonx; // vfs: your virtual file system (if available)

    if (args.length < 1) {
        shell.print("Usage: wget <url> [output-file]");
        return;
    }

    const url = args[0];
    let fileName = args[1];

    shell.print(`Downloading from ${url}...`);

    // Extract filename from URL if not provided
    function extractFilename(url) {
        return url.split('/').pop().split('?')[0] || 'index.html';
    }

    if (!fileName) {
        fileName = extractFilename(url);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

        // Read as arrayBuffer (for binary files) or text (for plain/text files)
        let data;
        if (response.headers.get('content-type')?.includes('text')) {
            data = await response.text();
        } else {
            data = await response.arrayBuffer();
        }

        // Save to virtual file system or trigger download
        if (vfs && typeof vfs.writeFile === 'function') {
            // Save in your OS's virtual file system
            await vfs.writeFile(fileName, data);
            shell.print(`Saved to ${fileName}`);
        } else {
            // Fallback: trigger download in browser
            const blob = new Blob([data]);
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            shell.print(`Downloaded ${fileName}`);
        }

        return fileName;
    } catch (e) {
        shell.print(`Error: ${e.message}`);
    }
};
