# Device testing record

Use this document to record observations from physical VIDAA televisions. Keep model and firmware details alongside every result; do not assume that one VIDAA generation represents all models.

## Current target: Hisense 85Q7STUK

| Field | Value |
|---|---|
| Model | Hisense 85Q7STUK |
| Software version | `V01.09.60V.Q0612` |
| Extended version | `X0002.W01.Y01.J01` |
| Minor version | `V.Q0612.9.06.00-a20260612l` |
| RC version | `ERF2X38V1.01` |
| Network connection | Believed to be Wi-Fi; not confirmed |
| Browser available | Not yet checked |
| Browser user agent | Not yet captured |
| Debugging interface | Not yet checked |
| Vite page loads | Not yet tested |
| HMR works | Not yet tested |
| Remote key mapping | Not yet tested |
| Direct media playback | Not yet tested |
| VIDAA app registration | Not yet tested |

## First visit checklist

### Network and browser

- [ ] Confirm whether the TV is connected by Wi-Fi or Ethernet.
- [ ] Confirm the TV and development PC can reach each other on the home LAN.
- [ ] Open the built-in browser.
- [ ] Open the PC's Vite address, for example `http://192.168.1.50:5173`.
- [ ] Confirm the page renders at the expected screen size.
- [ ] Record the full browser user-agent string from the Environment panel.
- [ ] Check whether saving a local file hot-updates the page; if not, test manual refresh.

### Remote control

- [ ] Test Up, Down, Left and Right.
- [ ] Test OK/Select/Enter.
- [ ] Test Back (confirm it is logged without leaving the page).
- [ ] Test Play/Pause and other media keys if present.
- [ ] Test volume/channel keys if the browser exposes them.
- [ ] Record the `key`, `code` and numeric `keyCode` shown in the event log.

### Browser and media capabilities

- [ ] Record Browser & system results.
- [ ] Record all Video codec results.
- [ ] Record all Audio codec results.
- [ ] Record Media Source Extensions results.
- [ ] Compare browser-reported support with actual test-file playback later.

### Jellyfin connectivity

- [ ] Enter the Jellyfin server base URL (do not include `/System/Info/Public`).
- [ ] Test the public-info endpoint.
- [ ] If the test fails, check server reachability and browser CORS policy separately.
- [ ] Do not enter credentials; authentication is not part of this diagnostic build.

## Result log

Add dated entries below. Include exact file/container/codec details when testing playback and note whether the server Direct Played, Direct Streamed or Transcoded.

### No physical-device results yet

The target TV's network connection, browser, remote key map, codec playback and app-installation path are all still unverified.
