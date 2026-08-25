package com.mmt.eventwedding.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicBoolean;

// Gioi han so request/IP cho cac endpoint cong khai co the bi lam dung de
// dot chi phi (goi Gemini qua /api/chat, gui mail qua Resend toi email tuy
// y qua /api/leads) hoac do brute-force Basic Auth cua /api/admin. Sliding
// window trong bo nho — mat state khi Render free tier cold start, nhung
// van nang duoc muc lam dung thong thuong giua cac lan thuc day.
//
// Can server.forward-headers-strategy=framework (xem application.yml) de
// getRemoteAddr() tra ve IP goc cua khach thay vi IP proxy cua Render.
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private static final int WINDOW_SECONDS = 60;
    private static final int MAX_REQUESTS = 20;
    private static final int MAX_ADMIN_REQUESTS = 30;
    private static final int MAX_TRACKED_IPS = 5000;

    private final ConcurrentHashMap<String, Deque<Long>> hits = new ConcurrentHashMap<>();
    private final AtomicBoolean loggedOnce = new AtomicBoolean(false);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean isAdmin = path.startsWith("/api/admin/");
        boolean limited = isAdmin || path.equals("/api/leads") || path.equals("/api/chat");
        if (!limited) {
            chain.doFilter(request, response);
            return;
        }

        String ip = request.getRemoteAddr();
        if (loggedOnce.compareAndSet(false, true)) {
            log.info("RateLimitFilter dang thay client IP la: {} (kiem tra day co phai IP that cua khach khong)", ip);
        }

        if (hits.size() > MAX_TRACKED_IPS) {
            // van de an toan bo nho tren free tier — reset toan bo thay vi
            // giu mot map khong bao gio duoc don dep giua cac lan cold start.
            hits.clear();
        }

        int limit = isAdmin ? MAX_ADMIN_REQUESTS : MAX_REQUESTS;
        long now = Instant.now().getEpochSecond();
        Deque<Long> timestamps = hits.computeIfAbsent(ip, k -> new ConcurrentLinkedDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst() < now - WINDOW_SECONDS) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= limit) {
                response.setStatus(429);
                response.setHeader("Retry-After", String.valueOf(WINDOW_SECONDS));
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Qua nhieu yeu cau, vui long thu lai sau.\"}");
                return;
            }
            timestamps.addLast(now);
        }

        chain.doFilter(request, response);
    }
}
