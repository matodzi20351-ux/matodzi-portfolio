// Secure server-side Supabase REST integration; requires env variables on Netlify.
const json=(statusCode,body)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
export async function handler(event){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return json(503,{error:'Like counter is not configured yet.'});
 const base=url.replace(/\/$/,'')+'/rest/v1/portfolio_likes';
 const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 try{
  if(event.httpMethod==='GET'){
   const r=await fetch(base+'?select=id&limit=1',{headers:{...headers,Prefer:'count=exact'}});
   if (!r.ok) {
  console.error('Supabase read failed:', {
    status: r.status,
    statusText: r.statusText
  });
  throw Error('Unable to read likes');
}
   const range=r.headers.get('content-range')||'';return json(200,{count:Number(range.split('/')[1])||0});
  }
  if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
  if((event.body||'').length>500)return json(413,{error:'Request too large'});
  const body=JSON.parse(event.body||'{}');if(body.action!=='like')return json(400,{error:'Invalid action'});
  const ip=(event.headers['x-nf-client-connection-ip']||event.headers['x-forwarded-for']||'').split(',')[0].trim();
  // Rate limiting by one-way IP hash, one like per IP per day; no raw IP stored.
  const {createHash}=await import('node:crypto');const salt=process.env.LIKE_HASH_SECRET;
  if(!salt)return json(503,{error:'Like protection is not configured yet.'});
  const day=new Date().toISOString().slice(0,10);
  const fingerprint=createHash('sha256').update(salt+'|'+ip+'|'+day).digest('hex');
  const r=await fetch(base,{method:'POST',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({fingerprint})});
  if(!r.ok&&r.status!==409){throw Error('Unable to save your like')}
  const c=await fetch(base+'?select=id&limit=1',{headers:{...headers,Prefer:'count=exact'}});
  if(!c.ok)throw Error('Unable to read like count');
  const count=Number((c.headers.get('content-range')||'').split('/')[1])||0;
  if(r.ok&&process.env.RESEND_API_KEY&&process.env.NOTIFICATION_EMAIL&&process.env.RESEND_FROM_EMAIL){
   // Notification errors do not undo a successful like.
   await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL,to:[process.env.NOTIFICATION_EMAIL],subject:'New like on your portfolio!',text:'Someone liked your Matodzi portfolio. Total likes: '+count})}).catch(()=>{});
  }
  return json(200,{count,alreadyLiked:r.status===409});
 }catch(e){console.error('Likes function error:',e);return json(500,{error:'Like service temporarily unavailable.'})}
}
