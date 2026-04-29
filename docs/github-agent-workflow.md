# GitHub And Agent Workflow

This folder is the standalone git root for the current StingFit app, even
though it still lives under the larger `New project` workspace.

## Repo boundary

- Run `git status`, `git diff`, `git checkout -b ...`, and `git push` from
  `C:\Users\kiko\Documents\New project\localflow`.
- The parent workspace excludes `localflow/` from its own local git noise, so
  file-level git work should now happen here.

## GitHub remote

- The intended GitHub remote for this fitness app is `origin`.
- Repository identity follows the current product name `stingfit`, not the old
  productivity-era LocalFlow GitHub repo.

## VS Code MCP

- Project MCP config lives in `.vscode/mcp.json`.
- The GitHub MCP server is configured as the official remote HTTP server:
  `https://api.githubcopilot.com/mcp`
- In VS Code, open Agent mode, then use `MCP: List Servers` if you need to
  restart or reauthorize the GitHub server.
- If tools do not appear after config changes, run `MCP: Reset Cached Tools`.

## Recommended daily flow

1. Open the `localflow` folder directly in VS Code.
2. Use the existing `AI: Pi ...` tasks from `.vscode/tasks.json`.
3. Create a branch for a focused change.
4. Run `npm run check` before pushing.
5. Push to GitHub and let Actions verify lint, tests, and build.
