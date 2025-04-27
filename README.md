# Vibe Soundtrack MCP

An MCP server that generates music based on your coding context. It uses the Stable Audio API to create short music clips that match what you're working on, with built-in playback and crossfading between tracks.

## Features

- **Start a vibe session**: Begin generating music based on your current coding context
- **Generate more music**: Request additional music as the previous chunk is almost finished, with smooth crossfading
- **Stop a vibe session**: End the music generation session
- **Server-side playback**: Audio is played directly by the MCP server with automatic crossfading between tracks

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install FFmpeg (required for audio playback):

   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt-get install ffmpeg

   # Windows (using Chocolatey)
   choco install ffmpeg
   ```

4. Build the project:
   ```bash
   npm run build
   ```
5. Set up your Stable Audio API key in the `.env` file:
   ```
   STABLE_AUDIO_KEY=your_api_key_here
   ```
   Get your API key from [Stability AI](https://platform.stability.ai/)

## Usage

### As an MCP Server

To use this as an MCP server with Cline, you need to add it to your MCP settings file:

1. Edit your MCP settings file:

   ```bash
   # For Cursor
   vim ~/Library/Application\ Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
   # For Claude Desktop
   vim ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Add the following configuration:

   ```json
   {
     "mcpServers": {
       "vibe-soundtrack": {
         "command": "node",
         "args": ["/path/to/vibe-soundtrack/dist/index.js"],
         "env": {
           "STABLE_AUDIO_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

3. Restart Cline or Claude Desktop

### For Development and Testing

You can also use the core functions directly for development and testing:

```typescript
import {
  startSessionLogic,
  generateMoreLogic,
  stopSessionLogic,
} from "./dist/index.js";

// Start a session
const result = await startSessionLogic(
  { genre: "lo-fi house" },
  'function myCode() { console.log("Hello world"); }'
);
console.log(result);
```

Or run the included test script:

```bash
./dist/test.js
```

## Tools

The MCP server provides three tools:

### start_vibe_session

Starts a new music generation session based on the current coding context.

**Parameters:**

- `genre` (optional): Music genre to generate (e.g., "lo-fi house", "synthwave", "ambient")

**Returns:**

- Audio URL and genre information

### generate_more_music

Generates more music as the previous chunk is almost finished.

**Parameters:**

- `genre` (optional): Music genre to generate (defaults to the genre used in the session)

**Returns:**

- Audio URL and genre information

### stop_vibe_session

Stops the music generation session.

**Parameters:**

- None

**Returns:**

- Success message

## License

MIT
