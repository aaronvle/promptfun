<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git workflow

- `main` is the production branch; Vercel deploys it to production.
- NEVER commit or push directly to `main`. Develop every change on a
  feature branch and open a pull request into `main`. Only the repo
  owner merges.
- Commit as the repo owner's identity with signing off (the SessionStart
  hook in `.claude/hooks/session-start.sh` configures this).
