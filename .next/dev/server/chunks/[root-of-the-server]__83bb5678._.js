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
"[project]/app/api/conversations/[id]/comments/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function POST(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { comment } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Conversation ID required"
            }, {
                status: 400
            });
        }
        if (!comment || typeof comment !== "string") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Comment required"
            }, {
                status: 400
            });
        }
        console.log("[Comments POST] Saving comment for conversation", id);
        // Get current comments
        let getResult = [];
        try {
            getResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        SELECT comments FROM conversations WHERE id::text = ${id}
      `;
        } catch (e) {
            if (!isNaN(Number(id))) {
                getResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT comments FROM conversations WHERE id = ${Number.parseInt(id)}
        `;
            } else {
                throw e;
            }
        }
        if (getResult.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Conversation not found"
            }, {
                status: 404
            });
        }
        // Parse existing comments or create new array
        let comments = [];
        if (getResult[0].comments) {
            try {
                comments = JSON.parse(getResult[0].comments);
                if (!Array.isArray(comments)) {
                    comments = [];
                }
            } catch  {
                comments = [];
            }
        }
        // Add new comment
        const newComment = {
            id: `${Date.now()}`,
            text: comment,
            created_at: new Date().toISOString()
        };
        comments.push(newComment);
        const commentsJson = JSON.stringify(comments);
        // Update comments
        let updateResult = [];
        try {
            updateResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE conversations 
        SET comments = ${commentsJson}, updated_at = NOW()
        WHERE id::text = ${id}
        RETURNING id, comments
      `;
        } catch (e) {
            if (!isNaN(Number(id))) {
                updateResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          UPDATE conversations 
          SET comments = ${commentsJson}, updated_at = NOW()
          WHERE id = ${Number.parseInt(id)}
          RETURNING id, comments
        `;
            } else {
                throw e;
            }
        }
        console.log("[Comments POST] Comments saved successfully");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: id,
            comments: comments,
            message: "Comment added successfully"
        });
    } catch (error) {
        console.error("[Conversations Comments] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error",
            details: String(error)
        }, {
            status: 500
        });
    }
}
async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { commentId, text } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Conversation ID required"
            }, {
                status: 400
            });
        }
        if (!commentId || !text) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Comment ID and text required"
            }, {
                status: 400
            });
        }
        console.log("[Comments PUT] Updating comment", commentId);
        // Get current comments
        let getResult = [];
        try {
            getResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        SELECT comments FROM conversations WHERE id::text = ${id}
      `;
        } catch (e) {
            if (!isNaN(Number(id))) {
                getResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT comments FROM conversations WHERE id = ${Number.parseInt(id)}
        `;
            } else {
                throw e;
            }
        }
        if (getResult.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Conversation not found"
            }, {
                status: 404
            });
        }
        // Parse comments
        let comments = [];
        if (getResult[0].comments) {
            try {
                comments = JSON.parse(getResult[0].comments);
                if (!Array.isArray(comments)) {
                    comments = [];
                }
            } catch  {
                // Old format - convert text to JSON array
                const textComments = String(getResult[0].comments).split("\n").filter((line)=>line.trim());
                comments = textComments.map((text, index)=>({
                        id: `${Date.now()}-${index}`,
                        text: text.trim(),
                        created_at: new Date().toISOString()
                    }));
            }
        }
        // Find and update comment
        const commentIndex = comments.findIndex((c)=>c.id === commentId);
        if (commentIndex === -1) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Comment not found"
            }, {
                status: 404
            });
        }
        comments[commentIndex].text = text;
        const commentsJson = JSON.stringify(comments);
        // Update in database
        let updateResult = [];
        try {
            updateResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE conversations 
        SET comments = ${commentsJson}, updated_at = NOW()
        WHERE id::text = ${id}
        RETURNING id, comments
      `;
        } catch (e) {
            if (!isNaN(Number(id))) {
                updateResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          UPDATE conversations 
          SET comments = ${commentsJson}, updated_at = NOW()
          WHERE id = ${Number.parseInt(id)}
          RETURNING id, comments
        `;
            } else {
                throw e;
            }
        }
        console.log("[Comments PUT] Comment updated successfully");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: id,
            comments: comments,
            message: "Comment updated successfully"
        });
    } catch (error) {
        console.error("[Conversations Comments] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error",
            details: String(error)
        }, {
            status: 500
        });
    }
}
async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { commentId } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Conversation ID required"
            }, {
                status: 400
            });
        }
        if (!commentId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Comment ID required"
            }, {
                status: 400
            });
        }
        console.log("[Comments DELETE] Deleting comment", commentId);
        // Get current comments
        let getResult = [];
        try {
            getResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        SELECT comments FROM conversations WHERE id::text = ${id}
      `;
        } catch (e) {
            if (!isNaN(Number(id))) {
                getResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          SELECT comments FROM conversations WHERE id = ${Number.parseInt(id)}
        `;
            } else {
                throw e;
            }
        }
        if (getResult.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Conversation not found"
            }, {
                status: 404
            });
        }
        // Parse comments
        let comments = [];
        if (getResult[0].comments) {
            try {
                comments = JSON.parse(getResult[0].comments);
                if (!Array.isArray(comments)) {
                    comments = [];
                }
            } catch  {
                // Old format - convert text to JSON array
                const textComments = String(getResult[0].comments).split("\n").filter((line)=>line.trim());
                comments = textComments.map((text, index)=>({
                        id: `${Date.now()}-${index}`,
                        text: text.trim(),
                        created_at: new Date().toISOString()
                    }));
            }
        }
        // Remove comment
        comments = comments.filter((c)=>c.id !== commentId);
        const commentsJson = JSON.stringify(comments);
        // Update in database
        let updateResult = [];
        try {
            updateResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
        UPDATE conversations 
        SET comments = ${commentsJson}, updated_at = NOW()
        WHERE id::text = ${id}
        RETURNING id, comments
      `;
        } catch (e) {
            if (!isNaN(Number(id))) {
                updateResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
          UPDATE conversations 
          SET comments = ${commentsJson}, updated_at = NOW()
          WHERE id = ${Number.parseInt(id)}
          RETURNING id, comments
        `;
            } else {
                throw e;
            }
        }
        console.log("[Comments DELETE] Comment deleted successfully");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: id,
            comments: comments,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("[Conversations Comments] Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error",
            details: String(error)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__83bb5678._.js.map