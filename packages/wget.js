// packages/wget.js

import fs from 'fs/promises';
import path from 'path';

/**
 * Real wget for Lonx OS on Vercel/Node.js
 * Usage: wget <url> [output-filename]
 *
 * Downloads a file (text or binary) from any URL and saves it to /tmp.
 */
export default async function main(args, lonx) {
    const { shell } = lonx;

    if (args.length < 1) {
        shell.print("Usage: wget <url> [output-file]");
        return;
    }

    const url = args[0];
    let fileName = args[1];

    shell.print(`Downloading from ${url}...`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            shell.print(`\nError: HTTP ${response.status} ${response.statusText}`);
            return;
        }

        // Try to get filename from Content-Disposition
        if (!fileName) {
            const cd = response.headers.get('content-disposition');
            if (cd && /filename="?([^"]+)"?/i.test(cd)) {
                fileName = cd.match(/filename="?([^"]+)"?/i)[1];
            } else {
                fileName = url.split('/').pop().split('?')[0] || 'index.html';
            }
        }

        // Only /tmp is writable on Vercel
        const outputPath = path.join('/tmp', fileName);

        // Download as buffer (binary-safe)
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(outputPath, buffer);

        shell.print(`\nSaved to ${outputPath}`);
        return outputPath;

    } catch (e) {
        shell.print(`\nError: ${e.message}`);
    }
}
