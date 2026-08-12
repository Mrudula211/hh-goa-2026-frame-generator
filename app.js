const $ = (s) => document.querySelector(s);
const canvas = $("#outputCanvas");
const ctx = canvas.getContext("2d");
const photoInput = $("#photoInput");
const uploadBox = $("#uploadBox");
const browseBtn = $("#browseBtn");
const emptyState = $("#emptyState");
const downloadBtn = $("#downloadBtn");
const shareBtn = $("#shareBtn");
const statusText = $("#statusText");
const statusDot = $("#statusDot");
const nameInput = $("#nameInput");
const roleInput = $("#roleInput");
const titleInput = $("#titleInput");
const dateToggle = $("#dateToggle");
const frameMessage = $("#frameMessage");
const handleInput = $("#handleInput");
const fields = $("#fields");
const frameOptions = $("#frameOptions");

let photo = null;
let format = "id";
let objectUrl = null;

const palettes = {
  green:"#075c3b", deep:"#022d20", lime:"#d7ef35", yellow:"#f4d928",
  pink:"#ff167c", cream:"#f4efd9", paper:"#f7f4e7"
};

function updateStatus(message, state = "waiting") {
  statusText.textContent = message;
  statusDot.className = `status-dot ${state}`;
}

function roundedRect(c,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  c.beginPath();c.moveTo(x+rr,y);c.arcTo(x+w,y,x+w,y+h,rr);
  c.arcTo(x+w,y+h,x,y+h,rr);c.arcTo(x,y+h,x,y,rr);c.arcTo(x,y,x+w,y,rr);c.closePath();
}
function fitCover(img, x,y,w,h){
  const scale=Math.max(w/img.width,h/img.height);
  const sw=w/scale, sh=h/scale;
  const sx=(img.width-sw)/2, sy=(img.height-sh)/2;
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}
function fitContain(img,x,y,w,h){
  const scale=Math.min(w/img.width,h/img.height);
  const dw=img.width*scale, dh=img.height*scale;
  ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function text(t,x,y,size,font="DM Sans",color=palettes.cream,align="left",weight=700){
  ctx.font=`${weight} ${size}px "${font}"`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline="alphabetic";ctx.fillText(t,x,y);
}
function wrapText(t, x, y, maxWidth, lineHeight, size, font, color, weight = 600) {
  ctx.font = `${weight} ${size}px "${font}"`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  
  const words = t.split(/\s+/);
  let line = "";
  let currentY = y;
  
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  
  if (line) ctx.fillText(line, x, currentY);
  return currentY;
}

function measureText(t, size, font, weight = 600) {
  ctx.font = `${weight} ${size}px "${font}"`;
  return ctx.measureText(t).width;
}
function decorativeFrame(){
  ctx.save();
  ctx.strokeStyle=palettes.yellow;ctx.lineWidth=4;
  ctx.strokeRect(28,28,canvas.width-56,canvas.height-56);
  ctx.strokeStyle=palettes.lime;ctx.lineWidth=1;
  ctx.strokeRect(39,39,canvas.width-78,canvas.height-78);
  for(let i=0;i<18;i++){
    const x=58+i*64;
    ctx.fillStyle=i%2?palettes.lime:palettes.yellow;
    ctx.beginPath();ctx.arc(x,50,2.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x,canvas.height-50,2.2,0,Math.PI*2);ctx.fill();
  }
  // simple botanical corner motifs
  const leaf=(x,y,rot)=>{
    ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=palettes.lime;
    ctx.beginPath();ctx.ellipse(0,0,10,30,-.35,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=palettes.yellow;ctx.beginPath();ctx.ellipse(20,12,8,22,.4,0,Math.PI*2);ctx.fill();
    ctx.restore();
  };
  leaf(60,60,-.5);leaf(canvas.width-60,60,.5);leaf(60,canvas.height-60,.5);leaf(canvas.width-60,canvas.height-60,-.5);
  ctx.restore();
}
function logo(x,y,scale=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  text("HACKER",0,0,64,"Playfair Display",palettes.yellow,"left",800);
  text("HOUSE",0,57,64,"Playfair Display",palettes.yellow,"left",800);
  roundedRect(ctx,76,14,76,45,11);ctx.fillStyle=palettes.pink;ctx.fill();
  text("गोवा",114,47,31,"DM Sans","#fff","center",800);
  ctx.restore();
}
function starburst(x,y,r,color){
  ctx.save();ctx.translate(x,y);ctx.fillStyle=color;
  ctx.beginPath();
  for(let i=0;i<16;i++){const a=i*Math.PI/8, rr=i%2?r:r*.35;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}
  ctx.closePath();ctx.fill();ctx.restore();
}
function drawId(){
  canvas.width=1200;canvas.height=1500;
  ctx.fillStyle=palettes.green;ctx.fillRect(0,0,1200,1500);
  decorativeFrame();

  ctx.fillStyle=palettes.deep;ctx.fillRect(78,110,1044,1010);
  ctx.save();
  ctx.globalAlpha=.14;ctx.strokeStyle=palettes.lime;ctx.lineWidth=1;
  for(let i=0;i<13;i++){ctx.beginPath();ctx.arc(950,190,i*48,0,Math.PI*2);ctx.stroke()}
  ctx.restore();

  logo(125,190,.72);
  text("BUILDER ID",1050,177,18,"DM Mono",palettes.lime,"right",500);
  text("HH GOA 2026",1050,205,15,"DM Mono",palettes.cream,"right",500);

  const px=125,py=285,pw=950,ph=615;
  ctx.save();roundedRect(ctx,px,py,pw,ph,8);ctx.clip();
  if(photo)fitCover(photo,px,py,pw,ph);else{ctx.fillStyle="#0a7650";ctx.fillRect(px,py,pw,ph)}
  ctx.restore();
  ctx.strokeStyle=palettes.yellow;ctx.lineWidth=5;ctx.strokeRect(px,py,pw,ph);

  ctx.fillStyle=palettes.pink;ctx.fillRect(125,925,950,8);
  
  const name=(nameInput.value||"YOUR NAME").toUpperCase();
  const role=(roleInput.value||"BUILDER").toUpperCase();
  const title=(titleInput.value||"THE SIGNAL ARCHITECT").toUpperCase();

  // Better name sizing and handling
  let nameSize = 58;
  while (measureText(name, nameSize, "DM Sans", 800) > 730 && nameSize > 32) {
    nameSize -= 2;
  }
  text(name, 125, 1010, nameSize, "DM Sans", palettes.cream, "left", 800);
  
  text(role, 125, 1052, 17, "DM Mono", palettes.lime, "left", 500);
  
  // Better title wrapping with dynamic font size
  let titleSize = 32;
  const titleMaxWidth = 730;
  const words = title.split(/\s+/);
  let estimatedLines = Math.ceil((words.length * 20) / (titleMaxWidth / 4));
  
  while (estimatedLines > 3 && titleSize > 20) {
    titleSize -= 2;
    estimatedLines = Math.ceil((words.length * 20) / (titleMaxWidth / 4));
  }
  
  wrapText(title, 125, 1100, titleMaxWidth, 50, titleSize, "Playfair Display", palettes.yellow, 800);

  starburst(1000, 1165, 50, palettes.pink);
  text("✦", 1000, 1177, 30, "DM Sans", "#fff", "center", 800);

  if(dateToggle.checked){
    text("GOA, INDIA  ·  28 — 31 OCT 2026", 125, 1310, 18, "DM Mono", palettes.cream, "left", 500);
  } else {
    text("#FRAMEINGOA", 125, 1310, 18, "DM Mono", palettes.cream, "left", 500);
  }
  text("#FRAMEINGOA", 1075, 1310, 18, "DM Mono", palettes.lime, "right", 500);
  text("LESS NOISE. MORE SIGNAL.", 125, 1390, 14, "DM Mono", palettes.cream, "left", 500);
  text("247 BUILDERS", 1075, 1390, 14, "DM Mono", palettes.cream, "right", 500);
}
function drawFrame(){
  canvas.width=1200;canvas.height=1200;
  ctx.fillStyle=palettes.green;ctx.fillRect(0,0,1200,1200);
  decorativeFrame();
  logo(86,130,.55);
  text("GOA, INDIA  ·  28 — 31 OCT 2026",1110,120,16,"DM Mono",palettes.cream,"right",500);

  const px=72,py=210,pw=1056,ph=710;
  ctx.save();roundedRect(ctx,px,py,pw,ph,8);ctx.clip();
  if(photo)fitCover(photo,px,py,pw,ph);else{ctx.fillStyle="#0a7650";ctx.fillRect(px,py,pw,ph)}
  ctx.restore();
  ctx.strokeStyle=palettes.yellow;ctx.lineWidth=7;ctx.strokeRect(px,py,pw,ph);

  ctx.fillStyle=palettes.deep;ctx.fillRect(72,952,1056,150);
  
  const msg=(frameMessage.value||"BUILD SOMETHING THAT MATTERS").toUpperCase();
  const handle=(handleInput.value||"@BUILDER").toUpperCase();
  
  // Dynamic message sizing
  let msgSize = 31;
  while (measureText(msg, msgSize, "Playfair Display", 800) > 1000 && msgSize > 18) {
    msgSize -= 2;
  }
  
  text(msg, 600, 1012, msgSize, "Playfair Display", palettes.yellow, "center", 800);
  text(handle + "   ·   #FRAMEINGOA", 600, 1055, 14, "DM Mono", palettes.lime, "center", 500);
  text("HH GOA 2026", 86, 1150, 17, "DM Mono", palettes.cream, "left", 500);
  text("LESS NOISE. MORE SIGNAL.", 1114, 1150, 17, "DM Mono", palettes.cream, "right", 500);
}
function render(){
  if(format==="id")drawId();else drawFrame();
  emptyState.style.display=photo?"none":"grid";
  const ready=!!photo;
  downloadBtn.disabled=!ready;shareBtn.disabled=!ready;
  if(ready){
    updateStatus("READY TO SHARE", "ready");
  }else{
    updateStatus("Waiting for photo", "waiting");
  }
}

function generateTitle(){
  const role=(roleInput.value||"builder").toLowerCase();
  const options={
    ai:["The Signal Architect","The Model Whisperer","The Neural Builder","The Intelligence Crafter","The Insight Forge"],
    engineer:["The Ship-It Engineer","The Systems Builder","The Runtime Tinkerer","The Stacksmith","The Infrastructure Architect"],
    developer:["The Product Hacker","The Stacksmith","The Launch Engineer","The Code Cartographer","The Feature Architect"],
    designer:["The Interface Alchemist","The Pixel Cartographer","The Experience Crafter","The Visual Hacker","The Design Innovator"],
    founder:["The Zero-to-One Builder","The Product Architect","The Market Maker","The Vision Shipper","The Problem Solver"],
    product:["The Product Hacker","The Problem Solver","The Launch Architect","The User Whisperer","The Growth Architect"],
    crypto:["The Chain Builder","The Protocol Tinkerer","The Onchain Architect","The Blocksmith","The Smart Contract Engineer"],
    scientist:["The Data Cartographer","The Pattern Discoverer","The Algorithm Architect","The Insight Engineer"],
    marketer:["The Growth Hacker","The Story Crafter","The Brand Architect","The Audience Architect"]
  };
  let key=Object.keys(options).find(k=>role.includes(k));
  const arr=options[key||"developer"];
  titleInput.value=arr[Math.floor(Math.random()*arr.length)];
  render();
}

async function loadFile(file){
  if(!file)return;
  updateStatus("Processing photo…", "processing");
  try{
    let blob=file;
    if(/heic|heif/i.test(file.type)||/\.hei[cf]$/i.test(file.name)){
      if(!window.heic2any)throw new Error("HEIC converter not loaded");
      blob=await window.heic2any({blob:file,toType:"image/jpeg",quality:.92});
      if(Array.isArray(blob))blob=blob[0];
    }
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    objectUrl=URL.createObjectURL(blob);
    const img=new Image();
    img.onload=()=>{photo=img;render();};
    img.onerror=()=>{updateStatus("Could not read image", "waiting");};
    img.src=objectUrl;
  }catch(e){
    console.error(e);
    updateStatus("Photo format not supported", "waiting");
    const msg=document.createElement("div");
    msg.style.cssText="position:fixed;top:16px;right:16px;background:#ff167c;color:white;padding:12px 16px;border-radius:4px;font-size:12px;z-index:1000;font-family:DM Sans;font-weight:600;box-shadow:0 8px 24px rgba(255,22,124,.25);animation:slideIn 300ms ease-out;max-width:300px";
    msg.textContent="This photo format is not supported. Try JPG, PNG, WEBP, or HEIC.";
    document.body.appendChild(msg);
    setTimeout(()=>msg.remove(),4000);
  }
}

browseBtn.addEventListener("click",e=>{e.stopPropagation();photoInput.click()});
uploadBox.addEventListener("click",()=>photoInput.click());
uploadBox.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();photoInput.click()}});
photoInput.addEventListener("change",e=>loadFile(e.target.files[0]));

["dragenter","dragover"].forEach(ev=>uploadBox.addEventListener(ev,e=>{e.preventDefault();uploadBox.classList.add("drag")}));
["dragleave","drop"].forEach(ev=>uploadBox.addEventListener(ev,e=>{e.preventDefault();uploadBox.classList.remove("drag")}));
uploadBox.addEventListener("drop",e=>loadFile(e.dataTransfer.files[0]));

[nameInput,roleInput,titleInput,dateToggle,frameMessage,handleInput].forEach(el=>el.addEventListener("input",render));
$("#regenTitle").addEventListener("click",generateTitle);

function canvasBlob(){
  return new Promise(resolve=>canvas.toBlob(resolve,"image/png",1));
}
downloadBtn.addEventListener("click",async()=>{
  const blob=await canvasBlob();
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`HH-Goa-2026-${(nameInput.value||"Builder").replace(/[^a-z0-9]+/gi,"-")}.png`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});
shareBtn.addEventListener("click",async()=>{
  const blob=await canvasBlob();
  const file=new File([blob],"HH-Goa-2026.png",{type:"image/png"});
  const caption="Building in Goa. 🌴 #FrameInGoa #HHGoa2026";
  try{
    if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
      await navigator.share({title:"HH Goa 2026 Builder ID",text:caption,files:[file]});
      return;
    }
  }catch(err){ if(err.name==="AbortError")return; }
  
  // Desktop fallback
  const intent=`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
  window.open(intent,"_blank","noopener,noreferrer");
  
  // Show informational toast
  const msg=document.createElement("div");
  msg.style.cssText="position:fixed;top:16px;right:16px;background:#075c3b;color:white;padding:14px 16px;border-radius:4px;font-size:11px;z-index:1000;font-family:DM Sans;font-weight:500;box-shadow:0 8px 24px rgba(2,45,32,.25);max-width:320px;line-height:1.5";
  msg.textContent="X is opening in a new tab. Download your PNG and attach it to the pre-filled post.";
  document.body.appendChild(msg);
  setTimeout(()=>msg.remove(),5000);
});
window.addEventListener("beforeunload",()=>objectUrl&&URL.revokeObjectURL(objectUrl));
render();
