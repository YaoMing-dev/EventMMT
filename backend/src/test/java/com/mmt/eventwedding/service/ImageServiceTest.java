package com.mmt.eventwedding.service;

import com.mmt.eventwedding.dto.ImageDto;
import com.mmt.eventwedding.exception.ImageNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageServiceTest {

    @Test
    void listImagesFiltersAndSortsByFilename(@TempDir Path tempDir) throws IOException {
        Path eventsDir = tempDir.resolve("events");
        Files.createDirectories(eventsDir);
        Files.writeString(eventsDir.resolve("b.jpg"), "b");
        Files.writeString(eventsDir.resolve("a.png"), "a");
        Files.writeString(eventsDir.resolve("skip.heic"), "skip");
        Files.writeString(eventsDir.resolve("notes.txt"), "skip");

        ImageService service = new ImageService(tempDir.toString());

        List<ImageDto> images = service.listImages("events");

        assertThat(images).extracting(ImageDto::filename).containsExactly("a.png", "b.jpg");
        assertThat(images).extracting(ImageDto::url)
                .containsExactly("/api/images/events/a.png", "/api/images/events/b.jpg");
    }

    @Test
    void listImagesReturnsEmptyForMissingDirectory(@TempDir Path tempDir) {
        ImageService service = new ImageService(tempDir.toString());

        assertThat(service.listImages("wedding")).isEmpty();
    }

    @Test
    void loadImageRejectsPathTraversal(@TempDir Path tempDir) throws IOException {
        Path eventsDir = tempDir.resolve("events");
        Files.createDirectories(eventsDir);
        Files.writeString(eventsDir.resolve("real.jpg"), "content");
        Path secret = tempDir.resolve("secret.txt");
        Files.writeString(secret, "top secret");

        ImageService service = new ImageService(tempDir.toString());

        assertThatThrownBy(() -> service.loadImage("events", "../secret.txt"))
                .isInstanceOf(ImageNotFoundException.class);
    }

    @Test
    void loadImageReturnsExistingFile(@TempDir Path tempDir) throws IOException {
        Path eventsDir = tempDir.resolve("events");
        Files.createDirectories(eventsDir);
        Files.writeString(eventsDir.resolve("real.jpg"), "content");

        ImageService service = new ImageService(tempDir.toString());

        Resource resource = service.loadImage("events", "real.jpg");

        assertThat(resource.exists()).isTrue();
    }

    @Test
    void contentTypeForKnownExtensions() {
        ImageService service = new ImageService("/anywhere");

        assertThat(service.contentTypeFor("a.jpg")).isEqualTo("image/jpeg");
        assertThat(service.contentTypeFor("a.jpeg")).isEqualTo("image/jpeg");
        assertThat(service.contentTypeFor("a.png")).isEqualTo("image/png");
        assertThat(service.contentTypeFor("a.webp")).isEqualTo("image/webp");
    }
}
