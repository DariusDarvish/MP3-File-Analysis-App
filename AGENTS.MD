# AGENTS.md

## Project Overview

This project is a TypeScript-based Fastify API for handling MP3 file uploads and processing.

The API is responsible for:

- Accepting MP3 file uploads
- Validating MP3 files
- Parsing MP3 metadata and headers
- Handling ID3 tags
- Returning consistent API responses
- Providing predictable error handling

---

## Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Fastify
- **Testing:** Vitest
- **File uploads:** `@fastify/multipart`
- **Module system:** ES Modules (`.js` imports in TypeScript source)

---

## Project Structure

Expected structure:

```
src/
├── routes/
│   └── fileUpload.ts
├── errors/
│   ├── Mp3Error.ts
│   └── errorHandler.ts
├── mp3/
│   └── parsing utilities
├── server.ts
└── tests/
```

Keep responsibilities separated:

- Routes handle HTTP concerns.
- MP3 parsing logic should not depend on Fastify.
- Error classes represent application-specific failures.
- Error handlers translate errors into HTTP responses.

---

## TypeScript Guidelines

- Use strict TypeScript types.
- Avoid using `any`.
- Prefer explicit types for public functions.
- Use interfaces/types when objects have known structures.
- Keep functions small and focused.

Example:

```ts
export function parseMp3Header(buffer: Buffer): Mp3Header {
  // parsing logic
}
```

Avoid mixing parsing logic with HTTP response handling.

---

## Fastify Guidelines

### Routes

Routes should:

- Validate incoming requests.
- Call application logic.
- Throw application errors instead of manually formatting responses.

Prefer:

```ts
throw new Mp3Error("Invalid MP3 file", 400);
```

instead of:

```ts
return reply.status(400).send({
  error: "Invalid MP3 file",
});
```

---

### Error Handling

All errors should flow through the centralized error handler.

The error handler is responsible for:

- Logging errors.
- Formatting API responses.
- Handling known application errors.
- Hiding unexpected internal errors.

Expected response format:

```json
{
  "error": "Error message"
}
```

Do not expose:

- stack traces
- internal implementation details
- filesystem paths
- database details

---

## Custom Errors

Use `Mp3Error` for expected application failures.

Examples:

```ts
throw new Mp3Error("No MP3 file provided", 400);

throw new Mp3Error("Invalid MP3 format", 400);
```

Use HTTP status codes appropriately:

- `400` - Invalid request or invalid MP3 input
- `413` - File too large
- `500` - Unexpected server failures

---

## MP3 Parsing Guidelines

MP3 parsing code should be independent from Fastify.

Example:

Good:

```ts
export function skipIdTag(buffer: Buffer, offset: number): number {
  return offset;
}
```

Avoid:

```ts
export function parseMp3(request: FastifyRequest) {}
```

Parsing functions should accept data and return results.

---

## ID3 Tag Handling

ID3v2 tags use a 28-bit synchsafe integer.

When parsing tag sizes:

- Each size byte contributes 7 bits.
- Valid values are `0x00` through `0x7F`.
- Use bit masking and shifting to reconstruct the size.

Example:

```ts
const tagSize =
  ((buffer[6] & 0x7f) << 21) |
  ((buffer[7] & 0x7f) << 14) |
  ((buffer[8] & 0x7f) << 7) |
  (buffer[9] & 0x7f);
```

Document bit manipulation clearly.

---

## Testing Guidelines

Tests use Vitest.

Every test should:

- Create an isolated Fastify instance.
- Register required plugins.
- Close the instance after completion.

Example:

```ts
beforeEach(async () => {
  app = Fastify();
});

afterEach(async () => {
  await app.close();
});
```

---

## Error Handler Tests

When testing errors:

Test these cases:

1. Custom application errors

Example:

```ts
throw new Mp3Error("No MP3 file provided", 400);
```

2. Framework errors

Example:

```ts
error.code = "FST_REQ_FILE_TOO_LARGE";
```

3. Unknown errors

Example:

```ts
throw new Error("Unexpected failure");
```

Verify:

- HTTP status code
- Response body
- No sensitive information leaks

---

## Logging

Use Fastify logging:

```ts
request.log.error(error);
```

Do not use `console.log` for production debugging.

---

## Code Style

Prefer:

```ts
const value = calculateValue();
```

over:

```ts
let value;
value = calculateValue();
```

Use meaningful names:

Good:

```ts
const tagSize = calculateId3TagSize(buffer);
```

Avoid:

```ts
const x = calculate(buffer);
```

---

## Before Making Changes

Before modifying code:

1. Understand existing behavior.
2. Check existing tests.
3. Add or update tests for new behavior.
4. Avoid changing public API behavior unless required.

---

## Definition of Done

A change is complete when:

- TypeScript compiles.
- Tests pass.
- Error behavior is covered.
- New functionality has tests.
- Existing behavior remains unchanged.
