package com.placeease.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ChatbotService {

    private static final Map<String, String> KEYWORD_RESPONSES = new LinkedHashMap<>();

    static {
        KEYWORD_RESPONSES.put("placement process",
                "📋 The placement process typically involves:\n1. Company Registration & Job Posting\n2. Admin Approval of Job Postings\n3. Students Apply for Eligible Jobs\n4. Shortlisting by Recruiters\n5. Interview Rounds\n6. Final Offer\n\nYou can view eligible jobs in your dashboard!");

        KEYWORD_RESPONSES.put("eligibility",
                "✅ Job eligibility is based on:\n• Your CGPA (must meet minimum requirement)\n• Your Branch (must be in allowed branches)\n• Application deadline (must not be expired)\n\nCheck your profile to ensure your details are up to date.");

        KEYWORD_RESPONSES.put("cgpa",
                "📊 Your CGPA is a key factor in job eligibility. Each job has a minimum CGPA requirement. Make sure your CGPA is updated in your profile. Higher CGPA improves your recommendation score!");

        KEYWORD_RESPONSES.put("resume",
                "📄 Tips for a great resume:\n• Keep it concise (1-2 pages)\n• Highlight relevant skills and projects\n• Include internship experience\n• Use action verbs\n• Upload as PDF format\n\nYou can upload your resume when applying for jobs.");

        KEYWORD_RESPONSES.put("deadline",
                "⏰ Each job posting has a specific deadline. Check the 'Available Jobs' tab in your dashboard for upcoming deadlines. Apply early to avoid missing out!");

        KEYWORD_RESPONSES.put("skill",
                "🛠️ To improve your skills:\n• Check the Skill Gap Analysis in your dashboard\n• Focus on high-demand technologies\n• Take online courses and build projects\n• Update your skills in your profile regularly");

        KEYWORD_RESPONSES.put("interview",
                "🎤 Interview preparation tips:\n• Research the company thoroughly\n• Practice common coding questions\n• Prepare for behavioral questions (STAR method)\n• Review your projects and be ready to explain them\n• Dress professionally and arrive early");

        KEYWORD_RESPONSES.put("offer",
                "🎉 Regarding job offers:\n• Offers will be reflected in your application status\n• You'll receive a notification when your status changes\n• Contact the placement cell for any offer-related queries");

        KEYWORD_RESPONSES.put("status",
                "📌 Application statuses:\n• APPLIED - Your application is submitted\n• SHORTLISTED - You've been shortlisted for next round\n• REJECTED - Unfortunately not selected\n• OFFERED - Congratulations! You received an offer\n\nCheck 'My Applications' tab for your current statuses.");

        KEYWORD_RESPONSES.put("help",
                "👋 Hi! I'm the PlaceEase Bot. I can help you with:\n• Placement process information\n• Eligibility criteria\n• Resume tips\n• Interview preparation\n• Application status queries\n• Skill development advice\n\nJust type your question and I'll do my best to help!");

        KEYWORD_RESPONSES.put("hello",
                "👋 Hello! Welcome to PlaceEase Chat. How can I help you today? Type 'help' to see what I can assist you with.");

        KEYWORD_RESPONSES.put("hi",
                "👋 Hi there! Welcome to PlaceEase Chat. How can I help you today? Type 'help' to see what I can assist you with.");

        KEYWORD_RESPONSES.put("thank",
                "😊 You're welcome! Feel free to ask if you have any more questions. Good luck with your placements! 🍀");
    }

    public String getResponse(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "I didn't quite understand that. Type 'help' to see what I can assist you with.";
        }

        String lowerMsg = userMessage.toLowerCase().trim();

        for (Map.Entry<String, String> entry : KEYWORD_RESPONSES.entrySet()) {
            if (lowerMsg.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return "🤔 I'm not sure about that. Here are some topics I can help with:\n• Placement process\n• Eligibility criteria\n• Resume tips\n• Interview preparation\n• Application status\n• Skill development\n\nTry asking about any of these topics!";
    }
}
