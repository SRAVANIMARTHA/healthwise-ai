/**
 * HealthWise AI — Report Validator Service (Phase 18)
 *
 * Validates uploaded medical and lab reports:
 * - Allowed formats: PDF, JPG, JPEG, PNG
 * - Allowed MIME types: application/pdf, image/jpeg, image/png
 * - File size bounded to MAX_REPORT_FILE_SIZE (10 MB)
 * - Checks file signatures / magic bytes where feasible to reject disguised executables/scripts
 */

export const MAX_REPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: 'pdf' | 'image';
  sanitizedFileName?: string;
}

export const reportValidatorService = {
  /**
   * Validate a user-selected file
   */
  async validateFile(file: File): Promise<ValidationResult> {
    if (!file) {
      return { isValid: false, error: 'No file provided.' };
    }

    // 1. File Size check
    if (file.size === 0) {
      return { isValid: false, error: 'The selected file is empty.' };
    }
    if (file.size > MAX_REPORT_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `File size (${sizeMB} MB) exceeds the maximum allowed limit of 10 MB.`,
      };
    }

    // 2. Extension check
    const name = file.name || '';
    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return {
        isValid: false,
        error: 'The file has no valid extension. Please upload a PDF, JPG, or PNG report.',
      };
    }
    const ext = name.slice(lastDotIndex).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        error: `Unsupported file type "${ext}". Supported formats are PDF, JPG, and PNG.`,
      };
    }

    // 3. MIME type check
    const mime = (file.type || '').toLowerCase();
    const isMimeAllowed =
      ALLOWED_MIME_TYPES.includes(mime) ||
      (ext === '.pdf' && mime === 'application/x-pdf') ||
      (!mime && ALLOWED_EXTENSIONS.includes(ext)); // Some browsers omit file.type for local files

    if (!isMimeAllowed) {
      return {
        isValid: false,
        error: `Unsupported MIME type "${file.type}". Please upload an authentic PDF, JPG, or PNG document.`,
      };
    }

    // 4. Magic bytes validation (Read first 8 bytes)
    try {
      const slice = file.slice(0, 8);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // PDF signature: %PDF (0x25 0x50 0x44 0x46)
      if (ext === '.pdf') {
        const isPdfMagic =
          bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
        if (!isPdfMagic) {
          return {
            isValid: false,
            error: 'The file does not appear to be a valid PDF document.',
          };
        }
      }

      // JPEG signature: 0xFF 0xD8 0xFF
      if (ext === '.jpg' || ext === '.jpeg') {
        const isJpgMagic = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
        if (!isJpgMagic) {
          return {
            isValid: false,
            error: 'The file does not appear to be a valid JPEG image.',
          };
        }
      }

      // PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
      if (ext === '.png') {
        const isPngMagic =
          bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
        if (!isPngMagic) {
          return {
            isValid: false,
            error: 'The file does not appear to be a valid PNG image.',
          };
        }
      }
    } catch (readErr) {
      console.warn('[ReportValidator] Could not read file header bytes:', readErr);
      // Fallback to extension + MIME validation
    }

    // Sanitized filename (prevent directory traversal / weird characters)
    const sanitizedFileName = name
      .replace(/[^\w\s.-]/g, '_')
      .slice(0, 80);

    const fileType: 'pdf' | 'image' = ext === '.pdf' ? 'pdf' : 'image';

    return {
      isValid: true,
      fileType,
      sanitizedFileName,
    };
  },
};
