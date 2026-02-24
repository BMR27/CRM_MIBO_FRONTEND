(()=>{var a={};a.id=7712,a.ids=[7712],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8216:(a,b,c)=>{"use strict";c.d(b,{H:()=>e,l:()=>f});var d=c(61574);let e=!process.env.DATABASE_URL,f=process.env.DATABASE_URL?(0,d.A)(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10}):()=>{throw Error("Database is not configured (DATABASE_URL missing)")}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},20296:(a,b,c)=>{"use strict";c.d(b,{$G:()=>k,Ht:()=>i,jw:()=>h,nr:()=>j,q7:()=>l});var d=c(65573),e=c(45479),f=c(55649);let g=new TextEncoder().encode(process.env.JWT_SECRET||"your-secret-key-change-in-production");async function h(a){return await new e.P({user:a}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(g)}async function i(){let a=await (0,d.UL)(),b=a.get("session")?.value;if(!b)return null;try{let{payload:a}=await (0,f.V)(b,g);return a.user}catch(a){return null}}async function j(a){try{let{payload:b}=await (0,f.V)(a,g);return b.user}catch(a){return null}}async function k(a){(await (0,d.UL)()).set("session",a,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:604800,path:"/"})}async function l(){(await (0,d.UL)()).delete("session")}},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},73733:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>Y,patchFetch:()=>X,routeModule:()=>T,serverHooks:()=>W,workAsyncStorage:()=>U,workUnitAsyncStorage:()=>V});var d={};c.r(d),c.d(d,{POST:()=>S,runtime:()=>z});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(20296),y=c(8216);let z="nodejs";async function A(a){try{await a`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        channel VARCHAR(50) NOT NULL,
        external_id VARCHAR(255),
        payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,await a`CREATE INDEX IF NOT EXISTS idx_webhook_logs_channel ON webhook_logs(channel)`,await a`CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed)`}catch{}}async function B(a,b,c){try{await A(a),await a`
      INSERT INTO webhook_logs (channel, external_id, payload, processed)
      VALUES ('bulk_campaign', ${b}, ${JSON.stringify(c)}::jsonb, true)
    `}catch{}}function C(a,b){let c=String(b?.name||"").trim(),d=String(b?.phone_number||"").trim(),e=String(b?.external_user_id||"").trim(),f=String(b?.id||"").trim();return String(a||"").replace(/\{\{\s*nombre\s*\}\}/gi,c||"").replace(/\{\{\s*telefono\s*\}\}/gi,d||"").replace(/\{\{\s*phone_number\s*\}\}/gi,d||"").replace(/\{\{\s*external_user_id\s*\}\}/gi,e||"").replace(/\{\{\s*id\s*\}\}/gi,f||"")}let D=null,E=null,F=null,G=null,H=null;async function I(a){if(null!==D)return D;try{let b=await a`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name IN ('channel', 'external_user_id')
      ORDER BY column_name
    `;D=Array.isArray(b)&&2===b.length}catch{D=!1}return D}async function J(a){if(null!==E)return E;try{let b=await a`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'external_conversation_id'
      LIMIT 1
    `;E=Array.isArray(b)&&b.length>0}catch{E=!1}return E}async function K(a){if(H)return H;try{let b=await a`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('channel', 'external_message_id', 'direction', 'metadata')
      ORDER BY column_name
    `;H=new Set((b||[]).map(a=>String(a?.column_name||"").trim()).filter(Boolean))}catch{H=new Set}return H}async function L(a){if(null!==F)return{openValue:F,closedValue:G};let b="open",c="closed";try{let d=await a`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'status'
      LIMIT 1
    `,e=String(d?.[0]?.data_type||""),f=String(d?.[0]?.udt_name||"");if("USER-DEFINED"===e.toUpperCase()&&f){let d=(await a`
        SELECT e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = ${f}
        ORDER BY e.enumsortorder
      `||[]).map(a=>String(a.enumlabel)),e=a=>d.find(b=>a.includes(b));b=e(["open","active","new","pending"])||d[0]||b,c=e(["closed","resolved","archived"])||null}}catch{}return F=b,G=c,{openValue:b,closedValue:c}}async function M(a,b){let c=await a`
    SELECT *
    FROM contacts
    WHERE id::text = ${b}
    LIMIT 1
  `;if(!c.length)return{ok:!1,error:"Contact not found"};let d=c[0],{openValue:e,closedValue:f}=await L(a),g=[];try{g=f?await a`
          SELECT *
          FROM conversations
          WHERE contact_id = ${d.id}
            AND status::text != ${f}
          ORDER BY created_at DESC
          LIMIT 1
        `:await a`
          SELECT *
          FROM conversations
          WHERE contact_id = ${d.id}
          ORDER BY created_at DESC
          LIMIT 1
        `}catch{g=[]}let h=await I(a),i=await J(a);if(!g.length){let b="facebook"===String(d?.channel||"whatsapp").toLowerCase()?"facebook":"whatsapp",c=String(d?.external_user_id||"").trim()||null;g=h&&i?await a`
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
          ${d.id},
          ${e},
          'medium',
          ${b},
          ${c},
          ${c?`${b}_${c}`:null},
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `:h?await a`
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
          ${d.id},
          ${e},
          'medium',
          ${b},
          ${c},
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `:await a`
        INSERT INTO conversations (
          contact_id,
          status,
          priority,
          created_at,
          updated_at,
          last_message_at
        )
        VALUES (
          ${d.id},
          ${e},
          'medium',
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `}let j=g[0];return{ok:!0,contact:d,conversation:j,channel:String(j?.channel||d?.channel||"whatsapp").toLowerCase(),externalUserId:String(j?.external_user_id||d?.external_user_id||"").trim()||null}}async function N(a,b,c){let d,e=process.env.WHATSAPP_ACCESS_TOKEN,f=process.env.WHATSAPP_PHONE_NUMBER_ID;if(!e||!f)return{ok:!1,error:"WHATSAPP credentials missing"};let g=(d=String(b||"").replace(/^whatsapp:/i,"").replace(/\D/g,""))?(13===(d=d.replace(/^0+/,"")).length&&d.startsWith("52")&&"1"===d.slice(2,3)&&(d=`52${d.slice(-10)}`),10===d.length&&(d=`52${d}`),d):"";if(!g)return{ok:!1,error:"Recipient phone missing",to:null};if(g.length<11||g.length>15)return{ok:!1,error:`Invalid recipient phone format (${g.length} digits)`,to:g};let h=String(a?.name||"").trim(),i=String(a?.language||"").trim();if(!h||!i)return{ok:!1,error:"Template name/language missing",to:g};let j=await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(f)}/messages`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({messaging_product:"whatsapp",to:g,type:"template",template:{name:h,language:{code:i},components:[{type:"body",parameters:(c||[]).map(a=>({type:"text",text:String(a??"")}))}]}})}),k=await j.json().catch(()=>null);return j.ok?{ok:!0,externalMessageId:String(k?.messages?.[0]?.id||"")||null,data:k,to:g}:{ok:!1,error:k?.error?.message||"Failed to send WhatsApp template",details:k,to:g}}async function O(a,b){let{conversationId:c,userId:d,content:e,metadata:f}=b,g=null;try{let b=[];try{b=await a`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content, metadata)
        VALUES (${c}::uuid, 'agent', ${d}, ${e}, ${f?JSON.stringify(f):null}::jsonb)
        RETURNING id
      `}catch{b=await a`
        INSERT INTO messages (conversation_id, sender_type, sender_id, content)
        VALUES (${c}::uuid, 'agent', ${d}, ${e})
        RETURNING id
      `}g=b?.[0]||null}catch{try{let b=Number.parseInt(c),h=[];try{h=await a`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content, metadata)
          VALUES (${b}, 'agent', ${d}, ${e}, ${f?JSON.stringify(f):null}::jsonb)
          RETURNING id
        `}catch{h=await a`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content)
          VALUES (${b}, 'agent', ${d}, ${e})
          RETURNING id
        `}g=h?.[0]||null}catch{let b=[];try{b=await a`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content, metadata)
          VALUES (${c}, 'agent', ${d}, ${e}, ${f?JSON.stringify(f):null}::jsonb)
          RETURNING id
        `}catch{b=await a`
          INSERT INTO messages (conversation_id, sender_type, sender_id, content)
          VALUES (${c}, 'agent', ${d}, ${e})
          RETURNING id
        `}g=b?.[0]||null}}try{await a`
      UPDATE conversations
      SET last_message_at = NOW(), updated_at = NOW()
      WHERE id::text = ${c}
    `}catch{}return g}async function P(a){try{await a`
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
    `,await a`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_status ON bulk_campaigns(status)`,await a`CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_created_at ON bulk_campaigns(created_at)`}catch{}}async function Q(a,b){try{let c=await a`
      INSERT INTO bulk_campaigns (name, message, send_mode, whatsapp_template, status, total, scheduled_at, created_by, created_at, updated_at)
      VALUES (
        ${b.name},
        ${b.message},
        ${b.sendMode},
        ${b.whatsappTemplate?JSON.stringify(b.whatsappTemplate):null}::jsonb,
        ${b.status},
        ${b.total},
        ${b.scheduledAt||null},
        ${"number"==typeof b.createdBy?b.createdBy:null},
        NOW(),
        NOW()
      )
      RETURNING id
    `;return c?.[0]?.id?String(c[0].id):null}catch{return null}}async function R(a,b,c){try{await a`
      UPDATE bulk_campaigns
      SET
        status = COALESCE(${c.status||null}, status),
        sent = COALESCE(${"number"==typeof c.sent?c.sent:null}, sent),
        failed = COALESCE(${"number"==typeof c.failed?c.failed:null}, failed),
        skipped = COALESCE(${"number"==typeof c.skipped?c.skipped:null}, skipped),
        total = COALESCE(${"number"==typeof c.total?c.total:null}, total),
        started_at = COALESCE(${c.startedAt??null}, started_at),
        completed_at = COALESCE(${c.completedAt??null}, completed_at),
        updated_at = NOW()
      WHERE id::text = ${b}
    `}catch{}}async function S(a){try{let b=await (0,x.Ht)();if(!b)return w.NextResponse.json({error:"Not authenticated"},{status:401});if(y.H)return w.NextResponse.json({error:"Bulk send is not available in demo mode"},{status:400});if(!y.l)return w.NextResponse.json({error:"DATABASE_URL missing",hint:"Configura DATABASE_URL para poder leer contactos y crear mensajes/conversaciones."},{status:500});let c=await a.json().catch(()=>({})),d=Array.isArray(c?.contactIds)?c.contactIds.map(a=>String(a).trim()).filter(Boolean):[],e=String(c?.message||"").trim(),f=String(c?.sendMode||"auto");!function(a,b){if("boolean"!=typeof a){if("number"==typeof a)return;if("string"==typeof a){let b=a.trim().toLowerCase();if("true"===b||"1"===b||"yes"===b||"y"===b||"on"===b||"false"===b||"0"===b||"no"===b||"n"===b||"off"===b);}}}(c?.skipIfOutside24h,0);let g=String(c?.campaignName||"").trim()||"Campa\xf1a",h=c?.campaignId?String(c.campaignId).trim():"",i=c?.whatsappTemplate?{name:String(c.whatsappTemplate?.name||"").trim().toLowerCase(),language:function(a){let b=String(a||"").trim();if(!b)return"";let c=b.replace(/-/g,"_");if("es_mex"===c.toLowerCase())return"es_MX";let d=c.split("_").filter(Boolean);if(1===d.length)return d[0].toLowerCase();let[e,f]=d;return`${String(e).toLowerCase()}_${String(f).toUpperCase()}`}(String(c.whatsappTemplate?.language||"")),bodyParams:Array.isArray(c.whatsappTemplate?.bodyParams)?c.whatsappTemplate.bodyParams.map(a=>String(a??"")).filter(a=>a.trim().length>0):[]}:null;if("template"!==f)return w.NextResponse.json({error:"Bulk send only supports WhatsApp templates (sendMode must be 'template')"},{status:400});if(!i||!i.name||!i.language)return w.NextResponse.json({error:"whatsappTemplate (name/language) is required for bulk template sends"},{status:400});if(!d.length)return w.NextResponse.json({error:"contactIds is required"},{status:400});let j=y.l,k=await K(j),l=k.has("direction"),m=k.has("external_message_id"),n=k.has("channel"),o=h||`bulk_${Date.now()}_${Math.random().toString(16).slice(2)}`,p=null;await P(j);try{if(h)/^\d+$/.test(h)&&(p=h,await R(j,h,{status:"sending",startedAt:new Date,total:d.length}));else{let a=await Q(j,{name:g,message:e,sendMode:f,whatsappTemplate:i,total:d.length,createdBy:b?.id,status:"sending"});a&&(o=a,p=a)}}catch{}p&&await R(j,p,{status:"sending",startedAt:new Date}),!p&&o&&await B(j,o,{kind:"campaign",id:o,name:g,message:e,sendMode:f,whatsappTemplate:"text"===f?null:i,status:"sending",total:d.length,sent:0,failed:0,skipped:0,startedAt:new Date().toISOString()});let q=[];for(let a of d)try{let c,d=await M(j,a);if(!d.ok){q.push({contactId:a,ok:!1,error:d.error});continue}let f=String(d.conversation.id),h="facebook"===d.channel?"facebook":"whatsapp",k=(i?.bodyParams||[]).map(a=>C(a,d.contact)),p=e?C(e,d.contact):`Plantilla WhatsApp: ${i.name} (${i.language})${k.length?` | ${k.join(" | ")}`:""}`;if("whatsapp"!==h){await O(j,{conversationId:f,userId:b.id,content:p,metadata:{campaignId:o,campaignName:g,source:"bulk",send:{ok:!1,skipped:!1,externalMessageId:null,error:"Solo se soporta WhatsApp Templates para env\xedos masivos"}}}),q.push({contactId:a,conversationId:f,channel:h,sendType:"template",ok:!1,externalMessageId:null,error:"Solo se soporta WhatsApp Templates para env\xedos masivos"});continue}let r=String(d.contact?.phone_number||"").trim();c=await N(i,r,k);let s=await O(j,{conversationId:f,userId:b.id,content:p,metadata:{campaignId:o,campaignName:g,source:"bulk",send:{ok:c.ok,skipped:!1,externalMessageId:c.ok?c.externalMessageId:null,to:c?.to??null,error:c.ok?null:String(c?.error||""),details:c.ok?null:c?.details??null}}});if(s?.id&&c.ok)try{n&&m&&l?await j`
                UPDATE messages
                SET channel = ${h},
                    external_message_id = ${c.externalMessageId},
                    direction = 'outbound'
                WHERE id = ${s.id}
              `:n&&m?await j`
                UPDATE messages
                SET channel = ${h},
                    external_message_id = ${c.externalMessageId}
                WHERE id = ${s.id}
              `:m&&l?await j`
                UPDATE messages
                SET external_message_id = ${c.externalMessageId},
                    direction = 'outbound'
                WHERE id = ${s.id}
              `:m?await j`
                UPDATE messages
                SET external_message_id = ${c.externalMessageId}
                WHERE id = ${s.id}
              `:l?await j`
                UPDATE messages
                SET direction = 'outbound'
                WHERE id = ${s.id}
              `:n&&await j`
                UPDATE messages
                SET channel = ${h}
                WHERE id = ${s.id}
              `}catch{}q.push({contactId:a,conversationId:f,channel:h,sendType:"template",ok:c.ok,externalMessageId:c.ok?c.externalMessageId:null,to:c?.to??null,toSource:r||null,toNormalized:c?.to??null,details:c.ok?null:c?.details??null,error:c.ok?null:/24\s*hour|24\s*h|outside\s+the\s+allowed\s+window|outside\s+customer\s+care/i.test(String(c.error||""))?`${c.error} (probable ventana 24h; usa plantilla aprobada)`:c.error})}catch(b){q.push({contactId:a,ok:!1,error:b instanceof Error?b.message:"Unexpected error"})}let r=q.length,s=q.filter(a=>a.ok).length,t=q.filter(a=>a?.skipped).length,u=q.filter(a=>!a.ok&&!a?.skipped).length;if(p){let a=0===u||s>0?"completed":"failed";await R(j,p,{status:a,total:r,sent:s,failed:u,skipped:t,completedAt:new Date})}if(!p&&o){let a=0===u||s>0?"completed":"failed";await B(j,o,{kind:"campaign",id:o,name:g,message:e,sendMode:f,whatsappTemplate:"text"===f?null:i,status:a,total:r,sent:s,failed:u,skipped:t,completedAt:new Date().toISOString()})}return w.NextResponse.json({campaignId:o,total:r,sent:s,failed:u,skipped:t,results:q,persisted:!!p})}catch(a){return console.error("[Campaigns Send] Error:",a),w.NextResponse.json({error:"Internal server error"},{status:500})}}let T=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/campaigns/send/route",pathname:"/api/campaigns/send",filename:"route",bundlePath:"app/api/campaigns/send/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/bryanmejiaruiz/Documents/Repositorios/CRM_MIBO_FRONTEND/app/api/campaigns/send/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:U,workUnitAsyncStorage:V,serverHooks:W}=T;function X(){return(0,g.patchFetch)({workAsyncStorage:U,workUnitAsyncStorage:V})}async function Y(a,b,c){T.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/campaigns/send/route";"/index"===d&&(d="/");let e=await T.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:E,clientReferenceManifest:F,serverActionsManifest:G}=e,H=(0,l.normalizeAppPath)(d),I=!!(A.dynamicRoutes[H]||A.routes[E]),J=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(I&&!z){let a=!!A.routes[E],b=A.dynamicRoutes[H];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await J();throw new u.NoFallbackError}}let K=null;!I||T.isDev||z||(K="/index"===(K=E)?"/":K);let L=!0===T.isDev||!I,M=I&&!L;G&&F&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:F,serverActionsManifest:G,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:G})});let N=a.method||"GET",O=(0,i.getTracer)(),P=O.getActiveScopeSpan(),Q={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:L,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>T.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},R=new m.NodeNextRequest(a),S=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(R,(0,n.signalFromNodeResponse)(b));try{let e=async a=>T.handle(U,Q).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=O.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${N} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${N} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=Q.renderOpts.fetchMetrics;let i=Q.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=Q.renderOpts.collectedTags;if(!I)return await (0,q.I)(R,S,d,Q.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==Q.renderOpts.collectedRevalidate&&!(Q.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&Q.renderOpts.collectedRevalidate,e=void 0===Q.renderOpts.collectedExpire||Q.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:Q.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await T.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:M,isOnDemandRevalidate:C})},B),b}},l=await T.handleResponse({req:a,nextConfig:x,cacheKey:K,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!I)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&I||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(R,S,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};P?await j(P):await O.withPropagatedContext(a.headers,()=>O.trace(o.BaseServerSpan.handleRequest,{spanName:`${N} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":N,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await T.onRequestError(a,b,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:M,isOnDemandRevalidate:C})}),I)throw b;return await (0,q.I)(R,S,new Response(null,{status:500})),null}}},74998:a=>{"use strict";a.exports=require("perf_hooks")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,9852,1813,1574],()=>b(b.s=73733));module.exports=c})();