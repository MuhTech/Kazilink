import { supabase } from "@/integrations/supabase/client";
import { aiLearningEngine } from "@/lib/ai/ai-learning-engine";
import type {
  JobSearchFilters,
  SearchResultItem,
  SearchProviderAdapter,
  SearchSynonym,
} from "@/types";

export const TANZANIA_REGIONS = [
  "Dar es Salaam",
  "Mwanza",
  "Arusha",
  "Dodoma",
  "Kilimanjaro",
  "Tanga",
  "Zanzibar",
  "Mbeya",
  "Morogoro",
  "Tabora",
  "Kagera",
  "Kigoma",
  "Iringa",
  "Ruvuma",
  "Lindi",
  "Mtwara",
  "Shinyanga",
  "Mara",
  "Singida",
  "Rukwa",
  "Manyara",
  "Geita",
  "Katavi",
  "Njombe",
  "Songwe",
];

export class PostgresSearchAdapter implements SearchProviderAdapter {
  name = "PostgreSQL Enterprise Full-Text Search Adapter with AI Continuous Learning";

  async searchJobs(
    filters: JobSearchFilters,
  ): Promise<{ items: SearchResultItem[]; total: number }> {
    let query = supabase
      .from("jobs")
      .select(
        "*, companies(name, logo_path, verification_status), job_categories(slug, name_en, name_sw)",
        { count: "exact" },
      )
      .eq("status", "published");

    // Full-Text & Query search with AI Semantic Query Expansion
    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      // Log interaction to AI Learning Engine
      void aiLearningEngine.logSearchInteraction(q, "text", filters.userId);

      // Expand synonyms and cross-lingual equivalents via AI Knowledge Graph
      const expandedTerms = aiLearningEngine.expandSemanticQuery(q);
      const expandedQuery = expandedTerms.join("|");

      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,requirements.ilike.%${q}%,title.ilike.%${expandedQuery}%`,
      );
    }

    // Regional & Tanzanian location filters
    if (filters.region) {
      query = query.ilike("region", `%${filters.region}%`);
    }

    if (filters.type) {
      query = query.eq("employment_type", filters.type as never);
    }

    if (filters.experience) {
      query = query.eq("experience_level", filters.experience as never);
    }

    if (filters.remoteOnly) {
      query = query.eq("is_remote", true);
    }

    if (filters.salaryMin && filters.salaryMin > 0) {
      query = query.gte("salary_min", filters.salaryMin);
    }

    if (filters.salaryMax && filters.salaryMax > 0) {
      query = query.lte("salary_max", filters.salaryMax);
    }

    if (filters.currency) {
      query = query.eq("currency", filters.currency);
    }

    if (filters.postedWithinDays && filters.postedWithinDays > 0) {
      const dateCutoff = new Date();
      dateCutoff.setDate(dateCutoff.getDate() - filters.postedWithinDays);
      query = query.gte("published_at", dateCutoff.toISOString());
    }

    // Sorting
    if (filters.sortBy === "salary_desc") {
      query = query.order("salary_max", { ascending: false, nullsFirst: false });
    } else if (filters.sortBy === "salary_asc") {
      query = query.order("salary_min", { ascending: true, nullsFirst: false });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error("[SearchService] Search error:", error);
      throw error;
    }

    const items: SearchResultItem[] = (data || []).map((j: any) => ({
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
    }));

    return { items, total: count || items.length };
  }

  async getSuggestions(query: string, lang: "en" | "sw"): Promise<string[]> {
    if (!query || query.trim().length < 1) return [];
    return aiLearningEngine.getSmartAutocomplete(query, lang);
  }

  private expandSynonyms(term: string): string {
    const termLower = term.toLowerCase();
    const dictionary: Record<string, string> = {
      dereva: "driver",
      mhasibu: "accountant",
      mwalimu: "teacher",
      "fundi umeme": "electrician",
      "mhandisi wa programu": "software engineer",
      mwanaprogramu: "developer",
      meneja: "manager",
      ajira: "job",
    };
    return dictionary[termLower] || termLower;
  }
}

export const postgresSearchAdapter = new PostgresSearchAdapter();

class SearchService {
  private adapter: SearchProviderAdapter = postgresSearchAdapter;

  setAdapter(newAdapter: SearchProviderAdapter) {
    this.adapter = newAdapter;
  }

  async search(filters: JobSearchFilters) {
    return this.adapter.searchJobs(filters);
  }

  async getSuggestions(query: string, lang: "en" | "sw") {
    return this.adapter.getSuggestions(query, lang);
  }

  async logSearch(
    userId: string | undefined,
    queryText: string,
    filters: any,
    resultsCount: number,
  ) {
    try {
      await (supabase.from("search_history" as any) as any).insert({
        user_id: userId || null,
        query_text: queryText,
        filters,
        results_count: resultsCount,
      });
    } catch (e) {
      console.warn("[SearchService] Could not log search:", e);
    }
  }
}

export const searchService = new SearchService();
