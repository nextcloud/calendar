/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

beforeAll(() => {
	// Disclaimer: The following explanation might be inaccurate 
	// because it is a result of encountering this issue for the first time. 
	// Still, the explanation is consistent with documentation for Vitest 4
	// and experiments to reproduce this issue.
    // So the following explanation is likely to reflect what is actually happening.
	//
	// Modules are cached across test files.
	// > Resets modules registry by clearing the cache of all modules.
	// See https://vitest.dev/api/vi.html#vi-mock
	//
    // So if modules are not reset before each test file run, 
	// the following issue can occur:
	//   - Given
	//     - Module X imports module Y
	//     - Test file A
	//       - First imports the module X and does not mock it
	//       - Secondly imports the module Y and does not mock it
	//     - Test file B
	//       - First imports the module X and not mock it directly
	//       - Secondly imports the module Y and does mock it
	//   - When
	//     - Test file A is executed before test file B on the same worker
	//   - Then
    //     - Test file B fails because
    //       - Module Y in test file B is loaded and mocked
	//         - Module Y is loaded before module X because, 
	//           `vi.mock` causes the import to be moved to the start of the file
	//           > `vi.mock` is hoisted (in other words, moved) to top of the file. 
	// 			 > It means that whenever you write it (be it inside beforeEach or test), 
	//           > it will actually be called before that.
	//           See https://vitest.dev/api/vi.html#vi-mock
	//         - Probably module Y is loaded from cache but still mocked,
    //           because it is imported and mocked directly (and not transitivly)
	//       - Module X loads non-mocked module Y from cache
	//          - Non-mocked module Y was cached when running test file A
	//       - Operations on module X do not use the mocked module Y as expected
	//
	// Similar issues occur when both test files mock module X.
	// Then the test fails because the mocked module Y in test file B 
	// is another mock instance of module Y then loaded by module X.
	//
	// This issue does not occur without transitive modules
	// because in this case loaded modules/mocks cannot get mixed up.
    //
	// Because the issues above can occure, we reset them here.
	// > If your tests were relying on module reset between tests, 
	// > you'll need to add `setupFile` 
	// > that calls `vi.resetModules()` in `beforeAll` test hook.
	// See https://vitest.dev/guide/migration.html#pool-rework
    //
	// An alternative would be to mock everything in a `setupFile`.
	// > Remember that you can call `vi.mock` in a setup file 
	// > to apply the module mock in every test file automatically.
	// See https://vitest.dev/guide/mocking/modules.html
	vi.resetModules()
})

document.title = 'Standard Nextcloud title'
