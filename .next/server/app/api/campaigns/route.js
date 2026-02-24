(()=>{var a={};a.id=55,a.ids=[55],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8216:(a,b,c)=>{"use strict";c.d(b,{H:()=>e,l:()=>f});var d=c(61574);let e=!process.env.DATABASE_URL,f=process.env.DATABASE_URL?(0,d.A)(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10}):()=>{throw Error("Database is not configured (DATABASE_URL missing)")}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11102:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>K,patchFetch:()=>J,routeModule:()=>F,serverHooks:()=>I,workAsyncStorage:()=>G,workUnitAsyncStorage:()=>H});var d={};c.r(d),c.d(d,{GET:()=>E,runtime:()=>z});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(20296),y=c(8216);let z="nodejs";async function A(a){try{await a`
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
    `,await a`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON bulk_campaigns(status)`,await a`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_created_at ON bulk_campaigns(created_at)`}catch{}}function B(a){try{let b=a?new Date(a):null;if(!b||Number.isNaN(b.getTime()))return new Date().toISOString().slice(0,10);return b.toISOString().slice(0,10)}catch{return new Date().toISOString().slice(0,10)}}async function C(a){try{await a`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        channel VARCHAR(50) NOT NULL,
        external_id VARCHAR(255),
        payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,await a`CREATE INDEX IF NOT EXISTS idx_webhook_logs_channel ON webhook_logs(channel)`,await a`CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed)`}catch{}}async function D(a){await C(a);try{return(await a`
      SELECT DISTINCT ON (external_id)
        external_id,
        payload,
        created_at
      FROM webhook_logs
      WHERE channel = 'bulk_campaign'
        AND external_id IS NOT NULL
      ORDER BY external_id, created_at DESC
      LIMIT 50
    `||[]).map(a=>{let b=a?.payload||{},c=String(a?.external_id||""),d=String(b?.status||"scheduled"),e=Number(b?.total||0),f=Number(b?.sent||0),g=Number(b?.failed||0),h=Number(b?.skipped||0),i=B(b?.completedAt||b?.startedAt||b?.scheduledAt||b?.createdAt||a?.created_at);return{id:c,name:String(b?.name||"Campa\xf1a"),status:d,recipients:e,delivered:f,read:0,replied:0,failed:g,skipped:h,date:i,message:String(b?.message||"")}})}catch{return[]}}async function E(){try{if(!await (0,x.Ht)())return w.NextResponse.json({error:"Not authenticated"},{status:401});if(y.H)return w.NextResponse.json({campaigns:[]},{status:200});if(!y.l)return w.NextResponse.json({error:"DATABASE_URL missing",hint:"Configura DATABASE_URL para poder listar campa\xf1as."},{status:500});let a=y.l;await A(a);let b=await D(a),c=[];try{c=await a`
        SELECT
          id,
          name,
          message,
          status,
          total,
          sent,
          failed,
          skipped,
          scheduled_at,
          started_at,
          completed_at,
          created_at
        FROM bulk_campaigns
        ORDER BY created_at DESC
        LIMIT 50
      `}catch{c=[]}if(!c||0===c.length)try{let c=(await a`
          WITH m AS (
            SELECT
              (metadata->>'campaignId') AS campaign_id,
              COALESCE(NULLIF(metadata->>'campaignName', ''), 'Campaña') AS name,
              MAX(created_at) AS last_at,
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE (metadata->>'source') = 'bulk' AND (metadata->'send'->>'ok') = 'true') AS sent,
              COUNT(*) FILTER (WHERE (metadata->>'source') = 'bulk' AND (metadata->'send'->>'skipped') = 'true') AS skipped,
              COUNT(*) FILTER (
                WHERE (metadata->>'source') = 'bulk'
                  AND (metadata->'send'->>'ok') = 'false'
                  AND COALESCE((metadata->'send'->>'skipped'), 'false') != 'true'
              ) AS failed
            FROM messages
            WHERE (metadata->>'campaignId') IS NOT NULL
              AND (metadata->>'source') = 'bulk'
            GROUP BY 1, 2
          )
          SELECT *
          FROM m
          ORDER BY last_at DESC
          LIMIT 50
        `||[]).map(a=>{let b=Number(a?.total||0),c=Number(a?.sent||0),d=Number(a?.failed||0),e=Number(a?.skipped||0),f=B(a?.last_at);return{id:String(a?.campaign_id||""),name:String(a?.name||"Campa\xf1a"),status:0===d||c>0?"completed":"failed",recipients:b,delivered:c,read:0,replied:0,failed:d,skipped:e,date:f,message:""}}),d=new Map;for(let a of[...b,...c])a?.id&&(d.has(a.id)||d.set(a.id,a));return w.NextResponse.json({campaigns:Array.from(d.values()).slice(0,50)})}catch{}let d=(c||[]).map(a=>{let b=String(a?.status||"scheduled"),c=Number(a?.total||0),d=Number(a?.sent||0),e=Number(a?.failed||0),f=Number(a?.skipped||0),g=B(a?.completed_at||a?.started_at||a?.scheduled_at||a?.created_at);return{id:String(a?.id),name:String(a?.name||"Campa\xf1a"),status:b,recipients:c,delivered:d,read:0,replied:0,failed:e,skipped:f,date:g,message:String(a?.message||"")}}),e=new Map;for(let a of[...b,...d])a?.id&&(e.has(a.id)||e.set(a.id,a));return w.NextResponse.json({campaigns:Array.from(e.values()).slice(0,50)})}catch(a){return console.error("[Campaigns List] Error:",a),w.NextResponse.json({error:"Internal server error"},{status:500})}}let F=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/campaigns/route",pathname:"/api/campaigns",filename:"route",bundlePath:"app/api/campaigns/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/bryanmejiaruiz/Documents/Repositorios/CRM_MIBO_FRONTEND/app/api/campaigns/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:G,workUnitAsyncStorage:H,serverHooks:I}=F;function J(){return(0,g.patchFetch)({workAsyncStorage:G,workUnitAsyncStorage:H})}async function K(a,b,c){F.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/campaigns/route";"/index"===d&&(d="/");let e=await F.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:E,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,l.normalizeAppPath)(d),J=!!(A.dynamicRoutes[I]||A.routes[E]),K=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!A.routes[E],b=A.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||F.isDev||z||(L="/index"===(L=E)?"/":L);let M=!0===F.isDev||!J,N=J&&!M;H&&G&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:H})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>F.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>F.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await F.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})},B),b}},l=await F.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await F.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}},20296:(a,b,c)=>{"use strict";c.d(b,{$G:()=>k,Ht:()=>i,jw:()=>h,nr:()=>j,q7:()=>l});var d=c(65573),e=c(45479),f=c(55649);let g=new TextEncoder().encode(process.env.JWT_SECRET||"your-secret-key-change-in-production");async function h(a){return await new e.P({user:a}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(g)}async function i(){let a=await (0,d.UL)(),b=a.get("session")?.value;if(!b)return null;try{let{payload:a}=await (0,f.V)(b,g);return a.user}catch(a){return null}}async function j(a){try{let{payload:b}=await (0,f.V)(a,g);return b.user}catch(a){return null}}async function k(a){(await (0,d.UL)()).set("session",a,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:604800,path:"/"})}async function l(){(await (0,d.UL)()).delete("session")}},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74998:a=>{"use strict";a.exports=require("perf_hooks")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,9852,1813,1574],()=>b(b.s=11102));module.exports=c})();