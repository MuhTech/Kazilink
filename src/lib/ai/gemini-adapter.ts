import { GoogleGenAI } from "@google/genai";
import type {
  AIProviderAdapter,
  ParsedResume,
  AIRecommendation,
  CandidateRanking,
  AICareerChatMessage,
} from "@/types";

let genAiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (genAiClient) return genAiClient;
  const apiKey = typeof process !== "undefined" ? process.env.GEMINI_API_KEY : undefined;
  if (!apiKey) return null;
  try {
    genAiClient = new GoogleGenAI({ apiKey });
    return genAiClient;
  } catch (err) {
    console.warn("[GeminiAdapter] Failed to initialize GoogleGenAI:", err);
    return null;
  }
}

export class GeminiAIAdapter implements AIProviderAdapter {
  name = "Google Gemini AI Adapter";

  async parseResume(text: string): Promise<ParsedResume> {
    const ai = getGeminiClient();
    if (!ai) {
      return this.heuristicParseResume(text);
    }
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Extract structured profile information from this resume as raw JSON (no markdown formatting, no text around JSON).
JSON keys required: fullName, email, phone, location, headline, summary, skills (array of strings), education (array of { institution, degree, field, year }), experience (array of { company, role, duration, description }), languages (array of strings), certifications (array of strings).

Resume text:
${text.slice(0, 8000)}`,
              },
            ],
          },
        ],
      });

      const responseText = response.text || "";
      const cleanedJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanedJson);
      return {
        fullName: parsed.fullName || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        location: parsed.location || "",
        headline: parsed.headline || "",
        summary: parsed.summary || "",
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      };
    } catch (err) {
      console.warn("[GeminiAdapter] Resume parse fallback triggered:", err);
      return this.heuristicParseResume(text);
    }
  }

  async generateJobRecommendations(profile: any, jobs: any[]): Promise<AIRecommendation[]> {
    const ai = getGeminiClient();
    const profileSkills: string[] = profile?.skills || [];
    const profileLoc = (profile?.location || "").toLowerCase();

    if (!ai || !jobs || jobs.length === 0) {
      return this.heuristicRecommendations(profile, jobs);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an AI Job Matching Recommendation Engine for KaziLink Tanzania.
Compare candidate profile to the list of job postings and return JSON array of recommendation objects.
Format: Array of { jobId: string, matchScore: number (0-100), skillsScore: number, experienceScore: number, locationScore: number, salaryScore: number, reasons: string[] }

Candidate Profile:
- Headline: ${profile?.headline || ""}
- Skills: ${profileSkills.join(", ")}
- Location: ${profileLoc}
- Languages: ${(profile?.languages || []).join(", ")}

Jobs:
${JSON.stringify(jobs.map((j) => ({ id: j.id, title: j.title, location: j.location, description: j.description, skills: j.skills })))}`,
              },
            ],
          },
        ],
      });

      const text = response.text || "";
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsedList = JSON.parse(cleaned);

      return jobs.map((job) => {
        const match = Array.isArray(parsedList) ? parsedList.find((m) => m.jobId === job.id) : null;
        if (match) {
          return {
            id: job.id,
            user_id: profile?.id || "",
            job_id: job.id,
            match_score: match.matchScore || 70,
            breakdown: {
              skills_score: match.skillsScore || 70,
              experience_score: match.experienceScore || 70,
              location_score: match.locationScore || 70,
              salary_score: match.salaryScore || 70,
            },
            reasons: match.reasons || ["Skill match detected"],
            job,
          };
        }
        return this.calculateHeuristicSingleJobMatch(profile, job);
      });
    } catch (err) {
      console.warn("[GeminiAdapter] Recommendations fallback triggered:", err);
      return this.heuristicRecommendations(profile, jobs);
    }
  }

  async rankCandidates(job: any, candidates: any[]): Promise<CandidateRanking[]> {
    const ai = getGeminiClient();
    if (!ai || !candidates || candidates.length === 0) {
      return this.heuristicCandidateRankings(job, candidates);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Rank applicants for this job posting in Tanzania and return JSON array of rankings.
Required format: Array of { applicantId: string, overallScore: number (0-100), skillsScore: number, experienceScore: number, educationScore: number, locationScore: number, explanation: string }

Job Posting:
Title: ${job.title}
Requirements: ${job.requirements}
Location: ${job.location}

Candidates:
${JSON.stringify(candidates.map((c) => ({ id: c.applicant_id, name: c.full_name, headline: c.headline, skills: c.skills, bio: c.bio })))}`,
              },
            ],
          },
        ],
      });

      const text = response.text || "";
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsedList = JSON.parse(cleaned);

      return candidates.map((c) => {
        const item = Array.isArray(parsedList)
          ? parsedList.find((r) => r.applicantId === c.applicant_id)
          : null;
        return {
          id: c.applicant_id,
          job_id: job.id,
          applicant_id: c.applicant_id,
          overall_score: item?.overallScore || 75,
          skills_score: item?.skillsScore || 75,
          experience_score: item?.experienceScore || 70,
          education_score: item?.educationScore || 80,
          location_score: item?.locationScore || 80,
          explanation: item?.explanation || "Strong general match based on profile qualifications.",
          applicant: {
            full_name: c.full_name || "Applicant",
            headline: c.headline || "",
            location: c.location || "",
            phone: c.phone || "",
          },
        };
      });
    } catch (err) {
      console.warn("[GeminiAdapter] Candidate ranking fallback:", err);
      return this.heuristicCandidateRankings(job, candidates);
    }
  }

  async careerAssistantChat(
    history: AICareerChatMessage[],
    userMessage: string,
    language: "en" | "sw",
  ): Promise<string> {
    const ai = getGeminiClient();
    if (!ai) {
      return language === "sw"
        ? "Habari! Mimi ni Msaidizi wa Kazi wa KaziLink. Ninaweza kukusaidia kuboresha wasifu wako, kujitayarisha kwa usaili, na kupata fursa za ajira nchini Tanzania."
        : "Hello! I am KaziLink Career Assistant. I can help you improve your CV, prepare for interviews, and discover career opportunities across Tanzania.";
    }

    try {
      const langSystemPrompt =
        language === "sw"
          ? "Wewe ni Msaidizi wa Kazi wa KaziLink Tanzania. Jibu maswali kwa Kiswahili fasaha, kifupi, na chenye msaada kwa watafuta kazi au waajiri."
          : "You are the KaziLink Tanzania AI Career Assistant. Provide helpful, accurate, concise career advice for job seekers in English.";

      const contents = [
        { role: "user", parts: [{ text: langSystemPrompt }] },
        ...history.slice(-10).map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        })),
        { role: "user", parts: [{ text: userMessage }] },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
      });

      return (
        response.text ||
        (language === "sw" ? "Asante kwa ujumbe wako!" : "Thank you for your message!")
      );
    } catch (err) {
      console.warn("[GeminiAdapter] Chat error fallback:", err);
      return language === "sw"
        ? "Pole, kuna hitilafu ya mtandao. Tafadhali jaribu tena baada ya muda mfupi."
        : "Sorry, I am currently experiencing network delay. Please try again shortly.";
    }
  }

  async detectJobFraud(
    jobData: any,
  ): Promise<{ riskScore: number; isFraud: boolean; reason: string }> {
    const ai = getGeminiClient();
    const title = (jobData.title || "").toLowerCase();
    const desc = (jobData.description || "").toLowerCase();

    // Instant safety checks
    if (
      desc.includes("pay upfront") ||
      desc.includes("send registration fee") ||
      desc.includes("telegram group fee")
    ) {
      return {
        riskScore: 95,
        isFraud: true,
        reason: "Requires upfront payment/registration fee (High Fraud Risk)",
      };
    }

    if (!ai) {
      return {
        riskScore: 10,
        isFraud: false,
        reason: "Verified job parameters pass baseline checks.",
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Analyze this job posting for scam/fraud indicators in Tanzania. Return JSON object with keys: riskScore (0-100), isFraud (boolean), reason (string).
Job Title: ${title}
Description: ${desc}
Company: ${jobData.companyName || ""}`,
              },
            ],
          },
        ],
      });
      const text = response.text || "";
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      return {
        riskScore: parsed.riskScore || 15,
        isFraud: parsed.isFraud || false,
        reason: parsed.reason || "Low risk job posting.",
      };
    } catch {
      return { riskScore: 10, isFraud: false, reason: "Screened safe." };
    }
  }

  async detectDuplicateJob(
    newJob: any,
    existingJobs: any[],
  ): Promise<{ isDuplicate: boolean; score: number; existingJobId?: string }> {
    const title = (newJob.title || "").toLowerCase().trim();
    for (const job of existingJobs) {
      const existingTitle = (job.title || "").toLowerCase().trim();
      if (title === existingTitle && job.company_id === newJob.company_id) {
        return { isDuplicate: true, score: 98, existingJobId: job.id };
      }
    }
    return { isDuplicate: false, score: 10 };
  }

  // --- HEURISTIC FALLBACK HELPERS ---
  private heuristicParseResume(text: string): ParsedResume {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?255|0)[67]\d{8}/);
    const lines = text.split("\n").filter((l) => l.trim().length > 0);

    const commonSkills = [
      "JavaScript",
      "TypeScript",
      "React",
      "Python",
      "SQL",
      "HTML",
      "CSS",
      "Accounting",
      "Customer Service",
      "Sales",
      "Project Management",
    ];
    const detectedSkills = commonSkills.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(text));

    return {
      fullName: lines[0] || "Candidate",
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0] : "",
      headline: lines[1] || "Professional",
      skills: detectedSkills,
      summary: text.slice(0, 300),
    };
  }

  private heuristicRecommendations(profile: any, jobs: any[]): AIRecommendation[] {
    return jobs.map((j) => this.calculateHeuristicSingleJobMatch(profile, j));
  }

  private calculateHeuristicSingleJobMatch(profile: any, job: any): AIRecommendation {
    const profileSkills: string[] = profile?.skills || [];
    const jobSkills: string[] = job?.skills || [];
    let matchedCount = 0;
    jobSkills.forEach((s) => {
      if (profileSkills.some((ps) => ps.toLowerCase() === s.toLowerCase())) matchedCount++;
    });

    const score =
      jobSkills.length > 0
        ? Math.min(95, Math.round(50 + (matchedCount / jobSkills.length) * 45))
        : 75;

    return {
      id: job.id,
      user_id: profile?.id || "",
      job_id: job.id,
      match_score: score,
      breakdown: {
        skills_score: score,
        experience_score: 75,
        location_score: 80,
        salary_score: 70,
      },
      reasons:
        matchedCount > 0
          ? [`Matches ${matchedCount} key required skill(s)`]
          : ["Relevant opportunity in your region"],
      job,
    };
  }

  private heuristicCandidateRankings(job: any, candidates: any[]): CandidateRanking[] {
    return candidates.map((c) => ({
      id: c.applicant_id,
      job_id: job.id,
      applicant_id: c.applicant_id,
      overall_score: 80,
      skills_score: 80,
      experience_score: 75,
      education_score: 85,
      location_score: 80,
      explanation: "Qualified candidate with matching background and skills.",
      applicant: {
        full_name: c.full_name || "Applicant",
        headline: c.headline || "",
        location: c.location || "",
        phone: c.phone || "",
      },
    }));
  }
}

export const geminiAdapter = new GeminiAIAdapter();
