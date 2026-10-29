// Vercel serverless: وسيط بين الموقع و Discord API (التوكن يجي من الواجهة)
const ALLOWED=[
  /^\/users\/@me(\/guilds)?$/,
  /^\/applications\/@me$/,
  /^\/guilds\/\d+\/channels$/,
  /^\/guilds\/\d+\/members(\/(@me|\d+))?$/,
  /^\/channels\/\d+\/messages(\/\d+)?$/,
  /^\/users\/\d+$/,
  /^\/users\/@me\/channels$/,
  /^\/guilds\/\d+$/,
  /^\/guilds\/\d+\/(emojis|roles|invites|bans)$/,
  /^\/guilds\/\d+\/bans\/\d+$/,
  /^\/channels\/\d+$/,
  /^\/channels\/\d+\/invites$/,
  /^\/guilds\/\d+\/roles\/\d+$/,
  /^\/guilds\/\d+\/emojis\/\d+$/,
  /^\/guilds\/\d+\/members\/\d+\/roles\/\d+$/,
  /^\/invites\/[\w-]+$/,
  /^\/users\/@me\/guilds\/\d+$/,
];

module.exports=async(req,res)=>{
  const path=String(req.query.path||'');
  const token=req.headers['x-bot-token']||process.env.DISCORD_TOKEN;
  if(!token)return res.status(401).json({message:'No token'});
  if(path.includes('..')||!ALLOWED.some(r=>r.test(path.split('?')[0])))return res.status(400).json({message:'Path not allowed'});
  if(!['GET','POST','PATCH','PUT','DELETE'].includes(req.method))return res.status(405).json({message:'Method not allowed'});

  const headers={Authorization:`Bot ${token}`};
  let body;
  if(req.method==='POST'||req.method==='PATCH'||req.method==='PUT'){
    const chunks=[];for await(const c of req)chunks.push(c);
    body=Buffer.concat(chunks);
    headers['Content-Type']=req.headers['content-type']||'application/json';
  }
  try{
    const r=await fetch('https://discord.com/api/v10'+path,{method:req.method,headers,body});
    const text=await r.text();
    res.status(r.status).setHeader('Content-Type','application/json').send(text||'{}');
  }catch(e){res.status(500).json({message:e.message})}
};
module.exports.config={api:{bodyParser:false}};
