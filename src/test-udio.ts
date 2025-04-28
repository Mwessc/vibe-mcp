#!/usr/bin/env node
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

import { PiapiUdioGenerator } from "./piapiUdioGenerator.js";
import { StableAudioGenerator } from "./stableAudioGenerator.js";
import { GenerationMode } from "./audioGenerator.js";
import { audioPlayer } from "./playback.js";
import { buildPrompt } from "./utils.js";

/**
 * Test script for audio generation, pulling, and playback
 * This script tests both the StableAudioGenerator and PiapiUdioGenerator
 * with a focus on the Udio component
 */

// Sample code snippet for testing
const sampleCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the first 10 Fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}
console.log("Fibonacci sequence:", results);
`;

// Test configuration
const config = {
  // Set to true to test StableAudioGenerator
  testStableAudio: true,
  // Set to true to test PiapiUdioGenerator in instrumental mode
  testUdioInstrumental: true,
  // Set to true to test PiapiUdioGenerator in lyrical mode
  testUdioLyrical: true,
  // Duration to play each generated audio (in milliseconds)
  playDuration: 10000,
  // Genre to use for generation (optional)
  genre: "lo-fi house",
  // Maximum time to wait for PiAPI task completion (in milliseconds)
  udioTimeout: 5 * 60 * 1000, // 5 minutes
  // Optional: Existing task IDs to skip generation and just download/play
  existingTaskIds: {
    instrumental: "", // Set this to an existing instrumental task ID if available
    lyrical: "", // Set this to an existing lyrical task ID if available
  },
};

/**
 * Retrieve and play audio from an existing PiAPI Udio task ID
 * @param taskId The task ID to retrieve audio from
 * @param mode The generation mode (for logging purposes)
 */
async function testExistingUdioTask(taskId: string, mode: string) {
  console.log(`\n🎵 Testing existing PiAPI Udio task (${mode})...`);
  console.log(`- Task ID: ${taskId}`);

  try {
    const startTime = Date.now();
    const generator = new PiapiUdioGenerator();

    // Access the private pollForResult method using type assertion
    // This is a workaround to access a private method for testing purposes
    const audioUrl = await (generator as any).pollForResult(taskId);

    // Download the file
    console.log(`- Task completed, downloading audio...`);
    const axios = await import("axios");
    const fileResponse = await axios.default.get(audioUrl, {
      responseType: "arraybuffer",
    });

    // Save the audio data
    const audioFilePath = await (generator as any).saveAudioToFile(
      Buffer.from(fileResponse.data)
    );

    const duration = (Date.now() - startTime) / 1000;
    console.log(`- ✅ Audio retrieved successfully (${duration.toFixed(2)}s)`);
    console.log(`- Audio saved to: ${audioFilePath}`);

    // Play the audio
    console.log(`- Playing audio for ${config.playDuration / 1000} seconds...`);
    await audioPlayer.play(audioFilePath);

    // Wait for the specified duration
    await new Promise((resolve) => setTimeout(resolve, config.playDuration));

    // Stop playback
    audioPlayer.stop();
    console.log(`- ✅ Playback test complete`);

    return true;
  } catch (error) {
    console.error(`- ❌ Error retrieving audio from task ${taskId}:`, error);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log("=== Audio Generation Test Script ===");
  console.log("Testing audio generation, pulling, and playback");

  // Check for API keys
  const hasStableKey =
    !!process.env.STABLE_AUDIO_KEY &&
    process.env.STABLE_AUDIO_KEY !== "your_api_key_here";
  const hasPiapiKey =
    !!process.env.PIAPI_KEY && process.env.PIAPI_KEY !== "your_api_key_here";

  console.log("\nAPI Key Status:");
  console.log(
    `- Stable Audio API Key: ${hasStableKey ? "Available" : "Missing"}`
  );
  console.log(`- PiAPI Key: ${hasPiapiKey ? "Available" : "Missing"}`);

  // Build prompt from sample code
  const prompt = buildPrompt(sampleCode, config.genre);
  console.log("\nGenerated Prompt:");
  console.log(prompt);

  // Test StableAudioGenerator if enabled and key is available
  if (config.testStableAudio && hasStableKey) {
    await testGenerator(
      "Stable Audio Generator",
      new StableAudioGenerator(),
      prompt
    );
  } else if (config.testStableAudio) {
    console.log(
      "\n❌ Skipping Stable Audio Generator test - API key not available"
    );
  }

  // Test PiapiUdioGenerator in instrumental mode
  if (config.testUdioInstrumental) {
    // Check if we have an existing task ID for instrumental mode
    if (config.existingTaskIds.instrumental && hasPiapiKey) {
      await testExistingUdioTask(
        config.existingTaskIds.instrumental,
        "Instrumental"
      );
    } else if (hasPiapiKey) {
      // Generate new audio if no existing task ID
      await testGenerator(
        "PiAPI Udio Generator (Instrumental)",
        new PiapiUdioGenerator(GenerationMode.Instrumental),
        prompt
      );
    } else {
      console.log(
        "\n❌ Skipping PiAPI Udio Generator (Instrumental) test - API key not available"
      );
    }
  }

  // Test PiapiUdioGenerator in lyrical mode
  if (config.testUdioLyrical) {
    // Check if we have an existing task ID for lyrical mode
    if (config.existingTaskIds.lyrical && hasPiapiKey) {
      await testExistingUdioTask(config.existingTaskIds.lyrical, "Lyrical");
    } else if (hasPiapiKey) {
      // Generate new audio if no existing task ID
      await testGenerator(
        "PiAPI Udio Generator (Lyrical)",
        new PiapiUdioGenerator(GenerationMode.Lyrical),
        prompt
      );
    } else {
      console.log(
        "\n❌ Skipping PiAPI Udio Generator (Lyrical) test - API key not available"
      );
    }
  }

  console.log("\n=== Test Script Complete ===");
  console.log("Press Ctrl+C to exit");
}

/**
 * Test a specific audio generator
 * @param name Name of the generator for logging
 * @param generator The audio generator to test
 * @param prompt The prompt to use for generation
 */
async function testGenerator(
  name: string,
  generator: import("./audioGenerator.js").AudioGenerator,
  prompt: string
) {
  console.log(`\n🎵 Testing ${name}...`);

  try {
    console.log(`- Starting generation...`);
    const startTime = Date.now();

    // For PiAPI Udio generators, we want to capture and display the task ID
    let taskId: string | null = null;

    // Check if this is a PiAPI Udio generator
    if (name.includes("PiAPI Udio")) {
      // Monkey patch the generator to capture the task ID
      const originalPost = (generator as any).constructor.prototype.generate;

      // Override the generate method to capture the task ID
      (generator as any).generate = async function (
        prompt: string,
        options?: any
      ) {
        try {
          // Use provided mode or fall back to the instance mode
          const mode = options?.mode || this.mode;
          const lyrics_type =
            mode === GenerationMode.Instrumental ? "instrumental" : "generate";

          const input = {
            prompt,
            ...(mode === GenerationMode.Lyrical
              ? { gpt_description_prompt: prompt }
              : {}),
            lyrics_type: lyrics_type,
          };

          // Prepare the payload
          const payload = {
            model: "music-u",
            task_type: "generate_music",
            input,
          };

          // Make the API request to create a task
          const axios = await import("axios");
          const response = await axios.default.post(this.apiEndpoint, payload, {
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": this.apiKey,
            },
          });

          // Check if the request was successful
          if (
            response.status !== 200 ||
            !response.data ||
            !response.data.data ||
            !response.data.data.task_id
          ) {
            throw new Error(
              `API error: ${response.status}: ${JSON.stringify(response.data)}`
            );
          }

          // Get and save the task ID
          taskId = response.data.data.task_id;
          console.log(`Created PiAPI Udio task with ID: ${taskId}`);
          console.log(
            `💡 TIP: You can reuse this task ID later with --instrumental-task or --lyrical-task`
          );

          // Poll for the result
          const audioUrl = await this.pollForResult(taskId);

          // Download the file
          const fileResponse = await axios.default.get(audioUrl, {
            responseType: "arraybuffer",
          });

          // Save the audio data using the base class helper
          return this.saveAudioToFile(Buffer.from(fileResponse.data));
        } catch (error) {
          // Handle errors using the base class helper
          this.handleApiError(error, "PiAPI Udio");
        }
      };
    }

    // Generate audio
    const audioUrl = await generator.generate(prompt);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`- ✅ Generation successful (${duration.toFixed(2)}s)`);
    console.log(`- Audio saved to: ${audioUrl}`);

    // Play the audio
    console.log(`- Playing audio for ${config.playDuration / 1000} seconds...`);
    await audioPlayer.play(audioUrl);

    // Wait for the specified duration
    await new Promise((resolve) => setTimeout(resolve, config.playDuration));

    // Stop playback
    audioPlayer.stop();
    console.log(`- ✅ Playback test complete`);

    // If we captured a task ID, display it again at the end
    if (taskId) {
      console.log(`\n💾 Task ID for future reference: ${taskId}`);
      console.log(
        `   To reuse: node build/test-udio.js --${
          name.includes("Instrumental") ? "instrumental" : "lyrical"
        }-task ${taskId}`
      );
    }
  } catch (error) {
    console.error(`- ❌ Error testing ${name}:`, error);
  }
}

/**
 * Parse command line arguments
 * This allows passing task IDs directly from the command line
 */
function parseCommandLineArgs() {
  const args = process.argv.slice(2);

  // Check for instrumental task ID
  const instrumentalIndex = args.findIndex(
    (arg) => arg === "--instrumental-task"
  );
  if (instrumentalIndex !== -1 && instrumentalIndex < args.length - 1) {
    config.existingTaskIds.instrumental = args[instrumentalIndex + 1];
  }

  // Check for lyrical task ID
  const lyricalIndex = args.findIndex((arg) => arg === "--lyrical-task");
  if (lyricalIndex !== -1 && lyricalIndex < args.length - 1) {
    config.existingTaskIds.lyrical = args[lyricalIndex + 1];
  }

  // Check for play duration
  const durationIndex = args.findIndex((arg) => arg === "--play-duration");
  if (durationIndex !== -1 && durationIndex < args.length - 1) {
    const duration = parseInt(args[durationIndex + 1], 10);
    if (!isNaN(duration)) {
      config.playDuration = duration * 1000; // Convert seconds to milliseconds
    }
  }

  // Check for genre
  const genreIndex = args.findIndex((arg) => arg === "--genre");
  if (genreIndex !== -1 && genreIndex < args.length - 1) {
    config.genre = args[genreIndex + 1];
  }

  // Check for test flags
  if (args.includes("--no-stable")) {
    config.testStableAudio = false;
  }

  if (args.includes("--no-instrumental")) {
    config.testUdioInstrumental = false;
  }

  if (args.includes("--no-lyrical")) {
    config.testUdioLyrical = false;
  }

  // Check for help flag
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: node build/test-udio.js [options]

Options:
  --instrumental-task <id>  Use existing instrumental task ID
  --lyrical-task <id>       Use existing lyrical task ID
  --play-duration <seconds> Set playback duration in seconds (default: 10)
  --genre <genre>           Set music genre (default: "lo-fi house")
  --no-stable               Skip Stable Audio Generator test
  --no-instrumental         Skip PiAPI Udio Instrumental test
  --no-lyrical              Skip PiAPI Udio Lyrical test
  --help, -h                Show this help message
    `);
    process.exit(0);
  }
}

// Parse command line arguments and run the tests
parseCommandLineArgs();
runTests().catch((error) => {
  console.error("Test script failed:", error);
  process.exit(1);
});
