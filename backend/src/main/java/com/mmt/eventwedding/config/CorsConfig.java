package com.mmt.eventwedding.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origin:http://localhost:5173}")
    private String allowedOrigin;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // .trim() tren tung phan tu — FRONTEND_ORIGIN la danh sach nhieu domain
        // cach nhau boi dau phay, de dan du khoang trang khi paste vao Render
        // dashboard va lam sai lech so khop origin (Spring so khop tuyet doi,
        // khong tu trim).
        String[] origins = java.util.Arrays.stream(allowedOrigin.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .toArray(String[]::new);
        registry.addMapping("/api/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
