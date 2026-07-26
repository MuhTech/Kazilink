import { describe, it, expect } from "vitest";
import { geminiAdapter } from "@/lib/ai/gemini-adapter";

describe("AI Provider Adapter Suite", () => {
  it("should parse resume plain text accurately via fallback", async () => {
    const resumeText = `Juma Kapuya
Software Engineer
Email: juma.kapuya@kazilink.co.tz
Phone: +255712345678
Location: Dar es Salaam

Summary:
Experienced Full-Stack React and TypeScript Developer.

Skills:
React, TypeScript, Python, SQL`;

    const parsed = await geminiAdapter.parseResume(resumeText);
    expect(parsed.fullName).toBe("Juma Kapuya");
    expect(parsed.email).toBe("juma.kapuya@kazilink.co.tz");
    expect(parsed.phone).toBe("+255712345678");
    expect(parsed.skills).toContain("React");
    expect(parsed.skills).toContain("TypeScript");
  });

  it("should detect scam/fraud job postings requesting upfront fees", async () => {
    const fraudJob = {
      title: "Data Entry Clerk",
      companyName: "Fake Firm TZ",
      description:
        "Send registration fee of 20000 TZS to telegram group pay upfront before interview.",
    };

    const res = await geminiAdapter.detectJobFraud(fraudJob);
    expect(res.isFraud).toBe(true);
    expect(res.riskScore).toBeGreaterThanOrEqual(90);
  });

  it("should calculate heuristic candidate match recommendations", async () => {
    const profile = {
      id: "u1",
      skills: ["React", "TypeScript", "Node.js"],
      location: "Dar es Salaam",
    };

    const jobs = [
      {
        id: "j1",
        title: "Frontend Developer",
        location: "Dar es Salaam",
        skills: ["React", "TypeScript"],
      },
      {
        id: "j2",
        title: "Civil Engineer",
        location: "Arusha",
        skills: ["AutoCAD", "Structural Engineering"],
      },
    ];

    const recs = await geminiAdapter.generateJobRecommendations(profile, jobs);
    expect(recs.length).toBe(2);
    expect(recs[0].match_score).toBeGreaterThan(recs[1].match_score);
  });
});
