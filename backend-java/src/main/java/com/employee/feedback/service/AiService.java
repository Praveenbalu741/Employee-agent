package com.employee.feedback.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    private static final String CLAUDE_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

    private final String apiKey;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiService(
            @Value("${anthropic.api.key}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public AiAnalysisResult analyzeFeedback(String text, String category, String mood) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("your_anthropic_api_key_here")) {
            logger.warn("[AI] Anthropic API Key not configured. Using local keywords and fallback analytics.");
            return runKeywordBasedFallback(text, category);
        }

        String systemPrompt = "You are an expert HR analyst specializing in employee wellbeing and workplace sentiment analysis. " +
                "Your role is to analyze employee feedback and return structured insights in JSON format. " +
                "Always respond with valid JSON only — no markdown, no explanation, just the JSON object.";

        String userPrompt = String.format(
                "Analyze this employee feedback submission and return a JSON object with exactly these fields:\n\n" +
                "Feedback details:\n" +
                "- Category: %s\n" +
                "- Mood: %s (scale: very_happy → happy → neutral → unhappy → very_unhappy)\n" +
                "- Text: \"%s\"\n\n" +
                "Return this exact JSON structure:\n" +
                "{\n" +
                "  \"sentimentScore\": <number between -1.0 (most negative) and 1.0 (most positive), two decimal places>,\n" +
                "  \"themes\": <array of 1-3 lowercase theme tags from: workload, management, culture, compensation, work_life_balance, career_growth, team_dynamics, communication, recognition, tools_resources, safety, other>,\n" +
                "  \"isUrgent\": <boolean — true ONLY if content suggests harassment, bullying, discrimination, serious mental health crisis, physical safety concern, or imminent resignation due to hostile conditions>,\n" +
                "  \"urgentReason\": <string if isUrgent is true, one of: harassment, bullying, discrimination, burnout_crisis, safety_concern, mental_health_crisis, resignation_risk; null otherwise>,\n" +
                "  \"aiSummary\": <concise 1-2 sentence summary of the key concern or sentiment, written neutrally for a manager to read, max 150 chars>\n" +
                "}",
                category, mood, text
        );

        try {
            // Build request body matching Claude API specification
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", CLAUDE_MODEL);
            requestBody.put("max_tokens", 500);
            requestBody.put("system", systemPrompt);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", userPrompt);
            messages.add(userMessage);
            requestBody.put("messages", messages);

            String requestBodyJson = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLAUDE_URL))
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                logger.error("[AI] Claude API returned error code {}: {}", response.statusCode(), response.body());
                return runKeywordBasedFallback(text, category);
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            String rawText = rootNode.path("content").get(0).path("text").asText().trim();

            JsonNode resultNode = objectMapper.readTree(rawText);

            double rawScore = resultNode.path("sentimentScore").asDouble(0.0);
            double clampedScore = Math.max(-1.0, Math.min(1.0, rawScore));

            List<String> themes = new ArrayList<>();
            if (resultNode.has("themes") && resultNode.get("themes").isArray()) {
                for (JsonNode tNode : resultNode.get("themes")) {
                    themes.add(tNode.asText());
                }
            }

            boolean isUrgent = resultNode.path("isUrgent").asBoolean(false);
            String urgentReason = isUrgent ? resultNode.path("urgentReason").asText(null) : null;
            String aiSummary = resultNode.path("aiSummary").asText("Manual review recommended.");

            return new AiAnalysisResult(clampedScore, themes, isUrgent, urgentReason, aiSummary);

        } catch (Exception e) {
            logger.error("[AI] Failed to process with Claude, running fallback: {}", e.getMessage());
            return runKeywordBasedFallback(text, category);
        }
    }

    private AiAnalysisResult runKeywordBasedFallback(String text, String category) {
        // Simple keyword check to make mock/offline mode work nicely
        String lower = text.toLowerCase();
        boolean isUrgent = false;
        String urgentReason = null;
        double sentiment = 0.0;

        List<String> themes = new ArrayList<>();
        themes.add(category.toLowerCase().replace(" ", "_"));

        if (lower.contains("harass") || lower.contains("abuse") || lower.contains("sexual")) {
            isUrgent = true;
            urgentReason = "harassment";
            sentiment = -0.8;
            themes.add("safety");
        } else if (lower.contains("burnout") || lower.contains("exhausted") || lower.contains("tired") || lower.contains("stress")) {
            isUrgent = true;
            urgentReason = "burnout_crisis";
            sentiment = -0.6;
            themes.add("work_life_balance");
        } else if (lower.contains("quit") || lower.contains("resign") || lower.contains("leaving")) {
            isUrgent = true;
            urgentReason = "resignation_risk";
            sentiment = -0.5;
            themes.add("career_growth");
        } else if (lower.contains("happy") || lower.contains("great") || lower.contains("awesome") || lower.contains("love")) {
            sentiment = 0.8;
        } else if (lower.contains("bad") || lower.contains("toxic") || lower.contains("poor")) {
            sentiment = -0.5;
        }

        String aiSummary = "Keyword analysis: Concern related to " + category + ". " + 
                           (isUrgent ? "Flagged urgent due to possible " + urgentReason.replace("_", " ") + "." : "Sentiment appears neutral/stable.");

        return new AiAnalysisResult(sentiment, themes, isUrgent, urgentReason, aiSummary);
    }

    public static class AiAnalysisResult {
        private final double sentimentScore;
        private final List<String> themes;
        private final boolean isUrgent;
        private final String urgentReason;
        private final String aiSummary;

        public AiAnalysisResult(double sentimentScore, List<String> themes, boolean isUrgent, String urgentReason, String aiSummary) {
            this.sentimentScore = sentimentScore;
            this.themes = themes;
            this.isUrgent = isUrgent;
            this.urgentReason = urgentReason;
            this.aiSummary = aiSummary;
        }

        public double getSentimentScore() {
            return sentimentScore;
        }

        public List<String> getThemes() {
            return themes;
        }

        public boolean isUrgent() {
            return isUrgent;
        }

        public String getUrgentReason() {
            return urgentReason;
        }

        public String getAiSummary() {
            return aiSummary;
        }
    }
}
