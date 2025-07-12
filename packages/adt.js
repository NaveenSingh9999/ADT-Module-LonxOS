export default async function main(args, lonx) {
  const { shell } = lonx;
  const target = args[0];

  if (!target) {
    shell.print("Usage: adt <url/ip>");
    return;
  }

  try {
    shell.print(`[adt] Resolving ${target}...`);

    const url = new URL(target.startsWith("http") ? target : "https://" + target);

    // DNS Resolution (via fetch)
    const res = await fetch(url.toString(), { method: "HEAD", mode: "cors" });
    const ipInfo = await fetch(`https://ipapi.co/json/`);

    const ipData = await ipInfo.json();

    // Headers
    const server = res.headers.get("server") || "Unknown";
    const via = res.headers.get("via") || "Not Provided";
    const cfRay = res.headers.get("cf-ray") || "None";
    const tlsVer = res.headers.get("strict-transport-security") ? "TLS 1.3 or HTTPS" : "None";

    shell.print(`[adt] IP Address (your endpoint): ${ipData.ip}`);
    shell.print(`[adt] Hostname: ${ipData.org}`);
    shell.print(`[adt] Region: ${ipData.region}, ${ipData.country_name}`);
    shell.print(`[adt] ISP: ${ipData.org}`);
    shell.print(`[adt] Using protocol: ${url.protocol}`);
    shell.print(`[adt] Server: ${server}`);
    shell.print(`[adt] TLS/HTTPS: ${tlsVer}`);
    shell.print(`[adt] CDN Info / Forward Path:`);
    shell.print(`  - via: ${via}`);
    shell.print(`  - cf-ray: ${cfRay}`);
    shell.print(`  - resolved domain: ${url.hostname}`);
  } catch (err) {
    shell.print(`[adt] Error: ${err.message}`);
  }
}
