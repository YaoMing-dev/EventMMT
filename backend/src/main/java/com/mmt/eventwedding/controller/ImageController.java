package com.mmt.eventwedding.controller;

import com.mmt.eventwedding.dto.ImageDto;
import com.mmt.eventwedding.service.ImageService;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @GetMapping("/{category}")
    public List<ImageDto> list(@PathVariable String category) {
        return imageService.listImages(category);
    }

    @GetMapping("/{category}/{filename}")
    public ResponseEntity<Resource> get(@PathVariable String category, @PathVariable String filename) {
        Resource resource = imageService.loadImage(category, filename);
        MediaType contentType = MediaType.parseMediaType(imageService.contentTypeFor(filename));
        return ResponseEntity.ok().contentType(contentType).body(resource);
    }
}
