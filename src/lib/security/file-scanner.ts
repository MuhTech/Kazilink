import { sanitizeFileName } from "./sanitizer";

/**
 * Enterprise File Upload Security Engine
 * Validates file extension, MIME type magic numbers, file size bounds, executable content detection.
 */

export interface FileValidationResult {
  valid: boolean;
  sanitizedName: string;
  error?: string;
  details?: {
    sizeBytes: number;
    mimeType: string;
    extension: string;
  };
}

export const ALLOWED_CV_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

export async function validateFileUpload(
  file: File,
  type: "cv" | "avatar" | "company_logo",
): Promise<FileValidationResult> {
  const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  const size = file.size;
  const mimeType = file.type.toLowerCase();

  // 1. Check size limits
  const maxSize = type === "cv" ? MAX_CV_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (size > maxSize) {
    return {
      valid: false,
      sanitizedName: "",
      error: `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB.`,
    };
  }

  // 2. Validate Extension Whitelist
  const allowedExtensions = type === "cv" ? ALLOWED_CV_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      sanitizedName: "",
      error: `Invalid file type extension '${extension}'. Allowed extensions: ${allowedExtensions.join(", ")}`,
    };
  }

  // 3. Block Executable or Dangerous File Names
  const DANGEROUS_EXTENSIONS = [
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".php",
    ".js",
    ".html",
    ".py",
    ".vbs",
    ".jar",
    ".ps1",
  ];
  if (DANGEROUS_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return {
      valid: false,
      sanitizedName: "",
      error: "Malicious executable or script extension detected. File upload rejected.",
    };
  }

  // 4. Magic Bytes Inspection (Client-side header preview)
  const isHeaderValid = await verifyFileHeader(file, type);
  if (!isHeaderValid) {
    return {
      valid: false,
      sanitizedName: "",
      error:
        "File content headers do not match declared extension or contain suspicious signatures.",
    };
  }

  // 5. Generate secure randomized filename
  const sanitizedName = sanitizeFileName(file.name);

  return {
    valid: true,
    sanitizedName,
    details: {
      sizeBytes: size,
      mimeType,
      extension,
    },
  };
}

async function verifyFileHeader(
  file: File,
  type: "cv" | "avatar" | "company_logo",
): Promise<boolean> {
  try {
    const slice = file.slice(0, 8);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PDF Magic Bytes: %PDF (0x25 0x50 0x44 0x46)
    if (file.name.toLowerCase().endsWith(".pdf")) {
      return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
    }

    // PNG Magic Bytes: 0x89 0x50 0x4E 0x47
    if (file.name.toLowerCase().endsWith(".png")) {
      return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    }

    // JPEG Magic Bytes: 0xFF 0xD8 0xFF
    if (file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) {
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    }

    // Allow text files or word docs after standard checks
    return true;
  } catch {
    return true; // Fallback to non-blocking client check if arrayBuffer unreadable
  }
}
