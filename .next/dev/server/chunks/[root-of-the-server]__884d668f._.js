module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSession",
    ()=>clearSession,
    "createSession",
    ()=>createSession,
    "getSession",
    ()=>getSession,
    "setSessionCookie",
    ()=>setSessionCookie,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
;
;
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production");
async function createSession(user) {
    const token = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"]({
        user
    }).setProtectedHeader({
        alg: "HS256"
    }).setIssuedAt().setExpirationTime("7d").sign(secret);
    return token;
}
async function getSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get("session")?.value;
    if (!token) {
        return null;
    }
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, secret);
        return payload.user;
    } catch (error) {
        return null;
    }
}
async function verifyToken(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, secret);
        return payload.user;
    } catch (error) {
        return null;
    }
}
async function setSessionCookie(token) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
    });
}
async function clearSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete("session");
}
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/perf_hooks [external] (perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("perf_hooks", () => require("perf_hooks"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isDemoMode",
    ()=>isDemoMode,
    "sql",
    ()=>sql
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/index.js [app-route] (ecmascript)");
;
const isDemoMode = !process.env.DATABASE_URL;
const sql = process.env.DATABASE_URL ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(process.env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
}) : ()=>{
    throw new Error("Database is not configured (DATABASE_URL missing)");
};
}),
"[project]/app/api/campaigns/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
async function ensureBulkCampaignTables(db) {
    try {
        await db`
      CREATE TABLE IF NOT EXISTS bulk_campaigns (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        send_mode VARCHAR(20) DEFAULT 'auto',
        whatsapp_template JSONB,
        status VARCHAR(20) DEFAULT 'scheduled',
        total INTEGER DEFAULT 0,
        sent INTEGER DEFAULT 0,
        failed INTEGER DEFAULT 0,
        skipped INTEGER DEFAULT 0,
        scheduled_at TIMESTAMP NULL,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        created_by INTEGER NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
        await db`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON bulk_campaigns(status)`;
        await db`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_created_at ON bulk_campaigns(created_at)`;
    } catch  {
    // ignore
    }
}
async function hasMessagesExtendedCols(db) {
    try {
        const rows = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('direction', 'metadata', 'read_at')
      ORDER BY column_name
    `;
        return Array.isArray(rows) && rows.length === 3;
    } catch  {
        return false;
    }
}
async function getMessagesColumns(db) {
    try {
        const rows = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('direction', 'metadata', 'read_at', 'sender_type', 'conversation_id', 'created_at')
      ORDER BY column_name
    `;
        return new Set((rows || []).map((r)=>String(r?.column_name || "").trim()).filter(Boolean));
    } catch  {
        return new Set();
    }
}
async function ensureWebhookLogsTable(db) {
    try {
        await db`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        channel VARCHAR(50) NOT NULL,
        external_id VARCHAR(255),
        payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
        await db`CREATE INDEX IF NOT EXISTS idx_webhook_logs_channel ON webhook_logs(channel)`;
        await db`CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed)`;
    } catch  {
    // ignore
    }
}
async function GET() {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
        if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Not authenticated"
        }, {
            status: 401
        });
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDemoMode"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Stats not available in demo mode"
            }, {
                status: 400
            });
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "DATABASE_URL missing",
                hint: "Configura DATABASE_URL para calcular estadísticas."
            }, {
                status: 500
            });
        }
        const db = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"];
        await ensureBulkCampaignTables(db);
        let activeCampaigns = 0;
        let totalSent = 0;
        let totalFailed = 0;
        let totalSkipped = 0;
        const computeFromMessages = async ()=>{
            try {
                const rows = await db`
          SELECT
            COUNT(*) FILTER (WHERE (metadata->>'source') = 'bulk' AND (metadata->'send'->>'ok') = 'true') AS sent,
            COUNT(*) FILTER (WHERE (metadata->>'source') = 'bulk' AND (metadata->'send'->>'skipped') = 'true') AS skipped,
            COUNT(*) FILTER (
              WHERE (metadata->>'source') = 'bulk'
                AND (metadata->'send'->>'ok') = 'false'
                AND COALESCE((metadata->'send'->>'skipped'), 'false') != 'true'
            ) AS failed
          FROM messages
          WHERE (metadata->>'campaignId') IS NOT NULL
        `;
                totalSent = Number(rows?.[0]?.sent || 0);
                totalFailed = Number(rows?.[0]?.failed || 0);
                totalSkipped = Number(rows?.[0]?.skipped || 0);
            } catch  {
            // ignore
            }
        };
        try {
            const rows = await db`
        SELECT
          COALESCE(SUM(sent), 0) AS sent,
          COALESCE(SUM(failed), 0) AS failed,
          COALESCE(SUM(skipped), 0) AS skipped
        FROM bulk_campaigns
      `;
            totalSent = Number(rows?.[0]?.sent || 0);
            totalFailed = Number(rows?.[0]?.failed || 0);
            totalSkipped = Number(rows?.[0]?.skipped || 0);
        } catch  {
            await computeFromMessages();
        }
        try {
            const rows = await db`
        SELECT COUNT(*) AS c
        FROM bulk_campaigns
        WHERE status IN ('scheduled', 'sending')
      `;
            activeCampaigns = Number(rows?.[0]?.c || 0);
        } catch  {
        // ignore
        }
        // Fallback/augmentation for active campaigns persisted as events in webhook_logs
        try {
            await ensureWebhookLogsTable(db);
            const rows = await db`
        WITH latest AS (
          SELECT DISTINCT ON (external_id)
            external_id,
            payload,
            created_at
          FROM webhook_logs
          WHERE channel = 'bulk_campaign'
            AND external_id IS NOT NULL
            AND external_id !~ '^[0-9]+$'
          ORDER BY external_id, created_at DESC
        )
        SELECT COUNT(*) AS c
        FROM latest
        WHERE COALESCE((payload->>'status'), '') IN ('scheduled', 'sending')
      `;
            const activeFromLogs = Number(rows?.[0]?.c || 0);
            activeCampaigns = Math.max(activeCampaigns, activeFromLogs);
        } catch  {
        // ignore
        }
        let readRate = 0;
        let responseRate = 0;
        const cols = await getMessagesColumns(db);
        const hasMetadata = cols.has("metadata");
        const hasReadAt = cols.has("read_at");
        const hasDirection = cols.has("direction");
        const hasSenderType = cols.has("sender_type");
        // Read rate
        if (hasMetadata) {
            try {
                if (hasReadAt && hasDirection) {
                    const rows = await db`
            SELECT
              COUNT(*) FILTER (WHERE read_at IS NOT NULL) AS read_count,
              COUNT(*) AS total_count
            FROM messages
            WHERE direction = 'outbound'
              AND (metadata->>'campaignId') IS NOT NULL
              AND COALESCE((metadata->>'source'), '') = 'bulk'
          `;
                    const readCount = Number(rows?.[0]?.read_count || 0);
                    const totalCount = Number(rows?.[0]?.total_count || 0);
                    readRate = totalCount > 0 ? Math.round(readCount / totalCount * 100) : 0;
                } else if (hasDirection) {
                    // Fallback if read_at doesn't exist: use last webhook status stored in metadata.
                    const rows = await db`
            SELECT
              COUNT(*) FILTER (WHERE (metadata->>'whatsappStatus') = 'read') AS read_count,
              COUNT(*) AS total_count
            FROM messages
            WHERE direction = 'outbound'
              AND (metadata->>'campaignId') IS NOT NULL
              AND COALESCE((metadata->>'source'), '') = 'bulk'
          `;
                    const readCount = Number(rows?.[0]?.read_count || 0);
                    const totalCount = Number(rows?.[0]?.total_count || 0);
                    readRate = totalCount > 0 ? Math.round(readCount / totalCount * 100) : 0;
                } else if (hasSenderType) {
                    // Fallback without direction column.
                    const rows = await db`
            SELECT
              COUNT(*) FILTER (WHERE (metadata->>'whatsappStatus') = 'read') AS read_count,
              COUNT(*) AS total_count
            FROM messages
            WHERE sender_type = 'agent'
              AND (metadata->>'campaignId') IS NOT NULL
              AND COALESCE((metadata->>'source'), '') = 'bulk'
          `;
                    const readCount = Number(rows?.[0]?.read_count || 0);
                    const totalCount = Number(rows?.[0]?.total_count || 0);
                    readRate = totalCount > 0 ? Math.round(readCount / totalCount * 100) : 0;
                }
            } catch  {
            // ignore
            }
        }
        // Response rate
        if (hasMetadata) {
            try {
                if (hasDirection) {
                    const rows = await db`
            WITH last_outbound AS (
              SELECT conversation_id, MAX(created_at) AS last_out_at
              FROM messages
              WHERE direction = 'outbound'
                AND (metadata->>'campaignId') IS NOT NULL
                AND COALESCE((metadata->>'source'), '') = 'bulk'
              GROUP BY conversation_id
            ), replied AS (
              SELECT DISTINCT m.conversation_id
              FROM messages m
              JOIN last_outbound lo ON lo.conversation_id = m.conversation_id
              WHERE m.direction = 'inbound'
                AND m.created_at > lo.last_out_at
            )
            SELECT
              (SELECT COUNT(*) FROM last_outbound) AS total,
              (SELECT COUNT(*) FROM replied) AS replied
          `;
                    const total = Number(rows?.[0]?.total || 0);
                    const replied = Number(rows?.[0]?.replied || 0);
                    responseRate = total > 0 ? Math.round(replied / total * 100) : 0;
                } else if (hasSenderType) {
                    const rows = await db`
            WITH last_outbound AS (
              SELECT conversation_id, MAX(created_at) AS last_out_at
              FROM messages
              WHERE sender_type = 'agent'
                AND (metadata->>'campaignId') IS NOT NULL
                AND COALESCE((metadata->>'source'), '') = 'bulk'
              GROUP BY conversation_id
            ), replied AS (
              SELECT DISTINCT m.conversation_id
              FROM messages m
              JOIN last_outbound lo ON lo.conversation_id = m.conversation_id
              WHERE m.sender_type IN ('customer','contact')
                AND m.created_at > lo.last_out_at
            )
            SELECT
              (SELECT COUNT(*) FROM last_outbound) AS total,
              (SELECT COUNT(*) FROM replied) AS replied
          `;
                    const total = Number(rows?.[0]?.total || 0);
                    const replied = Number(rows?.[0]?.replied || 0);
                    responseRate = total > 0 ? Math.round(replied / total * 100) : 0;
                }
            } catch  {
            // ignore
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            activeCampaigns,
            messagesSent: totalSent,
            messagesFailed: totalFailed,
            messagesSkipped: totalSkipped,
            readRate,
            responseRate
        });
    } catch (error) {
        console.error("[Campaigns Stats] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__884d668f._.js.map