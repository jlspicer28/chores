"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
// ─── STRIPE SETUP ────────────────────────────────────────────────────────────
const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_live_51Sm0ov0XVYeAYmlL81O3danYiF5PPJV3zpU4FiJR1kTMTatF5hLVB7tEEuyVKzTGbBD9K1QqlWnY7tkMocJ3j0sJ00rWBI5xzg";
const BACKEND = "https://chores-backend4.onrender.com";

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
const LIGHT = {
  green: "#1B4332", greenMid: "#2D6A4F", greenLight: "#52B788", greenPale: "#D8F3DC",
  cream: "#FAFAF7", sand: "#F2EFE9", orange: "#E76F51", orangeLight: "#FDF0EC",
  gold: "#F4A261", white: "#FFFFFF", text: "#111111", muted: "#4B5563", border: "#E8E4DC",
  red: "#E53E3E", redLight: "#FFF0F0", blue: "#3182CE", blueLight: "#EBF8FF",
};
const DARK = {
  green: "#1B4332", greenMid: "#52B788", greenLight: "#74C69D", greenPale: "#1B4332",
  cream: "#1A1A1A", sand: "#242424", orange: "#E76F51", orangeLight: "#2D1A12",
  gold: "#F4A261", white: "#2A2A2A", text: "#F0F0F0", muted: "#A0A0A0", border: "#3A3A3A",
  red: "#FC8181", redLight: "#2D1515", blue: "#63B3ED", blueLight: "#1A2A3A",
};
let G = { ...LIGHT };

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:0;}
.chores-app{color:var(--text);}
.chores-app *{color:inherit;}
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
input,textarea,select{font-family:'Outfit',sans-serif;outline:none;color:inherit;background:inherit;}
.chip{transition:all .15s ease;cursor:pointer;white-space:nowrap;}
.tab-bar{backdrop-filter:blur(12px);background:var(--tab-bg,rgba(255,255,255,.95));}
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

// Jobs are loaded live from backend — no mock data
const JOBS = [];

// Notifications loaded live — no mock data
const NOTIFS_WORKER = [];
const NOTIFS_POSTER = [];

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

// Escrow loaded live from backend — no mock data
const INITIAL_ESCROW = [];

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
  const [payMethod, setPayMethod] = useState("new");
  const [processing, setProcessing] = useState(false);
  const [pmCards, setPmCards] = useState([]);
  const fee = +(job.pay * 0.08).toFixed(2);
  const total = +(job.pay + fee).toFixed(2);
  const workerGets = +job.pay.toFixed(2);

  React.useEffect(() => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    fetch(`${BACKEND}/api/customer/cards`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.cards && data.cards.length > 0) {
          setPmCards(data.cards);
          setPayMethod(data.cards.find(c => c.isDefault)?.id || data.cards[0].id);
        }
      })
      .catch(() => {});
  }, []);

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
            {pmCards.length === 0 && (
              <div style={{ background:G.white, borderRadius:16, padding:"14px 16px", color:G.muted, fontSize:13, textAlign:"center" }}>
                No saved cards. <span className="tap" onClick={()=>setSubPage("paymentMethods")} style={{ color:G.greenMid, fontWeight:700 }}>Add a card →</span>
              </div>
            )}
            {pmCards.map(m=>{
              const brandLabel = {visa:"Visa",mastercard:"Mastercard",amex:"Amex",discover:"Discover"}[m.brand]||"Card";
              const label = `${brandLabel} •••• ${m.last4}`;
              const sub = `Expires ${String(m.exp_month).padStart(2,"0")}/${String(m.exp_year).slice(-2)}${m.isDefault?" · Default":""}`;
              return (
                <div key={m.id} className="tap" onClick={()=>setPayMethod(m.id)} style={{ display:"flex", gap:14, alignItems:"center", background:G.white, borderRadius:16, padding:"14px 16px", border:`2px solid ${payMethod===m.id?G.green:G.border}`, transition:"all .15s" }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:payMethod===m.id?G.greenPale:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>💳</div>
                  <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14 }}>{label}</div><div style={{ fontSize:12, color:G.muted, marginTop:1 }}>{sub}</div></div>
                  <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${payMethod===m.id?G.green:G.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>{payMethod===m.id&&<div style={{ width:10, height:10, borderRadius:"50%", background:G.green }}/>}</div>
                </div>
              );
            })}
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
          {[["Job amount",`$${txn.amount.toFixed(2)}`],["Platform fee (8%)",`+$${(txn.fee||txn.amount*0.08).toFixed(2)}`],["Poster charged",`$${(txn.amount+(txn.fee||txn.amount*0.08)).toFixed(2)}`],["Worker receives",`$${txn.workerGets.toFixed(2)}`]].map(([l,v],i)=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${G.border}`, fontSize:13 }}>
              <span style={{ color:G.muted }}>{l}</span><span style={{ fontWeight:i===2?800:600, color:i===2?G.greenMid:G.text }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background:G.white, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Timeline</div>
          {[
            { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, text:"Escrow funded", date:txn.createdAt, done:true },
            { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, text:"Funds held", date:txn.createdAt, done:true },
            { icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={txn.status!=="held"?G.greenMid:G.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, text:`Scheduled: ${txn.scheduledDate||"–"}`, date:"", done:txn.status!=="held" },
            ...(txn.posterConfirmed?[{icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,text:"Poster confirmed",date:"",done:true}]:[]),
            ...(txn.workerConfirmed?[{icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,text:"Worker confirmed",date:"",done:true}]:[]),
            { icon: txn.status==="released"
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : txn.status==="disputed"
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                : txn.status==="refunded"
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
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
        {txn.note&&<div style={{ background:"#FFF7ED", borderRadius:14, padding:14, marginBottom:16, border:"1px solid rgba(244,162,97,.2)" }}><div style={{ fontSize:12, color:G.gold, fontWeight:600 }}>{txn.note}</div></div>}

        {confirmAction&&(
          <div style={{ background:confirmAction==="confirm"?G.greenPale:G.redLight, borderRadius:16, padding:16, marginBottom:14, border:`1.5px solid ${confirmAction==="confirm"?G.greenLight:G.red}` }}>
            <div style={{ fontWeight:700, fontSize:14, color:confirmAction==="confirm"?G.greenMid:G.red, marginBottom:6 }}>{confirmAction==="confirm"?"Confirm Job Complete":"Open Dispute"}</div>
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
              : <Btn onClick={()=>setConfirmAction("confirm")} style={{ flex:2, padding:14, borderRadius:16 }}>Confirm Job Complete</Btn>
            }
            <Btn onClick={()=>setConfirmAction("dispute")} variant="outline" style={{ flex:1, padding:14, borderRadius:16, fontSize:13 }}>Dispute</Btn>
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
  const [step, setStep] = useState(0); // 0=pick worker, 1=summary, 2=card entry, 3=review, 4=processing, 5=success
  const [card, setCard] = useState({ number:"", expiry:"", cvc:"", name:"", save:true });
  const [payMethod, setPayMethod] = useState("new"); // "new",<cardId>
  const [tipPct, setTipPct] = useState(0);
  const [pmCards, setPmCards] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null); // { id, name }

  // Fetch applicants and saved cards on mount
  React.useEffect(() => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    // Load applicants
    fetch(`${BACKEND}/api/jobs/${job.id}/applicants`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setApplicants(data.applicants || []);
        if (data.applicants?.length === 1) setSelectedWorker(data.applicants[0]); // auto-select if only one
        setApplicantsLoading(false);
      })
      .catch(() => setApplicantsLoading(false));
    // Load saved cards
    fetch(`${BACKEND}/api/customer/cards`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.cards && data.cards.length > 0) {
          setPmCards(data.cards);
          setPayMethod(data.cards.find(c => c.isDefault)?.id || data.cards[0].id);
        }
      })
      .catch(() => {});
  }, []);
  const [stripeRef, setStripeRef] = useState(null); // { stripe, card } from StripeCardInput
  const [stripeError, setStripeError] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [cardBrand, setCardBrand] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const fee = +(job.pay * 0.08).toFixed(2);
  const tip = +(job.pay * tipPct / 100).toFixed(2);
  const total = +(job.pay + fee + tip).toFixed(2);
  const workerGets = +(job.pay + tip).toFixed(2);

  const handleStripeCharge = async () => {
    setStripeError("");
    if (payMethod === "new") {
      if (!stripeRef) { setStripeError("Stripe is still loading, please wait."); return; }
      setStep(4);
      const { stripe, card: cardEl } = stripeRef;
      const result = await stripe.createPaymentMethod({
        type: "card",
        card: cardEl,
        billing_details: { name: card.name || "Chores User" },
      });
      if (result.error) {
        setStep(3);
        setStripeError(result.error.message);
        return;
      }
      setPaymentMethodId(result.paymentMethod.id);
      setCardBrand(result.paymentMethod.card.brand);
      setCardLast4(result.paymentMethod.card.last4);

      // ── Real backend charge ──
      try {
        const token = isBrowser ? localStorage.getItem("chores_token") : null;
        const res = await fetch(`${BACKEND}/api/charge`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            paymentMethodId: result.paymentMethod.id,
            amountCents: Math.round(total * 100),
            jobId: String(job.id),
            jobTitle: job.title,
            workerId: selectedWorker?.id || null,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setStep(3);
          setStripeError(data.error);
          return;
        }
        setPaymentMethodId(result.paymentMethod.id + "|" + data.intentId);
        setStep(5);
      } catch (err) {
        setStep(3);
        setStripeError("Network error — please try again.");
      }
    } else {
      // Saved card — charge via backend using stored payment method
      setStep(4);
      try {
        const token = isBrowser ? localStorage.getItem("chores_token") : null;
        const res = await fetch(`${BACKEND}/api/charge-saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            paymentMethodId: payMethod,
            amountCents: Math.round(total * 100),
            jobId: String(job.id),
            jobTitle: job.title,
            workerId: selectedWorker?.id || null,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setStep(3);
          setStripeError(data.error);
          return;
        }
        setPaymentMethodId(payMethod + "|" + data.intentId);
        setStep(5);
      } catch (err) {
        setStep(3);
        setStripeError("Network error — please try again.");
      }
    }
  };

  // Step 4 — Processing
  if (step === 4) {
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

  // Step 5 — Success
  if (step === 5) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
      <div className="fade" style={{ background:G.white, borderRadius:24, padding:"32px 24px", width:"100%", maxWidth:400, textAlign:"center" }}>
        <div className="check-pop" style={{ width:72, height:72, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 16px" }}>✅</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.green }}>Payment Authorized!</div>
        <div style={{ fontSize:14, color:G.muted, marginTop:8, lineHeight:1.5 }}>
          <strong>${total}</strong> held in escrow for <strong>{selectedWorker?.name||"your worker"}</strong>.
        </div>
        <div style={{ background:G.greenPale, borderRadius:14, padding:14, marginTop:16, textAlign:"left" }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.greenMid, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Receipt</div>
          {[["Job",job.title],["Worker",selectedWorker?.name||"Worker"],["Amount",`$${job.pay.toFixed(2)}`],["Platform fee (8%)",`+$${fee.toFixed(2)}`],["Tip",`$${tip.toFixed(2)}`],["Total charged",`$${total}`]].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0", borderBottom:`1px solid ${G.greenLight}20` }}><span style={{ color:G.greenMid }}>{l}</span><span style={{ fontWeight:700, color:G.text }}>{v}</span></div>
          ))}
        </div>
        <Btn onClick={()=>{
          onComplete({ id:`ESC-${Date.now()}`, jobId:job.id, job:job.title, worker:selectedWorker?.name||"Worker", workerId:selectedWorker?.id||null, poster:job.poster, amount:job.pay, fee, workerGets, status:"held", createdAt:"Just now", scheduledDate:job.date, note:"Funds held until job completion", stripeIntentId: paymentMethodId?.split("|")[1] || null });
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
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800 }}>{step===0?"Select Worker":step===1?"Checkout":step===2?"Payment Details":"Review Order"}</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Step {step+1} of {applicants.length>0?4:3}</div>
          </div>
          <div className="tap" onClick={onClose} style={{ fontSize:24, color:G.muted }}>×</div>
        </div>
        <div style={{ height:4, background:G.sand, borderRadius:2, marginBottom:18 }}>
          <div className="progress-fill" style={{ height:"100%", width:`${((step+1)/(applicants.length>0?4:3))*100}%`, background:G.greenLight, borderRadius:2 }} />
        </div>

        {/* Step 0: Pick a worker */}
        {step===0 && (<>
          {applicantsLoading ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:G.muted }}>
              <div style={{ width:36, height:36, borderRadius:"50%", border:`3px solid ${G.green}`, borderTopColor:"transparent", margin:"0 auto 12px", animation:"spin .8s linear infinite" }} />
              <div style={{ fontSize:13 }}>Loading applicants...</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : applicants.length === 0 ? (
            <div style={{ background:G.white, borderRadius:18, padding:24, textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>👥</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>No applicants yet</div>
              <div style={{ fontSize:13, color:G.muted, marginBottom:20 }}>Wait for workers to apply before hiring.</div>
              <Btn onClick={onClose} variant="outline" style={{ padding:"12px 24px", borderRadius:12 }}>Close</Btn>
            </div>
          ) : (<>
            <div style={{ fontSize:13, color:G.muted, marginBottom:14 }}>Choose who to hire for this job:</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {applicants.map(a=>(
                <div key={a.id} className="tap" onClick={()=>setSelectedWorker(a)} style={{ background:G.white, borderRadius:16, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", border:`2px solid ${selectedWorker?.id===a.id?G.green:G.border}`, display:"flex", gap:12, alignItems:"center", transition:"all .15s" }}>
                  <Avatar name={a.name} size={44} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{a.name}</div>
                    <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>⭐ {Number(a.rating).toFixed(1)} · {a.jobsDone} jobs done · Applied {a.appliedAt}</div>
                    {a.message && <div style={{ fontSize:12, color:G.text, marginTop:4, fontStyle:"italic" }}>"{a.message.slice(0,80)}{a.message.length>80?"...":""}"</div>}
                  </div>
                  <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${selectedWorker?.id===a.id?G.green:G.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {selectedWorker?.id===a.id&&<div style={{ width:10, height:10, borderRadius:"50%", background:G.green }}/>}
                  </div>
                </div>
              ))}
            </div>
            <Btn onClick={()=>setStep(1)} disabled={!selectedWorker} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15, opacity:selectedWorker?1:.5 }}>
              Continue with {selectedWorker?.name||"Worker"} →
            </Btn>
          </>)}
        </>)}

        {step===1 && (<>
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

          <Btn onClick={()=>setStep(2)} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>Continue to Payment →</Btn>
        </>)}

        {step===2 && (<>
          {/* Payment method selection */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Saved Cards</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {pmCards.length === 0 && (
              <div style={{ fontSize:13, color:G.muted, padding:"10px 0" }}>No saved cards — use "New Card" below.</div>
            )}
            {pmCards.map(m=>{
              const bl = {visa:"Visa",mastercard:"Mastercard",amex:"Amex",discover:"Discover"}[m.brand]||"Card";
              const label = `${bl} •••• ${m.last4}`;
              const sub = `Expires ${String(m.exp_month).padStart(2,"0")}/${String(m.exp_year).slice(-2)}${m.isDefault?" · Default":""}`;
              return (
                <div key={m.id} className="tap" onClick={()=>setPayMethod(m.id)} style={{ display:"flex", gap:12, alignItems:"center", background:G.white, borderRadius:14, padding:"12px 14px", border:`2px solid ${payMethod===m.id?G.green:G.border}`, transition:"all .15s" }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:payMethod===m.id?G.greenPale:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>💳</div>
                  <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:13 }}>{label}</div><div style={{ fontSize:11, color:G.muted }}>{sub}</div></div>
                  <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${payMethod===m.id?G.green:G.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>{payMethod===m.id&&<div style={{ width:8, height:8, borderRadius:"50%", background:G.green }}/>}</div>
                </div>
              );
            })}
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
            <Btn onClick={()=>setStep(1)} variant="outline" style={{ flex:1, padding:15, borderRadius:14 }}>← Back</Btn>
            <Btn onClick={()=>setStep(3)} disabled={payMethod==="new"&&!stripeRef} style={{ flex:2, padding:15, borderRadius:14, fontSize:15, opacity:(payMethod!=="new"||stripeRef)?1:.5 }}>Review Order →</Btn>
          </div>
        </>)}

        {step===3 && (<>
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
              <div style={{ fontWeight:700, fontSize:13 }}>{(() => { const c = pmCards.find(x=>x.id===payMethod); if(!c) return "Selected card"; const bl = {visa:"Visa",mastercard:"Mastercard",amex:"Amex",discover:"Discover"}[c.brand]||"Card"; return `${bl} •••• ${c.last4}`; })()}</div>
              <div style={{ fontSize:11, color:G.muted }}>{payMethod==="apple"?"Face ID":"Charged immediately"}</div>
            </div>
            <div className="tap" onClick={()=>setStep(2)} style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Change</div>
          </div>

          <div style={{ background:G.orangeLight, borderRadius:14, padding:14, marginBottom:18, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:16 }}>⚠️</span>
            <div style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>By confirming, <strong>${total}</strong> will be charged to your card. <strong>${job.pay.toFixed(2)}</strong> will be held in escrow until you confirm the job is complete.</div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>setStep(2)} variant="outline" style={{ flex:1, padding:15, borderRadius:14 }}>← Back</Btn>
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
// Stable field component defined outside SettingsScreen so it never remounts on re-render
function ProfileField({ label, value, onChange, type="text", rows, placeholder="" }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>
      {rows
        ? <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder} style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", resize:"none", background:G.white, outline:"none", lineHeight:1.5, boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", background:G.white, outline:"none", boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
      }
    </div>
  );
}

// Standalone bank edit form — own state so keystrokes don't re-render SettingsScreen
function BankEditForm({ initialFields, onSave, onCancel, bankSaved }) {
  const [fields, setFields] = React.useState(initialFields);
  const inputStyle = { width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, fontFamily:"'Outfit',sans-serif", background:G.white, outline:"none", boxSizing:"border-box" };
  const labelStyle = { fontSize:11, fontWeight:700, color:G.muted, display:"block", marginBottom:4, textTransform:"uppercase", letterSpacing:.5 };
  return (
    <div style={{ background:G.white, borderRadius:20, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,.08)", marginBottom:14 }}>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Update Bank Details
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={labelStyle}>Account Holder Name</label>
        <input value={fields.holder} onChange={e=>setFields(f=>({...f,holder:e.target.value}))} placeholder="Your full name" style={inputStyle} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={labelStyle}>Bank Name</label>
        <input value={fields.bankName} onChange={e=>setFields(f=>({...f,bankName:e.target.value}))} placeholder="Chase" style={inputStyle} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={labelStyle}>Account Type</label>
        <div style={{ display:"flex", gap:8 }}>
          {["Checking","Savings"].map(t=>(
            <div key={t} className="tap" onClick={()=>setFields(f=>({...f,type:t}))} style={{ flex:1, padding:"10px 14px", borderRadius:12, textAlign:"center", fontSize:13, fontWeight:600, background:fields.type===t?G.green:"transparent", color:fields.type===t?"#fff":G.text, border:`1.5px solid ${fields.type===t?G.green:G.border}`, transition:"all .2s" }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={labelStyle}>Routing Number</label>
        <input value={fields.routing} onChange={e=>setFields(f=>({...f,routing:e.target.value}))} placeholder="9 digits" style={inputStyle} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={labelStyle}>Account Number</label>
        <input value={fields.account} onChange={e=>setFields(f=>({...f,account:e.target.value}))} placeholder="Account number" style={inputStyle} onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border} />
      </div>
      {bankSaved
        ? <div style={{ textAlign:"center", padding:12, borderRadius:14, background:"#dcfce7", color:G.green, fontWeight:700, fontSize:14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign:"middle", marginRight:6 }}><path d="M20 6L9 17l-5-5"/></svg>
            Bank Updated!
          </div>
        : <div style={{ display:"flex", gap:8 }}>
            <Btn onClick={onCancel} variant="ghost" style={{ flex:1, padding:12, borderRadius:14 }}>Cancel</Btn>
            <Btn onClick={()=>onSave(fields)} style={{ flex:2, padding:12, borderRadius:14 }}>Save Changes</Btn>
          </div>
      }
    </div>
  );
}

function SettingsScreen({ role, escrowData, onConfirmSide, onDispute, onReview, onUpdateZip, onTogglesChange, currentUser, darkMode, onDarkMode, onAdmin }) {
  const [liveUser, setLiveUser] = React.useState(currentUser || (() => { try { return isBrowser ? JSON.parse(localStorage.getItem("chores_user")) : null; } catch { return null; } })());
  const storedUser = liveUser;
  const fullName = storedUser ? `${storedUser.firstName||storedUser.first_name||""} ${storedUser.lastName||storedUser.last_name||""}`.trim() : "You";
  const userEmail = storedUser?.email || "";
  const userZipCode = storedUser?.zip || "";

  // Refresh user data from DB on mount AND whenever editProfile subpage opens
  React.useEffect(() => {
    if (!isBrowser) return;
    const token = localStorage.getItem("chores_token");
    if (!token) return;
    fetch(`${BACKEND}/api/auth/me`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          const u = { ...data.user, firstName: data.user.first_name || "", lastName: data.user.last_name || "" };
          setLiveUser(u);
          localStorage.setItem("chores_user", JSON.stringify(u));
          setProfile(p => ({
            ...p,
            first: u.firstName || u.first_name || p.first,
            last: u.lastName || u.last_name || p.last,
            email: u.email || p.email,
            phone: u.phone || p.phone,
            zip: u.zip || p.zip,
            bio: typeof u.bio === "string" ? u.bio : (p.bio || ""),
            age: u.age != null ? String(u.age) : p.age,
            photo: u.avatar_url || p.photo,
          }));
          if (u.skills != null) setSelSkills(Array.isArray(u.skills) ? u.skills : []);
        }
      })
      .catch(() => {});
  }, [subPage === "editProfile"]);

  const [tab, setTab] = useState("profile");
  // Auto-switch to payments tab if worker has pending payments to accept
  React.useEffect(() => {
    const uid = (() => { try { return isBrowser ? JSON.parse(localStorage.getItem("chores_user"))?.id : null; } catch { return null; } })();
    if (role === "worker" && escrowData.filter(t => t.status === "held" && !t.workerConfirmed && String(t.workerId)===String(uid)).length > 0) {
      setTab("payments");
    }
  }, [escrowData, role]);
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
  const [toggles, setToggles] = useState(() => {
    const defaults = { push:true, sound:true, vibrate:true, darkMode:false, exactLoc:false, analytics:true, marketing:false, twoFactor:true, instantPayout:false,
      nJobs:true, nAppUpdates:true, nDayReminder:true, nHourReminder:true, nPayment:true, nCancel:true, nApplicant:true, nComplete:true, nReceipts:true, nRate:true, profileVisible:true };
    try {
      const saved = isBrowser ? localStorage.getItem("chores_toggles") : null;
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch { return defaults; }
  });
  const tog = (k) => setToggles(t=>{ 
    const n={...t,[k]:!t[k]}; 
    if(onTogglesChange) onTogglesChange(n); 
    try { if(isBrowser) localStorage.setItem("chores_toggles", JSON.stringify(n)); } catch {}
    return n; 
  });
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
  const [pmCards, setPmCards] = useState([]);
  const [pmLoading, setPmLoading] = useState(false);

  // Load real cards from Stripe on mount and when payment methods subpage opens
  React.useEffect(() => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    fetch(`${BACKEND}/api/customer/cards`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.cards) setPmCards(data.cards); })
      .catch(() => {});
  }, []);
  React.useEffect(() => {
    if (subPage !== "paymentMethods") return;
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    setPmLoading(true);
    fetch(`${BACKEND}/api/customer/cards`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.cards) setPmCards(data.cards); })
      .catch(() => {})
      .finally(() => setPmLoading(false));
  }, [subPage]);
  const [pmAdding, setPmAdding] = useState(false);
  const [pmProcessing, setPmProcessing] = useState(false);
  const [pmAddSuccess, setPmAddSuccess] = useState(false);
  const [pmError, setPmError] = useState("");
  // Transactions state
  const [txFilter, setTxFilter] = useState("all");
  // Bank account state
  const [bank, setBank] = useState({ name:"", last4:"", routing:"", type:"Checking", holder:"" });
  const [bankEditing, setBankEditing] = useState(false);
  const [bankFields, setBankFields] = useState({ holder:"", routing:"", account:"", bankName:"", type:"Checking" });
  const [bankSaved, setBankSaved] = useState(false);
  // Stripe Connect state
  const [connectStatus, setConnectStatus] = useState(null); // null=loading, {ready, payoutsEnabled, chargesEnabled, reason}
  const [connectLoading, setConnectLoading] = useState(false);

  React.useEffect(() => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    const checkStatus = () =>
      fetch(`${BACKEND}/api/connect/status`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setConnectStatus(data))
        .catch(() => setConnectStatus({ ready: false, reason: "Could not check status" }));
    checkStatus();
    // If returning from Stripe, re-check after a short delay
    if (isBrowser && new URLSearchParams(window.location.search).get("connect") === "complete") {
      setTimeout(checkStatus, 2000);
    }
  }, []);

  const handleConnectOnboard = async () => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    setConnectLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/connect/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ returnUrl: isBrowser ? window.location.href : "" }),
      }).then(r => r.json());
      if (res.url || res.onboardingUrl) {
        if (isBrowser) window.location.href = res.url || res.onboardingUrl;
      } else {
        alert(res.error || "Could not start onboarding");
      }
    } catch { alert("Network error — try again"); }
    setConnectLoading(false);
  };

  // Load bank details from backend on mount
  React.useEffect(() => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    fetch(`${BACKEND}/api/bank-details`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.bank && data.bank.bank_last4) {
          setBank({ name: data.bank.bank_name||"", last4: data.bank.bank_last4||"", routing: data.bank.bank_routing_masked||"", type: data.bank.bank_account_type||"Checking", holder: data.bank.bank_holder||"" });
          setBankFields(f => ({ ...f, holder: data.bank.bank_holder||"", bankName: data.bank.bank_name||"", type: data.bank.bank_account_type||"Checking" }));
        }
      }).catch(()=>{});
  }, []);
  const [downloadStep, setDownloadStep] = useState(0); // 0=none, 1=processing, 2=ready
  const [profile, setProfile] = useState({ first: storedUser?.firstName||storedUser?.first_name||"", last: storedUser?.lastName||storedUser?.last_name||"", email: userEmail, phone: storedUser?.phone||"", bio:storedUser?.bio || "", age: storedUser?.age ? String(storedUser.age) : "", zip: userZipCode, photo: storedUser?.avatar_url || null });
  const photoInputRef = React.useRef();
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [selSkills, setSelSkills] = useState(() => {
    try {
      const s = storedUser?.skills;
      if (Array.isArray(s) && s.length > 0) return s;
      return [];
    } catch { return []; }
  });
  const [customSkill, setCustomSkill] = useState("");
  const togSkill = (id) => setSelSkills(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [myReviews, setMyReviews] = useState([]);

  // Fetch real reviews from backend
  React.useEffect(() => {
    if (!isBrowser) return;
    const token = localStorage.getItem("chores_token");
    if (!token) return;
    fetch(`${BACKEND}/api/reviews/mine`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.reviews) setMyReviews(data.reviews); })
      .catch(() => {});
  }, []);
  const [pwFields, setPwFields] = useState({ current:"", newPw:"", confirm:"" });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [payoutFreq, setPayoutFreq] = useState("weekly");
  const [payoutDay, setPayoutDay] = useState("Monday");
  const [payoutSaved, setPayoutSaved] = useState(false);

  const settingsUserId = (() => { try { return isBrowser ? JSON.parse(localStorage.getItem("chores_user"))?.id : null; } catch { return null; } })();
  // Worker view: only transactions where I am the worker
  const myWorkerTxns = escrowData.filter(t => String(t.workerId) === String(settingsUserId));
  // Poster view: only transactions where I am the poster
  const myPosterTxns = escrowData.filter(t => String(t.posterId) === String(settingsUserId));
  const activeTxns = role === "worker" ? myWorkerTxns : myPosterTxns;
  const totalHeld = activeTxns.filter(t=>t.status==="held").reduce((s,t)=>s+(role==="worker"?t.workerGets:t.amount),0);
  const totalReleased = role==="worker"
    ? myWorkerTxns.filter(t=>t.status==="released").reduce((s,t)=>s+t.workerGets,0)
    : myPosterTxns.filter(t=>t.status==="released").reduce((s,t)=>s+t.amount,0);
  const heldCount = activeTxns.filter(t=>t.status==="held").length;

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
              setNewPhotoFile(file);
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
            <div style={{ flex:1 }}><ProfileField label="First Name" value={profile.first} onChange={e=>setProfile(p=>({...p,first:e.target.value}))} /></div>
            <div style={{ flex:1 }}><ProfileField label="Last Name" value={profile.last} onChange={e=>setProfile(p=>({...p,last:e.target.value}))} /></div>
          </div>
          <ProfileField label="Age" value={profile.age} onChange={e=>setProfile(p=>({...p,age:e.target.value.replace(/\D/g,"").slice(0,2)}))} />
        </div>

        {/* Contact */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Contact</div>
          <ProfileField label="Email" type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} />
          <ProfileField label="Phone" type="tel" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} />
          <ProfileField label="Zip Code" value={profile.zip} onChange={e=>setProfile(p=>({...p,zip:e.target.value.replace(/\D/g,"").slice(0,5)}))} />
        </div>

        {/* Bio */}
        <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>About You</div>
          <ProfileField label="Bio" value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value.slice(0,200)}))} rows={4} placeholder="Tell neighbors a bit about yourself..." />
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
            : <Btn onClick={async () => {
                const token = isBrowser ? localStorage.getItem("chores_token") : null;
                if (token) {
                  try {
                    // Upload new photo if selected
                    if (newPhotoFile) {
                      if (newPhotoFile.size > 5 * 1024 * 1024) { alert("Photo must be under 5MB."); return; }
                      const base64 = await new Promise(resolve => {
                        const r = new FileReader();
                        r.onload = e => resolve(e.target.result);
                        r.readAsDataURL(newPhotoFile);
                      });
                      const uploadRes = await fetch(`${BACKEND}/api/auth/upload-avatar`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ base64, mimeType: newPhotoFile.type }),
                      }).then(r => r.json());
                      if (uploadRes.avatarUrl) {
                        setProfile(p => ({ ...p, photo: uploadRes.avatarUrl }));
                        setNewPhotoFile(null);
                        // Update localStorage + currentUserData with new avatar so header updates instantly
                        const existing = JSON.parse(localStorage.getItem("chores_user")||"{}");
                        const updated = { ...existing, avatar_url: uploadRes.avatarUrl };
                        localStorage.setItem("chores_user", JSON.stringify(updated));
                        if (typeof setCurrentUserData === "function") setCurrentUserData(u => ({ ...u, avatar_url: uploadRes.avatarUrl }));
                      }
                    }
                    const payload = { firstName: profile.first, lastName: profile.last, phone: profile.phone, zip: profile.zip, age: profile.age, bio: profile.bio.trim(), skills: selSkills };
                    console.log("💾 Saving profile:", JSON.stringify(payload));
                    const res = await fetch(`${BACKEND}/api/auth/update-profile`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json();
                    console.log("💾 Save response:", JSON.stringify(data));
                    if (data.error) { alert("Save failed: " + data.error); return; }
                  } catch(e) { alert("Save error: " + e.message); return; }
                }
                try {
                  if (isBrowser) {
                    const existing = JSON.parse(localStorage.getItem("chores_user")||"{}");
                    localStorage.setItem("chores_user", JSON.stringify({ ...existing, firstName: profile.first, lastName: profile.last, email: profile.email, phone: profile.phone, zip: profile.zip, age: profile.age, bio: profile.bio, skills: selSkills }));
                  }
                } catch(e) {}
                if (onUpdateZip) onUpdateZip(profile.zip);
                setSaved(true);
                setTimeout(()=>{setSaved(false);setSubPage(null);},1400);
              }} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15 }}>Save Changes</Btn>
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
            <Btn onClick={async ()=>{ 
              if(!csSubject||!csMessage||!csCategory) return;
              try {
                const token = isBrowser ? localStorage.getItem("chores_token") : null;
                const user = isBrowser ? JSON.parse(localStorage.getItem("chores_user")||"{}") : {};
                await fetch(`${BACKEND}/api/support/contact`, {
                  method:"POST",
                  headers:{"Content-Type":"application/json",...(token?{"Authorization":`Bearer ${token}`}:{})},
                  body: JSON.stringify({ category: csCategory, subject: csSubject, message: csMessage, userId: user.id, email: user.email })
                });
              } catch(e) { console.error("Support error:", e); }
              setCsSent(true);
            }} disabled={!csSubject||!csMessage||!csCategory} style={{ width:"100%", padding:14, borderRadius:14, opacity:csSubject&&csMessage&&csCategory?1:.5 }}>Send Message</Btn>
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
            <Btn onClick={async ()=>{ 
              if(!bugType||!bugDesc) return;
              try {
                const token = isBrowser ? localStorage.getItem("chores_token") : null;
                const user = isBrowser ? JSON.parse(localStorage.getItem("chores_user")||"{}") : {};
                await fetch(`${BACKEND}/api/support/bug`, {
                  method:"POST",
                  headers:{"Content-Type":"application/json",...(token?{"Authorization":`Bearer ${token}`}:{})},
                  body: JSON.stringify({ type: bugType, description: bugDesc, steps: bugSteps, userId: user.id, email: user.email })
                });
              } catch(e) { console.error("Bug report error:", e); }
              setBugSent(true);
            }} disabled={!bugType||!bugDesc} style={{ width:"100%", padding:14, borderRadius:14, opacity:bugType&&bugDesc?1:.5 }}>Submit Bug Report</Btn>
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
            <Btn onClick={async ()=>{ 
              if(!featArea||!featDesc) return;
              try {
                const token = isBrowser ? localStorage.getItem("chores_token") : null;
                const user = isBrowser ? JSON.parse(localStorage.getItem("chores_user")||"{}") : {};
                await fetch(`${BACKEND}/api/support/feature`, {
                  method:"POST",
                  headers:{"Content-Type":"application/json",...(token?{"Authorization":`Bearer ${token}`}:{})},
                  body: JSON.stringify({ area: featArea, description: featDesc, userId: user.id, email: user.email })
                });
              } catch(e) { console.error("Feature request error:", e); }
              setFeatSent(true);
            }} disabled={!featArea||!featDesc} style={{ width:"100%", padding:14, borderRadius:14, opacity:featArea&&featDesc?1:.5 }}>Submit Idea</Btn>
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
    const cards = pmCards, setCards = setPmCards;
    const adding = pmAdding, setAdding = setPmAdding;
    const processing = pmProcessing, setProcessing = setPmProcessing;
    const addSuccess = pmAddSuccess, setAddSuccess = setPmAddSuccess;
    const error = pmError, setError = setPmError;
    const loading = pmLoading, setLoading = setPmLoading;

    const brandLabels = { visa:"Visa", mastercard:"Mastercard", amex:"Amex", discover:"Discover", unknown:"Card" };
    const brandColors = { visa:"#1a1f71", mastercard:"#eb001b", amex:"#006fcf", discover:"#ff6000" };
    const token = isBrowser ? localStorage.getItem("chores_token") : null;

    const apiSetDefault = async (pmId) => {
      setCards(c => c.map(x => ({ ...x, isDefault: x.id === pmId })));
      const res = await fetch(`${BACKEND}/api/customer/set-default`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ paymentMethodId: pmId }),
      }).then(r => r.json()).catch(() => ({}));
      if (res.error) { setError(res.error); }
    };

    const apiDetach = async (pmId) => {
      const optimistic = cards.filter(x => x.id !== pmId);
      if (optimistic.length && !optimistic.some(x => x.isDefault)) optimistic[0].isDefault = true;
      setCards(optimistic);
      const res = await fetch(`${BACKEND}/api/customer/detach-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ paymentMethodId: pmId }),
      }).then(r => r.json()).catch(() => ({}));
      if (res.error) { setError(res.error); }
    };

    const handleStripeAdd = async () => {
      setError("");
      setProcessing(true);
      const ref = window._settingsStripeRef;
      if (!ref) { setError("Stripe is still loading, please wait."); setProcessing(false); return; }
      const { stripe, card: cardEl } = ref;

      // 1. Get a SetupIntent clientSecret from backend
      const siRes = await fetch(`${BACKEND}/api/customer/setup-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      }).then(r => r.json()).catch(() => ({}));

      if (siRes.error) { setError(siRes.error); setProcessing(false); return; }

      // 2. Confirm the SetupIntent with the card element
      const { setupIntent, error: stripeErr } = await stripe.confirmCardSetup(siRes.clientSecret, {
        payment_method: { card: cardEl },
      });

      if (stripeErr) { setError(stripeErr.message); setProcessing(false); return; }

      // 3. If this is the first card, set it as default
      if (cards.length === 0) {
        await fetch(`${BACKEND}/api/customer/set-default`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ paymentMethodId: setupIntent.payment_method }),
        }).then(r => r.json()).catch(() => {});
      }

      // 4. Reload cards from Stripe
      const updated = await fetch(`${BACKEND}/api/customer/cards`, {
        headers: { "Authorization": `Bearer ${token}` },
      }).then(r => r.json()).catch(() => ({ cards: [] }));
      if (updated.cards) setCards(updated.cards);

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
        {loading && cards.length === 0 && (
          <div style={{ textAlign:"center", padding:"30px 0", color:G.muted, fontSize:13 }}>Loading cards...</div>
        )}
        {!loading && cards.length === 0 && !adding && (
          <div style={{ textAlign:"center", padding:"20px 0 10px", color:G.muted, fontSize:13 }}>No saved cards yet. Add one below.</div>
        )}
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
    const filtered = txFilter==="all" ? activeTxns : activeTxns.filter(t=>t.status===txFilter);
    const totals = {
      all: activeTxns.length,
      held: activeTxns.filter(t=>t.status==="held").length,
      released: activeTxns.filter(t=>t.status==="released").length,
      disputed: activeTxns.filter(t=>t.status==="disputed").length,
      refunded: activeTxns.filter(t=>t.status==="refunded").length,
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
            <div style={{ fontSize:11, color:G.muted, fontWeight:600 }}>{role==="worker"?"Total Earned":"Total Paid Out"}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.greenMid, marginTop:4 }}>${activeTxns.filter(t=>t.status==="released").reduce((s,t)=>s+(role==="worker"?t.workerGets:t.amount),0).toFixed(2)}</div>
          </div>
          <div style={{ flex:1, background:G.white, borderRadius:16, padding:14, textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize:11, color:G.muted, fontWeight:600 }}>Currently Held</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.gold, marginTop:4 }}>${activeTxns.filter(t=>t.status==="held").reduce((s,t)=>s+(role==="worker"?t.workerGets:t.amount),0).toFixed(2)}</div>
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
          <BankEditForm
            initialFields={editFields}
            bankSaved={bankSaved}
            onCancel={()=>setEditing(false)}
            onSave={async (fields) => {
              if(!fields.routing||!fields.account) return;
              const token = isBrowser ? localStorage.getItem("chores_token") : null;
              const last4 = fields.account.slice(-4);
              setBank({ name:fields.bankName, last4, routing:"•••••"+fields.routing.slice(-4), type:fields.type, holder:fields.holder });
              setEditFields(fields);
              setBankSaved(true);
              if (token) {
                fetch(`${BACKEND}/api/bank-details`, {
                  method:"POST",
                  headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
                  body:JSON.stringify({ holder:fields.holder, bankName:fields.bankName, accountType:fields.type, routing:fields.routing, accountLast4:last4 }),
                }).catch(()=>{});
              }
              setTimeout(()=>{setBankSaved(false);setEditing(false);},1200);
            }}
          />
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
    // Real badge stats from backend
    const [badgeStats, setBadgeStats] = React.useState(null);
    React.useEffect(() => {
      const token = isBrowser ? localStorage.getItem("chores_token") : null;
      if (!token) return;
      fetch(`${BACKEND}/api/badge-stats`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (!d.error) setBadgeStats(d); })
        .catch(() => {});
    }, []);
    const completedJobs = badgeStats?.jobsCompleted ?? escrowData.filter(t=>t.status==="released").length;
    const totalEarned = badgeStats?.totalEarned ?? escrowData.filter(t=>t.status==="released").reduce((s,t)=>s+t.workerGets,0);
    const categoriesDone = badgeStats?.categoriesDone ?? [...new Set(escrowData.filter(t=>t.status==="released").map(t=>t.category).filter(Boolean))].length;
    const jobsToday = badgeStats?.jobsToday ?? 0;
    const consecutiveFiveStar = badgeStats?.consecutiveFiveStar ?? 0;
    const uniqueRehireClients = badgeStats?.uniqueRehireClients ?? 0;
    const cancellations30d = badgeStats?.cancellations30d ?? 0;

    // SVG badge icons with color
    const BadgeIcon = ({ id, size=28, dim=false }) => {
      const op = dim ? .45 : 1;
      const icons = {
        first_job:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
        five_star:   <svg width={size} height={size} viewBox="0 0 24 24" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
        speed_demon: <svg width={size} height={size} viewBox="0 0 24 24" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
        repeat_fav:  <svg width={size} height={size} viewBox="0 0 24 24" fill="#34D399" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
        top_earner:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        early_bird:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
        jack_trades: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
        reliable:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
        centurion:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/><circle cx="12" cy="12" r="3" fill="#06B6D4" stroke="none"/></svg>,
        superhost:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>,
        marathon:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><circle cx="13" cy="6" r="2"/><path d="m20 10-5-2-4 4-4 2"/><path d="m6 20 2-5 4 2 4 5"/></svg>,
        community:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:op}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      };
      return icons[id] || <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
    };

    const BADGES = [
      { id:"first_job",   label:"First Job",        desc:"Complete your first job",                  earned:completedJobs>=1,                           progress:Math.min(completedJobs,1),      goal:1 },
      { id:"five_star",   label:"5-Star Streak",     desc:"Get 5 consecutive 5-star reviews",         earned:consecutiveFiveStar>=5,                     progress:Math.min(consecutiveFiveStar,5), goal:5 },
      { id:"speed_demon", label:"Speed Demon",       desc:"Complete 3 jobs in one day",               earned:jobsToday>=3,                               progress:Math.min(jobsToday,3),          goal:3 },
      { id:"repeat_fav",  label:"Repeat Favorite",   desc:"Get hired by 5 different clients",         earned:uniqueRehireClients>=5,                     progress:Math.min(uniqueRehireClients,5), goal:5 },
      { id:"top_earner",  label:"Top Earner",        desc:"Earn over $1,000 total",                   earned:totalEarned>=1000,                          progress:Math.round(Math.min(totalEarned,1000)), goal:1000 },
      { id:"early_bird",  label:"Early Bird",        desc:"Accept a job within 1 minute of posting",  earned:false,                                      progress:0,                              goal:1 },
      { id:"jack_trades", label:"Jack of All Trades",desc:"Complete jobs in 5+ categories",           earned:categoriesDone>=5,                          progress:Math.min(categoriesDone,5),     goal:5 },
      { id:"reliable",    label:"Reliable",          desc:"Zero cancellations in 30 days",            earned:cancellations30d===0&&completedJobs>0,       progress:cancellations30d===0?completedJobs:0, goal:1 },
      { id:"centurion",   label:"Centurion",         desc:"Complete 100 jobs",                        earned:completedJobs>=100,                         progress:Math.min(completedJobs,100),    goal:100 },
      { id:"superhost",   label:"Superhost",         desc:"Maintain 4.9+ rating for 90 days",        earned:badgeStats?.rating>=4.9&&completedJobs>=10,  progress:badgeStats?.rating>=4.9?completedJobs:0, goal:10 },
      { id:"marathon",    label:"Marathon",          desc:"Complete 50 jobs total",                   earned:completedJobs>=50,                          progress:Math.min(completedJobs,50),     goal:50 },
      { id:"community",   label:"Community Hero",    desc:"Complete 10+ jobs in your neighborhood",   earned:completedJobs>=10,                          progress:Math.min(completedJobs,10),     goal:10 },
    ];
    const SKILL_CATS = [
      { id:"lawn",        label:"Lawn Care" },
      { id:"cleaning",    label:"Cleaning" },
      { id:"moving",      label:"Moving" },
      { id:"pets",        label:"Pet Care" },
      { id:"painting",    label:"Painting" },
      { id:"errands",     label:"Errands" },
      { id:"babysitting", label:"Babysitting" },
      { id:"tech",        label:"Tech Help" },
      { id:"windows",     label:"Window Washing" },
      { id:"cooking",     label:"Cooking" },
    ];
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
                <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}><BadgeIcon id={b.id} size={30} /></div>
                <div style={{ fontWeight:700, fontSize:13 }}>{b.label}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2, lineHeight:1.4 }}>{b.desc}</div>
                <div style={{ fontSize:10, color:G.greenMid, fontWeight:700, marginTop:6 }}>✓ Earned</div>
              </div>
            ))}
          </div>

          {/* Locked badges */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>In Progress</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {BADGES.filter(b=>!b.earned).map(b=>(
              <div key={b.id} style={{ background:G.white, borderRadius:16, padding:14, boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><BadgeIcon id={b.id} size={24} dim /></div>
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
                  <div style={{ fontWeight:700, fontSize:14 }}>{s.label}</div>
                  <div style={{ fontSize:12, color:G.greenMid, marginTop:2 }}>Active skill</div>
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
    const handleDelete = async () => {
      setDeleteStep(3);
      const token = isBrowser ? localStorage.getItem("chores_token") : null;
      try {
        const res = await fetch(`${BACKEND}/api/auth/delete-account`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.error) { setDeleteStep(1); alert("Error: " + data.error); return; }
        setDeleteStep(4);
        // Log out after short delay
        setTimeout(() => {
          if (isBrowser) { localStorage.removeItem("chores_token"); localStorage.removeItem("chores_user"); localStorage.removeItem("chores_escrow"); }
          window.location.reload();
        }, 3000);
      } catch(e) {
        setDeleteStep(1);
        alert("Network error. Please try again.");
      }
    };
    return (
      <div className="fade" style={{ padding:"16px 20px", paddingBottom:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div className="tap" onClick={()=>{setSubPage(null);setDeleteStep(0);setDeleteConfirmText("");}} style={{ width:34, height:34, borderRadius:10, background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>←</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, flex:1, color:G.red }}>Delete My Account</div>
        </div>

        {deleteStep===4 ? (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:G.redLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={G.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, marginBottom:8 }}>Account Deleted</div>
            <div style={{ fontSize:13, color:G.muted, lineHeight:1.6, marginBottom:20 }}>Your account and all personal data have been permanently removed. You'll be signed out shortly.</div>
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
                <div style={{ fontSize:13, fontWeight:700, color:G.text, marginBottom:12 }}>Type <span style={{ color:G.red, fontFamily:"monospace" }}>DELETE</span> to confirm:</div>
                <input
                  value={deleteConfirmText}
                  onChange={e=>{ setDeleteConfirmText(e.target.value); if(e.target.value==="DELETE") setDeleteStep(2); else if(deleteStep===2) setDeleteStep(1); }}
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
    const avg = myReviews.length > 0 ? (myReviews.reduce((s,r)=>s+r.rating,0)/myReviews.length).toFixed(1) : "—";
    const dist = [5,4,3,2,1].map(s=>({ s, count:myReviews.filter(r=>r.rating===s).length }));
    const maxCount = Math.max(...dist.map(d=>d.count),1);
    const filtered = reviewFilter==="all"?myReviews:myReviews.filter(r=>r.rating===parseInt(reviewFilter));

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
              <div style={{ fontSize:11, color:G.muted, marginTop:4 }}>{myReviews.length} reviews</div>
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
              const allTags = myReviews.flatMap(r=>r.tags);
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
              <Avatar name={r.reviewerName} size={40} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{r.reviewerName}</div>
                <div style={{ fontSize:11, color:G.muted }}>{r.jobTitle}</div>
              </div>
              <div style={{ fontSize:11, color:G.muted }}>{r.date}</div>
            </div>
            <div style={{ display:"flex", gap:2, marginBottom:8 }}>
              {[1,2,3,4,5].map(s=>(
                <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s<=r.rating?G.green:G.border} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <div style={{ fontSize:13, color:G.text, lineHeight:1.5, marginBottom:8 }}>{r.comment}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {(r.tags||[]).map(t=>(
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
          {tabs.map(t=>{
            const isPending = t.id==="payments" && role==="worker" && escrowData.filter(x=>x.status==="held"&&!x.workerConfirmed&&String(x.workerId)===String(settingsUserId)).length>0;
            return (
            <div key={t.id} className="chip tap" onClick={()=>setTab(t.id)} style={{ padding:"7px 14px", borderRadius:20, fontSize:12, fontWeight:600, background:tab===t.id?G.green:G.white, color:tab===t.id?"#fff":G.text, border:`1.5px solid ${tab===t.id?G.green:G.border}`, display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap", flexShrink:0, position:"relative" }}>
              {t.label}
              {isPending && <div style={{ position:"absolute", top:-4, right:-4, width:10, height:10, borderRadius:"50%", background:G.red, border:"2px solid #fff" }} />}
            </div>
            );
          })}
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
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800 }}>{`${profile.first} ${profile.last}`.trim() || "Your Name"}</div>
              <div style={{ color:G.muted, fontSize:12, marginTop:2 }}>{[profile.zip && `Zip ${profile.zip}`, storedUser?.createdAt && `Joined ${new Date(storedUser.createdAt).toLocaleDateString("en-US",{month:"short",year:"numeric"})}`].filter(Boolean).join(" · ") || "Complete your profile"}</div>
              <div style={{ display:"flex", gap:6, marginTop:8 }}>
                {storedUser?.rating != null && <Tag><span style={{ display:"flex", alignItems:"center", gap:4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill={G.gold} stroke={G.gold} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {Number(storedUser.rating).toFixed(1)}</span></Tag>}
                {storedUser?.identity_verified && <Tag><span style={{ display:"flex", alignItems:"center", gap:4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.greenMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Verified</span></Tag>}
                <Tag bg="#EBF8FF" color={G.blue}><span style={{ display:"flex", alignItems:"center", gap:4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> 0 Strikes</span></Tag>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            {(()=>{
              const workerEarned = myWorkerTxns.filter(t=>t.status==="released").reduce((s,t)=>s+t.workerGets,0);
              const posterSpent = myPosterTxns.filter(t=>["released","held"].includes(t.status)).reduce((s,t)=>s+t.amount,0);
              const moneyVal = role==="worker" ? `$${workerEarned.toFixed(0)}` : `$${posterSpent.toFixed(0)}`;
              return [{l:"Jobs Done",v:storedUser?.jobs_completed ?? 0},{l:role==="worker"?"Earned":"Spent",v:moneyVal},{l:"Rating",v:storedUser?.rating != null ? Number(storedUser.rating).toFixed(1) : "—"}].map(s=>(
              <div key={s.l} className="stat-card" style={{ flex:1, background:G.white, borderRadius:16, padding:"14px 10px", textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800, color:G.greenMid }}>{s.v}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{s.l}</div>
              </div>
            ));
            })()}
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
            {myReviews.length === 0 ? (
              <div style={{ fontSize:13, color:G.muted, textAlign:"center", padding:"12px 0" }}>No reviews yet — complete jobs to earn reviews</div>
            ) : myReviews.slice(0,2).map(r=>(
              <div key={r.id} style={{ paddingBottom:10, marginBottom:10, borderBottom:`1px solid ${G.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{r.reviewerName}</div>
                  <div style={{ display:"flex", gap:2 }}>
                    {[1,2,3,4,5].map(s=>(
                      <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s<=r.rating?G.green:G.border} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                </div>
                {r.comment && <div style={{ fontSize:12, color:G.muted, lineHeight:1.4 }}>{r.comment}</div>}
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
            {[{icon:"🏆",label:"Badges & Skills",sub:"Track your achievements",last:true}].map(r=>(
              <SettingRow key={r.label} icon={r.icon} label={r.label} sub={r.sub} last={r.last} onClick={r.label==="Badges & Skills"?()=>setSubPage("badgesSkills"):()=>{}} right={<span style={{ fontSize:14, color:G.muted }}>›</span>} />
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
              <div style={{ color:G.muted, fontSize:12, marginTop:2 }}>{profile.email} · {profile.phone}</div>
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
            <Btn variant="outline" style={{ width:"100%", borderRadius:16 }} onClick={()=>{
              if (!window.confirm("Are you sure you want to sign out?")) return;
              if (isBrowser) {
                localStorage.removeItem("chores_user");
                localStorage.removeItem("chores_token");
              }
              window.location.reload();
            }}>Sign Out</Btn>
            <Btn variant="danger" style={{ width:"100%", borderRadius:16, opacity:.6 }}>Delete Account</Btn>
          </div>

        </div>
      )}

      {/* ── PAYMENTS & ESCROW ── */}
      {tab==="payments"&&(
        <div className="fade">
          {/* Worker: jobs awaiting your confirmation */}
          {role==="worker" && myWorkerTxns.filter(t=>t.status==="held"&&!t.workerConfirmed).length>0&&(
            <div style={{ background:`linear-gradient(135deg,${G.green},${G.greenMid})`, borderRadius:20, padding:20, marginBottom:16, color:"#fff", boxShadow:`0 6px 24px ${G.green}55` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:12, background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💰</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:17 }}>You have money waiting!</div>
                  <div style={{ fontSize:12, opacity:.85 }}>Confirm completion to release your payment</div>
                </div>
              </div>
              {myWorkerTxns.filter(t=>t.status==="held"&&!t.workerConfirmed).map(t=>(
                <div key={t.id} className="tap" onClick={()=>setSelectedTxn(t)} style={{ background:"rgba(255,255,255,.2)", borderRadius:14, padding:"14px 16px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center", border:"1.5px solid rgba(255,255,255,.3)" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{t.job}</div>
                    <div style={{ fontSize:12, opacity:.85, marginTop:2 }}>From {t.poster}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:18 }}>${t.workerGets.toFixed(2)}</div>
                    <div style={{ background:"#fff", color:G.green, fontSize:11, fontWeight:800, padding:"5px 12px", borderRadius:10, marginTop:4 }}>Accept →</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Poster: jobs awaiting poster confirmation */}
          {role==="poster" && myPosterTxns.filter(t=>t.status==="held"&&!t.posterConfirmed).length>0&&(
            <div style={{ background:`linear-gradient(135deg,${G.gold}CC,${G.gold})`, borderRadius:18, padding:16, marginBottom:16, color:"#fff" }}>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>Confirm Job Complete</div>
              <div style={{ fontSize:13, opacity:.9, marginBottom:12 }}>Tap a job below to confirm completion and release payment to your worker.</div>
              {myPosterTxns.filter(t=>t.status==="held"&&!t.posterConfirmed).map(t=>(
                <div key={t.id} className="tap" onClick={()=>setSelectedTxn(t)} style={{ background:"rgba(255,255,255,.2)", borderRadius:12, padding:"10px 14px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{t.job}</div>
                    <div style={{ fontSize:11, opacity:.8 }}>Worker: {t.worker} · ${t.workerGets.toFixed(2)}</div>
                  </div>
                  <div style={{ background:"#fff", color:G.gold, fontSize:11, fontWeight:800, padding:"6px 12px", borderRadius:10 }}>Confirm →</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Escrow Wallet</div>
            <div style={{ display:"flex", gap:10 }}>
              <div className={heldCount>0?"escrow-glow":""} style={{ flex:1, background:G.white, borderRadius:18, padding:16, boxShadow:"0 4px 16px rgba(0,0,0,.07)", border:heldCount>0?`1.5px solid ${G.greenLight}`:`1px solid ${G.border}` }}>
                {heldCount>0&&<div style={{ marginBottom:6 }}><span style={{ fontSize:10, fontWeight:700, background:"#FFF7ED", color:G.gold, padding:"2px 8px", borderRadius:8 }}>{heldCount} active</span></div>}
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:G.gold }}>${totalHeld.toFixed(2)}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>In Escrow</div>
              </div>
              <div style={{ flex:1, background:G.white, borderRadius:18, padding:16, boxShadow:"0 4px 16px rgba(0,0,0,.07)" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:G.greenMid }}>${totalReleased.toFixed(2)}</div>
                <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{role==="worker"?"Earned":"Paid Out"}</div>
              </div>
            </div>
          </div>

          {/* How escrow works mini */}
          <div style={{ background:G.greenPale, borderRadius:14, padding:14, marginBottom:16, border:`1px solid ${G.greenLight}` }}>
            <div style={{ fontWeight:700, fontSize:13, color:G.greenMid, marginBottom:4 }}>Escrow Protection</div>
            <div style={{ fontSize:12, color:G.text, lineHeight:1.5 }}>Payments are held securely and released only when the poster confirms job completion. Full refund if the worker doesn't show.</div>
          </div>

          {/* Recent escrow transactions */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Escrow Transactions</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {activeTxns.slice(0,5).map(txn=>{
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
            {activeTxns.length>5&&<div className="tap" onClick={()=>setSubPage("allTransactions")} style={{ textAlign:"center", padding:10, fontSize:13, color:G.greenMid, fontWeight:700 }}>View all {activeTxns.length} transactions →</div>}
            {activeTxns.length<=5&&activeTxns.length>0&&<div className="tap" onClick={()=>setSubPage("allTransactions")} style={{ textAlign:"center", padding:10, fontSize:13, color:G.greenMid, fontWeight:700 }}>View all transactions →</div>}
          </div>

          {/* Payment methods */}
          <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Payment Methods</div>
          <div className="tap" onClick={()=>setSubPage("paymentMethods")} style={{ background:G.white, borderRadius:18, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💳</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>
                {pmCards.length > 0 ? (() => { const d = pmCards.find(c=>c.isDefault)||pmCards[0]; const bl = {visa:"Visa",mastercard:"Mastercard",amex:"Amex",discover:"Discover"}[d.brand]||"Card"; return `${bl} •••• ${d.last4}`; })() : "No saved cards"}
              </div>
              <div style={{ fontSize:12, color:G.muted }}>{pmCards.length > 0 ? "Default · Tap to manage" : "Tap to add a card"}</div>
            </div>
            <span style={{ fontSize:16, color:G.muted }}>›</span>
          </div>

          {/* Payout settings (worker only) */}
          {role==="worker"&&(
            <>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Payout Settings</div>

              {/* Stripe Connect status banner */}
              {connectStatus?.ready ? (
                <div style={{ background:`linear-gradient(135deg,${G.green},${G.greenMid})`, borderRadius:18, padding:18, marginBottom:12, color:"#fff", boxShadow:`0 6px 20px ${G.green}44` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:42, height:42, borderRadius:14, background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>✅</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, fontSize:15 }}>Payouts Enabled</div>
                      <div style={{ fontSize:12, opacity:.85, marginTop:2 }}>Your Stripe account is verified. You'll receive payments automatically.</div>
                    </div>
                  </div>
                  <div className="tap" onClick={handleConnectOnboard} style={{ marginTop:12, background:"rgba(255,255,255,.2)", borderRadius:12, padding:"10px 14px", textAlign:"center", fontSize:13, fontWeight:700, border:"1.5px solid rgba(255,255,255,.3)" }}>
                    Manage Stripe Account →
                  </div>
                </div>
              ) : (
                <div style={{ background:`linear-gradient(135deg,#1a1a2e,#16213e)`, borderRadius:18, padding:18, marginBottom:12, color:"#fff", boxShadow:"0 6px 20px rgba(0,0,0,.25)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <div style={{ width:42, height:42, borderRadius:14, background:"rgba(99,91,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🏦</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, fontSize:16 }}>Set Up Payouts</div>
                      <div style={{ fontSize:12, opacity:.75, marginTop:2 }}>Connect your bank to receive payments directly.</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
                    {[
                      "Takes ~2 minutes",
                      "Powered by Stripe — bank-level security",
                      "Payments hit your account in 1–2 days",
                    ].map(t => (
                      <div key={t} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, opacity:.85 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="tap" onClick={handleConnectOnboard} style={{ background:"linear-gradient(135deg,#635bff,#7c6aff)", borderRadius:14, padding:"14px 20px", textAlign:"center", fontSize:15, fontWeight:800, letterSpacing:.3, boxShadow:"0 4px 16px rgba(99,91,255,.5)", opacity:connectLoading?.5:1 }}>
                    {connectLoading ? "Redirecting to Stripe…" : "Connect Bank Account →"}
                  </div>
                  {connectStatus?.reason && (
                    <div style={{ marginTop:10, fontSize:11, opacity:.6, textAlign:"center" }}>{connectStatus.reason}</div>
                  )}
                </div>
              )}

              <div style={{ background:G.white, borderRadius:18, padding:"4px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
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
            <SettingRow icon="🌙" label="Dark Mode" sub={darkMode?"On":"Off"} right={<Toggle on={darkMode} onChange={()=>onDarkMode&&onDarkMode(d=>!d)} />} />
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
            <SettingRow icon="🗑️" label="Delete My Account" sub="Permanently remove your account" right={<span style={{ fontSize:12, color:G.red, fontWeight:700 }}>Request →</span>} onClick={()=>setSubPage("deleteData")} last />
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
            <SettingRow icon="🛡️" label="Community Guidelines" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>setSubPage("guidelines")} />
            <SettingRow icon="⚙️" label="Admin Dashboard" sub="Developer tools" right={<span style={{ color:G.muted }}>→</span>} onClick={()=>onAdmin&&onAdmin()} last />
          </div>
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", textAlign:"center" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:800, color:G.green }}>Chores<span style={{ color:G.greenLight }}>.</span></div>
            <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>Made with ♥ in Chicago</div>
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
  const [notifs, setNotifs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedNotif, setSelectedNotif] = useState(null);
  const notifRef = React.useRef(null);

  // Fetch from DB on mount + poll every 20s
  React.useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 20000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifs() {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${BACKEND}/api/notifications`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (data.notifications) setNotifs(data.notifications);
    } catch(e) { console.error("Notifications fetch error:", e); }
    setLoading(false);
  }

  async function markRead(ids) {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    // Optimistic update
    setNotifs(prev => prev.map(n => (!ids || ids.includes(n.id)) ? {...n, unread: false} : n));
    await fetch(`${BACKEND}/api/notifications/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ ids }),
    }).catch(() => {});
  }

  React.useEffect(()=>{
    if(notifRef.current){let p=notifRef.current.parentElement;while(p){if(p.scrollTop>0)p.scrollTop=0;p=p.parentElement;}}
  },[selectedNotif, filter]);

  const cats = ["all","job","payment","reminder","alert"];
  const filtered = filter==="all" ? notifs : notifs.filter(n=>n.category===filter);
  const unreadCount = notifs.filter(n=>n.unread).length;
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
        <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: .8 }}>Inbox</div>
        {unreadCount>0&&<div className="tap" onClick={()=>markRead(null)} style={{ fontSize:12, color:G.greenMid, fontWeight:700 }}>Mark all read</div>}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {loading && notifs.length===0 && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:G.muted, fontSize:13 }}>Loading notifications...</div>
        )}
        {!loading && filtered.length===0 && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:G.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
            <div style={{ fontWeight:700, fontSize:15, color:G.text, marginBottom:6 }}>No notifications yet</div>
            <div style={{ fontSize:13, lineHeight:1.6 }}>{role==="worker" ? "Apply to jobs to get updates here" : "You'll be notified when someone applies"}</div>
          </div>
        )}
        {filtered.map(n=>{
          const isUnread = n.unread;
          return (
            <div key={n.id} className="tap card" onClick={()=>{ if(n.unread) markRead([n.id]); setSelectedNotif(n); }} style={{ background:G.white, borderRadius:16, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", gap:12, alignItems:"flex-start", borderLeft:`3px solid ${isUnread?G.green:"transparent"}`, opacity:isUnread?1:0.75 }}>
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

function DiscoveryScreen({ role, onPostJob, onFundEscrow, onCheckout, isGuest, onGuestAction, userZip, maxDist, setMaxDist, profileVisible=true, refreshSignal=0, onApplicationSent, onViewProfile, escrowData=[] }) {
  const [discoverView, setDiscoverView] = useState("feed");
  const [activeCategory, setActiveCategory] = useState([]);
  const [payRange, setPayRange] = useState([0,5000]);
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
  const [applyAvail, setApplyAvail] = useState([]);
  const [liveJobs, setLiveJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [myPostedJobs, setMyPostedJobs] = useState([]);
  const [editJob, setEditJob] = useState(null); // job being edited
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const discRef = React.useRef(null);

  const normalizeJob = (j) => ({
    id: j.id,
    title: j.title,
    category: j.category,
    poster: j.poster_name || "Anonymous",
    posterRating: j.poster_rating || 5.0,
    posterJobs: j.poster_jobs_count || 0,
    posterSince: j.poster_since || "",
    loc: j.zip || userZip,
    dist: j.dist || 0,
    pay: parseFloat(j.pay) || 0,
    date: j.date || j.scheduled_date || "",
    tags: j.tags ? (typeof j.tags === "string" ? j.tags.split(",") : j.tags) : [],
    verified: j.poster_verified || false,
    urgent: j.urgent || false,
    applicants: j.applicant_count || 0,
    lat: j.lat || 41.88,
    lng: j.lng || -87.63,
    desc: j.description || "",
    photos: [],
    posterId: j.poster_id,
    status: j.status || "open",
  });

  const fetchJobs = React.useCallback(() => {
    fetch(`${BACKEND}/api/jobs?zip=${userZip}&maxDist=${maxDist}`)
      .then(r=>r.json())
      .then(data=>{ if (data.jobs) setLiveJobs(data.jobs.map(normalizeJob)); })
      .catch(e=>console.error("Jobs fetch error:", e))
      .finally(()=>setJobsLoading(false));
  }, [userZip, maxDist]);

  const fetchMyPostedJobs = React.useCallback(() => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    fetch(`${BACKEND}/api/jobs/mine`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.jobs) setMyPostedJobs(data.jobs); })
      .catch(e => console.error("My jobs fetch error:", e));
  }, [role]);

  // Initial load + poll every 30 seconds for new postings
  React.useEffect(()=>{
    setJobsLoading(true);
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, [fetchJobs, refreshSignal]);

  // Fetch which jobs this worker has already applied to
  React.useEffect(() => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    fetch(`${BACKEND}/api/jobs/applied`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.jobIds) setApplied(data.jobIds); })
      .catch(() => {});
  }, []);

  // Fetch poster's own jobs whenever role or refreshSignal changes
  React.useEffect(() => {
    fetchMyPostedJobs();
  }, [fetchMyPostedJobs, refreshSignal, role]);

  React.useEffect(()=>{
    if(discRef.current){let p=discRef.current.parentElement;while(p){if(p.scrollTop>0)p.scrollTop=0;p=p.parentElement;}}
    window.scrollTo(0,0);
  },[selectedJob, applyModal, discoverView]);

  const myPostedJobIds = new Set(myPostedJobs.map(j => j.id));
  const currentUserId = (() => { try { return isBrowser ? JSON.parse(localStorage.getItem("chores_user"))?.id : null; } catch { return null; } })();
  const filtered = liveJobs.filter(j=>{
    if(currentUserId && j.posterId === currentUserId) return false; // always hide own jobs from feed
    if(myPostedJobIds.has(j.id)) return false; // fallback: hide own jobs from discovery feed
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
            <Avatar name={(()=>{try{const u=isBrowser?JSON.parse(localStorage.getItem("chores_user")):null;return u?`${u.firstName||""} ${u.lastName||""}`.trim():"?"}catch{return "?"}})()} size={44} bg={`linear-gradient(135deg,${G.green},${G.greenLight})`} />
            {(()=>{ 
              try { 
                const u=isBrowser?JSON.parse(localStorage.getItem("chores_user")):null;
                const name = u?`${u.firstName||""} ${u.lastName||""}`.trim():"You";
                const rating = u?.rating||"5.0";
                const jobs = u?.jobsCompleted||0;
                return (<div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{name}</div>
                  <div style={{ fontSize:12, color:G.muted, display:"flex", alignItems:"center", gap:4 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#F4A261" stroke="#F4A261" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {rating} · {jobs} jobs
                  </div>
                </div>);
              } catch { return <div style={{ fontWeight:700, fontSize:14 }}>You</div>; } 
            })()}
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
            {["Morning","Afternoon","Evening","Weekends","Flexible"].map(t=>{
              const sel = applyAvail.includes(t);
              return (
                <div key={t} className="tap chip" onClick={()=>setApplyAvail(a=>sel?a.filter(x=>x!==t):[...a,t])}
                  style={{ padding:"8px 14px", borderRadius:12, fontSize:12, fontWeight:600,
                    background:sel?G.greenPale:G.sand,
                    color:sel?G.green:G.muted,
                    border:`1.5px solid ${sel?G.greenLight:G.border}`,
                    transition:"all .15s ease" }}>{t}</div>
              );
            })}
          </div>
        </div>
        <Btn onClick={async ()=>{
          setApplyStep(1);
          try {
            const token = isBrowser ? localStorage.getItem("chores_token") : null;
            const user = isBrowser ? JSON.parse(localStorage.getItem("chores_user")||"{}") : {};
            if (!token || !user.id) {
              alert("You must be logged in to apply.");
              setApplyStep(0);
              return;
            }
            const workerName = `${user.firstName||""} ${user.lastName||""}`.trim() || "Someone";
            const res = await fetch(`${BACKEND}/api/jobs/${job.id}/apply`, {
              method:"POST",
              headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
              body: JSON.stringify({ message: applyMsg, availability: applyAvail, workerId: user.id, workerName })
            });
            const data = await res.json();
            if (data.alreadyApplied) {
              // Already applied — just update local state to reflect this
              setApplied(prev => prev.includes(job.id) ? prev : [...prev, job.id]);
              setApplyStep(2);
              return;
            }
            if (data.error) {
              alert("Application failed: " + data.error);
              setApplyStep(0);
              return;
            }
            if (data.success) {
              setApplied(prev => [...prev, job.id]);
              setLiveJobs(prev => prev.map(j => j.id===job.id ? {...j, applicants: data.applicantCount ?? (j.applicants||0)+1} : j));
              if (onApplicationSent) onApplicationSent();
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                new Notification("Application submitted!", { body: `Your application for "${job.title}" was sent to ${job.poster}`, icon: "/favicon.ico" });
              }
            }
          } catch(e) {
            console.error("Apply error:", e);
            alert("Network error — could not submit application.");
            setApplyStep(0);
            return;
          }
          setApplyStep(2);
        }} disabled={!applyMsg.trim()||applyStep===1} style={{ width:"100%", padding:16, borderRadius:16, fontSize:15, opacity:(applyMsg.trim()&&applyStep!==1)?1:.5 }}>
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
              <div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>you get ${job.pay.toFixed(0)}</div>
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
            <div className="tap" onClick={()=>job.posterId && onViewProfile && onViewProfile(job.posterId)} style={{ display:"flex", gap:14, alignItems:"center" }}>
              <Avatar name={job.poster} size={48} bg={G.sand} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:job.posterId&&onViewProfile?G.greenMid:G.text }}>{job.poster}{job.posterId&&onViewProfile?" →":""}</div>
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
          {role==="poster" && job.posterId === currentUserId
            ? (() => {
                const alreadyPaid = job.status === "booked" || job.status === "completed" ||
                  escrowData.some(t => String(t.jobId) === String(job.id) && ["held","released","completed"].includes(t.status));
                if (alreadyPaid) return (
                  <div style={{ flex:1, padding:16, borderRadius:16, fontSize:15, background:G.greenPale, color:G.greenMid, fontWeight:700, textAlign:"center", border:`2px solid ${G.greenLight}` }}>
                    Paid · In Escrow
                  </div>
                );
                return <Btn onClick={()=>{onCheckout(job);setSelectedJob(null);}} style={{ flex:1, padding:16, borderRadius:16, fontSize:15 }}>💳 Hire & Pay ${job.pay}</Btn>;
              })()
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
      <div style={{ background:G.green, padding:"20px 20px 16px" }}>
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

          {/* ── EDIT JOB MODAL ─────────────────────────────────────── */}
          {editJob && (
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={()=>setEditJob(null)}>
              <div onClick={e=>e.stopPropagation()} style={{ background:G.white, borderRadius:"24px 24px 0 0", padding:"20px 20px 40px", width:"100%", maxWidth:430, maxHeight:"85vh", overflowY:"auto" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:20 }}>Edit Job</div>
                  <div className="tap" onClick={()=>setEditJob(null)} style={{ width:32, height:32, borderRadius:"50%", background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>×</div>
                </div>
                {editError && <div style={{ color:G.red, fontSize:13, marginBottom:12, fontWeight:600 }}>{editError}</div>}
                {[
                  { label:"Job Title", key:"title", placeholder:"e.g. Mow the front lawn" },
                  { label:"Description", key:"description", placeholder:"What needs to be done?", multiline:true },
                  { label:"Pay ($)", key:"pay", placeholder:"35", type:"number" },
                  { label:"Zip Code", key:"zip", placeholder:"45056" },
                  { label:"Date", key:"date", placeholder:"e.g. Sat Mar 15" },
                  { label:"Duration", key:"duration", placeholder:"e.g. 1–2 hrs" },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>{field.label}</label>
                    {field.multiline ? (
                      <textarea value={editForm[field.key]||""} onChange={e=>setEditForm(f=>({...f,[field.key]:e.target.value}))} placeholder={field.placeholder} rows={3} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${G.border}`, fontSize:14, resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }} />
                    ) : (
                      <input type={field.type||"text"} value={editForm[field.key]||""} onChange={e=>setEditForm(f=>({...f,[field.key]:e.target.value}))} placeholder={field.placeholder} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${G.border}`, fontSize:14, boxSizing:"border-box" }} />
                    )}
                  </div>
                ))}
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>Category</label>
                  <select value={editForm.category||""} onChange={e=>setEditForm(f=>({...f,category:e.target.value}))} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${G.border}`, fontSize:14, background:G.white }}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:20 }}>
                  <Btn variant="ghost" onClick={()=>setEditJob(null)} style={{ flex:1, padding:14, borderRadius:14 }}>Cancel</Btn>
                  <Btn onClick={async ()=>{
                    setEditSaving(true); setEditError("");
                    const token = isBrowser ? localStorage.getItem("chores_token") : null;
                    const res = await fetch(`${BACKEND}/api/jobs/${editJob.id}`, {
                      method:"PATCH",
                      headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
                      body: JSON.stringify({ ...editForm, pay: parseFloat(editForm.pay) }),
                    }).then(r=>r.json()).catch(()=>({}));
                    setEditSaving(false);
                    if (res.error) { setEditError(res.error); return; }
                    setEditJob(null);
                    fetchMyPostedJobs();
                    fetchJobs();
                  }} disabled={editSaving} style={{ flex:2, padding:14, borderRadius:14 }}>
                    {editSaving ? "Saving…" : "Save Changes"}
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {/* ── POSTER VIEW: My Posted Jobs only ───────────────────── */}
          {role==="poster" ? (<>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Your Posted Jobs</div>
            {myPostedJobs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 20px", color:G.muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>No jobs posted yet</div>
                <div style={{ fontSize:13, marginBottom:20 }}>Post your first job and get matched with workers nearby.</div>
                <Btn onClick={onPostJob} style={{ padding:"14px 32px", borderRadius:16, fontSize:15 }}>Post a Job →</Btn>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {myPostedJobs.map(job => {
                  const isPaid = job.status==="booked"||job.status==="completed"||escrowData.some(t=>String(t.jobId)===String(job.id)&&["held","released","completed"].includes(t.status));
                  const applicantCount = job.applicant_count || job.applicants || 0;
                  const statusColor = { open:G.greenMid, booked:G.blue, completed:G.muted, cancelled:G.red }[job.status]||G.muted;
                  const statusBg = { open:G.greenPale, booked:"#EBF8FF", completed:G.sand, cancelled:"#FFF0F0" }[job.status]||G.sand;
                  const statusLabel = { open:"Open", booked:"Booked", completed:"Completed", cancelled:"Cancelled" }[job.status]||job.status;
                  return (
                    <div key={job.id} style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,.07)", border:`2px solid ${job.status==="open"?G.greenLight:G.border}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div style={{ flex:1, paddingRight:8 }}>
                          <div style={{ fontWeight:700, fontSize:15 }}>{job.title}</div>
                          <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>📍 {job.zip} · {job.date}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, color:G.greenMid }}>${job.pay}</div>
                          <div style={{ background:statusBg, color:statusColor, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:6, marginTop:3, display:"inline-block" }}>{statusLabel}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:`1px solid ${G.border}` }}>
                        <div style={{ fontSize:13, color:G.muted }}>
                          {applicantCount > 0
                            ? <span style={{ fontWeight:700, color:G.green }}>{applicantCount} applicant{applicantCount!==1?"s":""}</span>
                            : <span>No applicants yet</span>
                          }
                        </div>
                        <div style={{ display:"flex", gap:8 }} onClick={e=>e.stopPropagation()}>
                          {isPaid
                            ? <div style={{ padding:"8px 14px", fontSize:12, borderRadius:10, background:G.greenPale, color:G.greenMid, fontWeight:700 }}>Paid ✓</div>
                            : applicantCount > 0
                              ? <Btn onClick={()=>onCheckout({...job, applicants: applicantCount, posterId: currentUserId, loc: job.zip})} variant="orange" style={{ padding:"8px 16px", fontSize:13 }}>Hire & Pay</Btn>
                              : <div style={{ padding:"8px 14px", fontSize:12, borderRadius:10, background:G.sand, color:G.muted, fontWeight:600 }}>Waiting for applicants</div>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>) : (<>

          {/* ── WORKER VIEW: All Jobs Feed ────────────────────────────── */}
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
                    <div style={{ fontSize:10, color:G.muted, marginTop:1 }}>you get ${job.pay.toFixed(0)}</div>
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
                    <Btn onClick={()=>{if(isGuest){onGuestAction();return;}if(!applied.includes(job.id))setApplyModal(job); else setApplied(a=>a);}} variant={applied.includes(job.id)?"ghost":"primary"} style={{ padding:"7px 16px", fontSize:12 }}>{applied.includes(job.id)?"✓ Applied":"Quick Apply"}</Btn>
                  </div>
                </div>
              </div>
            ))}
            {jobsLoading && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:G.muted }}>
                <div style={{ width:36, height:36, borderRadius:"50%", border:`3px solid ${G.greenLight}`, borderTopColor:"transparent", margin:"0 auto 12px", animation:"spin .8s linear infinite" }} />
                <div style={{ fontSize:14, fontWeight:600 }}>Loading jobs near {userZip}...</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
            {!jobsLoading && filtered.length===0 && liveJobs.length===0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:G.muted }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
                <div style={{ fontWeight:700, fontSize:16 }}>No jobs posted yet</div>
                <div style={{ fontSize:13, marginTop:6 }}>Be the first to post a job in zip {userZip}!</div>
              </div>
            )}
            {!jobsLoading && filtered.length===0 && liveJobs.length>0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:G.muted }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
                <div style={{ fontWeight:700, fontSize:16 }}>No jobs match your filters</div>
                <div style={{ fontSize:13, marginTop:6 }}>Try adjusting filters or distance</div>
              </div>
            )}
          </div>
          </>)}
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

function OnboardingFlow({ onComplete, onShowLogin, darkMode }) {
  const [step, setStep] = useState(0); // 0=splash, 1=welcome, 2=role, 3=info, 4=interests, 5=zip, 6=verify-email, 7=done
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

  const nextStep = () => { setAnimKey(k=>k+1); setStep(s=>s+1); };
  const prevStep = () => { setAnimKey(k=>k+1); setStep(s=>s-1); };

  const totalSteps = 8;
  const progress = ((step) / (totalSteps - 1)) * 100;

  const DARK_CSS = darkMode ? `
    .onb-wrap { color: ${DARK.text} !important; }
    .onb-wrap input, .onb-wrap textarea, .onb-wrap select {
      color: ${DARK.text} !important;
      background: ${DARK.sand} !important;
      border-color: ${DARK.border} !important;
    }
    .onb-wrap input::placeholder, .onb-wrap textarea::placeholder { color: ${DARK.muted} !important; }
    .onb-wrap * { color: inherit; }
  ` : "";

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
          <span className="tap" onClick={()=>onShowLogin&&onShowLogin()} style={{ fontSize:13, color:"rgba(255,255,255,.4)", fontWeight:500 }}>Already have an account? <span style={{ color:G.greenLight, fontWeight:700 }}>Sign in</span></span>
        </div>
        <div style={{ textAlign:"center", marginTop:12 }}>
          <span className="tap" onClick={()=>onComplete("guest")} style={{ fontSize:13, color:"rgba(255,255,255,.3)", fontWeight:500 }}>Continue as Guest →</span>
        </div>
      </div>
    </div>
  );

  // Step 1 — Welcome carousel
  if (step === 1) return (
    <div className="onb-wrap" style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)", color:darkMode?DARK.text:LIGHT.text }}>
      <style>{CSS+DARK_CSS}</style>
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
    <div className="onb-wrap" style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)", color:darkMode?DARK.text:LIGHT.text }}>
      <style>{CSS+DARK_CSS}</style>
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
    <div className="onb-wrap" style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)", color:darkMode?DARK.text:LIGHT.text }}>
      <style>{CSS+DARK_CSS}</style>
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

        {/* Social sign up removed */}
      </div>

      <div style={{ padding:"0 32px 48px" }}>
        <button className="btn" onClick={nextStep} disabled={!form.first||!form.email||!form.password} style={{ width:"100%", padding:"17px", borderRadius:16, background:(form.first&&form.email&&form.password)?G.green:"#ccc", color:"#fff", fontSize:15, fontWeight:700, opacity:(form.first&&form.email&&form.password)?1:.5, transition:"all .2s" }}>Continue</button>
      </div>
    </div>
  );

  // Step 4 — Interests
  if (step === 4) return (
    <div className="onb-wrap" style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)", color:darkMode?DARK.text:LIGHT.text }}>
      <style>{CSS+DARK_CSS}</style>
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
                  padding:"16px 14px", borderRadius:16,
                  background:sel?(darkMode?"rgba(82,183,136,.18)":G.greenPale):G.white,
                  border:`2px solid ${sel?G.greenLight:G.border}`,
                  display:"flex", alignItems:"center", gap:10, transition:"all .2s", animationDelay:`${i*.04}s`, opacity:0,
                  boxShadow:sel?"0 2px 12px rgba(82,183,136,.15)":"none"
                }}>
                  <span style={{ fontSize:13, fontWeight:sel?700:500, color:sel?G.greenLight:G.text }}>Other</span>
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
                padding:"16px 14px", borderRadius:16,
                background:sel?(darkMode?"rgba(82,183,136,.18)":G.greenPale):G.white,
                border:`2px solid ${sel?G.greenLight:G.border}`,
                display:"flex", alignItems:"center", gap:10, transition:"all .2s",
                animationDelay:`${i*.04}s`, opacity:0, boxShadow:sel?"0 2px 12px rgba(82,183,136,.15)":"none"
              }}>
                <span style={{ fontSize:24, display:"flex", alignItems:"center", justifyContent:"center", width:28, height:28 }}>{OI_ICONS[cat.id]?OI_ICONS[cat.id](sel?G.greenLight:G.muted):cat.label.charAt(0)}</span>
                <span style={{ fontSize:13, fontWeight:sel?700:500, color:sel?G.greenLight:G.text }}>{cat.label}</span>
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
    <div className="onb-wrap" style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)", color:darkMode?DARK.text:LIGHT.text }}>
      <style>{CSS+DARK_CSS}</style>
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
          <div className="onb-fade" style={{ marginTop:20, padding:16, borderRadius:14, background:darkMode?"rgba(27,67,50,.6)":"rgba(27,67,50,.08)", border:`1px solid ${G.greenLight}40` }}>
            <div style={{ fontWeight:700, fontSize:14, color:G.greenLight, display:"flex", alignItems:"center", gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.greenLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {zipCity ? `${zipCity.city}, ${zipCity.state} (Zip ${zip})` : `Zip ${zip} — looking up…`}
            </div>
            <div style={{ fontSize:12, color:G.greenMid, marginTop:4 }}>8 active jobs within 2 miles</div>
            <div style={{ display:"flex", gap:6, marginTop:8 }}>
              {["3 Lawn","2 Pets","3 Clean"].map(t=><span key={t} style={{ fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:6, background:darkMode?"rgba(255,255,255,.12)":"rgba(255,255,255,.7)", color:G.greenMid }}>{t}</span>)}
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
      <div className="onb-wrap" style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:G.cream, display:"flex", flexDirection:"column", boxShadow:"0 0 80px rgba(0,0,0,.2)", color:darkMode?DARK.text:LIGHT.text }}>
        <style>{CSS+DARK_CSS}</style>
        <div style={{ padding:"20px 20px 0" }}><div className="tap" onClick={prevStep} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div></div>
        <div style={{ padding:"16px 32px 0" }}>
          <div style={{ height:4, borderRadius:2, background:G.border }}><div className="progress-fill" style={{ height:"100%", borderRadius:2, background:G.greenLight, width:`${progress}%` }} /></div>
          <div style={{ fontSize:11, color:G.muted, marginTop:6, fontWeight:600 }}>Step 5 of 6 · Email Verification</div>
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

  // Step 8 — Done / success
  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:`linear-gradient(165deg, ${G.green} 0%, #143728 50%, #0D2818 100%)`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:40, position:"relative", overflow:"hidden", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS+DARK_CSS}</style>
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
          { l:"Location", v:zip ? `Zip ${zip}` : "Not set" },
          { l:"Email", v:emailVerified ? "✅ Verified" : "⚠️ Unverified" },
        ].map(r=>(
          <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>{r.l}</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.85)", fontWeight:600 }}>{r.v}</span>
          </div>
        ))}
      </div>

      <button className="btn onb-fade" id="register-btn" onClick={async (e)=>{
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = "Creating account…";
        try {
          const res = await fetch(`${BACKEND}/api/auth/register`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
              email: form.email,
              password: form.password,
              firstName: form.first,
              lastName: form.last,
              phone: form.phone,
              zip: zip,
              role: onbRole || "worker",
              skills: [
                ...interests.filter(x => x !== "other"),
                ...(interests.includes("other") && customInterest.trim() ? [customInterest.trim()] : [])
              ],
            })
          });
          const data = await res.json();
          if (data.alreadyExists) {
            // User already registered — send them to login with email pre-filled
            btn.disabled = false;
            btn.textContent = "Enter Chores →";
            onShowLogin && onShowLogin(form.email);
            return;
          }
          if (data.error) {
            btn.disabled = false;
            btn.textContent = "Enter Chores →";
            alert(`Registration failed: ${data.error}`);
            return;
          }
          if (data.success) {
            if (isBrowser) {
              if (data.token) localStorage.setItem("chores_token", data.token);
              localStorage.setItem("chores_user", JSON.stringify({
                id: data.user.id,
                email: data.user.email || form.email,
                firstName: data.user.firstName || form.first,
                lastName: data.user.lastName || form.last,
                phone: data.user.phone || form.phone,
                zip: data.user.zip || zip,
                role: data.user.role || onbRole || "worker",
              }));
            }
            onComplete(data.user.role === "poster" ? "poster" : "worker");
          } else {
            btn.disabled = false;
            btn.textContent = "Enter Chores →";
            alert("Registration failed — please try again.");
          }
        } catch(e) {
          console.error("Registration error:", e);
          btn.disabled = false;
          btn.textContent = "Enter Chores →";
          alert("Could not connect to server. Please check your connection and try again.");
        }
      }} style={{ width:"100%", padding:"17px", borderRadius:16, background:G.greenLight, color:"#fff", fontSize:16, fontWeight:700, marginTop:32, animationDelay:".45s", opacity:0 }}>Enter Chores →</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWS DATA & MODAL
// ═══════════════════════════════════════════════════════════════════════════
// Reviews and completed jobs loaded live from backend
const MY_REVIEWS = [];
const COMPLETED_JOBS = [];

const REVIEW_TAGS = ["punctual","thorough","friendly","reliable","skilled","hardworking","communicative","careful","kind","efficient","detail-oriented","professional"];

function ReviewModal({ target, targetId, jobTitle, jobId, onSubmit, onClose }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [step, setStep] = useState(0); // 0=form, 1=sending, 2=done
  const togTag = (t) => setTags(s=>s.includes(t)?s.filter(x=>x!==t):[...s,t]);

  const submit = async () => {
    setStep(1);
    try {
      const token = isBrowser ? localStorage.getItem("chores_token") : null;
      await fetch(`${BACKEND}/api/reviews/create`, {
        method:"POST",
        headers:{"Content-Type":"application/json",...(token?{"Authorization":`Bearer ${token}`}:{})},
        body: JSON.stringify({ jobId, revieweeId: targetId, rating: stars, comment: text, tags })
      });
    } catch(e) { console.error("Review error:", e); }
    setStep(2);
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
function MapScreen({ role, isGuest, onGuestAction, onCheckout, maxDist, setMaxDist, userZip, darkMode }) {
  const currentUserId = (() => { try { return isBrowser ? JSON.parse(localStorage.getItem("chores_user"))?.id : null; } catch { return null; } })();
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeCategory, setActiveCategory] = useState([]);
  const [showMapFilter, setShowMapFilter] = useState(false);
  const [applied, setApplied] = useState([]);
  const [applyModal, setApplyModal] = useState(null);
  const [applyStep, setApplyStep] = useState(0);
  const [applyMsg, setApplyMsg] = useState("");
  const [applyAvail, setApplyAvail] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 41.883, lng: -87.627 });
  const [liveJobs, setLiveJobs] = useState([]);

  React.useEffect(()=>{
    fetch(`${BACKEND}/api/jobs?zip=${userZip}&maxDist=${maxDist}`)
      .then(r=>r.json())
      .then(data=>{ if(data.jobs) setLiveJobs(data.jobs.map(j=>({
        id:j.id, title:j.title, category:j.category, poster:j.poster_name||"Anonymous",
        posterRating:j.poster_rating||5.0, loc:j.zip||userZip, dist:j.dist||0,
        pay:parseFloat(j.pay)||0, date:j.date||"", tags:j.tags?j.tags.split(","):[], 
        verified:j.poster_verified||false, urgent:j.urgent||false,
        lat:j.lat||41.88, lng:j.lng||-87.63, desc:j.description||"", photos:[],
      }))); })
      .catch(e=>console.error("Map jobs error:", e));
  }, [userZip, maxDist]);
  const mapRef = React.useRef(null);       // DOM node
  const leafletRef = React.useRef(null);   // Leaflet map instance
  const markersRef = React.useRef([]);     // current marker objects
  const tileLayerRef = React.useRef(null); // tile layer for dark mode swap

  // Geocode zip → center
  React.useEffect(() => {
    if (!userZip) return;
    fetch(`https://nominatim.openstreetmap.org/search?postalcode=${userZip}&country=US&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data && data[0]) {
          const c = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          setMapCenter(c);
          if (leafletRef.current) leafletRef.current.setView([c.lat, c.lng], leafletRef.current.getZoom(), { animate: true });
        }
      })
      .catch(() => {});
  }, [userZip]);

  // Boot Leaflet once
  React.useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const bootMap = (L) => {
      const map = L.map(mapRef.current, {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: 15,
        zoomControl: false,  // we use custom ± buttons
        attributionControl: false,
      });

      const tileUrl = darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
      leafletRef.current = map;
    };

    if (window.L) {
      bootMap(window.L);
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => bootMap(window.L);
      document.head.appendChild(script);
    }

    return () => {
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }
    };
  }, []);

  // Swap tile layer when dark mode changes
  React.useEffect(() => {
    if (!leafletRef.current || !window.L) return;
    if (tileLayerRef.current) tileLayerRef.current.remove();
    const tileUrl = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    tileLayerRef.current = window.L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(leafletRef.current);
  }, [darkMode]);

  // Re-draw markers when filter/maxDist/selectedPin changes
  React.useEffect(() => {
    const L = window.L;
    const map = leafletRef.current;
    if (!L || !map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = liveJobs.filter(j =>
      (activeCategory.length === 0 || activeCategory.includes(j.category)) && j.dist <= maxDist
    );

    filtered.forEach(job => {
      const isSel = selectedPin?.id === job.id;
      const html = `
        <div style="
          width:${isSel?42:36}px; height:${isSel?42:36}px;
          background:${isSel?G.green:"#fff"};
          border:2.5px solid ${isSel?G.greenLight:G.greenMid};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 3px 12px rgba(0,0,0,${isSel?.45:.22});
          transition:all .15s;
        ">
          <span style="transform:rotate(45deg);font-size:${isSel?12:11}px;font-weight:800;color:${isSel?"#fff":G.greenMid};font-family:'Outfit',sans-serif;">$${job.pay}</span>
        </div>`;

      const icon = L.divIcon({ html, className: "", iconSize: [isSel?42:36, isSel?42:36], iconAnchor: [isSel?21:18, isSel?42:36] });
      const marker = L.marker([job.lat, job.lng], { icon })
        .addTo(map)
        .on("click", () => setSelectedPin(prev => prev?.id === job.id ? null : job));
      markersRef.current.push(marker);
    });
  }, [activeCategory, maxDist, selectedPin]);

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
          {role==="poster" && job.posterId === currentUserId
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
                  <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Your Availability</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                    {["Morning","Afternoon","Evening","Weekends","Flexible"].map(t=>{
                      const sel = applyAvail.includes(t);
                      return (
                        <div key={t} className="tap" onClick={()=>setApplyAvail(a=>sel?a.filter(x=>x!==t):[...a,t])}
                          style={{ padding:"8px 14px", borderRadius:12, fontSize:12, fontWeight:600,
                            background:sel?G.greenPale:G.sand, color:sel?G.green:G.muted,
                            border:`1.5px solid ${sel?G.greenLight:G.border}`, transition:"all .15s" }}>{t}</div>
                      );
                    })}
                  </div>
                  <Btn onClick={()=>setApplyStep(1)} disabled={!applyMsg.trim()} style={{ width:"100%", padding:14, borderRadius:14 }}>Submit Application →</Btn>
                  <Btn onClick={()=>{setApplyModal(null);setApplyMsg("");setApplyAvail([]);}} variant="ghost" style={{ width:"100%", padding:12, borderRadius:14, marginTop:8 }}>Cancel</Btn>
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

      {/* Map fills remaining space */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", background:"#E8F0E9" }}>

        {/* Floating filter button on top of map */}
        <div style={{ position:"absolute", top:10, left:12, zIndex:15 }}>
          <div className="tap" onClick={()=>setShowMapFilter(s=>!s)} style={{ height:36, borderRadius:10, background:showMapFilter?G.green:"rgba(255,255,255,.92)", display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"0 12px", boxShadow:"0 2px 8px rgba(0,0,0,.18)", position:"relative" }}>
            <span style={{ fontSize:12, fontWeight:600, color:showMapFilter?"#fff":G.green }}>Filter</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showMapFilter?"#fff":G.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            {activeCategory.length>0&&<div style={{ position:"absolute", top:-3, right:-3, width:8, height:8, borderRadius:"50%", background:G.greenLight, border:"1.5px solid #fff" }}/>}
          </div>
          {showMapFilter&&<div onClick={()=>setShowMapFilter(false)} style={{ position:"fixed", inset:0, zIndex:19 }} />}
          {showMapFilter&&(
            <div className="fade" style={{ position:"absolute", top:"calc(100% + 8px)", left:0, background:G.white, borderRadius:16, padding:8, boxShadow:"0 8px 30px rgba(0,0,0,.18)", border:`1px solid ${G.border}`, zIndex:20, width:190 }}>
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
        {/* Leaflet map container — fills entire space, pins rendered by Leaflet */}
        <div ref={mapRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:0 }} />

        {/* Zoom controls */}
        <div style={{ position:"absolute", top:10, right:10, display:"flex", flexDirection:"column", gap:4, zIndex:10 }}>
          <button className="btn tap" onClick={()=>leafletRef.current&&leafletRef.current.zoomIn()} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,.95)", border:`1px solid ${G.border}`, fontSize:18, fontWeight:800, color:G.text, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,.15)" }}>+</button>
          <button className="btn tap" onClick={()=>leafletRef.current&&leafletRef.current.zoomOut()} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,.95)", border:`1px solid ${G.border}`, fontSize:18, fontWeight:800, color:G.text, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,.15)" }}>−</button>
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
              {role==="poster" && selectedPin.posterId === currentUserId
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
// ═══════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function LoginScreen({ onComplete, onBack, darkMode, prefillEmail="" }) {
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (darkMode) { Object.assign(G, DARK); } else { Object.assign(G, LIGHT); }

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BACKEND}/api/auth/login`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (data.token) {
        if (isBrowser) {
          localStorage.setItem("chores_token", data.token);
          localStorage.setItem("chores_user", JSON.stringify({
            ...data.user,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
          }));
        }
        onComplete(data.user.role || "worker");
      }
    } catch(e) {
      setError("Network error — please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="chores-app" style={{ "--text":darkMode?DARK.text:LIGHT.text, "--tab-bg":darkMode?"rgba(30,30,30,.97)":"rgba(255,255,255,.95)", fontFamily:"'Outfit',sans-serif", background:G.cream, minHeight:"100vh", maxWidth:430, margin:"0 auto", boxShadow:"0 0 80px rgba(0,0,0,.2)", display:"flex", flexDirection:"column", color:G.text }}>
      <style>{CSS}</style>
      <div style={{ padding:"20px 20px 0" }}>
        <div className="tap" onClick={onBack} style={{ fontSize:14, color:G.muted, fontWeight:600 }}>← Back</div>
      </div>
      <div style={{ flex:1, padding:"40px 32px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:800, color:G.text, lineHeight:1.2, marginBottom:8 }}>Welcome back</div>
        <div style={{ fontSize:14, color:G.muted, marginBottom: prefillEmail ? 12 : 32 }}>Sign in to your Chores account</div>
        {prefillEmail && (
          <div style={{ padding:"10px 14px", borderRadius:10, background:G.greenPale, color:G.greenMid, fontSize:13, fontWeight:600, marginBottom:20 }}>
            ✅ Looks like you already have an account. Sign in below!
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ position:"relative" }}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"
              style={{ width:"100%", padding:"16px 16px 16px 44px", borderRadius:14, border:`1.5px solid ${G.border}`, fontSize:15, background:G.white, color:G.text, outline:"none", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border}
            />
            <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
          </div>

          <div style={{ position:"relative" }}>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type={showPw?"text":"password"}
              style={{ width:"100%", padding:"16px 44px 16px 44px", borderRadius:14, border:`1.5px solid ${G.border}`, fontSize:15, background:G.white, color:G.text, outline:"none", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=G.greenLight} onBlur={e=>e.target.style.borderColor=G.border}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            />
            <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div className="tap" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
          </div>
        </div>

        {error && <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:G.redLight, color:G.red, fontSize:13, fontWeight:600 }}>{error}</div>}

        <button className="btn" onClick={handleLogin} disabled={loading||!email||!password}
          style={{ width:"100%", padding:"17px", borderRadius:16, background:(email&&password&&!loading)?G.green:"#ccc", color:"#fff", fontSize:15, fontWeight:700, marginTop:24, opacity:(email&&password&&!loading)?1:.5 }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:G.muted }}>
          Don't have an account? <span className="tap" onClick={onBack} style={{ color:G.greenMid, fontWeight:700 }}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES TAB — Real DB-backed conversations + threads
// ─────────────────────────────────────────────────────────────────────────────
function MessagesTab({ inboxMessages, fetchInbox, chatOpen, setChatOpen, role }) {
  const [thread, setThread] = React.useState([]);
  const [threadLoading, setThreadLoading] = React.useState(false);
  const [chatMsg, setChatMsg] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const threadEndRef = React.useRef(null);
  const pollRef = React.useRef(null);

  const currentUser = React.useMemo(() => {
    try { return isBrowser ? JSON.parse(localStorage.getItem("chores_user")) : null; } catch { return null; }
  }, []);

  // Load thread when a conversation is opened
  React.useEffect(() => {
    if (!chatOpen) { setThread([]); return; }
    loadThread();
    // Poll for new messages every 8 seconds
    pollRef.current = setInterval(loadThread, 8000);
    return () => clearInterval(pollRef.current);
  }, [chatOpen?.id]);

  // Scroll to bottom when thread updates
  React.useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function loadThread() {
    if (!chatOpen) return;
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    setThreadLoading(t => thread.length === 0 ? true : t);
    try {
      const qs = chatOpen.job_id ? `?job_id=${chatOpen.job_id}` : "";
      const res = await fetch(`${BACKEND}/api/messages/thread/${chatOpen.other_user_id}${qs}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.thread) {
        setThread(data.thread);
        fetchInbox(); // refresh unread badge
      }
    } catch(e) { console.error("Thread load error:", e); }
    setThreadLoading(false);
  }

  async function sendMessage() {
    if (!chatMsg.trim() || sending) return;
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token || !chatOpen?.other_user_id) return;
    setSending(true);
    const text = chatMsg.trim();
    setChatMsg("");
    // Optimistic update
    const optimistic = { id: `opt_${Date.now()}`, from_me: true, text, time: "just now", created_at: new Date().toISOString() };
    setThread(t => [...t, optimistic]);
    try {
      const res = await fetch(`${BACKEND}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ recipientId: chatOpen.other_user_id, jobId: chatOpen.job_id, body: text })
      });
      const data = await res.json();
      if (data.error) {
        // Remove optimistic on error
        setThread(t => t.filter(m => m.id !== optimistic.id));
        setChatMsg(text);
        alert("Failed to send: " + data.error);
      } else {
        // Replace optimistic with real message
        setThread(t => t.map(m => m.id === optimistic.id ? data.message : m));
        fetchInbox();
      }
    } catch(e) {
      setThread(t => t.filter(m => m.id !== optimistic.id));
      setChatMsg(text);
    }
    setSending(false);
  }

  // Conversation list view
  if (!chatOpen) {
    return (
      <div className="fade" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 16 }}>Messages</div>
        {inboxMessages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: G.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: G.text }}>No messages yet</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>{role === "worker" ? "Apply to jobs to start a conversation" : "Applications from workers will appear here"}</div>
          </div>
        ) : inboxMessages.map(m => (
          <div key={m.id} className="tap" onClick={() => { setChatOpen(m); }} style={{ background: G.white, borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,.06)", display: "flex", gap: 12, alignItems: "center", borderLeft: `3px solid ${m.unread ? G.green : "transparent"}` }}>
            <Avatar name={m.from} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontWeight: m.unread ? 700 : 500, fontSize: 14 }}>{m.from}</span>
                <span style={{ fontSize: 11, color: G.muted }}>{m.time}</span>
              </div>
              {m.job && <div style={{ fontSize: 11, color: G.muted, marginBottom: 2 }}>📋 {m.job}</div>}
              <div style={{ fontSize: 13, color: m.unread ? G.text : G.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.preview}</div>
            </div>
            {m.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: G.green, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    );
  }

  // Thread view
  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 170px)" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", background: G.white, borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div className="tap" onClick={() => { setChatOpen(null); setThread([]); clearInterval(pollRef.current); }} style={{ fontSize: 20, lineHeight: 1 }}>←</div>
        <Avatar name={chatOpen.from} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{chatOpen.from}</div>
          {chatOpen.job && <div style={{ fontSize: 11, color: G.greenMid }}>📋 {chatOpen.job}</div>}
        </div>
      </div>

      {/* Thread messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {threadLoading && thread.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: G.muted, fontSize: 13 }}>Loading messages...</div>
        ) : thread.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: G.muted, fontSize: 13 }}>No messages yet — say hello!</div>
        ) : thread.map((msg, i) => {
          const showTime = i === 0 || (new Date(thread[i].created_at) - new Date(thread[i-1].created_at)) > 5 * 60 * 1000;
          return (
            <React.Fragment key={msg.id}>
              {showTime && <div style={{ textAlign: "center", fontSize: 10, color: G.muted, margin: "4px 0" }}>{msg.time}</div>}
              <div style={{ display: "flex", justifyContent: msg.from_me ? "flex-end" : "flex-start" }}>
                <div style={{ padding: "10px 14px", fontSize: 14, maxWidth: "75%", lineHeight: 1.4, ...(msg.from_me ? { background: G.green, color: "#fff", borderRadius: "18px 18px 4px 18px" } : { background: "#fff", color: G.text, borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }) }}>
                  {msg.type === "application" && !msg.from_me && <div style={{ fontSize: 10, opacity: .7, marginBottom: 4 }}>📋 Application</div>}
                  {msg.text}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={threadEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px 16px", background: G.white, borderTop: `1px solid ${G.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
        <input
          value={chatMsg}
          onChange={e => setChatMsg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: `1.5px solid ${G.border}`, fontSize: 14, fontFamily: "'Outfit',sans-serif", outline: "none" }}
        />
        <button
          className="btn"
          onClick={sendMessage}
          disabled={!chatMsg.trim() || sending}
          style={{ width: 42, height: 42, borderRadius: "50%", background: G.green, color: "#fff", fontSize: 18, opacity: chatMsg.trim() ? 1 : .5 }}
        >↑</button>
      </div>
    </div>
  );
}

const isBrowser = typeof window !== "undefined";

function MyJobsScreen({ onPostJob, onCheckout, refreshSignal }) {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchMyJobs = React.useCallback(async () => {
    setFetchError("");
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) {
      setFetchError("Not logged in — please sign out and sign back in.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND}/api/jobs/mine`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      console.log("📋 My jobs response:", data);
      if (data.error) {
        setFetchError(data.error);
      } else if (data.jobs) {
        setMyJobs(data.jobs);
      }
    } catch(e) {
      console.error("My jobs fetch error:", e);
      setFetchError("Could not load jobs. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Wake up backend (Render free tier sleeps after inactivity)
    fetch(`${BACKEND}/api/ping`).catch(() => {});
    fetchMyJobs();
  }, [fetchMyJobs, refreshSignal]);

  const statusColor = { open: G.greenMid, booked: G.blue, completed: G.muted, cancelled: G.red };
  const statusBg = { open: G.greenPale, booked: "#EBF8FF", completed: G.sand, cancelled: "#FFF0F0" };
  const statusLabel = { open: "Open", booked: "Booked", completed: "Completed", cancelled: "Cancelled" };
  const counts = myJobs.reduce((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc; }, {});
  const filtered = filter === "all" ? myJobs : myJobs.filter(j => j.status === filter);

  return (
    <div style={{ padding: "20px 20px 100px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 24, color: G.text }}>My Jobs</div>
      </div>
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:G.muted }}>
          <div style={{ width:36, height:36, borderRadius:"50%", border:`3px solid ${G.greenLight}`, borderTopColor:"transparent", margin:"0 auto 12px", animation:"spin .8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontSize:14 }}>Loading your jobs…</div>
        </div>
      ) : fetchError ? (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
          <div style={{ color:G.red, fontSize:14, fontWeight:600, marginBottom:8 }}>{fetchError}</div>
          <Btn onClick={fetchMyJobs} style={{ padding:"10px 24px", borderRadius:12 }}>Retry</Btn>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:800, color:G.text, marginBottom:6 }}>{myJobs.length === 0 ? "No jobs posted yet" : `No ${filter} jobs`}</div>
          <div style={{ color:G.muted, fontSize:14, marginBottom:20 }}>{myJobs.length === 0 ? "Post your first job and get matched with workers nearby." : `You don't have any ${filter} jobs right now.`}</div>
          {myJobs.length === 0 && <Btn onClick={onPostJob} style={{ padding:"13px 28px", borderRadius:14 }}>Post a Job →</Btn>}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(job => {
            const canEdit = job.status === "open";
            return (
              <div key={job.id} style={{ background:G.white, borderRadius:18, padding:"16px 16px 14px", boxShadow:"0 2px 12px rgba(0,0,0,.07)", border:`2px solid ${job.status==="open"?G.greenLight:G.border}`, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, background:G.green, color:"#fff", fontSize:9, fontWeight:800, padding:"3px 12px 3px 10px", borderRadius:"16px 0 10px 0", letterSpacing:.5 }}>MY JOB</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:16 }}>
                  <div style={{ flex:1, paddingRight:8 }}>
                    <div style={{ fontWeight:700, fontSize:16, color:G.text, lineHeight:1.3 }}>{job.title}</div>
                    <div style={{ fontSize:12, color:G.muted, marginTop:3 }}>{job.category||"Uncategorized"} · {job.zip}{job.date?` · ${job.date}`:""}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:800, color:G.greenMid }}>${job.pay}</div>
                    <div style={{ background:statusBg[job.status]||G.sand, color:statusColor[job.status]||G.muted, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:6, marginTop:3, display:"inline-block" }}>{statusLabel[job.status]||job.status}</div>
                  </div>
                </div>
                {job.description ? <div style={{ fontSize:13, color:G.muted, marginTop:8, lineHeight:1.5 }}>{job.description.slice(0,100)}{job.description.length>100?"…":""}</div> : null}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10, fontSize:12, color:G.muted }}>
                  <span>👥 {job.applicant_count > 0 ? `${job.applicant_count} applicant${job.applicant_count>1?"s":""}` : "No applicants yet"}</span>
                  {job.duration && <span>· ⏱ {job.duration}</span>}
                </div>
                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  {canEdit && <Btn onClick={() => { setEditJob(job); setEditForm({ title:job.title, description:job.description||"", category:job.category||"", pay:String(job.pay), zip:job.zip||"", date:job.date||"", duration:job.duration||"", photos:job.photos||[] }); setEditError(""); }} style={{ padding:"8px 16px", fontSize:12, borderRadius:10 }}>Edit</Btn>}
                  {canEdit && <Btn variant="ghost" onClick={async () => { if(!window.confirm("Delete this job?")) return; const token=isBrowser?localStorage.getItem("chores_token"):null; await fetch(`${BACKEND}/api/jobs/${job.id}/cancel`,{method:"POST",headers:{"Authorization":`Bearer ${token}`}}); fetchMyJobs(); }} style={{ padding:"8px 16px", fontSize:12, borderRadius:10, color:G.red, borderColor:G.red }}>Delete</Btn>}
                  {job.status==="booked" && <Btn variant="outline" onClick={() => onCheckout(job)} style={{ padding:"8px 16px", fontSize:12, borderRadius:10 }}>💰 View Escrow</Btn>}
                  {job.status==="completed" && <div style={{ fontSize:12, color:G.greenMid, fontWeight:700, padding:"8px 0" }}>✅ Completed</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {editJob && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={() => setEditJob(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background:G.white, borderRadius:"24px 24px 0 0", padding:"20px 20px 40px", width:"100%", maxWidth:430, maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:20 }}>Edit Job</div>
              <div className="tap" onClick={() => setEditJob(null)} style={{ width:32, height:32, borderRadius:"50%", background:G.sand, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>×</div>
            </div>
            {editError && <div style={{ color:G.red, fontSize:13, marginBottom:12, fontWeight:600 }}>{editError}</div>}
            {[{ label:"Job Title", key:"title", placeholder:"e.g. Mow the front lawn" }, { label:"Description", key:"description", placeholder:"What needs to be done?", multiline:true }, { label:"Pay ($)", key:"pay", placeholder:"35", type:"number" }, { label:"Zip Code", key:"zip", placeholder:"45056" }, { label:"Date", key:"date", placeholder:"e.g. Sat Mar 15" }, { label:"Duration", key:"duration", placeholder:"e.g. 1–2 hrs" }].map(field => (
              <div key={field.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>{field.label}</label>
                {field.multiline ? <textarea value={editForm[field.key]||""} onChange={e => setEditForm(f=>({...f,[field.key]:e.target.value}))} placeholder={field.placeholder} rows={3} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${G.border}`, fontSize:14, resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }} /> : <input type={field.type||"text"} value={editForm[field.key]||""} onChange={e => setEditForm(f=>({...f,[field.key]:e.target.value}))} placeholder={field.placeholder} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${G.border}`, fontSize:14, boxSizing:"border-box" }} />}
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>Category</label>
              <select value={editForm.category||""} onChange={e => setEditForm(f=>({...f,category:e.target.value}))} style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${G.border}`, fontSize:14, background:G.white }}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.5, display:"block", marginBottom:5 }}>Photos</label>
              <input type="file" accept="image/*" multiple style={{ display:"none" }} id="edit-photo-input" onChange={e=>{ const files=Array.from(e.target.files); files.forEach(file=>{ const r=new FileReader(); r.onload=ev=>setEditForm(f=>({...f,photos:[...(f.photos||[]),ev.target.result].slice(0,5)})); r.readAsDataURL(file); }); }} />
              <label htmlFor="edit-photo-input" style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", padding:"10px 12px", borderRadius:10, border:`1.5px dashed ${G.border}`, fontSize:13, color:G.muted, background:G.white, cursor:"pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {(editForm.photos||[]).length > 0 ? `${editForm.photos.length} photo${editForm.photos.length>1?"s":""} — tap to add more` : "Add photos (optional)"}
              </label>
              {(editForm.photos||[]).length > 0 && (
                <div style={{ display:"flex", gap:8, marginTop:8, overflowX:"auto" }}>
                  {editForm.photos.map((src,i) => (
                    <div key={i} style={{ position:"relative", flexShrink:0 }}>
                      <img src={src} alt="" style={{ width:64, height:64, borderRadius:8, objectFit:"cover", border:`1.5px solid ${G.border}` }} />
                      <div onClick={()=>setEditForm(f=>({...f,photos:f.photos.filter((_,j)=>j!==i)}))} style={{ position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%", background:G.red, color:"#fff", fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>×</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <Btn variant="ghost" onClick={() => setEditJob(null)} style={{ flex:1, padding:14, borderRadius:14 }}>Cancel</Btn>
              <Btn onClick={async () => {
                setEditSaving(true); setEditError("");
                const token = isBrowser ? localStorage.getItem("chores_token") : null;
                if (!token) { setEditError("Not logged in."); setEditSaving(false); return; }
                const attemptSave = async () => {
                  const controller = new AbortController();
                  const timeout = setTimeout(() => controller.abort(), 15000);
                  try {
                    const res = await fetch(`${BACKEND}/api/jobs/${editJob.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                      body: JSON.stringify({ ...editForm, pay: parseFloat(editForm.pay), photos: editForm.photos || [] }),
                      signal: controller.signal,
                    });
                    clearTimeout(timeout);
                    return await res.json();
                  } catch(e) {
                    clearTimeout(timeout);
                    throw e;
                  }
                };
                try {
                  let data;
                  try {
                    data = await attemptSave();
                  } catch(e) {
                    // Backend may have been sleeping — wait 3s and retry once
                    await new Promise(r => setTimeout(r, 3000));
                    data = await attemptSave();
                  }
                  console.log("✏️ Edit job response:", data);
                  if (data.error) { setEditError(data.error); setEditSaving(false); return; }
                  setEditJob(null);
                  await fetchMyJobs();
                } catch(e) {
                  console.error("Edit job error:", e);
                  setEditError("Server took too long to respond. Please try again.");
                }
                setEditSaving(false);
              }} disabled={editSaving} style={{ flex:2, padding:14, borderRadius:14 }}>{editSaving?"Saving…":"Save Changes"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PublicProfileScreen({ userId, onBack }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${BACKEND}/api/users/${userId}/profile`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => { setError("Could not load profile."); setLoading(false); });
  }, [userId]);

  const CATEGORY_LABELS = { lawn:"Lawn & Garden", cleaning:"Cleaning", petcare:"Pet Care", windows:"Windows", babysitting:"Babysitting", moving:"Moving", painting:"Painting", errands:"Errands", other:"Other" };
  const memberSince = user?.memberSince ? new Date(user.memberSince).toLocaleDateString("en-US", { month:"long", year:"numeric" }) : "";
  const initials = user ? `${user.firstName?.[0]||""}${user.lastName?.[0]||""}`.toUpperCase() : "?";

  return (
    <div className="fade" style={{ minHeight:"100vh", background:G.cream, paddingBottom:40 }}>
      {/* Header */}
      <div style={{ background:G.green, padding:"20px 20px 40px" }}>
        <div className="tap" onClick={onBack} style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff", marginBottom:20 }}>←</div>
        {loading ? (
          <div style={{ textAlign:"center", padding:"30px 0" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid rgba(255,255,255,.3)", borderTopColor:"#fff", margin:"0 auto", animation:"spin .8s linear infinite" }} />
          </div>
        ) : error ? (
          <div style={{ color:"rgba(255,255,255,.7)", textAlign:"center", padding:"20px 0" }}>{error}</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="Profile" style={{ width:88, height:88, borderRadius:"50%", objectFit:"cover", border:"3px solid rgba(255,255,255,.3)" }} />
              : <div style={{ width:88, height:88, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", border:"3px solid rgba(255,255,255,.3)" }}>{initials}</div>
            }
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:"#fff" }}>{user.firstName} {user.lastName}</div>
              {user.zip && <div style={{ fontSize:13, color:"rgba(255,255,255,.7)", marginTop:2 }}>📍 {user.zip}</div>}
            </div>
            {/* Stats row */}
            <div style={{ display:"flex", gap:24, marginTop:4 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{user.jobsCompleted || 0}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:.5 }}>Jobs Done</div>
              </div>
              {user.rating && (
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>⭐ {Number(user.rating).toFixed(1)}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:.5 }}>Rating</div>
                </div>
              )}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{memberSince.split(" ")[1] || "—"}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:.5 }}>Member Since</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && user && (
        <div style={{ padding:"0 16px", marginTop:-16 }}>
          {/* Verification badge */}
          {user.identityVerified && (
            <div style={{ background:G.white, borderRadius:14, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:G.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✓</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:G.green }}>Identity Verified</div>
                <div style={{ fontSize:11, color:G.muted }}>Government ID confirmed</div>
              </div>
            </div>
          )}

          {/* Bio */}
          {user.bio ? (
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>About</div>
              <div style={{ fontSize:14, color:G.text, lineHeight:1.6 }}>{user.bio}</div>
            </div>
          ) : null}

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:12 }}>Skills & Interests</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {user.skills.map(s => (
                  <div key={s} style={{ padding:"6px 12px", borderRadius:10, fontSize:12, fontWeight:600, background:G.greenPale, color:G.green, border:`1.5px solid ${G.greenLight}` }}>
                    ✓ {CATEGORY_LABELS[s] || s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member since */}
          <div style={{ background:G.white, borderRadius:18, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Member Info</div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:G.text }}>
              <span>Member since</span><span style={{ fontWeight:600 }}>{memberSince}</span>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function ChoresApp() {
  const storedUser = (() => { try { return isBrowser ? JSON.parse(localStorage.getItem("chores_user")) : null; } catch { return null; } })();
  const storedToken = isBrowser ? localStorage.getItem("chores_token") : null;
  const [appView, setAppView] = useState((storedToken && storedUser) ? "user" : "onboarding");
  const [loginPrefillEmail, setLoginPrefillEmail] = useState("");
  const [role, setRole] = useState(storedUser?.role || "worker");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(storedUser);

  // Handle Stripe Connect return — re-check status and show success
  React.useEffect(() => {
    if (!isBrowser) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("connect") === "complete") {
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      // Re-check connect status
      const token = localStorage.getItem("chores_token");
      if (token) {
        fetch(`${BACKEND}/api/connect/status`, { headers: { "Authorization": `Bearer ${token}` } })
          .then(r => r.json())
          .then(data => {
            // Update connect status in SettingsScreen via a custom event
            window.__connectStatusUpdate = data;
          }).catch(()=>{});
      }
    }
  }, []);

  // Load fresh user data from backend on startup — clear stale token if invalid
  React.useEffect(() => {
    if (!isBrowser) return;
    const token = localStorage.getItem("chores_token");
    if (!token) return;
    fetch(`${BACKEND}/api/auth/me`, { headers:{ "Authorization":`Bearer ${token}` } })
      .then(r=>r.json())
      .then(data => {
        if (data.error || !data.user) {
          // Token is expired or invalid — clear everything and send to login
          localStorage.removeItem("chores_token");
          localStorage.removeItem("chores_user");
          setAppView("onboarding");
          return;
        }
        const u = {
          ...data.user,
          firstName: data.user.first_name || "",
          lastName: data.user.last_name || "",
        };
        setCurrentUserData(u);
        localStorage.setItem("chores_user", JSON.stringify(u));
        if (data.user.zip) setUserZip(data.user.zip);
        // Apply default_role if set, otherwise fall back to role
        if (data.user.default_role) {
          setRole(data.user.default_role);
          localStorage.setItem("chores_default_role", data.user.default_role);
        } else if (data.user.role) {
          setRole(data.user.role);
        }
      })
      .catch(()=>{}); // network error — keep existing session
  }, []);
  const [darkMode, setDarkMode] = useState(() => {
    // First load = light mode unless user has explicitly set a preference before
    try { 
      if (!isBrowser) return false;
      const saved = localStorage.getItem("chores_dark_mode");
      return saved !== null ? saved === "true" : false;
    } catch { return false; }
  });

  // Persist dark mode preference whenever it changes
  React.useEffect(() => {
    if (!isBrowser) return;
    localStorage.setItem("chores_dark_mode", String(darkMode));
  }, [darkMode]);

  // Keep G in sync with dark mode — re-render triggers downstream
  if (darkMode) { Object.assign(G, DARK); } else { Object.assign(G, LIGHT); }
  const [view, setView] = useState("home");
  const [toast, setToast] = useState(null);
  const [userZip, setUserZip] = useState(storedUser?.zip || "");
  const [userCoords, setUserCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("idle"); // idle, loading, granted, denied
  const [chatOpen, setChatOpen] = useState(null);
  const [inboxMessages, setInboxMessages] = useState([]);

  // Load inbox messages from backend + poll every 20s for new ones
  const fetchInbox = React.useCallback(()=>{
    const user = isBrowser ? (() => { try { return JSON.parse(localStorage.getItem("chores_user")||"{}"); } catch { return {}; } })() : {};
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!user.id || !token) return;
    fetch(`${BACKEND}/api/messages/inbox`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(r=>r.json())
      .then(data=>{ if(data.messages) setInboxMessages(data.messages); })
      .catch(()=>{});
  }, []);

  React.useEffect(()=>{
    fetchInbox();
    const interval = setInterval(fetchInbox, 20000);
    return () => clearInterval(interval);
  }, [fetchInbox]);

  // Request push notification permission on load
  React.useEffect(()=>{
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const [showPostJob, setShowPostJob] = useState(false);
  const [lastJobPost, setLastJobPost] = useState(0);
  const [postForm, setPostForm] = useState({title:"",category:"",pay:"",date:"",notes:"",photos:[]});
  const postPhotoRef = React.useRef();
  const [formPosted, setFormPosted] = useState(false);
  const [escrowData, setEscrowData] = useState(() => {
    try {
      const cached = isBrowser && localStorage.getItem("chores_escrow");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [escrowModal, setEscrowModal] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // {job, person, role:"worker"|"poster"}
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestPrompt, setGuestPrompt] = useState(false);
  const [maxDist, setMaxDist] = useState(2);
  const [appToggles, setAppToggles] = useState({ push:true, vibrate:true, darkMode:false, profileVisible:true, exactLoc:false, analytics:true, marketing:false, nJobs:true, nAppUpdates:true, nDayReminder:true, nHourReminder:true, nPayment:true, nCancel:true });
  const contentRef = React.useRef(null);
  React.useEffect(()=>{
    if(contentRef.current) contentRef.current.scrollTop = 0;
  },[view]);

  const [notifCount, setNotifCount] = React.useState(0);
  React.useEffect(() => {
    if (appView !== "user") return;
    const fetchNotifCount = async () => {
      const token = isBrowser ? localStorage.getItem("chores_token") : null;
      if (!token) return;
      try {
        const res = await fetch(`${BACKEND}/api/notifications`, { headers: { "Authorization": `Bearer ${token}` } });
        const data = await res.json();
        if (data.notifications) setNotifCount(data.notifications.filter(n=>n.unread).length);
      } catch(e) {}
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 20000);
    return () => clearInterval(interval);
  }, [appView]);

  // Load escrow transactions from backend
  const fetchEscrow = React.useCallback(() => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    if (!token) return;
    fetch(`${BACKEND}/api/escrow`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.transactions) {
          setEscrowData(data.transactions);
          try { localStorage.setItem("chores_escrow", JSON.stringify(data.transactions)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (appView !== "user") return;
    fetchEscrow();
    // Re-fetch when tab becomes visible (e.g. worker switches back to the app)
    const onVisible = () => { if (document.visibilityState === "visible") fetchEscrow(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [appView, fetchEscrow]);

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
          if (dist < 0.1) setUserZip(storedUser?.zip || "");
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

  const fireToast = (msg) => {
    if (!appToggles.push) return;
    if (msg) setToast(msg);
  };

  const handleConfirmSide = async (id, side) => {
    const token = isBrowser ? localStorage.getItem("chores_token") : null;
    // Call backend to confirm
    if (token) {
      try {
        await fetch(`${BACKEND}/api/escrow/${id}/confirm`, {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ side }),
        });
      } catch(e) {}
    }
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
        const reviewTarget = side==="poster" ? { person: t.worker, personId: t.workerId } : { person: t.poster, personId: t.posterId };
        setTimeout(()=>{
          setReviewModal({ job: t.job, jobId: t.jobId, ...reviewTarget, role: side });
        }, 600);
        setToast({icon:"💸",title:"Payment released!",body:`Both confirmed · $${t.workerGets.toFixed(2)} sent to ${t.worker}`});
      } else {
        setToast({icon:"✅",title:"Confirmed!",body:`Waiting for ${side==="poster"?"worker":"poster"} to confirm`});
      }
      return updated;
    }));
  };
  const handleDispute = (id) => { setEscrowData(d=>d.map(t=>t.id===id?{...t,status:"disputed",disputedAt:"Just now"}:t)); setToast({icon:"⚠️",title:"Dispute opened",body:"Review within 24 hours"}); };
  const handleFund = (newTxn) => { setEscrowData(d=>[{...newTxn,posterConfirmed:false,workerConfirmed:false},...d]); setToast({icon:"🔒",title:"Escrow funded!",body:`$${newTxn.amount.toFixed(2)} held securely`}); setTimeout(fetchEscrow, 1500); };

  if (appView==="login") return <LoginScreen onComplete={(r)=>{setRole(r);setAppView("user");const hasDefaultRole=localStorage.getItem("chores_default_role");if(!hasDefaultRole)setShowRoleModal(true);}} onBack={()=>setAppView("onboarding")} darkMode={darkMode} prefillEmail={loginPrefillEmail} />;
  if (appView==="onboarding") return <OnboardingFlow onComplete={(r)=>{setRole(r==="guest"?"worker":r);setAppView("user");if(r==="guest")setIsGuest(true);const hasDefaultRole=localStorage.getItem("chores_default_role");if(!hasDefaultRole&&r!=="guest")setShowRoleModal(true);}} onShowLogin={(email)=>{setLoginPrefillEmail(email||"");setAppView("login");}} darkMode={darkMode} />;

  if (appView==="admin") return (
    <div style={{ maxWidth:430, margin:"0 auto", boxShadow:"0 0 80px rgba(0,0,0,.2)" }}>
      <style>{CSS}</style>

      <div className="tap" onClick={()=>setAppView("user")} style={{ background:"rgba(255,255,255,.07)", padding:"10px 20px", fontSize:13, color:"rgba(255,255,255,.6)", fontFamily:"'Outfit',sans-serif" }}>← Back to App</div>
      <AdminDashboard />
    </div>
  );

  return (
    <div className="chores-app" style={{ "--text":darkMode?DARK.text:LIGHT.text, "--tab-bg":darkMode?"rgba(30,30,30,.97)":"rgba(255,255,255,.95)", fontFamily:"'Outfit',sans-serif", background:darkMode?DARK.cream:LIGHT.cream, minHeight:"100vh", maxWidth:430, margin:"0 auto", position:"relative", boxShadow:"0 0 80px rgba(0,0,0,.2)", display:"flex", flexDirection:"column", transition:"background .3s", color:darkMode?DARK.text:LIGHT.text }}>
      <style>{CSS}</style>
      {toast&&<Toast notif={toast} onDismiss={()=>setToast(null)} />}

      {/* Default Role Picker Modal — shown once after first login/signup */}
      {showRoleModal&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24, backdropFilter:"blur(6px)" }}>
          <div style={{ background:darkMode?DARK.cream:LIGHT.cream, borderRadius:28, padding:32, maxWidth:360, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,.3)", textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>👋</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:darkMode?DARK.text:LIGHT.text, marginBottom:8 }}>How will you use Chores?</div>
            <div style={{ fontSize:14, color:darkMode?"rgba(255,255,255,.55)":"rgba(0,0,0,.45)", marginBottom:28, lineHeight:1.5 }}>Choose your default view. You can always switch anytime from the top of the home screen.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              {[
                { val:"worker", icon:"🔨", title:"Worker", sub:"Browse jobs and get paid" },
                { val:"poster", icon:"📋", title:"Poster", sub:"Post jobs and hire people" },
              ].map(opt=>(
                <div key={opt.val} className="tap" onClick={()=>{
                  setRole(opt.val);
                  localStorage.setItem("chores_default_role", opt.val);
                  const u = JSON.parse(localStorage.getItem("chores_user")||"{}");
                  u.default_role = opt.val;
                  localStorage.setItem("chores_user", JSON.stringify(u));
                  setShowRoleModal(false);
                  // Save to Supabase
                  const tok = localStorage.getItem("chores_token");
                  if (tok) fetch(`${BACKEND}/api/user/default-role`, { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${tok}`}, body:JSON.stringify({defaultRole:opt.val}) }).catch(()=>{});
                }} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", borderRadius:18, border:`2px solid ${G.green}22`, background:darkMode?"rgba(255,255,255,.06)":"rgba(0,0,0,.03)", textAlign:"left", transition:"all .2s" }}
                onMouseEnter={e=>e.currentTarget.style.background=`${G.green}18`}
                onMouseLeave={e=>e.currentTarget.style.background=darkMode?"rgba(255,255,255,.06)":"rgba(0,0,0,.03)"}>
                  <div style={{ width:48, height:48, borderRadius:16, background:`${G.green}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{opt.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:16, color:darkMode?DARK.text:LIGHT.text }}>{opt.title}</div>
                    <div style={{ fontSize:13, color:darkMode?"rgba(255,255,255,.45)":"rgba(0,0,0,.4)", marginTop:2 }}>{opt.sub}</div>
                  </div>
                  <div style={{ color:G.greenMid, fontSize:20 }}>›</div>
                </div>
              ))}
            </div>
            <div className="tap" onClick={()=>setShowRoleModal(false)} style={{ fontSize:13, color:darkMode?"rgba(255,255,255,.35)":"rgba(0,0,0,.3)", padding:8 }}>Skip for now</div>
          </div>
        </div>
      )}

      {escrowModal&&<EscrowHoldModal job={escrowModal} onClose={()=>setEscrowModal(null)} onConfirm={handleFund} />}
      {checkoutModal&&<CheckoutModal job={checkoutModal} onClose={()=>setCheckoutModal(null)} onComplete={handleFund} />}
      {reviewModal&&<ReviewModal target={reviewModal.person} targetId={reviewModal.personId} jobTitle={reviewModal.job} jobId={reviewModal.jobId} onSubmit={()=>setToast({icon:"⭐",title:"Review submitted!",body:"Thanks for your feedback"})} onClose={()=>setReviewModal(null)} />}
      {viewingProfileId&&(
        <div style={{ position:"fixed", inset:0, zIndex:300, background:G.cream, overflowY:"auto" }}>
          <PublicProfileScreen userId={viewingProfileId} onBack={()=>setViewingProfileId(null)} />
        </div>
      )}

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

      {/* Header */}
      <div style={{ background:G.green, padding:"20px 20px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div className="tap" onClick={()=>setView("home")}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:800, color:"#fff", letterSpacing:.5, lineHeight:1.2 }}>Chores<span style={{ color:G.greenLight }}>.</span></div>
          </div>
        </div>
        <div style={{ display:"inline-flex", marginTop:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,.2)", borderRadius:20, padding:"4px" }}>
            <div onClick={()=>setRole("worker")} style={{ padding:"6px 18px", borderRadius:16, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .2s", background:role==="worker"?"#fff":"transparent", color:role==="worker"?G.green:"rgba(255,255,255,.6)" }}>Worker</div>
            <div onClick={()=>setRole("poster")} style={{ padding:"6px 18px", borderRadius:16, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .2s", background:role==="poster"?"#fff":"transparent", color:role==="poster"?G.green:"rgba(255,255,255,.6)" }}>Poster</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex:1, overflowY:"auto", paddingBottom:88 }}>
        {view==="home"&&<DiscoveryScreen role={role} onPostJob={()=>setShowPostJob(true)} onFundEscrow={(job)=>setEscrowModal(job)} onCheckout={(job)=>setCheckoutModal(job)} isGuest={isGuest} onGuestAction={()=>setGuestPrompt(true)} userZip={userZip} maxDist={maxDist} setMaxDist={setMaxDist} profileVisible={appToggles.profileVisible} refreshSignal={lastJobPost} onApplicationSent={fetchInbox} onViewProfile={(id)=>setViewingProfileId(id)} escrowData={escrowData} />}
        {view==="myjobs"&&<MyJobsScreen onPostJob={()=>setShowPostJob(true)} onCheckout={(job)=>setCheckoutModal(job)} refreshSignal={lastJobPost} />}
        {view==="map"&&<MapScreen role={role} isGuest={isGuest} onGuestAction={()=>setGuestPrompt(true)} onCheckout={(job)=>setCheckoutModal(job)} maxDist={maxDist} setMaxDist={setMaxDist} userZip={userZip} darkMode={darkMode} />}
        {view==="notifications"&&<NotificationsScreen role={role} onNavigate={setView} />}
        {view==="messages"&&(
          <MessagesTab
            inboxMessages={inboxMessages}
            fetchInbox={fetchInbox}
            chatOpen={chatOpen}
            setChatOpen={setChatOpen}
            role={role}
          />
        )}
        {view==="profile"&&<SettingsScreen role={role} escrowData={escrowData} onConfirmSide={handleConfirmSide} onDispute={handleDispute} onReview={(data)=>setReviewModal(data)} onUpdateZip={setUserZip} onTogglesChange={setAppToggles} currentUser={currentUserData} darkMode={darkMode} onDarkMode={setDarkMode} onAdmin={()=>setAppView("admin")} />}
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
                  <input value={postForm.pay} onChange={e=>setPostForm(p=>({...p,pay:e.target.value}))} placeholder="Pay (e.g. $40)" style={{ padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, background:G.white, boxSizing:"border-box", width:"100%" }} />
                  <input value={postForm.date} onChange={e=>setPostForm(p=>({...p,date:e.target.value}))} placeholder="Date / schedule (e.g. Sat Mar 15)" style={{ padding:"13px 14px", borderRadius:12, border:`1.5px solid ${G.border}`, fontSize:14, background:G.white, boxSizing:"border-box", width:"100%" }} />
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

                  <Btn onClick={async (e)=>{
                    if (!postForm.title || !postForm.category || !postForm.pay) { alert("Please fill in title, category, and pay."); return; }
                    const btn = e?.currentTarget;
                    if (btn) { btn.disabled = true; btn.textContent = "Posting..."; }
                    try {
                      const token = isBrowser ? localStorage.getItem("chores_token") : null;
                      if (!token) { alert("You must be logged in to post a job."); if(btn){btn.disabled=false;btn.textContent="Post Job →";} return; }
                      const res = await fetch(`${BACKEND}/api/jobs/create`, {
                        method:"POST",
                        headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
                        body: JSON.stringify({
                          title: postForm.title,
                          category: postForm.category,
                          pay: parseFloat(postForm.pay.replace(/[^0-9.]/g,"")),
                          date: postForm.date,
                          description: postForm.notes,
                          zip: userZip,
                          photos: postForm.photos || [],
                        })
                      });
                      const data = await res.json();
                      console.log("📋 Post job response:", data);
                      if (data.error) {
                        alert("Failed to post job: " + data.error);
                        if(btn){btn.disabled=false;btn.textContent="Post Job →";}
                        return;
                      }
                      setFormPosted(true);
                      setTimeout(()=>{ setShowPostJob(false); setFormPosted(false); setPostForm({title:"",category:"",pay:"",date:"",notes:"",photos:[]}); setLastJobPost(Date.now()); setView("myjobs"); }, 2200);
                    } catch(e) {
                      console.error("Post job error:", e);
                      alert("Network error — could not post job. Check your connection.");
                      if(btn){btn.disabled=false;btn.textContent="Post Job →";}
                    }
                  }} style={{ width:"100%", padding:"14px" }}>Post Job →</Btn>
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
          role==="poster"
            ? { id:"myjobs", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, label:"My Jobs" }
            : { id:"map",   icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label:"Map" },
          { id:"notifications", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label:"Inbox", badge:notifCount },
          { id:"messages",      icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label:"Messages", badge:inboxMessages.filter(m=>m.unread).length },
          { id:"profile",       icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:"Profile" },
        ].map(tab=>(
          <button key={tab.id} className="btn" onClick={()=>{if(isGuest&&(tab.id==="messages"||tab.id==="profile")){setGuestPrompt(true);return;}setView(tab.id);if(tab.id!=="messages")setChatOpen(null);}} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"0 10px", position:"relative", background:"none", color:view===tab.id?G.green:G.muted }}>
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
