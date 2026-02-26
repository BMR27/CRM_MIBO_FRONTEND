(()=>{var a={};a.id=3302,a.ids=[3302],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8216:(a,b,c)=>{"use strict";c.d(b,{H:()=>e,l:()=>f});var d=c(61574);let e=!process.env.DATABASE_URL,f=process.env.DATABASE_URL?(0,d.A)(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10}):()=>{throw Error("Database is not configured (DATABASE_URL missing)")}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},20296:(a,b,c)=>{"use strict";c.d(b,{$G:()=>k,Ht:()=>i,jw:()=>h,nr:()=>j,q7:()=>l});var d=c(65573),e=c(45479),f=c(55649);let g=new TextEncoder().encode(process.env.JWT_SECRET||"your-secret-key-change-in-production");async function h(a){return await new e.P({user:a}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(g)}async function i(){let a=await (0,d.UL)(),b=a.get("session")?.value;if(!b)return null;try{let{payload:a}=await (0,f.V)(b,g);return a.user}catch(a){return null}}async function j(a){try{let{payload:b}=await (0,f.V)(a,g);return b.user}catch(a){return null}}async function k(a){(await (0,d.UL)()).set("session",a,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:604800,path:"/"})}async function l(){(await (0,d.UL)()).delete("session")}},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},41338:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>M,patchFetch:()=>L,routeModule:()=>H,serverHooks:()=>K,workAsyncStorage:()=>I,workUnitAsyncStorage:()=>J});var d={};c.r(d),c.d(d,{POST:()=>G,runtime:()=>z});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(20296),y=c(8216);let z="nodejs",A=null,B=null,C=null;async function D(a){if(null!==A)return A;try{let b=await a`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name IN ('channel', 'external_user_id')
      ORDER BY column_name
    `;A=Array.isArray(b)&&2===b.length}catch{A=!1}return A}async function E(a){if(null!==B)return B;try{let b=await a`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('channel', 'external_message_id', 'direction')
      ORDER BY column_name
    `;B=Array.isArray(b)&&3===b.length}catch{B=!1}return B}async function F(a){if(C)return C;try{let b=await a`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name = 'conversation_id'
      LIMIT 1
    `,c=b?.[0],d=String(c?.data_type||"").toLowerCase(),e=String(c?.udt_name||"").toLowerCase();C="uuid"===d||"uuid"===e?"uuid":d.includes("integer")||d.includes("bigint")||["int2","int4","int8"].includes(e)?"number":"unknown"}catch{C="unknown"}return C}async function G(a,{params:b}){try{var c;let d=await (0,x.Ht)();if(!d)return w.NextResponse.json({error:"Not authenticated"},{status:401});let{id:e}=await b;if(y.H)return w.NextResponse.json({error:"Media sending is not available in demo mode"},{status:400});if(!y.l)return w.NextResponse.json({error:"DATABASE_URL missing",hint:"Configura DATABASE_URL en Railway. Este endpoint requiere acceso a Postgres para buscar el destinatario y guardar el mensaje."},{status:500});let f=y.l,g=process.env.WHATSAPP_ACCESS_TOKEN,h=process.env.WHATSAPP_PHONE_NUMBER_ID;if(!g)return w.NextResponse.json({error:"WHATSAPP_ACCESS_TOKEN missing",hint:"Configura WHATSAPP_ACCESS_TOKEN en Railway (servicio del frontend). Debe ser un token v\xe1lido de WhatsApp Cloud API."},{status:500});if(!h)return w.NextResponse.json({error:"WHATSAPP_PHONE_NUMBER_ID missing",hint:"Configura WHATSAPP_PHONE_NUMBER_ID en Railway (servicio del frontend). Ojo: NO es el WABA ID; es el Phone Number ID que ves en Meta Developers > WhatsApp > API Setup."},{status:500});let i=await a.formData(),j=i.get("file");if(!j||"string"==typeof j)return w.NextResponse.json({error:"file is required"},{status:400});let k=String(i.get("caption")||"").trim(),l=String(i.get("type")||"").trim(),m=j.name||"archivo",n=j.type||"application/octet-stream",o=(()=>{let a,b;return["image","video","audio","document","sticker"].includes(l)?l:(a=String(n||"").toLowerCase(),b=String(m||"").toLowerCase(),"image/webp"===a||b.endsWith(".webp")?"sticker":a.startsWith("image/")?"image":a.startsWith("video/")?"video":a.startsWith("audio/")?"audio":"document")})(),p="",q=await D(f),r=q?await f`
          SELECT
            conv.channel,
            conv.external_user_id,
            c.phone_number
          FROM conversations conv
          LEFT JOIN contacts c ON conv.contact_id = c.id
          WHERE conv.id::text = ${e}
          LIMIT 1
        `:await f`
          SELECT
            c.phone_number
          FROM conversations conv
          LEFT JOIN contacts c ON conv.contact_id = c.id
          WHERE conv.id::text = ${e}
          LIMIT 1
        `;if(r?.[0]){let a=r[0],b=q?String(a.channel||"whatsapp"):"whatsapp";if("whatsapp"!==b)return w.NextResponse.json({error:`Unsupported channel for media send: ${b}`},{status:400});c=(q?a.external_user_id:"")||a.phone_number||"",p=String(c||"").replace("whatsapp:","").replace(/\D/g,"")}if(!p)return w.NextResponse.json({error:"Recipient phone not found for conversation"},{status:400});let s=new FormData;s.append("messaging_product","whatsapp"),s.append("file",j,m);let t=await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(h)}/media`,{method:"POST",headers:{Authorization:`Bearer ${g}`},body:s}),u=await t.json().catch(()=>null);if(!t.ok)return w.NextResponse.json({error:"Failed to upload media",details:u},{status:t.status});let v=String(u?.id||"");if(!v)return w.NextResponse.json({error:"Cloud API did not return media id",details:u},{status:502});let z={messaging_product:"whatsapp",to:p,type:o};"image"===o&&(z.image={id:v,...k?{caption:k}:{}}),"video"===o&&(z.video={id:v,...k?{caption:k}:{}}),"audio"===o&&(z.audio={id:v}),"sticker"===o&&(z.sticker={id:v}),"document"===o&&(z.document={id:v,...k?{caption:k}:{},...m?{filename:m}:{}});let A=await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(h)}/messages`,{method:"POST",headers:{Authorization:`Bearer ${g}`,"Content-Type":"application/json"},body:JSON.stringify(z)}),B=await A.json().catch(()=>null);if(!A.ok)return w.NextResponse.json({error:"Failed to send media",details:B},{status:A.status});let C=String(B?.messages?.[0]?.id||B?.message_id||"")||null,G=k||m||`[${o}]`,H={type:o,media_id:v,mime_type:n,filename:m,caption:k||void 0},I=null;try{let a=await E(f),b=await F(f),c=String(e),g=Number.parseInt(c,10),h="uuid"===b&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(c||"")),i="number"===b&&Number.isFinite(g);if("uuid"!==b||h)if("number"!==b||i){let b=h?f`${c}::uuid`:f`${g}`,e=a?await f`
              INSERT INTO messages (
                conversation_id,
                sender_type,
                sender_id,
                content,
                channel,
                external_message_id,
                direction,
                message_type,
                metadata,
                created_at
              )
              VALUES (
                ${b},
                'agent',
                ${d.id},
                ${G},
                'whatsapp',
                ${C},
                'outbound',
                ${o},
                ${JSON.stringify(H)}::jsonb,
                NOW()
              )
              RETURNING id, content, sender_type, sender_id, created_at, message_type, metadata
            `:await f`
              INSERT INTO messages (
                conversation_id,
                sender_type,
                sender_id,
                content,
                message_type,
                metadata,
                created_at
              )
              VALUES (
                ${b},
                'agent',
                ${d.id},
                ${G},
                ${o},
                ${JSON.stringify(H)}::jsonb,
                NOW()
              )
              RETURNING id, content, sender_type, sender_id, created_at, message_type, metadata
            `;I=e?.[0]||null}else I=null;else I=null}catch{I=null}try{await f`
        UPDATE conversations
        SET last_message_at = NOW(), updated_at = NOW()
        WHERE id::text = ${e}
      `}catch{}let J=I?.metadata??H;if("string"==typeof J)try{J=JSON.parse(J)}catch{}let K=`/api/whatsapp/media/${encodeURIComponent(String(v))}?filename=${encodeURIComponent(m)}`;return w.NextResponse.json({success:!0,media_id:v,external_message_id:C,message:I?{...I,sender_name:d.name,metadata:J,media_url:K}:{id:Date.now(),content:G,sender_type:"agent",sender_id:d.id,sender_name:d.name,created_at:new Date().toISOString(),message_type:o,metadata:H,media_url:K}})}catch(a){return console.error("[send-media] Error:",a),w.NextResponse.json({error:"Failed to send media",details:String(a)},{status:500})}}let H=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/conversations/[id]/send-media/route",pathname:"/api/conversations/[id]/send-media",filename:"route",bundlePath:"app/api/conversations/[id]/send-media/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/bryanmejiaruiz/Documents/Repositorios/CRM_MIBO_FRONTEND/app/api/conversations/[id]/send-media/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:I,workUnitAsyncStorage:J,serverHooks:K}=H;function L(){return(0,g.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:J})}async function M(a,b,c){H.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/conversations/[id]/send-media/route";"/index"===d&&(d="/");let e=await H.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:E,clientReferenceManifest:F,serverActionsManifest:G}=e,I=(0,l.normalizeAppPath)(d),J=!!(A.dynamicRoutes[I]||A.routes[E]),K=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!A.routes[E],b=A.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||H.isDev||z||(L="/index"===(L=E)?"/":L);let M=!0===H.isDev||!J,N=J&&!M;G&&F&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:F,serverActionsManifest:G,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:G})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>H.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>H.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await H.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})},B),b}},l=await H.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await H.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74998:a=>{"use strict";a.exports=require("perf_hooks")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},96487:()=>{}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,1813,9852,1574],()=>b(b.s=41338));module.exports=c})();