# TriggerGuard Environment Approval Reuse Test

This disposable repository contains a minimal GitHub Actions experiment for
checking whether a job protected by the `external` environment requires a fresh
environment approval for each new `pull_request_target` run after a pull request
receives a new commit.

The workflow under `.github/workflows/tg-environment-approval-reuse.yml` is
intentionally harmless. It only records the run context after environment
approval and uploads a small text artifact.
