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
const frameMessage = $("#frameMessage");
const handleInput = $("#handleInput");
const fields = $("#fields");
const frameOptions = $("#frameOptions");

let photo = null;
let format = "id";
let objectUrl = null;

const palettes = {
  green:"#0B6839", deep:"#084E2B", lime:"#FFFFFF", yellow:"#FEE101",
  pink:"#FF0080", cream:"#FFFBE8", paper:"#FFFBE8", near_black:"#050B07"
};

// Builder ID card template — exported from Canva, transparent hole cut where the
// photo goes so the ring/badge artwork sits on top of whatever photo the user picks.
const idTemplate = new Image();
let idTemplateLoaded = false;
idTemplate.onload = () => { idTemplateLoaded = true; if (format === "id") render(); };
idTemplate.src = "assets/id-template.png";

// Card geometry measured directly off the Canva export (591x1004 native canvas).
const ID_CARD = { w: 591, h: 1004 };
const ID_PHOTO = { cx: 296, cy: 367, r: 147 };
const ID_TICKET = { cx: 296, baseline: 572, maxWidth: 360 };
const ID_STACK = { x: 172, top: 665, maxWidth: 372, lineHeight: 17, size: 15 };
const ID_TITLE = { x: 172, baseline: 785, maxWidth: 350, size: 26 };
const ID_PILL = { x: 207, y: 808, w: 166, h: 44, r: 22 };

const cardId = "HHG26-2026-" + String(Math.floor(1000 + Math.random() * 9000));

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
  // Render at 2x the Canva export's native 591x1004 for a crisper download,
  // then do all drawing in native-coordinate space via ctx.scale.
  const SCALE = 2;
  canvas.width = ID_CARD.w * SCALE;
  canvas.height = ID_CARD.h * SCALE;
  ctx.save();
  ctx.scale(SCALE, SCALE);

  // base fill in case the template image hasn't loaded yet
  ctx.fillStyle = palettes.green;
  ctx.fillRect(0, 0, ID_CARD.w, ID_CARD.h);

  // 1 · Photo, cover-fit and clipped to the ring's hole
  const { cx: pcx, cy: pcy, r: pr } = ID_PHOTO;
  ctx.save();
  ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI*2); ctx.clip();
  if (photo) {
    fitCover(photo, pcx-pr, pcy-pr, pr*2, pr*2);
  } else {
    ctx.fillStyle = "#0a7650";
    ctx.fillRect(pcx-pr, pcy-pr, pr*2, pr*2);
  }
  ctx.restore();

  // 2 · Canva template — ring, badges, illustrations, labels — drawn on top,
  // transparent where the photo shows through
  if (idTemplateLoaded) {
    ctx.drawImage(idTemplate, 0, 0, ID_CARD.w, ID_CARD.h);
  }

  const name = (nameInput.value || "YOUR NAME").toUpperCase();
  const role = roleInput.value || "Python · React · Next.js";
  const title = (titleInput.value || "THE SIGNAL ARCHITECT").toUpperCase();

  // 3 · Name, inside the ticket bar
  let nameSize = 40;
  while (measureText(name, nameSize, "Playfair Display", 800) > ID_TICKET.maxWidth && nameSize > 22) {
    nameSize -= 2;
  }
  text(name, ID_TICKET.cx, ID_TICKET.baseline, nameSize, "Playfair Display", palettes.deep, "center", 800);

  // 4 · Stack / role — wrapped into the cream panel's first slot (bullet-separated, up to 3 lines)
  const stackLine = role.split(/\s*(?:[•,\n]|\s{2,})\s*/).filter(Boolean).join(" · ") || role;
  wrapText(stackLine, ID_STACK.x, ID_STACK.top, ID_STACK.maxWidth, ID_STACK.lineHeight, ID_STACK.size, "DM Sans", palettes.deep, 600);

  // 5 · Builder title, with a yellow highlighter swipe underneath
  let titleSize = ID_TITLE.size;
  while (measureText(title, titleSize, "Playfair Display", 800) > ID_TITLE.maxWidth && titleSize > 16) {
    titleSize -= 2;
  }
  const titleWidth = measureText(title, titleSize, "Playfair Display", 800);
  ctx.save();
  ctx.strokeStyle = palettes.yellow; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ID_TITLE.x, ID_TITLE.baseline + 7);
  ctx.lineTo(ID_TITLE.x + titleWidth, ID_TITLE.baseline + 6);
  ctx.stroke();
  ctx.restore();
  text(title, ID_TITLE.x, ID_TITLE.baseline, titleSize, "Playfair Display", palettes.deep, "left", 800);

  // 6 · Card ID pill — repaint over the template's placeholder text with the generated ID
  roundedRect(ctx, ID_PILL.x, ID_PILL.y, ID_PILL.w, ID_PILL.h, ID_PILL.r);
  ctx.fillStyle = palettes.pink; ctx.fill();
  ctx.strokeStyle = palettes.yellow; ctx.lineWidth = 2.5;
  roundedRect(ctx, ID_PILL.x, ID_PILL.y, ID_PILL.w, ID_PILL.h, ID_PILL.r); ctx.stroke();
  text(cardId, ID_PILL.x + ID_PILL.w/2, ID_PILL.y + ID_PILL.h/2 + 5, 14, "DM Mono", palettes.cream, "center", 700);

  ctx.restore();
}
function drawFrame(){
  canvas.width=1200;canvas.height=1200;
  ctx.fillStyle=palettes.green;ctx.fillRect(0,0,1200,1200);
  decorativeFrame();
  logo(86,130,.55);
  text("GOA, INDIA  ·  28 — 31 OCT 2026",1110,120,16,"DM Mono",palettes.cream,"right",500);

  const px=72,py=210,pw=1056,ph=700;
  ctx.save();roundedRect(ctx,px,py,pw,ph,8);ctx.clip();
  if(photo)fitCover(photo,px,py,pw,ph);else{ctx.fillStyle="#0a7650";ctx.fillRect(px,py,pw,ph)}
  ctx.restore();
  ctx.strokeStyle=palettes.yellow;ctx.lineWidth=7;ctx.strokeRect(px,py,pw,ph);

  // pink accent strip — ties the frame back to the ID card's accent colour
  ctx.fillStyle=palettes.pink;ctx.fillRect(px,py+ph+14,pw,7);

  ctx.fillStyle=palettes.deep;ctx.fillRect(72,934,1056,150);

  const msg=(frameMessage.value||"BUILD SOMETHING THAT MATTERS").toUpperCase();
  const handle=(handleInput.value||"@BUILDER").toUpperCase();

  // Dynamic message sizing
  let msgSize = 31;
  while (measureText(msg, msgSize, "Playfair Display", 800) > 1000 && msgSize > 18) {
    msgSize -= 2;
  }

  text(msg, 600, 994, msgSize, "Playfair Display", palettes.yellow, "center", 800);
  text(handle + "   ·   #FRAMEINGOA", 600, 1037, 14, "DM Mono", palettes.lime, "center", 500);
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
    msg.style.cssText="position:fixed;top:16px;right:16px;background:#FF0080;color:white;padding:12px 16px;border-radius:4px;font-size:12px;z-index:1000;font-family:DM Sans;font-weight:600;box-shadow:0 8px 24px rgba(255,0,128,.25);animation:slideIn 300ms ease-out;max-width:300px";
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

[nameInput,roleInput,titleInput,frameMessage,handleInput].forEach(el=>el.addEventListener("input",render));
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
// Only phones/tablets get the native OS share sheet (there the sheet reliably
// offers X/Twitter as a target and can hand it the image directly). Desktop
// OSes (Windows, macOS) also implement navigator.share, but their share sheets
// rarely register X as a target — so on desktop we skip straight to opening
// X itself with the caption ready, rather than dropping the user into a
// share sheet with no useful destination in it.
function isMobileShareTarget(){
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const mobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return coarse || mobileUA;
}

function toast(text, bg = "#0B6839") {
  const msg=document.createElement("div");
  msg.style.cssText=`position:fixed;top:16px;right:16px;background:${bg};color:white;padding:14px 16px;border-radius:4px;font-size:11px;z-index:1000;font-family:DM Sans;font-weight:500;box-shadow:0 8px 24px rgba(8,78,43,.25);max-width:320px;line-height:1.5`;
  msg.textContent=text;
  document.body.appendChild(msg);
  setTimeout(()=>msg.remove(),6000);
}

function blobToDataUrl(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(blob);
  });
}

function downloadBlob(blob){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="HH-Goa-2026.png";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

shareBtn.addEventListener("click",async()=>{
  const blob=await canvasBlob();
  const file=new File([blob],"HH-Goa-2026.png",{type:"image/png"});
  const caption="Locked in my HH Goa 2026 Builder ID 🌴 Built it myself, pixel-matched to the real HHGoa card.\nYour turn — make yours here: https://hh-goa-2026-frame-generator-ten.vercel.app/\n#FrameInGoa #HHGoa2026 @247pmstudio";

  if(isMobileShareTarget()){
    try{
      if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
        await navigator.share({title:"HH Goa 2026 Builder ID",text:caption,files:[file]});
        return;
      }
    }catch(err){ if(err.name==="AbortError")return; }
  }

  // Desktop: upload the generated PNG to get a public image URL, then open X
  // pointed at our own share page (which carries og:image/twitter:image meta
  // tags for that URL). X's crawler reads those tags and shows the actual
  // graphic as the tweet's link-preview card automatically — no manual
  // download/attach needed.
  const originalLabel=shareBtn.querySelector(".action-label")?.textContent;
  shareBtn.disabled=true;
  if(shareBtn.querySelector(".action-label"))shareBtn.querySelector(".action-label").textContent="Preparing…";

  try{
    const dataUrl=await blobToDataUrl(blob);
    const res=await fetch("/api/upload",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({image:dataUrl}),
    });
    if(!res.ok)throw new Error("upload failed: "+res.status);
    const {url:imageUrl}=await res.json();
    if(!imageUrl)throw new Error("no image url returned");

    const sharePageUrl=`${location.origin}/api/share?img=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}`;
    const intent=`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(sharePageUrl)}`;
    window.open(intent,"_blank","noopener,noreferrer");
    toast("X is opening with your Builder ID attached as a preview — post away.");
  }catch(err){
    console.error("Auto-attach failed, falling back to download:",err);
    downloadBlob(blob);
    const intent=`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
    window.open(intent,"_blank","noopener,noreferrer");
    toast("Couldn't auto-attach the image, so it's downloaded instead — attach it to the post that just opened.","#FF0080");
  }finally{
    shareBtn.disabled=false;
    if(originalLabel && shareBtn.querySelector(".action-label"))shareBtn.querySelector(".action-label").textContent=originalLabel;
  }
});
window.addEventListener("beforeunload",()=>objectUrl&&URL.revokeObjectURL(objectUrl));
render();
