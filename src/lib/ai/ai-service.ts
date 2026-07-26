import { geminiAdapter } from "./gemini-adapter";
import type {
  AIProviderAdapter,
  ParsedResume,
  AIRecommendation,
  CandidateRanking,
  AICareerChatMessage,
} from "@/types";

export class AIService {
  private adapter: AIProviderAdapter = geminiAdapter;

  setAdapter(newAdapter: AIProviderAdapter) {
    this.adapter = newAdapter;
  }

  getAdapterName(): string {
    return this.adapter.name;
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    return this.adapter.parseResume(resumeText);
  }

  async getRecommendations(profile: any, jobs: any[]): Promise<AIRecommendation[]> {
    return this.adapter.generateJobRecommendations(profile, jobs);
  }

  async rankCandidates(job: any, candidates: any[]): Promise<CandidateRanking[]> {
    return this.adapter.rankCandidates(job, candidates);
  }

  async careerChat(
    history: AICareerChatMessage[],
    userMessage: string,
    language: "en" | "sw",
  ): Promise<string> {
    return this.adapter.careerAssistantChat(history, userMessage, language);
  }

  async detectFraud(
    jobData: any,
  ): Promise<{ riskScore: number; isFraud: boolean; reason: string }> {
    return this.adapter.detectJobFraud(jobData);
  }

  async detectDuplicateJob(
    newJob: any,
    existingJobs: any[],
  ): Promise<{ isDuplicate: boolean; score: number; existingJobId?: string }> {
    return this.adapter.detectDuplicateJob(newJob, existingJobs);
  }
}

export const aiService = new AIService();
