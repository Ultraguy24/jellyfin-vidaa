# Jellyfin VIDAA

An independent, community-built Jellyfin client for Hisense VIDAA televisions.

> **Status: early development.** This repository currently contains the first browser/device diagnostic build. It is not yet a Jellyfin media player, and installation on VIDAA has not been established. The Hisense 85Q7STUK is our first target device.

The goal is a lightweight TV-first client with remote-control navigation, Jellyfin library browsing and reliable playback. The application is being built separately from Jellyfin Web so that its interface and browser compatibility can be tailored to VIDAA hardware.

## Target device

| Field | Initial target |
|---|---|
| Model | Hisense 85Q7STUK |
| Software version | `V01.09.60V.Q0612` |
| Extended version | `X0002.W01.Y01.J01` |
| Minor version | `V.Q0612.9.06.00-a20260612l` |
| RC version | `ERF2X38V1.01` |
| Browser engine | Not yet measured on the target TV |
| VIDAA developer / sideload method | Under investigation |

## Run locally

Requirements:

- Node.js `22.12.0` or newer. Node.js 24 LTS is the recommended baseline.
- npm (included with Node.js).

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

### Live-test on the television over your home network

1. Connect the development PC and Hisense TV to the same trusted home network. Wi-Fi and Ethernet can coexist; they do not need to use the same connection type.
2. Find the PC's LAN IPv4 address.
   - Linux: `ip -4 addr`
   - Windows: `ipconfig`
3. Start Vite listening on the LAN interface:

   ```bash
   npm run dev -- --host 0.0.0.0
   ```

4. In the TV's browser, open `http://PC-LAN-IP:5173` (replace the example address with the actual PC address).
5. Edit and save source files on the PC. Vite will attempt to hot-update the page. If the TV browser does not support Vite's WebSocket/HMR connection, refresh the TV page manually.

The TV and PC must be able to communicate directly. Guest Wi-Fi, client isolation, VLANs and firewall rules can prevent this even when both devices appear to be connected to the same router. Do not port-forward the Vite development server to the public internet. Use a trusted local network and close the server when finished.

For more detail, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) and [docs/DEVICE-TESTING.md](docs/DEVICE-TESTING.md).

## Build for production

```bash
npm run typecheck
npm run build
npm run preview
```

The static production output is written to `dist/`. The output can be hosted as static files for testing, but **a static website is not automatically a registered VIDAA application**. A separate, verified installation/registration path will be needed before this can be launched from the TV home screen.
