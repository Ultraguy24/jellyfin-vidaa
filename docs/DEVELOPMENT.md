# Development guide

## Environment

Use Node.js 24 LTS (or newer supported Node.js) and npm. Node.js is only needed for development/build tooling; it is not required by the browser at runtime.

```bash
node --version
npm --version
npm install
```

## Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite on port 5173 |
| `npm run dev -- --host 0.0.0.0` | Expose Vite to devices on the local network |
| `npm run typecheck` | Run TypeScript's type checker |
| `npm run build` | Type-check and build static production files |
| `npm run preview` | Preview `dist/` on port 4173 |

The Vite development server is configured to listen on `0.0.0.0` and port `5173` by default. Keep that server on a trusted network and do not configure router port forwarding for it.

## Recommended day-to-day workflow

1. Make changes on the development PC.
2. Run the app in a desktop browser first.
3. Keep the browser console open and check for runtime errors.
4. Run `npm run typecheck` and `npm run build` before committing.
5. When the target television is available, open the Vite LAN URL in its browser and test with the real remote.
6. Record the TV's firmware, browser user agent and observed behaviour in `DEVICE-TESTING.md` or a new device report.

## Live testing over Wi-Fi

The TV can be connected over Wi-Fi while the development PC uses Ethernet, provided both are on the same LAN and the access point/router permits traffic between wireless and wired clients.

On Linux, find the PC's IPv4 address with:

```bash
ip -4 addr
```

On Windows:

```powershell
ipconfig
```

Start Vite:

```bash
npm run dev -- --host 0.0.0.0
```

Then open `http://<PC-LAN-IP>:5173` on the television. If the page does not load:

- Check that the PC and TV are on the same home network, not a guest network.
- Check for wireless client/AP isolation or VLAN separation.
- Check the PC firewall for inbound TCP port `5173` on the private/home network profile.
- Confirm Vite is still running and has not selected a different port.
- Try loading the same URL from another phone on that Wi-Fi network.

Vite's hot reload uses a WebSocket connection. Some TV browsers or network configurations may not support it reliably. Manual refresh is the fallback; the application itself does not depend on HMR.

## Build output

`npm run build` writes the deployable static files to `dist/`. Do not edit `dist/` directly; it is generated output and is ignored by Git.

The current legacy target is a cautious starting point only. It is not a compatibility guarantee for this Hisense firmware. Any change to the browser target should be based on an actual user-agent/capability capture from the television.
