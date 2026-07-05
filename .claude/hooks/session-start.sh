#!/bin/bash
set -euo pipefail

# Only needed in Claude Code on the web — local sessions already use the
# user's own git identity and signing setup.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Commit as the repo owner's GitHub identity instead of the container
# default (Claude), and turn off commit signing: the container signs with
# its own SSH key, which isn't registered to this identity, so signed
# commits show "Invalid signature" on GitHub.
git config --global user.name "aaronvle"
git config --global user.email "aaronvinhle@gmail.com"
git config --global commit.gpgsign false

# Install dependencies so build/lint/tests work from the first turn.
cd "$CLAUDE_PROJECT_DIR"
npm install
