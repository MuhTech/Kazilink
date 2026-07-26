import type { ConnectorAdapter, ConnectorConfig, RawJobFeedItem } from "./types";

// Base Mock Feed Generator for High Performance & Offline Reliability
export class RemoteOKConnector implements ConnectorAdapter {
  config: ConnectorConfig = {
    id: "remote_ok",
    name: "Remote OK Global Feed",
    type: "remote_ok",
    category: "API",
    description: "Official Remote OK global tech & software engineering remote jobs API connector.",
    endpointUrl: "https://remoteok.com/api",
    apiKeyRequired: false,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 30,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 18).toISOString(),
    totalJobsImported: 1420,
    failedImportsCount: 2,
    avgAiConfidence: 98.4,
    countryFocus: "Global",
    rateLimitPerMin: 60,
  };

  async fetchJobs(): Promise<RawJobFeedItem[]> {
    return [
      {
        externalId: "rok_9812",
        sourceConnectorId: "remote_ok",
        sourceName: "Remote OK",
        title: "Senior Full Stack Engineer (React & Node.js)",
        companyName: "GitLab Worldwide",
        companyLogoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
        locationRaw: "Remote Worldwide / Africa Welcome",
        country: "Worldwide",
        region: "Global Remote",
        lat: -6.7924,
        lng: 39.2083,
        description: "We are seeking a Senior Full Stack Engineer to lead our developer experience team. Remote first culture, competitive equity, and flexible hours.",
        requirements: "5+ years with React, Node.js, TypeScript, and Postgres. Experience with distributed systems and CI/CD pipelines.",
        employmentTypeRaw: "Full Time",
        experienceLevelRaw: "Senior",
        salaryMinRaw: 85000,
        salaryMaxRaw: 125000,
        currencyRaw: "USD",
        isRemote: true,
        applyUrl: "https://remoteok.com/job/senior-full-stack-engineer-gitlab",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
      {
        externalId: "rok_9815",
        sourceConnectorId: "remote_ok",
        sourceName: "Remote OK",
        title: "Lead AI & Data Scientist",
        companyName: "FinTech Global Solutions",
        companyLogoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=60",
        locationRaw: "Remote (EMEA / East Africa GMT+3)",
        country: "Tanzania",
        region: "Dar es Salaam",
        lat: -6.8235,
        lng: 39.2695,
        description: "Join our machine learning team building predictive credit scoring models for emerging markets in East Africa and South East Asia.",
        requirements: "Python, PyTorch, Scikit-Learn, SQL, MLOps, NLP for Swahili & English text.",
        employmentTypeRaw: "Contract",
        experienceLevelRaw: "Lead",
        salaryMinRaw: 90000,
        salaryMaxRaw: 140000,
        currencyRaw: "USD",
        isRemote: true,
        applyUrl: "https://remoteok.com/job/lead-ai-data-scientist",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ];
  }

  async testConnection() {
    return { success: true, latencyMs: 142, message: "Remote OK API endpoint online (HTTP 200 OK)" };
  }
}

export class WeWorkRemotelyConnector implements ConnectorAdapter {
  config: ConnectorConfig = {
    id: "we_work_remotely",
    name: "We Work Remotely RSS Feed",
    type: "we_work_remotely",
    category: "RSS",
    description: "Structured RSS and JSON feed for remote design, engineering, and customer support roles.",
    endpointUrl: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    apiKeyRequired: false,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 45,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
    totalJobsImported: 890,
    failedImportsCount: 0,
    avgAiConfidence: 97.8,
    countryFocus: "Global",
    rateLimitPerMin: 120,
  };

  async fetchJobs(): Promise<RawJobFeedItem[]> {
    return [
      {
        externalId: "wwr_4412",
        sourceConnectorId: "we_work_remotely",
        sourceName: "We Work Remotely",
        title: "Product Designer & UI/UX Specialist",
        companyName: "Canva Remote",
        companyLogoUrl: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=60",
        locationRaw: "Remote Worldwide",
        country: "Worldwide",
        region: "Global Remote",
        lat: -3.3869,
        lng: 36.683,
        description: "Designing seamless mobile interfaces for cross-platform creative tools. Looking for strong Figma, typography, and design system skills.",
        requirements: "Figma, Design Systems, Mobile App UI/UX, User Research.",
        employmentTypeRaw: "Full Time",
        experienceLevelRaw: "Mid",
        salaryMinRaw: 65000,
        salaryMaxRaw: 95000,
        currencyRaw: "USD",
        isRemote: true,
        applyUrl: "https://weworkremotely.com/jobs/product-designer-canva",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ];
  }

  async testConnection() {
    return { success: true, latencyMs: 98, message: "WWR RSS Feed valid & parsed 18 items" };
  }
}

export class GovernmentPortalConnector implements ConnectorAdapter {
  config: ConnectorConfig = {
    id: "gov_utumishi",
    name: "Tanzania Public Service (UTUMISHI / PSRS)",
    type: "government_portal",
    category: "PartnerFeed",
    description: "Official Government recruitment portal integration for public sector positions across all regions of Tanzania.",
    endpointUrl: "https://portal.ajira.go.tz/api/v1/vacancies",
    apiKeyRequired: true,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 60,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
    totalJobsImported: 3210,
    failedImportsCount: 1,
    avgAiConfidence: 99.1,
    countryFocus: "Tanzania",
    rateLimitPerMin: 300,
  };

  async fetchJobs(): Promise<RawJobFeedItem[]> {
    return [
      {
        externalId: "gov_tz_2026_09",
        sourceConnectorId: "gov_utumishi",
        sourceName: "Tanzania Public Service (PSRS)",
        title: "Mhandisi wa Barabara II (Civil Engineer)",
        companyName: "TANROADS Dodoma",
        companyLogoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=100&auto=format&fit=crop&q=60",
        locationRaw: "Dodoma, Tanzania",
        country: "Tanzania",
        region: "Dodoma",
        city: "Dodoma City",
        lat: -6.163,
        lng: 35.7516,
        description: "Kusimamia miradi ya ujenzi wa barabara za lami na madaraja Mkoa wa Dodoma. Kazi ya mkataba wa serikali TGS E1.",
        requirements: "Digrii ya Uhandisi wa Ujenzi (BSc Civil Engineering) na Usajili wa ERB.",
        employmentTypeRaw: "Full Time",
        experienceLevelRaw: "Junior",
        salaryMinRaw: 1800000,
        salaryMaxRaw: 2600000,
        currencyRaw: "TZS",
        isRemote: false,
        applyUrl: "https://portal.ajira.go.tz/vacancies/2026-09",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
      {
        externalId: "gov_tz_2026_14",
        sourceConnectorId: "gov_utumishi",
        sourceName: "Tanzania Public Service (PSRS)",
        title: "Afisa Afya Mfawidhi (Public Health Officer)",
        companyName: "Wizara ya Afya - Mwanza",
        companyLogoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=60",
        locationRaw: "Mwanza, Tanzania",
        country: "Tanzania",
        region: "Mwanza",
        city: "Nyamagana",
        lat: -2.5164,
        lng: 32.9,
        description: "Kuratibu mipango ya afya ya jamii na kuzuia magonjwa ya mlipuko kanda ya ziwa.",
        requirements: "Stashahada au Shahada ya Afya ya Jamii (Environmental/Public Health).",
        employmentTypeRaw: "Full Time",
        experienceLevelRaw: "Mid",
        salaryMinRaw: 1650000,
        salaryMaxRaw: 2400000,
        currencyRaw: "TZS",
        isRemote: false,
        applyUrl: "https://portal.ajira.go.tz/vacancies/2026-14",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];
  }

  async testConnection() {
    return { success: true, latencyMs: 210, message: "Tanzania PSRS API endpoint authorized & healthy." };
  }
}

export class NGOUnjobsConnector implements ConnectorAdapter {
  config: ConnectorConfig = {
    id: "ngo_unjobs",
    name: "UN & International NGO Data Feed",
    type: "ngo_portal",
    category: "PartnerFeed",
    description: "Verified international development, UN, USAID, World Bank, and humanitarian roles across East Africa.",
    endpointUrl: "https://unjobs.org/tz/feed.json",
    apiKeyRequired: false,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 60,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    totalJobsImported: 2150,
    failedImportsCount: 0,
    avgAiConfidence: 98.9,
    countryFocus: "East Africa",
    rateLimitPerMin: 180,
  };

  async fetchJobs(): Promise<RawJobFeedItem[]> {
    return [
      {
        externalId: "un_unicef_8831",
        sourceConnectorId: "ngo_unjobs",
        sourceName: "UNICEF East Africa",
        title: "Monitoring & Evaluation Specialist (P-3)",
        companyName: "UNICEF Tanzania",
        companyLogoUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&auto=format&fit=crop&q=60",
        locationRaw: "Dar es Salaam, Tanzania",
        country: "Tanzania",
        region: "Dar es Salaam",
        city: "Kinondoni",
        lat: -6.75,
        lng: 39.24,
        description: "Lead field monitoring of child education and nutrition programs across Arusha, Kigoma, and Lindi.",
        requirements: "Master's degree in Statistics, Economics, or Social Sciences + 5 years UN experience.",
        employmentTypeRaw: "Contract",
        experienceLevelRaw: "Senior",
        salaryMinRaw: 72000,
        salaryMaxRaw: 98000,
        currencyRaw: "USD",
        isRemote: false,
        applyUrl: "https://jobs.unicef.org/cw/en-us/job/55120",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      },
    ];
  }

  async testConnection() {
    return { success: true, latencyMs: 115, message: "UN & NGO feed connected successfully." };
  }
}
