
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
// ─── STRIPE SETUP ────────────────────────────────────────────────────────────
const STRIPE_PK = "pk_live_51Sm0ov0XVYeAYmlL81O3danYiF5PPJV3zpU4FiJR1kTMTatF5hLVB7tEEuyVKzTGbBD9K1QqlWnY7tkMocJ3j0sJ00rWBI5xzg";
const BACKEND = "https://chores-backend-production-2051.up.railway.app";

// Load Stripe.js from CDN once
function useStripeJS() {
  const [stripe, setStripe] = useState(null);
  useEffect(() => {
    if (window.Stripe) { setStripe(window.Stripe(STRIPE_PK)); return; }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => setStripe(window.Stripe(STRIPE_PK));
    document.head.appendChild(script);
  }, []);
  return stripe;
}

// Mount a real Stripe Card Element into a container div
function StripeCardInput({ onReady, containerStyle = {} }) {
  const mountRef = useRef(null);
  const elementRef = useRef(null);
  const stripe = useStripeJS();

  useEffect(() => {
    if (!stripe || !mountRef.current || elementRef.current) return;
    const elements = stripe.elements();
    const card = elements.create("card", {
      style: {
        base: {
          fontFamily: "'Outfit', sans-serif",
          fontSize: "15px",
          color: "#1A1A1A",
          "::placeholder": { color: "#9CA3AF" },
          iconColor: "#2D6A4F",
        },
        invalid: { color: "#E53E3E", iconColor: "#E53E3E" },
      },
      hidePostalCode: false,
    });
    card.mount(mountRef.current);
    elementRef.current = card;
    onReady && onReady({ stripe, card });
    return () => { card.unmount(); elementRef.current = null; };
  }, [stripe]);

  return (
    <div ref={mountRef} style={{
      padding: "14px 16px",
      borderRadius: 12,
      border: `1.5px solid #E8E4DC`,
      background: "#fff",
      minHeight: 48,
      ...containerStyle
    }} />
  );
}

// ─── PALETTE & FONTS ────────────────────────────────────────────────────────
const G = {
  green: "#1B4332", greenMid: "#2D6A4F", greenLight: "#52B788", greenPale: "#D8F3DC",
  cream: "#FAFAF7", sand: "#F2EFE9", orange: "#E76F51", orangeLight: "#FDF0EC",
  gold: "#F4A261", white: "#FFFFFF", text: "#111111", muted: "#1F2937", border: "#E8E4DC",
  red: "#E53E3E", redLight: "#FFF0F0", blue: "#3182CE", blueLight: "#EBF8FF",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:0;}
.tap{transition:all .15s ease;cursor:pointer;}
.tap:active{transform:scale(.97);}
.btn{transition:all .18s ease;cursor:pointer;border:none;outline:none;font-family:'Outfit',sans-serif;}
.btn:active{transform:scale(.97);}
.card{transition:transform .18s ease,box-shadow .18s ease;}
.card:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,0,0,.13)!important;}
.fade{animation:fi .28s ease forwards;}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.slide-up{animation:su .32s cubic-bezier(.22,1,.36,1) forwards;}
@keyframes su{from{transform:translateY(56px);opacity:0}to{transform:translateY(0);opacity:1}}
.notif-in{animation:ni .38s cubic-bezier(.22,1,.36,1) forwards;}
@keyframes ni{from{transform:translateY(-80px);opacity:0}to{transform:translateY(0);opacity:1}}
.notif-out{animation:no .28s ease forwards;}
@keyframes no{from{transform:translateY(0);opacity:1}to{transform:translateY(-80px);opacity:0}}
.pulse{animation:pu 2s infinite;}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.5}}
.map-pin{animation:bounce .6s ease infinite alternate;}
@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-4px)}}
input,textarea,select{font-family:'Outfit',sans-serif;outline:none;}
.chip{transition:all .15s ease;cursor:pointer;white-space:nowrap;}
.tab-bar{backdrop-filter:blur(12px);background:rgba(255,255,255,.95);}
.stat-card{transition:transform .2s ease;}
.stat-card:hover{transform:scale(1.02);}
.escrow-glow{box-shadow:0 0 0 0 rgba(82,183,136,.4);animation:eglow 2s infinite;}
@keyframes eglow{0%{box-shadow:0 0 0 0 rgba(82,183,136,.4)}70%{box-shadow:0 0 0 10px rgba(82,183,136,0)}100%{box-shadow:0 0 0 0 rgba(82,183,136,0)}}
.check-pop{animation:cpop .4s cubic-bezier(.22,1,.36,1) forwards;}
@keyframes cpop{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
.progress-fill{transition:width .6s cubic-bezier(.22,1,.36,1);}
.onb-fade{animation:onbFade .5s ease forwards;}
@keyframes onbFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.onb-scale{animation:onbScale .4s cubic-bezier(.22,1,.36,1) forwards;}
@keyframes onbScale{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
.onb-slide-l{animation:onbSlL .4s cubic-bezier(.22,1,.36,1) forwards;}
@keyframes onbSlL{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
.onb-float{animation:onbFloat 3s ease-in-out infinite;}
@keyframes onbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.onb-shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.15) 50%,transparent 100%);background-size:200% 100%;animation:onbShim 2s infinite;}
@keyframes onbShim{from{background-position:200% 0}to{background-position:-200% 0}}
.onb-check{animation:onbChk .5s cubic-bezier(.22,1,.36,1) forwards;}
@keyframes onbChk{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.15) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
`;

// ─── DATA ───────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:"lawn", icon:"", label:"Lawn & Garden" },
  { id:"pets", icon:"", label:"Pet Care" },
  { id:"cleaning", icon:"", label:"Cleaning" },
  { id:"windows", icon:"", label:"Windows" },
  { id:"babysitting", icon:"", label:"Babysitting" },
  { id:"moving", icon:"", label:"Moving" },
  { id:"painting", icon:"", label:"Painting" },
  { id:"errands", icon:"", label:"Errands" },
  { id:"other", icon:"", label:"Other" },
];

const JOBS = [
  { id:1, title:"Mow & Edge Front Lawn", category:"lawn", poster:"The Andersons", posterRating:4.8, posterJobs:12, posterSince:"Aug 2024", loc:"Oak Park Ave", dist:0.3, pay:35, date:"Sat Mar 1", tags:["mower provided","1–2 hrs"], verified:true, urgent:false, applicants:3, lat:41.8827, lng:-87.6233, desc:"Looking for someone to mow and edge the front lawn. We have a push mower in the garage you can use. Yard is roughly 2,000 sq ft. Please also bag the clippings. Usually takes about 1.5 hours.", photos:["🏡","🌿"] },
  { id:2, title:"Dog Walking – 2 Labs", category:"pets", poster:"Maria C.", posterRating:5.0, posterJobs:8, posterSince:"Oct 2024", loc:"Elmwood Park Rd", dist:0.8, pay:20, date:"Mon–Fri", tags:["flexible","dog lover"], verified:true, urgent:false, applicants:1, lat:41.8750, lng:-87.6310, desc:"Need a reliable dog walker for my two yellow labs (Bruno & Daisy). Walk is about 30 min each day. They're friendly but pull a bit. Must be comfortable with large breeds.", photos:["🐕","🐕"] },
  { id:3, title:"Babysit 2 Kids (5 & 8)", category:"babysitting", poster:"James & Lena K.", posterRating:4.9, posterJobs:6, posterSince:"Nov 2024", loc:"Maple St, Evanston", dist:1.1, pay:54, date:"Fri evening", tags:["CPR preferred","3 hrs"], verified:true, urgent:true, applicants:0, lat:41.8910, lng:-87.6380, desc:"Date night! Looking for a sitter for our two kids. 5-year-old loves drawing, 8-year-old has homework to finish. Bedtime is 8:30. Pizza money included. CPR certification preferred but not required.", photos:["👧","👦"] },
  { id:4, title:"Window Washing – 10 Windows", category:"windows", poster:"Green Valley Bakery", posterRating:4.6, posterJobs:3, posterSince:"Jan 2025", loc:"Milwaukee Ave", dist:0.5, pay:60, date:"Tue Mar 4", tags:["supplies provided","business"], verified:false, urgent:false, applicants:2, lat:41.8800, lng:-87.6180, desc:"Our bakery has 10 street-facing windows that need a good cleaning inside and out. We'll provide squeegees and cleaning solution. Best done before we open at 7am or after 6pm.", photos:["🪟","🧹"] },
  { id:5, title:"Help Move Furniture", category:"moving", poster:"The Patels", posterRating:4.7, posterJobs:5, posterSince:"Sep 2024", loc:"Cedar St, Wicker Park", dist:1.4, pay:50, date:"Sun Mar 2", tags:["2 people","3 hrs"], verified:true, urgent:false, applicants:4, lat:41.8960, lng:-87.6090, desc:"Rearranging our living room and need help moving a couch, bookshelf, and dining table. All stays in the same house, just different rooms. Would love 2 strong helpers for about 3 hours.", photos:["📦","🛋️"] },
  { id:6, title:"Deep Clean Kitchen & Baths", category:"cleaning", poster:"Sunrise Café", posterRating:4.9, posterJobs:15, posterSince:"Jun 2024", loc:"Clark St, Lincoln Park", dist:0.6, pay:80, date:"Every Sun", tags:["recurring","supplies provided"], verified:true, urgent:false, applicants:1, lat:41.8700, lng:-87.6140, desc:"Weekly deep clean of our café kitchen and two bathrooms. We provide all cleaning supplies and equipment. Looking for someone reliable who can commit to every Sunday morning 6-9am.", photos:["🧽","🪣"] },
  { id:7, title:"Paint Bedroom Accent Wall", category:"painting", poster:"DeAndre W.", posterRating:4.5, posterJobs:2, posterSince:"Feb 2025", loc:"Birch Ave, Logan Square", dist:0.9, pay:65, date:"Next weekend", tags:["paint provided","4 hrs"], verified:true, urgent:false, applicants:2, lat:41.8710, lng:-87.6290, desc:"Want to paint one accent wall in my bedroom dark navy blue. Room is 12x14, wall is about 10ft wide. I have the paint, rollers, and tape. Need someone with a steady hand. Should take 3-4 hours with prep.", photos:["🎨","🖌️"] },
  { id:8, title:"Grocery Run & Errands", category:"errands", poster:"Mrs. Thompson", posterRating:5.0, posterJobs:20, posterSince:"Mar 2024", loc:"Willow St, Old Town", dist:0.4, pay:25, date:"Wed afternoons", tags:["car needed","weekly"], verified:true, urgent:false, applicants:0, lat:41.8830, lng:-87.6350, desc:"I'm 78 and don't drive anymore. Need someone to pick up groceries from Jewel-Osco (list provided) and drop them off. Usually about 15-20 items. Also need prescriptions picked up from CVS nearby.", photos:["🛒","💊"] },
];

const NOTIFS_WORKER = [
  { id:1, type:"new_job", icon:"🌿", title:"New job near you", body:"Mow & Edge Front Lawn · $35 · 0.3mi", time:"2m ago", unread:true, category:"job" },
  { id:2, type:"accepted", icon:"✅", title:"Application accepted!", body:"The Hendersons accepted your application", time:"18m ago", unread:true, category:"job" },
  { id:3, type:"reminder", icon:"⏰", title:"Job tomorrow – 10:00 AM", body:"Mow & Edge Lawn · The Hendersons · Oak St", time:"1hr ago", unread:true, category:"reminder" },
  { id:4, type:"payment", icon:"💸", title:"Payment released!", body:"$46.00 deposited · Dog Walking · Maria C.", time:"3hrs ago", unread:false, category:"payment" },
  { id:5, type:"reminder", icon:"⏰", title:"Job in 1 hour – heads up!", body:"Window Washing · Green Valley · Main St", time:"Yesterday", unread:false, category:"reminder" },
  { id:6, type:"noshow", icon:"⚠️", title:"Cancellation alert", body:"The Patels cancelled less than 12hrs notice", time:"2 days ago", unread:false, category:"alert" },
  { id:7, type:"new_job", icon:"📦", title:"New job matches your skills", body:"Help Move Furniture · $50 · 1.4mi", time:"2 days ago", unread:false, category:"job" },
];

const NOTIFS_POSTER = [
  { id:1, type:"applied", icon:"👤", title:"New applicant!", body:"Jordan M. applied to Mow & Edge Front Lawn", time:"5m ago", unread:true, category:"job" },
  { id:2, type:"applied", icon:"👤", title:"2nd applicant received", body:"Priya S. applied to Babysit 2 Kids", time:"22m ago", unread:true, category:"job" },
  { id:3, type:"confirmed", icon:"🚗", title:"Worker on their way!", body:"Carlos T. is confirmed for today at 2pm", time:"1hr ago", unread:true, category:"job" },
  { id:4, type:"complete", icon:"✅", title:"Job marked complete", body:"Deep Clean Kitchen · Carlos T. · Rate now", time:"4hrs ago", unread:false, category:"job" },
  { id:5, type:"payment", icon:"🧾", title:"Invoice & receipt sent", body:"$80.00 charged · Deep Clean · Sun Feb 16", time:"4hrs ago", unread:false, category:"payment" },
  { id:6, type:"payment", icon:"💳", title:"Payment charged", body:"$35.00 · Mow & Edge Front Lawn · Receipt →", time:"Yesterday", unread:false, category:"payment" },
  { id:7, type:"rating", icon:"⭐", title:"Reminder: Rate your worker", body:"How did Carlos T. do? Leave a review", time:"2 days ago", unread:false, category:"reminder" },
];

const ADMIN_STATS = {
  totalJobs:1247, activeJobs:84, completedToday:23, totalWorkers:892, activeWorkers:341, newThisWeek:47,
  totalPosters:634, activePosters:218, revenue:12840, revenueToday:486, avgFee:8.2,
  disputes:7, openDisputes:3, resolvedToday:4, strikes:12, suspensions:2,
  topZips:[{zip:"60647",jobs:312,workers:107},{zip:"60614",jobs:248,workers:91},{zip:"60657",jobs:195,workers:78},{zip:"60622",jobs:176,workers:64}],
  recentActivity:[
    {type:"job",icon:"✅",text:"Job completed · Mow Lawn · $35",time:"2m ago"},
    {type:"signup",icon:"👤",text:"New worker signup · Jordan D. · 60647",time:"5m ago"},
    {type:"dispute",icon:"⚖️",text:"Dispute opened · Window Washing · 60614",time:"12m ago"},
    {type:"payment",icon:"💸",text:"Payout released · $46.00 · worker #1204",time:"18m ago"},
    {type:"strike",icon:"⚠️",text:"Strike issued · Poster #887 · no-show",time:"34m ago"},
    {type:"job",icon:"📋",text:"New job posted · Babysitting · 60657",time:"41m ago"},
    {type:"signup",icon:"🏠",text:"New poster signup · Sunrise Café",time:"1hr ago"},
  ],
};

const INITIAL_ESCROW = [
  { id:"ESC-2041", jobId:1, job:"Mow & Edge Front Lawn", worker:"Jordan M.", poster:"The Hendersons", amount:35, fee:2.80, workerGets:32.20, status:"held", createdAt:"Feb 28", scheduledDate:"Mar 1", note:"Funds held until job completion · Oak St NW", posterConfirmed:false, workerConfirmed:false },
  { id:"ESC-2040", jobId:6, job:"Deep Clean Kitchen", worker:"Carlos T.", poster:"Sunrise Café", amount:80, fee:6.40, workerGets:73.60, status:"held", createdAt:"Feb 27", scheduledDate:"Mar 2", note:"Recurring · auto-hold enabled", posterConfirmed:false, workerConfirmed:false },
  { id:"ESC-2039", jobId:2, job:"Dog Walking – 2 Labs", worker:"Jordan M.", poster:"Maria C.", amount:20, fee:1.60, workerGets:18.40, status:"released", createdAt:"Feb 22", releasedAt:"Feb 24", note:"Poster confirmed completion", posterConfirmed:true, workerConfirmed:true },
  { id:"ESC-2038", jobId:5, job:"Help Move Furniture", worker:"Priya S.", poster:"The Patels", amount:50, fee:4.00, workerGets:46.00, status:"disputed", createdAt:"Feb 20", disputedAt:"Feb 21", note:"Worker claims incomplete payment", posterConfirmed:false, workerConfirmed:false },
  { id:"ESC-2037", jobId:4, job:"Window Washing", worker:"Aaliyah R.", poster:"Green Valley Bakery", amount:60, fee:4.80, workerGets:55.20, status:"released", createdAt:"Feb 18", releasedAt:"Feb 19", note:"Auto-released after 48hrs", posterConfirmed:true, workerConfirmed:true },
  { id:"ESC-2036", jobId:8, job:"Grocery Run & Pickup", worker:"Carlos T.", poster:"Mrs. Chen", amount:25, fee:2.00, workerGets:23.00, status:"refunded", createdAt:"Feb 15", refundedAt:"Feb 16", note:"Worker no-show · full refund", posterConfirmed:false, workerConfirmed:false },
];

const ESCROW_STATUS = {
  held:     { bg:"#FFF7ED", text:G.gold, icon:"🔒", label:"Held" },
  released: { bg:G.greenPale, text:G.greenMid, icon:"✅", label:"Released" },
  disputed: { bg:G.redLight, text:G.red, icon:"⚠️", label:"Disputed" },
  refunded: { bg:G.blueLight, text:G.blue, icon:"↩️", label:"Refunded" },
};

// ─── SMALL HELPERS ───────────────────────────────────────────────────────────
const Avatar = ({ name="?", size=40, bg=G.greenMid }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:bg, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:size*.35, flexShrink:0, fontFamily:"'Outfit',sans-serif" }}>
    {name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
  </div>
);
const Tag = ({ children, color=G.greenMid, bg=G.greenPale }) => (
  <span style={{ background:bg, color, fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20 }}>{children}</span>
);
const Btn = ({ children, onClick, style={}, variant="primary", disabled=false }) => {
  const v = { primary:{background:G.green,color:"#fff"}, outline:{background:"transparent",color:G.green,border:`2px solid ${G.green}`}, ghost:{background:G.sand,color:G.text}, orange:{background:G.orange,color:"#fff"}, danger:{background:G.red,color:"#fff"} };
  return <button className="btn" onClick={onClick} disabled={disabled} style={{ padding:"12px 18px", borderRadius:14, fontSize:14, fontWeight:700, cursor:disabled?"not-allowed":"pointer", opacity:disabled?.5:1, ...v[variant], ...style }}>{children}</button>;
};
const Badge = ({ n, color=G.orange }) => n>0 ? (
  <div style={{ position:"absolute", top:-4, right:-6, width:16, height:16, borderRadius:"50%", background:color, color:"#fff", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{n}</div>
) : null;
const Toggle = ({ on, onChange }) => (
  <div className="tap" onClick={onChange} style={{ width:44, height:24, borderRadius:12, background: on ? G.greenLight : "#D1D5DB", position:"relative", cursor:"pointer", transition:"background .2s", flexShrink:0 }}>
    <div style={{ position:"absolute", top:3, left: on ? 23 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.15)" }} />
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ notif, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="notif-in tap" onClick={onDismiss} style={{ position:"fixed", top:44, left:"50%", transform:"translateX(-50%)", width:"calc(100% - 32px)", maxWidth:398, background:G.white, borderRadius:18, padding:"12px 16px", boxShadow:"0 8px 32px rgba(0,0,0,.18)", zIndex:999, display:"flex", gap:12, alignItems:"center", border:`1px solid ${G.border}` }}>
      <div style={{ width:36, height:36, borderRadius:12, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{notif.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:13, color:G.text }}>{notif.title}</div>
        <div style={{ fontSize:12, color:G.muted, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{notif.body}</div>
      </div>
      <div style={{ fontSize:18, color:G.muted, flexShrink:0 }}>×</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCROW HOLD MODAL (opened from job cards)
// ═══════════════════════════════════════════════════════════════════════════
function EscrowHoldModal({ job, onClose, onConfirm }) {
  const [step, setStep] = useState(0);
  const [payMethod, setPayMethod] = useState("visa");
  const [processing, setProcessing] = useState(false);
  const fee = +(job.pay * 0.08).toFixed(2);
  const total = +(job.pay + fee).toFixed(2);
  const workerGets = +(job.pay * 0.92).toFixed(2);

  if (step === 2) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
      <div className="fade" style={{ background:G.white, borderRadius:24, padding:"32px 24px", width:"100%", maxWidth:400, textAlign:"center" }}>
        <div className="check-pop" style={{ width:68, height:68, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 16px" }}>🔒</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.green }}>Escrow Created!</div>
        <div style={{ fontSize:14, color:G.muted, marginTop:8, lineHeight:1.5 }}><strong>${job.pay.toFixed(2)}</strong> is held securely until<br/><strong>{job.title}</strong> is completed.</div>
        <div style={{ background:G.greenPale, borderRadius:14, padding:14, marginTop:20, textAlign:"left" }}>
          {[["Held amount",`$${job.pay.toFixed(2)}`],["Platform fee (8%)",`$${fee.toFixed(2)}`]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}><span style={{ color:G.muted }}>{l}</span><span style={{ fontWeight:700 }}>{v}</span></div>
          ))}
          <div style={{ height:1, background:G.greenLight, opacity:.3, margin:"6px 0" }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span style={{ color:G.muted }}>Worker receives</span><span style={{ fontWeight:800, color:G.greenMid }}>${workerGets.toFixed(2)}</span></div>
        </div>
        <Btn onClick={() => { onConfirm({ id:`ESC-${2042+Math.floor(Math.random()*100)}`, jobId:job.id, job:job.title, worker:"Pending", poster:job.poster, amount:job.pay, fee, workerGets, status:"held", createdAt:"Just now", scheduledDate:job.date, note:"Funds held until job completion" }); onClose(); }} style={{ width:"100%", marginTop:20, padding:15, borderRadius:16 }}>Done →</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"flex-end", zIndex:200 }}>
      <div className="slide-up" style={{ background:G.cream, borderRadius:"24px 24px 0 0", padding:"24px 20px 36px", width:"100%", maxWidth:430, margin:"0 auto", maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>{step===0?"Fund Escrow":"Payment"}</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Step {step+1} of 2</div>
          </div>
          <div className="tap" onClick={onClose} style={{ fontSize:24, color:G.muted }}>×</div>
        </div>
        <div style={{ height:4, background:G.sand, borderRadius:2, marginBottom:22 }}>
          <div className="progress-fill" style={{ height:"100%", width:step===0?"50%":"100%", background:G.greenLight, borderRadius:2 }} />
        </div>

        {step===0 && (<>
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Job Details</div>
            <div style={{ fontWeight:700, fontSize:16, color:G.text }}>{job.title}</div>
            <div style={{ fontSize:13, color:G.muted, marginTop:4 }}>{job.verified?"✅ ":""}{job.poster} · {job.loc} · {job.date}</div>
            <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>{job.tags.map(t=><Tag key={t}>{t}</Tag>)}</div>
          </div>
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Price Breakdown</div>
            {[["Job payment",`$${job.pay.toFixed(2)}`],["Platform fee (8%)",`$${fee.toFixed(2)}`]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${G.border}`, fontSize:14 }}><span style={{ color:G.muted }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span></div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0" }}>
              <span style={{ fontWeight:700, fontSize:15 }}>Total</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:22, color:G.greenMid }}>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="escrow-glow" style={{ background:G.greenPale, borderRadius:16, padding:16, marginBottom:20, border:`1.5px solid ${G.greenLight}` }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:24 }}>🛡️</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:G.greenMid, marginBottom:6 }}>Escrow Protection</div>
                {["Payment held securely — not sent yet","Funds release only when you confirm","Full refund if worker no-shows","Auto-releases after 48hrs if no dispute"].map((t,i)=>(
                  <div key={i} style={{ fontSize:12, color:G.text, lineHeight:1.6, display:"flex", gap:6 }}><span style={{ color:G.greenMid, fontWeight:800 }}>✓</span>{t}</div>
                ))}
              </div>
            </div>
          </div>
          <Btn onClick={()=>setStep(1)} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>Continue to Payment →</Btn>
        </>)}

        {step===1 && (<>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Payment Method</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {[{id:"visa",icon:"💳",label:"Visa •••• 4242",sub:"Expires 08/27"},{id:"apple",icon:"",label:"Apple Pay",sub:"Face ID"},{id:"google",icon:"G",label:"Google Pay",sub:"Linked account"}].map(m=>(
              <div key={m.id} className="tap" onClick={()=>setPayMethod(m.id)} style={{ display:"flex", gap:14, alignItems:"center", background:G.white, borderRadius:16, padding:"14px 16px", border:`2px solid ${payMethod===m.id?G.green:G.border}`, transition:"all .15s" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:payMethod===m.id?G.greenPale:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{m.icon}</div>
                <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>{m.label}</div><div style={{ fontSize:12, color:G.muted, marginTop:1 }}>{m.sub}</div></div>
                <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${payMethod===m.id?G.green:G.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>{payMethod===m.id&&<div style={{ width:10, height:10, borderRadius:"50%", background:G.green }}/>}</div>
              </div>
            ))}
          </div>
          <div style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><div style={{ fontSize:12, color:G.muted }}>Total escrow hold</div><div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:G.greenMid, marginTop:2 }}>${total.toFixed(2)}</div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:11, color:G.muted }}>Worker gets</div><div style={{ fontSize:15, fontWeight:700, color:G.greenLight, marginTop:2 }}>${workerGets.toFixed(2)}</div></div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>setStep(0)} variant="ghost" style={{ padding:"15px 20px", borderRadius:16 }}>←</Btn>
            <Btn onClick={()=>{setProcessing(true);setTimeout(()=>{setProcessing(false);setStep(2);},1500);}} disabled={processing} style={{ flex:1, padding:15, borderRadius:16, fontSize:15 }}>{processing?"Processing…":`Hold $${total.toFixed(2)}`}</Btn>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCROW DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════
function EscrowDetailModal({ txn, role, onClose, onConfirmSide, onDispute }) {
  const sc = ESCROW_STATUS[txn.status];
  const [confirmAction, setConfirmAction] = useState(null);
  const [processing, setProcessing] = useState(false);

  const myConfirmed = role==="poster" ? txn.posterConfirmed : txn.workerConfirmed;
  const otherConfirmed = role==="poster" ? txn.workerConfirmed : txn.posterConfirmed;
  const otherLabel = role==="poster" ? "Worker" : "Poster";

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"flex-end", zIndex:200 }}>
      <div className="slide-up" style={{ background:G.cream, borderRadius:"24px 24px 0 0", padding:"24px 20px 36px", width:"100%", maxWidth:430, margin:"0 auto", maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:G.border, margin:"0 auto 18px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>{txn.job}</div>
            <div style={{ fontSize:13, color:G.muted, marginTop:3 }}>{txn.id} · {txn.createdAt}</div>
          </div>
          <div style={{ background:sc.bg, color:sc.text, fontSize:12, fontWeight:700, padding:"6px 12px", borderRadius:12, display:"flex", alignItems:"center", gap:4 }}>{sc.icon} {sc.label}</div>
        </div>
        <div style={{ display:"flex", gap:12, marginBottom:16 }}>
          {[{name:txn.poster,role:"Poster",bg:G.blue,confirmed:txn.posterConfirmed},{name:txn.worker,role:"Worker",bg:G.greenMid,confirmed:txn.workerConfirmed}].map((p,i)=>(
            <div key={i} style={{ flex:1, background:G.white, borderRadius:14, padding:14, boxShadow:"0 2px 8px rgba(0,0,0,.05)", textAlign:"center", position:"relative" }}>
              <Avatar name={p.name} size={36} bg={p.bg} />
              <div style={{ fontWeight:700, fontSize:13, marginTop:6 }}>{p.name}</div>
              <div style={{ fontSize:11, color:G.muted }}>{p.role}</div>
              {txn.status==="held"&&(
                <div style={{ marginTop:6, fontSize:11, fontWeight:700, color:p.confirmed?G.green:G.gold, display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
                  {p.confirmed
                    ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Confirmed</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Pending</>
                  }
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dual-confirm progress */}
        {txn.status==="held"&&(
          <div style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Release Progress</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ flex:1, height:8, background:G.sand, borderRadius:4, overflow:"hidden" }}>
                <div style={{ width:txn.posterConfirmed&&txn.workerConfirmed?"100%":txn.posterConfirmed||txn.workerConfirmed?"50%":"0%", height:"100%", background:`linear-gradient(90deg,${G.green},${G.greenLight})`, borderRadius:4, transition:"width .4s ease" }} />
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:G.greenMid }}>{(txn.posterConfirmed?1:0)+(txn.workerConfirmed?1:0)}/2</div>
            </div>
            <div style={{ fontSize:12, color:G.muted, lineHeight:1.5 }}>
              Both parties must confirm job completion to release funds. Auto-releases after 48hrs if no dispute.
            </div>
          </div>
        )}

        <div style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Payment</div>
          {[["Job amount",`$${txn.amount.toFixed(2)}`],["Fee (8%)",`$${txn.fee.toFixed(2)}`],["Worker receives",`$${txn.workerGets.toFixed(2)}`]].map(([l,v],i)=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${G.border}`, fontSize:13 }}>
              <span style={{ color:G.muted }}>{l}</span><span style={{ fontWeight:i===2?800:600, color:i===2?G.greenMid:G.text }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Timeline</div>
          {[
            { icon:"💳", text:"Escrow funded", date:txn.createdAt, done:true },
            { icon:"🔒", text:"Funds held", date:txn.createdAt, done:true },
            { icon:"📅", text:`Scheduled: ${txn.scheduledDate||"–"}`, date:"", done:txn.status!=="held" },
            ...(txn.posterConfirmed?[{icon:"✅",text:"Poster confirmed",date:"",done:true}]:[]),
            ...(txn.workerConfirmed?[{icon:"✅",text:"Worker confirmed",date:"",done:true}]:[]),
            { icon:txn.status==="released"?"✅":txn.status==="disputed"?"⚠️":txn.status==="refunded"?"↩️":"⏳",
              text:txn.status==="released"?"Released to worker":txn.status==="disputed"?"Dispute opened":txn.status==="refunded"?"Refunded to poster":"Awaiting completion",
              date:txn.releasedAt||txn.disputedAt||txn.refundedAt||"Pending", done:txn.status!=="held" },
          ].map((t,i,arr)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"8px 0" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:t.done?G.greenPale:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{t.icon}</div>
                {i<arr.length-1&&<div style={{ width:2, height:20, background:t.done?G.greenLight:G.border, opacity:.5 }}/>}
              </div>
              <div style={{ paddingTop:4 }}><div style={{ fontSize:13, fontWeight:600, color:t.done?G.text:G.muted }}>{t.text}</div>{t.date&&<div style={{ fontSize:11, color:G.muted, marginTop:1 }}>{t.date}</div>}</div>
            </div>
          ))}
        </div>
        {txn.note&&<div style={{ background:"#FFF7ED", borderRadius:14, padding:14, marginBottom:16, border:"1px solid rgba(244,162,97,.2)" }}><div style={{ fontSize:12, color:G.gold, fontWeight:600 }}>📝 {txn.note}</div></div>}

        {confirmAction&&(
          <div style={{ background:confirmAction==="confirm"?G.greenPale:G.redLight, borderRadius:16, padding:16, marginBottom:14, border:`1.5px solid ${confirmAction==="confirm"?G.greenLight:G.red}` }}>
            <div style={{ fontWeight:700, fontSize:14, color:confirmAction==="confirm"?G.greenMid:G.red, marginBottom:6 }}>{confirmAction==="confirm"?"✅ Confirm Job Complete":"⚠️ Open Dispute"}</div>
            <div style={{ fontSize:13, color:G.text, lineHeight:1.5, marginBottom:12 }}>
              {confirmAction==="confirm"
                ? otherConfirmed
                  ? `Both parties will have confirmed. $${txn.workerGets.toFixed(2)} will be released to ${txn.worker} immediately.`
                  : `Waiting for ${otherLabel} to also confirm. Funds stay held until both sides agree.`
                : "This will freeze escrow and notify both parties. Reviewed within 24hrs."}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={()=>setConfirmAction(null)} variant="ghost" style={{ flex:1, padding:11, fontSize:13 }}>Cancel</Btn>
              <Btn onClick={async ()=>{
                setProcessing(true);
                if (confirmAction==="confirm") {
                  if (txn.stripeIntentId) {
                    try { await fetch(`${BACKEND}/api/release`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ intentId:txn.stripeIntentId }) }); } catch(e) {}
                  }
                  onConfirmSide(txn.id, role);
                } else {
                  if (txn.stripeIntentId) {
                    try { await fetch(`${BACKEND}/api/refund`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ intentId:txn.stripeIntentId, reason:"fraudulent" }) }); } catch(e) {}
                  }
                  onDispute(txn.id);
                }
                setProcessing(false); setConfirmAction(null); onClose();
              }} disabled={processing} variant={confirmAction==="confirm"?"primary":"danger"} style={{ flex:1, padding:11, fontSize:13 }}>
                {processing?"Processing…":confirmAction==="confirm"?"Confirm":"Submit"}
              </Btn>
            </div>
          </div>
        )}

        {txn.status==="held"&&!confirmAction&&(
          <div style={{ display:"flex", gap:10, marginBottom:8 }}>
            {myConfirmed
              ? <Btn variant="ghost" style={{ flex:2, padding:14, borderRadius:16, opacity:.7 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M20 6L9 17l-5-5"/></svg>
                  You Confirmed · Waiting on {otherLabel}
                </Btn>
              : <Btn onClick={()=>setConfirmAction("confirm")} style={{ flex:2, padding:14, borderRadius:16 }}>✅ Confirm Job Complete</Btn>
            }
            <Btn onClick={()=>setConfirmAction("dispute")} variant="outline" style={{ flex:1, padding:14, borderRadius:16, fontSize:13 }}>⚠️ Dispute</Btn>
          </div>
        )}
        <Btn onClick={onClose} variant="ghost" style={{ width:"100%", padding:13, borderRadius:16 }}>Close</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT PAGE (full payment flow with card entry)
// ═══════════════════════════════════════════════════════════════════════════
function CheckoutModal({ job, onClose, onComplete }) {
  const [step, setStep] = useState(0); // 0=summary, 1=card entry, 2=review, 3=processing, 4=success
  const [card, setCard] = useState({ number:"", expiry:"", cvc:"", name:"", save:true });
  const [payMethod, setPayMethod] = useState("new"); // "new","visa","apple"
  const [tipPct, setTipPct] = useState(0);
  const [stripeRef, setStripeRef] = useState(null); // { stripe, card } from StripeCardInput
  const [stripeError, setStripeError] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [cardBrand, setCardBrand] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const fee = +(job.pay * 0.08).toFixed(2);
  const tip = +(job.pay * tipPct / 100).toFixed(2);
  const total = +(job.pay + fee + tip).toFixed(2);
  const workerGets = +((job.pay + tip) * 0.92).toFixed(2);

  // Called when "Pay" is tapped — tokenize the card with Stripe
  const handleStripeCharge = async () => {
    setStripeError("");
    if (payMethod === "new") {
      if (!stripeRef) { setStripeError("Stripe is still loading, please wait."); return; }
      setStep(3);
      const { stripe, card: cardEl } = stripeRef;
      const result = await stripe.createPaymentMethod({
        type: "card",
        card: cardEl,
        billing_details: { name: card.name || "Chores User" },
      });
      if (result.error) {
        setStep(2);
        setStripeError(result.error.message);
        return;
      }
      setPaymentMethodId(result.paymentMethod.id);
      setCardBrand(result.paymentMethod.card.brand);
      setCardLast4(result.paymentMethod.card.last4);

      // ── Real backend charge ──
      try {
        const res = await fetch(`${BACKEND}/api/charge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: result.paymentMethod.id,
            amountCents: Math.round(total * 100),
            jobId: String(job.id),
            jobTitle: job.title,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setStep(2);
          setStripeError(data.error);
          return;
        }
        // data.intentId is the escrow ID — store it for release/refund later
        setPaymentMethodId(result.paymentMethod.id + "|" + data.intentId);
        setStep(4);
      } catch (err) {
        setStep(2);
        setStripeError("Network error — please try again.");
      }
    } else {
      // Saved card / Apple Pay — go straight to processing
      setStep(3);
      setTimeout(() => setStep(4), 1800);
    }
  };

  // Step 3 — Processing
  if (step === 3) {
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
        <div className="fade" style={{ background:G.white, borderRadius:24, padding:"48px 32px", width:"100%", maxWidth:400, textAlign:"center" }}>
          <div className="pulse" style={{ width:64, height:64, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>💳</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, color:G.text }}>Processing Payment...</div>
          <div style={{ fontSize:13, color:G.muted, marginTop:8 }}>Verifying card and securing escrow</div>
          <div style={{ margin:"24px auto 0", width:"60%", height:4, borderRadius:2, background:G.sand, overflow:"hidden" }}>
            <div className="onb-shimmer" style={{ width:"100%", height:"100%", background:`linear-gradient(90deg, ${G.greenLight} 0%, ${G.greenPale} 50%, ${G.greenLight} 100%)`, borderRadius:2 }} />
          </div>
        </div>
      </div>
    );
  }

  // Step 4 — Success
  if (step === 4) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
      <div className="fade" style={{ background:G.white, borderRadius:24, padding:"32px 24px", width:"100%", maxWidth:400, textAlign:"center" }}>
        <div className="check-pop" style={{ width:72, height:72, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 16px" }}>✅</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.green }}>Payment Authorized!</div>
        <div style={{ fontSize:14, color:G.muted, marginTop:8, lineHeight:1.5 }}>
          <strong>${total}</strong> authorized. <strong>${job.pay.toFixed(2)}</strong> held in escrow.
        </div>
        {paymentMethodId && (
          <div style={{ background:"#EBF8FF", borderRadius:12, padding:"8px 14px", marginTop:12, display:"inline-flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:13 }}>💳</span>
            <span style={{ fontSize:12, color:G.blue, fontWeight:600 }}>
              {cardBrand ? cardBrand.charAt(0).toUpperCase()+cardBrand.slice(1) : "Card"} •••• {cardLast4} · Tokenized ✓
            </span>
          </div>
        )}
        <div style={{ background:G.greenPale, borderRadius:14, padding:14, marginTop:16, textAlign:"left" }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.greenMid, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Receipt</div>
          {[["Job",job.title],["Amount",`$${job.pay.toFixed(2)}`],["Fee (8%)",`$${fee.toFixed(2)}`],["Tip",`$${tip.toFixed(2)}`],["Total",`$${total}`],["Worker gets",`$${workerGets.toFixed(2)}`],
            ...(paymentMethodId ? [["Stripe Token", paymentMethodId.slice(0,18)+"…"]] : [])
          ].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0", borderBottom:`1px solid ${G.greenLight}20` }}><span style={{ color:G.greenMid }}>{l}</span><span style={{ fontWeight:700, color:G.text, maxWidth:"60%", textAlign:"right", wordBreak:"break-all" }}>{v}</span></div>
          ))}
        </div>
        <div style={{ fontSize:11, color:G.muted, marginTop:12 }}>Send token to your backend to capture when job completes</div>
        <Btn onClick={()=>{
          onComplete({ id:`ESC-${2042+Math.floor(Math.random()*100)}`, jobId:job.id, job:job.title, worker:"Pending", poster:job.poster, amount:job.pay, fee, workerGets, status:"held", createdAt:"Just now", scheduledDate:job.date, note:"Funds held until job completion", stripeIntentId: paymentMethodId?.split("|")[1] || null });
          onClose();
        }} style={{ width:"100%", marginTop:20, padding:15, borderRadius:16 }}>Done →</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"flex-end", zIndex:200 }}>
      <div className="slide-up" style={{ background:G.cream, borderRadius:"24px 24px 0 0", padding:"24px 20px 36px", width:"100%", maxWidth:430, margin:"0 auto", maxHeight:"94vh", overflowY:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>{step===0?"Checkout":step===1?"Payment Details":"Review Order"}</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Step {step+1} of 3</div>
          </div>
          <div className="tap" onClick={onClose} style={{ fontSize:24, color:G.muted }}>×</div>
        </div>
        <div style={{ height:4, background:G.sand, borderRadius:2, marginBottom:18 }}>
          <div className="progress-fill" style={{ height:"100%", width:`${((step+1)/3)*100}%`, background:G.greenLight, borderRadius:2 }} />
        </div>

        {step===0 && (<>
          {/* Job summary */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:48, height:48, borderRadius:14, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{CATEGORIES.find(c=>c.id===job.category)?.icon||"📋"}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{job.title}</div>
                <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>{job.verified?"✅ ":""}{job.poster} · 📍 {job.loc}</div>
                <div style={{ fontSize:12, color:G.muted }}>{job.date}</div>
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.greenMid }}>${job.pay}</div>
            </div>
          </div>

          {/* Tip */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Add a Tip</div>
            <div style={{ display:"flex", gap:8 }}>
              {[{pct:0,label:"None"},{pct:10,label:"10%"},{pct:15,label:"15%"},{pct:20,label:"20%"}].map(t=>(
                <div key={t.pct} className="tap" onClick={()=>setTipPct(t.pct)} style={{ flex:1, padding:"10px 0", borderRadius:12, textAlign:"center", background:tipPct===t.pct?G.greenPale:G.sand, border:`2px solid ${tipPct===t.pct?G.greenLight:"transparent"}`, fontSize:13, fontWeight:700, color:tipPct===t.pct?G.green:G.muted, transition:"all .15s" }}>
                  {t.label}
                  {t.pct>0&&<div style={{ fontSize:10, fontWeight:500, marginTop:2 }}>${(job.pay*t.pct/100).toFixed(2)}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Order Summary</div>
            {[["Job payment",`$${job.pay.toFixed(2)}`],["Platform fee (8%)",`$${fee.toFixed(2)}`],["Tip",`$${tip.toFixed(2)}`]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${G.border}`, fontSize:14 }}><span style={{ color:G.muted }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span></div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0 0" }}>
              <span style={{ fontWeight:700, fontSize:16 }}>Total</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:24, color:G.greenMid }}>${total}</span>
            </div>
          </div>

          {/* Escrow info */}
          <div className="escrow-glow" style={{ background:G.greenPale, borderRadius:16, padding:14, marginBottom:18, border:`1.5px solid ${G.greenLight}` }}>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:20 }}>🛡️</span>
              <div style={{ fontSize:12, color:G.greenMid, fontWeight:600, lineHeight:1.4 }}>Payment held in escrow until you confirm the job is done. Full protection guaranteed.</div>
            </div>
          </div>

          <Btn onClick={()=>setStep(1)} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>Continue to Payment →</Btn>
        </>)}

        {step===1 && (<>
          {/* Payment method selection */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Saved Methods</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {[{id:"visa",icon:"💳",label:"Visa •••• 4242",sub:"Expires 08/27"},{id:"apple",icon:"",label:"Apple Pay",sub:"Face ID"}].map(m=>(
              <div key={m.id} className="tap" onClick={()=>setPayMethod(m.id)} style={{ display:"flex", gap:12, alignItems:"center", background:G.white, borderRadius:14, padding:"12px 14px", border:`2px solid ${payMethod===m.id?G.green:G.border}`, transition:"all .15s" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:payMethod===m.id?G.greenPale:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{m.icon}</div>
                <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:13 }}>{m.label}</div><div style={{ fontSize:11, color:G.muted }}>{m.sub}</div></div>
                <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${payMethod===m.id?G.green:G.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>{payMethod===m.id&&<div style={{ width:8, height:8, borderRadius:"50%", background:G.green }}/>}</div>
              </div>
            ))}
          </div>

          {/* New card */}
          <div className="tap" onClick={()=>setPayMethod("new")} style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>New Card {payMethod==="new"&&"✓"}</span>
            <span style={{ color:G.greenMid, fontWeight:700, fontSize:12 }}>{payMethod!=="new"?"+ Add":"Active"}</span>
          </div>

          {payMethod==="new"&&(
            <div style={{ background:G.white, borderRadius:18, padding:16, border:`2px solid ${G.greenLight}`, marginBottom:16 }}>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:6 }}>Card Details</label>
                <StripeCardInput onReady={setStripeRef} />
                {stripeError && (
                  <div style={{ color:G.red, fontSize:12, fontWeight:600, marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
                    ⚠️ {stripeError}
                  </div>
                )}
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:4 }}>Name on Card</label>
                <input value={card.name} onChange={e=>setCard(c=>({...c,name:e.target.value}))} placeholder="Jonathan Spicer"
                  style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border}
                />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span style={{ fontSize:11, color:G.muted }}>Secured by Stripe · PCI-DSS Level 1</span>
              </div>
            </div>
          )}

          {/* Total bar */}
          <div style={{ background:G.white, borderRadius:14, padding:14, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
            <div><div style={{ fontSize:11, color:G.muted }}>Total charge</div><div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.greenMid, marginTop:2 }}>${total}</div></div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:16 }}>🔒</span><span style={{ fontSize:11, color:G.muted, fontWeight:600 }}>SSL Encrypted</span></div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>setStep(0)} variant="outline" style={{ flex:1, padding:15, borderRadius:14 }}>← Back</Btn>
            <Btn onClick={()=>setStep(2)} disabled={payMethod==="new"&&!stripeRef} style={{ flex:2, padding:15, borderRadius:14, fontSize:15, opacity:(payMethod!=="new"||stripeRef)?1:.5 }}>Review Order →</Btn>
          </div>
        </>)}

        {step===2 && (<>
          {/* Final review */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", paddingBottom:12, borderBottom:`1px solid ${G.border}` }}>
              <div style={{ width:44, height:44, borderRadius:12, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{CATEGORIES.find(c=>c.id===job.category)?.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{job.title}</div>
                <div style={{ fontSize:12, color:G.muted }}>{job.poster} · {job.date}</div>
              </div>
            </div>
            {[["Subtotal",`$${job.pay.toFixed(2)}`],["Fee",`$${fee.toFixed(2)}`],["Tip",`$${tip.toFixed(2)}`]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", fontSize:13, borderBottom:`1px solid ${G.border}` }}><span style={{ color:G.muted }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span></div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0" }}>
              <span style={{ fontWeight:800, fontSize:16 }}>Total</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:22, color:G.greenMid }}>${total}</span>
            </div>
          </div>

          <div style={{ background:G.white, borderRadius:14, padding:14, marginBottom:14, display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{payMethod==="visa"?"💳":payMethod==="apple"?"":"💳"}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>{payMethod==="visa"?"Visa •••• 4242":payMethod==="apple"?"Apple Pay":`Card •••• ${card.number.slice(-4)}`}</div>
              <div style={{ fontSize:11, color:G.muted }}>{payMethod==="apple"?"Face ID":"Charged immediately"}</div>
            </div>
            <div className="tap" onClick={()=>setStep(1)} style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Change</div>
          </div>

          <div style={{ background:G.orangeLight, borderRadius:14, padding:14, marginBottom:18, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:16 }}>⚠️</span>
            <div style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>By confirming, <strong>${total}</strong> will be charged to your card. <strong>${job.pay.toFixed(2)}</strong> will be held in escrow until you confirm the job is complete.</div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>setStep(1)} variant="outline" style={{ flex:1, padding:15, borderRadius:14 }}>← Back</Btn>
            <Btn onClick={handleStripeCharge} style={{ flex:2, padding:15, borderRadius:14, fontSize:15 }}>💳 Pay ${total}</Btn>
          </div>

          <div style={{ textAlign:"center", marginTop:12, fontSize:10, color:G.muted, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>🔒 Secured by 256-bit SSL encryption</div>
        </>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS SCREEN (with escrow wallet, account, payments, notifs, privacy)
// ═══════════════════════════════════════════════════════════════════════════
function SettingsScreen({ role, escrowData, onConfirmSide, onDispute, onReview, onUpdateZip, onTogglesChange }) {
  const [tab, setTab] = useState("profile");
  const [subPage, setSubPage] = useState(null);
  const settingsRef = React.useRef(null);
  React.useEffect(()=>{
    if(settingsRef.current) settingsRef.current.scrollIntoView({block:"start"});
    window.scrollTo(0,0);
    // Also scroll the nearest scrollable parent
    const el = settingsRef.current;
    if(el){let p=el.parentElement;while(p){if(p.scrollTop>0){p.scrollTop=0;}p=p.parentElement;}}
  },[tab, subPage]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [toggles, setToggles] = useState({ push:true, sound:true, vibrate:true, darkMode:false, exactLoc:false, analytics:true, marketing:false, twoFactor:true, instantPayout:false,
    nJobs:true, nAppUpdates:true, nDayReminder:true, nHourReminder:true, nPayment:true, nCancel:true, nApplicant:true, nComplete:true, nReceipts:true, nRate:true, profileVisible:true });
  const tog = (k) => setToggles(t=>{ const n={...t,[k]:!t[k]}; if(onTogglesChange) onTogglesChange(n); return n; });
  const [deleteStep, setDeleteStep] = useState(0);
  const [zipInput, setZipInput] = useState("");
  const [zipCity, setZipCity] = useState(null);
  const [zipSaved, setZipSaved] = useState(false);
  // Help Center
  const [openFaq, setOpenFaq] = useState(null);
  // Contact Support
  const [csSubject, setCsSubject] = useState("");
  const [csMessage, setCsMessage] = useState("");
  const [csSent, setCsSent] = useState(false);
  const [csCategory, setCsCategory] = useState("");
  // Report Bug
  const [bugType, setBugType] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [bugSteps, setBugSteps] = useState("");
  const [bugSent, setBugSent] = useState(false);
  // Suggest Feature
  const [featArea, setFeatArea] = useState("");
  const [featDesc, setFeatDesc] = useState("");
  const [featSent, setFeatSent] = useState(false);
  // Terms / Guidelines
  const [openSec, setOpenSec] = useState(null);
  const [openRule, setOpenRule] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [badgeTab, setBadgeTab] = useState("badges");
  // Payment methods state
  const [pmCards, setPmCards] = useState([
    { id:"pm_visa_4242", brand:"visa", last4:"4242", exp_month:8, exp_year:2027, isDefault:true },
    { id:"pm_mc_8910", brand:"mastercard", last4:"8910", exp_month:3, exp_year:2026, isDefault:false },
  ]);
  const [pmAdding, setPmAdding] = useState(false);
  const [pmProcessing, setPmProcessing] = useState(false);
  const [pmAddSuccess, setPmAddSuccess] = useState(false);
  const [pmError, setPmError] = useState("");
  // Transactions state
  const [txFilter, setTxFilter] = useState("all");
  // Bank account state
  const [bank, setBank] = useState({ name:"Chase", last4:"7890", routing:"•••••1234", type:"Checking", holder:"Jordan Davis" });
  const [bankEditing, setBankEditing] = useState(false);
  const [bankFields, setBankFields] = useState({ holder:"Jordan Davis", routing:"", account:"", bankName:"Chase", type:"Checking" });
  const [bankSaved, setBankSaved] = useState(false);
  const [downloadStep, setDownloadStep] = useState(0); // 0=none, 1=processing, 2=ready
  const [profile, setProfile] = useState({ first:"Jordan", last:"Davis", email:"jordan@email.com", phone:"(312) 555-0123", bio:"Hardworking college student available for odd jobs around the neighborhood. Reliable, punctual, and always happy to help.", age:"19", zip:"60647", photo:null });
  const photoInputRef = React.useRef();
  const [saved, setSaved] = useState(false);
  const [selSkills, setSelSkills] = useState(["lawn","cleaning","moving"]);
  const [customSkill, setCustomSkill] = useState("");
  const togSkill = (id) => setSelSkills(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [pwFields, setPwFields] = useState({ current:"", newPw:"", confirm:"" });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [payoutFreq, setPayoutFreq] = useState("weekly");
  const [payoutDay, setPayoutDay] = useState("Monday");
  const [payoutSaved, setPayoutSaved] = useState(false);

  const totalHeld = escrowData.filter(t=>t.status==="held").reduce((s,t)=>s+t.amount,0);
  const totalReleased = escrowData.filter(t=>t.status==="released").reduce((s,t)=>s+t.workerGets,0);
  const heldCount = escrowData.filter(t=>t.status==="held").length;

  const SettingRow = ({ icon, label, sub, right, last, onClick }) => (
    <div className={onClick?"tap":""} onClick={onClick} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 0", borderBottom:last?"none":`1px solid ${G.border}` }}>
      <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14, color:G.text }}>{label}</div>{sub&&<div style={{ fontSize:12, color:G.muted, marginTop:1 }}>{sub}</div>}</div>
      {right}
    </div>
  );

  const tabs = [
    { id:"profile", icon:"", label:"Profile" },
    { id:"account", icon:"", label:"Account" },
    { id:"payments", icon:"", label:"Payments" },
    { id:"notifications", icon:"", label:"Alerts" },
    { id:"privacy", icon:"", label:"Privacy" },
    { id:"support", icon:"", label:"Support" },
  ];

  // ── EDIT PROFILE SUB-PAGE ──
  if (subPage==="editProfile") {
    const Field = ({ label, value, onChange, type="text", rows, placeholder="" }) => (
      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>
        {rows
          ? <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder} style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", resize:"none", background:G.white, outline:"none", lineHeight:1.5, boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
          : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", background:G.white, outline:"none", boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
        }
      </div>
    );
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>{setSubPage(null);setSaved(false);}} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Edit Profile</div>
        </div>

        {/* Profile photo */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ position:"relative", display:"inline-block" }}>
            {profile.photo
              ? <img src={profile.photo} alt="Profile" style={{ width:88, height:88, borderRadius:"50%", objectFit:"cover", border:`3px solid ${G.greenLight}` }} />
              : <Avatar name={`${profile.first} ${profile.last}`} size={88} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
            }
            <div className="tap" onClick={()=>photoInputRef.current?.click()} style={{ position:"absolute", bottom:0, right:0, width:30, height:30, borderRadius:"50%", background:G.green, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${G.cream}`, boxShadow:"0 2px 6px rgba(0,0,0,.2)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => setProfile(p=>({...p, photo: ev.target.result}));
              reader.readAsDataURL(file);
            }} />
          </div>
          <div style={{ fontSize:12, color:G.greenMid, fontWeight:600, marginTop:8 }}>Tap to change photo</div>
        </div>

        {/* Personal Info */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Personal Info</div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><Field label="First Name" value={profile.first} onChange={e=>setProfile(p=>({...p,first:e.target.value}))} /></div>
            <div style={{ flex:1 }}><Field label="Last Name" value={profile.last} onChange={e=>setProfile(p=>({...p,last:e.target.value}))} /></div>
          </div>
          <Field label="Age" value={profile.age} onChange={e=>setProfile(p=>({...p,age:e.target.value.replace(/\D/g,"").slice(0,2)}))} />
        </div>

        {/* Contact */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Contact</div>
          <Field label="Email" type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} />
          <Field label="Phone" type="tel" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} />
          <Field label="Zip Code" value={profile.zip} onChange={e=>setProfile(p=>({...p,zip:e.target.value.replace(/\D/g,"").slice(0,5)}))} />
        </div>

        {/* Bio */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>About You</div>
          <Field label="Bio" value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value.slice(0,200)}))} rows={4} placeholder="Tell neighbors a bit about yourself..." />
          <div style={{ textAlign:"right", fontSize:11, color:profile.bio.length>180?G.red:G.muted, marginTop:-8 }}>{profile.bio.length}/200</div>
        </div>

        {/* Skills */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:4 }}>Skills & Interests</div>
          <div style={{ fontSize:12, color:G.muted, marginBottom:12 }}>Select categories you can work</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {CATEGORIES.map(c=>{
              const active=selSkills.includes(c.id);
              return <div key={c.id} className="tap" onClick={()=>togSkill(c.id)} style={{ padding:"8px 14px", borderRadius:12, fontSize:12, fontWeight:600, background:active?G.greenPale:G.sand, color:active?G.green:G.muted, border:`1.5px solid ${active?G.green:G.border}`, transition:"all .15s" }}>{active?"✓ ":""}{c.label}</div>;
            })}
          </div>
          {selSkills.includes("other") && (
            <input
              value={customSkill}
              onChange={e=>setCustomSkill(e.target.value)}
              placeholder="Describe your skill (e.g. Tile installation, Piano lessons...)"
              style={{ width:"100%", marginTop:10, padding:"11px 14px", borderRadius:12, border:`1.5px solid ${G.greenLight}`, fontSize:13, background:G.cream, boxSizing:"border-box", outline:"none" }}
            />
          )}
        </div>

        {/* Verification */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Verification</div>
          {[
            { label:"Identity Verified", sub:"Government ID confirmed", status:"Verified" },
            { label:"Background Check", sub:"Optional — builds trust with posters", action:"Start" },
            { label:"CPR Certification", sub:"Upload your certificate", action:"Upload" },
          ].map((v,i,a)=>(
            <div key={v.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:i<a.length-1?`1px solid ${G.border}`:"none" }}>
              <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14 }}>{v.label}</div><div style={{ fontSize:12, color:G.muted, marginTop:1 }}>{v.sub}</div></div>
              {v.status
                ? <div style={{ background:G.greenPale, borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700, color:G.green }}>{v.status}</div>
                : <div className="tap" style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>{v.action} →</div>
              }
            </div>
          ))}
        </div>

        {/* Fixed save bar */}
        <div style={{ position:"fixed", bottom:60, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"12px 20px", background:"rgba(255,255,255,.92)", backdropFilter:"blur(12px)", zIndex:40, boxSizing:"border-box" }}>
          {saved
            ? <div className="fade" style={{ textAlign:"center", padding:14, borderRadius:16, background:G.greenPale, fontWeight:700, fontSize:14, color:G.green, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Profile saved successfully!
              </div>
            : <Btn onClick={()=>{setSaved(true);setTimeout(()=>{setSaved(false);setSubPage(null);},1400);}} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>Save Changes</Btn>
          }
        </div>
      </div>
    );
  }

  // ── CHANGE PASSWORD SUB-PAGE ──
  // ── HELP CENTER ──
  if (subPage==="helpCenter") {
    const faqs = [
      { q:"How do I get paid?", a:"Once a job is marked complete and both you and the poster confirm, funds are released from escrow directly to your linked bank account or debit card. Payouts typically arrive within 1–2 business days. Instant payout (for a small $0.50 fee) is available in Payments settings." },
      { q:"What is escrow and why does Chores use it?", a:"Escrow means the poster's payment is held securely by Chores before the job starts — not by you or them. This protects workers from non-payment and gives posters confidence their money is safe until the job is done. Neither party can touch the funds until both confirm completion." },
      { q:"How do I apply for a job?", a:"Tap any job listing on the Home screen, then tap 'Quick Apply'. You can add a short message to introduce yourself. The poster will review applications and either accept or decline. You'll get a notification either way." },
      { q:"What happens if a poster cancels?", a:"If a poster cancels within 24 hours of the scheduled time, you receive a $5 cancellation credit. If they cancel after you've already arrived, you're entitled to 50% of the agreed pay, released automatically from escrow." },
      { q:"Can I cancel a job I accepted?", a:"Yes, but repeated cancellations will affect your rating and may result in a strike. Cancel at least 24 hours in advance when possible. Three strikes in 90 days can lead to account suspension. You can see your strike count on your Profile tab." },
      { q:"How does identity verification work?", a:"We use Stripe Identity to verify government-issued IDs. This protects everyone on the platform. Verified workers get a badge on their profile which increases their chances of being hired. Verification takes 1–3 minutes and your ID is never stored by Chores." },
      { q:"What if there's a dispute?", a:"If you and the poster disagree about whether a job was completed, either party can open a dispute from the Payments screen. Our team reviews evidence (photos, messages) within 24 hours and makes a final decision on escrow release." },
      { q:"How are ratings calculated?", a:"Your rating is the average of all reviews you've received, rounded to one decimal. Posters rate workers after job completion, and workers can rate posters too. You need at least 3 reviews before a public rating appears on your profile." },
      { q:"Is my personal information safe?", a:"Yes. We never sell your data or share it with advertisers. Your exact address is never shown to other users — only your general neighborhood. See our Privacy Policy for full details." },
      { q:"How do I delete my account?", a:"Go to Profile → Account → scroll to the bottom and tap 'Delete Account'. You'll be asked to type DELETE to confirm. All your data is permanently removed within 30 days per our data retention policy." },
    ];
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Help Center</div>
        </div>
        <div style={{ background:`linear-gradient(135deg,${G.green},${G.greenLight})`, borderRadius:18, padding:"20px 20px", marginBottom:20, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>👋</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800, color:"#fff" }}>How can we help?</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.8)", marginTop:6 }}>Browse answers to the most common questions below</div>
        </div>
        <div style={{ background:G.white, borderRadius:18, boxShadow:"0 2px 10px rgba(0,0,0,.06)", overflow:"hidden", marginBottom:16 }}>
          {faqs.map((f,i)=>(
            <div key={i} style={{ borderBottom:i<faqs.length-1?`1px solid ${G.border}`:"none" }}>
              <div className="tap" onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px" }}>
                <div style={{ fontSize:14, fontWeight:600, color:G.text, flex:1, paddingRight:12 }}>{f.q}</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform:openFaq===i?"rotate(180deg)":"rotate(0)", transition:"transform .2s", flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openFaq===i&&(
                <div style={{ padding:"0 16px 14px", fontSize:13, color:G.muted, lineHeight:1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", textAlign:"center" }}>
          <div style={{ fontSize:13, color:G.muted, marginBottom:12 }}>Still have questions?</div>
          <Btn onClick={()=>setSubPage("contactSupport")} style={{ width:"100%", padding:12, borderRadius:12 }}>Contact Support</Btn>
        </div>
      </div>
    );
  }

  // ── CONTACT SUPPORT ──
  if (subPage==="contactSupport") {
    const categories = ["Payment issue","Job dispute","Account problem","Verification help","Safety concern","Other"];
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Contact Support</div>
        </div>
        {csSent ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.green, marginBottom:8 }}>Message sent!</div>
            <div style={{ fontSize:14, color:G.muted, lineHeight:1.6 }}>Our team typically responds within 24 hours. Check your email at <span style={{ fontWeight:700, color:G.text }}>{profile.email}</span> for a reply.</div>
            <Btn onClick={()=>{ setCsSent(false); setCsSubject(""); setCsMessage(""); setCsCategory(""); setSubPage(null); }} style={{ marginTop:24, padding:"12px 32px" }}>Done</Btn>
          </div>
        ) : (
          <>
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Category</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:4 }}>
                {categories.map(c=>(
                  <div key={c} className="tap" onClick={()=>setCsCategory(c)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, background:csCategory===c?G.green:G.sand, color:csCategory===c?"#fff":G.muted, border:`1.5px solid ${csCategory===c?G.green:G.border}` }}>{c}</div>
                ))}
              </div>
            </div>
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Subject</div>
              <input value={csSubject} onChange={e=>setCsSubject(e.target.value)} placeholder="Brief description of your issue" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", background:G.cream, outline:"none", boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
            </div>
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Message</div>
              <textarea value={csMessage} onChange={e=>setCsMessage(e.target.value)} rows={6} placeholder="Describe your issue in detail. Include any relevant job IDs, dates, or names to help us resolve it faster." style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", resize:"none", background:G.cream, outline:"none", lineHeight:1.6, boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
              <div style={{ fontSize:11, color:G.muted, marginTop:6 }}>Replies go to {profile.email}</div>
            </div>
            <Btn onClick={()=>{ if(csSubject&&csMessage&&csCategory) setCsSent(true); }} disabled={!csSubject||!csMessage||!csCategory} style={{ width:"100%", padding:14, borderRadius:14, opacity:csSubject&&csMessage&&csCategory?1:.5 }}>Send Message</Btn>
          </>
        )}
      </div>
    );
  }

  // ── REPORT BUG ──
  if (subPage==="reportBug") {
    const bugTypes = ["App crash","UI glitch","Payment error","Login issue","Map problem","Notification issue","Other"];
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Report a Bug</div>
        </div>
        {bugSent ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🐛</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.green, marginBottom:8 }}>Bug reported!</div>
            <div style={{ fontSize:14, color:G.muted, lineHeight:1.6 }}>Thanks for helping us improve Chores. Our engineering team will investigate and may follow up at <span style={{ fontWeight:700, color:G.text }}>{profile.email}</span>.</div>
            <Btn onClick={()=>{ setBugSent(false); setBugType(""); setBugDesc(""); setBugSteps(""); setSubPage(null); }} style={{ marginTop:24, padding:"12px 32px" }}>Done</Btn>
          </div>
        ) : (
          <>
            <div style={{ background:"#FFF3CD", borderRadius:14, padding:"12px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#856404" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div style={{ fontSize:12, color:"#856404", lineHeight:1.5 }}>For urgent payment issues or safety concerns, please use <span className="tap" style={{ fontWeight:700, textDecoration:"underline" }} onClick={()=>setSubPage("contactSupport")}>Contact Support</span> for a faster response.</div>
            </div>
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Bug Type</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {bugTypes.map(b=>(
                  <div key={b} className="tap" onClick={()=>setBugType(b)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, background:bugType===b?G.red:G.sand, color:bugType===b?"#fff":G.muted, border:`1.5px solid ${bugType===b?G.red:G.border}` }}>{b}</div>
                ))}
              </div>
            </div>
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>What happened?</div>
              <textarea value={bugDesc} onChange={e=>setBugDesc(e.target.value)} rows={4} placeholder="Describe the bug. What did you expect to happen vs. what actually happened?" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", resize:"none", background:G.cream, outline:"none", lineHeight:1.6, boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
            </div>
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Steps to reproduce <span style={{ fontWeight:400, textTransform:"none" }}>(optional)</span></div>
              <textarea value={bugSteps} onChange={e=>setBugSteps(e.target.value)} rows={3} placeholder={"1. Tap on...\n2. Then tap...\n3. Bug appears"} style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", resize:"none", background:G.cream, outline:"none", lineHeight:1.6, boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
            </div>
            <Btn onClick={()=>{ if(bugType&&bugDesc) setBugSent(true); }} disabled={!bugType||!bugDesc} style={{ width:"100%", padding:14, borderRadius:14, opacity:bugType&&bugDesc?1:.5 }}>Submit Bug Report</Btn>
          </>
        )}
      </div>
    );
  }

  // ── SUGGEST FEATURE ──
  if (subPage==="suggestFeature") {
    const areas = ["Job discovery","Payments","Messaging","Profile","Map","Notifications","Safety","Scheduling","Other"];
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Suggest a Feature</div>
        </div>
        {featSent ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>💡</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.green, marginBottom:8 }}>Idea received!</div>
            <div style={{ fontSize:14, color:G.muted, lineHeight:1.6 }}>We read every suggestion. If your idea gets built, you'll be the first to know. Thanks for helping shape Chores.</div>
            <Btn onClick={()=>{ setFeatSent(false); setFeatArea(""); setFeatDesc(""); setSubPage(null); }} style={{ marginTop:24, padding:"12px 32px" }}>Done</Btn>
          </div>
        ) : (
          <>
            <div style={{ background:`linear-gradient(135deg,#FFF9E6,#FFFBF0)`, borderRadius:14, padding:"14px 16px", marginBottom:16, border:"1px solid #FFE082" }}>
              <div style={{ fontSize:13, color:"#7B5E00", lineHeight:1.6 }}>We genuinely love hearing ideas from the people who use Chores every day. Your suggestions directly shape what we build next.</div>
            </div>
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Feature Area</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {areas.map(a=>(
                  <div key={a} className="tap" onClick={()=>setFeatArea(a)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, background:featArea===a?G.gold:G.sand, color:featArea===a?"#fff":G.muted, border:`1.5px solid ${featArea===a?G.gold:G.border}` }}>{a}</div>
                ))}
              </div>
            </div>
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Describe your idea</div>
              <textarea value={featDesc} onChange={e=>setFeatDesc(e.target.value)} rows={6} placeholder="What would you like Chores to do? How would it work? Why would it help you?" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", resize:"none", background:G.cream, outline:"none", lineHeight:1.6, boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
            </div>
            <Btn onClick={()=>{ if(featArea&&featDesc) setFeatSent(true); }} disabled={!featArea||!featDesc} style={{ width:"100%", padding:14, borderRadius:14, opacity:featArea&&featDesc?1:.5 }}>Submit Idea</Btn>
          </>
        )}
      </div>
    );
  }

  // ── TERMS OF SERVICE ──
  if (subPage==="terms") {
    const sections = [
      { title:"1. Acceptance of Terms", body:"By creating an account or using Chores, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the app. These terms apply to all users — both workers and job posters." },
      { title:"2. Eligibility", body:"You must be at least 18 years old to use Chores. By using the app, you confirm that you are 18 or older and legally capable of entering into binding agreements. We may require identity verification to confirm eligibility." },
      { title:"3. User Accounts", body:"You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration and to update it as needed. You may not share your account or use another person's account." },
      { title:"4. The Chores Platform", body:"Chores is a marketplace that connects people who need tasks done (posters) with people willing to do them (workers). Chores is not an employer of any worker. Workers are independent contractors solely responsible for their own taxes, insurance, and compliance with applicable laws." },
      { title:"5. Escrow & Payments", body:"All payments between posters and workers are held in escrow by Chores until both parties confirm job completion. Chores charges a 8% platform fee on all transactions, deducted from worker payouts. Poster payments are non-refundable once a job begins unless a dispute is successfully resolved in the poster's favor." },
      { title:"6. Disputes", body:"In the event of a dispute, both parties must submit evidence through the app within 48 hours. Chores will review the evidence and make a final, binding determination on escrow release within 24–72 hours. Chores reserves the right to refund, withhold, or split escrow based on its review." },
      { title:"7. Prohibited Conduct", body:"Users may not: post false or misleading job listings; harass, threaten, or discriminate against other users; use the platform for illegal activities; create fake accounts or manipulate ratings; solicit payments outside the Chores platform to avoid fees. Violations may result in immediate account suspension." },
      { title:"8. Safety", body:"Chores does not conduct background checks on all users. You interact with other users at your own risk. We strongly recommend meeting in public first for large jobs, trusting your instincts, and reporting any safety concerns immediately. Chores is not liable for personal injury, property damage, or theft arising from jobs arranged through the platform." },
      { title:"9. Termination", body:"Either party may terminate this agreement at any time. Chores may suspend or permanently ban accounts for violations of these terms without prior notice. Upon termination, your access to the app will be revoked and any pending escrow may be held pending investigation." },
      { title:"10. Limitation of Liability", body:"To the maximum extent permitted by law, Chores shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including lost earnings, property damage, or data loss. Our total liability to you will not exceed the fees you paid to Chores in the 90 days prior to the claim." },
      { title:"11. Changes to Terms", body:"We may update these Terms at any time. We'll notify you via email or in-app notification at least 7 days before material changes take effect. Continued use of Chores after changes constitutes acceptance of the new terms." },
      { title:"12. Governing Law", body:"These Terms are governed by the laws of the State of Illinois, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Cook County, Illinois, or through binding arbitration as elected by Chores." },
    ];
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Terms of Service</div>
        </div>
        <div style={{ background:G.white, borderRadius:14, padding:"10px 16px", marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
          <div style={{ fontSize:11, color:G.muted }}>Last updated: January 1, 2025 · Effective: January 1, 2025</div>
        </div>
        <div style={{ background:G.white, borderRadius:18, boxShadow:"0 2px 10px rgba(0,0,0,.06)", overflow:"hidden", marginBottom:16 }}>
          {sections.map((s,i)=>(
            <div key={i} style={{ borderBottom:i<sections.length-1?`1px solid ${G.border}`:"none" }}>
              <div className="tap" onClick={()=>setOpenSec(openSec===i?null:i)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px" }}>
                <div style={{ fontSize:13, fontWeight:700, color:G.text, flex:1, paddingRight:12 }}>{s.title}</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform:openSec===i?"rotate(180deg)":"rotate(0)", transition:"transform .2s", flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openSec===i&&(
                <div style={{ padding:"0 16px 14px", fontSize:13, color:G.muted, lineHeight:1.7 }}>{s.body}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, color:G.muted, textAlign:"center", lineHeight:1.6 }}>Questions about our terms? <span className="tap" style={{ color:G.greenMid, fontWeight:700 }} onClick={()=>setSubPage("contactSupport")}>Contact Support →</span></div>
      </div>
    );
  }

  // ── COMMUNITY GUIDELINES ──
  if (subPage==="guidelines") {
    const rules = [
      { icon:"🤝", title:"Be Respectful", body:"Treat every person on Chores with the same respect you'd want for yourself. Harassment, hate speech, discrimination based on race, gender, religion, sexuality, disability, or background will result in immediate account removal. This includes in-app messages, reviews, and job descriptions." },
      { icon:"✅", title:"Be Honest", body:"Post accurate job descriptions, including realistic pay, time estimates, and what's required. Workers should only apply for jobs they genuinely intend to complete and are capable of doing. Fake profiles, inflated ratings, or misleading information violate our trust principles." },
      { icon:"🔒", title:"Keep Payments On-Platform", body:"All payment arrangements must go through Chores escrow. Soliciting or accepting payment outside the app to avoid platform fees is a violation that can result in permanent bans for both parties. Our escrow system exists to protect everyone." },
      { icon:"📍", title:"Show Up", body:"When you accept a job or hire a worker, you're making a commitment. Repeated no-shows, last-minute cancellations, or ghosting without communication harm the community and your reputation. Strikes are issued for verified no-shows." },
      { icon:"⭐", title:"Leave Honest Reviews", body:"Reviews help the community make good decisions. Leave reviews that honestly reflect your experience. Reviewing in bad faith, trading positive reviews with friends, or threatening negative reviews to extort users are all violations." },
      { icon:"📸", title:"Appropriate Content Only", body:"Profile photos must be clear, appropriate images of yourself — no logos, cartoon characters, or inappropriate imagery. Job photos should be relevant to the task. Explicit, violent, or offensive content is not permitted anywhere on the platform." },
      { icon:"🔐", title:"Protect Privacy", body:"Do not share another user's personal information — phone numbers, addresses, or photos — outside the platform without their explicit consent. Do not attempt to contact users through channels other than Chores messaging for job-related matters." },
      { icon:"🚨", title:"Report, Don't Retaliate", body:"If someone violates these guidelines, report them through the app rather than retaliating. Our team reviews every report. False reports made to harm others are themselves a violation. We investigate all reports fairly and confidentially." },
      { icon:"⚖️", title:"No Illegal Activity", body:"Chores may not be used to arrange, facilitate, or fund any illegal activity. This includes unlicensed contractor work requiring permits, jobs involving controlled substances, and any activity prohibited by local, state, or federal law." },
      { icon:"👶", title:"No Minors", body:"Users must be 18 or older. If you believe a minor is using the platform, report it immediately. Jobs involving the care of children must be performed with the knowledge and consent of the child's parent or legal guardian." },
    ];
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Community Guidelines</div>
        </div>
        <div style={{ background:`linear-gradient(135deg,${G.green},${G.greenLight})`, borderRadius:18, padding:"18px 20px", marginBottom:20 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:800, color:"#fff", marginBottom:6 }}>Chores is built on trust.</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.85)", lineHeight:1.6 }}>These guidelines protect everyone in our community. Violations are taken seriously — from warnings to permanent bans depending on severity.</div>
        </div>
        <div style={{ background:G.white, borderRadius:18, boxShadow:"0 2px 10px rgba(0,0,0,.06)", overflow:"hidden", marginBottom:16 }}>
          {rules.map((r,i)=>(
            <div key={i} style={{ borderBottom:i<rules.length-1?`1px solid ${G.border}`:"none" }}>
              <div className="tap" onClick={()=>setOpenRule(openRule===i?null:i)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px" }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{r.icon}</span>
                <div style={{ fontSize:14, fontWeight:700, color:G.text, flex:1 }}>{r.title}</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform:openRule===i?"rotate(180deg)":"rotate(0)", transition:"transform .2s", flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openRule===i&&(
                <div style={{ padding:"0 16px 14px 52px", fontSize:13, color:G.muted, lineHeight:1.7 }}>{r.body}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ background:"#FFF3F3", borderRadius:14, padding:"12px 16px", border:"1px solid #FFCCCC", marginBottom:16 }}>
          <div style={{ fontSize:13, color:"#B91C1C", lineHeight:1.6 }}>Witnessed a violation? Use the Report button on any profile or job listing. Reports are reviewed within 24 hours.</div>
        </div>
        <div style={{ fontSize:12, color:G.muted, textAlign:"center" }}>Last updated: January 1, 2025</div>
      </div>
    );
  }

  // ── PRIVACY POLICY ──
  if (subPage==="privacyPolicy") {
    const sections = [
      { title:"1. Information We Collect", body:"We collect information you provide directly: name, email, phone number, date of birth, and profile photo. We collect payment information via Stripe (we never store card numbers). We collect usage data including jobs viewed, applied for, and completed, along with device type and approximate location (zip code level unless you enable exact location)." },
      { title:"2. How We Use Your Information", body:"We use your information to: match you with nearby jobs or workers; process payments and maintain escrow; send notifications about jobs, applications, and payments; improve our platform and detect fraud; comply with legal obligations. We never use your data to serve third-party ads." },
      { title:"3. Location Data", body:"We use your zip code to show you nearby jobs. If you enable 'Show Exact Location' in Privacy settings, your precise GPS coordinates are used for more accurate matching and map display. Exact location is never shown to other users — only approximate neighborhood. You can revoke location permissions at any time in your device settings." },
      { title:"4. Data Sharing", body:"We do not sell your personal data. We share data only with: Stripe (payment processing), Resend (transactional email), and where required by law. We may share aggregated, anonymized data with partners. Workers' names and ratings are visible to posters; posters' names and ratings are visible to workers." },
      { title:"5. Identity Verification", body:"If you complete identity verification, your government ID is processed by Stripe Identity and is not stored by Chores. Stripe retains this data per their privacy policy. We only receive a verification status (verified/not verified) and the name on your ID." },
      { title:"6. Data Retention", body:"We retain your account data for as long as your account is active. If you delete your account, we permanently delete your personal data within 30 days, except where retention is required by law (e.g., financial transaction records, which are kept for 7 years)." },
      { title:"7. Your Rights", body:"You have the right to: access your personal data (request via Support); correct inaccurate data (edit in your profile); delete your data (Settings → Account → Delete Account); opt out of marketing emails (Settings → Privacy); request a copy of your data (Settings → Privacy → Download My Data)." },
      { title:"8. Security", body:"We use industry-standard encryption (TLS/HTTPS) for all data in transit. Passwords are hashed using bcrypt. Payment data is tokenized via Stripe. We conduct regular security audits. However, no system is 100% secure — report any suspected breaches to security@choresnearme.com." },
      { title:"9. Children's Privacy", body:"Chores is not intended for users under 18. We do not knowingly collect data from minors. If we discover a minor has created an account, we will immediately delete the account and all associated data." },
      { title:"10. Changes to This Policy", body:"We may update this Privacy Policy periodically. We will notify you via email or in-app notification before material changes take effect. Continued use of the app constitutes acceptance of the updated policy." },
      { title:"11. Contact", body:"For privacy-related questions or to exercise your rights, contact us at privacy@choresnearme.com or through the Contact Support page in this app. We respond to all privacy requests within 30 days." },
    ];
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Privacy Policy</div>
        </div>
        <div style={{ background:G.white, borderRadius:14, padding:"10px 16px", marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
          <div style={{ fontSize:11, color:G.muted }}>Last updated: January 1, 2025 · We do not sell your data.</div>
        </div>
        <div style={{ background:G.white, borderRadius:18, boxShadow:"0 2px 10px rgba(0,0,0,.06)", overflow:"hidden", marginBottom:16 }}>
          {sections.map((s,i)=>(
            <div key={i} style={{ borderBottom:i<sections.length-1?`1px solid ${G.border}`:"none" }}>
              <div className="tap" onClick={()=>setOpenSec(openSec===i?null:i)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px" }}>
                <div style={{ fontSize:13, fontWeight:700, color:G.text, flex:1, paddingRight:12 }}>{s.title}</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform:openSec===i?"rotate(180deg)":"rotate(0)", transition:"transform .2s", flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {openSec===i&&(
                <div style={{ padding:"0 16px 14px", fontSize:13, color:G.muted, lineHeight:1.7 }}>{s.body}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, color:G.muted, textAlign:"center" }}>Questions? <span className="tap" style={{ color:G.greenMid, fontWeight:700 }} onClick={()=>setSubPage("contactSupport")}>Contact Support →</span></div>
      </div>
    );
  }

  if (subPage==="changeZip") {
    const lookupZip = (val) => {
      setZipCity(null);
      if (val.length===5) {
        fetch(`https://api.zippopotam.us/us/${val}`)
          .then(r=>r.ok?r.json():null)
          .then(d=>{ if(d) setZipCity({ city:d.places[0]["place name"], state:d.places[0]["state abbreviation"] }); })
          .catch(()=>{});
      }
    };
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Service Zip Code</div>
        </div>
        <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>Your Zip Code</div>
          <input
            type="tel" maxLength={5} value={zipInput}
            onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,5); setZipInput(v); lookupZip(v); }}
            placeholder="Enter 5-digit zip"
            style={{ width:"100%", padding:"16px 18px", borderRadius:14, border:`2px solid ${zipCity?G.greenLight:G.border}`, fontSize:28, fontWeight:800, fontFamily:"'Playfair Display',serif", textAlign:"center", background:G.cream, outline:"none", letterSpacing:4, color:G.greenMid, boxSizing:"border-box" }}
          />
          {zipInput.length===5 && (
            <div style={{ marginTop:10, textAlign:"center", fontSize:14, fontWeight:600, color:zipCity?G.greenMid:G.muted }}>
              {zipCity ? `📍 ${zipCity.city}, ${zipCity.state}` : "Looking up..."}
            </div>
          )}
        </div>
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Common Zips</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {["60647","60614","60657","60610","60622","60618","60625"].map(z=>(
              <div key={z} className="tap" onClick={()=>{ setZipInput(z); lookupZip(z); }} style={{ padding:"6px 14px", borderRadius:10, fontSize:13, fontWeight:600, background:zipInput===z?G.greenPale:G.sand, color:zipInput===z?G.green:G.muted, border:`1.5px solid ${zipInput===z?G.green:G.border}` }}>{z}</div>
            ))}
          </div>
        </div>
        {zipSaved
          ? <div style={{ textAlign:"center", padding:"16px 0" }}><div style={{ fontSize:36, marginBottom:8 }}>✅</div><div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800, color:G.green }}>Zip updated!</div></div>
          : <Btn onClick={()=>{ if(zipInput.length===5){ setProfile(p=>({...p,zip:zipInput})); if(onUpdateZip) onUpdateZip(zipInput); setZipSaved(true); setTimeout(()=>{ setZipSaved(false); setSubPage(null); },1400); }}} disabled={zipInput.length!==5} style={{ width:"100%", padding:14, borderRadius:14, opacity:zipInput.length===5?1:.5 }}>Save Zip Code</Btn>
        }
      </div>
    );
  }

  if (subPage==="changePassword") {
    const PwField = ({ label, value, onChange, placeholder="" }) => {
      const [show,setShow] = useState(false);
      return (
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>
          <div style={{ position:"relative" }}>
            <input type={show?"text":"password"} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"13px 44px 13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", background:G.white, outline:"none", boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
            <div className="tap" onClick={()=>setShow(!show)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{show?<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>:<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>}</svg>
            </div>
          </div>
        </div>
      );
    };
    const handleSave = () => {
      setPwError("");
      if (!pwFields.current) { setPwError("Enter your current password"); return; }
      if (pwFields.newPw.length<8) { setPwError("New password must be at least 8 characters"); return; }
      if (pwFields.newPw!==pwFields.confirm) { setPwError("Passwords do not match"); return; }
      setPwSaved(true);
      setTimeout(()=>{ setPwSaved(false); setPwFields({current:"",newPw:"",confirm:""}); setSubPage(null); },1400);
    };
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>{setSubPage(null);setPwError("");setPwFields({current:"",newPw:"",confirm:""});}} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Change Password</div>
        </div>

        <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:16 }}>
          <PwField label="Current Password" value={pwFields.current} onChange={e=>setPwFields(p=>({...p,current:e.target.value}))} placeholder="Enter current password" />
          <PwField label="New Password" value={pwFields.newPw} onChange={e=>setPwFields(p=>({...p,newPw:e.target.value}))} placeholder="At least 8 characters" />
          <PwField label="Confirm New Password" value={pwFields.confirm} onChange={e=>setPwFields(p=>({...p,confirm:e.target.value}))} placeholder="Re-enter new password" />
          {pwError&&<div style={{ color:"#dc3545", fontSize:13, fontWeight:600, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {pwError}
          </div>}
          {pwSaved
            ? <div style={{ textAlign:"center", padding:14, borderRadius:14, background:"#dcfce7", color:G.green, fontWeight:700, fontSize:14 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M20 6L9 17l-5-5"/></svg>
                Password Updated!
              </div>
            : <Btn onClick={handleSave} style={{ width:"100%", padding:14, borderRadius:14, fontSize:15 }}>Update Password</Btn>
          }
        </div>

        <div style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize:12, fontWeight:700, color:G.muted, marginBottom:8 }}>Password Tips</div>
          {["Use a mix of letters, numbers & symbols","Don't reuse passwords from other sites","Consider using a password manager"].map((t,i)=>(
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i<2?6:0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop:2, flexShrink:0 }}><path d="M20 6L9 17l-5-5"/></svg>
              <div style={{ fontSize:13, color:G.muted }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── PAYMENT METHODS SUB-PAGE ──
  // Stripe Integration Ready — uses Stripe Elements pattern for PCI compliance.
  // To activate: install @stripe/stripe-js and @stripe/react-stripe-js,
  // replace STRIPE_PUBLISHABLE_KEY with your real key, and create backend
  // endpoints for /create-setup-intent, /payment-methods, /set-default, /detach.
  // The UI below simulates the Stripe flow. Card data never touches our code —
  // Stripe's secure iframe handles collection and returns a PaymentMethod token.
  if (subPage==="paymentMethods") {
    const STRIPE_READY = true; // ✅ Stripe is wired
    const cards = pmCards, setCards = setPmCards;
    const adding = pmAdding, setAdding = setPmAdding;
    const processing = pmProcessing, setProcessing = setPmProcessing;
    const addSuccess = pmAddSuccess, setAddSuccess = setPmAddSuccess;
    const error = pmError, setError = setPmError;

    const brandLabels = { visa:"Visa", mastercard:"Mastercard", amex:"Amex", discover:"Discover", unknown:"Card" };
    const brandColors = { visa:"#1a1f71", mastercard:"#eb001b", amex:"#006fcf", discover:"#ff6000" };

    // ── Stripe API helpers (replace with real fetch calls to your backend) ──
    const apiSetDefault = async (pmId) => {
      // POST /api/set-default-payment-method { paymentMethodId: pmId }
      setCards(c=>c.map(x=>({...x,isDefault:x.id===pmId})));
    };
    const apiDetach = async (pmId) => {
      // POST /api/detach-payment-method { paymentMethodId: pmId }
      const c = cards.filter(x=>x.id!==pmId);
      if (c.length && !c.some(x=>x.isDefault)) c[0].isDefault = true;
      setCards(c);
    };
    // When Stripe is wired, this would:
    // - Call backend POST /api/create-setup-intent to get clientSecret
    // - stripe.confirmCardSetup with clientSecret and card element
    // - On success, fetch updated payment methods list from backend
    const handleStripeAdd = async () => {
      setError("");
      setProcessing(true);
      const ref = window._settingsStripeRef;
      if (!ref) {
        setError("Stripe is still loading, please wait.");
        setProcessing(false);
        return;
      }
      const { stripe, card: cardEl } = ref;
      const result = await stripe.createPaymentMethod({ type: "card", card: cardEl });
      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
        return;
      }
      const pm = result.paymentMethod;
      const newCard = {
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
        isDefault: !cards.length,
      };
      setCards(c => [...c, newCard]);
      // ── Send pm.id to your backend to attach to a Stripe Customer ──
      // e.g. POST /api/attach-payment-method { paymentMethodId: pm.id, customerId }
      setProcessing(false);
      setAddSuccess(true);
      setTimeout(() => { setAddSuccess(false); setAdding(false); }, 1400);
    };

    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Payment Methods</div>
        </div>

        {/* Existing cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
          {cards.map(c=>{
            const label = brandLabels[c.brand]||"Card";
            return (
              <div key={c.id} style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", border:c.isDefault?`2px solid ${G.green}`:`1.5px solid ${G.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  {/* Brand icon */}
                  <div style={{ width:48, height:32, borderRadius:8, background:c.isDefault?G.greenPale:G.sand, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                    <div style={{ fontWeight:900, fontSize:10, color:brandColors[c.brand]||G.text, letterSpacing:-.5, textTransform:"uppercase" }}>{label}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{label} •••• {c.last4}</div>
                    <div style={{ fontSize:12, color:G.muted }}>Expires {String(c.exp_month).padStart(2,"0")}/{String(c.exp_year).slice(-2)}</div>
                  </div>
                  {c.isDefault&&<div style={{ background:G.greenPale, color:G.green, fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:8 }}>Default</div>}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {!c.isDefault&&<div className="tap" onClick={()=>apiSetDefault(c.id)} style={{ fontSize:12, fontWeight:700, color:G.greenMid }}>Set Default</div>}
                  {!c.isDefault&&<div style={{ color:G.border }}>·</div>}
                  {cards.length>1&&<div className="tap" onClick={()=>apiDetach(c.id)} style={{ fontSize:12, fontWeight:700, color:G.red }}>Remove</div>}
                </div>
                <div style={{ fontSize:10, color:G.muted, marginTop:8, fontFamily:"monospace" }}>id: {c.id}</div>
              </div>
            );
          })}
        </div>

        {/* Add card — Stripe Elements zone */}
        {adding ? (
          <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Add New Card
            </div>

            {/* Real Stripe Card Element */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>Card Details</label>
              <StripeCardInput onReady={(ref)=>{ window._settingsStripeRef = ref; }} />
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span style={{ fontSize:11, color:G.muted }}>Secured by Stripe · PCI-DSS Level 1</span>
              </div>
            </div>

            {error&&<div style={{ color:G.red, fontSize:13, fontWeight:600, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>}

            {addSuccess ? (
              <div style={{ textAlign:"center", padding:14, borderRadius:14, background:"#dcfce7", color:G.green, fontWeight:700, fontSize:14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M20 6L9 17l-5-5"/></svg>
                Card Added!
              </div>
            ) : (
              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={()=>{setAdding(false);setError("");}} variant="ghost" style={{ flex:1, padding:12, borderRadius:14 }}>Cancel</Btn>
                <Btn onClick={handleStripeAdd} disabled={processing} style={{ flex:2, padding:12, borderRadius:14 }}>
                  {processing ? (
                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <span style={{ width:16, height:16, border:`2px solid rgba(255,255,255,.3)`, borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .6s linear infinite" }}/>
                      Verifying…
                    </span>
                  ) : "Add Card"}
                </Btn>
              </div>
            )}

            {/* Integration code reference */}
            <div style={{ marginTop:16, background:G.sand, borderRadius:12, padding:14, fontSize:11, fontFamily:"'Courier New',monospace", color:G.muted, lineHeight:1.7 }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:11, color:G.text, marginBottom:6 }}>Integration Steps:</div>
              <div>1. <span style={{ color:G.greenMid }}>stripe.confirmCardSetup</span>(clientSecret)</div>
              <div>2. Returns <span style={{ color:G.greenMid }}>paymentMethod.id</span> (pm_xxx)</div>
              <div>3. Attach to <span style={{ color:G.greenMid }}>Customer</span> on backend</div>
              <div>4. Charge via <span style={{ color:G.greenMid }}>PaymentIntent</span> at checkout</div>
            </div>
          </div>
        ) : (
          <div className="tap" onClick={()=>setAdding(true)} style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", alignItems:"center", gap:12, border:`1.5px dashed ${G.border}` }}>
            <div style={{ width:40, height:40, borderRadius:12, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div style={{ fontWeight:600, fontSize:14, color:G.muted }}>Add Payment Method</div>
          </div>
        )}

        {/* How it works */}
        <div style={{ background:G.greenPale, borderRadius:14, padding:14, marginTop:16, border:`1px solid ${G.greenLight}` }}>
          <div style={{ fontWeight:700, fontSize:12, color:G.greenMid, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            How Stripe Keeps You Safe
          </div>
          {[
            "Card numbers are collected in Stripe's secure iframe",
            "Your data never touches our servers (PCI-DSS Level 1)",
            "Stripe returns a token — we only store the token ID",
            "Tokens can be revoked anytime by removing the card",
          ].map((t,i)=>(
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i<3?5:0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop:3, flexShrink:0 }}><path d="M20 6L9 17l-5-5"/></svg>
              <div style={{ fontSize:12, color:G.text, lineHeight:1.4 }}>{t}</div>
            </div>
          ))}
        </div>

        {/* Powered by Stripe badge */}
        <div style={{ textAlign:"center", marginTop:16, opacity:.5 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:8, background:G.white, border:`1px solid ${G.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            <span style={{ fontSize:11, fontWeight:600, color:G.text }}>Powered by Stripe</span>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW ALL TRANSACTIONS SUB-PAGE ──
  if (subPage==="allTransactions") {
    const filtered = txFilter==="all" ? escrowData : escrowData.filter(t=>t.status===txFilter);
    const totals = {
      all: escrowData.length,
      held: escrowData.filter(t=>t.status==="held").length,
      released: escrowData.filter(t=>t.status==="released").length,
      disputed: escrowData.filter(t=>t.status==="disputed").length,
      refunded: escrowData.filter(t=>t.status==="refunded").length,
    };
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>All Transactions</div>
        </div>

        {/* Summary row */}
        <div style={{ display:"flex", gap:8, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
          {[
            { k:"all", label:"All", color:G.text },
            { k:"held", label:"Held", color:G.gold },
            { k:"released", label:"Released", color:G.green },
            { k:"disputed", label:"Disputed", color:G.red },
            { k:"refunded", label:"Refunded", color:G.blue },
          ].map(f=>(
            <div key={f.k} className="tap" onClick={()=>setTxFilter(f.k)} style={{ padding:"8px 14px", borderRadius:12, fontSize:12, fontWeight:700, background:txFilter===f.k?f.color:"transparent", color:txFilter===f.k?"#fff":f.color, border:`1.5px solid ${txFilter===f.k?f.color:G.border}`, whiteSpace:"nowrap", transition:"all .2s" }}>
              {f.label} ({totals[f.k]})
            </div>
          ))}
        </div>

        {/* Total earned/held */}
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <div style={{ flex:1, background:G.white, borderRadius:16, padding:14, textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize:11, color:G.muted, fontWeight:600 }}>Total Released</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.greenMid, marginTop:4 }}>${escrowData.filter(t=>t.status==="released").reduce((s,t)=>s+t.workerGets,0).toFixed(2)}</div>
          </div>
          <div style={{ flex:1, background:G.white, borderRadius:16, padding:14, textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize:11, color:G.muted, fontWeight:600 }}>Currently Held</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.gold, marginTop:4 }}>${escrowData.filter(t=>t.status==="held").reduce((s,t)=>s+t.amount,0).toFixed(2)}</div>
          </div>
        </div>

        {/* Transaction list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.length===0 && <div style={{ textAlign:"center", padding:30, color:G.muted, fontSize:14 }}>No {txFilter} transactions</div>}
          {filtered.map(txn=>{
            const sc = ESCROW_STATUS[txn.status];
            return (
              <div key={txn.id} className="card tap" onClick={()=>{setSelectedTxn(txn);}} style={{ background:G.white, borderRadius:16, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", borderLeft:`3px solid ${sc.text}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:G.text, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginRight:8 }}>{txn.job}</div>
                  <span style={{ background:sc.bg, color:sc.text, fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, flexShrink:0 }}>{sc.icon} {sc.label}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:G.muted }}>
                  <span>{txn.id} · {txn.createdAt}</span>
                  <span style={{ fontWeight:700, color:G.greenMid }}>${txn.workerGets.toFixed(2)}</span>
                </div>
                <div style={{ fontSize:12, color:G.muted, marginTop:4 }}>{role==="worker"?`From ${txn.poster}`:`To ${txn.worker}`}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── BANK ACCOUNT SUB-PAGE ──
  if (subPage==="bankAccount") {
    const editing = bankEditing, setEditing = setBankEditing;
    const editFields = bankFields, setEditFields = setBankFields;
    const BField = ({ label, value, onChange, placeholder }) => (
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>
        <input value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", background:G.white, outline:"none", boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
      </div>
    );
    const handleBankSave = () => {
      if(!editFields.routing||!editFields.account) return;
      setBank({ name:editFields.bankName, last4:editFields.account.slice(-4), routing:"•••••"+editFields.routing.slice(-4), type:editFields.type, holder:editFields.holder });
      setBankSaved(true);
      setTimeout(()=>{setBankSaved(false);setEditing(false);},1200);
    };
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Bank Account</div>
        </div>

        {/* Current bank info */}
        <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
            <div style={{ width:52, height:52, borderRadius:16, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:18 }}>{bank.name}</div>
              <div style={{ fontSize:13, color:G.muted }}>{bank.type} •••• {bank.last4}</div>
            </div>
          </div>

          {[
            ["Account Holder", bank.holder],
            ["Account Type", bank.type],
            ["Account Number", `•••• •••• •••• ${bank.last4}`],
            ["Routing Number", bank.routing],
            ["Bank Name", bank.name],
            ["Status", null],
          ].map(([label, val], i) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:i<5?`1px solid ${G.border}`:"none" }}>
              <span style={{ fontSize:13, color:G.muted }}>{label}</span>
              {label==="Status"
                ? <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, fontWeight:700, color:G.green }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Verified
                  </div>
                : <span style={{ fontSize:13, fontWeight:600, color:G.text }}>{val}</span>
              }
            </div>
          ))}
        </div>

        {/* Edit form or button */}
        {editing ? (
          <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Update Bank Details
            </div>
            <BField label="Account Holder Name" value={editFields.holder} onChange={e=>setEditFields(f=>({...f,holder:e.target.value}))} placeholder="Jordan Davis" />
            <BField label="Bank Name" value={editFields.bankName} onChange={e=>setEditFields(f=>({...f,bankName:e.target.value}))} placeholder="Chase" />
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.5 }}>Account Type</label>
              <div style={{ display:"flex", gap:8 }}>
                {["Checking","Savings"].map(t=>(
                  <div key={t} className="tap" onClick={()=>setEditFields(f=>({...f,type:t}))} style={{ flex:1, padding:"10px 14px", borderRadius:12, textAlign:"center", fontSize:13, fontWeight:600, background:editFields.type===t?G.green:"transparent", color:editFields.type===t?"#fff":G.text, border:`1.5px solid ${editFields.type===t?G.green:G.border}`, transition:"all .2s" }}>{t}</div>
                ))}
              </div>
            </div>
            <BField label="Routing Number" value={editFields.routing} onChange={e=>setEditFields(f=>({...f,routing:e.target.value}))} placeholder="9 digits" />
            <BField label="Account Number" value={editFields.account} onChange={e=>setEditFields(f=>({...f,account:e.target.value}))} placeholder="Account number" />
            {bankSaved
              ? <div style={{ textAlign:"center", padding:12, borderRadius:14, background:"#dcfce7", color:G.green, fontWeight:700, fontSize:14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M20 6L9 17l-5-5"/></svg>
                  Bank Updated!
                </div>
              : <div style={{ display:"flex", gap:8 }}>
                  <Btn onClick={()=>setEditing(false)} variant="ghost" style={{ flex:1, padding:12, borderRadius:14 }}>Cancel</Btn>
                  <Btn onClick={handleBankSave} style={{ flex:2, padding:12, borderRadius:14 }}>Save Changes</Btn>
                </div>
            }
          </div>
        ) : (
          <Btn onClick={()=>setEditing(true)} variant="outline" style={{ width:"100%", padding:14, borderRadius:14, fontSize:14 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Bank Details
          </Btn>
        )}

        <div style={{ background:"#FFF7ED", borderRadius:14, padding:14, marginTop:16, border:"1px solid rgba(244,162,97,.2)", display:"flex", gap:10, alignItems:"flex-start" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>Changes to your bank account may take 1–2 business days to verify. Payouts will be paused during verification.</div>
        </div>
      </div>
    );
  }

  // ── PAYOUT SCHEDULE SUB-PAGE ──
  if (subPage==="payoutSchedule") {
    const freqs = [
      { id:"daily", label:"Daily", desc:"Every business day" },
      { id:"weekly", label:"Weekly", desc:"Once per week" },
      { id:"biweekly", label:"Bi-Weekly", desc:"Every two weeks" },
      { id:"monthly", label:"Monthly", desc:"1st of each month" },
    ];
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
    const handlePayoutSave = () => {
      setPayoutSaved(true);
      setTimeout(()=>{ setPayoutSaved(false); setSubPage(null); },1400);
    };
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Payout Schedule</div>
        </div>

        {/* Frequency */}
        <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Frequency</div>
          {freqs.map((f,i)=>(
            <div key={f.id} className="tap" onClick={()=>setPayoutFreq(f.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:i<freqs.length-1?`1px solid ${G.border}`:"none" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${payoutFreq===f.id?G.green:G.border}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                {payoutFreq===f.id&&<div style={{ width:12, height:12, borderRadius:"50%", background:G.green }} />}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:G.text }}>{f.label}</div>
                <div style={{ fontSize:12, color:G.muted }}>{f.desc}</div>
              </div>
              {payoutFreq===f.id&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
            </div>
          ))}
        </div>

        {/* Day picker (for weekly/biweekly) */}
        {(payoutFreq==="weekly"||payoutFreq==="biweekly")&&(
          <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Payout Day</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {days.map(d=>(
                <div key={d} className="tap" onClick={()=>setPayoutDay(d)} style={{ padding:"8px 14px", borderRadius:10, fontSize:13, fontWeight:600, background:payoutDay===d?G.green:"transparent", color:payoutDay===d?"#fff":G.text, border:`1.5px solid ${payoutDay===d?G.green:G.border}`, transition:"all .2s" }}>{d}</div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Summary</div>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:14, background:G.sand, borderRadius:14 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, color:G.text }}>
                {payoutFreq==="daily"?"Every business day":payoutFreq==="monthly"?"1st of each month":`Every ${payoutFreq==="biweekly"?"other ":""}${payoutDay}`}
              </div>
              <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Earnings sent to Chase •••• 7890</div>
            </div>
          </div>
        </div>

        {payoutSaved
          ? <div style={{ textAlign:"center", padding:14, borderRadius:14, background:"#dcfce7", color:G.green, fontWeight:700, fontSize:14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M20 6L9 17l-5-5"/></svg>
              Schedule Updated!
            </div>
          : <Btn onClick={handlePayoutSave} style={{ width:"100%", padding:14, borderRadius:14, fontSize:15 }}>Save Schedule</Btn>
        }
      </div>
    );
  }

  // ── BADGES & SKILLS SUB-PAGE ──
  if (subPage==="badgesSkills") {
    const BADGES = [
      { id:"first_job", icon:"🎉", label:"First Job", desc:"Complete your first job", earned:true, date:"Jan 15, 2025" },
      { id:"five_star", icon:"⭐", label:"5-Star Streak", desc:"Get 5 consecutive 5-star reviews", earned:true, date:"Feb 2, 2025" },
      { id:"speed_demon", icon:"⚡", label:"Speed Demon", desc:"Complete 3 jobs in one day", earned:true, date:"Feb 10, 2025" },
      { id:"repeat_fav", icon:"💚", label:"Repeat Favorite", desc:"Get rehired by 5 different clients", earned:true, date:"Feb 18, 2025" },
      { id:"top_earner", icon:"💰", label:"Top Earner", desc:"Earn over $1,000 total", earned:true, date:"Feb 22, 2025" },
      { id:"early_bird", icon:"🌅", label:"Early Bird", desc:"Accept a job within 1 minute of posting", earned:true, date:"Jan 28, 2025" },
      { id:"jack_trades", icon:"🔧", label:"Jack of All Trades", desc:"Complete jobs in 5+ categories", earned:true, date:"Feb 14, 2025" },
      { id:"reliable", icon:"🛡️", label:"Reliable", desc:"Zero cancellations in 30 days", earned:true, date:"Feb 25, 2025" },
      { id:"centurion", icon:"💎", label:"Centurion", desc:"Complete 100 jobs", earned:false, progress:42, goal:100 },
      { id:"superhost", icon:"👑", label:"Superhost", desc:"Maintain 4.9+ rating for 90 days", earned:false, progress:65, goal:90 },
      { id:"marathon", icon:"🏃", label:"Marathon", desc:"Work 50 hours total", earned:false, progress:38, goal:50 },
      { id:"community", icon:"🤝", label:"Community Hero", desc:"Complete 10 volunteer/discounted jobs", earned:false, progress:3, goal:10 },
    ];
    const SKILL_CATS = [
      { id:"lawn", label:"Lawn Care", level:3, jobs:18 },
      { id:"cleaning", label:"Cleaning", level:2, jobs:12 },
      { id:"moving", label:"Moving", level:2, jobs:8 },
      { id:"pets", label:"Pet Care", level:1, jobs:4 },
      { id:"painting", label:"Painting", level:1, jobs:3 },
      { id:"errands", label:"Errands", level:1, jobs:5 },
      { id:"babysitting", label:"Babysitting", level:0, jobs:0 },
      { id:"tech", label:"Tech Help", level:0, jobs:0 },
      { id:"windows", label:"Window Washing", level:0, jobs:0 },
      { id:"cooking", label:"Cooking", level:0, jobs:0 },
    ];
    const levelLabels = ["—","Beginner","Skilled","Expert"];
    const levelColors = ["transparent",G.blue,G.gold,G.green];
    const earnedCount = BADGES.filter(b=>b.earned).length;
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Badges & Skills</div>
        </div>

        {/* Tab toggle */}
        <div style={{ display:"flex", background:G.sand, borderRadius:12, padding:3, marginBottom:16 }}>
          {[{id:"badges",label:"Badges"},{id:"skills",label:"Skills"}].map(t=>(
            <div key={t.id} className="tap" onClick={()=>setBadgeTab(t.id)} style={{ flex:1, padding:"10px 0", textAlign:"center", borderRadius:10, fontSize:13, fontWeight:700, background:badgeTab===t.id?G.white:"transparent", color:badgeTab===t.id?G.green:G.muted, boxShadow:badgeTab===t.id?"0 2px 8px rgba(0,0,0,.08)":"none", transition:"all .2s" }}>{t.label}</div>
          ))}
        </div>

        {badgeTab==="badges" && <>
          {/* Summary */}
          <div style={{ background:G.white, borderRadius:18, padding:18, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:16, textAlign:"center" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:800, color:G.greenMid }}>{earnedCount}</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>of {BADGES.length} badges earned</div>
            <div style={{ height:6, background:G.sand, borderRadius:3, marginTop:12, overflow:"hidden" }}>
              <div style={{ width:`${(earnedCount/BADGES.length)*100}%`, height:"100%", background:`linear-gradient(90deg,${G.green},${G.greenLight})`, borderRadius:3 }} />
            </div>
          </div>

          {/* Earned badges */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Earned</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {BADGES.filter(b=>b.earned).map(b=>(
              <div key={b.id} style={{ background:G.white, borderRadius:16, padding:14, boxShadow:"0 2px 10px rgba(0,0,0,.06)", textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{b.icon}</div>
                <div style={{ fontWeight:700, fontSize:13 }}>{b.label}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2, lineHeight:1.4 }}>{b.desc}</div>
                <div style={{ fontSize:10, color:G.greenMid, fontWeight:600, marginTop:6 }}>{b.date}</div>
              </div>
            ))}
          </div>

          {/* Locked badges */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>In Progress</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {BADGES.filter(b=>!b.earned).map(b=>(
              <div key={b.id} style={{ background:G.white, borderRadius:16, padding:14, boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, opacity:.5 }}>{b.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:G.text }}>{b.label}</div>
                  <div style={{ fontSize:11, color:G.muted, marginTop:1 }}>{b.desc}</div>
                  <div style={{ height:5, background:G.sand, borderRadius:3, marginTop:8, overflow:"hidden" }}>
                    <div style={{ width:`${(b.progress/b.goal)*100}%`, height:"100%", background:G.greenLight, borderRadius:3, transition:"width .4s" }} />
                  </div>
                  <div style={{ fontSize:10, color:G.muted, marginTop:3 }}>{b.progress} / {b.goal}</div>
                </div>
              </div>
            ))}
          </div>
        </>}

        {badgeTab==="skills" && <>
          {/* Active skills */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Your Skills</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {SKILL_CATS.filter(s=>selSkills.includes(s.id)).map(s=>(
              <div key={s.id} style={{ background:G.white, borderRadius:16, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{s.label}</div>
                    {s.level>0&&<div style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:levelColors[s.level]+"22", color:levelColors[s.level] }}>{levelLabels[s.level]}</div>}
                  </div>
                  <div style={{ fontSize:12, color:G.muted }}>{s.jobs} jobs completed</div>
                  {s.level<3&&<div style={{ height:4, background:G.sand, borderRadius:2, marginTop:6, overflow:"hidden" }}>
                    <div style={{ width:`${Math.min((s.jobs/(s.level===0?5:s.level===1?15:30))*100,100)}%`, height:"100%", background:levelColors[Math.max(s.level,1)], borderRadius:2 }} />
                  </div>}
                </div>
                <div className="tap" onClick={()=>togSkill(s.id)} style={{ padding:"6px 12px", borderRadius:8, fontSize:11, fontWeight:700, background:G.redLight, color:G.red }}>Remove</div>
              </div>
            ))}
          </div>

          {/* Available skills */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Add Skills</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {SKILL_CATS.filter(s=>!selSkills.includes(s.id)).map(s=>(
              <div key={s.id} className="tap" onClick={()=>togSkill(s.id)} style={{ padding:"8px 16px", borderRadius:12, fontSize:13, fontWeight:600, background:G.white, color:G.text, border:`1.5px solid ${G.border}`, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>+ {s.label}</div>
            ))}
          </div>

          {/* Level legend */}
          <div style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginTop:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Skill Levels</div>
            {[
              { level:"Beginner", color:G.blue, req:"5+ jobs in category" },
              { level:"Skilled", color:G.gold, req:"15+ jobs with 4.5+ avg rating" },
              { level:"Expert", color:G.green, req:"30+ jobs with 4.8+ avg rating" },
            ].map(l=>(
              <div key={l.level} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${G.border}` }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:l.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:l.color }}>{l.level}</div>
                  <div style={{ fontSize:11, color:G.muted }}>{l.req}</div>
                </div>
              </div>
            ))}
          </div>
        </>}
      </div>
    );
  }

  // ── DOWNLOAD MY DATA SUB-PAGE ──
  if (subPage==="downloadData") {
    const DATA_CATEGORIES = [
      { icon:"👤", label:"Profile Information", desc:"Name, bio, photo, contact details", size:"~2 KB" },
      { icon:"📋", label:"Job History", desc:"All jobs posted and completed", size:"~15 KB" },
      { icon:"💬", label:"Messages", desc:"Conversations with workers and posters", size:"~48 KB" },
      { icon:"⭐", label:"Reviews", desc:"Reviews given and received", size:"~8 KB" },
      { icon:"💳", label:"Payment Records", desc:"Transaction history and receipts", size:"~12 KB" },
      { icon:"🏆", label:"Badges & Skills", desc:"Earned badges and skill progress", size:"~3 KB" },
      { icon:"🔔", label:"Preferences", desc:"Notification and privacy settings", size:"~1 KB" },
      { icon:"📍", label:"Location History", desc:"Search areas and service zones", size:"~4 KB" },
    ];
    const totalSize = "~93 KB";
    const handleRequest = () => {
      setDownloadStep(1);
      setTimeout(()=>setDownloadStep(2), 3000);
    };
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>{setSubPage(null);setDownloadStep(0);}} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>Download My Data</div>
        </div>

        {downloadStep===2 ? (
          <div style={{ textAlign:"center", padding:"30px 0" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, marginBottom:8 }}>Your Data is Ready</div>
            <div style={{ fontSize:13, color:G.muted, lineHeight:1.6, marginBottom:20 }}>We've compiled all your data into a downloadable archive. The link has also been sent to your email.</div>

            <div style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16, textAlign:"left" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>chores_data_jordan_davis.zip</div>
                  <div style={{ fontSize:12, color:G.muted }}>{totalSize} · JSON + CSV format</div>
                </div>
              </div>
            </div>

            <Btn onClick={()=>{ setDownloadStep(1); setTimeout(()=>setDownloadStep(2), 3000); }} style={{ width:"100%", padding:14, borderRadius:14, fontSize:14, marginBottom:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Archive
            </Btn>
            <div style={{ fontSize:12, color:G.muted }}>Link expires in 7 days</div>
          </div>
        ) : downloadStep===1 ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", border:`3px solid ${G.green}`, borderTopColor:"transparent", margin:"0 auto 20px", animation:"spin .8s linear infinite" }} />
            <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Preparing your data...</div>
            <div style={{ fontSize:13, color:G.muted }}>This may take a moment</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            <div style={{ marginTop:24, textAlign:"left" }}>
              {DATA_CATEGORIES.map((c,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", opacity:i<Math.floor(Date.now()/500%8)+1?1:.3, transition:"opacity .3s" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  <span style={{ fontSize:12, color:G.muted }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ background:G.greenPale, borderRadius:18, padding:18, border:`1.5px solid ${G.greenLight}`, marginBottom:16, display:"flex", gap:12, alignItems:"flex-start" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:G.greenMid, marginBottom:4 }}>Your Right to Your Data</div>
                <div style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>You can request a full copy of all personal data we hold. The export includes JSON and CSV files you can open in any spreadsheet app.</div>
              </div>
            </div>

            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>What's Included</div>
            <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
              {DATA_CATEGORIES.map((c,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:i<DATA_CATEGORIES.length-1?`1px solid ${G.border}`:"none" }}>
                  <span style={{ fontSize:18 }}>{c.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{c.label}</div>
                    <div style={{ fontSize:11, color:G.muted }}>{c.desc}</div>
                  </div>
                  <div style={{ fontSize:11, color:G.muted, fontFamily:"monospace" }}>{c.size}</div>
                </div>
              ))}
            </div>

            <div style={{ background:G.white, borderRadius:16, padding:14, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, color:G.muted }}>Estimated total size</span>
              <span style={{ fontSize:14, fontWeight:700, color:G.text }}>{totalSize}</span>
            </div>

            <Btn onClick={handleRequest} style={{ width:"100%", padding:14, borderRadius:14, fontSize:15 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Request My Data
            </Btn>
            <div style={{ fontSize:12, color:G.muted, lineHeight:1.6, marginTop:12, textAlign:"center" }}>A download link will also be sent to your email. Data exports typically take a few seconds.</div>
          </>
        )}
      </div>
    );
  }

  // ── DELETE MY DATA SUB-PAGE ──
  if (subPage==="deleteData") {
    const handleDelete = () => {
      setDeleteStep(3);
      setTimeout(()=>setDeleteStep(4), 2000);
    };
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>{setSubPage(null);setDeleteStep(0);setDeleteConfirmText("");}} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1, color:G.red }}>Delete My Data</div>
        </div>

        {deleteStep===4 ? (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:G.redLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, marginBottom:8 }}>Deletion Requested</div>
            <div style={{ fontSize:13, color:G.muted, lineHeight:1.6, marginBottom:20 }}>Your data deletion request has been submitted. All personal data will be permanently removed within 30 days. You'll receive a confirmation email.</div>
            <Btn onClick={()=>{setSubPage(null);setDeleteStep(0);setDeleteConfirmText("");}} variant="ghost" style={{ padding:"12px 30px", borderRadius:14 }}>Back to Settings</Btn>
          </div>
        ) : deleteStep===3 ? (
          <div style={{ textAlign:"center", padding:"50px 0" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", border:`3px solid ${G.red}`, borderTopColor:"transparent", margin:"0 auto 16px", animation:"spin .8s linear infinite" }} />
            <div style={{ fontWeight:700, fontSize:15, color:G.red }}>Processing deletion request...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {/* Warning card */}
            <div style={{ background:G.redLight, borderRadius:18, padding:20, border:`1.5px solid ${G.red}`, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={G.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div style={{ fontWeight:800, fontSize:16, color:G.red }}>This action is permanent</div>
              </div>
              <div style={{ fontSize:13, color:G.text, lineHeight:1.6 }}>Requesting data deletion will permanently remove:</div>
            </div>

            {/* What gets deleted */}
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
              {[
                { icon:"👤", text:"Your profile, bio, and photo" },
                { icon:"💬", text:"All messages and conversations" },
                { icon:"⭐", text:"Reviews you've given and received" },
                { icon:"💳", text:"Saved payment methods" },
                { icon:"📋", text:"Job history and earnings records" },
                { icon:"🏆", text:"All badges and skill progress" },
                { icon:"🔔", text:"Notification preferences" },
              ].map((item,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<6?`1px solid ${G.border}`:"none" }}>
                  <span style={{ fontSize:16 }}>{item.icon}</span>
                  <div style={{ fontSize:13, color:G.text }}>{item.text}</div>
                </div>
              ))}
            </div>

            {/* Confirmation */}
            {deleteStep===0 && (
              <Btn onClick={()=>setDeleteStep(1)} variant="danger" style={{ width:"100%", padding:14, borderRadius:14, fontSize:14, background:G.red, color:"#fff" }}>I Understand, Continue</Btn>
            )}
            {deleteStep>=1 && (
              <div style={{ background:G.white, borderRadius:18, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:G.text, marginBottom:12 }}>Type <span style={{ color:G.red, fontFamily:"monospace" }}>DELETE MY DATA</span> to confirm:</div>
                <input
                  value={deleteConfirmText}
                  onChange={e=>{ setDeleteConfirmText(e.target.value); if(e.target.value==="DELETE MY DATA") setDeleteStep(2); else if(deleteStep===2) setDeleteStep(1); }}
                  placeholder="Type here..."
                  style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${deleteStep===2?G.red:G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", background:G.white, outline:"none", boxSizing:"border-box", color:deleteStep===2?G.red:G.text }}
                  onFocus={e=>e.target.style.borderColor=G.red}
                  onBlur={e=>e.target.style.borderColor=deleteStep===2?G.red:G.border}
                />
                <div style={{ display:"flex", gap:8, marginTop:14 }}>
                  <Btn onClick={()=>{setDeleteStep(0);setDeleteConfirmText("");setSubPage(null);}} variant="ghost" style={{ flex:1, padding:12, borderRadius:14 }}>Cancel</Btn>
                  <Btn onClick={handleDelete} disabled={deleteStep<2} style={{ flex:2, padding:12, borderRadius:14, background:deleteStep===2?G.red:"#ccc", color:"#fff", opacity:deleteStep===2?1:.5 }}>Permanently Delete</Btn>
                </div>
              </div>
            )}

            <div style={{ fontSize:12, color:G.muted, lineHeight:1.6, marginTop:12, padding:"0 4px" }}>
              After submitting, you have 30 days to cancel by contacting support. After that, deletion is irreversible and your account cannot be recovered.
            </div>
          </>
        )}
      </div>
    );
  }

  // ── REVIEWS SUB-PAGE ──
  if (subPage==="reviews") {
    const avg = (MY_REVIEWS.reduce((s,r)=>s+r.rating,0)/MY_REVIEWS.length).toFixed(1);
    const dist = [5,4,3,2,1].map(s=>({ s, count:MY_REVIEWS.filter(r=>r.rating===s).length }));
    const maxCount = Math.max(...dist.map(d=>d.count),1);
    const filtered = reviewFilter==="all"?MY_REVIEWS:MY_REVIEWS.filter(r=>r.rating===parseInt(reviewFilter));

    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:80 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSubPage(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>My Reviews</div>
        </div>

        {/* Rating overview card */}
        <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:16 }}>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            {/* Big score */}
            <div style={{ textAlign:"center", minWidth:80 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:800, color:G.greenMid, lineHeight:1 }}>{avg}</div>
              <div style={{ display:"flex", justifyContent:"center", gap:2, marginTop:6 }}>
                {[1,2,3,4,5].map(s=>(
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s<=Math.round(parseFloat(avg))?G.green:G.border} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <div style={{ fontSize:11, color:G.muted, marginTop:4 }}>{MY_REVIEWS.length} reviews</div>
            </div>
            {/* Bar chart */}
            <div style={{ flex:1 }}>
              {dist.map(d=>(
                <div key={d.s} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <div style={{ fontSize:11, color:G.muted, width:12, textAlign:"right" }}>{d.s}</div>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={G.green} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <div style={{ flex:1, height:8, background:G.sand, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ width:`${(d.count/maxCount)*100}%`, height:"100%", background:`linear-gradient(90deg,${G.green},${G.greenLight})`, borderRadius:4, transition:"width .4s ease" }} />
                  </div>
                  <div style={{ fontSize:11, color:G.muted, width:16, textAlign:"right" }}>{d.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div style={{ background:G.white, borderRadius:16, padding:14, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Top Qualities</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {(() => {
              const allTags = MY_REVIEWS.flatMap(r=>r.tags);
              const counts = {};
              allTags.forEach(t=>counts[t]=(counts[t]||0)+1);
              return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([tag,count])=>(
                <div key={tag} style={{ padding:"5px 12px", borderRadius:10, fontSize:11, fontWeight:600, background:G.greenPale, color:G.green, textTransform:"capitalize" }}>{tag} ({count})</div>
              ));
            })()}
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto" }}>
          {["all","5","4","3","2","1"].map(f=>(
            <div key={f} className="tap" onClick={()=>setReviewFilter(f)} style={{ padding:"6px 14px", borderRadius:12, fontSize:12, fontWeight:600, background:reviewFilter===f?G.green:G.white, color:reviewFilter===f?"#fff":G.muted, border:`1.5px solid ${reviewFilter===f?G.green:G.border}`, whiteSpace:"nowrap" }}>{f==="all"?"All":f+" ★"}</div>
          ))}
        </div>

        {/* Review list */}
        {filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:30, color:G.muted, fontSize:13 }}>No reviews with this rating yet.</div>
        ) : filtered.map(r=>(
          <div key={r.id} style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <Avatar name={r.from} size={40} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{r.from}</div>
                <div style={{ fontSize:11, color:G.muted }}>{r.job}</div>
              </div>
              <div style={{ fontSize:11, color:G.muted }}>{r.date}</div>
            </div>
            <div style={{ display:"flex", gap:2, marginBottom:8 }}>
              {[1,2,3,4,5].map(s=>(
                <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s<=r.rating?G.green:G.border} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <div style={{ fontSize:13, color:G.text, lineHeight:1.5, marginBottom:8 }}>{r.text}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {r.tags.map(t=>(
                <div key={t} style={{ padding:"3px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:G.sand, color:G.muted, textTransform:"capitalize" }}>{t}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={settingsRef} className="fade" style={{ padding:"16px 20px" }}>
      {selectedTxn && <EscrowDetailModal txn={selectedTxn} role={role} onClose={()=>setSelectedTxn(null)} onConfirmSide={(id,side)=>{onConfirmSide(id,side);setSelectedTxn(null);}} onDispute={(id)=>{onDispute(id);setSelectedTxn(null);}} />}

      {/* Tab nav */}
      <div style={{ position:"relative", marginBottom:18 }}>
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2, scrollbarWidth:"none" }}>
          {tabs.map(t=>(
            <div key={t.id} className="chip tap" onClick={()=>setTab(t.id)} style={{ padding:"7px 14px", borderRadius:20, fontSize:12, fontWeight:600, background:tab===t.id?G.green:G.white, color:tab===t.id?"#fff":G.text, border:`1.5px solid ${tab===t.id?G.green:G.border}`, display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap", flexShrink:0 }}>
              {t.label}
            </div>
          ))}
        </div>
        {/* Fade + arrow hint */}
        <div style={{ position:"absolute", right:0, top:0, bottom:2, width:48, background:"linear-gradient(to right, transparent, #F5F0E8 70%)", pointerEvents:"none", display:"flex", alignItems:"center", justifyContent:"flex-end" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      {/* ── PROFILE ── */}
      {tab==="profile"&&(
        <div>
          <div style={{ background:G.white, borderRadius:20, padding:16, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14, display:"flex", alignItems:"center", gap:16 }}>
            {profile.photo
              ? <img src={profile.photo} alt="Profile" style={{ width:60, height:60, borderRadius:"50%", objectFit:"cover", border:`2px solid ${G.greenLight}`, flexShrink:0 }} />
              : <Avatar name={`${profile.first} ${profile.last}`} size={60} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
            }
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800 }}>{`${profile.first} ${profile.last}`}</div>
              <div style={{ color:G.muted, fontSize:12, marginTop:2 }}>Age {profile.age} · Zip {profile.zip} · Jan 2025</div>
              <div style={{ display:"flex", gap:6, marginTop:8 }}>
                <Tag><span style={{ display:"flex", alignItems:"center", gap:4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill={G.gold} stroke={G.gold} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> 4.9</span></Tag>
                <Tag><span style={{ display:"flex", alignItems:"center", gap:4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Verified</span></Tag>
                <Tag bg="#EBF8FF" color={G.blue}><span style={{ display:"flex", alignItems:"center", gap:4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> 0 Strikes</span></Tag>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            {[{l:"Jobs Done",v:"42"},{l:"Earned",v:"$1,240"},{l:"Repeat Clients",v:"8"}].map(s=>(
              <div key={s.l} className="stat-card" style={{ flex:1, background:G.white, borderRadius:16, padding:"14px 10px", textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.greenMid }}>{s.v}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* Completed jobs needing review */}
          {COMPLETED_JOBS.filter(j=>!j.reviewed).length>0 && (
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Rate Your Experience</div>
              {COMPLETED_JOBS.filter(j=>!j.reviewed).map(j=>(
                <div key={j.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
                  <Avatar name={j.person} size={36} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{j.title}</div>
                    <div style={{ fontSize:11, color:G.muted }}>{j.person} · ${j.pay} · {j.date}</div>
                  </div>
                  <div className="tap" onClick={()=>onReview({job:j.title,person:j.person})} style={{ padding:"6px 14px", borderRadius:10, background:`linear-gradient(135deg,${G.green},${G.greenLight})`, color:"#fff", fontSize:11, fontWeight:700 }}>Rate</div>
                </div>
              ))}
            </div>
          )}

          {/* Recent reviews preview */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8 }}>Recent Reviews</div>
              <div className="tap" onClick={()=>setSubPage("reviews")} style={{ fontSize:11, fontWeight:700, color:G.greenMid }}>See All →</div>
            </div>
            {MY_REVIEWS.slice(0,2).map(r=>(
              <div key={r.id} style={{ padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{r.from}</div>
                  <div style={{ display:"flex", gap:1 }}>
                    {[1,2,3,4,5].map(s=><svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s<=r.rating?G.green:G.border} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <div style={{ fontSize:10, color:G.muted, marginLeft:"auto" }}>{r.date}</div>
                </div>
                <div style={{ fontSize:12, color:G.muted, lineHeight:1.4 }}>{r.text.length>80?r.text.slice(0,80)+"…":r.text}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
            {[{icon:"⭐",label:"Reviews",sub:"42 reviews · 4.9 avg"},{icon:"🏆",label:"Badges & Skills",sub:"8 earned",last:true}].map(r=>(
              <SettingRow key={r.label} icon={r.icon} label={r.label} sub={r.sub} last={r.last} onClick={r.label==="Reviews"?()=>setSubPage("reviews"):r.label==="Badges & Skills"?()=>setSubPage("badgesSkills"):()=>{}} right={<span style={{ fontSize:14, color:G.muted }}>›</span>} />
            ))}
          </div>
        </div>
      )}

      {/* ── ACCOUNT ── */}
      {tab==="account"&&(
        <div className="fade">
          <div style={{ background:G.white, borderRadius:20, padding:16, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14, display:"flex", alignItems:"center", gap:16 }}>
            {profile.photo
              ? <img src={profile.photo} alt="Profile" style={{ width:56, height:56, borderRadius:"50%", objectFit:"cover", border:`2px solid ${G.greenLight}`, flexShrink:0 }} />
              : <Avatar name={`${profile.first} ${profile.last}`} size={56} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
            }
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>{`${profile.first} ${profile.last}`}</div>
              <div style={{ color:G.muted, fontSize:12, marginTop:2 }}>jordan@email.com · (404) 555-0123</div>
            </div>
          </div>
          <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
            <SettingRow icon="✏️" label="Edit Profile" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("editProfile")} />
            <SettingRow icon="📍" label="Service Zip Code" sub={profile.zip||"Not set"} right={<div className="tap" style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Change</div>} onClick={()=>setSubPage("changeZip")} />
            <SettingRow icon="🔑" label="Change Password" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("changePassword")} />
            <SettingRow icon="📱" label="Two-Factor Authentication" sub={toggles.twoFactor?"Enabled":"Disabled"} right={<Toggle on={toggles.twoFactor} onChange={()=>tog("twoFactor")} />} />
            <SettingRow icon="🔗" label="Linked Accounts" sub="Google, Apple" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>alert("Social login coming soon — Google, Apple, and Facebook sign-in will be available in the next update.")} />
            <SettingRow icon="🌐" label="Language" sub="English" right={<div className="tap" style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Change</div>} last />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <Btn variant="outline" style={{ width:"100%", borderRadius:16 }}>Sign Out</Btn>
            <Btn variant="danger" style={{ width:"100%", borderRadius:16, opacity:.6 }}>Delete Account</Btn>
          </div>

        </div>
      )}

      {/* ── PAYMENTS & ESCROW ── */}
      {tab==="payments"&&(
        <div className="fade">
          {/* Escrow wallet summary */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Escrow Wallet</div>
            <div style={{ display:"flex", gap:10 }}>
              <div className={heldCount>0?"escrow-glow":""} style={{ flex:1, background:G.white, borderRadius:18, padding:16, boxShadow:"0 4px 16px rgba(0,0,0,.07)", border:heldCount>0?`1.5px solid ${G.greenLight}`:`1px solid ${G.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:16 }}>🔒</span>
                  {heldCount>0&&<span style={{ fontSize:10, fontWeight:700, background:"#FFF7ED", color:G.gold, padding:"2px 8px", borderRadius:8 }}>{heldCount} active</span>}
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:G.gold }}>${totalHeld.toFixed(2)}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>In Escrow</div>
              </div>
              <div style={{ flex:1, background:G.white, borderRadius:18, padding:16, boxShadow:"0 4px 16px rgba(0,0,0,.07)" }}>
                <div style={{ marginBottom:6 }}><span style={{ fontSize:16 }}>{role==="worker"?"💰":"✅"}</span></div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:G.greenMid }}>${totalReleased.toFixed(2)}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{role==="worker"?"Earned":"Released"}</div>
              </div>
            </div>
          </div>

          {/* How escrow works mini */}
          <div style={{ background:G.greenPale, borderRadius:14, padding:14, marginBottom:16, border:`1px solid ${G.greenLight}`, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:18 }}>🛡️</span>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:G.greenMid, marginBottom:4 }}>Escrow Protection</div>
              <div style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>Payments are held securely and released only when the poster confirms job completion. Full refund if the worker doesn't show.</div>
            </div>
          </div>

          {/* Recent escrow transactions */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Escrow Transactions</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {escrowData.slice(0,5).map(txn=>{
              const sc = ESCROW_STATUS[txn.status];
              return (
                <div key={txn.id} className="card tap" onClick={()=>setSelectedTxn(txn)} style={{ background:G.white, borderRadius:16, padding:"12px 14px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", borderLeft:`3px solid ${sc.text}`, display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:G.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{txn.job}</div>
                      <span style={{ background:sc.bg, color:sc.text, fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8, flexShrink:0 }}>{sc.icon} {sc.label}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:12, color:G.muted }}>
                      <span>{role==="worker"?`From ${txn.poster}`:`To ${txn.worker}`}</span>
                      <span style={{ fontWeight:700, color:G.greenMid }}>${txn.workerGets.toFixed(2)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize:16, color:G.muted }}>›</span>
                </div>
              );
            })}
            {escrowData.length>5&&<div className="tap" onClick={()=>setSubPage("allTransactions")} style={{ textAlign:"center", padding:10, fontSize:13, color:G.greenMid, fontWeight:700 }}>View all {escrowData.length} transactions →</div>}
            {escrowData.length<=5&&escrowData.length>0&&<div className="tap" onClick={()=>setSubPage("allTransactions")} style={{ textAlign:"center", padding:10, fontSize:13, color:G.greenMid, fontWeight:700 }}>View all transactions →</div>}
          </div>

          {/* Payment methods */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Payment Methods</div>
          <div className="tap" onClick={()=>setSubPage("paymentMethods")} style={{ background:G.white, borderRadius:18, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💳</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>Visa •••• 4242</div>
              <div style={{ fontSize:12, color:G.muted }}>Default · Tap to manage cards</div>
            </div>
            <span style={{ fontSize:16, color:G.muted }}>›</span>
          </div>

          {/* Payout settings (worker only) */}
          {role==="worker"&&(
            <>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Payout Settings</div>
              <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
                <SettingRow icon="🏦" label="Bank Account" sub="Chase •••• 7890" right={<div className="tap" style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Edit</div>} onClick={()=>setSubPage("bankAccount")} />
                <SettingRow icon="⚡" label="Instant Payout" sub="$0.50 fee per transfer" right={<Toggle on={toggles.instantPayout} onChange={()=>tog("instantPayout")} />} />
                <SettingRow icon="📅" label="Payout Schedule" sub={`${payoutFreq==="daily"?"Daily":payoutFreq==="monthly"?"Monthly (1st)":payoutFreq==="biweekly"?`Bi-Weekly (${payoutDay})`:`Weekly (${payoutDay})`}`} right={<div className="tap" style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Change</div>} last onClick={()=>setSubPage("payoutSchedule")} />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab==="notifications"&&(
        <div className="fade">
          <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, padding:"14px 0 6px" }}>General</div>
            <SettingRow icon="📱" label="Push Notifications" sub={toggles.push?"Enabled":"All notifications silenced"} right={<Toggle on={toggles.push} onChange={()=>tog("push")} />} />
            <SettingRow icon="📳" label="Vibrate" sub={toggles.vibrate?"On":"Off"} right={<Toggle on={toggles.vibrate} onChange={()=>tog("vibrate")} />} last />
          </div>
          {!toggles.push&&(
            <div style={{ background:"#FFF7ED", borderRadius:14, padding:14, marginBottom:14, border:"1px solid rgba(244,162,97,.2)", display:"flex", gap:10, alignItems:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 01-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0118 8"/><path d="M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 00-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <div style={{ fontSize:12, color:G.gold, fontWeight:600 }}>Push notifications are off. You won't receive any alerts.</div>
            </div>
          )}
          <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", opacity:toggles.push?1:.5, pointerEvents:toggles.push?"auto":"none", transition:"opacity .3s" }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, padding:"14px 0 6px" }}>Alert Types</div>
            {role==="worker" ? (<>
              <SettingRow icon="🌿" label="New jobs in my area" right={<Toggle on={toggles.nJobs} onChange={()=>tog("nJobs")} />} />
              <SettingRow icon="✅" label="Application updates" right={<Toggle on={toggles.nAppUpdates} onChange={()=>tog("nAppUpdates")} />} />
              <SettingRow icon="⏰" label="Day-before reminders" right={<Toggle on={toggles.nDayReminder} onChange={()=>tog("nDayReminder")} />} />
              <SettingRow icon="⏰" label="1-hour reminders" right={<Toggle on={toggles.nHourReminder} onChange={()=>tog("nHourReminder")} />} />
              <SettingRow icon="💸" label="Payment notifications" right={<Toggle on={toggles.nPayment} onChange={()=>tog("nPayment")} />} />
              <SettingRow icon="⚠️" label="Cancellation alerts" right={<Toggle on={toggles.nCancel} onChange={()=>tog("nCancel")} />} last />
            </>) : (<>
              <SettingRow icon="👤" label="New applicant alerts" right={<Toggle on={toggles.nApplicant} onChange={()=>tog("nApplicant")} />} />
              <SettingRow icon="✅" label="Job completion alerts" right={<Toggle on={toggles.nComplete} onChange={()=>tog("nComplete")} />} />
              <SettingRow icon="🧾" label="Payment receipts" right={<Toggle on={toggles.nReceipts} onChange={()=>tog("nReceipts")} />} />
              <SettingRow icon="⭐" label="Rate worker reminders" right={<Toggle on={toggles.nRate} onChange={()=>tog("nRate")} />} />
              <SettingRow icon="⚠️" label="Cancellation alerts" right={<Toggle on={toggles.nCancel} onChange={()=>tog("nCancel")} />} last />
            </>)}
          </div>
        </div>
      )}

      {/* ── PRIVACY ── */}
      {tab==="privacy"&&(
        <div className="fade">
          <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
            <SettingRow icon="👁️" label="Profile Visibility" sub={toggles.profileVisible?"Visible to nearby users":"Hidden from search"} right={<Toggle on={toggles.profileVisible} onChange={()=>tog("profileVisible")} />} />
            <SettingRow icon="📍" label="Show Exact Location" sub={toggles.exactLoc?"Precise location shared":"Only approximate area shown"} right={<Toggle on={toggles.exactLoc} onChange={()=>tog("exactLoc")} />} />
            <SettingRow icon="📊" label="Usage Analytics" sub={toggles.analytics?"Sharing anonymous usage data":"Not sharing usage data"} right={<Toggle on={toggles.analytics} onChange={()=>tog("analytics")} />} />
            <SettingRow icon="📧" label="Marketing Emails" sub={toggles.marketing?"Receiving promotions":"Opted out"} right={<Toggle on={toggles.marketing} onChange={()=>tog("marketing")} />} last />
          </div>
          <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, padding:"14px 0 6px" }}>Data & Permissions</div>
            <div style={{ fontSize:13, color:G.muted, lineHeight:1.6, padding:"0 0 12px" }}>
              We only collect data necessary to match you with jobs and process payments. Your location is used solely for nearby job matching and is never shared with third parties.
            </div>
            <SettingRow icon="📄" label="View Privacy Policy" right={<span style={{ color:G.muted }}>›</span>} onClick={()=>setSubPage("privacyPolicy")} />
            <SettingRow icon="📥" label="Download My Data" sub="Request a copy of your data" right={<span style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Request →</span>} onClick={()=>setSubPage("downloadData")} />
            <SettingRow icon="🗑️" label="Delete My Data" sub="Permanently remove all data" right={<span style={{ fontSize:12, color:G.red, fontWeight:700 }}>Request →</span>} onClick={()=>setSubPage("deleteData")} last />
          </div>
        </div>
      )}

      {/* ── SUPPORT ── */}
      {tab==="support"&&(
        <div className="fade">
          <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
            <SettingRow icon="❓" label="Help Center" sub="FAQs and guides" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("helpCenter")} />
            <SettingRow icon="💬" label="Contact Support" sub="Get help from our team" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("contactSupport")} />
            <SettingRow icon="🐛" label="Report a Bug" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("reportBug")} />
            <SettingRow icon="💡" label="Suggest a Feature" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("suggestFeature")} />
            <SettingRow icon="⭐" label="Rate the App" sub="Leave a review" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>window.open("https://apps.apple.com","_blank")} />
            <SettingRow icon="📜" label="Terms of Service" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("terms")} />
            <SettingRow icon="🛡️" label="Community Guidelines" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("guidelines")} last />
          </div>
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", textAlign:"center" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800, color:G.green }}>Chores<span style={{ color:G.greenLight }}>.</span></div>
            <div style={{ fontSize:12, color:G.muted, marginTop:4 }}>Version 2.1.0 · Build 847</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NOTIFICATIONS SCREEN ───────────────────────────────────────────────────
function NotifIcon({ type, size=22 }) {
  const s = { width:size, height:size, display:"block" };
  const c = "round";
  if (type==="new_job"||type==="applied") return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2" strokeLinecap={c} strokeLinejoin={c}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>;
  if (type==="accepted"||type==="complete"||type==="confirmed") return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap={c} strokeLinejoin={c}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
  if (type==="reminder") return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.gold} strokeWidth="2" strokeLinecap={c} strokeLinejoin={c}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  if (type==="payment") return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.blue} strokeWidth="2" strokeLinecap={c} strokeLinejoin={c}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
  if (type==="noshow"||type==="alert") return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.red} strokeWidth="2" strokeLinecap={c} strokeLinejoin={c}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  if (type==="rating") return <svg style={s} viewBox="0 0 24 24" fill={G.gold} stroke={G.gold} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2" strokeLinecap={c}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

function NotificationsScreen({ role, onNavigate }) {
  const notifs = role==="worker" ? NOTIFS_WORKER : NOTIFS_POSTER;
  const [filter, setFilter] = useState("all");
  const [read, setRead] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const notifRef = React.useRef(null);
  React.useEffect(()=>{
    if(notifRef.current){let p=notifRef.current.parentElement;while(p){if(p.scrollTop>0)p.scrollTop=0;p=p.parentElement;}}
  },[selectedNotif, filter]);
  const cats = ["all","job","payment","reminder","alert"];
  const filtered = filter==="all" ? notifs : notifs.filter(n=>n.category===filter);
  const unreadCount = notifs.filter(n=>n.unread&&!read.includes(n.id)).length;
  const colorMap = {job:G.greenPale,payment:"#EBF8FF",reminder:"#FFF4E0",alert:G.redLight};
  const textMap = {job:G.greenMid,payment:G.blue,reminder:G.gold,alert:G.red};

  // Notification detail sub-page
  if (selectedNotif) {
    const n = selectedNotif;
    const details = {
      new_job: { headline:"New Job Available", actions:["View Job","Quick Apply"], info:[
        {label:"Job",value:n.body.split("·")[0]?.trim()},
        {label:"Pay",value:n.body.split("·")[1]?.trim()},
        {label:"Distance",value:n.body.split("·")[2]?.trim()},
        {label:"Posted",value:n.time},
      ]},
      accepted: { headline:"You're Hired!", actions:["Message Poster","View Details"], info:[
        {label:"Status",value:"Application accepted"},
        {label:"Client",value:n.body.replace("accepted your application","").trim()},
        {label:"Next Step",value:"Message the poster to confirm details"},
        {label:"When",value:n.time},
      ]},
      reminder: { headline:"Upcoming Job", actions:["Get Directions","Message"], info:[
        {label:"Job",value:n.body.split("·")[0]?.trim()},
        {label:"Client",value:n.body.split("·")[1]?.trim()},
        {label:"Location",value:n.body.split("·")[2]?.trim()},
        {label:"When",value:n.title.replace("Job ","")},
      ]},
      payment: { headline:"Payment Update", actions:["View Receipt","Transaction History"], info:[
        {label:"Amount",value:n.body.split("·")[0]?.trim()},
        {label:"Job",value:n.body.split("·")[1]?.trim()},
        {label:"From",value:n.body.split("·")[2]?.trim()},
        {label:"When",value:n.time},
      ]},
      noshow: { headline:"Cancellation Notice", actions:["View Policy","Contact Support"], info:[
        {label:"Client",value:n.body.split("cancelled")[0]?.trim()},
        {label:"Reason",value:"Cancelled with less than 12hrs notice"},
        {label:"Impact",value:"You may be eligible for a cancellation fee"},
        {label:"When",value:n.time},
      ]},
      applied: { headline:"New Applicant", actions:["View Profile","Message"], info:[
        {label:"Applicant",value:n.body.split("applied")[0]?.trim()},
        {label:"Job",value:n.body.split("to ")[1]?.trim()},
        {label:"Status",value:"Awaiting your review"},
        {label:"When",value:n.time},
      ]},
      confirmed: { headline:"Worker Confirmed", actions:["Message Worker","Get Directions"], info:[
        {label:"Worker",value:n.body.split("is ")[0]?.trim()},
        {label:"Time",value:n.body.split("for ")[1]?.trim()},
        {label:"Status",value:"On their way"},
        {label:"When",value:n.time},
      ]},
      complete: { headline:"Job Complete", actions:["Leave Review","View Receipt"], info:[
        {label:"Job",value:n.body.split("·")[0]?.trim()},
        {label:"Worker",value:n.body.split("·")[1]?.trim()},
        {label:"Status",value:"Completed — ready for review"},
        {label:"When",value:n.time},
      ]},
      rating: { headline:"Review Reminder", actions:["Leave Review","Skip"], info:[
        {label:"Worker",value:n.body.split("do?")[0]?.replace("How did","").trim()},
        {label:"Action",value:"Share your experience to help others"},
        {label:"When",value:n.time},
      ]},
    };
    const d = details[n.type] || { headline:n.title, actions:["Dismiss"], info:[{label:"Details",value:n.body},{label:"When",value:n.time}] };

    return (
      <div className="fade" style={{ padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>setSelectedNotif(null)} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1 }}>{d.headline}</div>
        </div>

        {/* Icon + title card */}
        <div style={{ background:G.white, borderRadius:18, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:16, textAlign:"center" }}>
          <div style={{ width:56, height:56, borderRadius:16, background:colorMap[n.category]||G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}><NotifIcon type={n.type} size={26} /></div>
          <div style={{ fontWeight:700, fontSize:16, color:G.text }}>{n.title}</div>
          <div style={{ fontSize:13, color:G.muted, marginTop:4 }}>{n.body}</div>
          <div style={{ marginTop:10 }}><Tag bg={colorMap[n.category]||G.greenPale} color={textMap[n.category]||G.greenMid}>{n.category}</Tag></div>
        </div>

        {/* Details card */}
        <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          {d.info.filter(i=>i.value).map((item,i,a)=>(
            <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:i<a.length-1?`1px solid ${G.border}`:"none" }}>
              <span style={{ fontSize:13, color:G.muted }}>{item.label}</span>
              <span style={{ fontSize:13, fontWeight:600, color:G.text, textAlign:"right", maxWidth:"60%" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {d.actions.map((action,i)=>{
            const dest = action.toLowerCase().includes("job")||action.toLowerCase().includes("apply") ? "home"
              : action.toLowerCase().includes("message") ? "messages"
              : action.toLowerCase().includes("receipt")||action.toLowerCase().includes("transaction") ? "profile"
              : action.toLowerCase().includes("map")||action.toLowerCase().includes("direction") ? "map"
              : null;
            return (
              <Btn key={action} onClick={()=>{ setSelectedNotif(null); if(dest&&onNavigate) onNavigate(dest); }} variant={i===0?"primary":"outline"} style={{ width:"100%", padding:14, borderRadius:14, fontSize:14 }}>{action}</Btn>
            );
          })}
        </div>

        <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:G.muted }}>{n.time}</div>
      </div>
    );
  }

  return (
    <div ref={notifRef} className="fade" style={{ padding:"16px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.text }}>Inbox</div>
        {unreadCount>0&&<div className="tap" onClick={()=>setRead(notifs.map(n=>n.id))} style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Mark all read</div>}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(n=>{
          const isUnread = n.unread&&!read.includes(n.id);
          return (
            <div key={n.id} className="tap card" onClick={()=>{setRead(r=>[...new Set([...r,n.id])]);setSelectedNotif(n);}} style={{ background:G.white, borderRadius:16, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", gap:12, alignItems:"flex-start", borderLeft:`3px solid ${isUnread?G.green:"transparent"}`, opacity:isUnread?1:0.75 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:colorMap[n.category]||G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><NotifIcon type={n.type} size={20} /></div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                  <div style={{ fontWeight:isUnread?700:500, fontSize:14, color:G.text, lineHeight:1.3 }}>{n.title}</div>
                  <div style={{ fontSize:10, color:G.muted, flexShrink:0, marginTop:2 }}>{n.time}</div>
                </div>
                <div style={{ fontSize:12, color:G.muted, marginTop:3, lineHeight:1.4 }}>{n.body}</div>
                <div style={{ marginTop:6 }}><Tag bg={colorMap[n.category]||G.greenPale} color={textMap[n.category]||G.greenMid}>{n.category}</Tag></div>
              </div>
              {isUnread&&<div style={{ width:8, height:8, borderRadius:"50%", background:G.green, flexShrink:0, marginTop:4 }}/>}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:12 }}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DISCOVERY SCREEN ───────────────────────────────────────────────────────
function DiscoveryScreen({ role, onPostJob, onFundEscrow, onCheckout, isGuest, onGuestAction, userZip, maxDist, setMaxDist, profileVisible=true }) {
  const [discoverView, setDiscoverView] = useState("feed");
  const [activeCategory, setActiveCategory] = useState([]);
  const [payRange, setPayRange] = useState([0,100]);
  const [customDistPage, setCustomDistPage] = useState(false);
  const [customDistInput, setCustomDistInput] = useState("");
  const [applied, setApplied] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [sortBy, setSortBy] = useState("match");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModal, setApplyModal] = useState(null);
  const [applyMsg, setApplyMsg] = useState("");
  const [applyStep, setApplyStep] = useState(0); // 0=form, 1=sending, 2=done
  const discRef = React.useRef(null);
  React.useEffect(()=>{
    if(discRef.current){let p=discRef.current.parentElement;while(p){if(p.scrollTop>0)p.scrollTop=0;p=p.parentElement;}}
    window.scrollTo(0,0);
  },[selectedJob, applyModal, discoverView]);

  const filtered = JOBS.filter(j=>{
    if(activeCategory.length>0&&!activeCategory.includes(j.category)) return false;
    if(j.pay<payRange[0]||j.pay>payRange[1]) return false;
    if(j.dist>maxDist) return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="pay") return b.pay-a.pay;
    if(sortBy==="distance") return a.dist-b.dist;
    if(sortBy==="az") return a.title.localeCompare(b.title);
    return 0;
  });

  // ── APPLICATION MODAL ──
  if (applyModal) {
    const job = applyModal;
    const cat = CATEGORIES.find(c=>c.id===job.category);
    if (applyStep===2) return (
      <div className="fade" style={{ padding:20 }}>
        <div style={{ textAlign:"center", paddingTop:40 }}>
          <div className="check-pop" style={{ width:80, height:80, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 20px" }}>🎉</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:G.green }}>Application Sent!</div>
          <div style={{ fontSize:14, color:G.muted, marginTop:10, lineHeight:1.6 }}>Your application for <strong>{job.title}</strong> has been sent to {job.poster}. You'll get a notification when they respond.</div>
          <div style={{ background:G.white, borderRadius:16, padding:16, marginTop:24, boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>What happens next?</div>
            {[{s:"1",t:"Poster reviews your application"},{s:"2",t:"You'll receive a notification if accepted"},{s:"3",t:"Payment held in escrow once hired"},{s:"4",t:"Complete job & get paid!"}].map(step=>(
              <div key={step.s} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 0" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:G.green, flexShrink:0 }}>{step.s}</div>
                <div style={{ fontSize:13, color:G.text }}>{step.t}</div>
              </div>
            ))}
          </div>
          <Btn onClick={()=>{setApplied(a=>[...a,job.id]);setApplyModal(null);setApplyStep(0);setApplyMsg("");}} style={{ width:"100%", marginTop:24, padding:16, borderRadius:16 }}>Back to Jobs</Btn>
        </div>
      </div>
    );
    return (
      <div className="fade" style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>{setApplyModal(null);setApplyStep(0);setApplyMsg("");}} style={{ width:32, height:32, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Apply to Job</div>
        </div>
        {/* Job summary */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ display:"flex", gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{cat?.label?.charAt(0)||'•'}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{job.title}</div>
              <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>{job.poster} · ${job.pay} · {job.date}</div>
            </div>
          </div>
        </div>
        {/* Your profile preview */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Applying as</div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <Avatar name="Jordan Davis" size={44} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
            <div><div style={{ fontWeight:700, fontSize:14 }}>Jordan Davis</div><div style={{ fontSize:12, color:G.muted, display:"flex", alignItems:"center", gap:4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="#F4A261" stroke="#F4A261" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>4.9 · 42 jobs · <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Verified</div></div>
          </div>
        </div>
        {/* Message */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:6 }}>Message to {job.poster}</label>
          <textarea value={applyMsg} onChange={e=>setApplyMsg(e.target.value)} rows={4} placeholder={`Hi! I'd love to help with ${job.title}. I have experience with similar jobs and I'm available on ${job.date}...`}
            style={{ width:"100%", padding:"14px", borderRadius:14, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", resize:"none", background:G.white, outline:"none" }}
            onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border}
          />
          <div style={{ textAlign:"right", fontSize:11, color:applyMsg.length>300?G.red:G.muted, marginTop:4 }}>{applyMsg.length}/300</div>
        </div>
        {/* Availability */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Your Availability</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["Morning","Afternoon","Evening","Weekends","Flexible"].map(t=>(
              <div key={t} className="tap chip" style={{ padding:"8px 14px", borderRadius:12, fontSize:12, fontWeight:600, background:G.sand, color:G.muted, border:`1.5px solid ${G.border}` }}>{t}</div>
            ))}
          </div>
        </div>
        <Btn onClick={()=>{setApplyStep(1);setTimeout(()=>setApplyStep(2),1500);}} disabled={!applyMsg.trim()} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15, opacity:applyMsg.trim()?1:.5 }}>
          {applyStep===1?"Sending...":"Submit Application →"}
        </Btn>
      </div>
    );
  }

  // ── JOB DETAIL PAGE ──
  if (selectedJob) {
    const job = selectedJob;
    const cat = CATEGORIES.find(c=>c.id===job.category);
    const hasApplied = applied.includes(job.id);
    return (
      <div className="fade" style={{ paddingBottom:80 }}>
        {/* Hero header */}
        <div style={{ background:`linear-gradient(135deg, ${G.green} 0%, ${G.greenMid} 100%)`, padding:"16px 20px 20px", position:"relative" }}>
          <div className="tap" onClick={()=>setSelectedJob(null)} style={{ display:"inline-flex", alignItems:"center", gap:6, color:"rgba(255,255,255,.7)", fontSize:13, fontWeight:600, marginBottom:12 }}>← Back to Jobs</div>
          {job.urgent&&<div style={{ position:"absolute", top:16, right:16, background:G.orange, color:"#fff", fontSize:11, fontWeight:800, padding:"5px 12px", borderRadius:10 }}>🔥 URGENT</div>}
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{ width:56, height:56, borderRadius:16, background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{cat?.label?.charAt(0)||'•'}</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:"#fff", lineHeight:1.2 }}>{job.title}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.6)", marginTop:4 }}>📍 {job.loc} · {job.dist}mi away</div>
            </div>
          </div>
          {/* Price badge */}
          <div style={{ display:"flex", gap:12, marginTop:16 }}>
            <div style={{ background:"rgba(255,255,255,.12)", borderRadius:14, padding:"12px 16px", flex:1, backdropFilter:"blur(4px)" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.5)" }}>Pay</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:"#fff" }}>${job.pay}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>you get ${(job.pay*.92).toFixed(0)}</div>
            </div>
            <div style={{ background:"rgba(255,255,255,.12)", borderRadius:14, padding:"12px 16px", flex:1 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.5)" }}>Date</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginTop:4, display:"flex", alignItems:"center", gap:6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {job.date}</div>
            </div>
            <div style={{ background:"rgba(255,255,255,.12)", borderRadius:14, padding:"12px 16px", flex:1 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.5)" }}>Applicants</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginTop:4 }}>{job.applicants===0?"🌟 Be first!":job.applicants}</div>
            </div>
          </div>
        </div>

        <div style={{ padding:"16px 20px" }}>
          {/* Photo placeholder gallery */}
          {job.photos&&<div style={{ display:"flex", gap:8, marginBottom:16, overflowX:"auto" }}>
            {job.photos.map((p,i)=>(<div key={i} style={{ width:100, height:80, borderRadius:14, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0, border:`1.5px solid ${G.border}` }}>{p}</div>))}
            <div style={{ width:100, height:80, borderRadius:14, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:G.muted, fontWeight:700, flexShrink:0, border:`1.5px dashed ${G.border}` }}>📷 +{Math.floor(Math.random()*3)+1}</div>
          </div>}

          {/* Tags */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
            {job.tags.map(t=><Tag key={t}>{t}</Tag>)}
            <Tag bg={G.greenPale} color={G.green}>{cat?.label}</Tag>
            {job.verified&&<Tag bg="#EBF8FF" color={G.blue}>✅ Verified</Tag>}
          </div>

          {/* Description */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>About This Job</div>
            <div style={{ fontSize:14, color:G.text, lineHeight:1.7 }}>{job.desc||"No description provided."}</div>
          </div>

          {/* Poster profile */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Posted By</div>
            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
              <Avatar name={job.poster} size={48} bg={G.sand} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:G.text }}>{job.poster}</div>
                <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>{job.verified?"✅ Verified · ":""}Member since {job.posterSince||"2024"}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              {[{l:"Rating",v:`⭐ ${job.posterRating||"4.8"}`},{l:"Jobs Posted",v:job.posterJobs||"5"},{l:"Response",v:"< 2hr"}].map(s=>(
                <div key={s.l} style={{ flex:1, background:G.sand, borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:700, color:G.greenMid }}>{s.v}</div>
                  <div style={{ fontSize:10, color:G.muted, marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow info */}
          <div style={{ background:G.greenPale, borderRadius:16, padding:14, marginBottom:16, border:`1px solid ${G.greenLight}`, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:20 }}>🛡️</span>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:G.greenMid, marginBottom:4 }}>Payment Protected</div>
              <div style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>This job uses escrow. ${job.pay} will be held securely and only released when the poster confirms completion.</div>
            </div>
          </div>

          {/* Location */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)", marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Location</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontSize:20 }}>📍</span>
              <div><div style={{ fontWeight:600, fontSize:14 }}>{job.loc}</div><div style={{ fontSize:12, color:G.muted }}>{job.dist} miles from you · Zip {userZip}</div></div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={()=>{const u=/iPad|iPhone|iPod/.test(navigator.userAgent)?`maps://maps.apple.com/?daddr=${job.lat},${job.lng}&dirflg=d`:`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`;window.open(u,"_blank");}} variant="outline" style={{ flex:1, padding:"10px", fontSize:12 }}>🧭 Get Directions</Btn>
              <Btn onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${job.lat},${job.lng}`,"_blank")} variant="ghost" style={{ padding:"10px 14px", fontSize:14 }}>🗺️</Btn>
            </div>
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"12px 20px 24px", background:"rgba(255,255,255,.95)", backdropFilter:"blur(12px)", borderTop:`1px solid ${G.border}`, zIndex:40, display:"flex", gap:10 }}>
          {role==="poster"
            ? <Btn onClick={()=>{onCheckout(job);setSelectedJob(null);}} style={{ flex:1, padding:16, borderRadius:16, fontSize:15 }}>💳 Hire & Pay ${job.pay}</Btn>
            : hasApplied
              ? <Btn variant="ghost" style={{ flex:1, padding:16, borderRadius:16, fontSize:15 }}>✓ Application Sent</Btn>
              : <Btn onClick={()=>{if(isGuest){onGuestAction();return;}setApplyModal(job);setSelectedJob(null);}} style={{ flex:1, padding:16, borderRadius:16, fontSize:15 }}>Apply Now →</Btn>
          }
          <Btn onClick={()=>setSavedJobs(s=>s.includes(job.id)?s.filter(x=>x!==job.id):[...s,job.id])} variant="outline" style={{ padding:"16px 18px", borderRadius:16, fontSize:18, color:savedJobs.includes(job.id)?G.red:"inherit" }}>{savedJobs.includes(job.id)?"♥":"♡"}</Btn>
        </div>
      </div>
    );
  }

  return (
    <div ref={discRef} className="fade">
      {isGuest && (
        <div className="tap" onClick={onGuestAction} style={{ background:"#FFF8E1", padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #FFE082" }}>
          <div style={{ fontSize:12, color:"#795548" }}>Browsing as guest · <span style={{ fontWeight:700, color:G.greenMid }}>Sign up</span> to apply & earn</div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#795548" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      )}
      {!profileVisible && role==="worker" && (
        <div style={{ background:G.redLight, padding:"8px 20px", display:"flex", alignItems:"center", gap:8, borderBottom:`1px solid ${G.red}22` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          <div style={{ fontSize:12, color:G.red, fontWeight:600 }}>Your profile is hidden — posters can't see you. <span style={{ textDecoration:"underline" }}>Change in Settings → Privacy</span></div>
        </div>
      )}
      <div style={{ background:G.green, padding:"14px 20px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:"#fff" }}>Discover Jobs <span style={{ fontSize:13, fontWeight:500, opacity:.7 }}>· Zip {userZip||"60647"}</span></div>
          {/* Filter icon — replaces gear dropdown, opens combined filter+sort panel */}
          <div style={{ position:"relative" }}>
            <div className="tap" onClick={()=>setShowSortMenu(s=>!s)} style={{ width:36, height:36, borderRadius:10, background:showSortMenu?"rgba(255,255,255,.3)":"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              {(activeCategory.length>0||sortBy!=="match")&&<div style={{ position:"absolute", top:-3, right:-3, width:8, height:8, borderRadius:"50%", background:"#52B788", border:"1.5px solid #1B4332" }}/>}
            </div>
            {showSortMenu&&<div onClick={()=>setShowSortMenu(false)} style={{ position:"fixed", inset:0, zIndex:19 }} />}
            {showSortMenu&&(
              <div className="fade" style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:G.white, borderRadius:16, padding:8, boxShadow:"0 8px 30px rgba(0,0,0,.18)", border:`1px solid ${G.border}`, zIndex:20, width:190 }}>
                <div style={{ fontSize:10, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, padding:"4px 10px 8px" }}>Category</div>
                {[{id:"all",label:"All Categories"},...CATEGORIES].map(c=>{
                  const active = c.id==="all" ? activeCategory.length===0 : activeCategory.includes(c.id);
                  return (
                    <div key={c.id} className="tap" onClick={()=>setActiveCategory(a=>c.id==="all"?[]:a.includes(c.id)?a.filter(x=>x!==c.id):[...a,c.id])} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", borderRadius:10, background:active?G.greenPale:"transparent", color:active?G.green:G.text }}>
                      <span style={{ fontSize:13, fontWeight:active?700:500 }}>{c.label}</span>
                      {active&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  );
                })}
                <div style={{ height:1, background:G.border, margin:"8px 0" }}/>
                <div style={{ fontSize:10, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, padding:"4px 10px 8px" }}>Sort By</div>
                {[
                  {id:"match",label:"Best Match"},
                  {id:"pay",label:"Highest Pay"},
                  {id:"distance",label:"Nearest First"},
                  {id:"az",label:"A – Z"},
                ].map(opt=>(
                  <div key={opt.id} className="tap" onClick={()=>{setSortBy(opt.id);setShowSortMenu(false);}} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", borderRadius:10, background:sortBy===opt.id?G.greenPale:"transparent", color:sortBy===opt.id?G.green:G.text }}>
                    <span style={{ fontSize:13, fontWeight:sortBy===opt.id?700:500 }}>{opt.label}</span>
                    {sortBy===opt.id&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {(
        <div style={{ padding:"14px 20px" }}>
          {role==="poster"&&(
            <div style={{ marginBottom:12 }}>
              <div className="tap card" onClick={onPostJob} style={{ background:`linear-gradient(130deg,${G.green} 0%,${G.greenLight} 100%)`, borderRadius:18, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 6px 24px rgba(27,67,50,.35)" }}>
                <div><div style={{ color:"#fff", fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:18 }}>Post a New Job</div><div style={{ color:"rgba(255,255,255,.75)", fontSize:13, marginTop:2 }}>Match with trusted workers nearby</div></div>
                <div style={{ background:"rgba(255,255,255,.2)", borderRadius:12, width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>＋</div>
              </div>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map((job,i)=>(
              <div key={job.id} className="card tap" onClick={()=>setSelectedJob(job)} style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.07)", border:`2px solid ${job.urgent?G.orange:"transparent"}`, position:"relative", overflow:"hidden" }}>
                {job.urgent&&<div style={{ position:"absolute", top:0, right:0, background:G.orange, color:"#fff", fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:"0 16px 0 10px" }}>URGENT</div>}
                {sortBy==="match"&&i<3&&<div style={{ position:"absolute", top:12, left:-2, background:G.green, color:"#fff", fontSize:9, fontWeight:800, padding:"3px 8px 3px 10px", borderRadius:"0 8px 8px 0" }}>TOP MATCH</div>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:sortBy==="match"&&i<3?14:0 }}>
                  <div style={{ flex:1, paddingRight:8 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:G.text, lineHeight:1.3 }}>{job.title}</div>
                    <div style={{ fontSize:12, color:G.muted, marginTop:3 }}>{job.verified?"✅ ":""}{job.poster} · 📍 {job.dist}mi · {job.loc}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, color:G.greenMid }}>${job.pay}</div>
                    <div style={{ fontSize:10, color:G.muted, marginTop:1 }}>you get ${(job.pay*.92).toFixed(0)}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>{job.tags.map(t=><Tag key={t}>{t}</Tag>)}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, padding:"8px 12px", borderRadius:10, background:"#F0F7FF", border:"1px solid #D6E8FA" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span style={{ fontSize:13, fontWeight:700, color:G.blue }}>{job.date}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
                  <span style={{ fontSize:12, color:G.muted }}>{job.applicants===0?"🌟 Be first!":`${job.applicants} applied`}</span>
                  <div style={{ display:"flex", gap:6 }} onClick={e=>e.stopPropagation()}>
                    {role==="poster"&&<Btn onClick={()=>onCheckout(job)} variant="orange" style={{ padding:"7px 14px", fontSize:12 }}>💳 Hire & Pay</Btn>}
                    <Btn onClick={()=>{if(isGuest){onGuestAction();return;}if(!applied.includes(job.id))setApplyModal(job); else setApplied(a=>a);}} variant={applied.includes(job.id)?"ghost":"primary"} style={{ padding:"7px 16px", fontSize:12 }}>{applied.includes(job.id)?"✓ Applied":"Quick Apply"}</Btn>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length===0&&<div style={{ textAlign:"center", padding:"40px 20px", color:G.muted }}><div style={{ fontSize:36, marginBottom:10 }}>🔍</div><div style={{ fontWeight:700, fontSize:16 }}>No jobs match</div><div style={{ fontSize:13, marginTop:6 }}>Try adjusting filters</div></div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function AdminDashboard() {
  return (
    <div className="fade" style={{ background:"#0F1923", minHeight:"100vh", fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#0F1923 0%,#1B4332 100%)", padding:"14px 20px 20px", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:G.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚙️</div>
          <div><div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, color:"#fff" }}>Chores Admin</div><div style={{ fontSize:11, color:"rgba(255,255,255,.5)" }}>Dashboard · Zip 60647</div></div>
        </div>
      </div>
      <div style={{ padding:16 }}>
        <div className="fade">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {[{label:"Total Jobs",value:ADMIN_STATS.totalJobs.toLocaleString(),sub:`${ADMIN_STATS.activeJobs} active`,icon:"📋",color:G.greenLight},{label:"Workers",value:ADMIN_STATS.totalWorkers.toLocaleString(),sub:`${ADMIN_STATS.activeWorkers} active`,icon:"💼",color:"#63B3ED"},{label:"Posters",value:ADMIN_STATS.totalPosters.toLocaleString(),sub:`${ADMIN_STATS.activePosters} active`,icon:"🏠",color:G.gold},{label:"Revenue",value:`$${ADMIN_STATS.revenue.toLocaleString()}`,sub:`$${ADMIN_STATS.revenueToday} today`,icon:"💰",color:"#9F7AEA"}].map(s=>(
              <div key={s.label} className="stat-card" style={{ background:"rgba(255,255,255,.06)", borderRadius:16, padding:14, border:"1px solid rgba(255,255,255,.08)" }}>
                <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.7)", marginTop:2, fontWeight:600 }}>{s.label}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"rgba(255,255,255,.06)", borderRadius:16, padding:16, border:"1px solid rgba(255,255,255,.08)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Live Activity</div>
            {ADMIN_STATS.recentActivity.map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 0", borderBottom:i<6?"1px solid rgba(255,255,255,.06)":"none" }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1, fontSize:13, color:"rgba(255,255,255,.85)" }}>{a.text}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", flexShrink:0 }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ONBOARDING / SIGN-UP FLOW
// ═══════════════════════════════════════════════════════════════════════════
const OI_ICONS = {
  lawn: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M8 22h8"/><path d="M12 8a4 4 0 0 0-4-4c0 2.5 1.5 4 4 4z"/><path d="M12 8a4 4 0 0 1 4-4c0 2.5-1.5 4-4 4z"/></svg>,
  pets: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/><path d="M8.5 14c-1.5-1-3-2.5-2.5-5C7 9 8.5 11 11 12.5c2.5-1.5 4-3.5 5-3.5.5 2.5-1 4-2.5 5-1.5 1-2 3-2 5h-2c0-2-.5-4-1-5z"/></svg>,
  cleaning: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h18"/><path d="M8 22V10c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v12"/><path d="M10 8V5c0-.6.4-1 1-1h2c.6 0 1 .4 1 1v3"/><line x1="12" y1="14" x2="12" y2="18"/></svg>,
  babysitting: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/><path d="M9.5 7.5c.5-.5 1.5-.5 2 0"/><circle cx="10" cy="9" r=".5" fill={c}/><circle cx="14" cy="9" r=".5" fill={c}/><path d="M10.5 11.5c.7.5 2.3.5 3 0"/></svg>,
  moving: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M10 8V6a2 2 0 0 1 4 0v2"/><line x1="3" y1="14" x2="21" y2="14"/></svg>,
  painting: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 11v5"/><path d="M8 16h8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/></svg>,
  errands: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  windows: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  tech: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  cooking: (c)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M8 4v2"/><path d="M16 4v2"/><path d="M3 10h18a1 1 0 0 1 1 1v1a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8v-1a1 1 0 0 1 1-1z"/></svg>,
};

const ONBOARD_INTERESTS = [
  { id:"lawn", label:"Lawn & Garden" },
  { id:"pets", label:"Pet Care" },
  { id:"cleaning", label:"Cleaning" },
  { id:"babysitting", label:"Babysitting" },
  { id:"moving", label:"Moving / Lifting" },
  { id:"painting", label:"Painting" },
  { id:"errands", label:"Errands" },
  { id:"windows", label:"Windows" },
  { id:"tech", label:"Tech Help" },
  { id:"cooking", label:"Cooking" },
  { id:"other", label:"Other" },
];

function OnbInput({ icon, placeholder, value, onChange, type="text", extra }) {
  return (
    <div style={{ position:"relative", flex:1 }}>
      {icon&&<div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, opacity:.5 }}>{icon}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:"100%", padding:`15px 14px 15px ${icon?42:14}px`, borderRadius:14, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", background:G.white, transition:"border .2s", outline:"none" }}
        onFocus={e=>e.target.style.borderColor=G.greenLight}
        onBlur={e=>e.target.style.borderColor=G.border}
      />
      {extra}
    </div>
  );
}

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0); // 0=splash, 1=welcome, 2=role, 3=info, 4=interests, 5=zip, 6=verify-email, 7=verify-id, 8=done
  const [onbRole, setOnbRole] = useState(null);
  const [form, setForm] = useState({ first:"", last:"", email:"", phone:"", password:"" });
  const [interests, setInterests] = useState([]);
  const [zip, setZip] = useState("");
  const [zipCity, setZipCity] = useState(null); // { city, state } from API
  const [showPw, setShowPw] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [customInterest, setCustomInterest] = useState("");

  // Verification state
  const [emailCode, setEmailCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [idError, setIdError] = useState("");
  const [idSessionId, setIdSessionId] = useState(null);
  const [idPolling, setIdPolling] = useState(false);

  const nextStep = () => { setAnimKey(k=>k+1); setStep(s=>s+1); };
  const prevStep = () => { setAnimKey(k=>k+1); setStep(s=>s-1); };

  const totalSteps = 9;
  const progress = ((step) / (totalSteps - 1)) * 100;

  const carousel = [
    { title:"Your neighborhood,\nyour marketplace", sub:"Find jobs or post tasks — from lawn care to pet sitting, all within walking distance.",
      svg:<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { title:"Payments you\ncan trust", sub:"Built-in escrow holds funds securely. Workers get paid, posters stay protected.",
      svg:<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { title:"Build your\nreputation", sub:"Earn ratings, unlock badges, and become your neighborhood's go-to helper.",
      svg:<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  ];

  // Step 0 — Splash / landing
  if (step === 0) return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:`linear-gradient(165deg, ${G.green} 0%, #143728 40%, #0D2818 100%)`, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>
      {/* Decorative circles */}
      <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(82,183,136,.08)" }} />
      <div style={{ position:"absolute", bottom:120, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(82,183,136,.06)" }} />
      <div style={{ position:"absolute", top:200, right:-20, width:100, height:100, borderRadius:"50%", border:"1px solid rgba(82,183,136,.1)" }} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px 32px", textAlign:"center" }}>
        {/* Logo */}
        <div className="onb-scale" style={{ marginBottom:12 }}>
          <div style={{ width:80, height:80, borderRadius:24, background:"rgba(255,255,255,.1)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,.1)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </div>
        <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:900, color:"#fff", letterSpacing:1, lineHeight:1.1 }}>Chores<span style={{ color:G.greenLight }}>.</span></div>
        <div className="onb-fade" style={{ fontSize:15, color:"rgba(255,255,255,.5)", marginTop:10, lineHeight:1.5, animationDelay:".15s", opacity:0 }}>The neighborhood job marketplace<br/>where community meets opportunity</div>

        {/* Feature pills */}
        <div className="onb-fade" style={{ display:"flex", gap:8, marginTop:32, flexWrap:"wrap", justifyContent:"center", animationDelay:".3s", opacity:0 }}>
          {[
            {label:"Escrow Payments", svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>},
            {label:"Verified Profiles", svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>},
            {label:"Hyper-local", svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
          ].map((t,i)=>(
            <div key={i} style={{ padding:"8px 16px", borderRadius:30, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.08)", fontSize:12, color:"rgba(255,255,255,.7)", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>{t.svg} {t.label}</div>
          ))}
        </div>

        {/* Floating job previews */}
        <div className="onb-fade" style={{ marginTop:40, position:"relative", width:"100%", height:80, animationDelay:".45s", opacity:0 }}>
          {[{ x:10, y:0, txt:"Mow Lawn · $35", delay:0, svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M8 22h8"/></svg> },
            { x:55, y:20, txt:"Dog Walk · $20", delay:.5, svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/></svg> },
            { x:25, y:50, txt:"Deep Clean · $65", delay:1, svg:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h18"/><path d="M8 22V10c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v12"/></svg> }
          ].map((p,i)=>(
            <div key={i} className="onb-float" style={{ position:"absolute", left:`${p.x}%`, top:p.y, background:"rgba(255,255,255,.1)", backdropFilter:"blur(6px)", borderRadius:12, padding:"8px 14px", fontSize:12, color:"rgba(255,255,255,.8)", fontWeight:600, border:"1px solid rgba(255,255,255,.06)", animationDelay:`${p.delay}s`, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5 }}>{p.svg} {p.txt}</div>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 32px 48px" }}>
        <button className="btn" onClick={nextStep} style={{ width:"100%", padding:"17px", borderRadius:16, background:G.greenLight, color:"#fff", fontSize:16, fontWeight:700, letterSpacing:.3 }}>Get Started</button>
        <div style={{ textAlign:"center", marginTop:16 }}>
          <span className="tap" onClick={()=>onComplete("worker")} style={{ fontSize:13, color:"rgba(255,255,255,.4)", fontWeight:500 }}>Already have an account? <span style={{ color:G.greenLight, fontWeight:700 }}>Sign in</span></span>
        </div>
        <div style={{ textAlign:"center", marginTop:12 }}>
          <span className="tap" onClick={()=>onComplete("guest")} style={{ fontSize:13, color:"rgba(255,255,255,.3)", fontWeight:500 }}>Continue as Guest →</span>
        </div>
      </div>
    </div>
  );

  // Step 1 — Welcome carousel
  if (step === 1) return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div className="tap" onClick={prevStep} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div>
        <div className="tap" onClick={()=>setStep(2)} style={{ fontSize:13, color:G.greenMid, fontWeight:700 }}>Skip</div>
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"20px 36px", textAlign:"center" }}>
        <div key={carouselIdx} className="onb-scale" style={{ marginBottom:24, width:80, height:80, borderRadius:24, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center" }}>{carousel[carouselIdx].svg}</div>
        <div key={`t${carouselIdx}`} className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:800, color:G.text, lineHeight:1.2, whiteSpace:"pre-line" }}>{carousel[carouselIdx].title}</div>
        <div key={`s${carouselIdx}`} className="onb-fade" style={{ fontSize:14, color:G.muted, marginTop:14, lineHeight:1.6, animationDelay:".12s", opacity:0 }}>{carousel[carouselIdx].sub}</div>

        {/* Dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:32 }}>
          {carousel.map((_,i)=>(
            <div key={i} onClick={()=>setCarouselIdx(i)} className="tap" style={{ width:i===carouselIdx?24:8, height:8, borderRadius:4, background:i===carouselIdx?G.green:"#D1D5DB", transition:"all .3s ease" }} />
          ))}
        </div>
      </div>

      <div style={{ padding:"0 32px 48px" }}>
        <button className="btn" onClick={()=>{
          if (carouselIdx < carousel.length - 1) setCarouselIdx(i=>i+1);
          else nextStep();
        }} style={{ width:"100%", padding:"17px", borderRadius:16, background:G.green, color:"#fff", fontSize:15, fontWeight:700 }}>{carouselIdx < carousel.length - 1 ? "Next" : "Let's Go →"}</button>
      </div>
    </div>
  );

  // Step 2 — Choose role
  if (step === 2) return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <div className="tap" onClick={prevStep} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div>
      </div>
      {/* Progress */}
      <div style={{ padding:"16px 32px 0" }}>
        <div style={{ height:4, borderRadius:2, background:G.border }}><div className="progress-fill" style={{ height:"100%", borderRadius:2, background:G.greenLight, width:`${progress}%` }} /></div>
        <div style={{ fontSize:11, color:G.muted, marginTop:6, fontWeight:600 }}>Step 1 of 5</div>
      </div>

      <div style={{ flex:1, padding:"32px", display:"flex", flexDirection:"column" }}>
        <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.text, lineHeight:1.2 }}>How will you<br/>use Chores?</div>
        <div className="onb-fade" style={{ fontSize:14, color:G.muted, marginTop:8, animationDelay:".1s", opacity:0 }}>You can always switch later</div>

        <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:28 }}>
          {[
            { id:"worker", title:"Find Jobs", sub:"Browse and apply to neighborhood tasks. Get paid securely via escrow.", features:["Browse local jobs","Earn money","Build ratings"] },
            { id:"poster", title:"Post Jobs", sub:"Hire trusted neighbors for tasks around your home. Funds held safely.", features:["Post tasks","Find helpers","Escrow protection"] },
            { id:"both", title:"Both", sub:"Post jobs and find work — the full neighborhood marketplace experience.", features:["Maximum flexibility","Earn & hire","Full access"] },
          ].map((r,i)=>(
            <div key={r.id} className={`tap card onb-slide-l`} onClick={()=>setOnbRole(r.id)} style={{
              padding:20, borderRadius:18, background:G.white, border:`2px solid ${onbRole===r.id?G.greenLight:G.border}`,
              boxShadow:onbRole===r.id?"0 4px 20px rgba(82,183,136,.2)":"0 2px 8px rgba(0,0,0,.04)",
              animationDelay:`${i*.1}s`, opacity:0, position:"relative", overflow:"hidden",
              transition:"border .2s, box-shadow .2s"
            }}>
              {onbRole===r.id&&<div style={{ position:"absolute", top:14, right:14, width:24, height:24, borderRadius:"50%", background:G.greenLight, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:"#fff", fontSize:14, fontWeight:800 }}>✓</span></div>}
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:48, height:48, borderRadius:14, background:onbRole===r.id?G.greenPale:G.sand, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background .2s" }}>
                  {r.id==="worker"&&<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={onbRole===r.id?G.green:G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3V7z"/><path d="M14 9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9z"/></svg>}
                  {r.id==="poster"&&<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={onbRole===r.id?G.green:G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>}
                  {r.id==="both"&&<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={onbRole===r.id?G.green:G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:16, color:G.text }}>{r.title}</div>
                  <div style={{ fontSize:12, color:G.muted, marginTop:3, lineHeight:1.4 }}>{r.sub}</div>
                  <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                    {r.features.map(f=><span key={f} style={{ fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:6, background:onbRole===r.id?"rgba(82,183,136,.1)":G.sand, color:onbRole===r.id?G.greenMid:G.muted, transition:"all .2s" }}>{f}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 32px 48px" }}>
        <button className="btn" onClick={nextStep} disabled={!onbRole} style={{ width:"100%", padding:"17px", borderRadius:16, background:onbRole?G.green:"#ccc", color:"#fff", fontSize:15, fontWeight:700, opacity:onbRole?1:.5, transition:"all .2s" }}>Continue</button>
      </div>
    </div>
  );

  // Step 3 — Account info
  if (step === 3) return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <div className="tap" onClick={prevStep} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div>
      </div>
      <div style={{ padding:"16px 32px 0" }}>
        <div style={{ height:4, borderRadius:2, background:G.border }}><div className="progress-fill" style={{ height:"100%", borderRadius:2, background:G.greenLight, width:`${progress}%` }} /></div>
        <div style={{ fontSize:11, color:G.muted, marginTop:6, fontWeight:600 }}>Step 2 of 5</div>
      </div>

      <div style={{ flex:1, padding:"28px 32px", display:"flex", flexDirection:"column" }}>
        <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.text, lineHeight:1.2 }}>Create your<br/>account</div>
        <div className="onb-fade" style={{ fontSize:14, color:G.muted, marginTop:8, animationDelay:".1s", opacity:0 }}>We just need a few details</div>

        <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:24 }}>
          <div style={{ display:"flex", gap:10 }}>
            <OnbInput icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} placeholder="First name" value={form.first} onChange={e=>setForm(f=>({...f,first:e.target.value}))} />
            <OnbInput icon="" placeholder="Last name" value={form.last} onChange={e=>setForm(f=>({...f,last:e.target.value}))} />
          </div>
          <OnbInput icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} placeholder="Email address" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} type="email" />
          <OnbInput icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68a2 2 0 0 1 1.72 2.03z"/></svg>} placeholder="Phone number" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} type="tel" />
          <OnbInput icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} placeholder="Create password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} type={showPw?"text":"password"}
            extra={<div className="tap" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center" }}>
              {showPw
                ?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </div>}
          />
          {form.password && (
            <div style={{ display:"flex", gap:4, padding:"0 4px" }}>
              {[form.password.length>=8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].map((ok,i)=>(
                <div key={i} style={{ flex:1, height:3, borderRadius:2, background:ok?G.greenLight:G.border, transition:"background .3s" }} />
              ))}
            </div>
          )}
        </div>

        {/* Social sign up */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0" }}>
          <div style={{ flex:1, height:1, background:G.border }} />
          <span style={{ fontSize:12, color:G.muted, fontWeight:600 }}>or continue with</span>
          <div style={{ flex:1, height:1, background:G.border }} />
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {[{icon:"G", label:"Google", bg:"#fff"},{icon:"", label:"Apple", bg:"#000", color:"#fff"},{icon:"f", label:"Facebook", bg:"#1877F2", color:"#fff"}].map(s=>(
            <button key={s.label} className="btn tap" style={{ flex:1, padding:"13px", borderRadius:14, background:s.bg, color:s.color||G.text, fontSize:14, fontWeight:700, border:`1.5px solid ${s.bg==="#fff"?G.border:s.bg}`, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <span style={{ fontSize:16 }}>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 32px 48px" }}>
        <button className="btn" onClick={nextStep} disabled={!form.first||!form.email||!form.password} style={{ width:"100%", padding:"17px", borderRadius:16, background:(form.first&&form.email&&form.password)?G.green:"#ccc", color:"#fff", fontSize:15, fontWeight:700, opacity:(form.first&&form.email&&form.password)?1:.5, transition:"all .2s" }}>Continue</button>
      </div>
    </div>
  );

  // Step 4 — Interests
  if (step === 4) return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <div className="tap" onClick={prevStep} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div>
      </div>
      <div style={{ padding:"16px 32px 0" }}>
        <div style={{ height:4, borderRadius:2, background:G.border }}><div className="progress-fill" style={{ height:"100%", borderRadius:2, background:G.greenLight, width:`${progress}%` }} /></div>
        <div style={{ fontSize:11, color:G.muted, marginTop:6, fontWeight:600 }}>Step 3 of 5</div>
      </div>

      <div style={{ flex:1, padding:"28px 32px" }}>
        <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.text, lineHeight:1.2 }}>{onbRole==="poster"?"What kind of\nhelp do you need?":"What can\nyou do?"}</div>
        <div className="onb-fade" style={{ fontSize:14, color:G.muted, marginTop:8, animationDelay:".1s", opacity:0 }}>Select all that apply — {interests.length} selected</div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:24 }}>
          {ONBOARD_INTERESTS.map((cat,i)=>{
            const sel=interests.includes(cat.id);
            if (cat.id === "other") return (
              <div key="other" style={{ gridColumn:"1/-1" }}>
                <div className="tap onb-slide-l" onClick={()=>setInterests(sel?interests.filter(x=>x!=="other"):[...interests,"other"])} style={{
                  padding:"16px 14px", borderRadius:16, background:sel?G.greenPale:G.white, border:`2px solid ${sel?G.greenLight:G.border}`,
                  display:"flex", alignItems:"center", gap:10, transition:"all .2s", animationDelay:`${i*.04}s`, opacity:0,
                  boxShadow:sel?"0 2px 12px rgba(82,183,136,.15)":"none"
                }}>
                  <span style={{ fontSize:22 }}>✏️</span>
                  <span style={{ fontSize:13, fontWeight:sel?700:500, color:sel?G.green:G.text }}>Other</span>
                  {sel&&<span style={{ marginLeft:"auto", fontSize:12, color:G.greenLight }}>✓</span>}
                </div>
                {sel&&(
                  <input
                    value={customInterest}
                    onChange={e=>setCustomInterest(e.target.value)}
                    placeholder="Describe your skill (e.g. Tile installation, Piano lessons...)"
                    style={{ width:"100%", marginTop:8, padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.greenLight}`, fontSize:14, background:G.white, boxSizing:"border-box", outline:"none" }}
                    autoFocus
                  />
                )}
              </div>
            );
            return (
              <div key={cat.id} className="tap onb-slide-l" onClick={()=>setInterests(sel?interests.filter(x=>x!==cat.id):[...interests,cat.id])} style={{
                padding:"16px 14px", borderRadius:16, background:sel?G.greenPale:G.white, border:`2px solid ${sel?G.greenLight:G.border}`,
                display:"flex", alignItems:"center", gap:10, transition:"all .2s",
                animationDelay:`${i*.04}s`, opacity:0, boxShadow:sel?"0 2px 12px rgba(82,183,136,.15)":"none"
              }}>
                <span style={{ fontSize:24, display:"flex", alignItems:"center", justifyContent:"center", width:28, height:28 }}>{OI_ICONS[cat.id]?OI_ICONS[cat.id](sel?G.green:G.muted):cat.label.charAt(0)}</span>
                <span style={{ fontSize:13, fontWeight:sel?700:500, color:sel?G.green:G.text }}>{cat.label}</span>
                {sel&&<span style={{ marginLeft:"auto", fontSize:12, color:G.greenLight }}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding:"0 32px 48px" }}>
        <button className="btn" onClick={nextStep} disabled={interests.length===0} style={{ width:"100%", padding:"17px", borderRadius:16, background:interests.length>0?G.green:"#ccc", color:"#fff", fontSize:15, fontWeight:700, opacity:interests.length>0?1:.5, transition:"all .2s" }}>Continue · {interests.length} selected</button>
      </div>
    </div>
  );

  // Step 5 — Zip code / location
  if (step === 5) return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <div className="tap" onClick={prevStep} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div>
      </div>
      <div style={{ padding:"16px 32px 0" }}>
        <div style={{ height:4, borderRadius:2, background:G.border }}><div className="progress-fill" style={{ height:"100%", borderRadius:2, background:G.greenLight, width:`${progress}%` }} /></div>
        <div style={{ fontSize:11, color:G.muted, marginTop:6, fontWeight:600 }}>Step 4 of 5</div>
      </div>

      <div style={{ flex:1, padding:"28px 32px", display:"flex", flexDirection:"column" }}>
        <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.text, lineHeight:1.2 }}>Where are you<br/>located?</div>
        <div className="onb-fade" style={{ fontSize:14, color:G.muted, marginTop:8, animationDelay:".1s", opacity:0 }}>We'll show you jobs nearby</div>

        <div style={{ marginTop:28, position:"relative" }}>
          <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <input value={zip} onChange={e=>{
            const val = e.target.value.replace(/\D/g,"").slice(0,5);
            setZip(val);
            setZipCity(null);
            if (val.length===5) {
              fetch(`https://api.zippopotam.us/us/${val}`)
                .then(r=>r.ok?r.json():null)
                .then(d=>{ if(d) setZipCity({ city:d.places[0]["place name"], state:d.places[0]["state abbreviation"] }); })
                .catch(()=>{});
            }
          }} placeholder="Enter zip code"
            style={{ width:"100%", padding:"20px 20px 20px 48px", borderRadius:18, border:`2px solid ${zip.length===5?G.greenLight:G.border}`, fontSize:16, fontWeight:600, fontFamily:"'Outfit',sans-serif", letterSpacing:2, textAlign:"center", background:G.white, transition:"border .2s", outline:"none" }}
          />
          {zip.length===5&&<div className="onb-check" style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", width:28, height:28, borderRadius:"50%", background:G.greenLight, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:15, fontWeight:800 }}>✓</div>}
        </div>

        {zip.length===5&&(
          <div className="onb-fade" style={{ marginTop:20, padding:16, borderRadius:14, background:G.greenPale, border:`1px solid ${G.greenLight}30` }}>
            <div style={{ fontWeight:700, fontSize:14, color:G.green, display:"flex", alignItems:"center", gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {zipCity ? `${zipCity.city}, ${zipCity.state} (Zip ${zip})` : `Zip ${zip} — looking up…`}
            </div>
            <div style={{ fontSize:12, color:G.greenMid, marginTop:4 }}>8 active jobs within 2 miles</div>
            <div style={{ display:"flex", gap:6, marginTop:8 }}>
              {["3 Lawn","2 Pets","3 Clean"].map(t=><span key={t} style={{ fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:6, background:"rgba(255,255,255,.7)", color:G.greenMid }}>{t}</span>)}
            </div>
          </div>
        )}

        <div className="tap" onClick={()=>{
          if (!navigator.geolocation) { alert("Location not supported on this device."); return; }
          navigator.geolocation.getCurrentPosition(
            pos => {
              // Reverse geocode to get zip — for now set a placeholder and let user confirm
              setZip(""); // clear first
              alert("Location detected! Please enter your zip code to confirm your area.");
            },
            err => {
              if (err.code === 1) alert("Location permission denied. Please enable location services in your browser settings, or enter your zip code manually.");
              else alert("Could not detect location. Please enter your zip code manually.");
            }
          );
        }} style={{ display:"flex", alignItems:"center", gap:10, marginTop:20, padding:14, borderRadius:14, background:G.white, border:`1.5px solid ${G.border}` }}>
          <div style={{ width:36, height:36, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:G.text }}>Use my current location</div>
            <div style={{ fontSize:11, color:G.muted }}>Auto-detect via GPS</div>
          </div>
          <div style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Enable →</div>
        </div>
      </div>

      <div style={{ padding:"0 32px 48px" }}>
        <button className="btn" onClick={nextStep} disabled={zip.length!==5} style={{ width:"100%", padding:"17px", borderRadius:16, background:zip.length===5?G.green:"#ccc", color:"#fff", fontSize:15, fontWeight:700, opacity:zip.length===5?1:.5, transition:"all .2s" }}>Continue</button>
      </div>
    </div>
  );

  // Step 6 — Email Verification
  if (step === 6) {
    const sendCode = async () => {
      setEmailSending(true); setEmailError("");
      try {
        const res = await fetch(`${BACKEND}/api/verify/email/send`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ email: form.email, name: form.first }),
        });
        const data = await res.json();
        if (data.error) { setEmailError(data.error); } else { setEmailSent(true); }
      } catch(e) {
        setEmailError("Could not reach server — make sure your backend is deployed and RESEND_API_KEY is set in Railway.");
      }
      setEmailSending(false);
    };
    const checkCode = async () => {
      setEmailError("");
      try {
        const res = await fetch(`${BACKEND}/api/verify/email/check`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ email: form.email, code: emailCode }),
        });
        const data = await res.json();
        if (data.verified) { setEmailVerified(true); setTimeout(nextStep, 900); }
        else { setEmailError("Incorrect code — please try again."); }
      } catch(e) { setEmailError("Network error — please try again."); }
    };
    return (
      <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
        <style>{CSS}</style>
        <div style={{ padding:"20px 20px 0" }}><div className="tap" onClick={prevStep} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div></div>
        <div style={{ padding:"16px 32px 0" }}>
          <div style={{ height:4, borderRadius:2, background:G.border }}><div className="progress-fill" style={{ height:"100%", borderRadius:2, background:G.greenLight, width:`${progress}%` }} /></div>
          <div style={{ fontSize:11, color:G.muted, marginTop:6, fontWeight:600 }}>Step 5 of 7 · Email Verification</div>
        </div>
        <div style={{ flex:1, padding:"32px", display:"flex", flexDirection:"column" }}>
          <div style={{ width:64, height:64, borderRadius:20, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          {emailVerified ? (
            <div style={{ textAlign:"center", paddingTop:40 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:G.green }}>Email Verified!</div>
              <div style={{ fontSize:14, color:G.muted, marginTop:8 }}>Moving to the next step…</div>
            </div>
          ) : !emailSent ? (<>
            <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.text, lineHeight:1.2 }}>Verify your<br/>email address</div>
            <div className="onb-fade" style={{ fontSize:14, color:G.muted, marginTop:8, lineHeight:1.5, animationDelay:".1s", opacity:0 }}>We'll send a 6-digit code to<br/><strong style={{ color:G.text }}>{form.email}</strong></div>
            <div style={{ marginTop:24, padding:16, borderRadius:16, background:G.white, border:`1.5px solid ${G.border}` }}>
              {[
                { icon:"lock", text:"Your email is never shared with other users" },
                { icon:"check", text:"Required to post jobs or get hired" },
                { icon:"clock", text:"Takes less than 30 seconds" },
              ].map(({icon,text},i,a)=>(
                <div key={text} style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 0", borderBottom:i<a.length-1?`1px solid ${G.border}`:"none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, opacity:.5 }}>
                    {icon==="lock" && <path d="M7 11V7a5 5 0 0 1 10 0v4"/>}
                    {icon==="lock" && <rect x="3" y="11" width="18" height="11" rx="2"/>}
                    {icon==="check" && <polyline points="20 6 9 17 4 12"/>}
                    {icon==="clock" && <circle cx="12" cy="12" r="10"/>}
                    {icon==="clock" && <polyline points="12 6 12 12 16 14"/>}
                  </svg>
                  <span style={{ fontSize:13, color:G.muted }}>{text}</span>
                </div>
              ))}
            </div>
            {emailError && <div style={{ color:G.red, fontSize:13, fontWeight:600, marginTop:12 }}>⚠️ {emailError}</div>}
            <div style={{ marginTop:"auto", paddingTop:24 }}>
              <Btn onClick={sendCode} disabled={emailSending} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>
                {emailSending ? "Sending…" : "Send Verification Code →"}
              </Btn>
            </div>
          </>) : (<>
            <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.text, lineHeight:1.2 }}>Check your<br/>inbox</div>
            <div className="onb-fade" style={{ fontSize:14, color:G.muted, marginTop:8, lineHeight:1.5, animationDelay:".1s", opacity:0 }}>Enter the 6-digit code sent to<br/><strong style={{ color:G.text }}>{form.email}</strong></div>
            <div style={{ marginTop:28 }}>
              <input value={emailCode} onChange={e=>setEmailCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                placeholder="000000" maxLength={6}
                style={{ width:"100%", padding:"18px", borderRadius:16, border:`2px solid ${emailCode.length===6?G.greenLight:G.border}`, fontSize:28, fontWeight:800, letterSpacing:8, textAlign:"center", fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box", transition:"border .2s" }}
              />
              {emailError && <div style={{ color:G.red, fontSize:13, fontWeight:600, marginTop:8 }}>⚠️ {emailError}</div>}
              <div className="tap" onClick={sendCode} style={{ fontSize:12, color:G.greenMid, fontWeight:700, marginTop:12, textAlign:"center" }}>Didn't get it? Resend code</div>
            </div>
            <div style={{ marginTop:"auto", paddingTop:24 }}>
              <Btn onClick={checkCode} disabled={emailCode.length !== 6} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15, opacity:emailCode.length===6?1:.5 }}>
                Verify Code →
              </Btn>
            </div>
          </>)}
        </div>
      </div>
    );
  }

  // Step 7 — Government ID Verification (Stripe Identity)
  if (step === 7) {

    const startIdVerification = async () => {
      setIdLoading(true); setIdError("");
      try {
        const res = await fetch(`${BACKEND}/api/verify/identity/start`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ userId: form.email, name:`${form.first} ${form.last}` }),
        });
        const data = await res.json();
        if (data.error) { setIdError(data.error); setIdLoading(false); return; }
        setIdSessionId(data.sessionId);
        // Open Stripe Identity hosted page in new tab
        window.open(data.url, "_blank");
        setIdLoading(false);
      } catch(e) { setIdError("Network error — please try again."); setIdLoading(false); }
    };

    const checkIdResult = async () => {
      if (!idSessionId) { setIdError("Please start verification first."); return; }
      setIdPolling(true); setIdError("");
      try {
        const res = await fetch(`${BACKEND}/api/verify/identity/check`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ sessionId: idSessionId }),
        });
        const data = await res.json();
        if (data.verified) { setIdVerified(true); setTimeout(nextStep, 900); }
        else if (data.status === "processing") { setIdError("Still processing — please check again in a moment."); }
        else { setIdError("Verification not complete yet. Finish the Stripe flow and try again."); }
      } catch(e) { setIdError("Network error — please try again."); }
      setIdPolling(false);
    };
    return (
      <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
        <style>{CSS}</style>
        <div style={{ padding:"20px 20px 0" }}><div className="tap" onClick={prevStep} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div></div>
        <div style={{ padding:"16px 32px 0" }}>
          <div style={{ height:4, borderRadius:2, background:G.border }}><div className="progress-fill" style={{ height:"100%", borderRadius:2, background:G.greenLight, width:`${progress}%` }} /></div>
          <div style={{ fontSize:11, color:G.muted, marginTop:6, fontWeight:600 }}>Step 6 of 7 · Identity Verification</div>
        </div>
        <div style={{ flex:1, padding:"32px", display:"flex", flexDirection:"column" }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"#EBF8FF", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          {idVerified ? (
            <div style={{ textAlign:"center", paddingTop:40 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:G.green }}>Identity Verified!</div>
              <div style={{ fontSize:14, color:G.muted, marginTop:8 }}>Your ID has been confirmed.</div>
            </div>
          ) : (<>
            <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.text, lineHeight:1.2 }}>Verify your<br/>identity</div>
            <div className="onb-fade" style={{ fontSize:14, color:G.muted, marginTop:8, lineHeight:1.5, animationDelay:".1s", opacity:0 }}>A quick ID check so everyone on Chores knows you're real. Powered by Stripe.</div>

            <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:10 }}>
              {[["🪪","Government-issued ID","Driver's license, passport, or national ID"],["🤳","Quick selfie","Liveness check to match your photo"],["🔒","Secure & private","Stripe handles everything — we never see your ID"]].map(([icon,title,sub])=>(
                <div key={title} style={{ display:"flex", gap:14, alignItems:"center", background:G.white, borderRadius:14, padding:"14px 16px", boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
                  <span style={{ fontSize:22 }}>{icon}</span>
                  <div><div style={{ fontWeight:700, fontSize:13, color:G.text }}>{title}</div><div style={{ fontSize:12, color:G.muted, marginTop:2 }}>{sub}</div></div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:16, padding:"12px 16px", borderRadius:12, background:"#EBF8FF", display:"flex", alignItems:"center", gap:10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize:12, color:G.blue, fontWeight:600 }}>One-time verification · $1.50 fee (absorbed by Chores)</span>
            </div>

            {idError && <div style={{ color:G.red, fontSize:13, fontWeight:600, marginTop:12 }}>⚠️ {idError}</div>}

            <div style={{ marginTop:"auto", paddingTop:24, display:"flex", flexDirection:"column", gap:10 }}>
              {!idSessionId ? (
                <Btn onClick={startIdVerification} disabled={idLoading} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>
                  {idLoading ? "Opening Stripe…" : "Start ID Verification →"}
                </Btn>
              ) : (
                <>
                  <Btn onClick={startIdVerification} disabled={idLoading} variant="outline" style={{ width:"100%", padding:14, borderRadius:16, fontSize:14 }}>
                    {idLoading ? "Opening…" : "↗ Reopen Stripe Verification"}
                  </Btn>
                  <Btn onClick={checkIdResult} disabled={idPolling} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>
                    {idPolling ? "Checking…" : "I've Completed Verification ✓"}
                  </Btn>
                </>
              )}
              <div className="tap" onClick={()=>{ setIdVerified(false); nextStep(); }} style={{ textAlign:"center", fontSize:12, color:G.muted, fontWeight:600, padding:8 }}>
                Skip for now (limits posting & applying)
              </div>
            </div>
          </>)}
        </div>
        {idVerified && (
          <div style={{ padding:"0 32px 48px" }}>
            <Btn onClick={nextStep} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>Continue →</Btn>
          </div>
        )}
      </div>
    );
  }

  // Step 8 — Done / success
  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:`linear-gradient(165deg, ${G.green} 0%, #143728 50%, #0D2818 100%)`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:40, position:"relative", overflow:"hidden", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>
      <div style={{ position:"absolute", top:-40, left:-40, width:180, height:180, borderRadius:"50%", background:"rgba(82,183,136,.08)" }} />
      <div style={{ position:"absolute", bottom:80, right:-30, width:140, height:140, borderRadius:"50%", background:"rgba(82,183,136,.06)" }} />

      {/* Success check */}
      <div className="onb-check" style={{ width:88, height:88, borderRadius:"50%", background:"rgba(82,183,136,.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:G.greenLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, color:"#fff" }}>✓</div>
      </div>

      <div className="onb-fade" style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, color:"#fff", lineHeight:1.2 }}>You're all set,<br/>{form.first || "neighbor"}!</div>
      <div className="onb-fade" style={{ fontSize:14, color:"rgba(255,255,255,.5)", marginTop:12, lineHeight:1.6, animationDelay:".15s", opacity:0 }}>Your account is ready. {onbRole==="poster"?"Start posting jobs and find trusted help.":onbRole==="worker"?"Browse local jobs and start earning.":"Post jobs or find work — it's all yours."}</div>

      {/* Summary card */}
      <div className="onb-fade" style={{ width:"100%", marginTop:32, padding:20, borderRadius:18, background:"rgba(255,255,255,.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.1)", textAlign:"left", animationDelay:".3s", opacity:0 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Your Profile</div>
        {[
          { l:"Name", v:`${form.first} ${form.last}`.trim() || "—" },
          { l:"Role", v:onbRole==="worker"?"Worker":onbRole==="poster"?"Poster":"Worker & Poster" },
          { l:"Location", v:`Zip ${zip || "60647"}` },
          { l:"Email", v:emailVerified ? "✅ Verified" : "⚠️ Unverified" },
          { l:"Identity", v:idVerified ? "✅ Verified" : "⏳ Pending" },
        ].map(r=>(
          <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>{r.l}</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.85)", fontWeight:600 }}>{r.v}</span>
          </div>
        ))}
      </div>

      <button className="btn onb-fade" onClick={()=>onComplete(onbRole==="poster"?"poster":"worker")} style={{ width:"100%", padding:"17px", borderRadius:16, background:G.greenLight, color:"#fff", fontSize:16, fontWeight:700, marginTop:32, animationDelay:".45s", opacity:0 }}>Enter Chores →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWS DATA & MODAL
// ═══════════════════════════════════════════════════════════════════════════
const MY_REVIEWS = [
  { id:1, from:"The Hendersons", avatar:"TH", job:"Mow & Edge Front Lawn", rating:5, text:"Jordan was punctual and did an amazing job. Lawn looks better than ever! Will definitely hire again.", date:"Feb 18, 2025", tags:["punctual","thorough","friendly"] },
  { id:2, from:"Maria C.", avatar:"MC", job:"Dog Walking – 2 Labs", rating:5, text:"The dogs love Jordan. Always on time and sends me photos during the walk. Couldn't ask for more.", date:"Feb 10, 2025", tags:["reliable","caring","communicative"] },
  { id:3, from:"Sunrise Café", avatar:"SC", job:"Deep Clean Kitchen & Baths", rating:4, text:"Great job on the deep clean. Kitchen was spotless. Minor thing — missed the baseboards, but overall very happy.", date:"Feb 3, 2025", tags:["hardworking","thorough"] },
  { id:4, from:"DeAndre W.", avatar:"DW", job:"Paint Bedroom Accent Wall", rating:5, text:"Perfect paint job with clean edges. Jordan even helped me move furniture back. Above and beyond!", date:"Jan 25, 2025", tags:["skilled","helpful","detail-oriented"] },
  { id:5, from:"The Patels", avatar:"TP", job:"Help Move Furniture", rating:5, text:"Strong and careful with our furniture. No scratches, no complaints. Finished in under 2 hours.", date:"Jan 15, 2025", tags:["strong","careful","efficient"] },
  { id:6, from:"Mrs. Thompson", avatar:"MT", job:"Grocery Run & Errands", rating:5, text:"Such a sweet young person. Got everything on my list and even carried it inside for me.", date:"Jan 8, 2025", tags:["kind","reliable","helpful"] },
];

const COMPLETED_JOBS = [
  { id:101, title:"Mow & Edge Front Lawn", person:"The Hendersons", pay:35, date:"Feb 18", reviewed:true },
  { id:102, title:"Dog Walking – 2 Labs", person:"Maria C.", pay:20, date:"Feb 10", reviewed:true },
  { id:103, title:"Deep Clean Kitchen & Baths", person:"Sunrise Café", pay:80, date:"Feb 3", reviewed:true },
  { id:104, title:"Paint Bedroom Accent Wall", person:"DeAndre W.", pay:65, date:"Jan 25", reviewed:true },
  { id:105, title:"Assemble IKEA Shelf", person:"Lisa N.", pay:40, date:"Feb 22", reviewed:false },
  { id:106, title:"Pressure Wash Driveway", person:"Coach Williams", pay:55, date:"Feb 20", reviewed:false },
];

const REVIEW_TAGS = ["punctual","thorough","friendly","reliable","skilled","hardworking","communicative","careful","kind","efficient","detail-oriented","professional"];

function ReviewModal({ target, jobTitle, onSubmit, onClose }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [step, setStep] = useState(0); // 0=form, 1=sending, 2=done
  const togTag = (t) => setTags(s=>s.includes(t)?s.filter(x=>x!==t):[...s,t]);

  const submit = () => {
    setStep(1);
    setTimeout(()=>setStep(2), 1200);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center", backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div className="fade" onClick={e=>e.stopPropagation()} style={{ background:G.cream, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:430, maxHeight:"92vh", overflowY:"auto", padding:"24px 20px 32px" }}>

        {step===2 ? (
          <div style={{ textAlign:"center", padding:"30px 0" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, marginBottom:6 }}>Review Submitted!</div>
            <div style={{ color:G.muted, fontSize:13, marginBottom:6 }}>Thanks for your feedback</div>
            <div style={{ fontSize:13, color:G.muted, marginBottom:24 }}>Your review helps build trust in the Chores community.</div>
            <Btn onClick={()=>{onSubmit({stars,text,tags});onClose();}} style={{ padding:"14px 40px", borderRadius:14, fontSize:14 }}>Done</Btn>
          </div>
        ) : step===1 ? (
          <div style={{ textAlign:"center", padding:"50px 0" }}>
            <div className="pulse" style={{ width:48, height:48, borderRadius:"50%", border:`3px solid ${G.green}`, borderTopColor:"transparent", margin:"0 auto 16px", animation:"spin .8s linear infinite" }} />
            <div style={{ fontWeight:700, fontSize:15 }}>Submitting your review...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Leave a Review</div>
              <div className="tap" onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✕</div>
            </div>

            {/* Job & person summary */}
            <div style={{ background:G.white, borderRadius:16, padding:16, marginBottom:20, display:"flex", alignItems:"center", gap:14 }}>
              <Avatar name={target} size={48} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{target}</div>
                <div style={{ fontSize:12, color:G.muted }}>{jobTitle}</div>
              </div>
            </div>

            {/* Star rating */}
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:G.muted, marginBottom:8 }}>How would you rate your experience?</div>
              <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                {[1,2,3,4,5].map(s=>(
                  <div key={s} className="tap" onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)} onClick={()=>setStars(s)} style={{ cursor:"pointer", transition:"transform .15s", transform:(hover>=s||stars>=s)?"scale(1.15)":"scale(1)" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill={(hover>=s||stars>=s)?G.green:"none"} stroke={(hover>=s||stars>=s)?G.green:G.border} strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                ))}
              </div>
              {stars>0 && <div style={{ fontSize:12, color:G.green, fontWeight:600, marginTop:6 }}>{["","Needs work","Fair","Good","Great","Outstanding!"][stars]}</div>}
            </div>

            {/* Quick tags */}
            {stars>0 && (
              <div className="fade" style={{ marginBottom:18 }}>
                <div style={{ fontSize:12, fontWeight:600, color:G.muted, marginBottom:8 }}>What stood out? (optional)</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {REVIEW_TAGS.map(t=>{
                    const active=tags.includes(t);
                    return <div key={t} className="tap" onClick={()=>togTag(t)} style={{ padding:"6px 12px", borderRadius:10, fontSize:11, fontWeight:600, background:active?G.greenPale:G.sand, color:active?G.green:G.muted, border:`1.5px solid ${active?G.green:G.border}`, transition:"all .15s", textTransform:"capitalize" }}>{active?"✓ ":""}{t}</div>;
                  })}
                </div>
              </div>
            )}

            {/* Written review */}
            {stars>0 && (
              <div className="fade" style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:600, color:G.muted, marginBottom:8 }}>Write a review (optional)</div>
                <textarea value={text} onChange={e=>setText(e.target.value.slice(0,300))} rows={3} placeholder="Tell others about your experience..." style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", resize:"none", background:G.white, outline:"none", lineHeight:1.5, boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
                <div style={{ textAlign:"right", fontSize:11, color:text.length>250?G.red:G.muted, marginTop:4 }}>{text.length}/300</div>
              </div>
            )}

            {/* Submit */}
            <Btn onClick={submit} disabled={stars===0} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15, opacity:stars>0?1:.5 }}>Submit Review</Btn>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAP SCREEN (full tab)
// ═══════════════════════════════════════════════════════════════════════════
function MapScreen({ role, isGuest, onGuestAction, onCheckout, maxDist, setMaxDist }) {
  const [mapZoom, setMapZoom] = useState(15);
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeCategory, setActiveCategory] = useState([]);
  const [showMapFilter, setShowMapFilter] = useState(false);
  const [applied, setApplied] = useState([]);
  const [applyModal, setApplyModal] = useState(null);
  const [applyStep, setApplyStep] = useState(0);
  const [applyMsg, setApplyMsg] = useState("");

  // Job detail subpage
  if (selectedJob) {
    const job = selectedJob;
    const hasApplied = applied.includes(job.id);
    return (
      <div className="fade" style={{ background:G.cream, minHeight:"100vh" }}>
        <div style={{ background:G.green, padding:"16px 20px 20px" }}>
          <div className="tap" onClick={()=>setSelectedJob(null)} style={{ display:"inline-flex", alignItems:"center", gap:6, color:"rgba(255,255,255,.7)", fontSize:13, fontWeight:600, marginBottom:12 }}>← Back to Map</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:"#fff", lineHeight:1.2 }}>{job.title}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.75)", marginTop:6 }}>{job.verified?"✅ ":""}{job.poster} · 📍 {job.dist}mi · {job.loc}</div>
          <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>{job.tags.map(t=><Tag key={t} bg="rgba(255,255,255,.15)" color="#fff">{t}</Tag>)}</div>
        </div>
        <div style={{ padding:"20px 20px 100px" }}>
          <div style={{ background:G.white, borderRadius:18, padding:16, marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Pay</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:800, color:G.greenMid }}>${job.pay}</div>
          </div>
          <div style={{ background:G.white, borderRadius:18, padding:16, marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Description</div>
            <div style={{ fontSize:14, color:G.text, lineHeight:1.6 }}>{job.desc}</div>
          </div>
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Date</div>
            <div style={{ fontSize:14, fontWeight:600, color:G.text }}>{job.date}</div>
          </div>
        </div>
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"12px 20px 24px", background:"rgba(255,255,255,.95)", backdropFilter:"blur(12px)", borderTop:`1px solid ${G.border}`, zIndex:40, display:"flex", gap:10 }}>
          {role==="poster"
            ? <Btn onClick={()=>{onCheckout(job);setSelectedJob(null);}} style={{ flex:1, padding:16, borderRadius:16, fontSize:15 }}>💳 Hire & Pay ${job.pay}</Btn>
            : hasApplied
              ? <Btn variant="ghost" style={{ flex:1, padding:16, borderRadius:16, fontSize:15 }}>✓ Application Sent</Btn>
              : <Btn onClick={()=>{if(isGuest){onGuestAction();return;}setApplyModal(job);}} style={{ flex:1, padding:16, borderRadius:16, fontSize:15 }}>Apply Now →</Btn>
          }
        </div>
        {applyModal&&(
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50, display:"flex", alignItems:"flex-end" }}>
            <div className="slide-up" style={{ background:G.cream, borderRadius:"24px 24px 0 0", padding:"24px 20px 36px", width:"100%", maxWidth:430, margin:"0 auto" }}>
              {applyStep===0?(
                <>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, marginBottom:16 }}>Apply for {applyModal.title}</div>
                  <textarea value={applyMsg} onChange={e=>setApplyMsg(e.target.value)} placeholder="Introduce yourself and why you're a great fit..." rows={4} style={{ width:"100%", padding:14, borderRadius:14, border:`1.5px solid ${G.border}`, fontSize:14, resize:"none", marginBottom:12 }}/>
                  <Btn onClick={()=>setApplyStep(1)} disabled={!applyMsg.trim()} style={{ width:"100%", padding:14, borderRadius:14 }}>Submit Application →</Btn>
                  <Btn onClick={()=>{setApplyModal(null);setApplyMsg("");}} variant="ghost" style={{ width:"100%", padding:12, borderRadius:14, marginTop:8 }}>Cancel</Btn>
                </>
              ):(
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{ fontSize:52, marginBottom:12 }}>🎉</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.green }}>Applied!</div>
                  <div style={{ fontSize:14, color:G.muted, marginTop:8 }}>Your application has been sent.</div>
                  <Btn onClick={()=>{setApplied(a=>[...a,applyModal.id]);setApplyModal(null);setApplyStep(0);setApplyMsg("");setSelectedJob(null);}} style={{ width:"100%", marginTop:24, padding:14, borderRadius:14 }}>Back to Map</Btn>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fade" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 60px)" }}>
      {/* Header */}
      <div style={{ background:G.green, padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, color:"#fff" }}>Nearby Jobs</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.7)" }}>within</div>
          <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,.15)", borderRadius:8, padding:"4px 8px" }}>
            <div className="tap" onClick={()=>setMaxDist(d=>Math.max(1,d-1))} style={{ color:"#fff", fontSize:14, fontWeight:800, lineHeight:1, padding:"0 2px" }}>−</div>
            <div style={{ color:"#fff", fontSize:13, fontWeight:700, minWidth:36, textAlign:"center" }}>{maxDist} mi</div>
            <div className="tap" onClick={()=>setMaxDist(d=>Math.min(50,d+1))} style={{ color:"#fff", fontSize:14, fontWeight:800, lineHeight:1, padding:"0 2px" }}>+</div>
          </div>
        </div>
      </div>

      {/* Filter dropdown - identical to Discover Jobs */}
      <div style={{ padding:"10px 16px", background:G.cream, display:"flex", justifyContent:"flex-end", borderBottom:`1px solid ${G.border}` }}>
        <div style={{ position:"relative" }}>
          <div className="tap" onClick={()=>setShowMapFilter(s=>!s)} style={{ height:36, borderRadius:10, background:showMapFilter?G.green:"rgba(27,67,50,.1)", display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"0 12px", position:"relative" }}>
            <span style={{ fontSize:12, fontWeight:600, color:showMapFilter?"#fff":G.green }}>Filter</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showMapFilter?"#fff":G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            {activeCategory.length>0&&<div style={{ position:"absolute", top:-3, right:-3, width:8, height:8, borderRadius:"50%", background:G.greenLight, border:`1.5px solid ${G.cream}` }}/>}
          </div>
          {showMapFilter&&<div onClick={()=>setShowMapFilter(false)} style={{ position:"fixed", inset:0, zIndex:19 }} />}
          {showMapFilter&&(
            <div className="fade" style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:G.white, borderRadius:16, padding:8, boxShadow:"0 8px 30px rgba(0,0,0,.18)", border:`1px solid ${G.border}`, zIndex:20, width:190 }}>
              <div style={{ fontSize:10, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, padding:"4px 10px 8px" }}>Category</div>
              {[{id:"all",label:"All Categories"},...CATEGORIES].map(c=>{
                const active = c.id==="all" ? activeCategory.length===0 : activeCategory.includes(c.id);
                return (
                  <div key={c.id} className="tap" onClick={()=>{setActiveCategory(a=>c.id==="all"?[]:a.includes(c.id)?a.filter(x=>x!==c.id):[...a,c.id]);setSelectedPin(null);}} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", borderRadius:10, background:active?G.greenPale:"transparent", color:active?G.green:G.text }}>
                    <span style={{ fontSize:13, fontWeight:active?700:500 }}>{c.label}</span>
                    {active&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Map fills remaining space */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", background:"#E8F0E9" }}>
        <iframe
          title="Chores Map"
          width="100%"
          height="100%"
          style={{ border:0, position:"absolute", inset:0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyCxNZrtOlBvANLudyc_ZCuo_JasYLIX5IA&center=41.883,-87.627&zoom=${mapZoom}&maptype=roadmap`}
        />

        {/* Job pins with SVG icons */}
        {JOBS.filter(j=>(activeCategory.length===0||activeCategory.includes(j.category))&&j.dist<=maxDist).map(job=>{
          const isSel=selectedPin?.id===job.id;
          const cLat=41.883, cLng=-87.627;
          const baseScale=58000;
          const zoomFactor=Math.pow(2, mapZoom-15);
          const scale=baseScale*zoomFactor;
          const x=50+((job.lng-cLng)*scale*Math.cos(cLat*Math.PI/180))/430*100;
          const y=50-((job.lat-cLat)*scale)/500*100;
          if(x<-10||x>110||y<-10||y>110) return null;
          const pinColor = isSel?"#fff":G.muted;
          const catSvgs = {
            lawn:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>,
            pets:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/></svg>,
            cleaning:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h18"/><path d="M8 22V10c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v12"/></svg>,
            babysitting:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>,
            moving:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M10 8V6a2 2 0 0 1 4 0v2"/></svg>,
            painting:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 11v5"/></svg>,
            errands:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
            windows:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pinColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
          };
          return (
            <div key={job.id} className="tap map-pin" onClick={()=>setSelectedPin(isSel?null:job)} style={{ position:"absolute", left:`${Math.max(2,Math.min(98,x))}%`, top:`${Math.max(2,Math.min(92,y))}%`, zIndex:isSel?20:5, transform:"translate(-50%,-100%)", pointerEvents:"auto" }}>
              <div style={{ background:isSel?G.green:G.white, borderRadius:"50% 50% 50% 0", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 3px 14px rgba(0,0,0,${isSel?.4:.2})`, border:`2px solid ${isSel?G.greenLight:G.border}`, transform:"rotate(-45deg)" }}>
                <span style={{ transform:"rotate(45deg)", display:"flex", alignItems:"center", justifyContent:"center" }}>{catSvgs[job.category]||<span style={{ fontSize:12, fontWeight:800, color:pinColor }}>•</span>}</span>
              </div>
              <div style={{ position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)", background:isSel?G.green:G.white, color:isSel?"#fff":G.greenMid, fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:6, whiteSpace:"nowrap", boxShadow:"0 2px 6px rgba(0,0,0,.12)", border:`1px solid ${isSel?G.greenLight:G.border}` }}>${job.pay}</div>
            </div>
          );
        })}

        {/* Zoom controls */}
        <div style={{ position:"absolute", top:10, right:10, display:"flex", flexDirection:"column", gap:4, zIndex:10 }}>
          <button className="btn tap" onClick={()=>setMapZoom(z=>Math.min(20,z+1))} style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,.95)", border:`1px solid ${G.border}`, fontSize:16, fontWeight:800, color:G.text, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 6px rgba(0,0,0,.12)" }}>+</button>
          <button className="btn tap" onClick={()=>setMapZoom(z=>Math.max(12,z-1))} style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,.95)", border:`1px solid ${G.border}`, fontSize:16, fontWeight:800, color:G.text, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 6px rgba(0,0,0,.12)" }}>−</button>
        </div>

        {/* Selected pin detail */}
        {selectedPin&&(
          <div className="slide-up" style={{ position:"absolute", bottom:0, left:0, right:0, background:G.white, borderRadius:"20px 20px 0 0", padding:20, boxShadow:"0 -8px 32px rgba(0,0,0,.15)", zIndex:30 }}>
            <div style={{ width:36, height:4, borderRadius:2, background:G.border, margin:"0 auto 14px" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:16 }}>{selectedPin.title}</div>
                <div style={{ fontSize:12, color:G.muted, marginTop:3 }}>{selectedPin.poster} · {selectedPin.loc} · {selectedPin.dist}mi</div>
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.greenMid }}>${selectedPin.pay}</div>
            </div>
            <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>{selectedPin.tags.map(t=><Tag key={t}>{t}</Tag>)}</div>
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              {role==="poster"
                ? <Btn onClick={()=>{onCheckout(selectedPin);setSelectedPin(null);}} style={{ flex:2, fontSize:13 }}>Hire & Pay</Btn>
                : <Btn onClick={()=>{if(isGuest){onGuestAction();return;} setSelectedJob(selectedPin); setSelectedPin(null);}} style={{ flex:2, fontSize:13 }}>{applied.includes(selectedPin.id)?"✓ Applied":"Apply Now"}</Btn>
              }
              <Btn onClick={()=>setSelectedPin(null)} variant="ghost" style={{ padding:"12px 14px", fontSize:12 }}>Dismiss</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════
export default function ChoresApp() {
  const [appView, setAppView] = useState("onboarding");
  const [role, setRole] = useState("worker");
  const [view, setView] = useState("home");
  const [toast, setToast] = useState(null);
  const [userZip, setUserZip] = useState("60647");
  const [userCoords, setUserCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("idle"); // idle, loading, granted, denied
  const [chatOpen, setChatOpen] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([{from:"them",text:"Does Saturday at 10am work for you?"}]);
  const [showPostJob, setShowPostJob] = useState(false);
  const [postForm, setPostForm] = useState({title:"",category:"",pay:"",date:"",notes:"",photos:[]});
  const postPhotoRef = React.useRef();
  const [formPosted, setFormPosted] = useState(false);
  const [escrowData, setEscrowData] = useState(INITIAL_ESCROW);
  const [escrowModal, setEscrowModal] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // {job, person, role:"worker"|"poster"}
  const [isGuest, setIsGuest] = useState(false);
  const [guestPrompt, setGuestPrompt] = useState(false);
  const [maxDist, setMaxDist] = useState(2);
  const [appToggles, setAppToggles] = useState({ push:true, vibrate:true, darkMode:false, profileVisible:true, exactLoc:false, analytics:true, marketing:false, nJobs:true, nAppUpdates:true, nDayReminder:true, nHourReminder:true, nPayment:true, nCancel:true });
  const contentRef = React.useRef(null);
  React.useEffect(()=>{
    if(contentRef.current) contentRef.current.scrollTop = 0;
  },[view]);

  const notifCount = (role==="worker"?NOTIFS_WORKER:NOTIFS_POSTER).filter(n=>n.unread).length;

  // Geolocation: auto-detect zip code based on current position
  const detectLocation = React.useCallback(() => {
    if (!navigator.geolocation) { setLocStatus("denied"); return; }
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocStatus("granted");
        try {
          // Reverse geocode via OpenStreetMap Nominatim (free, no key needed)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
          const data = await res.json();
          const zip = data?.address?.postcode;
          if (zip) setUserZip(zip);
        } catch {
          // If geocoding fails (e.g. no network), keep current zip
          // Estimate zip from known Atlanta area coords as fallback
          const dist = Math.sqrt(Math.pow(latitude-41.883,2)+Math.pow(longitude-(-87.627),2));
          if (dist < 0.1) setUserZip("60647");
          else if (dist < 0.2) setUserZip("60614");
          else if (dist < 0.5) setUserZip("60657");
        }
      },
      () => { setLocStatus("denied"); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  React.useEffect(() => {
    if (appView === "user") detectLocation();
  }, [appView, detectLocation]);

  const fireToast = () => {
    if (!appToggles.push) return; // push notifications disabled
    const samples = role==="worker"
      ? [{icon:"🌿",title:`New job in ${userZip}`,body:"Mow & Edge Lawn · $35 · 0.3mi"},{icon:"✅",title:"Application accepted!",body:"The Hendersons want to hire you"},{icon:"💸",title:"Payment released!",body:"$46.00 deposited to your account"}]
      : [{icon:"👤",title:"New applicant!",body:"Jordan M. applied to your lawn job"},{icon:"✅",title:"Job marked complete",body:"Carlos T. finished Deep Clean"}];
    setToast(samples[Math.floor(Math.random()*samples.length)]);
  };

  const handleConfirmSide = (id, side) => {
    setEscrowData(d=>d.map(t=>{
      if (t.id!==id) return t;
      const updated = { ...t };
      if (side==="poster") updated.posterConfirmed = true;
      if (side==="worker") updated.workerConfirmed = true;
      // If both sides confirmed, release the payment
      if (updated.posterConfirmed && updated.workerConfirmed) {
        updated.status = "released";
        updated.releasedAt = "Just now";
        // Trigger review modal after a short delay
        setTimeout(()=>{
          setReviewModal({ job:t.job, person:side==="poster"?t.worker:t.poster, role:side });
        }, 600);
        setToast({icon:"💸",title:"Payment released!",body:`Both confirmed · $${t.workerGets.toFixed(2)} sent to ${t.worker}`});
      } else {
        setToast({icon:"✅",title:"Confirmed!",body:`Waiting for ${side==="poster"?"worker":"poster"} to confirm`});
      }
      return updated;
    }));
  };
  const handleDispute = (id) => { setEscrowData(d=>d.map(t=>t.id===id?{...t,status:"disputed",disputedAt:"Just now"}:t)); setToast({icon:"⚠️",title:"Dispute opened",body:"Review within 24 hours"}); };
  const handleFund = (newTxn) => { setEscrowData(d=>[{...newTxn,posterConfirmed:false,workerConfirmed:false},...d]); setToast({icon:"🔒",title:"Escrow funded!",body:`$${newTxn.amount.toFixed(2)} held securely`}); };

  if (appView==="onboarding") return <OnboardingFlow onComplete={(r)=>{setRole(r==="guest"?"worker":r);setAppView("user");if(r==="guest")setIsGuest(true);}} />;

  if (appView==="admin") return (
    <div style={{ maxWidth:430, margin:"0 auto", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>

      <div className="tap" onClick={()=>setAppView("user")} style={{ background:"rgba(255,255,255,.07)", padding:"10px 20px", fontSize:13, color:"rgba(255,255,255,.6)", fontFamily:"'Outfit',sans-serif" }}>← Back to App</div>
      <AdminDashboard />
    </div>
  );

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:appToggles.darkMode?"#111":G.cream, minHeight:"100vh", maxWidth:430, margin:"0 auto", position:"relative", boxShadow:"0 0 80px rgba(0,0,0,.2)", display:"flex", flexDirection:"column", transition:"background .3s" }}>
      <style>{CSS}</style>
      {toast&&<Toast notif={toast} onDismiss={()=>setToast(null)} />}
      {escrowModal&&<EscrowHoldModal job={escrowModal} onClose={()=>setEscrowModal(null)} onConfirm={handleFund} />}
      {checkoutModal&&<CheckoutModal job={checkoutModal} onClose={()=>setCheckoutModal(null)} onComplete={handleFund} />}
      {reviewModal&&<ReviewModal target={reviewModal.person} jobTitle={reviewModal.job} onSubmit={()=>setToast({icon:"⭐",title:"Review submitted!",body:"Thanks for your feedback"})} onClose={()=>setReviewModal(null)} />}

      {/* Guest sign-up prompt */}
      {guestPrompt&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }} onClick={()=>setGuestPrompt(false)}>
          <div className="fade" onClick={e=>e.stopPropagation()} style={{ background:G.cream, borderRadius:24, width:"85%", maxWidth:360, padding:"32px 24px", textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:16, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, marginBottom:6 }}>Create an Account</div>
            <div style={{ fontSize:13, color:G.muted, lineHeight:1.5, marginBottom:24 }}>Sign up to apply to jobs, message posters, leave reviews, and start earning in your neighborhood.</div>
            <Btn onClick={()=>{setGuestPrompt(false);setIsGuest(false);setAppView("onboarding");}} style={{ width:"100%", padding:15, borderRadius:14, fontSize:15, marginBottom:10 }}>Sign Up Free</Btn>
            <div className="tap" onClick={()=>setGuestPrompt(false)} style={{ fontSize:13, color:G.muted, fontWeight:600, padding:8 }}>Maybe Later</div>
          </div>
        </div>
      )}

      {/* Notch */}


      {/* Header */}
      <div style={{ background:G.green, padding:"4px 20px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:"#fff", letterSpacing:.5, lineHeight:1.2 }}>Chores<span style={{ color:G.greenLight }}>.</span></div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className="tap" onClick={fireToast} style={{ background:"rgba(255,255,255,.12)", borderRadius:10, padding:"6px 10px", fontSize:11, color:"rgba(255,255,255,.8)", fontWeight:700 }}>🔔 Test</div>
            <div className="tap" onClick={()=>setAppView("admin")} style={{ background:"rgba(255,255,255,.12)", borderRadius:10, padding:"6px 10px", fontSize:11, color:"rgba(255,255,255,.8)", fontWeight:700 }}>⚙️ Admin</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,.55)" }}>Worker</span>
          <div onClick={()=>setRole(r=>r==="worker"?"poster":"worker")} style={{ width:40, height:22, borderRadius:11, background:role==="poster"?G.greenLight:"rgba(255,255,255,.2)", position:"relative", cursor:"pointer", transition:"background .2s" }}>
            <div style={{ position:"absolute", top:3, left:role==="poster"?21:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left .2s" }}/>
          </div>
          <span style={{ fontSize:11, color:"rgba(255,255,255,.55)" }}>Poster</span>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex:1, overflowY:"auto", paddingBottom:88 }}>
        {view==="home"&&<DiscoveryScreen role={role} onPostJob={()=>setShowPostJob(true)} onFundEscrow={(job)=>setEscrowModal(job)} onCheckout={(job)=>setCheckoutModal(job)} isGuest={isGuest} onGuestAction={()=>setGuestPrompt(true)} userZip={userZip} maxDist={maxDist} setMaxDist={setMaxDist} profileVisible={appToggles.profileVisible} />}
        {view==="map"&&<MapScreen role={role} isGuest={isGuest} onGuestAction={()=>setGuestPrompt(true)} onCheckout={(job)=>setCheckoutModal(job)} maxDist={maxDist} setMaxDist={setMaxDist} />}
        {view==="notifications"&&<NotificationsScreen role={role} onNavigate={setView} />}
        {view==="messages"&&(
          <div className="fade">
            {!chatOpen?(
              <div style={{ padding:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:16 }}>Messages</div>
                {[{id:1,from:"The Hendersons",job:"Mow & Edge Front Lawn",preview:"Does Saturday at 10am work?",time:"2m ago",unread:true},{id:2,from:"Maria C.",job:"Dog Walking – 2 Labs",preview:"Can you meet the dogs first?",time:"1hr ago",unread:true},{id:3,from:"Sunrise Café",job:"Deep Clean Kitchen",preview:"You're confirmed for Sunday.",time:"Yesterday",unread:false}].map(m=>(
                  <div key={m.id} className="tap" onClick={()=>setChatOpen(m)} style={{ background:G.white, borderRadius:16, padding:16, marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,.06)", display:"flex", gap:12, alignItems:"center", borderLeft:`3px solid ${m.unread?G.green:"transparent"}` }}>
                    <Avatar name={m.from} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontWeight:m.unread?700:500, fontSize:14 }}>{m.from}</span><span style={{ fontSize:11, color:G.muted }}>{m.time}</span></div>
                      <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>📋 {m.job}</div>
                      <div style={{ fontSize:13, color:m.unread?G.text:G.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.preview}</div>
                    </div>
                    {m.unread&&<div style={{ width:8, height:8, borderRadius:"50%", background:G.green, flexShrink:0 }}/>}
                  </div>
                ))}
              </div>
            ):(
              <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 170px)" }}>
                <div style={{ padding:"14px 20px", background:G.white, borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", gap:12 }}>
                  <div className="tap" onClick={()=>setChatOpen(null)} style={{ fontSize:20 }}>←</div>
                  <Avatar name={chatOpen.from} size={36} />
                  <div><div style={{ fontWeight:700, fontSize:14 }}>{chatOpen.from}</div><div style={{ fontSize:11, color:G.greenMid }}>📋 {chatOpen.job}</div></div>
                </div>
                <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
                  {chatHistory.map((msg,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:msg.from==="me"?"flex-end":"flex-start" }}>
                      <div style={{ padding:"10px 14px", fontSize:14, maxWidth:"75%", ...(msg.from==="me"?{background:G.green,color:"#fff",borderRadius:"18px 18px 4px 18px"}:{background:"#fff",color:G.text,borderRadius:"18px 18px 18px 4px",boxShadow:"0 2px 8px rgba(0,0,0,.08)"}) }}>{msg.text}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"12px 16px 16px", background:G.white, borderTop:`1px solid ${G.border}`, display:"flex", gap:8 }}>
                  <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&chatMsg.trim()){setChatHistory(h=>[...h,{from:"me",text:chatMsg}]);setChatMsg("");setTimeout(()=>setChatHistory(h=>[...h,{from:"them",text:"Sounds great! See you then 👍"}]),800);}}} placeholder="Type a message..." style={{ flex:1, padding:"10px 14px", borderRadius:20, border:`1.5px solid ${G.border}`, fontSize:14 }} />
                  <button className="btn" onClick={()=>{if(chatMsg.trim()){setChatHistory(h=>[...h,{from:"me",text:chatMsg}]);setChatMsg("");setTimeout(()=>setChatHistory(h=>[...h,{from:"them",text:"Sounds great! See you then 👍"}]),800);}}} style={{ width:42, height:42, borderRadius:"50%", background:G.green, color:"#fff", fontSize:18 }}>↑</button>
                </div>
              </div>
            )}
          </div>
        )}
        {view==="profile"&&<SettingsScreen role={role} escrowData={escrowData} onConfirmSide={handleConfirmSide} onDispute={handleDispute} onReview={(data)=>setReviewModal(data)} onUpdateZip={setUserZip} onTogglesChange={setAppToggles} />}
      </div>

      {/* POST JOB MODAL */}
      {showPostJob&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"flex-end", zIndex:100 }}>
          <div className="slide-up" style={{ background:G.cream, borderRadius:"24px 24px 0 0", padding:"24px 20px 36px", width:"100%", maxWidth:430, margin:"0 auto" }}>
            {formPosted?(
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <div style={{ fontSize:52 }}>🎉</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, marginTop:12, color:G.green }}>Job Posted!</div>
                <div style={{ color:G.muted, marginTop:6 }}>Workers in zip {userZip} will start applying soon.</div>
              </div>
            ):(
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>Post a Job</div>
                  <div className="tap" onClick={()=>setShowPostJob(false)} style={{ fontSize:24, color:G.muted }}>×</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <input value={postForm.title} onChange={e=>setPostForm(p=>({...p,title:e.target.value}))} placeholder="Job title (e.g. Mow my lawn)" style={{ padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, background:G.white }} />
                  <select value={postForm.category} onChange={e=>setPostForm(p=>({...p,category:e.target.value}))} style={{ padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, background:G.white }}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <div style={{ display:"flex", gap:10 }}>
                    <input value={postForm.pay} onChange={e=>setPostForm(p=>({...p,pay:e.target.value}))} placeholder="Pay (e.g. $40)" style={{ flex:1, padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, background:G.white }} />
                    <input value={postForm.date} onChange={e=>setPostForm(p=>({...p,date:e.target.value}))} placeholder="Date / schedule" style={{ flex:1, padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, background:G.white }} />
                  </div>
                  <textarea value={postForm.notes} onChange={e=>setPostForm(p=>({...p,notes:e.target.value}))} placeholder="Details, requirements, tools provided..." rows={3} style={{ padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, resize:"none", background:G.white }} />

                  {/* Photo upload */}
                  <div>
                    <input
                      ref={postPhotoRef}
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      style={{ display:"none" }}
                      onChange={e=>{
                        const files = Array.from(e.target.files);
                        files.forEach(file=>{
                          const reader = new FileReader();
                          reader.onload = ev => setPostForm(p=>({...p, photos:[...p.photos, ev.target.result].slice(0,5)}));
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                    <div className="tap" onClick={()=>postPhotoRef.current.click()} style={{ padding:"13px 14px", borderRadius:12, border:`1.5px dashed ${G.border}`, fontSize:14, color:G.muted, background:G.white, display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      {postForm.photos.length > 0 ? `${postForm.photos.length} photo${postForm.photos.length>1?"s":""} added — tap to add more` : "Add photos (optional)"}
                    </div>
                    {postForm.photos.length > 0 && (
                      <div style={{ display:"flex", gap:8, marginTop:8, overflowX:"auto", paddingBottom:4 }}>
                        {postForm.photos.map((src,i)=>(
                          <div key={i} style={{ position:"relative", flexShrink:0 }}>
                            <img src={src} alt="" style={{ width:72, height:72, borderRadius:10, objectFit:"cover", border:`1.5px solid ${G.border}` }} />
                            <div className="tap" onClick={()=>setPostForm(p=>({...p,photos:p.photos.filter((_,j)=>j!==i)}))}
                              style={{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%", background:G.red, color:"#fff", fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}>×</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Btn onClick={()=>{setFormPosted(true);setTimeout(()=>{setShowPostJob(false);setFormPosted(false);setPostForm({title:"",category:"",pay:"",date:"",notes:"",photos:[]});},2200);}} style={{ width:"100%", padding:"14px" }}>Post Job →</Btn>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="tab-bar" style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, borderTop:`1px solid ${G.border}`, display:"flex", justifyContent:"space-around", padding:"10px 0 18px", zIndex:50, boxShadow:"0 -4px 24px rgba(0,0,0,.08)" }}>
        {[
          { id:"home",      icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label:"Home" },
          { id:"map",       icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label:"Map" },
          { id:"notifications", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label:"Inbox", badge:notifCount },
          { id:"messages",      icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label:"Messages", badge:2 },
          { id:"profile",       icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:"Profile" },
        ].map(tab=>(
          <button key={tab.id} className="btn" onClick={()=>{if(isGuest&&(tab.id==="messages"||tab.id==="profile")){setGuestPrompt(true);return;}setView(tab.id);if(tab.id!=="messages")setChatOpen(null);}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"0 10px", position:"relative", background:"none" }}>
              <div style={{ position:"relative", width:22, height:22 }}>
                {tab.icon}
              {tab.badge>0&&<Badge n={tab.badge} />}
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:view===tab.id?G.green:G.muted }}>{tab.label}</span>
            {view===tab.id&&<div style={{ position:"absolute", bottom:-10, width:20, height:3, borderRadius:2, background:G.green }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
