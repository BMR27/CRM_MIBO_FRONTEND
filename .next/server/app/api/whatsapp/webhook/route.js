(()=>{var a={};a.id=9274,a.ids=[9274],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8216:(a,b,c)=>{"use strict";c.d(b,{H:()=>e,l:()=>f});var d=c(61574);let e=!process.env.DATABASE_URL,f=process.env.DATABASE_URL?(0,d.A)(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10}):()=>{throw Error("Database is not configured (DATABASE_URL missing)")}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33235:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>Q,patchFetch:()=>P,routeModule:()=>L,serverHooks:()=>O,workAsyncStorage:()=>M,workUnitAsyncStorage:()=>N});var d={};c.r(d),c.d(d,{GET:()=>F,POST:()=>G,runtime:()=>A});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(8216),y=c(55511),z=c.n(y);let A="nodejs";async function B(a){try{await a`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        channel VARCHAR(50) NOT NULL,
        external_id VARCHAR(255),
        payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,await a`CREATE INDEX IF NOT EXISTS idx_webhook_logs_channel ON webhook_logs(channel)`,await a`CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed)`}catch{}}let C=null,D=null;async function E(){if(null!==C)return C;try{let a=await (0,x.l)`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name = 'read_at'
      LIMIT 1
    `;C=Array.isArray(a)&&a.length>0}catch{C=!1}return C}async function F(a){try{let{searchParams:b}=new URL(a.url),c=b.get("hub.mode"),d=b.get("hub.verify_token"),e=b.get("hub.challenge"),f=process.env.WHATSAPP_VERIFY_TOKEN;console.log("[WhatsApp Webhook] Verification request:",{mode:c,token:d});try{x.l&&(await B(x.l),await (0,x.l)`
          INSERT INTO webhook_logs (channel, external_id, payload, processed, error)
          VALUES (
            'whatsapp_verify',
            'verify',
            ${JSON.stringify({receivedAt:new Date().toISOString(),mode:c,hasToken:!!d,tokenPrefix:d?String(d).slice(0,6):null,ok:"subscribe"===c&&d===f,hasChallenge:!!e})}::jsonb,
            true,
            ${"subscribe"===c&&d===f?null:"Forbidden"}
          )
        `)}catch(a){console.warn("[WhatsApp Webhook] Failed to persist verification attempt:",a)}if("subscribe"===c&&d===f)return console.log("[WhatsApp Webhook] Verification successful"),new w.NextResponse(e,{status:200});return console.log("[WhatsApp Webhook] Verification failed"),w.NextResponse.json({error:"Forbidden"},{status:403})}catch(a){return console.error("[WhatsApp Webhook] Verification error:",a),w.NextResponse.json({error:"Internal error"},{status:500})}}async function G(a){try{if(!x.l)return await a.text().catch(()=>""),console.warn("[WhatsApp Webhook] DATABASE_URL missing; skipping processing"),w.NextResponse.json({status:"ok"},{status:200});await B(x.l);let b=await a.text(),c=a.headers.get("x-hub-signature-256");if(!function(a,b){let c=process.env.WHATSAPP_APP_SECRET;if(!c)return!0;if(!b||!b.startsWith("sha256="))return!1;let d=b.replace("sha256=",""),e=z().createHmac("sha256",c).update(a,"utf8").digest("hex");try{return z().timingSafeEqual(Buffer.from(d),Buffer.from(e))}catch{return!1}}(b,c)){console.warn("[WhatsApp Webhook] Invalid signature");try{await (0,x.l)`
          INSERT INTO webhook_logs (channel, external_id, payload, processed, error)
          VALUES (
            'whatsapp_invalid_signature',
            'invalid_signature',
            ${JSON.stringify({receivedAt:new Date().toISOString(),hasSignature:!!c,signaturePrefix:c?String(c).slice(0,16):null})}::jsonb,
            false,
            'Invalid signature'
          )
        `}catch(a){console.warn("[WhatsApp Webhook] Failed to persist invalid signature marker:",a)}if("1"===process.env.DEBUG_WHATSAPP_WEBHOOK)try{await (0,x.l)`
            INSERT INTO webhook_logs (channel, external_id, payload, processed, error)
            VALUES (
              'whatsapp_invalid_signature',
              'unknown',
              ${JSON.stringify({signature:c||null,rawBody:b,receivedAt:new Date().toISOString()})}::jsonb,
              false,
              'Invalid signature'
            )
          `}catch(a){console.warn("[WhatsApp Webhook] Failed to persist invalid signature debug payload:",a)}return w.NextResponse.json({error:"Invalid signature"},{status:401})}let d=JSON.parse(b);console.log("[WhatsApp Webhook] Received:",JSON.stringify(d,null,2));try{await (0,x.l)`
        INSERT INTO webhook_logs (channel, external_id, payload, processed)
        VALUES ('whatsapp', ${d.entry?.[0]?.id||"unknown"}, ${JSON.stringify(d)}, false)
      `}catch(a){console.warn("[WhatsApp Webhook] Failed to persist webhook log:",a)}for(let a of d.entry||[])for(let b of a.changes||[]){let a=b.value,c=a?.metadata,d=c?.phone_number_id||"unknown",e=new Map;for(let b of a?.contacts||[]){let a=b?.wa_id,c=b?.profile?.name;a&&"string"==typeof c&&c.trim()&&e.set(a,c.trim())}for(let b of a?.messages||[])await H(b,d,e);for(let b of a?.statuses||[])await K(b)}try{await (0,x.l)`
        UPDATE webhook_logs 
        SET processed = true 
        WHERE channel = 'whatsapp' 
          AND external_id = ${d.entry?.[0]?.id||"unknown"}
          AND created_at >= NOW() - INTERVAL '1 minute'
      `}catch(a){console.warn("[WhatsApp Webhook] Failed to mark webhook as processed:",a)}return w.NextResponse.json({status:"ok"},{status:200})}catch(a){console.error("[WhatsApp Webhook] Error processing message:",a);try{await (0,x.l)`
        UPDATE webhook_logs 
        SET error = ${a instanceof Error?a.message:String(a)}, processed = false
        WHERE channel = 'whatsapp' 
          AND created_at >= NOW() - INTERVAL '1 minute'
        ORDER BY created_at DESC
        LIMIT 1
      `}catch(a){console.error("[WhatsApp Webhook] Error logging error:",a)}return w.NextResponse.json({status:"error"},{status:500})}}async function H(a,b,c){let d=a.from,e=a.id,f=a.timestamp?1e3*Number.parseInt(a.timestamp,10):Date.now(),g=function(a){if(!a)return{message_type:"text",content:"",metadata:null};if(a.text?.body)return{message_type:"text",content:a.text.body,metadata:null};if(a.button?.text)return{message_type:"text",content:a.button.text,metadata:{type:"button"}};if(a.interactive?.button_reply?.title)return{message_type:"text",content:a.interactive.button_reply.title,metadata:{type:"interactive",interactive:a.interactive}};if(a.interactive?.list_reply?.title)return{message_type:"text",content:a.interactive.list_reply.title,metadata:{type:"interactive",interactive:a.interactive}};let b=String(a.type||""),c=(a,c)=>{let d=a?.filename,e=a?.caption,f={type:b,media_id:a?.id,mime_type:a?.mime_type,sha256:a?.sha256,filename:d,caption:e};return{message_type:b,content:e||d||c,metadata:f}};return"image"===b&&a.image?c(a.image,"[imagen]"):"document"===b&&a.document?c(a.document,"[documento]"):"audio"===b&&a.audio?c(a.audio,"[audio]"):"video"===b&&a.video?c(a.video,"[video]"):"sticker"===b&&a.sticker?c(a.sticker,"[sticker]"):b?{message_type:b,content:`[${b} mensaje]`,metadata:{type:b}}:{message_type:"text",content:"",metadata:null}}(a),h=c.get(d),i=`whatsapp:+${I(d)}`;console.log("[WhatsApp] Processing message:",{senderId:d,messageText:g.content,messageId:e,timestamp:f});try{let a=await (0,x.l)`
      SELECT * FROM contacts 
      WHERE external_user_id = ${d} 
        AND channel = 'whatsapp'
      LIMIT 1
    `;if(0===a.length){let b=`whatsapp:+${I(d)}`;a=await (0,x.l)`
        INSERT INTO contacts (
          name, 
          phone_number, 
          channel, 
          external_user_id,
          created_at
        )
        VALUES (
          ${h||i},
          ${b},
          'whatsapp',
          ${d},
          NOW()
        )
        RETURNING *
      `}else if(h){let b=String(a[0]?.name||"").trim(),c=String(a[0]?.phone_number||"").trim(),d=b&&/^(whatsapp:\+|\+?\d{7,})/.test(b);if((!b||b.toLowerCase().startsWith("whatsapp ")||d||b===c)&&b!==h)try{a=await (0,x.l)`
              UPDATE contacts
              SET name = ${h}
              WHERE id = ${a[0].id}
              RETURNING *
            `}catch(a){console.warn("[WhatsApp] Failed to update contact name:",a)}}let c=a[0].id,j=await (0,x.l)`
      SELECT * FROM conversations 
      WHERE contact_id = ${c} 
        AND channel = 'whatsapp'
        AND status IN ('open', 'assigned')
      ORDER BY created_at DESC
      LIMIT 1
    `;0===j.length&&(j=await (0,x.l)`
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
          ${c},
          'open',
          'medium',
          'whatsapp',
          ${d},
          ${`${b}_${d}`},
          NOW(),
          NOW()
        )
        RETURNING *
      `);let k=j[0].id;await (0,x.l)`
      INSERT INTO messages (
        conversation_id,
        sender_type,
        content,
        channel,
        external_message_id,
        direction,
        message_type,
        metadata,
        created_at
      )
      VALUES (
        ${k},
        'customer',
        ${g.content||""},
        'whatsapp',
        ${e},
        'inbound',
        ${g.message_type},
        ${g.metadata?JSON.stringify(g.metadata):null}::jsonb,
        ${new Date(f)}
      )
    `,await (0,x.l)`
      UPDATE conversations 
      SET updated_at = NOW(), last_message_at = NOW()
      WHERE id = ${k}
    `,console.log("[WhatsApp] Message processed successfully")}catch(a){throw console.error("[WhatsApp] Error handling message:",a),a}}function I(a){return String(a).replace("whatsapp:","").replace(/\D/g,"")}async function J(){if(null!==D)return D;try{let a=await (0,x.l)`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name = 'external_message_id'
      LIMIT 1
    `;D=Array.isArray(a)&&a.length>0}catch{D=!1}return D}async function K(a){let b=String(a?.id||"").trim(),c=String(a?.status||"").trim().toLowerCase(),d=a?.timestamp?1e3*Number.parseInt(String(a.timestamp),10):null,e=d&&!Number.isNaN(d)?new Date(d):new Date;if(b&&c)try{let d="failed"===c?String(a?.errors?.[0]?.title||a?.errors?.[0]?.message||a?.errors?.[0]?.error_data?.details||""):"",f=await J();f?await (0,x.l)`
        UPDATE messages
        SET metadata =
          jsonb_set(
            jsonb_set(
              jsonb_set(
                COALESCE(metadata, '{}'::jsonb),
                '{whatsappStatus}',
                to_jsonb(${c}),
                true
              ),
              '{whatsappStatusAt}',
              to_jsonb(${e.toISOString()}),
              true
            ),
            '{whatsappError}',
            to_jsonb(${d}),
            true
          )
        WHERE external_message_id = ${b}
      `:await (0,x.l)`
        UPDATE messages
        SET metadata =
          jsonb_set(
            jsonb_set(
              jsonb_set(
                COALESCE(metadata, '{}'::jsonb),
                '{whatsappStatus}',
                to_jsonb(${c}),
                true
              ),
              '{whatsappStatusAt}',
              to_jsonb(${e.toISOString()}),
              true
            ),
            '{whatsappError}',
            to_jsonb(${d}),
            true
          )
        WHERE (metadata->'send'->>'externalMessageId') = ${b}
      `,"read"===c&&await E()&&(f?await (0,x.l)`
            UPDATE messages
            SET read_at = COALESCE(read_at, ${e})
            WHERE external_message_id = ${b}
          `:await (0,x.l)`
            UPDATE messages
            SET read_at = COALESCE(read_at, ${e})
            WHERE (metadata->'send'->>'externalMessageId') = ${b}
          `)}catch(a){console.warn("[WhatsApp Webhook] Failed to process status:",{messageId:b,state:c,error:a instanceof Error?a.message:String(a)})}}let L=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/whatsapp/webhook/route",pathname:"/api/whatsapp/webhook",filename:"route",bundlePath:"app/api/whatsapp/webhook/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/bryanmejiaruiz/Documents/Repositorios/CRM_MIBO_FRONTEND/app/api/whatsapp/webhook/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:M,workUnitAsyncStorage:N,serverHooks:O}=L;function P(){return(0,g.patchFetch)({workAsyncStorage:M,workUnitAsyncStorage:N})}async function Q(a,b,c){L.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/whatsapp/webhook/route";"/index"===d&&(d="/");let e=await L.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:E,clientReferenceManifest:F,serverActionsManifest:G}=e,H=(0,l.normalizeAppPath)(d),I=!!(A.dynamicRoutes[H]||A.routes[E]),J=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(I&&!z){let a=!!A.routes[E],b=A.dynamicRoutes[H];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await J();throw new u.NoFallbackError}}let K=null;!I||L.isDev||z||(K="/index"===(K=E)?"/":K);let M=!0===L.isDev||!I,N=I&&!M;G&&F&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:F,serverActionsManifest:G,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:G})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>L.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>L.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!I)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await L.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})},B),b}},l=await L.handleResponse({req:a,nextConfig:x,cacheKey:K,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!I)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&I||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await L.onRequestError(a,b,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})}),I)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74998:a=>{"use strict";a.exports=require("perf_hooks")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,1813,1574],()=>b(b.s=33235));module.exports=c})();