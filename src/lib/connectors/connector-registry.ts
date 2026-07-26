import type {
  ConnectorConfig,
  ConnectorAdapter,
  RawJobFeedItem,
  SyncLogEntry,
} from "./types";
import {
  RemoteOKConnector,
  WeWorkRemotelyConnector,
  GovernmentPortalConnector,
  NGOUnjobsConnector,
} from "./sample-connectors";
import { aiAggregationProcessor } from "../aggregation/ai-aggregation-processor";

const DEFAULT_CONNECTORS: ConnectorConfig[] = [
  new RemoteOKConnector().config,
  new WeWorkRemotelyConnector().config,
  new GovernmentPortalConnector().config,
  new NGOUnjobsConnector().config,
  {
    id: "linkedin_partner",
    name: "LinkedIn Partner Feed XML/JSON",
    type: "linkedin",
    category: "PartnerFeed",
    description: "Verified LinkedIn jobs distributor XML/JSON partner feed for global software, finance, and engineering roles.",
    endpointUrl: "https://api.linkedin.com/v2/jobPostingFeeds",
    apiKeyRequired: true,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 60,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    totalJobsImported: 5410,
    failedImportsCount: 3,
    avgAiConfidence: 99.2,
    countryFocus: "Global",
    rateLimitPerMin: 500,
  },
  {
    id: "indeed_publisher",
    name: "Indeed Publisher API & Feed",
    type: "indeed",
    category: "API",
    description: "Indeed Publisher XML & JSON API connector with automated deduplication and location mapping.",
    endpointUrl: "https://api.indeed.com/ads/apisearch",
    apiKeyRequired: true,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 30,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    totalJobsImported: 4230,
    failedImportsCount: 1,
    avgAiConfidence: 97.5,
    countryFocus: "Global",
    rateLimitPerMin: 1000,
  },
  {
    id: "google_jobs_sd",
    name: "Google Jobs Structured Schema Feed",
    type: "google_jobs",
    category: "StructuredData",
    description: "Ingest schema.org/JobPosting JSON-LD structured data from verified employer career portals.",
    endpointUrl: "https://google.com/jobs/structured-feed",
    apiKeyRequired: false,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 120,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    totalJobsImported: 1890,
    failedImportsCount: 0,
    avgAiConfidence: 98.7,
    countryFocus: "Global",
    rateLimitPerMin: 300,
  },
  {
    id: "wellfound_angel",
    name: "Wellfound (AngelList Startup Jobs)",
    type: "wellfound",
    category: "API",
    description: "Startup, AI, crypto, and growth tech company roles with equity & salary transparency.",
    endpointUrl: "https://wellfound.com/api/v1/jobs",
    apiKeyRequired: true,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 60,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
    totalJobsImported: 960,
    failedImportsCount: 0,
    avgAiConfidence: 96.9,
    countryFocus: "Global",
    rateLimitPerMin: 100,
  },
  {
    id: "ats_greenhouse_lever",
    name: "ATS Integration (Greenhouse / Lever / Workday)",
    type: "ats_greenhouse_lever",
    category: "ATS",
    description: "Direct webhook and API connector for employer Applicant Tracking Systems.",
    endpointUrl: "https://boards-api.greenhouse.io/v1/boards/kazilink/jobs",
    apiKeyRequired: true,
    status: "active",
    enabled: true,
    syncIntervalMinutes: 15,
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    nextSyncAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    totalJobsImported: 1320,
    failedImportsCount: 0,
    avgAiConfidence: 99.8,
    countryFocus: "Global",
    rateLimitPerMin: 600,
  },
];

class ConnectorRegistry {
  private connectors: Map<string, ConnectorConfig> = new Map();
  private syncLogs: SyncLogEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("kazilink_connectors_config");
        if (stored) {
          const list: ConnectorConfig[] = JSON.parse(stored);
          list.forEach((c) => this.connectors.set(c.id, c));
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load connector state from storage:", e);
    }

    DEFAULT_CONNECTORS.forEach((c) => this.connectors.set(c.id, c));
  }

  private saveToStorage() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "kazilink_connectors_config",
          JSON.stringify(Array.from(this.connectors.values()))
        );
      }
    } catch (e) {
      console.warn("Could not save connector state to storage:", e);
    }
  }

  getAllConnectors(): ConnectorConfig[] {
    return Array.from(this.connectors.values());
  }

  getConnector(id: string): ConnectorConfig | undefined {
    return this.connectors.get(id);
  }

  toggleConnector(id: string, enabled: boolean): ConnectorConfig {
    const conn = this.connectors.get(id);
    if (!conn) throw new Error(`Connector ${id} not found`);
    conn.enabled = enabled;
    conn.status = enabled ? "active" : "paused";
    this.saveToStorage();
    return conn;
  }

  updateConnectorConfig(id: string, updates: Partial<ConnectorConfig>): ConnectorConfig {
    const conn = this.connectors.get(id);
    if (!conn) throw new Error(`Connector ${id} not found`);
    Object.assign(conn, updates);
    this.saveToStorage();
    return conn;
  }

  addCustomConnector(newConfig: Omit<ConnectorConfig, "id" | "totalJobsImported" | "failedImportsCount" | "avgAiConfidence">): ConnectorConfig {
    const id = `custom_${Date.now()}`;
    const fullConfig: ConnectorConfig = {
      ...newConfig,
      id,
      totalJobsImported: 0,
      failedImportsCount: 0,
      avgAiConfidence: 95.0,
      lastSyncAt: new Date().toISOString(),
      nextSyncAt: new Date(Date.now() + newConfig.syncIntervalMinutes * 60 * 1000).toISOString(),
    };
    this.connectors.set(id, fullConfig);
    this.saveToStorage();
    return fullConfig;
  }

  async runManualSync(id: string): Promise<SyncLogEntry> {
    const startTime = Date.now();
    const conn = this.connectors.get(id);
    if (!conn) throw new Error(`Connector ${id} not found`);

    if (!conn.enabled) {
      throw new Error(`Connector ${conn.name} is currently disabled.`);
    }

    // Instantiating matching adapter or generator
    let rawItems: RawJobFeedItem[] = [];
    if (id === "remote_ok") {
      rawItems = await new RemoteOKConnector().fetchJobs();
    } else if (id === "we_work_remotely") {
      rawItems = await new WeWorkRemotelyConnector().fetchJobs();
    } else if (id === "gov_utumishi") {
      rawItems = await new GovernmentPortalConnector().fetchJobs();
    } else if (id === "ngo_unjobs") {
      rawItems = await new NGOUnjobsConnector().fetchJobs();
    } else {
      // Generated high quality partner feed items for LinkedIn, Indeed, Google Jobs, ATS, Wellfound
      rawItems = this.generateSimulatedFeedItems(conn);
    }

    // Pass through AI Processing Engine (Deduplication, Fraud Detection, Translation, Salary Normalization)
    const processed = aiAggregationProcessor.processBatch(rawItems);

    const importedCount = processed.filter((p) => !p.isFraudFlagged && !p.isDuplicate).length;
    const duplicatesCount = processed.filter((p) => p.isDuplicate).length;
    const fraudCount = processed.filter((p) => p.isFraudFlagged).length;

    // Update connector stats
    conn.lastSyncAt = new Date().toISOString();
    conn.nextSyncAt = new Date(Date.now() + conn.syncIntervalMinutes * 60 * 1000).toISOString();
    conn.totalJobsImported += importedCount;
    this.saveToStorage();

    const executionTimeMs = Date.now() - startTime;
    const logEntry: SyncLogEntry = {
      id: `sync_log_${Date.now()}`,
      connectorId: id,
      connectorName: conn.name,
      timestamp: new Date().toISOString(),
      status: fraudCount > 2 ? "partial" : "success",
      jobsFetched: rawItems.length,
      jobsImported: importedCount,
      duplicatesFound: duplicatesCount,
      fraudFlagged: fraudCount,
      executionTimeMs,
    };

    this.syncLogs.unshift(logEntry);
    if (this.syncLogs.length > 50) this.syncLogs.pop();

    return logEntry;
  }

  getSyncLogs(): SyncLogEntry[] {
    if (this.syncLogs.length === 0) {
      // Seed initial sample sync history for admin dashboard display
      this.syncLogs = [
        {
          id: "log_101",
          connectorId: "remote_ok",
          connectorName: "Remote OK Global Feed",
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          status: "success",
          jobsFetched: 45,
          jobsImported: 42,
          duplicatesFound: 3,
          fraudFlagged: 0,
          executionTimeMs: 340,
        },
        {
          id: "log_102",
          connectorId: "linkedin_partner",
          connectorName: "LinkedIn Partner Feed XML/JSON",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: "success",
          jobsFetched: 120,
          jobsImported: 114,
          duplicatesFound: 5,
          fraudFlagged: 1,
          executionTimeMs: 620,
        },
        {
          id: "log_103",
          connectorId: "gov_utumishi",
          connectorName: "Tanzania Public Service (UTUMISHI / PSRS)",
          timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          status: "success",
          jobsFetched: 28,
          jobsImported: 28,
          duplicatesFound: 0,
          fraudFlagged: 0,
          executionTimeMs: 410,
        },
      ];
    }
    return this.syncLogs;
  }

  private generateSimulatedFeedItems(conn: ConnectorConfig): RawJobFeedItem[] {
    return [
      {
        externalId: `${conn.id}_${Date.now()}_1`,
        sourceConnectorId: conn.id,
        sourceName: conn.name,
        title: `Senior Cloud Architect & DevOps (${conn.name})`,
        companyName: "Microsoft East Africa & Cloud Partners",
        companyLogoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60",
        locationRaw: "Dar es Salaam, Tanzania / Hybrid",
        country: "Tanzania",
        region: "Dar es Salaam",
        lat: -6.7924,
        lng: 39.2083,
        description: "Designing cloud infrastructure on Azure and AWS for pan-African banking systems.",
        requirements: "Terraform, Kubernetes, Docker, Azure, AWS, Cybersecurity.",
        employmentTypeRaw: "Full Time",
        experienceLevelRaw: "Senior",
        salaryMinRaw: 12000000,
        salaryMaxRaw: 18000000,
        currencyRaw: "TZS",
        isRemote: true,
        applyUrl: conn.endpointUrl,
        postedAt: new Date().toISOString(),
      },
    ];
  }
}

export const connectorRegistry = new ConnectorRegistry();
