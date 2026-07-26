# KaziLink Tanzania — Disaster Recovery & Business Continuity Plan

## 1. Governance & Recovery Objectives

| Metric                             | Target Goal      | Description                                                                                       |
| :--------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------ |
| **Recovery Point Objective (RPO)** | **< 5 Minutes**  | Maximum allowable data loss measured in transaction time.                                         |
| **Recovery Time Objective (RTO)**  | **< 30 Minutes** | Maximum allowable platform downtime during catastrophic failure.                                  |
| **Data Retention**                 | **7 Years**      | Audit logs and employer record retention compliant with Tanzanian financial/employment standards. |

---

## 2. Automated Backup Strategy

### Database Backups (Supabase PostgreSQL)

- **Continuous Point-In-Time Recovery (PITR):** Enables restoration to any second within the past 7 days.
- **Daily Automated Snapshots:** Full database snapshots taken daily at 02:00 EAT and replicated to geographically distinct storage regions.
- **Weekly Cold Storage Backups:** Exported to encrypted cold storage with write-once-read-many (WORM) policies.

### Storage Bucket Backups

- **Object Versioning:** Enabled across all private buckets (`resumes`, `company_logos`, `avatars`).
- **Cross-Region Replication:** Syncs uploaded documents to secondary Cloud Run / S3 storage targets.

---

## 3. Disaster Recovery Execution Runbook

### Scenario A: Database Corruption or Data Loss

1. **Declare Incident:** Security lead initiates incident command protocol.
2. **Freeze Traffic:** Route ingress traffic to maintenance page via Nginx edge reverse proxy.
3. **Execute PITR:** Initiate Supabase PITR restoration to timestamp immediately prior to corrupting event ($T_{-1\text{min}}$).
4. **Verify Integrity:** Run automated SQL integrity checks (`bun run test`) against restored instance.
5. **Resume Service:** Re-enable edge traffic and issue post-incident notice.

### Scenario B: Primary Cloud Region Failure

1. **Detect Outage:** Automated monitoring alerts on 3 consecutive health check failures.
2. **DNS Failover:** Update Cloudflare/DNS records to route traffic to secondary Cloud Run container cluster.
3. **Storage Failover:** Mount secondary storage mirror.
4. **Notify System Admins:** Admin alert sent via webhook and SMS.
