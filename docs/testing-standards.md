# Testing standards

General guidance for writing, reviewing, and maintaining automated tests. The repository's test framework, structure, and commands are the source of truth for *how* tests are written and run. This document covers *what* to test and what makes a test worth keeping.

## Before writing anything

1. Find the existing tests for the code in question and read them. Match their structure, naming, and helpers rather than inventing a parallel style.
2. Identify the test framework and the exact command to run the suite. Take it from the repository's configuration and `AGENTS.md`, not from assumption.
3. Work out what the code actually promises. If the intended behavior is materially ambiguous, ask. Do not encode a guess as the specification.
4. Check whether the behavior is already protected at another level. Add a test only when it covers a distinct risk or gives materially better failure feedback.

## The standard

How we approach automated tests. Tests are maintained code: each one should earn its cognitive and maintenance cost by protecting meaningful behavior or a distinct risk.

The repository's configured test framework and commands are the source of truth for how tests are written and run. Its required CI checks are the source of truth for what must pass before merging. This file covers what and how much to test, which test level to use, and what makes a test worth keeping.

### What to test

- Test observable behavior, business rules, meaningful boundaries, and failure paths rather than private methods or incidental implementation details.
- Add focused tests for important behavior. For a bug fix, add a regression test that would have failed before the fix when practical.
- Do not add tests that merely prove basic language, library, or framework behavior. Test the application's use of that behavior when it creates a meaningful risk.
- Inspect the existing tests before adding new ones. Don't duplicate behavior already protected at another level unless the new test addresses a distinct risk or provides materially better failure feedback.
- When expected behavior is materially ambiguous, ask rather than encoding an assumption as the specification.
- Follow the repository's established testing practices and structure.

### How much to test

- Prefer a small number of high-value tests over repetitive or mechanically generated coverage.
- Unless repository policy defines a threshold, judge sufficiency by the behavior and risks protected rather than a coverage percentage. Treat coverage as diagnostic information, not evidence of quality.
- Scale testing depth with risk. Test more thoroughly around security, permissions, payments, data integrity, calculations, concurrency, migrations, and destructive operations.
- Do not require every function or class to have its own test. A testable unit is a coherent behavior, not necessarily one code construct.

### Choosing a test level

Choose the least expensive test level that exercises the behavior and risk with meaningful fidelity.

- Use focused unit tests for algorithms, calculations, transformations, state transitions, and precise business rules.
- Use component or integration tests when correctness depends on collaboration, framework behavior, configuration, persistence, or infrastructure.
- Reserve end-to-end tests for a small number of critical user journeys and system-level risks.
- Some overlap between test levels is appropriate when each test protects a distinct risk or materially improves failure diagnosis.

### Test quality

- Keep tests readable, independent, and deterministic. Control time, randomness, concurrency, networks, external services, and shared state where they could make results depend on the environment, execution order, or earlier tests.
- Name tests so the scenario and expected outcome are clear. A failure should make it reasonably obvious what behavior regressed.
- Keep each test focused on one coherent behavior. Multiple related actions or assertions are appropriate when they collectively describe that behavior.
- Make tests resilient to behavior-preserving refactoring: assert outcomes, not incidental internal mechanics.
- Keep test logic simpler than the production logic. Do not reproduce the production algorithm to calculate the expected result; use independently known outcomes.
- Use representative inputs that could expose realistic mistakes. Keep test data minimal, but not so trivial that it fails to exercise the relevant behavior.
- Keep setup explicit enough that important preconditions remain visible. Use shared fixtures, helpers, and parameterized tests when they remove meaningful repetition or express domain intent without hiding relevant context.

### Test doubles

- Use test doubles at unstable, slow, expensive, nondeterministic, or difficult-to-control external boundaries.
- Prefer real internal collaborators when they remain fast, deterministic, and easy to set up.
- Assert outcomes, state changes, and meaningful external effects rather than internal calls.
- Verify an interaction only when the interaction itself is a requirement, such as ensuring a payment provider is not called after validation fails.
- Avoid tests coupled to the current call graph that fail during behavior-preserving refactoring.

### Maintaining tests

- Do not delete, skip, loosen, or rewrite a failing test merely to make the suite pass.
- Change a test when the intended behavior has changed, the test is incorrect, or a more reliable test protects the same risk.
- Treat flaky tests as defects. Diagnose and fix the cause rather than masking it with retries, delays, or broader assertions.
- Consolidate or remove redundant tests only when their behavior remains meaningfully protected and the change is clearly safe.
- Do not introduce a testing framework or dependency without approval.

## Before you finish

- Run the suite with the repository's own command. Never report a test as passing unless it was actually run, and say clearly what you did not run.
- For a bug fix, confirm the new test fails against the unfixed code where that is practical to check.
- Say which risks the new tests protect and which you deliberately left uncovered.
