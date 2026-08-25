package com.mmt.eventwedding.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Tam thoi — chi de xac minh Render co truyen dung X-Forwarded-For qua
// chuoi proxy (static site rewrite -> backend) khong, truoc khi tin tuong
// RateLimitFilter dung dia chi that cua khach. Xoa sau khi xac minh xong.
@RestController
@RequestMapping("/api/admin")
public class DebugController {

    @GetMapping("/debug-ip")
    public Map<String, Object> debugIp(HttpServletRequest request) {
        return Map.of(
                "remoteAddr", request.getRemoteAddr(),
                "xForwardedFor", String.valueOf(request.getHeader("X-Forwarded-For")),
                "xRealIp", String.valueOf(request.getHeader("X-Real-IP")),
                "forwarded", String.valueOf(request.getHeader("Forwarded"))
        );
    }
}
