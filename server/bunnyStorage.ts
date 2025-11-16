/**
 * Bunny CDN Storage Helper
 * Direct integration with Bunny CDN storage API
 */

const BUNNY_STORAGE_ZONE = "cfls";
const BUNNY_STORAGE_HOSTNAME = "storage.bunnycdn.com";
const BUNNY_STORAGE_PASSWORD = "6a72e0b5-6c7b-4002-a2dac2f84c3d-0a97-45b0";
const BUNNY_CDN_URL = "https://cfls.b-cdn.net";

/**
 * Upload a file to Bunny CDN storage
 * @param path - The path where the file should be stored (e.g., "avatars/123/image.jpg")
 * @param data - The file data as Buffer
 * @param contentType - The MIME type of the file
 * @returns The public CDN URL of the uploaded file
 */
export async function bunnyStoragePut(
  path: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  // Normalize path (remove leading slash)
  const normalizedPath = path.replace(/^\/+/, "");
  
  // Bunny Storage API endpoint
  const uploadUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${normalizedPath}`;
  
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "AccessKey": BUNNY_STORAGE_PASSWORD,
        "Content-Type": contentType,
      },
      body: data,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Bunny CDN upload failed (${response.status}): ${errorText}`
      );
    }

    // Return the public CDN URL
    const publicUrl = `${BUNNY_CDN_URL}/${normalizedPath}`;
    return publicUrl;
  } catch (error) {
    console.error("Bunny CDN upload error:", error);
    throw error;
  }
}

/**
 * Delete a file from Bunny CDN storage
 * @param path - The path of the file to delete
 */
export async function bunnyStorageDelete(path: string): Promise<void> {
  // Normalize path (remove leading slash)
  const normalizedPath = path.replace(/^\/+/, "");
  
  // Bunny Storage API endpoint
  const deleteUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${normalizedPath}`;
  
  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "AccessKey": BUNNY_STORAGE_PASSWORD,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Bunny CDN delete failed (${response.status}): ${errorText}`
      );
    }
  } catch (error) {
    console.error("Bunny CDN delete error:", error);
    throw error;
  }
}
