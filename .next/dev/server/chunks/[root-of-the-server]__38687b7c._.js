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
"[project]/lib/demo-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Demo users - password is "demo123" for all
__turbopack_context__.s([
    "DEMO_CONTACTS",
    ()=>DEMO_CONTACTS,
    "DEMO_CONVERSATIONS",
    ()=>DEMO_CONVERSATIONS,
    "DEMO_DATA",
    ()=>DEMO_DATA,
    "DEMO_MACROS",
    ()=>DEMO_MACROS,
    "DEMO_MESSAGES",
    ()=>DEMO_MESSAGES,
    "DEMO_ORDERS",
    ()=>DEMO_ORDERS,
    "DEMO_USERS",
    ()=>DEMO_USERS
]);
const DEMO_PASSWORD = "demo123";
const DEMO_USERS = [
    {
        id: 1,
        email: "admin@demo.com",
        password: DEMO_PASSWORD,
        name: "Carlos Admin",
        role: "admin",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
        status: "online"
    },
    {
        id: 2,
        email: "agent1@demo.com",
        password: DEMO_PASSWORD,
        name: "María García",
        role: "agent",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
        status: "online"
    },
    {
        id: 3,
        email: "agent2@demo.com",
        password: DEMO_PASSWORD,
        name: "Juan López",
        role: "agent",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
        status: "away"
    }
];
const DEMO_CONTACTS = [
    {
        id: 1,
        phone_number: "+52 1 555 123 4567",
        name: "Ana Martínez",
        email: "ana.martinez@email.com",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
    },
    {
        id: 2,
        phone_number: "+52 1 555 987 6543",
        name: "Roberto Pérez",
        email: "roberto.perez@email.com",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto"
    },
    {
        id: 3,
        phone_number: "+52 1 555 456 7890",
        name: "Laura Hernández",
        email: "laura.hernandez@email.com",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura"
    }
];
const DEMO_CONVERSATIONS = [
    {
        id: 1,
        contact_id: 1,
        assigned_to: 2,
        status: "open",
        priority: "high",
        unread_count: 3,
        last_message_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        contact: DEMO_CONTACTS[0],
        assigned_agent: {
            name: "María García",
            avatar_url: DEMO_USERS[1].avatar_url
        }
    },
    {
        id: 2,
        contact_id: 2,
        assigned_to: 3,
        status: "open",
        priority: "medium",
        unread_count: 0,
        last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        contact: DEMO_CONTACTS[1],
        assigned_agent: {
            name: "Juan López",
            avatar_url: DEMO_USERS[2].avatar_url
        }
    },
    {
        id: 3,
        contact_id: 3,
        assigned_to: 2,
        status: "closed",
        priority: "low",
        unread_count: 0,
        last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        contact: DEMO_CONTACTS[2],
        assigned_agent: {
            name: "María García",
            avatar_url: DEMO_USERS[1].avatar_url
        }
    }
];
const DEMO_MESSAGES = [
    {
        id: 1,
        conversation_id: 1,
        sender_type: "contact",
        content: "Hola, necesito ayuda con mi pedido #1234",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
        id: 2,
        conversation_id: 1,
        sender_type: "agent",
        user_id: 2,
        content: "¡Hola Ana! Con gusto te ayudo. Déjame revisar tu pedido.",
        created_at: new Date(Date.now() - 1000 * 60 * 58).toISOString()
    },
    {
        id: 3,
        conversation_id: 1,
        sender_type: "contact",
        content: "Gracias, ¿cuándo llega mi pedido?",
        created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString()
    },
    {
        id: 4,
        conversation_id: 1,
        sender_type: "agent",
        user_id: 2,
        content: "Tu pedido llegará mañana entre 9am y 6pm. Te enviaré el tracking.",
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    },
    {
        id: 5,
        conversation_id: 1,
        sender_type: "contact",
        content: "Perfecto, muchas gracias!",
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
        id: 6,
        conversation_id: 2,
        sender_type: "contact",
        content: "Buenos días, quisiera cambiar mi dirección de envío",
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    {
        id: 7,
        conversation_id: 2,
        sender_type: "agent",
        user_id: 3,
        content: "Claro, ¿cuál es la nueva dirección?",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    }
];
const DEMO_ORDERS = [
    {
        id: 1,
        order_number: "ORD-1234",
        contact_id: 1,
        status: "shipped",
        total_amount: 1299.99,
        currency: "MXN",
        items: [
            {
                name: "iPhone 15 Pro",
                quantity: 1,
                price: 1299.99
            }
        ],
        shipping_address: "Av. Insurgentes 123, CDMX",
        tracking_number: "MEX123456789",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    },
    {
        id: 2,
        order_number: "ORD-5678",
        contact_id: 2,
        status: "processing",
        total_amount: 499.99,
        currency: "MXN",
        items: [
            {
                name: "AirPods Pro",
                quantity: 1,
                price: 499.99
            }
        ],
        shipping_address: "Calle Reforma 456, Guadalajara",
        tracking_number: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
];
const DEMO_MACROS = [
    {
        id: 1,
        title: "Saludo inicial",
        content: "¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte hoy?",
        shortcut: "/hola",
        created_by: 2,
        usage_count: 45
    },
    {
        id: 2,
        title: "Solicitar número de orden",
        content: "Para ayudarte mejor, ¿podrías compartirme tu número de orden?",
        shortcut: "/orden",
        created_by: 2,
        usage_count: 32
    },
    {
        id: 3,
        title: "Despedida",
        content: "Gracias por contactarnos. ¡Que tengas un excelente día!",
        shortcut: "/adios",
        created_by: 3,
        usage_count: 67
    }
];
const DEMO_DATA = {
    users: DEMO_USERS,
    contacts: DEMO_CONTACTS,
    conversations: DEMO_CONVERSATIONS,
    messages: DEMO_MESSAGES,
    orders: DEMO_ORDERS,
    macros: DEMO_MACROS
};
}),
"[project]/app/api/conversations/[id]/messages/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/demo-data.ts [app-route] (ecmascript)");
;
;
;
;
const demoMessagesStore = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEMO_MESSAGES"]
];
function normalizeWhatsappToDigits(value) {
    return String(value || "").replace(/^whatsapp:/i, "").replace(/\D/g, "");
}
async function GET(request, { params }) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Not authenticated"
            }, {
                status: 401
            });
        }
        const { id } = await params;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDemoMode"]) {
            const conversationId = isNaN(Number(id)) ? id : Number.parseInt(id);
            const messages = demoMessagesStore.filter((m)=>{
                if (typeof conversationId === "number") {
                    return m.conversation_id === conversationId;
                }
                return m.conversation_id === Number.parseInt(id);
            }).map((m)=>({
                    id: m.id,
                    content: m.content,
                    sender_type: m.sender_type,
                    sender_id: m.user_id || null,
                    message_type: "text",
                    created_at: m.created_at,
                    sender_name: m.sender_type === "agent" ? user.name : "Cliente"
                }));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                messages
            });
        }
        // Query messages - try to get by UUID first, then try as integer.
        // Also support alternative schemas (e.g. CRM backend) where media fields may be stored in columns.
        let messages = [];
        try {
            messages = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        SELECT 
          m.id,
          m.content,
          m.message_type,
          m.metadata,
          m.media_id,
          m.media_filename,
          m.media_mime_type,
          m.media_caption,
          m.sender_type,
          m.sender_id,
          m.created_at,
          COALESCE(
            CASE WHEN m.sender_type = 'contact' THEN c.name END,
            CASE WHEN m.sender_type = 'agent' THEN u.name END,
            'Unknown'
          ) as sender_name
        FROM messages m
        LEFT JOIN contacts c ON m.sender_type IN ('contact','customer') AND m.sender_id = c.id
        LEFT JOIN users u ON m.sender_type = 'agent' AND m.sender_id = u.id
        WHERE m.conversation_id::text = ${id}
        ORDER BY m.created_at ASC
      `;
        } catch (queryError) {
            console.error("[GET messages] Query with ::text failed, trying alternate:", queryError);
            // If the failure was due to missing media columns, retry without them.
            const queryMsg = String(queryError?.message || "");
            const missingMediaColumns = queryMsg.includes("m.media_id") || queryMsg.includes("m.media_filename") || queryMsg.includes("m.media_mime_type") || queryMsg.includes("m.media_caption");
            if (missingMediaColumns) {
                try {
                    messages = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
            SELECT 
              m.id,
              m.content,
              m.message_type,
              m.metadata,
              m.sender_type,
              m.sender_id,
              m.created_at,
              COALESCE(
                CASE WHEN m.sender_type = 'contact' THEN c.name END,
                CASE WHEN m.sender_type = 'agent' THEN u.name END,
                'Unknown'
              ) as sender_name
            FROM messages m
            LEFT JOIN contacts c ON m.sender_type IN ('contact','customer') AND m.sender_id = c.id
            LEFT JOIN users u ON m.sender_type = 'agent' AND m.sender_id = u.id
            WHERE m.conversation_id::text = ${id}
            ORDER BY m.created_at ASC
          `;
                } catch  {
                // fall through to CAST retry
                }
            }
            // Try alternate approach if UUID casting fails (or previous retry didn't produce results)
            if (!messages?.length) {
                try {
                    messages = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
            SELECT 
              m.id,
              m.content,
              m.message_type,
              m.metadata,
              m.media_id,
              m.media_filename,
              m.media_mime_type,
              m.media_caption,
              m.sender_type,
              m.sender_id,
              m.created_at,
              COALESCE(
                CASE WHEN m.sender_type = 'contact' THEN c.name END,
                CASE WHEN m.sender_type = 'agent' THEN u.name END,
                'Unknown'
              ) as sender_name
            FROM messages m
            LEFT JOIN contacts c ON m.sender_type IN ('contact','customer') AND m.sender_id = c.id
            LEFT JOIN users u ON m.sender_type = 'agent' AND m.sender_id = u.id
            WHERE CAST(m.conversation_id AS VARCHAR) = ${id}
            ORDER BY m.created_at ASC
          `;
                } catch (castError) {
                    const castMsg = String(castError?.message || "");
                    const castMissingMediaColumns = castMsg.includes("m.media_id") || castMsg.includes("m.media_filename") || castMsg.includes("m.media_mime_type") || castMsg.includes("m.media_caption");
                    if (castMissingMediaColumns) {
                        messages = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
              SELECT 
                m.id,
                m.content,
                m.message_type,
                m.metadata,
                m.sender_type,
                m.sender_id,
                m.created_at,
                COALESCE(
                  CASE WHEN m.sender_type = 'contact' THEN c.name END,
                  CASE WHEN m.sender_type = 'agent' THEN u.name END,
                  'Unknown'
                ) as sender_name
              FROM messages m
              LEFT JOIN contacts c ON m.sender_type IN ('contact','customer') AND m.sender_id = c.id
              LEFT JOIN users u ON m.sender_type = 'agent' AND m.sender_id = u.id
              WHERE CAST(m.conversation_id AS VARCHAR) = ${id}
              ORDER BY m.created_at ASC
            `;
                    } else {
                        throw castError;
                    }
                }
            }
        }
        const normalizedMessages = (messages || []).map((m)=>{
            let metadata = m.metadata ?? null;
            if (typeof metadata === "string") {
                try {
                    metadata = JSON.parse(metadata);
                } catch  {
                // keep as-is
                }
            }
            const rowMediaId = m?.media_id;
            const rowFilename = m?.media_filename;
            const rowCaption = m?.media_caption;
            const rowMimeType = m?.media_mime_type;
            const mediaId = metadata?.media_id ?? metadata?.mediaId ?? metadata?.id ?? rowMediaId ?? null;
            const filename = metadata?.filename ?? metadata?.media_filename ?? metadata?.mediaFilename ?? rowFilename ?? null;
            // If media metadata lives in columns, expose a consistent shape to the UI
            if (rowCaption && !metadata?.caption) {
                metadata = {
                    ...metadata || {},
                    caption: rowCaption
                };
            }
            if (rowMimeType && !metadata?.mime_type) {
                metadata = {
                    ...metadata || {},
                    mime_type: rowMimeType
                };
            }
            let media_url = null;
            if (mediaId) {
                media_url = `/api/whatsapp/media/${encodeURIComponent(String(mediaId))}`;
                if (filename) {
                    media_url += `?filename=${encodeURIComponent(String(filename))}`;
                }
            }
            return {
                ...m,
                metadata,
                media_url
            };
        });
        // Mark messages as read - silently ignore if it fails
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE messages 
        SET read_at = NOW() 
        WHERE conversation_id::text = ${id}
          AND read_at IS NULL 
          AND sender_type = 'contact'
      `;
        } catch (error) {
            console.error("[GET messages] Error marking as read:", error);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            messages: normalizedMessages
        });
    } catch (error) {
        console.error("[GET messages] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error",
            details: String(error)
        }, {
            status: 500
        });
    }
}
async function POST(request, { params }) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Not authenticated"
            }, {
                status: 401
            });
        }
        const { id } = await params;
        const { content } = await request.json();
        if (!content || content.trim() === "") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Content is required"
            }, {
                status: 400
            });
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDemoMode"]) {
            const newMessage = {
                id: demoMessagesStore.length + 1,
                conversation_id: Number.parseInt(id),
                sender_type: "agent",
                user_id: user.id,
                content: content,
                created_at: new Date().toISOString()
            };
            demoMessagesStore.push(newMessage);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: {
                    id: newMessage.id,
                    content: newMessage.content,
                    sender_type: newMessage.sender_type,
                    sender_id: newMessage.user_id,
                    message_type: "text",
                    created_at: newMessage.created_at,
                    sender_name: user.name
                }
            });
        }
        // Fetch delivery info (best-effort across schemas)
        let delivery = {
            channel: "whatsapp",
            phoneNumber: null
        };
        try {
            const cols = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_name IN ('conversations', 'contacts')
          AND column_name = 'channel'
        ORDER BY table_name
      `;
            const hasConvChannel = (cols || []).some((r)=>String(r?.table_name || "") === "conversations");
            const hasContactChannel = (cols || []).some((r)=>String(r?.table_name || "") === "contacts");
            let rows = [];
            if (hasConvChannel && hasContactChannel) {
                rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT
            COALESCE(conv.channel, c.channel, 'whatsapp') as channel,
            c.phone_number
          FROM conversations conv
          LEFT JOIN contacts c ON conv.contact_id = c.id
          WHERE conv.id::text = ${id}
          LIMIT 1
        `;
            } else if (hasConvChannel) {
                rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT
            COALESCE(conv.channel, 'whatsapp') as channel,
            c.phone_number
          FROM conversations conv
          LEFT JOIN contacts c ON conv.contact_id = c.id
          WHERE conv.id::text = ${id}
          LIMIT 1
        `;
            } else if (hasContactChannel) {
                rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT
            COALESCE(c.channel, 'whatsapp') as channel,
            c.phone_number
          FROM conversations conv
          LEFT JOIN contacts c ON conv.contact_id = c.id
          WHERE conv.id::text = ${id}
          LIMIT 1
        `;
            } else {
                rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT
            'whatsapp' as channel,
            c.phone_number
          FROM conversations conv
          LEFT JOIN contacts c ON conv.contact_id = c.id
          WHERE conv.id::text = ${id}
          LIMIT 1
        `;
            }
            delivery = {
                channel: String(rows?.[0]?.channel || "whatsapp").toLowerCase(),
                phoneNumber: rows?.[0]?.phone_number ? String(rows[0].phone_number) : null
            };
        } catch  {
            delivery = {
                channel: "whatsapp",
                phoneNumber: null
            };
        }
        // Deliver message externally (WhatsApp) BEFORE inserting into DB so UI doesn't show false success
        if (delivery.channel !== "facebook") {
            const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
            // If a backend is configured, keep forwarding (legacy)
            if (backendUrl && user.id) {
                try {
                    if (delivery.phoneNumber) {
                        const sessionToken = request.headers.get("authorization") || "";
                        const sendResponse = await fetch(`${backendUrl}/api/whatsapp/send`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: sessionToken
                            },
                            body: JSON.stringify({
                                phone_number: delivery.phoneNumber,
                                message: content
                            })
                        });
                        const sendData = await sendResponse.json().catch(()=>null);
                        if (!sendResponse.ok) {
                            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                                error: "Failed to send WhatsApp message",
                                details: sendData
                            }, {
                                status: sendResponse.status || 502
                            });
                        }
                    } else {
                        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            error: "Recipient phone missing"
                        }, {
                            status: 400
                        });
                    }
                } catch (forwardError) {
                    console.error("[POST messages] Forward to backend failed:", forwardError);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Failed to send WhatsApp message"
                    }, {
                        status: 502
                    });
                }
            } else {
                // Direct Cloud API send
                const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
                const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
                if (!accessToken || !phoneNumberId) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "WhatsApp not configured",
                        hint: "Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID"
                    }, {
                        status: 500
                    });
                }
                if (!delivery.phoneNumber) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Recipient phone missing"
                    }, {
                        status: 400
                    });
                }
                const to = normalizeWhatsappToDigits(delivery.phoneNumber);
                if (!to) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: "Recipient phone invalid"
                    }, {
                        status: 400
                    });
                }
                const waRes = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(phoneNumberId)}/messages`, {
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
                            body: content
                        }
                    })
                });
                const waData = await waRes.json().catch(()=>null);
                if (!waRes.ok) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        error: waData?.error?.message || "Failed to send WhatsApp message",
                        details: waData
                    }, {
                        status: waRes.status || 502
                    });
                }
            }
        }
        // Try to insert message - handle both UUID and integer conversation_id
        let message = null;
        try {
            // Try UUID first
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content)
        VALUES (${id}::uuid, 'agent', ${user.id}, ${content})
        RETURNING id, content, sender_type, sender_id, created_at
      `;
            message = result[0];
        } catch (uuidError) {
            console.error("[POST messages] UUID insert failed, trying integer:", uuidError);
            // Try as integer
            try {
                const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content)
          VALUES (${Number.parseInt(id)}, 'agent', ${user.id}, ${content})
          RETURNING id, content, sender_type, sender_id, created_at
        `;
                message = result[0];
            } catch (intError) {
                console.error("[POST messages] Integer insert also failed:", intError);
                throw intError;
            }
        }
        // Update conversation last_message_at - try both formats
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE conversations 
        SET last_message_at = NOW() 
        WHERE id::text = ${id}
      `;
        } catch (updateError) {
            console.error("[POST messages] Update failed (not critical):", updateError);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: {
                id: message.id,
                content: message.content,
                sender_type: message.sender_type,
                sender_id: message.sender_id,
                created_at: message.created_at,
                sender_name: user.name
            }
        });
    } catch (error) {
        console.error("[POST messages] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to send message",
            details: String(error)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__38687b7c._.js.map