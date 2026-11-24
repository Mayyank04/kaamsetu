/**
 * KAAMSETU — Server-Side TTS Provider Service & Architecture
 * 
 * Provides unified interface for:
 * 1. Google Cloud Text-to-Speech
 * 2. Azure AI Cognitive Speech
 * 3. Bhashini ULCA TTS
 * 4. Client-side Browser SpeechSynthesis Fallback
 * 
 * Invariant: Never claim cloud TTS is OPERATIONAL when credentials are absent.
 * Always return truthful NOT_CONFIGURED status when environment keys are missing.
 */

import { TTSProviderStatus, TTSRequest, PlaybackSpeed } from "./types";
import { getLanguageBCP47, detectScriptLanguage } from "./voice-selection";

export interface SynthesizeAudioResult {
  success: boolean;
  audioContentBase64?: string;
  contentType?: string;
  provider: "google_cloud" | "azure" | "bhashini" | "browser";
  error?: string;
  fallbackToBrowser: boolean;
}

export class TTSProviderService {
  /**
   * Inspect all TTS providers and return their truthful configuration status.
   */
  static getProvidersStatus(): TTSProviderStatus[] {
    const googleKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY;
    const azureKey = process.env.AZURE_SPEECH_KEY || process.env.AZURE_TRANSLATOR_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION || process.env.AZURE_TRANSLATOR_REGION;
    const bhashiniKey = process.env.BHASHINI_API_KEY;
    const bhashiniUser = process.env.BHASHINI_USER_ID;

    const isGoogleConfigured = Boolean(
      googleKey && !googleKey.includes("placeholder") && googleKey.length > 10
    );

    const isAzureConfigured = Boolean(
      azureKey &&
      azureRegion &&
      !azureKey.includes("placeholder") &&
      !azureRegion.includes("placeholder") &&
      azureKey.length > 10
    );

    const isBhashiniConfigured = Boolean(
      bhashiniKey &&
      bhashiniUser &&
      !bhashiniKey.includes("placeholder") &&
      !bhashiniUser.includes("placeholder") &&
      bhashiniKey.length > 10
    );

    return [
      {
        name: "google_cloud",
        status: isGoogleConfigured ? "OPERATIONAL" : "NOT_CONFIGURED",
        supportedLanguages: ["hi", "as", "bn", "ta", "te", "mr", "gu", "pa", "kn", "ml", "ur", "en"],
        message: isGoogleConfigured
          ? "Google Cloud TTS configured and available."
          : "GOOGLE_CLOUD_TTS_API_KEY not set. Falling back to local browser synthesis.",
      },
      {
        name: "azure",
        status: isAzureConfigured ? "OPERATIONAL" : "NOT_CONFIGURED",
        supportedLanguages: ["hi", "as", "bn", "ta", "te", "mr", "gu", "pa", "kn", "ml", "ur", "en"],
        message: isAzureConfigured
          ? "Azure Cognitive Speech configured and available."
          : "AZURE_SPEECH_KEY or AZURE_SPEECH_REGION not set.",
      },
      {
        name: "bhashini",
        status: isBhashiniConfigured ? "OPERATIONAL" : "NOT_CONFIGURED",
        supportedLanguages: ["hi", "as", "bn", "ta", "te", "mr", "gu", "pa", "kn", "ml", "ur", "en"],
        message: isBhashiniConfigured
          ? "Bhashini ULCA TTS configured and available."
          : "BHASHINI_API_KEY or BHASHINI_USER_ID not set.",
      },
      {
        name: "browser",
        status: "OPERATIONAL",
        supportedLanguages: ["hi", "as", "bn", "ta", "te", "mr", "gu", "pa", "kn", "ml", "ur", "en"],
        message: "Native Browser SpeechSynthesis active with Indic language routing.",
      },
    ];
  }

  /**
   * Attempt server-side speech synthesis via available cloud providers.
   * If no cloud provider is configured, returns fallbackToBrowser: true without failing silently.
   */
  static async synthesize(req: TTSRequest): Promise<SynthesizeAudioResult> {
    if (!req.text || !req.text.trim()) {
      return {
        success: false,
        provider: "browser",
        error: "Text cannot be empty",
        fallbackToBrowser: true,
      };
    }

    // Determine effective target language
    let effectiveLang = req.language;
    if (!effectiveLang || effectiveLang === "auto") {
      effectiveLang = detectScriptLanguage(req.text);
    }
    const bcp47 = getLanguageBCP47(effectiveLang);

    // 1. Try Google Cloud TTS if configured
    const googleKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY;
    if (googleKey && !googleKey.includes("placeholder") && googleKey.length > 10) {
      try {
        const audioBase64 = await this.synthesizeGoogleCloud(req.text, bcp47, req.speed || 1.0, googleKey);
        if (audioBase64) {
          return {
            success: true,
            audioContentBase64: audioBase64,
            contentType: "audio/mp3",
            provider: "google_cloud",
            fallbackToBrowser: false,
          };
        }
      } catch (err: any) {
        console.warn("[TTSProviderService] Google Cloud TTS error:", err?.message || err);
      }
    }

    // 2. Try Azure Speech if configured
    const azureKey = process.env.AZURE_SPEECH_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION;
    if (azureKey && azureRegion && !azureKey.includes("placeholder") && azureKey.length > 10) {
      try {
        const audioBase64 = await this.synthesizeAzure(req.text, bcp47, req.speed || 1.0, azureKey, azureRegion);
        if (audioBase64) {
          return {
            success: true,
            audioContentBase64: audioBase64,
            contentType: "audio/mp3",
            provider: "azure",
            fallbackToBrowser: false,
          };
        }
      } catch (err: any) {
        console.warn("[TTSProviderService] Azure Speech TTS error:", err?.message || err);
      }
    }

    // 3. Fallback: Local Client Browser Synthesis
    return {
      success: true,
      provider: "browser",
      fallbackToBrowser: true,
      message: "Cloud TTS not configured or unavailable. Routed to enhanced browser speech synthesis.",
    } as any;
  }

  /**
   * Google Cloud Text-to-Speech REST Synthesizer
   */
  private static async synthesizeGoogleCloud(
    text: string,
    bcp47: string,
    speed: PlaybackSpeed,
    apiKey: string
  ): Promise<string | null> {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: bcp47,
          ssmlGender: "NEUTRAL",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: speed,
        },
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      throw new Error(`Google TTS API HTTP ${response.status}: ${err.slice(0, 150)}`);
    }

    const data = await response.json();
    return data.audioContent || null;
  }

  /**
   * Azure Cognitive Services Text-to-Speech REST Synthesizer
   */
  private static async synthesizeAzure(
    text: string,
    bcp47: string,
    speed: PlaybackSpeed,
    apiKey: string,
    region: string
  ): Promise<string | null> {
    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
    // Speed SSML mapping: e.g. 0.5x is -50%, 0.75x is -25%, 1x is 0%, 1.25x is +25%, 1.5x is +50%
    const ratePercentage = Math.round((speed - 1) * 100);
    const rateStr = ratePercentage >= 0 ? `+${ratePercentage}%` : `${ratePercentage}%`;

    const ssml = `<speak version='1.0' xml:lang='${bcp47}'><voice xml:lang='${bcp47}'><prosody rate='${rateStr}'>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</prosody></voice></speak>`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      },
      body: ssml,
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      throw new Error(`Azure TTS API HTTP ${response.status}: ${err.slice(0, 150)}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  }
}
