(()=>{var a={};a.id=2731,a.ids=[2731],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8216:(a,b,c)=>{"use strict";c.d(b,{H:()=>e,l:()=>f});var d=c(61574);let e=!process.env.DATABASE_URL,f=process.env.DATABASE_URL?(0,d.A)(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10}):()=>{throw Error("Database is not configured (DATABASE_URL missing)")}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},20296:(a,b,c)=>{"use strict";c.d(b,{$G:()=>k,Ht:()=>i,jw:()=>h,nr:()=>j,q7:()=>l});var d=c(65573),e=c(45479),f=c(55649);let g=new TextEncoder().encode(process.env.JWT_SECRET||"your-secret-key-change-in-production");async function h(a){return await new e.P({user:a}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(g)}async function i(){let a=await (0,d.UL)(),b=a.get("session")?.value;if(!b)return null;try{let{payload:a}=await (0,f.V)(b,g);return a.user}catch(a){return null}}async function j(a){try{let{payload:b}=await (0,f.V)(a,g);return b.user}catch(a){return null}}async function k(a){(await (0,d.UL)()).set("session",a,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:604800,path:"/"})}async function l(){(await (0,d.UL)()).delete("session")}},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},52478:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>J,patchFetch:()=>I,routeModule:()=>E,serverHooks:()=>H,workAsyncStorage:()=>F,workUnitAsyncStorage:()=>G});var d={};c.r(d),c.d(d,{GET:()=>D,runtime:()=>z});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(20296),y=c(8216);let z="nodejs";async function A(a){try{await a`
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
    `,await a`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON bulk_campaigns(status)`,await a`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_created_at ON bulk_campaigns(created_at)`}catch{}}async function B(a){try{let b=await a`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('direction', 'metadata', 'read_at', 'sender_type', 'conversation_id', 'created_at')
      ORDER BY column_name
    `;return new Set((b||[]).map(a=>String(a?.column_name||"").trim()).filter(Boolean))}catch{return new Set}}async function C(a){try{await a`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        channel VARCHAR(50) NOT NULL,
        external_id VARCHAR(255),
        payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,await a`CREATE INDEX IF NOT EXISTS idx_webhook_logs_channel ON webhook_logs(channel)`,await a`CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed)`}catch{}}async function D(){try{if(!await (0,x.Ht)())return w.NextResponse.json({error:"Not authenticated"},{status:401});if(y.H)return w.NextResponse.json({error:"Stats not available in demo mode"},{status:400});if(!y.l)return w.NextResponse.json({error:"DATABASE_URL missing",hint:"Configura DATABASE_URL para calcular estad\xedsticas."},{status:500});let a=y.l;await A(a);let b=0,c=0,d=0,e=0,f=async()=>{try{let b=await a`
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
        `;c=Number(b?.[0]?.sent||0),d=Number(b?.[0]?.failed||0),e=Number(b?.[0]?.skipped||0)}catch{}};try{let b=await a`
        SELECT
          COALESCE(SUM(sent), 0) AS sent,
          COALESCE(SUM(failed), 0) AS failed,
          COALESCE(SUM(skipped), 0) AS skipped
        FROM bulk_campaigns
      `;c=Number(b?.[0]?.sent||0),d=Number(b?.[0]?.failed||0),e=Number(b?.[0]?.skipped||0)}catch{await f()}try{let c=await a`
        SELECT COUNT(*) AS c
        FROM bulk_campaigns
        WHERE status IN ('scheduled', 'sending')
      `;b=Number(c?.[0]?.c||0)}catch{}try{await C(a);let c=await a`
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
      `,d=Number(c?.[0]?.c||0);b=Math.max(b,d)}catch{}let g=0,h=0,i=await B(a),j=i.has("metadata"),k=i.has("read_at"),l=i.has("direction"),m=i.has("sender_type");if(j)try{if(k&&l){let b=await a`
            SELECT
              COUNT(*) FILTER (WHERE read_at IS NOT NULL) AS read_count,
              COUNT(*) AS total_count
            FROM messages
            WHERE direction = 'outbound'
              AND (metadata->>'campaignId') IS NOT NULL
              AND COALESCE((metadata->>'source'), '') = 'bulk'
          `,c=Number(b?.[0]?.read_count||0),d=Number(b?.[0]?.total_count||0);g=d>0?Math.round(c/d*100):0}else if(l){let b=await a`
            SELECT
              COUNT(*) FILTER (WHERE (metadata->>'whatsappStatus') = 'read') AS read_count,
              COUNT(*) AS total_count
            FROM messages
            WHERE direction = 'outbound'
              AND (metadata->>'campaignId') IS NOT NULL
              AND COALESCE((metadata->>'source'), '') = 'bulk'
          `,c=Number(b?.[0]?.read_count||0),d=Number(b?.[0]?.total_count||0);g=d>0?Math.round(c/d*100):0}else if(m){let b=await a`
            SELECT
              COUNT(*) FILTER (WHERE (metadata->>'whatsappStatus') = 'read') AS read_count,
              COUNT(*) AS total_count
            FROM messages
            WHERE sender_type = 'agent'
              AND (metadata->>'campaignId') IS NOT NULL
              AND COALESCE((metadata->>'source'), '') = 'bulk'
          `,c=Number(b?.[0]?.read_count||0),d=Number(b?.[0]?.total_count||0);g=d>0?Math.round(c/d*100):0}}catch{}if(j)try{if(l){let b=await a`
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
          `,c=Number(b?.[0]?.total||0),d=Number(b?.[0]?.replied||0);h=c>0?Math.round(d/c*100):0}else if(m){let b=await a`
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
          `,c=Number(b?.[0]?.total||0),d=Number(b?.[0]?.replied||0);h=c>0?Math.round(d/c*100):0}}catch{}return w.NextResponse.json({activeCampaigns:b,messagesSent:c,messagesFailed:d,messagesSkipped:e,readRate:g,responseRate:h})}catch(a){return console.error("[Campaigns Stats] Error:",a),w.NextResponse.json({error:"Internal server error"},{status:500})}}let E=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/campaigns/stats/route",pathname:"/api/campaigns/stats",filename:"route",bundlePath:"app/api/campaigns/stats/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/bryanmejiaruiz/Documents/Repositorios/CRM_MIBO_FRONTEND/app/api/campaigns/stats/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:F,workUnitAsyncStorage:G,serverHooks:H}=E;function I(){return(0,g.patchFetch)({workAsyncStorage:F,workUnitAsyncStorage:G})}async function J(a,b,c){E.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/campaigns/stats/route";"/index"===d&&(d="/");let e=await E.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,l.normalizeAppPath)(d),J=!!(A.dynamicRoutes[I]||A.routes[F]),K=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!A.routes[F],b=A.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||E.isDev||z||(L="/index"===(L=F)?"/":L);let M=!0===E.isDev||!J,N=J&&!M;H&&G&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:H})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>E.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>E.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await E.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})},B),b}},l=await E.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await E.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74998:a=>{"use strict";a.exports=require("perf_hooks")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,9852,1813,1574],()=>b(b.s=52478));module.exports=c})();