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
"[project]/app/api/campaigns/send/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
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
function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}
function normalizeWhatsappToDigits(value) {
    let digits = String(value || "").replace(/^whatsapp:/i, "").replace(/\D/g, "");
    if (!digits) return "";
    // Some users paste numbers in international dial format (00...), strip it.
    digits = digits.replace(/^0+/, "");
    // Mexico quirks:
    // - Old style includes an extra '1' after country code: 52 1 XXXXXXXXXX (13 digits)
    //   WhatsApp Cloud API expects 52 + 10-digit national number.
    // NOTE: We normalize BOTH `521XXXXXXXXXX` and `52 1 XXXXXXXXXX` to `52XXXXXXXXXX`.
    if (digits.length === 13 && digits.startsWith("52") && digits.slice(2, 3) === "1") {
        digits = `52${digits.slice(-10)}`;
    }
    // If user entered a 10-digit national number (very common in MX), assume Mexico (52).
    if (digits.length === 10) {
        digits = `52${digits}`;
    }
    return digits;
}
function parseBooleanish(value, fallback) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1 ? true : value === 0 ? false : fallback;
    if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (v === "true" || v === "1" || v === "yes" || v === "y" || v === "on") return true;
        if (v === "false" || v === "0" || v === "no" || v === "n" || v === "off") return false;
    }
    return fallback;
}
function normalizeTemplateLanguageCode(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    // Common variants -> Meta format
    const v = raw.replace(/-/g, "_");
    // Known mistake: es_MEX is not a valid WhatsApp template language code.
    if (v.toLowerCase() === "es_mex") return "es_MX";
    // Normalize casing: ll_CC (language lower, region upper)
    const parts = v.split("_").filter(Boolean);
    if (parts.length === 1) return parts[0].toLowerCase();
    const [lang, region] = parts;
    return `${String(lang).toLowerCase()}_${String(region).toUpperCase()}`;
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
async function recordCampaignEvent(db, campaignId, payload) {
    try {
        await ensureWebhookLogsTable(db);
        await db`
      INSERT INTO webhook_logs (channel, external_id, payload, processed)
      VALUES ('bulk_campaign', ${campaignId}, ${JSON.stringify(payload)}::jsonb, true)
    `;
    } catch  {
    // ignore
    }
}
function renderMessageTemplate(template, contact) {
    const name = String(contact?.name || "").trim();
    const phone = String(contact?.phone_number || "").trim();
    const externalUserId = String(contact?.external_user_id || "").trim();
    const id = String(contact?.id || "").trim();
    // Common variables used in UI templates
    return String(template || "").replace(/\{\{\s*nombre\s*\}\}/gi, name || "").replace(/\{\{\s*telefono\s*\}\}/gi, phone || "").replace(/\{\{\s*phone_number\s*\}\}/gi, phone || "").replace(/\{\{\s*external_user_id\s*\}\}/gi, externalUserId || "").replace(/\{\{\s*id\s*\}\}/gi, id || "");
}
let _hasConversationChannelColumns = null;
let _hasConversationExternalConversationIdColumn = null;
let _conversationStatusOpenValue = null;
let _conversationStatusClosedValue = null;
let _messagesColumns = null;
async function hasConversationChannelColumns(db) {
    if (_hasConversationChannelColumns !== null) return _hasConversationChannelColumns;
    try {
        const rows = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name IN ('channel', 'external_user_id')
      ORDER BY column_name
    `;
        _hasConversationChannelColumns = Array.isArray(rows) && rows.length === 2;
    } catch  {
        _hasConversationChannelColumns = false;
    }
    return _hasConversationChannelColumns;
}
async function hasConversationExternalConversationIdColumn(db) {
    if (_hasConversationExternalConversationIdColumn !== null) return _hasConversationExternalConversationIdColumn;
    try {
        const rows = await db`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'external_conversation_id'
      LIMIT 1
    `;
        _hasConversationExternalConversationIdColumn = Array.isArray(rows) && rows.length > 0;
    } catch  {
        _hasConversationExternalConversationIdColumn = false;
    }
    return _hasConversationExternalConversationIdColumn;
}
async function getMessagesColumns(db) {
    if (_messagesColumns) return _messagesColumns;
    try {
        const rows = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('channel', 'external_message_id', 'direction', 'metadata')
      ORDER BY column_name
    `;
        _messagesColumns = new Set((rows || []).map((r)=>String(r?.column_name || "").trim()).filter(Boolean));
    } catch  {
        _messagesColumns = new Set();
    }
    return _messagesColumns;
}
async function getConversationStatusValues(db) {
    if (_conversationStatusOpenValue !== null) {
        return {
            openValue: _conversationStatusOpenValue,
            closedValue: _conversationStatusClosedValue
        };
    }
    let openValue = "open";
    let closedValue = "closed";
    try {
        const cols = await db`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'status'
      LIMIT 1
    `;
        const dataType = String(cols?.[0]?.data_type || "");
        const udtName = String(cols?.[0]?.udt_name || "");
        if (dataType.toUpperCase() === "USER-DEFINED" && udtName) {
            const labels = await db`
        SELECT e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = ${udtName}
        ORDER BY e.enumsortorder
      `;
            const enumLabels = (labels || []).map((r)=>String(r.enumlabel));
            const pickFirst = (candidates)=>enumLabels.find((l)=>candidates.includes(l));
            openValue = pickFirst([
                "open",
                "active",
                "new",
                "pending"
            ]) || enumLabels[0] || openValue;
            closedValue = pickFirst([
                "closed",
                "resolved",
                "archived"
            ]) || null;
        }
    } catch  {
    // keep defaults
    }
    _conversationStatusOpenValue = openValue;
    _conversationStatusClosedValue = closedValue;
    return {
        openValue,
        closedValue
    };
}
async function ensureConversationForContact(db, contactIdText) {
    const contactRows = await db`
    SELECT *
    FROM contacts
    WHERE id::text = ${contactIdText}
    LIMIT 1
  `;
    if (!contactRows.length) {
        return {
            ok: false,
            error: "Contact not found"
        };
    }
    const contact = contactRows[0];
    const { openValue: statusOpenValue, closedValue: statusClosedValue } = await getConversationStatusValues(db);
    let conversationRows = [];
    try {
        conversationRows = statusClosedValue ? await db`
          SELECT *
          FROM conversations
          WHERE contact_id = ${contact.id}
            AND status::text != ${statusClosedValue}
          ORDER BY created_at DESC
          LIMIT 1
        ` : await db`
          SELECT *
          FROM conversations
          WHERE contact_id = ${contact.id}
          ORDER BY created_at DESC
          LIMIT 1
        `;
    } catch  {
        conversationRows = [];
    }
    const includeChannelCols = await hasConversationChannelColumns(db);
    const includeExternalConvId = await hasConversationExternalConversationIdColumn(db);
    if (!conversationRows.length) {
        const channel = String(contact?.channel || "whatsapp").toLowerCase() === "facebook" ? "facebook" : "whatsapp";
        const externalUserId = String(contact?.external_user_id || "").trim() || null;
        if (includeChannelCols && includeExternalConvId) {
            conversationRows = await db`
        INSERT INTO conversations (
          contact_id,
          status,
          priority,
          channel,
          external_user_id,
          external_conversation_id,
          created_at,
          updated_at,
          last_message_at
        )
        VALUES (
          ${contact.id},
          ${statusOpenValue},
          'medium',
          ${channel},
          ${externalUserId},
          ${externalUserId ? `${channel}_${externalUserId}` : null},
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `;
        } else if (includeChannelCols) {
            conversationRows = await db`
        INSERT INTO conversations (
          contact_id,
          status,
          priority,
          channel,
          external_user_id,
          created_at,
          updated_at,
          last_message_at
        )
        VALUES (
          ${contact.id},
          ${statusOpenValue},
          'medium',
          ${channel},
          ${externalUserId},
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `;
        } else {
            conversationRows = await db`
        INSERT INTO conversations (
          contact_id,
          status,
          priority,
          created_at,
          updated_at,
          last_message_at
        )
        VALUES (
          ${contact.id},
          ${statusOpenValue},
          'medium',
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `;
        }
    }
    const conversation = conversationRows[0];
    return {
        ok: true,
        contact,
        conversation,
        channel: String(conversation?.channel || contact?.channel || "whatsapp").toLowerCase(),
        externalUserId: String(conversation?.external_user_id || contact?.external_user_id || "").trim() || null
    };
}
async function sendWhatsappText(message, phoneNumberRaw) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!accessToken || !phoneNumberId) {
        return {
            ok: false,
            error: "WHATSAPP credentials missing"
        };
    }
    const to = normalizeWhatsappToDigits(phoneNumberRaw);
    if (!to) return {
        ok: false,
        error: "Recipient phone missing",
        to: null
    };
    // WhatsApp Cloud expects E.164 digits (no +). Typical length is 11-15.
    if (to.length < 11 || to.length > 15) {
        return {
            ok: false,
            error: `Invalid recipient phone format (${to.length} digits)`,
            to
        };
    }
    const response = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(phoneNumberId)}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: {
                body: message
            }
        })
    });
    const data = await response.json().catch(()=>null);
    if (!response.ok) {
        return {
            ok: false,
            error: data?.error?.message || "Failed to send WhatsApp message",
            details: data,
            to
        };
    }
    const externalMessageId = String(data?.messages?.[0]?.id || "") || null;
    return {
        ok: true,
        externalMessageId,
        data,
        to
    };
}
async function sendWhatsappTemplate(template, phoneNumberRaw, renderedBodyParams) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!accessToken || !phoneNumberId) {
        return {
            ok: false,
            error: "WHATSAPP credentials missing"
        };
    }
    const to = normalizeWhatsappToDigits(phoneNumberRaw);
    if (!to) return {
        ok: false,
        error: "Recipient phone missing",
        to: null
    };
    if (to.length < 11 || to.length > 15) {
        return {
            ok: false,
            error: `Invalid recipient phone format (${to.length} digits)`,
            to
        };
    }
    const name = String(template?.name || "").trim();
    const language = String(template?.language || "").trim();
    if (!name || !language) {
        return {
            ok: false,
            error: "Template name/language missing",
            to
        };
    }
    const response = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(phoneNumberId)}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
                name,
                language: {
                    code: language
                },
                components: [
                    {
                        type: "body",
                        parameters: (renderedBodyParams || []).map((text)=>({
                                type: "text",
                                text: String(text ?? "")
                            }))
                    }
                ]
            }
        })
    });
    const data = await response.json().catch(()=>null);
    if (!response.ok) {
        return {
            ok: false,
            error: data?.error?.message || "Failed to send WhatsApp template",
            details: data,
            to
        };
    }
    const externalMessageId = String(data?.messages?.[0]?.id || "") || null;
    return {
        ok: true,
        externalMessageId,
        data,
        to
    };
}
async function sendFacebookText(message, recipientId) {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!accessToken) {
        return {
            ok: false,
            error: "FACEBOOK_PAGE_ACCESS_TOKEN missing"
        };
    }
    const response = await fetch("https://graph.facebook.com/v18.0/me/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            recipient: {
                id: recipientId
            },
            message: {
                text: message
            },
            access_token: accessToken,
            messaging_type: "RESPONSE"
        })
    });
    const data = await response.json().catch(()=>null);
    if (!response.ok) {
        return {
            ok: false,
            error: data?.error?.message || "Failed to send Facebook message",
            details: data
        };
    }
    return {
        ok: true,
        externalMessageId: String(data?.message_id || "") || null,
        data
    };
}
async function insertOutboundMessage(db, opts) {
    const { conversationId, userId, content, metadata } = opts;
    let messageRow = null;
    try {
        // try UUID insert
        let result = [];
        try {
            result = await db`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, metadata)
        VALUES (${conversationId}::uuid, 'agent', ${userId}, ${content}, ${metadata ? JSON.stringify(metadata) : null}::jsonb)
        RETURNING id
      `;
        } catch  {
            result = await db`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content)
        VALUES (${conversationId}::uuid, 'agent', ${userId}, ${content})
        RETURNING id
      `;
        }
        messageRow = result?.[0] || null;
    } catch  {
        // fallback to number insert
        try {
            const asNumber = Number.parseInt(conversationId);
            let result = [];
            try {
                result = await db`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content, metadata)
          VALUES (${asNumber}, 'agent', ${userId}, ${content}, ${metadata ? JSON.stringify(metadata) : null}::jsonb)
          RETURNING id
        `;
            } catch  {
                result = await db`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content)
          VALUES (${asNumber}, 'agent', ${userId}, ${content})
          RETURNING id
        `;
            }
            messageRow = result?.[0] || null;
        } catch  {
            // final fallback: insert without casting
            let result = [];
            try {
                result = await db`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content, metadata)
          VALUES (${conversationId}, 'agent', ${userId}, ${content}, ${metadata ? JSON.stringify(metadata) : null}::jsonb)
          RETURNING id
        `;
            } catch  {
                result = await db`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content)
          VALUES (${conversationId}, 'agent', ${userId}, ${content})
          RETURNING id
        `;
            }
            messageRow = result?.[0] || null;
        }
    }
    // Update conversation last_message_at - best effort
    try {
        await db`
      UPDATE conversations
      SET last_message_at = NOW(), updated_at = NOW()
      WHERE id::text = ${conversationId}
    `;
    } catch  {
    // ignore
    }
    return messageRow;
}
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
    // If the DB user lacks privileges, stats will still fallback to message-only.
    }
}
function generateCampaignId() {
    return `bulk_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
async function createBulkCampaign(db, input) {
    try {
        const rows = await db`
      INSERT INTO bulk_campaigns (name, message, send_mode, whatsapp_template, status, total, scheduled_at, created_by, created_at, updated_at)
      VALUES (
        ${input.name},
        ${input.message},
        ${input.sendMode},
        ${input.whatsappTemplate ? JSON.stringify(input.whatsappTemplate) : null}::jsonb,
        ${input.status},
        ${input.total},
        ${input.scheduledAt || null},
        ${typeof input.createdBy === "number" ? input.createdBy : null},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
        return rows?.[0]?.id ? String(rows[0].id) : null;
    } catch  {
        return null;
    }
}
async function updateBulkCampaign(db, campaignId, patch) {
    try {
        await db`
      UPDATE bulk_campaigns
      SET
        status = COALESCE(${patch.status || null}, status),
        sent = COALESCE(${typeof patch.sent === "number" ? patch.sent : null}, sent),
        failed = COALESCE(${typeof patch.failed === "number" ? patch.failed : null}, failed),
        skipped = COALESCE(${typeof patch.skipped === "number" ? patch.skipped : null}, skipped),
        total = COALESCE(${typeof patch.total === "number" ? patch.total : null}, total),
        started_at = COALESCE(${patch.startedAt ?? null}, started_at),
        completed_at = COALESCE(${patch.completedAt ?? null}, completed_at),
        updated_at = NOW()
      WHERE id::text = ${campaignId}
    `;
    } catch  {
    // ignore
    }
}
async function getLastInboundAt(db, conversationId, hasExtendedDirection) {
    try {
        if (hasExtendedDirection) {
            const rows = await db`
        SELECT MAX(created_at) AS last_inbound_at
        FROM messages
        WHERE conversation_id::text = ${conversationId}
          AND direction = 'inbound'
      `;
            const v = rows?.[0]?.last_inbound_at;
            return v ? new Date(v) : null;
        }
        // Fallback for older schemas: infer inbound as non-agent sender
        const rows = await db`
      SELECT MAX(created_at) AS last_inbound_at
      FROM messages
      WHERE conversation_id::text = ${conversationId}
        AND sender_type != 'agent'
    `;
        const v = rows?.[0]?.last_inbound_at;
        return v ? new Date(v) : null;
    } catch  {
        return null;
    }
}
async function POST(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
        if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Not authenticated"
        }, {
            status: 401
        });
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDemoMode"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Bulk send is not available in demo mode"
            }, {
                status: 400
            });
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "DATABASE_URL missing",
                hint: "Configura DATABASE_URL para poder leer contactos y crear mensajes/conversaciones."
            }, {
                status: 500
            });
        }
        const body = await request.json().catch(()=>({}));
        const contactIds = Array.isArray(body?.contactIds) ? body.contactIds.map((x)=>String(x).trim()).filter(Boolean) : [];
        const messageTemplateRaw = String(body?.message || "");
        const messageTemplate = messageTemplateRaw.trim();
        const sendMode = String(body?.sendMode || "auto");
        // Important: only skip when explicitly requested by the client.
        // Some callers may send this as a string ("false"); treat it correctly.
        const skipIfOutside24h = parseBooleanish(body?.skipIfOutside24h, false);
        const campaignName = String(body?.campaignName || "").trim() || "Campaña";
        const campaignIdFromClient = body?.campaignId ? String(body.campaignId).trim() : "";
        const whatsappTemplate = body?.whatsappTemplate ? {
            name: String(body.whatsappTemplate?.name || "").trim().toLowerCase(),
            language: normalizeTemplateLanguageCode(String(body.whatsappTemplate?.language || "")),
            bodyParams: Array.isArray(body.whatsappTemplate?.bodyParams) ? body.whatsappTemplate.bodyParams.map((x)=>String(x ?? "")).filter((x)=>x.trim().length > 0) : []
        } : null;
        if (sendMode !== "template") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Bulk send only supports WhatsApp templates (sendMode must be 'template')"
            }, {
                status: 400
            });
        }
        if (!whatsappTemplate || !whatsappTemplate.name || !whatsappTemplate.language) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "whatsappTemplate (name/language) is required for bulk template sends"
            }, {
                status: 400
            });
        }
        if (!contactIds.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "contactIds is required"
            }, {
                status: 400
            });
        }
        const db = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"];
        const msgCols = await getMessagesColumns(db);
        const hasMessagesDirection = msgCols.has("direction");
        const hasMessagesExternalMessageId = msgCols.has("external_message_id");
        const hasMessagesChannel = msgCols.has("channel");
        // Always have a campaignId for message metadata, even if bulk_campaigns can't be written.
        let campaignId = campaignIdFromClient || generateCampaignId();
        let persistedCampaignId = null;
        // Best-effort persistence in bulk_campaigns (can fail if DB user has no CREATE/INSERT privileges)
        await ensureBulkCampaignTables(db);
        try {
            if (!campaignIdFromClient) {
                const created = await createBulkCampaign(db, {
                    name: campaignName,
                    message: messageTemplate,
                    sendMode,
                    whatsappTemplate,
                    total: contactIds.length,
                    createdBy: user?.id,
                    status: "sending"
                });
                if (created) {
                    campaignId = created;
                    persistedCampaignId = created;
                }
            } else {
                // Only attempt update if the id looks numeric (bulk_campaigns is SERIAL)
                if (/^\d+$/.test(campaignIdFromClient)) {
                    persistedCampaignId = campaignIdFromClient;
                    await updateBulkCampaign(db, campaignIdFromClient, {
                        status: "sending",
                        startedAt: new Date(),
                        total: contactIds.length
                    });
                }
            }
        } catch  {
        // ignore
        }
        if (persistedCampaignId) {
            await updateBulkCampaign(db, persistedCampaignId, {
                status: "sending",
                startedAt: new Date()
            });
        }
        // If this campaign isn't in bulk_campaigns, still persist an event so it shows up in lists/stats.
        if (!persistedCampaignId && campaignId) {
            await recordCampaignEvent(db, campaignId, {
                kind: "campaign",
                id: campaignId,
                name: campaignName,
                message: messageTemplate,
                sendMode,
                whatsappTemplate: sendMode === "text" ? null : whatsappTemplate,
                status: "sending",
                total: contactIds.length,
                sent: 0,
                failed: 0,
                skipped: 0,
                startedAt: new Date().toISOString()
            });
        }
        const results = [];
        // Sequential send to avoid rate limits
        for (const contactIdText of contactIds){
            try {
                const ensured = await ensureConversationForContact(db, contactIdText);
                if (!ensured.ok) {
                    results.push({
                        contactId: contactIdText,
                        ok: false,
                        error: ensured.error
                    });
                    continue;
                }
                const conversationId = String(ensured.conversation.id);
                const channel = ensured.channel === "facebook" ? "facebook" : "whatsapp";
                const renderedBodyParams = (whatsappTemplate?.bodyParams || []).map((p)=>renderMessageTemplate(p, ensured.contact));
                const renderedDisplayContent = messageTemplate ? renderMessageTemplate(messageTemplate, ensured.contact) : `Plantilla WhatsApp: ${whatsappTemplate.name} (${whatsappTemplate.language})${renderedBodyParams.length ? ` | ${renderedBodyParams.join(" | ")}` : ""}`;
                let sendRes;
                if (channel !== "whatsapp") {
                    await insertOutboundMessage(db, {
                        conversationId,
                        userId: user.id,
                        content: renderedDisplayContent,
                        metadata: {
                            campaignId,
                            campaignName,
                            source: "bulk",
                            send: {
                                ok: false,
                                skipped: false,
                                externalMessageId: null,
                                error: "Solo se soporta WhatsApp Templates para envíos masivos"
                            }
                        }
                    });
                    results.push({
                        contactId: contactIdText,
                        conversationId,
                        channel,
                        sendType: "template",
                        ok: false,
                        externalMessageId: null,
                        error: "Solo se soporta WhatsApp Templates para envíos masivos"
                    });
                    continue;
                }
                const phoneNumber = String(ensured.contact?.phone_number || "").trim();
                sendRes = await sendWhatsappTemplate(whatsappTemplate, phoneNumber, renderedBodyParams);
                // Save message in DB regardless of send result (so UI shows what was attempted)
                const inserted = await insertOutboundMessage(db, {
                    conversationId,
                    userId: user.id,
                    content: renderedDisplayContent,
                    metadata: {
                        campaignId,
                        campaignName,
                        source: "bulk",
                        send: {
                            ok: sendRes.ok,
                            skipped: false,
                            externalMessageId: sendRes.ok ? sendRes.externalMessageId : null,
                            to: sendRes?.to ?? null,
                            error: sendRes.ok ? null : String(sendRes?.error || ""),
                            details: sendRes.ok ? null : sendRes?.details ?? null
                        }
                    }
                });
                // Best-effort update extended cols with channel/external id/status direction
                if (inserted?.id && sendRes.ok) {
                    try {
                        if (hasMessagesChannel && hasMessagesExternalMessageId && hasMessagesDirection) {
                            await db`
                UPDATE messages
                SET channel = ${channel},
                    external_message_id = ${sendRes.externalMessageId},
                    direction = 'outbound'
                WHERE id = ${inserted.id}
              `;
                        } else if (hasMessagesChannel && hasMessagesExternalMessageId) {
                            await db`
                UPDATE messages
                SET channel = ${channel},
                    external_message_id = ${sendRes.externalMessageId}
                WHERE id = ${inserted.id}
              `;
                        } else if (hasMessagesExternalMessageId && hasMessagesDirection) {
                            await db`
                UPDATE messages
                SET external_message_id = ${sendRes.externalMessageId},
                    direction = 'outbound'
                WHERE id = ${inserted.id}
              `;
                        } else if (hasMessagesExternalMessageId) {
                            await db`
                UPDATE messages
                SET external_message_id = ${sendRes.externalMessageId}
                WHERE id = ${inserted.id}
              `;
                        } else if (hasMessagesDirection) {
                            await db`
                UPDATE messages
                SET direction = 'outbound'
                WHERE id = ${inserted.id}
              `;
                        } else if (hasMessagesChannel) {
                            await db`
                UPDATE messages
                SET channel = ${channel}
                WHERE id = ${inserted.id}
              `;
                        }
                    } catch  {
                    // ignore
                    }
                }
                results.push({
                    contactId: contactIdText,
                    conversationId,
                    channel,
                    sendType: "template",
                    ok: sendRes.ok,
                    externalMessageId: sendRes.ok ? sendRes.externalMessageId : null,
                    to: sendRes?.to ?? null,
                    toSource: phoneNumber || null,
                    toNormalized: sendRes?.to ?? null,
                    details: sendRes.ok ? null : sendRes?.details ?? null,
                    error: sendRes.ok ? null : /24\s*hour|24\s*h|outside\s+the\s+allowed\s+window|outside\s+customer\s+care/i.test(String(sendRes.error || "")) ? `${sendRes.error} (probable ventana 24h; usa plantilla aprobada)` : sendRes.error
                });
            } catch (e) {
                results.push({
                    contactId: contactIdText,
                    ok: false,
                    error: e instanceof Error ? e.message : "Unexpected error"
                });
            }
        }
        const total = results.length;
        const sent = results.filter((r)=>r.ok).length;
        const skipped = results.filter((r)=>r?.skipped).length;
        const failed = results.filter((r)=>!r.ok && !r?.skipped).length;
        if (persistedCampaignId) {
            const status = failed === 0 ? "completed" : sent > 0 ? "completed" : "failed";
            await updateBulkCampaign(db, persistedCampaignId, {
                status,
                total,
                sent,
                failed,
                skipped,
                completedAt: new Date()
            });
        }
        if (!persistedCampaignId && campaignId) {
            const status = failed === 0 ? "completed" : sent > 0 ? "completed" : "failed";
            await recordCampaignEvent(db, campaignId, {
                kind: "campaign",
                id: campaignId,
                name: campaignName,
                message: messageTemplate,
                sendMode,
                whatsappTemplate: sendMode === "text" ? null : whatsappTemplate,
                status,
                total,
                sent,
                failed,
                skipped,
                completedAt: new Date().toISOString()
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            campaignId,
            total,
            sent,
            failed,
            skipped,
            results,
            persisted: Boolean(persistedCampaignId)
        });
    } catch (error) {
        console.error("[Campaigns Send] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c82431df._.js.map