(()=>{var a={};a.id=9e3,a.ids=[9e3],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8216:(a,b,c)=>{"use strict";c.d(b,{H:()=>e,l:()=>f});var d=c(61574);let e=!process.env.DATABASE_URL,f=process.env.DATABASE_URL?(0,d.A)(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10}):()=>{throw Error("Database is not configured (DATABASE_URL missing)")}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74998:a=>{"use strict";a.exports=require("perf_hooks")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},95931:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>H,patchFetch:()=>G,routeModule:()=>C,serverHooks:()=>F,workAsyncStorage:()=>D,workUnitAsyncStorage:()=>E});var d={};c.r(d),c.d(d,{GET:()=>y,POST:()=>z});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(8216);async function y(a){try{let{searchParams:b}=new URL(a.url),c=b.get("hub.mode"),d=b.get("hub.verify_token"),e=b.get("hub.challenge"),f=process.env.FACEBOOK_VERIFY_TOKEN;if(console.log("[Facebook Webhook] Verification request:",{mode:c,token:d}),"subscribe"===c&&d===f)return console.log("[Facebook Webhook] Verification successful"),new w.NextResponse(e,{status:200});return console.log("[Facebook Webhook] Verification failed"),w.NextResponse.json({error:"Forbidden"},{status:403})}catch(a){return console.error("[Facebook Webhook] Verification error:",a),w.NextResponse.json({error:"Internal error"},{status:500})}}async function z(a){try{let b=await a.json();for(let a of(console.log("[Facebook Webhook] Received:",JSON.stringify(b,null,2)),await (0,x.l)`
      INSERT INTO webhook_logs (channel, external_id, payload, processed)
      VALUES ('facebook', ${b.entry?.[0]?.id||"unknown"}, ${JSON.stringify(b)}, false)
    `,b.entry||[])){let b=a.id;for(let c of a.messaging||[])c.message&&!c.message.is_echo&&await A(c,b)}return await (0,x.l)`
      UPDATE webhook_logs 
      SET processed = true 
      WHERE channel = 'facebook' 
        AND external_id = ${b.entry?.[0]?.id||"unknown"}
        AND created_at >= NOW() - INTERVAL '1 minute'
    `,w.NextResponse.json({status:"ok"},{status:200})}catch(a){console.error("[Facebook Webhook] Error processing message:",a);try{await (0,x.l)`
        UPDATE webhook_logs 
        SET error = ${a instanceof Error?a.message:String(a)}, processed = false
        WHERE channel = 'facebook' 
          AND created_at >= NOW() - INTERVAL '1 minute'
        ORDER BY created_at DESC
        LIMIT 1
      `}catch(a){console.error("[Facebook Webhook] Error logging error:",a)}return w.NextResponse.json({status:"error"},{status:500})}}async function A(a,b){let c=a.sender.id;a.recipient.id;let d=a.message.text,e=a.message.mid,f=a.timestamp;console.log("[Facebook] Processing message:",{senderId:c,messageText:d,messageId:e,timestamp:f});try{let a=await (0,x.l)`
      SELECT * FROM contacts 
      WHERE external_user_id = ${c} 
        AND channel = 'facebook'
      LIMIT 1
    `;if(0===a.length){let b=await B(c);a=await (0,x.l)`
        INSERT INTO contacts (
          name, 
          phone_number, 
          channel, 
          external_user_id,
          created_at
        )
        VALUES (
          ${b.name||`Facebook User ${c.slice(-8)}`},
          ${`fb_${c}`},
          'facebook',
          ${c},
          NOW()
        )
        RETURNING *
      `}let g=a[0].id,h=await (0,x.l)`
      SELECT * FROM conversations 
      WHERE contact_id = ${g} 
        AND channel = 'facebook'
        AND status IN ('open', 'assigned')
      ORDER BY created_at DESC
      LIMIT 1
    `;0===h.length&&(h=await (0,x.l)`
        INSERT INTO conversations (
          contact_id,
          status,
          priority,
          channel,
          external_user_id,
          external_conversation_id,
          created_at,
          updated_at
        )
        VALUES (
          ${g},
          'open',
          'medium',
          'facebook',
          ${c},
          ${`${b}_${c}`},
          NOW(),
          NOW()
        )
        RETURNING *
      `);let i=h[0].id;await (0,x.l)`
      INSERT INTO messages (
        conversation_id,
        sender_type,
        content,
        channel,
        external_message_id,
        direction,
        created_at
      )
      VALUES (
        ${i},
        'customer',
        ${d||""},
        'facebook',
        ${e},
        'inbound',
        ${new Date(f)}
      )
    `,await (0,x.l)`
      UPDATE conversations 
      SET updated_at = NOW()
      WHERE id = ${i}
    `,console.log("[Facebook] Message processed successfully")}catch(a){throw console.error("[Facebook] Error handling message:",a),a}}async function B(a){let b=process.env.FACEBOOK_PAGE_ACCESS_TOKEN;try{let c=await fetch(`https://graph.facebook.com/v18.0/${a}?fields=name,first_name,last_name,profile_pic&access_token=${b}`);if(!c.ok)return console.error("[Facebook] Failed to fetch profile:",await c.text()),{name:`Facebook User ${a.slice(-8)}`};return await c.json()}catch(b){return console.error("[Facebook] Error fetching profile:",b),{name:`Facebook User ${a.slice(-8)}`}}}let C=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/facebook/webhook/route",pathname:"/api/facebook/webhook",filename:"route",bundlePath:"app/api/facebook/webhook/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/bryanmejiaruiz/Documents/Repositorios/CRM_MIBO_FRONTEND/app/api/facebook/webhook/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:D,workUnitAsyncStorage:E,serverHooks:F}=C;function G(){return(0,g.patchFetch)({workAsyncStorage:D,workUnitAsyncStorage:E})}async function H(a,b,c){C.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/facebook/webhook/route";"/index"===d&&(d="/");let e=await C.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,l.normalizeAppPath)(d),J=!!(A.dynamicRoutes[I]||A.routes[F]),K=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!A.routes[F],b=A.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||C.isDev||z||(L="/index"===(L=F)?"/":L);let M=!0===C.isDev||!J,N=J&&!M;H&&G&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:H})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>C.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>C.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&D&&E&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await C.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})},B),b}},l=await C.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",D?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await C.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,1813,1574],()=>b(b.s=95931));module.exports=c})();