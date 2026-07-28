package com.mmt.eventwedding.exception;

public class ImageNotFoundException extends RuntimeException {
    public ImageNotFoundException(String category, String filename) {
        super("Image not found: category=" + category + ", filename=" + filename);
    }
}
