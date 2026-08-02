import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP tool response helpers. Every tool returns a `CallToolResult` whose
 * `content` is a list of content blocks. We standardize on `text` blocks and
 * serialize structured payloads as pretty JSON so they are readable in any
 * client (Trae, Claude Desktop, Cursor, MCP Inspector).
 */

/** Wrap a plain string as a successful tool result. */
export function text(message: string): CallToolResult {
    return {
        content: [{ type: 'text', text: message }],
    };
}

/** Serialize any JSON-serializable value as a pretty-printed text result. */
export function json(data: unknown): CallToolResult {
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
}

/** Build an error result. Per the MCP spec, tool-level errors SHOULD be reported
 * with `isError: true` inside the result (not as a protocol-level error), so
 * the LLM can observe and self-correct.
 */
export function error(message: string): CallToolResult {
    return {
        content: [{ type: 'text', text: message }],
        isError: true,
    };
}
