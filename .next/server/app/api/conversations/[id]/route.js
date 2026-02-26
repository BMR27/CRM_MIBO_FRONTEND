(()=>{var a={};a.id=6488,a.ids=[6488],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8216:(a,b,c)=>{"use strict";c.d(b,{H:()=>e,l:()=>f});var d=c(61574);let e=!process.env.DATABASE_URL,f=process.env.DATABASE_URL?(0,d.A)(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10}):()=>{throw Error("Database is not configured (DATABASE_URL missing)")}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},20296:(a,b,c)=>{"use strict";c.d(b,{$G:()=>k,Ht:()=>i,jw:()=>h,nr:()=>j,q7:()=>l});var d=c(65573),e=c(45479),f=c(55649);let g=new TextEncoder().encode(process.env.JWT_SECRET||"your-secret-key-change-in-production");async function h(a){return await new e.P({user:a}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(g)}async function i(){let a=await (0,d.UL)(),b=a.get("session")?.value;if(!b)return null;try{let{payload:a}=await (0,f.V)(b,g);return a.user}catch(a){return null}}async function j(a){try{let{payload:b}=await (0,f.V)(a,g);return b.user}catch(a){return null}}async function k(a){(await (0,d.UL)()).set("session",a,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:604800,path:"/"})}async function l(){(await (0,d.UL)()).delete("session")}},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74622:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>J,patchFetch:()=>I,routeModule:()=>E,serverHooks:()=>H,workAsyncStorage:()=>F,workUnitAsyncStorage:()=>G});var d={};c.r(d),c.d(d,{DELETE:()=>D,GET:()=>B});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(8216),y=c(20296);let z=null;async function A(){if(null!==z)return z;try{let a=await (0,x.l)`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'comments'
      LIMIT 1
    `;z=Array.isArray(a)&&a.length>0}catch{z=!1}return z}async function B(a,{params:b}){try{let a=await (0,y.Ht)();if(!a)return w.NextResponse.json({error:"Not authenticated"},{status:401});let{id:c}=await b;if(!c)return w.NextResponse.json({error:"Conversation ID required"},{status:400});let d=await A(),e=d?await (0,x.l)`
          SELECT 
            id, 
            status, 
            priority, 
            contact_id,
            assigned_agent_id,
            comments,
            created_at, 
            last_message_at
          FROM conversations 
          WHERE id::text = ${c}
          LIMIT 1
        `:await (0,x.l)`
          SELECT 
            id, 
            status, 
            priority, 
            contact_id,
            assigned_agent_id,
            created_at, 
            last_message_at
          FROM conversations 
          WHERE id::text = ${c}
          LIMIT 1
        `;if(0!==e.length||isNaN(Number(c))||(e=d?await (0,x.l)`
            SELECT 
              id, 
              status, 
              priority, 
              contact_id,
              assigned_agent_id,
              comments,
              created_at, 
              last_message_at
            FROM conversations 
            WHERE id = ${Number.parseInt(c)}
            LIMIT 1
          `:await (0,x.l)`
            SELECT 
              id, 
              status, 
              priority, 
              contact_id,
              assigned_agent_id,
              created_at, 
              last_message_at
            FROM conversations 
            WHERE id = ${Number.parseInt(c)}
            LIMIT 1
          `),0===e.length)return w.NextResponse.json({error:"Conversation not found"},{status:404});let f=e[0];if("Agente"===a.role){if(f.assigned_agent_id!==a.id)return w.NextResponse.json({error:"Access denied"},{status:403})}else if("Administrador"!==a.role){let b=await (0,x.l)`
        SELECT id FROM contacts WHERE id = ${f.contact_id} AND created_by_user_id = ${a.id}
      `;if(0===b.length)return w.NextResponse.json({error:"Access denied"},{status:403})}let g=await (0,x.l)`
      SELECT name, phone_number FROM contacts WHERE id = ${f.contact_id}
    `,h=g.length>0?g[0]:{name:"Unknown",phone_number:""},i=[];f.assigned_agent_id&&(i=await (0,x.l)`
        SELECT name FROM users WHERE id = ${f.assigned_agent_id}
      `);let j=i.length>0?i[0]:null,k=f.comments;if(k)try{let a=JSON.parse(k);Array.isArray(a)||(k=JSON.stringify([]))}catch{if("string"==typeof k&&k.trim()){let a=k.split("\n").filter(a=>a.trim()).map((a,b)=>({id:`${Date.now()}-${b}`,text:a.trim(),created_at:new Date(f.created_at).toISOString()}));k=JSON.stringify(a)}else k=JSON.stringify([])}else k=JSON.stringify([]);return w.NextResponse.json({id:f.id,status:f.status,priority:f.priority,comments:k,created_at:f.created_at,last_message_at:f.last_message_at,contact_name:h.name,phone_number:h.phone_number,agent_name:j?.name||null})}catch(a){return console.error("[Conversations GET] Error:",a),w.NextResponse.json({error:"Internal server error"},{status:500})}}async function C(a,b){let c=[];try{c=await a`
      SELECT id
      FROM conversations
      WHERE id::text = ${b}
      LIMIT 1
    `}catch{}if(c?.length)return c[0];if(!isNaN(Number(b))){let d=Number.parseInt(b);if(c=await a`
      SELECT id
      FROM conversations
      WHERE id = ${d}
      LIMIT 1
    `,c?.length)return c[0]}return null}async function D(a,{params:b}){try{var c;let a=await (0,y.Ht)();if(!a)return w.NextResponse.json({error:"Not authenticated"},{status:401});let{id:d}=await b;if(!d)return w.NextResponse.json({error:"Conversation ID required"},{status:400});let e=(c=a.role,({Administrador:"admin",Supervisor:"supervisor",Agente:"agent",admin:"admin",supervisor:"supervisor",agent:"agent"})[String(c||"").trim()]||"other");if("admin"!==e&&"supervisor"!==e)return w.NextResponse.json({error:"Access denied"},{status:403});if(x.H)return w.NextResponse.json({ok:!0,deleted:d,demo:!0});let f=await x.l.begin(async a=>{if(!await C(a,d))return null;let b=async a=>{try{await a()}catch{}};if(await b(()=>a`DELETE FROM messages WHERE conversation_id::text = ${d}`),await b(()=>a`DELETE FROM conversation_tags WHERE conversation_id::text = ${d}`),!isNaN(Number(d))){let c=Number.parseInt(d);await b(()=>a`DELETE FROM messages WHERE conversation_id = ${c}`),await b(()=>a`DELETE FROM conversation_tags WHERE conversation_id = ${c}`)}let c=[];try{c=await a`DELETE FROM conversations WHERE id::text = ${d} RETURNING id`}catch{if(isNaN(Number(d)))throw Error("Failed to delete conversation");{let b=Number.parseInt(d);c=await a`DELETE FROM conversations WHERE id = ${b} RETURNING id`}}return c?.[0]?.id??null});if(!f)return w.NextResponse.json({error:"Conversation not found"},{status:404});return w.NextResponse.json({ok:!0,deleted:f})}catch(a){return console.error("[Conversations DELETE] Error:",a),w.NextResponse.json({error:"Internal server error"},{status:500})}}let E=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/conversations/[id]/route",pathname:"/api/conversations/[id]",filename:"route",bundlePath:"app/api/conversations/[id]/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/bryanmejiaruiz/Documents/Repositorios/CRM_MIBO_FRONTEND/app/api/conversations/[id]/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:F,workUnitAsyncStorage:G,serverHooks:H}=E;function I(){return(0,g.patchFetch)({workAsyncStorage:F,workUnitAsyncStorage:G})}async function J(a,b,c){E.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/conversations/[id]/route";"/index"===d&&(d="/");let e=await E.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,l.normalizeAppPath)(d),J=!!(A.dynamicRoutes[I]||A.routes[F]),K=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!A.routes[F],b=A.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||E.isDev||z||(L="/index"===(L=F)?"/":L);let M=!0===E.isDev||!J,N=J&&!M;H&&G&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:H})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>E.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>E.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await E.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})},B),b}},l=await E.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await E.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}},74998:a=>{"use strict";a.exports=require("perf_hooks")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,1813,9852,1574],()=>b(b.s=74622));module.exports=c})();