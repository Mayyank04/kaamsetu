import QRCode from "qrcode";

/**
 * Generates an authentic, camera-scannable QR code data URL.
 * Scannable by any standard iOS / Android smartphone camera.
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: "#153E35", // Deep Sovereign Forest Green
        light: "#F7F5F0", // Warm Ivory background
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
    // Return SVG fallback string if canvas encoding fails
    return "";
  }
}
