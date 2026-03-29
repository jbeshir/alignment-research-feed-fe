# CLAUDE.md - alignment-research-feed-fe (React/Remix Frontend)

## Validation

To validate changes in this repository, run the following automated checks:

- Prettier format checking: npm run format:check
- Linting: npm run lint
- Typechecking: npm run typecheck

Additionally perform manual quality checks.

### Manual Quality Checks

After automated validation passes, review code for these issues:

1. **Duplicate Code**: Check for repeated definitions (constants, types, helper functions) that should be consolidated.

2. **Incomplete or Disconnected Logic**: Look for:
   - Legacy mechanisms or functions left in the code instead of being removed
   - Closures closing over data that may be outdated
   - Fields in types/interfaces that are never read or written
   - Functions that are defined but never called
   - Data properties that don't connect to any UI display
   - Features partially implemented but not wired up
   - TODO comments indicating unfinished work

3. **Validation Script Coverage**: Ensure any new validations are:
   - Added to `package.json` scripts
   - Included in the `validate` npm script chain
   - Added to `.github/workflows/ci.yml`

4. **Redundant fields or parameters**: Look for:
   - Fields that contain information present in or inferrable from other fields
   - Parameters that contain information present in or inferrable from other fields
   - Methods that aren't used or are only used in tests.
   - Re-exporting of types available elsewhere. Clean this up!
   - Unused exports. These should be fixed, not ignored.

5. **Theming**: Look for:
   - Any new styles which don't support dark mode correctly.

6. **Error Handling**: For every API call or server interaction, trace what happens when it fails:
   - Does the client code check for and handle error responses at all?
   - If it does, does the UI show the user something meaningful, or does the error silently vanish or cause a blank/broken state?
   - For streaming endpoints, what does the user see if the upstream provider errors mid-stream?

All steps must pass before changes can be merged.
