## Scope
- Remove deprecated directory `client/src/pages/merchant` and all files within it.
- Keep the active merchant implementation under `client/src/pages/dashboard/*`.
- Ensure no routes/imports reference the removed files.

## Safety Checks
- Confirm `client/src/App.js` does not import or route any files from `pages/merchant` (it does not).
- No backend changes.

## Deliverables
- Directory and file deletions.
- Short verification note and a list of removed paths.
- Provide the deletion diff before committing.