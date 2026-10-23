#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit): after Claude edits a pack skill or agent, validate its
// frontmatter so a broken SKILL.md never ships to linked users. Problems go back to Claude (exit 2).
import { existsSync, readFileSync } from 'node:fs';
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
  const abs = resolve(root, filePath);
  const rel = relative(root, abs).split('\\').join('/');

  const skill = rel.match(/^(?:\.claude\/)?skills\/([^/]+)\/SKILL\.md$/);
  const agent = rel.match(/^agents\/([^/]+)\.md$/);
  if ((!skill && !agent) || !existsSync(abs)) process.exit(0);

  const text = readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  const problems = [];
  if (!fm) {
    problems.push('missing YAML frontmatter (file must start with --- ... ---)');
  } else {
    const field = (k) => fm[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1]?.trim();
    const expected = (skill ?? agent)[1];
    const name = field('name');
    if (!name) problems.push('missing `name`');
    else if (name.replace(/^["']|["']$/g, '') !== expected)
      problems.push(`\`name: ${name}\` does not match "${expected}"`);
    if (!field('description')) problems.push('missing `description`');
    if (agent && !field('tools')) problems.push('agent missing `tools`');
  }

  if (problems.length) {
    process.stderr.write(`Frontmatter problems in ${rel}:\n- ${problems.join('\n- ')}\n`);
    process.exit(2);
  }
  if (skill && rel.startsWith('skills/')) {
    process.stderr.write(
      `Note: ${rel} changed. If you added, renamed or removed a skill, update the README and reference catalogs (/check-catalog).\n`,
    );
  }
  process.exit(0);
});
