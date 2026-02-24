(()=>{var a={};a.id=9623,a.ids=[9623],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8216:(a,b,c)=>{"use strict";c.d(b,{H:()=>e,l:()=>f});var d=c(61574);let e=!process.env.DATABASE_URL,f=process.env.DATABASE_URL?(0,d.A)(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10}):()=>{throw Error("Database is not configured (DATABASE_URL missing)")}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},20296:(a,b,c)=>{"use strict";c.d(b,{$G:()=>k,Ht:()=>i,jw:()=>h,nr:()=>j,q7:()=>l});var d=c(65573),e=c(45479),f=c(55649);let g=new TextEncoder().encode(process.env.JWT_SECRET||"your-secret-key-change-in-production");async function h(a){return await new e.P({user:a}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(g)}async function i(){let a=await (0,d.UL)(),b=a.get("session")?.value;if(!b)return null;try{let{payload:a}=await (0,f.V)(b,g);return a.user}catch(a){return null}}async function j(a){try{let{payload:b}=await (0,f.V)(a,g);return b.user}catch(a){return null}}async function k(a){(await (0,d.UL)()).set("session",a,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:604800,path:"/"})}async function l(){(await (0,d.UL)()).delete("session")}},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},29409:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>N,patchFetch:()=>M,routeModule:()=>I,serverHooks:()=>L,workAsyncStorage:()=>J,workUnitAsyncStorage:()=>K});var d={};c.r(d),c.d(d,{POST:()=>H});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(20296),y=c(8216),z=c(74966);let A=null,B=null,C=null,D=null;async function E(){if(null!==A)return A;try{let a=await (0,y.l)`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name IN ('channel', 'external_user_id')
      ORDER BY column_name
    `;A=Array.isArray(a)&&2===a.length}catch{A=!1}return A}async function F(){if(null!==B)return B;try{let a=await (0,y.l)`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'external_conversation_id'
      LIMIT 1
    `;B=Array.isArray(a)&&a.length>0}catch{B=!1}return B}async function G(){if(null!==C)return{openValue:C,closedValue:D};let a="open",b="closed";try{let c=await (0,y.l)`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'status'
      LIMIT 1
    `,d=String(c?.[0]?.data_type||""),e=String(c?.[0]?.udt_name||"");if("USER-DEFINED"===d.toUpperCase()&&e){let c=(await (0,y.l)`
        SELECT e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = ${e}
        ORDER BY e.enumsortorder
      `||[]).map(a=>String(a.enumlabel)),d=a=>c.find(b=>a.includes(b));a=d(["open","active","new","pending"])||c[0]||a,b=d(["closed","resolved","archived"])||null}}catch{}return C=a,D=b,{openValue:a,closedValue:b}}async function H(a){try{if(!await (0,x.Ht)())return w.NextResponse.json({error:"Not authenticated"},{status:401});let b=await a.json().catch(()=>({})),c=b?.contactId??b?.contact_id,d=String(c??"").trim();if(!d)return w.NextResponse.json({error:"contactId is required"},{status:400});if(y.H){let a=z.bL.find(a=>String(a.contact_id)===d&&"closed"!==a.status);if(!a)return w.NextResponse.json({conversation:{id:Date.now(),contact_id:d,status:"open",priority:"medium"},contact:{id:d},demo:!0});return w.NextResponse.json({conversation:{id:a.id,contact_id:a.contact_id,status:a.status,priority:a.priority,channel:"whatsapp"},contact:{id:a.contact_id,name:a.contact.name,phone_number:a.contact.phone_number,channel:"whatsapp"},demo:!0})}let e=await (0,y.l)`
      SELECT *
      FROM contacts
      WHERE id::text = ${d}
      LIMIT 1
    `;if(!e.length)return w.NextResponse.json({error:"Contact not found"},{status:404});let f=e[0],{openValue:g,closedValue:h}=await G(),i=[];try{i=h?await (0,y.l)`
            SELECT *
            FROM conversations
            WHERE contact_id = ${f.id}
              AND status::text != ${h}
            ORDER BY created_at DESC
            LIMIT 1
          `:await (0,y.l)`
            SELECT *
            FROM conversations
            WHERE contact_id = ${f.id}
            ORDER BY created_at DESC
            LIMIT 1
          `}catch{i=[]}let j=await E(),k=await F();if(!i.length){let a="facebook"===String(f?.channel||"whatsapp").toLowerCase()?"facebook":"whatsapp",b=String(f?.external_user_id||"").trim()||null;i=j&&k?await (0,y.l)`
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
            ${f.id},
            ${g},
            'medium',
            ${a},
            ${b},
            ${b?`${a}_${b}`:null},
            NOW(),
            NOW(),
            NOW()
          )
          RETURNING *
        `:j?await (0,y.l)`
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
            ${f.id},
            ${g},
            'medium',
            ${a},
            ${b},
            NOW(),
            NOW(),
            NOW()
          )
          RETURNING *
        `:await (0,y.l)`
          INSERT INTO conversations (
            contact_id,
            status,
            priority,
            created_at,
            updated_at,
            last_message_at
          )
          VALUES (
            ${f.id},
            ${g},
            'medium',
            NOW(),
            NOW(),
            NOW()
          )
          RETURNING *
        `}let l=i[0];return w.NextResponse.json({conversation:{id:l.id,contact_id:l.contact_id,status:l.status,priority:l.priority,channel:l.channel||f.channel||"whatsapp",external_user_id:l.external_user_id||f.external_user_id||null},contact:{id:f.id,name:f.name,phone_number:f.phone_number,channel:f.channel||"whatsapp",external_user_id:f.external_user_id||null}})}catch(a){return console.error("[Conversations Ensure] Error:",a),w.NextResponse.json({error:"Internal server error"},{status:500})}}let I=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/conversations/ensure/route",pathname:"/api/conversations/ensure",filename:"route",bundlePath:"app/api/conversations/ensure/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/bryanmejiaruiz/Documents/Repositorios/CRM_MIBO_FRONTEND/app/api/conversations/ensure/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:J,workUnitAsyncStorage:K,serverHooks:L}=I;function M(){return(0,g.patchFetch)({workAsyncStorage:J,workUnitAsyncStorage:K})}async function N(a,b,c){I.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/conversations/ensure/route";"/index"===d&&(d="/");let e=await I.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,resolvedPathname:E,clientReferenceManifest:F,serverActionsManifest:G}=e,H=(0,l.normalizeAppPath)(d),J=!!(A.dynamicRoutes[H]||A.routes[E]),K=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!A.routes[E],b=A.dynamicRoutes[H];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||I.isDev||z||(L="/index"===(L=E)?"/":L);let M=!0===I.isDev||!J,N=J&&!M;G&&F&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:F,serverActionsManifest:G,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:G})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>I.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>I.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&C&&D&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await I.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})},B),b}},l=await I.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:D,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",C?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await I.onRequestError(a,b,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:C})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74966:(a,b,c)=>{"use strict";c.d(b,{GD:()=>i,HZ:()=>e,Kn:()=>j,NB:()=>h,aT:()=>f,bL:()=>g});let d="demo123",e=[{id:1,email:"admin@demo.com",password:d,name:"Carlos Admin",role:"admin",avatar_url:"https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",status:"online"},{id:2,email:"agent1@demo.com",password:d,name:"Mar\xeda Garc\xeda",role:"agent",avatar_url:"https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",status:"online"},{id:3,email:"agent2@demo.com",password:d,name:"Juan L\xf3pez",role:"agent",avatar_url:"https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",status:"away"}],f=[{id:1,phone_number:"+52 1 555 123 4567",name:"Ana Mart\xednez",email:"ana.martinez@email.com",avatar_url:"https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"},{id:2,phone_number:"+52 1 555 987 6543",name:"Roberto P\xe9rez",email:"roberto.perez@email.com",avatar_url:"https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto"},{id:3,phone_number:"+52 1 555 456 7890",name:"Laura Hern\xe1ndez",email:"laura.hernandez@email.com",avatar_url:"https://api.dicebear.com/7.x/avataaars/svg?seed=Laura"}],g=[{id:1,contact_id:1,assigned_to:2,status:"open",priority:"high",unread_count:3,last_message_at:new Date(Date.now()-3e5).toISOString(),created_at:new Date(Date.now()-72e5).toISOString(),contact:f[0],assigned_agent:{name:"Mar\xeda Garc\xeda",avatar_url:e[1].avatar_url}},{id:2,contact_id:2,assigned_to:3,status:"open",priority:"medium",unread_count:0,last_message_at:new Date(Date.now()-18e5).toISOString(),created_at:new Date(Date.now()-18e6).toISOString(),contact:f[1],assigned_agent:{name:"Juan L\xf3pez",avatar_url:e[2].avatar_url}},{id:3,contact_id:3,assigned_to:2,status:"closed",priority:"low",unread_count:0,last_message_at:new Date(Date.now()-864e5).toISOString(),created_at:new Date(Date.now()-1728e5).toISOString(),contact:f[2],assigned_agent:{name:"Mar\xeda Garc\xeda",avatar_url:e[1].avatar_url}}],h=[{id:1,conversation_id:1,sender_type:"contact",content:"Hola, necesito ayuda con mi pedido #1234",created_at:new Date(Date.now()-72e5).toISOString()},{id:2,conversation_id:1,sender_type:"agent",user_id:2,content:"\xa1Hola Ana! Con gusto te ayudo. D\xe9jame revisar tu pedido.",created_at:new Date(Date.now()-348e4).toISOString()},{id:3,conversation_id:1,sender_type:"contact",content:"Gracias, \xbfcu\xe1ndo llega mi pedido?",created_at:new Date(Date.now()-33e5).toISOString()},{id:4,conversation_id:1,sender_type:"agent",user_id:2,content:"Tu pedido llegar\xe1 ma\xf1ana entre 9am y 6pm. Te enviar\xe9 el tracking.",created_at:new Date(Date.now()-6e5).toISOString()},{id:5,conversation_id:1,sender_type:"contact",content:"Perfecto, muchas gracias!",created_at:new Date(Date.now()-3e5).toISOString()},{id:6,conversation_id:2,sender_type:"contact",content:"Buenos d\xedas, quisiera cambiar mi direcci\xf3n de env\xedo",created_at:new Date(Date.now()-27e5).toISOString()},{id:7,conversation_id:2,sender_type:"agent",user_id:3,content:"Claro, \xbfcu\xe1l es la nueva direcci\xf3n?",created_at:new Date(Date.now()-18e5).toISOString()}],i=[{id:1,order_number:"ORD-1234",contact_id:1,status:"shipped",total_amount:1299.99,currency:"MXN",items:[{name:"iPhone 15 Pro",quantity:1,price:1299.99}],shipping_address:"Av. Insurgentes 123, CDMX",tracking_number:"MEX123456789",created_at:new Date(Date.now()-1728e5).toISOString()},{id:2,order_number:"ORD-5678",contact_id:2,status:"processing",total_amount:499.99,currency:"MXN",items:[{name:"AirPods Pro",quantity:1,price:499.99}],shipping_address:"Calle Reforma 456, Guadalajara",tracking_number:null,created_at:new Date(Date.now()-864e5).toISOString()}],j=[{id:1,title:"Saludo inicial",content:"\xa1Hola! Gracias por contactarnos. \xbfEn qu\xe9 puedo ayudarte hoy?",shortcut:"/hola",created_by:2,usage_count:45},{id:2,title:"Solicitar n\xfamero de orden",content:"Para ayudarte mejor, \xbfpodr\xedas compartirme tu n\xfamero de orden?",shortcut:"/orden",created_by:2,usage_count:32},{id:3,title:"Despedida",content:"Gracias por contactarnos. \xa1Que tengas un excelente d\xeda!",shortcut:"/adios",created_by:3,usage_count:67}]},74998:a=>{"use strict";a.exports=require("perf_hooks")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,9852,1813,1574],()=>b(b.s=29409));module.exports=c})();