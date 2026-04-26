import JSZip from 'jszip';

/**
 * Create a ZIP file from files map
 */
export async function createZip(files: Record<string, string>): Promise<Buffer> {
  const zip = new JSZip();

  // Add each file to the zip
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }

  // Generate zip as node buffer
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6, // Balance between speed and compression
    },
  });

  return zipBuffer;
}

/**
 * Sanitize filename for safe file system usage
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphen
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
