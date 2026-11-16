# Contributing

Thanks for your interest in Jellyfin VIDAA. The project is in an early device-discovery stage, so reproducible reports are especially useful.

## Before opening a pull request

- Keep the runtime dependency footprint small.
- Feature-detect browser APIs instead of assuming support.
- Do not present browser MIME declarations as proof of hardware playback.
- Keep remote navigation usable with a D-pad and OK/Back controls.
- Run `npm run typecheck` and `npm run build`.
- For device-specific changes, include the TV model, complete firmware version and browser user agent used for testing.

## Device reports

When reporting a compatibility result, include:

- TV manufacturer and exact model.
- Full software/firmware and RC versions where available.
- Browser user-agent string.
- Whether the test was on a wired or wireless network.
- Exact steps and observed result.
- For media, file container, video codec/profile, resolution, frame rate, audio codec and subtitle format.
- Whether Jellyfin Direct Played, Direct Streamed or Transcoded the item.

Please remove server addresses, usernames, access tokens and other private information from screenshots and logs.
