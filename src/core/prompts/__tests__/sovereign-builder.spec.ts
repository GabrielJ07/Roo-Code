import { addCustomInstructions } from "../sections/custom-instructions"
import * as fs from "fs/promises"
import * as path from "path"
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock fs/promises
vi.mock("fs/promises")
const mockedFs = fs as unknown as { access: any; readFile: any }

describe("SovereignBuilder Mode", () => {
	const cwd = "/test/cwd"

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should include schema content when schema.md exists", async () => {
		const schemaContent = "# Project Schema\n\nRules here."

		// Mock file existence and reading
		// We need to mock fs.access for fileExistsAtPath utility
		mockedFs.access.mockImplementation(async (path: string) => {
			if (path.toString().endsWith("schema.md")) return undefined
			throw new Error("File not found")
		})

		mockedFs.readFile.mockImplementation(async (path: string) => {
			if (path.toString().endsWith("schema.md")) return schemaContent
			return ""
		})

		const result = await addCustomInstructions("", "", cwd, "sovereign-builder")

		expect(result).toContain("SOVEREIGN BUILDER INSTRUCTIONS")
		expect(result).toContain("PRIMARY DIRECTIVE (High Priority):")
		expect(result).toContain(schemaContent)
		expect(result).toContain("STRICT CONSTRAINTS:")
	})

	it("should include schema content when SCHEMA.md exists", async () => {
		const schemaContent = "# Project Schema\n\nRules here."

		mockedFs.access.mockImplementation(async (path: string) => {
			if (path.toString().endsWith("SCHEMA.md")) return undefined
			if (path.toString().endsWith("schema.md")) throw new Error("File not found")
			throw new Error("File not found")
		})

		mockedFs.readFile.mockImplementation(async (path: string) => {
			if (path.toString().endsWith("SCHEMA.md")) return schemaContent
			return ""
		})

		const result = await addCustomInstructions("", "", cwd, "sovereign-builder")

		expect(result).toContain("SOVEREIGN BUILDER INSTRUCTIONS")
		expect(result).toContain("PRIMARY DIRECTIVE (High Priority):")
		expect(result).toContain(schemaContent)
	})

	it("should warn when no schema file exists", async () => {
		mockedFs.access.mockRejectedValue(new Error("File not found"))

		const result = await addCustomInstructions("", "", cwd, "sovereign-builder")

		expect(result).toContain("SOVEREIGN BUILDER INSTRUCTIONS")
		expect(result).toContain("WARNING: No 'schema.md' or 'SCHEMA.md' found")
		expect(result).toContain("STRICT CONSTRAINTS:")
	})

	it("should not include sovereign instructions for other modes", async () => {
		const result = await addCustomInstructions("", "", cwd, "architect")

		expect(result).not.toContain("SOVEREIGN BUILDER INSTRUCTIONS")
	})
})
