# MP3 Frame Counter API

A lightweight Fastify API for validating MP3 files and counting MPEG Version 1 Layer III audio frames.

## Features

- Upload an MP3 file using `multipart/form-data`
- Validates the uploaded file
- Skips ID3 metadata
- Detects and ignores Xing/Info header frames
- Counts valid MPEG Version 1 Layer III frames
- Written in TypeScript
- Unit tested with Vitest

---

## Prerequisites

- Node.js 20+
- npm

---

## Installation

Clone the repository and install dependencies.

```bash
npm install
```

---

## Running Locally

Start the development server.

```bash
npm run dev
```

The API will be available at:

```
http://localhost:3000
```

---

## Building

Compile the TypeScript project.

```bash
npm run build
```

Run the compiled application.

```bash
npm start
```

## Git Hooks

This project uses **Husky** and **lint-staged** to automatically validate code before every commit.

During a commit:

- ESLint runs with automatic fixes
- Prettier formats staged files
- Unit tests are ran

If linting, formatting, or tests fail the commit is blocked until the issues are resolved.

Although formatting and linting happen automatically during commits, it is recommended to run them manually before opening a pull request.

---

## Testing the API

Upload an MP3 file using `curl`.

```bash
curl -X POST \
  -F "file=@sample.mp3" \
  http://localhost:3000/file-upload
```

If your filename contains spaces, wrap it in quotes.

Example:

```bash
curl -X POST \
  -F 'file=@sample (2).mp3' \
  http://localhost:3000/file-upload
```

---

## API

### POST `/file-upload`

Uploads an MP3 file and returns information about the parsed audio.

#### Request

Content-Type:

```
multipart/form-data
```

Form field:

| Field | Type     | Required |
| ----- | -------- | -------- |
| file  | MP3 file | Yes      |

#### Example Response

```json
{
  "frameCount": 12345
}
```

If an invalid file is uploaded, the API returns an appropriate error response.

---

## Project Structure

```
src/
├── routes/
├── services/
├── utils/
├── validators/
├── errors/
└── server.ts

---

## Tech Stack

* Fastify
* TypeScript
* Vitest
* ESLint
* Prettier
* Husky
* lint-staged

---

## Development Notes

This project currently supports:

* MPEG Version 1
* Layer III MP3 files

The parser:

1. Validates the uploaded file.
2. Skips ID3 metadata.
3. Reads each MP3 frame header.
4. Calculates the frame length.
5. Skips Xing/Info header frames.
6. Counts valid audio frames until the end of the file.

---

## Available Scripts

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start the development server      |
| `npm run build`      | Compile TypeScript                |
| `npm start`          | Run the compiled application      |
| `npm test`           | Execute the test suite            |
| `npm run test:watch` | Run tests in watch mode           |
| `npm run lint`       | Run ESLint                        |
| `npm run format`     | Format the project using Prettier |

---
```

## Fututre improvments

1. The route currently reads the uploaded MP3 into memory for simplicity and clarity.
   For larger files or production use, the parser could be adapted to operate on a stream, maintaining a small carry-over buffer to handle frames that span chunk boundaries.

2. The route could inform users that thier file is corrupted.
