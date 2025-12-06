import { addCustomInstructions } from "../sections/custom-instructions"
import * as path from "path"
import * as fs from "fs/promises"
import { vi, describe, it, expect, beforeEach } from "vitest"

vi.mock("fs/promises")

describe("SovereignBuilder Mode", () => {
	const mockCwd = "/test/workspace"
	const globalInstructions = "Be helpful."

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should inject SCHEMA.md content when file exists", async () => {
		const mockSchema = '{ "role": "string", "tools": ["web_search"] }'
		;(fs.access as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
		;(fs.readFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSchema)

		const result = await addCustomInstructions("", globalInstructions, mockCwd, "sovereign-builder")

		expect(result).toContain("CRITICAL ARCHITECTURE SCHEMA")
		expect(result).toContain(mockSchema)
		expect(result).toContain("SOVEREIGN BUILDER PROTOCOL")
	})

	it("should inject warning when SCHEMA.md is missing", async () => {
		;(fs.access as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("ENOENT"))

		const result = await addCustomInstructions("", globalInstructions, mockCwd, "sovereign-builder")

		expect(result).toContain("WARNING: No SCHEMA.md found")
	})
})
