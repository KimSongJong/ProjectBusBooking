package com.busbooking.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload image to Cloudinary
     * @param file MultipartFile to upload
     * @param folder Folder name in Cloudinary (e.g., "drivers", "vehicles")
     * @return URL of uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        // Generate unique filename
        String publicId = folder + "/" + UUID.randomUUID().toString();

        // Upload to Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", publicId,
                        "folder", folder,
                        "resource_type", "image"
                ));

        // Return secure URL
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Delete image from Cloudinary
     * @param imageUrl URL of image to delete
     */
    public void deleteImage(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extract public_id from URL
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            // Log error but don't throw exception
            System.err.println("Error deleting image from Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     */
    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            // Split URL by "upload/"
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) {
                return null;
            }

            // Get the part after "upload/" and remove version
            String pathWithVersion = parts[1];
            String[] pathParts = pathWithVersion.split("/");

            // Skip version (v1234567890) and get the rest
            StringBuilder publicId = new StringBuilder();
            for (int i = 1; i < pathParts.length; i++) {
                if (i > 1) {
                    publicId.append("/");
                }
                publicId.append(pathParts[i]);
            }

            // Remove file extension
            String result = publicId.toString();
            int lastDotIndex = result.lastIndexOf(".");
            if (lastDotIndex > 0) {
                result = result.substring(0, lastDotIndex);
            }

            return result;
        } catch (Exception e) {
            System.err.println("Error extracting public_id from URL: " + e.getMessage());
            return null;
        }
    }
}
