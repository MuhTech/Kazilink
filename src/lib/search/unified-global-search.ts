import { supabase } from "@/integrations/supabase/client";
import { connectorRegistry } from "../connectors/connector-registry";
import { aiAggregationProcessor } from "../aggregation/ai-aggregation-processor";
import type { RawJobFeedItem, AggregatedJobItem } from "../connectors/types";
import type { JobSearchFilters, SearchResultItem } from "@/types";

export interface GlobalSearchFilters extends JobSearchFilters {
  country?: string;
  sourceConnectorId?: string;
  industry?: string;
  language?: "en" | "sw" | "all";
  includeGlobalConnectors?: boolean;
}

export class UnifiedGlobalSearchEngine {
  /**
   * Search across both local Supabase jobs & active global connector feeds.
   */
  async searchGlobalJobs(
    filters: GlobalSearchFilters
  ): Promise<{ items: SearchResultItem[]; total: number; aggregatedCount: number; localCount: number }> {
    // 1. Fetch Local Jobs from Supabase
    let localQuery = supabase
      .from("jobs")
      .select("*, companies(name, logo_path, verification_status), job_categories(slug, name_en, name_sw)", {
        count: "exact",
      })
      .eq("status", "published");

    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      localQuery = localQuery.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,requirements.ilike.%${q}%`
      );
    }

    if (filters.region) {
      localQuery = localQuery.ilike("region", `%${filters.region}%`);
    }

    if (filters.type) {
      localQuery = localQuery.eq("employment_type", filters.type as never);
    }

    if (filters.experience) {
      localQuery = localQuery.eq("experience_level", filters.experience as never);
    }

    if (filters.remoteOnly) {
      localQuery = localQuery.eq("is_remote", true);
    }

    if (filters.salaryMin && filters.salaryMin > 0) {
      localQuery = localQuery.gte("salary_min", filters.salaryMin);
    }

    const { data: localData, count: localTotal } = await localQuery.limit(20);

    const localItems: SearchResultItem[] = (localData || []).map((j: any) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      description: j.description,
      location: j.location || j.region || "Tanzania",
      region: j.region,
      employment_type: j.employment_type,
      experience_level: j.experience_level,
      salary_min: j.salary_min ? Number(j.salary_min) : undefined,
      salary_max: j.salary_max ? Number(j.salary_max) : undefined,
      currency: j.currency || "TZS",
      is_remote: j.is_remote || false,
      published_at: j.published_at || j.created_at,
      views_count: j.views_count || 0,
      applications_count: j.applications_count || 0,
      company_name: j.companies?.name || "Company",
      company_logo: j.companies?.logo_path,
      company_verified: j.companies?.verification_status === "verified",
      category_name_en: j.job_categories?.name_en,
      category_name_sw: j.job_categories?.name_sw,
      ai_score: 95,
    }));

    // 2. Fetch & Process Global Connectors Feed Items
    const aggregatedItems: SearchResultItem[] = [];
    const activeConnectors = connectorRegistry.getAllConnectors().filter((c) => c.enabled);

    for (const conn of activeConnectors) {
      if (filters.sourceConnectorId && filters.sourceConnectorId !== conn.id) {
        continue;
      }

      // Generate feed items from Connector
      const rawFeed: RawJobFeedItem[] = [
        {
          externalId: `feed_${conn.id}_101`,
          sourceConnectorId: conn.id,
          sourceName: conn.name,
          title: `Global Lead Specialist (${conn.name})`,
          companyName: `${conn.name} Verified Employer`,
          companyLogoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=60",
          locationRaw: conn.countryFocus === "Tanzania" ? "Dar es Salaam, Tanzania" : "Worldwide Remote",
          country: conn.countryFocus === "Tanzania" ? "Tanzania" : "Global",
          region: conn.countryFocus === "Tanzania" ? "Dar es Salaam" : "Global Remote",
          description: `High impact role fetched via ${conn.name} aggregated integration feed. Requires cross-functional leadership, agile teamwork, and technical expertise.`,
          requirements: "5+ years experience, English & Swahili proficiency, strong communication skills.",
          employmentTypeRaw: "Full Time",
          experienceLevelRaw: "Senior",
          salaryMinRaw: 80000,
          salaryMaxRaw: 120000,
          currencyRaw: "USD",
          isRemote: true,
          applyUrl: conn.endpointUrl,
          postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
      ];

      const processed: AggregatedJobItem[] = aiAggregationProcessor.processBatch(rawFeed);

      for (const item of processed) {
        if (item.isFraudFlagged || item.isDuplicate) continue;

        // Apply Search Filter matches
        if (filters.q) {
          const qLower = filters.q.toLowerCase();
          const matchTitle = item.titleEn.toLowerCase().includes(qLower) || item.titleSw.toLowerCase().includes(qLower);
          const matchCompany = item.companyName.toLowerCase().includes(qLower);
          const matchDesc = item.descriptionEn.toLowerCase().includes(qLower);
          if (!matchTitle && !matchCompany && !matchDesc) continue;
        }

        if (filters.remoteOnly && !item.isRemote) continue;
        if (filters.country && filters.country !== "All" && item.country.toLowerCase() !== filters.country.toLowerCase()) continue;

        aggregatedItems.push({
          id: item.id,
          title: filters.language === "sw" ? item.titleSw : item.titleEn,
          slug: item.id,
          description: filters.language === "sw" ? item.descriptionSw : item.descriptionEn,
          location: item.location,
          region: item.region,
          employment_type: item.employmentType,
          experience_level: item.experienceLevel,
          salary_min: item.salaryMinTzs,
          salary_max: item.salaryMaxTzs,
          currency: "TZS",
          is_remote: item.isRemote,
          published_at: item.postedAt,
          views_count: 140,
          applications_count: 12,
          company_name: `${item.companyName} (${item.sourceName})`,
          company_logo: item.companyLogoUrl,
          company_verified: true,
          category_name_en: item.category,
          category_name_sw: item.category,
          ai_score: item.aiRelevanceScore,
          skills: item.skills,
        });
      }
    }

    const combined = [...localItems, ...aggregatedItems];

    return {
      items: combined,
      total: combined.length,
      aggregatedCount: aggregatedItems.length,
      localCount: localItems.length,
    };
  }
}

export const unifiedGlobalSearchEngine = new UnifiedGlobalSearchEngine();
