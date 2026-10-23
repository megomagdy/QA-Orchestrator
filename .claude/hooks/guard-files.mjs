#!/usr/bin/env node
// PreToolUse (Edit|Write|MultiEdit): keep per-user secrets and config out of agent edits.
// Exit 2 blocks the tool call; stderr is shown to Claude.
import { relative, resolve } from 'node:path';

let raw = '';
process.stdin.on('data', (c) => {
  raw += c;
});
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const filePath = input?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const rel = relative(root, resolve(root, filePath)).split('\\').join('/');
  const name = rel.split('/').pop() ?? '';

  if (name === '.env' || (/^\.env\..+/.test(name) && !name.endsWith('.example'))) {
    process.stderr.write(
      `Blocked edit to ${rel}: credentials. Update scripts/.env.example and tell the user what to set.\n`,
    );
    process.exit(2);
  }
  process.exit(0);
});
