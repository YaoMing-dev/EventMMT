package com.mmt.eventwedding.controller;

import com.mmt.eventwedding.dto.ImageDto;
import com.mmt.eventwedding.exception.ImageNotFoundException;
import com.mmt.eventwedding.service.ImageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ImageController.class)
@AutoConfigureMockMvc(addFilters = false)
class ImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ImageService imageService;

    @Test
    void listReturnsImageDtos() throws Exception {
        when(imageService.listImages("events")).thenReturn(List.of(
                new ImageDto("a.jpg", "/api/images/events/a.jpg")
        ));

        mockMvc.perform(get("/api/images/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].filename").value("a.jpg"))
                .andExpect(jsonPath("$[0].url").value("/api/images/events/a.jpg"));
    }

    @Test
    void getReturnsImageBytesWithContentType() throws Exception {
        byte[] bytes = "fake-image-bytes".getBytes();
        when(imageService.loadImage("events", "a.jpg")).thenReturn(new ByteArrayResource(bytes));
        when(imageService.contentTypeFor("a.jpg")).thenReturn("image/jpeg");

        mockMvc.perform(get("/api/images/events/a.jpg"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"))
                .andExpect(content().bytes(bytes));
    }

    @Test
    void getReturns404WhenNotFound() throws Exception {
        when(imageService.loadImage("events", "missing.jpg"))
                .thenThrow(new ImageNotFoundException("events", "missing.jpg"));

        mockMvc.perform(get("/api/images/events/missing.jpg"))
                .andExpect(status().isNotFound());
    }
}
