---
name: review
description: Cross-review PRD, User Stories, and design files to identify genuine gaps, conflicts, and ambiguities. Uses two-pass self-verification to eliminate false gaps. Use when investigating a new feature or epic before writing test cases.
---

# QA Investigation Review — $ARGUMENTS

Cross-review all provided documents to find REAL gaps, conflicts, and ambiguities — NOT to generate questions already answered in the docs.

## Prerequisites

**Design exports:** If any design-tool export (Figma, Sketch, Adobe XD, Zeplin, screenshots, ...) exceeds ~1800px in any dimension, resize it to ≤1800px FIRST before reading. Claude cannot reliably read exports larger than 1800px — text becomes unreadable and element details are lost. Save resized versions in a `design/resized` subfolder.
Before starting, confirm access to: PRD/BRD, User Stories (from your issue tracker), design files, API specs (if applicable), QC decisions (if any exist).

Read `qa-rules-condensed.md` from the project root for condensed QA rules.

## Phase 1: Document Analysis
For each document set (PRD, Stories, design files), extract: stated behaviors, field definitions, validation rules, state transitions, permission rules, calculations. Build a mental index of WHERE each piece of information lives.

## Phase 2: Cross-Reference
Compare every fact across all documents. For each finding, cite BOTH documents and exact sections.

## Phase 3: Classify Findings
For each finding, classify as: Confirmed Behavior (verified across docs), Conflict (docs contradict), Gap (missing info that blocks TCs), Ambiguity (multiple interpretations possible).

## Phase 4: Self-Verification (Two-Pass)
**Pass 1 — Premise Validation:** For every question, verify the premise. Check ALL documents before claiming something is missing.
**Pass 2 — QC Decision Check:** Check if any existing QC decisions already answer the question.

## Phase 5: Agent Orchestration
For large scope, delegate to specialized agents. See [agents.md](agents.md) for orchestration rules.

## Phase 6: Output
See [output-format.md](output-format.md) for the structured output format with priority classification.

## Rules
- NEVER generate questions about things already answered in the documents
- ALWAYS cite exact document and section for every finding
- Priority: CRITICAL (blocks all TCs) > HIGH (blocks key TCs) > MEDIUM (affects edge cases) > LOW (nice to clarify)
- If you're unsure whether something is a gap, check ALL documents before reporting it
