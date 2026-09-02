package com.mmt.eventwedding.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmt.eventwedding.dto.ChatTurn;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// Chatbot tu van qua Gemini (HTTP API) — cung mot kieu ket noi HTTPS nhu
// Resend dang dung trong EmailService, khong bi Render chan nhu SMTP.
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    static final String FALLBACK_REPLY =
            "Xin lỗi, hệ thống tư vấn tự động đang bận. Bạn nhắn Zalo hoặc gọi trực tiếp giúp mình để được hỗ trợ ngay nhé!";

    // Khong tu bia gia/so lieu — dung chinh sach da ap dung cho trang dau
    // thau (xem BiddingProcess.jsx), luon dan khach ve Zalo/dien thoai khi
    // hoi gia cu the.
    private static final String EVENT_PROMPT = """
            Bạn là trợ lý tư vấn ảo của MMT Event — công ty tổ chức sự kiện tại Cần Thơ, miền Tây. \
            Thế mạnh: nhà bạt không gian & sự kiện ngoài trời quy mô lớn, lễ khai trương/động thổ/ra quân, \
            hội nghị/hội thảo, cho thuê thiết bị lẻ (âm thanh, màn hình LED, bàn ghế). MMT cũng nhận hồ sơ \
            mời thầu/đấu thầu từ doanh nghiệp và cơ quan, báo giá minh bạch từng hạng mục.

            Trả lời ngắn gọn, thân thiện, đúng trọng tâm câu hỏi của khách bằng tiếng Việt. TUYỆT ĐỐI KHÔNG \
            được tự bịa số liệu, phần trăm chiết khấu, hay báo giá cụ thể — MMT chỉ báo giá chính xác sau khi \
            trao đổi trực tiếp qua Zalo/điện thoại. Khi khách hỏi giá, giải thích ngắn gọn các yếu tố ảnh \
            hưởng giá (quy mô, hạng mục, thời gian thi công) rồi mời khách để lại số điện thoại hoặc nhắn \
            Zalo Anh Hiếu (0939 050 550) để được báo giá chính xác.

            Nếu khách hỏi ngoài phạm vi tổ chức sự kiện, trả lời ngắn gọn là bạn chỉ hỗ trợ tư vấn dịch vụ \
            của MMT Event và mời khách liên hệ trực tiếp cho các vấn đề khác.""";

    private static final String WEDDING_PROMPT = """
            Bạn là trợ lý tư vấn ảo của Minh Minh Thúy — dịch vụ cưới hỏi trọn gói tại Cần Thơ (162/24 Trần \
            Ngọc Quế, Phường Ninh Kiều). Các loại lễ phục vụ: Lễ Vu Quy (nhà gái), Lễ Tân Hôn (nhà trai), \
            Đám hỏi, Tiệc báo hỷ tại nhà. Giờ làm việc: 7:30 - 20:30 tất cả các ngày.

            Trả lời ngắn gọn, ấm áp, đúng trọng tâm câu hỏi của khách bằng tiếng Việt, giọng văn trang trọng \
            nhẹ nhàng phù hợp dịch vụ cưới hỏi. TUYỆT ĐỐI KHÔNG được tự bịa số liệu hay báo giá cụ thể — \
            Minh Minh Thúy chỉ báo giá chính xác sau khi trao đổi trực tiếp qua Zalo/điện thoại. Khi khách \
            hỏi giá hoặc muốn giữ lịch, mời khách để lại số điện thoại hoặc nhắn Zalo Chị Thúy (0907 623 450) \
            để được tư vấn và giữ lịch chính xác.

            Nếu khách hỏi ngoài phạm vi dịch vụ cưới hỏi, trả lời ngắn gọn là bạn chỉ hỗ trợ tư vấn dịch vụ \
            của Minh Minh Thúy và mời khách liên hệ trực tiếp cho các vấn đề khác.""";

    // gemini-3.6-flash co "thinking" nen cham hon flash doi cu — do thuc te
    // ~16s cho mot cau hoi binh thuong, timeout 10s cu khien MOI request
    // that đeu bi huy giua chung va roi vao fallback. Nang len 25s de co bien.
    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    @PostConstruct
    void warnIfApiKeyMissing() {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY chua duoc cau hinh — chatbot se luon tra loi fallback.");
        }
    }

    Map<String, Object> buildPayload(String pageContext, List<ChatTurn> history) {
        String systemPrompt = "WEDDING".equals(pageContext) ? WEDDING_PROMPT : EVENT_PROMPT;

        List<Map<String, Object>> contents = new ArrayList<>();
        for (ChatTurn turn : history) {
            String role = "model".equals(turn.role()) ? "model" : "user";
            contents.add(Map.of("role", role, "parts", List.of(Map.of("text", turn.text()))));
        }

        return Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", contents,
                // Chatbot FAQ don gian khong can suy luan sau — thinkingLevel thap
                // giup giam do tre (gemini-3.x khong ho tro tat han thinking).
                "generationConfig", Map.of("thinkingConfig", Map.of("thinkingLevel", "low"))
        );
    }

    public String getReply(String pageContext, List<ChatTurn> history) {
        try {
            Map<String, Object> payload = buildPayload(pageContext, history);
            URI uri = URI.create(GEMINI_API_BASE + model + ":generateContent");
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                log.error("Gemini tu choi request (HTTP {}): {}", response.statusCode(), response.body());
                return FALLBACK_REPLY;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                log.error("Gemini tra ve response khong co text: {}", response.body());
                return FALLBACK_REPLY;
            }
            return textNode.asText();
        } catch (Exception e) {
            log.error("Loi khi goi Gemini API", e);
            return FALLBACK_REPLY;
        }
    }
}
