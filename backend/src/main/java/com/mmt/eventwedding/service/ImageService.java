package com.mmt.eventwedding.service;

import com.mmt.eventwedding.dto.ImageDto;
import com.mmt.eventwedding.exception.ImageNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Service
public class ImageService {

    private static final Set<String> ALLOWED_CATEGORIES = Set.of("events", "wedding");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final Path basePath;

    public ImageService(@Value("${app.images.base-path}") String basePathStr) {
        this.basePath = Paths.get(basePathStr).toAbsolutePath().normalize();
    }

    public List<ImageDto> listImages(String category) {
        validateCategory(category);
        Path dir = basePath.resolve(category);
        if (!Files.isDirectory(dir)) {
            return List.of();
        }
        try (Stream<Path> files = Files.list(dir)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(p -> hasAllowedExtension(p.getFileName().toString()))
                    .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                    .map(p -> new ImageDto(
                            p.getFileName().toString(),
                            "/api/images/" + category + "/" + p.getFileName().toString()))
                    .toList();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public Resource loadImage(String category, String filename) {
        validateCategory(category);
        Path dir = basePath.resolve(category).normalize();
        Path file = dir.resolve(filename).normalize();
        if (!file.startsWith(dir) || !Files.isRegularFile(file) || !hasAllowedExtension(filename)) {
            throw new ImageNotFoundException(category, filename);
        }
        return new FileSystemResource(file);
    }

    public String contentTypeFor(String filename) {
        return switch (extensionOf(filename)) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    private void validateCategory(String category) {
        if (!ALLOWED_CATEGORIES.contains(category)) {
            throw new ImageNotFoundException(category, null);
        }
    }

    private boolean hasAllowedExtension(String filename) {
        return ALLOWED_EXTENSIONS.contains(extensionOf(filename));
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase();
    }
}
