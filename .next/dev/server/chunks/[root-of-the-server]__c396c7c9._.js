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
"[project]/app/api/conversations/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/demo-data.ts [app-route] (ecmascript)");
;
;
;
;
let _hasConversationChannelColumns = null;
async function hasConversationChannelColumns() {
    if (_hasConversationChannelColumns !== null) return _hasConversationChannelColumns;
    try {
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
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
async function GET(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])();
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Not authenticated"
            }, {
                status: 401
            });
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isDemoMode"]) {
            const { searchParams } = new URL(request.url);
            const status = searchParams.get("status") || "all";
            let conversations = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEMO_CONVERSATIONS"].map((conv)=>({
                    id: conv.id,
                    status: conv.status,
                    priority: conv.priority,
                    last_message_at: conv.last_message_at,
                    assigned_agent_id: conv.assigned_to,
                    contact_id: conv.contact_id,
                    contact_name: conv.contact.name,
                    phone_number: conv.contact.phone_number,
                    contact_avatar: conv.contact.avatar_url,
                    agent_name: conv.assigned_agent?.name,
                    last_message: status === "open" ? "Último mensaje..." : "Conversación cerrada",
                    unread_count: conv.unread_count
                }));
            if (status !== "all") {
                conversations = conversations.filter((c)=>c.status === status);
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                conversations
            });
        }
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "all";
        const userRole = user.role;
        const includeChannelCols = await hasConversationChannelColumns();
        let conversations;
        // Build query based on user role and status
        if (userRole === "Administrador") {
            // Admin can see all conversations
            if (status === "all") {
                conversations = includeChannelCols ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
              SELECT 
                c.id,
                c.status,
                c.priority,
                c.last_message_at,
                c.assigned_agent_id,
                c.contact_id,
                COALESCE(c.channel, 'whatsapp') as channel,
                c.external_user_id,
                contacts.name as contact_name,
                contacts.phone_number,
                contacts.avatar_url as contact_avatar,
                u.name as agent_name,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
              FROM conversations c
              LEFT JOIN contacts ON c.contact_id = contacts.id
              LEFT JOIN users u ON c.assigned_agent_id = u.id
              ORDER BY c.last_message_at DESC
              LIMIT 50
            ` : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
              SELECT 
                c.id,
                c.status,
                c.priority,
                c.last_message_at,
                c.assigned_agent_id,
                c.contact_id,
                'whatsapp' as channel,
                NULL::varchar as external_user_id,
                contacts.name as contact_name,
                contacts.phone_number,
                contacts.avatar_url as contact_avatar,
                u.name as agent_name,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
              FROM conversations c
              LEFT JOIN contacts ON c.contact_id = contacts.id
              LEFT JOIN users u ON c.assigned_agent_id = u.id
              ORDER BY c.last_message_at DESC
              LIMIT 50
            `;
            } else {
                conversations = includeChannelCols ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
              SELECT 
                c.id,
                c.status,
                c.priority,
                c.last_message_at,
                c.assigned_agent_id,
                c.contact_id,
                COALESCE(c.channel, 'whatsapp') as channel,
                c.external_user_id,
                contacts.name as contact_name,
                contacts.phone_number,
                contacts.avatar_url as contact_avatar,
                u.name as agent_name,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
              FROM conversations c
              LEFT JOIN contacts ON c.contact_id = contacts.id
              LEFT JOIN users u ON c.assigned_agent_id = u.id
              WHERE c.status = ${status}
              ORDER BY c.last_message_at DESC
              LIMIT 50
            ` : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
              SELECT 
                c.id,
                c.status,
                c.priority,
                c.last_message_at,
                c.assigned_agent_id,
                c.contact_id,
                'whatsapp' as channel,
                NULL::varchar as external_user_id,
                contacts.name as contact_name,
                contacts.phone_number,
                contacts.avatar_url as contact_avatar,
                u.name as agent_name,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
              FROM conversations c
              LEFT JOIN contacts ON c.contact_id = contacts.id
              LEFT JOIN users u ON c.assigned_agent_id = u.id
              WHERE c.status = ${status}
              ORDER BY c.last_message_at DESC
              LIMIT 50
            `;
            }
        } else if (userRole === "Agente") {
            // Agent can only see conversations assigned to them
            if (status === "all") {
                conversations = includeChannelCols ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            c.id,
            c.status,
            c.priority,
            c.last_message_at,
            c.assigned_agent_id,
            c.contact_id,
            COALESCE(c.channel, 'whatsapp') as channel,
            c.external_user_id,
            contacts.name as contact_name,
            contacts.phone_number,
            contacts.avatar_url as contact_avatar,
            u.name as agent_name,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
          FROM conversations c
          LEFT JOIN contacts ON c.contact_id = contacts.id
          LEFT JOIN users u ON c.assigned_agent_id = u.id
          WHERE c.assigned_agent_id = ${user.id}
          ORDER BY c.last_message_at DESC
          LIMIT 50
        ` : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            c.id,
            c.status,
            c.priority,
            c.last_message_at,
            c.assigned_agent_id,
            c.contact_id,
            'whatsapp' as channel,
            NULL::varchar as external_user_id,
            contacts.name as contact_name,
            contacts.phone_number,
            contacts.avatar_url as contact_avatar,
            u.name as agent_name,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
          FROM conversations c
          LEFT JOIN contacts ON c.contact_id = contacts.id
          LEFT JOIN users u ON c.assigned_agent_id = u.id
          WHERE c.assigned_agent_id = ${user.id}
          ORDER BY c.last_message_at DESC
          LIMIT 50
        `;
            } else {
                conversations = includeChannelCols ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            c.id,
            c.status,
            c.priority,
            c.last_message_at,
            c.assigned_agent_id,
            c.contact_id,
            COALESCE(c.channel, 'whatsapp') as channel,
            c.external_user_id,
            contacts.name as contact_name,
            contacts.phone_number,
            contacts.avatar_url as contact_avatar,
            u.name as agent_name,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
          FROM conversations c
          LEFT JOIN contacts ON c.contact_id = contacts.id
          LEFT JOIN users u ON c.assigned_agent_id = u.id
          WHERE c.assigned_agent_id = ${user.id} AND c.status = ${status}
          ORDER BY c.last_message_at DESC
          LIMIT 50
        ` : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            c.id,
            c.status,
            c.priority,
            c.last_message_at,
            c.assigned_agent_id,
            c.contact_id,
            'whatsapp' as channel,
            NULL::varchar as external_user_id,
            contacts.name as contact_name,
            contacts.phone_number,
            contacts.avatar_url as contact_avatar,
            u.name as agent_name,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
          FROM conversations c
          LEFT JOIN contacts ON c.contact_id = contacts.id
          LEFT JOIN users u ON c.assigned_agent_id = u.id
          WHERE c.assigned_agent_id = ${user.id} AND c.status = ${status}
          ORDER BY c.last_message_at DESC
          LIMIT 50
        `;
            }
        } else {
            // Regular users can see their own conversations
            if (status === "all") {
                conversations = includeChannelCols ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            c.id,
            c.status,
            c.priority,
            c.last_message_at,
            c.assigned_agent_id,
            c.contact_id,
            COALESCE(c.channel, 'whatsapp') as channel,
            c.external_user_id,
            contacts.name as contact_name,
            contacts.phone_number,
            contacts.avatar_url as contact_avatar,
            u.name as agent_name,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
          FROM conversations c
          LEFT JOIN contacts ON c.contact_id = contacts.id
          LEFT JOIN users u ON c.assigned_agent_id = u.id
          WHERE c.contact_id IN (SELECT id FROM contacts WHERE created_by_user_id = ${user.id})
          ORDER BY c.last_message_at DESC
          LIMIT 50
        ` : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            c.id,
            c.status,
            c.priority,
            c.last_message_at,
            c.assigned_agent_id,
            c.contact_id,
            'whatsapp' as channel,
            NULL::varchar as external_user_id,
            contacts.name as contact_name,
            contacts.phone_number,
            contacts.avatar_url as contact_avatar,
            u.name as agent_name,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
          FROM conversations c
          LEFT JOIN contacts ON c.contact_id = contacts.id
          LEFT JOIN users u ON c.assigned_agent_id = u.id
          WHERE c.contact_id IN (SELECT id FROM contacts WHERE created_by_user_id = ${user.id})
          ORDER BY c.last_message_at DESC
          LIMIT 50
        `;
            } else {
                conversations = includeChannelCols ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            c.id,
            c.status,
            c.priority,
            c.last_message_at,
            c.assigned_agent_id,
            c.contact_id,
            COALESCE(c.channel, 'whatsapp') as channel,
            c.external_user_id,
            contacts.name as contact_name,
            contacts.phone_number,
            contacts.avatar_url as contact_avatar,
            u.name as agent_name,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
          FROM conversations c
          LEFT JOIN contacts ON c.contact_id = contacts.id
          LEFT JOIN users u ON c.assigned_agent_id = u.id
          WHERE c.contact_id IN (SELECT id FROM contacts WHERE created_by_user_id = ${user.id}) AND c.status = ${status}
          ORDER BY c.last_message_at DESC
          LIMIT 50
        ` : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT 
            c.id,
            c.status,
            c.priority,
            c.last_message_at,
            c.assigned_agent_id,
            c.contact_id,
            'whatsapp' as channel,
            NULL::varchar as external_user_id,
            contacts.name as contact_name,
            contacts.phone_number,
            contacts.avatar_url as contact_avatar,
            u.name as agent_name,
            (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read_at IS NULL AND sender_type = 'contact') as unread_count
          FROM conversations c
          LEFT JOIN contacts ON c.contact_id = contacts.id
          LEFT JOIN users u ON c.assigned_agent_id = u.id
          WHERE c.contact_id IN (SELECT id FROM contacts WHERE created_by_user_id = ${user.id}) AND c.status = ${status}
          ORDER BY c.last_message_at DESC
          LIMIT 50
        `;
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            conversations
        });
    } catch (error) {
        console.error("[v0] Get conversations error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c396c7c9._.js.map