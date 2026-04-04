---
"masonix": minor
---

Remove duplicate `shortestColumnIndex` function in positioner

`shortestColumnIndex` was an internal private function with identical logic to the public `shortestColumn`. The internal `set` now calls `shortestColumn` directly, eliminating the dead duplicate.
