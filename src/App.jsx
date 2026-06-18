// FinFlow — DEMO BUILD
// ─────────────────────────────────────────────────────────────────
// DEMO vs PRODUCTION differences:
//   1. STORAGE_KEY → finflow_demo_v1  (isolated from production)
//   2. Login screen shows demo credentials in a visible box
//   3. Persistent orange "DEMO MODE" banner in top bar
//   4. Sidebar label: "FinFlow Demo"
//   5. AI uses /api/ai.js → Puter.js (no Anthropic key needed)
//   6. initStore() always returns fresh mock data
//   7. Only 9 modules shown (demo scope, not full P2P suite)
// ─────────────────────────────────────────────────────────────────

import { useState, useRef, useMemo, createContext, useContext } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

// ── DEMO FLAG ─────────────────────────────────────────────────────
const IS_DEMO = true;
const DEMO_CREDENTIALS = [
  { role: "Admin",  username: "admin",  password: "FinFlow2025!", note: "Full access" },
  { role: "Client", username: "client", password: "Demo2025!",    note: "Client view" },
];
const DEMO_CLIENT_USER = {
  id:"client-demo", username:"client", password:"Demo2025!", role:"client",
  name:"Demo Client", entityIds:["E001","E002","E003"], active:true, createdAt:"2025-01-01",
};

// ── DESIGN TOKENS ─────────────────────────────────────────────────
const P = {
  bg:"#07090F", bg2:"#0C1018", surface:"#111827", surf2:"#0D1520", surf3:"#162032",
  border:"#1E2A3A", bord2:"#243448", gold:"#FAA819", mag:"#B84480",
  text:"#E8EDF5", sub:"#9DAEC4", muted:"#5A6A82",
  green:"#22D3A0", red:"#F43F5E", blue:"#38BDF8", purple:"#A78BFA", orange:"#FB923C",
};
const CCY_LIST = ["MYR","SGD","USD","PHP","IDR","THB","VND"];
const CCY_SYM  = { MYR:"RM",SGD:"S$",USD:"US$",PHP:"₱",IDR:"Rp",THB:"฿",VND:"₫" };
const CCY_CLR  = { MYR:P.mag,SGD:P.gold,USD:P.blue,PHP:P.purple,IDR:P.green,THB:P.orange,VND:P.red };
const BASE = "MYR";
const STORAGE_KEY = "finflow_demo_v1";  // ← DEMO: different from prod "finflow_v6"
const PRODUCT_NAME = "FinFlow Demo";    // ← DEMO: branded as Demo


// ── MOCK DATA ──────────────────────────────────────────────────────
const DEFAULT_FX = [
  { period:"Jan 2024", MYR:4.723, SGD:1.338, PHP:56.14, IDR:15680, THB:35.2, VND:24850 },
  { period:"Feb 2024", MYR:4.752, SGD:1.331, PHP:56.80, IDR:15720, THB:35.5, VND:24900 },
  { period:"Mar 2024", MYR:4.728, SGD:1.349, PHP:55.95, IDR:15690, THB:35.3, VND:24870 },
  { period:"Apr 2024", MYR:4.781, SGD:1.358, PHP:57.36, IDR:15810, THB:35.8, VND:25010 },
  { period:"May 2024", MYR:4.706, SGD:1.339, PHP:58.06, IDR:16100, THB:36.2, VND:25340 },
  { period:"Jun 2024", MYR:4.714, SGD:1.344, PHP:58.61, IDR:16240, THB:36.5, VND:25480 },
  { period:"Jul 2024", MYR:4.679, SGD:1.325, PHP:58.32, IDR:16120, THB:36.1, VND:25320 },
  { period:"Aug 2024", MYR:4.428, SGD:1.308, PHP:56.14, IDR:15680, THB:35.0, VND:24780 },
  { period:"Sep 2024", MYR:4.218, SGD:1.296, PHP:56.29, IDR:15540, THB:34.6, VND:24590 },
  { period:"Oct 2024", MYR:4.311, SGD:1.302, PHP:57.97, IDR:15720, THB:34.9, VND:24820 },
  { period:"Nov 2024", MYR:4.473, SGD:1.338, PHP:58.49, IDR:15850, THB:35.2, VND:24950 },
  { period:"Dec 2024", MYR:4.458, SGD:1.346, PHP:57.88, IDR:15790, THB:35.0, VND:24880 },
];

const DEFAULT_GL = [
  {id:"JE001",entityId:"E001",period:"Jan 2024",date:"2024-01-31",ref:"SLS-001",description:"Revenue — external clients",drAccount:"1100",crAccount:"4000",currency:"MYR",amount:68000,icEntityId:null},
  {id:"JE002",entityId:"E001",period:"Jan 2024",date:"2024-01-31",ref:"PAY-002",description:"Staff costs Jan 2024",drAccount:"5100",crAccount:"2000",currency:"MYR",amount:28560,icEntityId:null},
  {id:"JE006",entityId:"E001",period:"Feb 2024",date:"2024-02-29",ref:"SLS-006",description:"Revenue — external clients",drAccount:"1100",crAccount:"4000",currency:"MYR",amount:72000,icEntityId:null},
  {id:"JE007",entityId:"E001",period:"Feb 2024",date:"2024-02-29",ref:"PAY-007",description:"Staff costs Feb 2024",drAccount:"5100",crAccount:"2000",currency:"MYR",amount:30240,icEntityId:null},
  {id:"JE011",entityId:"E001",period:"Mar 2024",date:"2024-03-31",ref:"SLS-011",description:"Revenue — external clients",drAccount:"1100",crAccount:"4000",currency:"MYR",amount:85000,icEntityId:null},
  {id:"JE026",entityId:"E001",period:"Jun 2024",date:"2024-06-30",ref:"SLS-026",description:"Revenue — external clients",drAccount:"1100",crAccount:"4000",currency:"MYR",amount:105000,icEntityId:null},
  {id:"JE027",entityId:"E001",period:"Jun 2024",date:"2024-06-30",ref:"PAY-027",description:"Staff costs Jun 2024",drAccount:"5100",crAccount:"2000",currency:"MYR",amount:44100,icEntityId:null},
  {id:"JE041",entityId:"E001",period:"Sep 2024",date:"2024-09-30",ref:"SLS-041",description:"Revenue — external clients",drAccount:"1100",crAccount:"4000",currency:"MYR",amount:110000,icEntityId:null},
  {id:"JE056",entityId:"E001",period:"Dec 2024",date:"2024-12-31",ref:"SLS-056",description:"Revenue — external clients",drAccount:"1100",crAccount:"4000",currency:"MYR",amount:95000,icEntityId:null},
  {id:"JE057",entityId:"E001",period:"Dec 2024",date:"2024-12-31",ref:"PAY-057",description:"Staff costs Dec 2024",drAccount:"5100",crAccount:"2000",currency:"MYR",amount:39900,icEntityId:null},
  {id:"JE061",entityId:"E002",period:"Jan 2024",date:"2024-01-31",ref:"SLS-061",description:"Revenue — SG",drAccount:"1100",crAccount:"4000",currency:"SGD",amount:18000,icEntityId:null},
  {id:"JE086",entityId:"E002",period:"Jun 2024",date:"2024-06-30",ref:"SLS-086",description:"Revenue — SG",drAccount:"1100",crAccount:"4000",currency:"SGD",amount:28000,icEntityId:null},
  {id:"JE101",entityId:"E002",period:"Sep 2024",date:"2024-09-30",ref:"SLS-101",description:"Revenue — SG",drAccount:"1100",crAccount:"4000",currency:"SGD",amount:30000,icEntityId:null},
  {id:"JE116",entityId:"E002",period:"Dec 2024",date:"2024-12-31",ref:"SLS-116",description:"Revenue — SG",drAccount:"1100",crAccount:"4000",currency:"SGD",amount:28000,icEntityId:null},
  {id:"JE121",entityId:"E003",period:"Jan 2024",date:"2024-01-31",ref:"SLS-121",description:"Revenue — PH",drAccount:"1100",crAccount:"4000",currency:"PHP",amount:580000,icEntityId:null},
  {id:"JE122",entityId:"E003",period:"Jan 2024",date:"2024-01-31",ref:"PAY-122",description:"Staff costs — PH",drAccount:"5100",crAccount:"2000",currency:"PHP",amount:243600,icEntityId:null},
  {id:"JE146",entityId:"E003",period:"Jun 2024",date:"2024-06-30",ref:"SLS-146",description:"Revenue — PH",drAccount:"1100",crAccount:"4000",currency:"PHP",amount:820000,icEntityId:null},
  {id:"JE176",entityId:"E003",period:"Dec 2024",date:"2024-12-31",ref:"SLS-176",description:"Revenue — PH",drAccount:"1100",crAccount:"4000",currency:"PHP",amount:850000,icEntityId:null},
  {id:"JE177",entityId:"E003",period:"Dec 2024",date:"2024-12-31",ref:"PAY-177",description:"Staff costs — PH",drAccount:"5100",crAccount:"2000",currency:"PHP",amount:357000,icEntityId:null},
];

const DEFAULT_AR = [
  {id:"AR-001",entityId:"E001",counterparty:"Celestica Sdn Bhd",invoiceDate:"2024-10-01",dueDate:"2024-10-31",currency:"MYR",amount:93517,status:"Paid",notes:"Professional services"},
  {id:"AR-002",entityId:"E001",counterparty:"Petronas Nasional",invoiceDate:"2024-10-15",dueDate:"2024-11-14",currency:"MYR",amount:76456,status:"Overdue",notes:"Professional services"},
  {id:"AR-003",entityId:"E001",counterparty:"RHB Banking Group",invoiceDate:"2024-10-15",dueDate:"2024-11-14",currency:"MYR",amount:64894,status:"Overdue",notes:"Professional services"},
  {id:"AR-004",entityId:"E001",counterparty:"Celestica Sdn Bhd",invoiceDate:"2024-11-15",dueDate:"2024-12-15",currency:"MYR",amount:65471,status:"Outstanding",notes:"Professional services"},
  {id:"AR-005",entityId:"E001",counterparty:"OCK Group Berhad",invoiceDate:"2024-12-01",dueDate:"2025-01-01",currency:"MYR",amount:70915,status:"Outstanding",notes:"Professional services"},
  {id:"AR-006",entityId:"E001",counterparty:"Petronas Nasional",invoiceDate:"2024-12-15",dueDate:"2025-01-14",currency:"MYR",amount:88637,status:"Outstanding",notes:"Professional services"},
  {id:"AR-007",entityId:"E002",counterparty:"DBS Bank Singapore",invoiceDate:"2024-10-15",dueDate:"2024-11-14",currency:"SGD",amount:9149,status:"Overdue",notes:"Professional services"},
  {id:"AR-008",entityId:"E002",counterparty:"Axiata Group SG",invoiceDate:"2024-12-01",dueDate:"2025-01-01",currency:"USD",amount:10992,status:"Outstanding",notes:"Professional services"},
  {id:"AR-009",entityId:"E003",counterparty:"Jollibee Foods Corp",invoiceDate:"2024-12-01",dueDate:"2025-01-01",currency:"PHP",amount:782170,status:"Outstanding",notes:"Professional services"},
  {id:"AR-010",entityId:"E003",counterparty:"SM Prime Holdings",invoiceDate:"2024-12-15",dueDate:"2025-01-14",currency:"PHP",amount:797024,status:"Outstanding",notes:"Professional services"},
];

const DEFAULT_AP = [
  {id:"AP-001",entityId:"E001",counterparty:"OTG Singapore Pte",invoiceDate:"2024-12-01",dueDate:"2025-01-01",currency:"SGD",amount:22000,status:"Outstanding",notes:"Monthly retainer"},
  {id:"AP-002",entityId:"E001",counterparty:"KL Office Supplies",invoiceDate:"2024-12-01",dueDate:"2025-01-01",currency:"MYR",amount:3447,status:"Outstanding",notes:"Office supplies"},
  {id:"AP-003",entityId:"E002",counterparty:"SG Cowork Space Pte",invoiceDate:"2024-12-01",dueDate:"2025-01-01",currency:"SGD",amount:4800,status:"Outstanding",notes:"Office rental"},
  {id:"AP-004",entityId:"E003",counterparty:"Local Trainer MNL",invoiceDate:"2024-12-01",dueDate:"2025-01-01",currency:"PHP",amount:85000,status:"Outstanding",notes:"Training delivery"},
];

const DEFAULT_SALES = [
  {id:"D001",entityId:"E001",name:"Celestica AI Expansion Phase 2",stage:"Won",value:180000,currency:"MYR",closeDate:"2024-01-31",owner:"Lawrence Liu",product:"AI Solutions"},
  {id:"D002",entityId:"E001",name:"Petronas Agentic AI Pilot",stage:"Won",value:220000,currency:"MYR",closeDate:"2024-03-31",owner:"Lawrence Liu",product:"AI Solutions"},
  {id:"D003",entityId:"E001",name:"RHB Training Programme Q2",stage:"Won",value:92000,currency:"MYR",closeDate:"2024-04-30",owner:"Lawrence Liu",product:"Training"},
  {id:"D004",entityId:"E001",name:"Maxis Digital Transformation",stage:"Won",value:165000,currency:"MYR",closeDate:"2024-06-30",owner:"Lawrence Liu",product:"Consulting"},
  {id:"D005",entityId:"E001",name:"OCK FinFlow Implementation",stage:"Won",value:145000,currency:"MYR",closeDate:"2024-09-30",owner:"Lawrence Liu",product:"AI Solutions"},
  {id:"D006",entityId:"E001",name:"CIMB Agentic AI Boardroom",stage:"Negotiation",value:195000,currency:"MYR",closeDate:"2025-01-31",owner:"Lawrence Liu",product:"AI Solutions"},
  {id:"D007",entityId:"E001",name:"Maybank Digital Skills",stage:"Proposal",value:130000,currency:"MYR",closeDate:"2025-02-28",owner:"Lawrence Liu",product:"Training"},
  {id:"D008",entityId:"E001",name:"Sime Darby Consulting",stage:"Qualified",value:175000,currency:"MYR",closeDate:"2025-03-31",owner:"Lawrence Liu",product:"Consulting"},
  {id:"D009",entityId:"E002",name:"DBS Innovation Workshop",stage:"Won",value:18000,currency:"SGD",closeDate:"2024-05-31",owner:"Lawrence Liu",product:"Training"},
  {id:"D010",entityId:"E002",name:"GIC Investment Analytics",stage:"Proposal",value:45000,currency:"SGD",closeDate:"2025-01-31",owner:"Lawrence Liu",product:"Consulting"},
  {id:"D011",entityId:"E003",name:"Jollibee HR Consulting",stage:"Won",value:850000,currency:"PHP",closeDate:"2024-01-31",owner:"Lawrence Liu",product:"Consulting"},
  {id:"D012",entityId:"E003",name:"Globe Telecom AI",stage:"Negotiation",value:580000,currency:"PHP",closeDate:"2025-01-31",owner:"Lawrence Liu",product:"AI Solutions"},
];

const DEFAULT_BUDGET = [
  {entityId:"E001",period:"Jan 2024",accountCode:"4000",budgetMYR:80000},
  {entityId:"E001",period:"Jun 2024",accountCode:"4000",budgetMYR:115000},
  {entityId:"E001",period:"Sep 2024",accountCode:"4000",budgetMYR:120000},
  {entityId:"E001",period:"Dec 2024",accountCode:"4000",budgetMYR:105000},
  {entityId:"E001",period:"Jan 2024",accountCode:"5100",budgetMYR:35000},
  {entityId:"E001",period:"Jun 2024",accountCode:"5100",budgetMYR:44000},
  {entityId:"E001",period:"Dec 2024",accountCode:"5100",budgetMYR:40000},
  {entityId:"E002",period:"Jun 2024",accountCode:"4000",budgetMYR:30000},
  {entityId:"E002",period:"Dec 2024",accountCode:"4000",budgetMYR:30000},
  {entityId:"E003",period:"Jun 2024",accountCode:"4000",budgetMYR:900000},
  {entityId:"E003",period:"Dec 2024",accountCode:"4000",budgetMYR:940000},
];

const DEFAULT_COA = [
  { code:"1000", name:"Cash & Cash Equivalents", class:"A", group:"Current Assets",     icEligible:false, fxMethod:"closing",   active:true },
  { code:"1100", name:"Accounts Receivable",     class:"A", group:"Current Assets",     icEligible:true,  fxMethod:"closing",   active:true },
  { code:"1500", name:"Property Plant & Equipment", class:"A", group:"Non-Current Assets", icEligible:false, fxMethod:"closing", active:true },
  { code:"2000", name:"Accounts Payable",        class:"L", group:"Current Liabilities", icEligible:true,  fxMethod:"closing",   active:true },
  { code:"2100", name:"Accrued Liabilities",     class:"L", group:"Current Liabilities", icEligible:false, fxMethod:"closing",   active:true },
  { code:"3000", name:"Share Capital",           class:"E", group:"Equity",             icEligible:false, fxMethod:"historical",active:true },
  { code:"3100", name:"Retained Earnings",       class:"E", group:"Equity",             icEligible:false, fxMethod:"historical",active:true },
  { code:"4000", name:"Revenue — External",      class:"R", group:"Revenue",            icEligible:false, fxMethod:"average",   active:true },
  { code:"4100", name:"Revenue — Intercompany",  class:"R", group:"Revenue",            icEligible:true,  fxMethod:"average",   active:true },
  { code:"5100", name:"Staff Costs",             class:"X", group:"Expenses",           icEligible:false, fxMethod:"average",   active:true },
  { code:"5300", name:"Depreciation",            class:"X", group:"Expenses",           icEligible:false, fxMethod:"average",   active:true },
  { code:"5400", name:"General & Admin",         class:"X", group:"Expenses",           icEligible:false, fxMethod:"average",   active:true },
];

const DEFAULT_ENTITIES = [
  { id:"E001", name:"Malaysia HQ",        country:"Malaysia",    currency:"MYR", type:"Headquarters", active:true, color:P.mag    },
  { id:"E002", name:"Singapore Office",   country:"Singapore",   currency:"SGD", type:"Subsidiary",   active:true, color:P.gold   },
  { id:"E003", name:"Philippines Branch", country:"Philippines", currency:"PHP", type:"Branch",       active:true, color:P.purple },
];

// ── DEMO: Always fresh mock data ──────────────────────────────────
function initStore(){
  return {
    entities: DEFAULT_ENTITIES, coa: DEFAULT_COA, gl: DEFAULT_GL,
    fxRates: DEFAULT_FX, ar: DEFAULT_AR, ap: DEFAULT_AP,
    budget: DEFAULT_BUDGET, sales: DEFAULT_SALES,
  };
}
function persist(s){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }catch{} }

// ── Context ────────────────────────────────────────────────────────
const Ctx = createContext(null);
const useStore = () => useContext(Ctx);


// ── Helpers ────────────────────────────────────────────────────────
function getFxRate(fxRates, period, currency) {
  const row = fxRates.find(r=>r.period===period) || fxRates[fxRates.length-1];
  if (!row) return 1;
  if (currency === BASE) return 1;
  if (currency === "USD") return row.MYR || 1;
  const r = row[currency], m = row.MYR;
  if (!r || !m) return 1;
  return m / r;
}
const fmtMYR = v => "RM "+Number(v).toLocaleString("en-MY",{maximumFractionDigits:0});
const fmtAmt = (v,c) => (CCY_SYM[c]||c)+" "+Number(v).toLocaleString("en-MY",{maximumFractionDigits:0});
const fmtK   = v => Math.abs(v)>=1e6?"RM "+(v/1e6).toFixed(2)+"M":Math.abs(v)>=1000?"RM "+(v/1000).toFixed(0)+"K":fmtMYR(v);
const pct    = (a,b) => (!a||!b)?null:((b-a)/a)*100;

function toRM(spotRow, amt, ccy) {
  if (ccy === BASE) return amt;
  if (ccy === "USD") return amt * (spotRow.MYR || 4.5);
  const r = spotRow[ccy], m = spotRow.MYR;
  return (r && m) ? amt * (m / r) : amt;
}

// ── Shared UI ──────────────────────────────────────────────────────
function Card({title,children,style={},accent,noPad}){
  return(
    <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:12,padding:noPad?0:"16px 20px",position:"relative",overflow:"hidden",...style}}>
      {accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent,borderRadius:"12px 12px 0 0"}}/>}
      {title&&<div style={{color:P.muted,fontSize:10,fontFamily:"monospace",letterSpacing:2,textTransform:"uppercase",marginBottom:12,marginTop:accent?6:0,padding:noPad?"14px 18px 0":0}}>{title}</div>}
      <div style={{padding:noPad&&title?"0 18px 14px":noPad?"14px 18px":0}}>{children}</div>
    </div>
  );
}
function KPI({label,value,sub,color=P.gold,accent,small}){
  return(
    <Card accent={accent||color}>
      <div style={{color:P.muted,fontSize:9,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{label}</div>
      <div style={{fontSize:small?17:22,fontWeight:700,color,fontFamily:"monospace",lineHeight:1.1}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:P.muted,marginTop:3}}>{sub}</div>}
    </Card>
  );
}
function Btn({children,onClick,color=P.gold,outline,small,disabled,danger,style={}}){
  const c=danger?P.red:color;
  return(
    <button onClick={onClick} disabled={disabled} style={{background:outline?"transparent":c,color:outline?c:c===P.gold?"#0B0F1A":"#fff",border:`1px solid ${c}`,borderRadius:7,padding:small?"4px 10px":"7px 14px",cursor:disabled?"not-allowed":"pointer",fontSize:small?11:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap",opacity:disabled?0.5:1,...style}}>{children}</button>
  );
}
function Input({value,onChange,placeholder,type="text",style={}}){
  return(<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:P.surf2,border:`1px solid ${P.border}`,borderRadius:7,color:P.text,padding:"7px 11px",fontSize:12,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box",...style}}/>);
}
function Sel({value,onChange,children,style={}}){
  return(<select value={value} onChange={e=>onChange(e.target.value)} style={{background:P.surf2,border:`1px solid ${P.border}`,borderRadius:7,color:P.text,padding:"7px 11px",fontSize:12,outline:"none",fontFamily:"inherit",cursor:"pointer",...style}}>{children}</select>);
}
function Badge({label,color}){
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700,background:`${color}20`,color,border:`1px solid ${color}40`}}>{label}</span>;
}
function EntityDot({entity,size=8}){
  return entity?<span style={{display:"inline-block",width:size,height:size,borderRadius:"50%",background:entity.color||P.muted,flexShrink:0}}/>:null;
}
function SubTabs({tabs,active,onChange}){
  return(<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>{tabs.map(t=>(<button key={t.id} onClick={()=>onChange(t.id)} style={{padding:"5px 13px",borderRadius:7,border:`1px solid ${active===t.id?P.gold:P.border}`,background:active===t.id?`${P.gold}18`:"transparent",color:active===t.id?P.gold:P.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{t.label}</button>))}</div>);
}

// ── Global Filters ─────────────────────────────────────────────────
function GlobalFilters({store,gf,setGf}){
  const {entities,fxRates}=store;
  const allPeriods=useMemo(()=>fxRates.map(r=>r.period),[fxRates]);
  const activeE=entities.filter(e=>e.active);
  function toggleE(id){setGf(f=>({...f,entityIds:f.entityIds.includes(id)?f.entityIds.filter(x=>x!==id):[...f.entityIds,id]}));}
  return(
    <div style={{padding:"12px 14px",borderBottom:`1px solid ${P.border}`,background:P.bg2}}>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
        <span style={{color:P.gold,fontSize:9,fontWeight:700,letterSpacing:2}}>PERIOD</span>
        <Sel value={gf.periodFrom} onChange={v=>setGf(f=>({...f,periodFrom:v}))} style={{fontSize:10,padding:"3px 7px",flex:1}}><option value="">From</option>{allPeriods.map(p=><option key={p}>{p}</option>)}</Sel>
        <span style={{color:P.muted,fontSize:10}}>→</span>
        <Sel value={gf.periodTo} onChange={v=>setGf(f=>({...f,periodTo:v}))} style={{fontSize:10,padding:"3px 7px",flex:1}}><option value="">To</option>{allPeriods.map(p=><option key={p}>{p}</option>)}</Sel>
      </div>
      <div style={{marginBottom:6}}>
        <div style={{color:P.gold,fontSize:9,fontWeight:700,letterSpacing:2,marginBottom:5}}>ENTITIES</div>
        {activeE.map(e=>{const on=gf.entityIds.includes(e.id);return(
          <button key={e.id} onClick={()=>toggleE(e.id)} style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"4px 8px",borderRadius:7,border:`1px solid ${on?e.color:P.border}`,background:on?`${e.color}15`:"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:3}}>
            <EntityDot entity={e} size={6}/><span style={{color:on?e.color:P.muted,fontSize:11,fontWeight:on?600:400,flex:1}}>{e.name}</span>
            <span style={{color:P.muted,fontSize:9}}>{e.currency}</span>
          </button>
        );})}
      </div>
      <div style={{display:"flex",gap:5}}>
        <button onClick={()=>setGf(f=>({...f,entityIds:activeE.map(e=>e.id)}))} style={{background:"transparent",border:`1px solid ${P.border}`,borderRadius:5,color:P.muted,fontSize:10,padding:"2px 7px",cursor:"pointer",fontFamily:"inherit"}}>All</button>
        <button onClick={()=>setGf(f=>({...f,entityIds:[]}))} style={{background:"transparent",border:`1px solid ${P.border}`,borderRadius:5,color:P.muted,fontSize:10,padding:"2px 7px",cursor:"pointer",fontFamily:"inherit"}}>None</button>
      </div>
    </div>
  );
}


// ── AUTH ───────────────────────────────────────────────────────────
const AUTH_KEY    = "finflow_demo_auth_v1";
const SESSION_KEY = "finflow_demo_session";
const DEFAULT_ADMIN = {id:"admin",username:"admin",password:"FinFlow2025!",role:"admin",name:"SGC Admin (Demo)",entityIds:"all",active:true,createdAt:"2025-01-01"};
function loadUsers(){ try{const r=localStorage.getItem(AUTH_KEY);if(r)return JSON.parse(r);}catch{} return [DEFAULT_ADMIN, DEMO_CLIENT_USER]; }
function saveUsers(u){ try{localStorage.setItem(AUTH_KEY,JSON.stringify(u));}catch{} }
function loadSession(){ try{const r=sessionStorage.getItem(SESSION_KEY);if(r)return JSON.parse(r);}catch{} return null; }
function saveSession(s){ try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(s));}catch{} }
function clearSession(){ try{sessionStorage.removeItem(SESSION_KEY);}catch{} }

// ── LANDING PAGE ───────────────────────────────────────────────────
function LandingPage({onEnter}){
  return(
    <div style={{minHeight:"100vh",background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-120,right:-120,width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${P.mag}18 0%,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{maxWidth:520,width:"100%",textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:16,background:`linear-gradient(135deg,${P.gold},${P.mag})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#0B0F1A"}}>FF</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:28,fontWeight:900,color:P.text,letterSpacing:-1}}>FinFlow</div>
            <div style={{fontSize:11,color:P.muted,letterSpacing:2}}>MULTI-ENTITY FINANCIAL INTELLIGENCE</div>
          </div>
        </div>
        <div style={{display:"inline-block",background:`${P.orange}20`,border:`1px solid ${P.orange}50`,borderRadius:20,padding:"5px 20px",fontSize:12,fontWeight:700,color:P.orange,marginBottom:20,letterSpacing:1}}>
          🎯 DEMO MODE — Sample Data Only
        </div>
        <div style={{fontSize:32,fontWeight:800,color:P.text,lineHeight:1.15,marginBottom:16,letterSpacing:-1}}>
          Explore FinFlow<br/>
          <span style={{background:`linear-gradient(90deg,${P.gold},${P.mag})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>with live mock data</span>
        </div>
        <div style={{fontSize:14,color:P.sub,lineHeight:1.7,marginBottom:40,maxWidth:420,margin:"0 auto 40px"}}>
          Full walk-through of FinFlow's multi-entity finance platform. All data is sample only — no real client information is processed or stored.
        </div>
        <button onClick={onEnter} style={{background:`linear-gradient(135deg,${P.gold},${P.mag})`,border:"none",borderRadius:14,padding:"16px 48px",fontSize:16,fontWeight:800,color:"#0B0F1A",cursor:"pointer",boxShadow:`0 4px 24px ${P.gold}40`}}>
          Explore Demo →
        </button>
        <div style={{marginTop:20,fontSize:11,color:P.muted}}>Powered by SGC · SynerGrowth Consulting</div>
      </div>
    </div>
  );
}

// ── LOGIN SCREEN (DEMO: shows credentials) ─────────────────────────
function LoginScreen({onLogin, prefillUser=""}){
  const [username,setUsername]=useState(prefillUser||"admin");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  function attempt(){
    setError(""); setLoading(true);
    setTimeout(()=>{
      const users=loadUsers();
      const user=users.find(u=>u.username.toLowerCase()===username.toLowerCase().trim()&&u.active);
      if(!user){setError("Username not found.");setLoading(false);return;}
      if(user.password!==password){setError("Incorrect password.");setLoading(false);return;}
      const session={userId:user.id,role:user.role,name:user.name,username:user.username,entityIds:user.entityIds,loginAt:Date.now()};
      saveSession(session);setLoading(false);onLogin(session);
    },400);
  }
  return(
    <div style={{minHeight:"100vh",background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28,justifyContent:"center"}}>
          <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${P.gold},${P.mag})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#0B0F1A"}}>FF</div>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:P.text}}>FinFlow Demo</div>
            <div style={{fontSize:9,color:P.orange,letterSpacing:2,fontWeight:700}}>DEMO MODE — SAMPLE DATA ONLY</div>
          </div>
        </div>
        {/* ── DEMO: Credentials box ── */}
        <div style={{background:`${P.orange}10`,border:`1px solid ${P.orange}40`,borderRadius:12,padding:"12px 16px",marginBottom:18}}>
          <div style={{color:P.orange,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>🎯 DEMO CREDENTIALS — click to fill</div>
          {DEMO_CREDENTIALS.map(c=>(
            <div key={c.username} onClick={()=>{setUsername(c.username);setPassword(c.password);}} style={{display:"flex",gap:12,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${P.orange}20`,cursor:"pointer"}}>
              <Badge label={c.role} color={c.role==="Admin"?P.gold:P.blue}/>
              <span style={{color:P.text,fontSize:11,fontWeight:600,width:55}}>{c.username}</span>
              <span style={{fontFamily:"monospace",color:P.sub,fontSize:11}}>{c.password}</span>
              <span style={{color:P.muted,fontSize:10,marginLeft:"auto"}}>{c.note}</span>
            </div>
          ))}
        </div>
        <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:16,padding:"24px 22px"}}>
          <div style={{marginBottom:14}}>
            <div style={{color:P.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>USERNAME</div>
            <input value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} style={{width:"100%",background:P.surf2,border:`1px solid ${P.border}`,borderRadius:9,color:P.text,padding:"11px 14px",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:error?14:18}}>
            <div style={{color:P.muted,fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:5}}>PASSWORD</div>
            <input value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} type="password" style={{width:"100%",background:P.surf2,border:`1px solid ${P.border}`,borderRadius:9,color:P.text,padding:"11px 14px",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          </div>
          {error&&<div style={{background:`${P.red}15`,border:`1px solid ${P.red}40`,borderRadius:8,padding:"8px 12px",marginBottom:14,color:P.red,fontSize:12}}>✗ {error}</div>}
          <button onClick={attempt} disabled={loading||!username||!password} style={{width:"100%",background:`linear-gradient(135deg,${P.gold},${P.mag})`,border:"none",borderRadius:10,padding:"13px",fontSize:14,fontWeight:700,color:"#0B0F1A",cursor:loading||!username||!password?"not-allowed":"pointer",opacity:loading||!username||!password?0.7:1}}>
            {loading?"Signing in…":"Enter Demo →"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── NAV ────────────────────────────────────────────────────────────
const NAV=[
  {id:"home",    icon:"◈",  label:"Overview",         group:""},
  {id:"sales",   icon:"◉",  label:"Sales Pipeline",   group:"FinFlow"},
  {id:"arap",    icon:"↕",  label:"AR / AP",          group:"FinFlow"},
  {id:"budget",  icon:"◎",  label:"Budget vs Actual", group:"FinFlow"},
  {id:"pl",      icon:"▤",  label:"P&L",              group:"FinFlow"},
  {id:"bs",      icon:"▥",  label:"Balance Sheet",    group:"FinFlow"},
  {id:"cashflow",icon:"⇌",  label:"Cash Flow",        group:"FinFlow"},
  {id:"fx",      icon:"$",  label:"FX Rates",         group:"FinFlow"},
  {id:"ai",      icon:"✦",  label:"AI Biz Insight",   group:"FinFlow AI"},
];

// ── SIDEBAR ────────────────────────────────────────────────────────
function Sidebar({active,setActive,store,gf,setGf,onLogout,session}){
  const {entities}=store;
  return(
    <div style={{width:216,flexShrink:0,background:P.bg2,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflowY:"auto"}}>
      <div style={{padding:"16px 16px 12px",borderBottom:`1px solid ${P.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
          <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${P.gold},${P.mag})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#0B0F1A"}}>FF</div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:P.text}}>{PRODUCT_NAME}</div>
            <div style={{fontSize:8,color:P.orange,letterSpacing:1.5,fontWeight:700}}>DEMO MODE</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,background:P.surf2,borderRadius:8,padding:"7px 10px",border:`1px solid ${P.border}`}}>
          <div style={{width:22,height:22,borderRadius:6,background:`linear-gradient(135deg,${P.gold},${P.mag})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#0B0F1A"}}>{session?.name?.slice(0,2).toUpperCase()||"AD"}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:P.text,fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session?.name||"Admin"}</div>
            <div style={{color:P.orange,fontSize:9,fontWeight:700,letterSpacing:1}}>DEMO</div>
          </div>
          <button onClick={onLogout} style={{background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:14,padding:"2px 4px"}}>⏏</button>
        </div>
      </div>
      <div style={{padding:"8px 8px 0",flex:1}}>
        {[...new Set(NAV.map(n=>n.group))].map(grp=>{
          const items=NAV.filter(n=>n.group===grp);
          return(
            <div key={grp}>
              {grp&&<div style={{color:grp==="FinFlow AI"?P.gold:P.mag,fontSize:8,fontWeight:700,letterSpacing:2,padding:"8px 9px 3px",textTransform:"uppercase"}}>{grp}</div>}
              {items.map(n=>(
                <button key={n.id} onClick={()=>setActive(n.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"7px 9px",borderRadius:8,border:"none",cursor:"pointer",background:active===n.id?`${P.gold}18`:"transparent",marginBottom:1,fontFamily:"inherit",textAlign:"left"}}>
                  <span style={{fontSize:12,color:active===n.id?P.gold:P.muted,width:18,textAlign:"center"}}>{n.icon}</span>
                  <span style={{fontSize:11,fontWeight:active===n.id?700:400,color:active===n.id?P.gold:P.sub}}>{n.label}</span>
                  {active===n.id&&<div style={{marginLeft:"auto",width:3,height:3,borderRadius:"50%",background:P.gold}}/>}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{borderTop:`1px solid ${P.border}`}}><GlobalFilters store={store} gf={gf} setGf={setGf}/></div>
      <div style={{padding:"8px 14px",borderTop:`1px solid ${P.border}`,fontSize:9,color:P.muted}}>Demo data · MYR base</div>
    </div>
  );
}


// ── OVERVIEW ───────────────────────────────────────────────────────
function Overview({store,gf}){
  const {entities,fxRates,ar,ap,sales=[]}=store;
  const spotRow=fxRates[fxRates.length-1]||{};
  const toR=(a,c)=>toRM(spotRow,a,c);
  const actE=entities.filter(e=>e.active&&gf.entityIds.includes(e.id));
  const arTot=ar.filter(r=>r.status!=="Paid"&&gf.entityIds.includes(r.entityId)).reduce((s,r)=>s+toR(r.amount,r.currency),0);
  const apTot=ap.filter(r=>r.status!=="Paid"&&gf.entityIds.includes(r.entityId)).reduce((s,r)=>s+toR(r.amount,r.currency),0);
  const wonRev=sales.filter(d=>d.stage==="Won"&&gf.entityIds.includes(d.entityId)).reduce((s,d)=>s+toR(d.value,d.currency),0);
  const pipeline=sales.filter(d=>!["Won","Lost"].includes(d.stage)&&gf.entityIds.includes(d.entityId)).reduce((s,d)=>s+toR(d.value,d.currency),0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <div style={{fontSize:20,fontWeight:800,color:P.text,marginBottom:3}}>{PRODUCT_NAME}</div>
        <div style={{fontSize:11,color:P.muted}}>Multi-Entity Financial Intelligence · {actE.length} entities · FX as at {fxRates[fxRates.length-1]?.period||"—"} · MYR base</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        <KPI label="AR Outstanding" value={fmtK(arTot)}  color={P.green}  accent={P.green}  small/>
        <KPI label="AP Outstanding" value={fmtK(apTot)}  color={P.mag}    accent={P.mag}    small/>
        <KPI label="Won Revenue"    value={fmtK(wonRev)}  color={P.gold}  accent={P.gold}   small/>
        <KPI label="Active Pipeline" value={fmtK(pipeline)} color={P.blue} accent={P.blue}  small/>
        <KPI label="Net Exposure"   value={fmtK(arTot-apTot)} color={arTot>apTot?P.green:P.red} small/>
      </div>
      <Card title="Entity Snapshot">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
          {actE.map(e=>{
            const eAR=ar.filter(r=>r.entityId===e.id&&r.status!=="Paid").reduce((s,r)=>s+toR(r.amount,r.currency),0);
            const eAP=ap.filter(r=>r.entityId===e.id&&r.status!=="Paid").reduce((s,r)=>s+toR(r.amount,r.currency),0);
            const eSales=sales.filter(d=>d.entityId===e.id&&d.stage==="Won").reduce((s,d)=>s+toR(d.value,d.currency),0);
            return(
              <div key={e.id} style={{background:P.surf2,border:`1px solid ${e.color}40`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                  <EntityDot entity={e} size={8}/>
                  <span style={{color:P.text,fontWeight:700,fontSize:12,flex:1}}>{e.name}</span>
                  <Badge label={e.currency} color={e.color}/>
                </div>
                <div style={{fontSize:10,color:P.muted,marginBottom:8}}>{e.country} · {e.type}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  <div><div style={{color:P.muted,fontSize:9}}>AR</div><div style={{color:P.green,fontFamily:"monospace",fontSize:11,fontWeight:700}}>{fmtK(eAR)}</div></div>
                  <div><div style={{color:P.muted,fontSize:9}}>AP</div><div style={{color:P.mag,fontFamily:"monospace",fontSize:11,fontWeight:700}}>{fmtK(eAP)}</div></div>
                  <div><div style={{color:P.muted,fontSize:9}}>Won</div><div style={{color:P.gold,fontFamily:"monospace",fontSize:11,fontWeight:700}}>{fmtK(eSales)}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── AR/AP MODULE ───────────────────────────────────────────────────
function ARAPModule({gf}){
  const {store}=useStore();
  const {entities,fxRates,ar,ap}=store;
  const [mode,setMode]=useState("AR");
  const spotRow=fxRates[fxRates.length-1]||{};
  const toR=(a,c)=>toRM(spotRow,a,c);
  const records=mode==="AR"?ar.filter(r=>gf.entityIds.includes(r.entityId)):ap.filter(r=>gf.entityIds.includes(r.entityId));
  const arTot=ar.filter(r=>r.status!=="Paid"&&gf.entityIds.includes(r.entityId)).reduce((s,r)=>s+toR(r.amount,r.currency),0);
  const apTot=ap.filter(r=>r.status!=="Paid"&&gf.entityIds.includes(r.entityId)).reduce((s,r)=>s+toR(r.amount,r.currency),0);
  const arOvd=ar.filter(r=>r.status==="Overdue"&&gf.entityIds.includes(r.entityId)).reduce((s,r)=>s+toR(r.amount,r.currency),0);
  const statusClr={Outstanding:P.gold,Overdue:P.red,Paid:P.green,Disputed:P.purple};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        <KPI label="AR Outstanding" value={fmtK(arTot)} color={P.green}  accent={P.green}  small/>
        <KPI label="AP Outstanding" value={fmtK(apTot)} color={P.mag}    accent={P.mag}    small/>
        <KPI label="AR Overdue"     value={fmtK(arOvd)} color={P.red}    accent={P.red}    small/>
        <KPI label="Net Exposure"   value={fmtK(arTot-apTot)} color={arTot>apTot?P.green:P.red} small/>
      </div>
      <div style={{display:"flex",gap:3,background:P.surf2,borderRadius:8,padding:3,border:`1px solid ${P.border}`,width:"fit-content"}}>
        {["AR","AP"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:"5px 16px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,background:mode===m?P.gold:"transparent",color:mode===m?"#0B0F1A":P.muted}}>{m}</button>)}
      </div>
      <Card noPad>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:P.surf2}}>{["Entity","Counterparty","Invoice Date","Due Date","Currency","Amount","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"7px 10px",color:P.muted,borderBottom:`1px solid ${P.border}`,fontSize:10}}>{h}</th>)}</tr></thead>
            <tbody>{records.map((r,i)=>{const e=entities.find(x=>x.id===r.entityId);return(
              <tr key={r.id} style={{borderBottom:`1px solid ${P.border}20`,background:i%2===0?"transparent":`${P.border}12`,opacity:r.status==="Paid"?0.5:1}}>
                <td style={{padding:"6px 10px"}}>{e&&<div style={{display:"flex",alignItems:"center",gap:5}}><EntityDot entity={e} size={6}/><span style={{color:e.color,fontSize:10,fontWeight:600}}>{e.name}</span></div>}</td>
                <td style={{padding:"6px 10px",color:P.text}}>{r.counterparty}</td>
                <td style={{padding:"6px 10px",fontFamily:"monospace",color:P.muted,fontSize:10}}>{r.invoiceDate}</td>
                <td style={{padding:"6px 10px",fontFamily:"monospace",color:P.muted,fontSize:10}}>{r.dueDate}</td>
                <td style={{padding:"6px 10px",color:P.gold,fontSize:10,fontWeight:600}}>{r.currency}</td>
                <td style={{padding:"6px 10px",fontFamily:"monospace",textAlign:"right",color:P.text}}>{fmtAmt(r.amount,r.currency)}</td>
                <td style={{padding:"6px 10px"}}><Badge label={r.status} color={statusClr[r.status]||P.muted}/></td>
              </tr>
            );})}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── SALES MODULE ───────────────────────────────────────────────────
const DEAL_STAGES = ["Lead","Qualified","Proposal","Negotiation","Won","Lost"];
const STAGE_CLR   = { Lead:"#64748B",Qualified:P.blue,Proposal:P.gold,Negotiation:P.orange,Won:P.green,Lost:P.red };
const STAGE_PROB  = { Lead:10,Qualified:25,Proposal:50,Negotiation:75,Won:100,Lost:0 };

function SalesModule({gf}){
  const {store}=useStore();
  const {sales=[],entities,fxRates}=store;
  const spotRow=fxRates[fxRates.length-1]||{};
  const toR=(a,c)=>toRM(spotRow,a,c);
  const filtDeals=sales.filter(d=>gf.entityIds.includes(d.entityId));
  const wonDeals=filtDeals.filter(d=>d.stage==="Won");
  const activeDls=filtDeals.filter(d=>!["Won","Lost"].includes(d.stage));
  const wonRev=wonDeals.reduce((s,d)=>s+toR(d.value,d.currency),0);
  const pipeline=activeDls.reduce((s,d)=>s+toR(d.value,d.currency),0);
  const weighted=activeDls.reduce((s,d)=>s+toR(d.value,d.currency)*(STAGE_PROB[d.stage]/100),0);
  const lostDls=filtDeals.filter(d=>d.stage==="Lost");
  const winRate=wonDeals.length+lostDls.length>0?((wonDeals.length/(wonDeals.length+lostDls.length))*100):0;
  const funnelData=DEAL_STAGES.map(stage=>{
    const deals=filtDeals.filter(d=>d.stage===stage);
    return{stage,count:deals.length,value:deals.reduce((s,d)=>s+toR(d.value,d.currency),0),color:STAGE_CLR[stage]};
  });
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        <KPI label="Won Revenue"    value={fmtK(wonRev)}        color={P.green}  accent={P.green}  small sub={`${wonDeals.length} deals`}/>
        <KPI label="Pipeline"       value={fmtK(pipeline)}      color={P.blue}   accent={P.blue}   small sub={`${activeDls.length} active`}/>
        <KPI label="Weighted Fcst"  value={fmtK(weighted)}      color={P.gold}   accent={P.gold}   small/>
        <KPI label="Win Rate"       value={winRate.toFixed(0)+"%"} color={winRate>60?P.green:P.gold} small/>
      </div>
      <Card title="Pipeline Funnel">
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {funnelData.filter(s=>s.count>0).map(s=>(
            <div key={s.stage} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:90,color:s.color,fontSize:10,fontWeight:700,textAlign:"right"}}>{s.stage}</div>
              <div style={{flex:1,height:24,background:P.surf2,borderRadius:5,overflow:"hidden",position:"relative"}}>
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.max(5,s.value/(wonRev+pipeline+1)*100)}%`,background:s.color,opacity:0.3,borderRadius:5}}/>
                <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:P.text,fontSize:10,fontWeight:700}}>{s.count}</div>
              </div>
              <div style={{width:80,textAlign:"right",fontFamily:"monospace",color:P.muted,fontSize:10}}>{fmtK(s.value)}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card noPad title="All Deals">
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:P.surf2}}>{["Deal","Entity","Stage","Value (MYR)","Close Date","Product"].map(h=><th key={h} style={{textAlign:"left",padding:"7px 10px",color:P.muted,borderBottom:`1px solid ${P.border}`,fontSize:10}}>{h}</th>)}</tr></thead>
            <tbody>{filtDeals.map((d,i)=>{const e=entities.find(x=>x.id===d.entityId);return(
              <tr key={d.id} style={{borderBottom:`1px solid ${P.border}20`,background:i%2===0?"transparent":`${P.border}12`,opacity:d.stage==="Lost"?0.5:1}}>
                <td style={{padding:"7px 10px",color:P.text,fontWeight:500,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</td>
                <td style={{padding:"7px 10px"}}>{e&&<div style={{display:"flex",alignItems:"center",gap:5}}><EntityDot entity={e} size={6}/><span style={{color:e.color,fontSize:10}}>{e.name}</span></div>}</td>
                <td style={{padding:"7px 10px"}}><Badge label={d.stage} color={STAGE_CLR[d.stage]}/></td>
                <td style={{padding:"7px 10px",fontFamily:"monospace",color:P.gold,fontWeight:700}}>{fmtK(toR(d.value,d.currency))}</td>
                <td style={{padding:"7px 10px",fontFamily:"monospace",color:P.muted,fontSize:10}}>{d.closeDate||"—"}</td>
                <td style={{padding:"7px 10px"}}>{d.product&&<Badge label={d.product} color={P.purple}/>}</td>
              </tr>
            );})}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


// ── BUDGET MODULE ──────────────────────────────────────────────────
function BudgetModule({gf}){
  const {store}=useStore();
  const {budget,gl,coa,entities,fxRates}=store;
  const periods=fxRates.map(r=>r.period);
  const [fPeriod,setFPeriod]=useState(periods[periods.length-1]||"");
  const [fEntity,setFEntity]=useState(gf.entityIds[0]||entities[0]?.id||"");
  const activeE=entities.filter(e=>e.active&&gf.entityIds.includes(e.id));
  function getActualMYR(accountCode,period,entityId){
    const e=entities.find(x=>x.id===entityId);const ccy=e?.currency||BASE;
    const rate=getFxRate(fxRates,period,ccy);
    let dr=0,cr=0;
    gl.filter(j=>j.entityId===entityId&&j.period===period).forEach(j=>{if(j.drAccount===accountCode)dr+=j.amount;if(j.crAccount===accountCode)cr+=j.amount;});
    const acct=coa.find(a=>a.code===accountCode);
    const signedNet=acct?.class==="R"?cr-dr:dr-cr;
    return signedNet*rate;
  }
  const rows=budget.filter(b=>b.entityId===fEntity&&b.period===fPeriod).map(b=>{
    const actual=getActualMYR(b.accountCode,fPeriod,fEntity);
    const varAbs=actual-b.budgetMYR;
    const acct=coa.find(a=>a.code===b.accountCode);
    const isCost=acct?.class==="X";
    const fav=isCost?varAbs<=0:varAbs>=0;
    return{...b,name:acct?.name||b.accountCode,actual,varAbs,varPct:b.budgetMYR?(varAbs/Math.abs(b.budgetMYR)*100):null,fav};
  });
  const totBud=rows.reduce((s,r)=>s+r.budgetMYR,0);
  const totAct=rows.reduce((s,r)=>s+r.actual,0);
  const chartData=rows.map(r=>({name:r.name.length>16?r.name.slice(0,14)+"…":r.name,Budget:r.budgetMYR,Actual:r.actual}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10,alignItems:"center",background:P.surf2,borderRadius:10,padding:"10px 14px",border:`1px solid ${P.border}`,flexWrap:"wrap"}}>
        <Sel value={fEntity} onChange={setFEntity} style={{width:180}}>{activeE.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</Sel>
        <Sel value={fPeriod} onChange={setFPeriod} style={{width:130}}>{periods.map(p=><option key={p}>{p}</option>)}</Sel>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        <KPI label="Budget"    value={fmtK(totBud)}        color={P.blue}   small/>
        <KPI label="Actual"    value={fmtK(totAct)}        color={P.gold}   small/>
        <KPI label="Variance"  value={fmtK(totAct-totBud)} color={(totAct-totBud)>=0?P.green:P.red} small/>
        <KPI label="Fav Lines" value={rows.filter(r=>r.fav).length} color={P.green} small/>
        <KPI label="Unfav Lines" value={rows.filter(r=>!r.fav&&Math.abs(r.varAbs)>100).length} color={P.red} small/>
      </div>
      {chartData.length>0&&<Card title="Budget vs Actual — Chart">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{top:5,right:20,left:0,bottom:30}}>
            <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
            <XAxis dataKey="name" tick={{fill:P.muted,fontSize:9}} angle={-15} textAnchor="end" interval={0}/>
            <YAxis tick={{fill:P.muted,fontSize:9}} tickFormatter={v=>fmtK(v)}/>
            <Tooltip formatter={v=>fmtMYR(v)} contentStyle={{background:"#1A2235",border:`1px solid ${P.border}`,borderRadius:8,fontSize:11}}/>
            <Legend formatter={v=><span style={{color:P.muted,fontSize:11}}>{v}</span>}/>
            <Bar dataKey="Budget" fill={`${P.surf3}`} stroke={P.blue} strokeWidth={1} radius={[3,3,0,0]}/>
            <Bar dataKey="Actual" fill={P.gold} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>}
      <Card noPad title="Budget vs Actual — Detail">
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{background:P.surf2}}>{["Account","Budget MYR","Actual MYR","Variance","Status"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:["Budget MYR","Actual MYR","Variance"].includes(h)?"right":"left",color:P.muted,borderBottom:`1px solid ${P.border}`,fontSize:10}}>{h}</th>)}</tr></thead>
          <tbody>{rows.length===0?<tr><td colSpan={5} style={{padding:20,textAlign:"center",color:P.muted,fontSize:12}}>No budget data for this period / entity combination.</td></tr>:rows.map((r,i)=>(
            <tr key={r.accountCode} style={{borderBottom:`1px solid ${P.border}20`,background:i%2===0?"transparent":`${P.border}12`}}>
              <td style={{padding:"7px 10px",color:P.text}}>{r.name}</td>
              <td style={{padding:"7px 10px",fontFamily:"monospace",textAlign:"right",color:P.sub}}>{fmtMYR(r.budgetMYR)}</td>
              <td style={{padding:"7px 10px",fontFamily:"monospace",textAlign:"right",color:P.text}}>{fmtMYR(r.actual)}</td>
              <td style={{padding:"7px 10px",fontFamily:"monospace",textAlign:"right",color:r.varAbs>=0?P.green:P.red,fontWeight:600}}>{r.varAbs>=0?"+":""}{fmtMYR(r.varAbs)}</td>
              <td style={{padding:"7px 10px"}}><Badge label={r.fav?"Favourable":"Unfavourable"} color={r.fav?P.green:P.red}/></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

// ── P&L MODULE ─────────────────────────────────────────────────────
function PLModule({gf}){
  const {store}=useStore();
  const {gl,coa,entities,fxRates}=store;
  const periods=fxRates.map(r=>r.period);
  const lastTwo=periods.slice(-2);
  const [cP1,setCP1]=useState(lastTwo[0]||periods[0]||"");
  const [cP2,setCP2]=useState(lastTwo[1]||periods[periods.length-1]||"");
  const activeE=entities.filter(e=>e.active&&gf.entityIds.includes(e.id));
  const eids=activeE.map(e=>e.id);
  function getPL(pds,eids2){
    let rev=0,exp=0;
    eids2.forEach(eid=>{
      const e=entities.find(x=>x.id===eid);const ccy=e?.currency||BASE;
      const rates=pds.map(p=>getFxRate(fxRates,p,ccy));
      const avgR=rates.reduce((a,b)=>a+b,0)/(rates.length||1);
      gl.filter(j=>j.entityId===eid&&pds.includes(j.period)).forEach(j=>{
        const acr=coa.find(a=>a.code===j.crAccount);const adr=coa.find(a=>a.code===j.drAccount);
        if(acr?.class==="R")rev+=j.amount*avgR;if(adr?.class==="R")rev-=j.amount*avgR;
        if(adr?.class==="X")exp+=j.amount*avgR;if(acr?.class==="X")exp-=j.amount*avgR;
      });
    });
    return{rev,exp,profit:rev-exp};
  }
  const pl2=getPL([cP2],eids);const pl1=getPL([cP1],eids);
  const trend=periods.map(p=>{const t=getPL([p],eids);return{period:p,Revenue:t.rev,Expenses:t.exp,Profit:t.profit};}).filter(d=>d.Revenue>0||d.Profit>0);
  const gpM=pl2.rev>0?(pl2.profit/pl2.rev*100):0;
  const revGrowth=pl1.rev>0?((pl2.rev-pl1.rev)/pl1.rev*100):0;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <Sel value={cP1} onChange={setCP1} style={{width:130}}>{periods.map(p=><option key={p}>{p}</option>)}</Sel>
        <span style={{color:P.muted}}>vs</span>
        <Sel value={cP2} onChange={setCP2} style={{width:130}}>{periods.map(p=><option key={p}>{p}</option>)}</Sel>
        <div style={{marginLeft:"auto",display:"flex",gap:12,fontSize:11,color:P.muted}}>
          <span>GP: <span style={{color:gpM>30?P.green:gpM>0?P.gold:P.red,fontWeight:700}}>{gpM.toFixed(1)}%</span></span>
          <span>Growth: <span style={{color:revGrowth>=0?P.green:P.red,fontWeight:700}}>{revGrowth>=0?"+":""}{revGrowth.toFixed(1)}%</span></span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        <KPI label="Revenue"       value={fmtK(pl2.rev)}    color={P.green}  accent={P.green}  small sub={`Prior: ${fmtK(pl1.rev)}`}/>
        <KPI label="Expenses"      value={fmtK(pl2.exp)}    color={P.orange} accent={P.orange} small sub={`Prior: ${fmtK(pl1.exp)}`}/>
        <KPI label="Net Profit"    value={fmtK(pl2.profit)}  color={pl2.profit>=0?P.green:P.red} accent={pl2.profit>=0?P.green:P.red} small sub={gpM.toFixed(1)+" % margin"}/>
        <KPI label="Revenue Growth" value={(revGrowth>=0?"+":"")+revGrowth.toFixed(1)+"%" } color={revGrowth>=0?P.green:P.red} small/>
      </div>
      <Card title="Revenue, Expenses & Profit — All Periods">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend} margin={{top:5,right:20,left:0,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
            <XAxis dataKey="period" tick={{fill:P.muted,fontSize:10}}/>
            <YAxis tick={{fill:P.muted,fontSize:9}} tickFormatter={v=>fmtK(v)}/>
            <Tooltip formatter={v=>fmtMYR(v)} contentStyle={{background:"#1A2235",border:`1px solid ${P.border}`,borderRadius:8,fontSize:11}}/>
            <Legend formatter={v=><span style={{color:P.muted,fontSize:11}}>{v}</span>}/>
            <Line type="monotone" dataKey="Revenue"  stroke={P.green}  strokeWidth={2} dot={{r:3}}/>
            <Line type="monotone" dataKey="Expenses" stroke={P.orange} strokeWidth={2} dot={{r:3}}/>
            <Line type="monotone" dataKey="Profit"   stroke={P.gold}   strokeWidth={2} dot={{r:3}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title={`Period Comparison — ${cP1} vs ${cP2}`}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[[cP1,pl1],[cP2,pl2]].map(([p,pl])=>(
            <div key={p} style={{background:P.surf2,borderRadius:9,padding:"14px"}}>
              <div style={{color:P.gold,fontSize:10,fontWeight:700,letterSpacing:2,marginBottom:10}}>{p}</div>
              {[["Revenue",pl.rev,P.green],["Expenses",pl.exp,P.orange],["Net Profit",pl.profit,pl.profit>=0?P.green:P.red]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${P.border}20`}}>
                  <span style={{color:P.sub,fontSize:11}}>{l}</span>
                  <span style={{fontFamily:"monospace",color:c,fontWeight:700,fontSize:12}}>{fmtMYR(v)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",marginTop:4}}>
                <span style={{color:P.muted,fontSize:10}}>NP Margin</span>
                <span style={{color:P.gold,fontSize:11,fontFamily:"monospace"}}>{pl.rev>0?(pl.profit/pl.rev*100).toFixed(1)+"%":"—"}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── BALANCE SHEET ──────────────────────────────────────────────────
function BSModule({gf}){
  const {store}=useStore();
  const {gl,coa,entities,fxRates}=store;
  const periods=fxRates.map(r=>r.period);
  const [curP,setCurP]=useState(periods[periods.length-1]||"");
  const activeE=entities.filter(e=>e.active&&gf.entityIds.includes(e.id));
  const eids=activeE.map(e=>e.id);
  function getBalance(code,upTo,eids2){
    const allP=periods.filter(p=>p<=upTo);let dr=0,cr=0;
    eids2.forEach(eid=>{const e=entities.find(x=>x.id===eid);const rate=getFxRate(fxRates,upTo,e?.currency||BASE);
      gl.filter(j=>j.entityId===eid&&allP.includes(j.period)).forEach(j=>{if(j.drAccount===code)dr+=j.amount*rate;if(j.crAccount===code)cr+=j.amount*rate;});
    });return dr-cr;
  }
  const totA=["1000","1100","1500"].reduce((s,c)=>s+Math.max(0,getBalance(c,curP,eids)),0);
  const totL=["2000","2100"].reduce((s,c)=>s+Math.max(0,-getBalance(c,curP,eids)),0);
  const totE=["3000","3100"].reduce((s,c)=>s+Math.max(0,-getBalance(c,curP,eids)),0);
  const trend=periods.map(p=>{
    const a=["1000","1100","1500"].reduce((s,c)=>s+Math.max(0,getBalance(c,p,eids)),0);
    const l=["2000","2100"].reduce((s,c)=>s+Math.max(0,-getBalance(c,p,eids)),0);
    return{period:p,Assets:a,Liabilities:l,Equity:a-l};
  }).filter(d=>d.Assets>0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10,alignItems:"center",background:P.surf2,borderRadius:10,padding:"10px 14px",border:`1px solid ${P.border}`,flexWrap:"wrap"}}>
        <span style={{color:P.muted,fontSize:11}}>As at</span>
        <Sel value={curP} onChange={setCurP} style={{width:140}}>{periods.map(p=><option key={p}>{p}</option>)}</Sel>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        <KPI label="Total Assets"      value={fmtK(totA)} color={P.blue}   accent={P.blue}   small/>
        <KPI label="Total Liabilities" value={fmtK(totL)} color={P.orange} accent={P.orange} small/>
        <KPI label="Net Assets"        value={fmtK(totA-totL)} color={P.purple} accent={P.purple} small sub="Assets − Liabilities"/>
      </div>
      <Card title="Balance Sheet Structure — Trend">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={trend} margin={{top:5,right:20,left:0,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
            <XAxis dataKey="period" tick={{fill:P.muted,fontSize:10}}/>
            <YAxis tick={{fill:P.muted,fontSize:9}} tickFormatter={v=>fmtK(v)}/>
            <Tooltip formatter={v=>fmtMYR(v)} contentStyle={{background:"#1A2235",border:`1px solid ${P.border}`,borderRadius:8,fontSize:11}}/>
            <Legend formatter={v=><span style={{color:P.muted,fontSize:11}}>{v}</span>}/>
            <Bar dataKey="Assets"      fill={P.blue}   radius={[3,3,0,0]}/>
            <Bar dataKey="Liabilities" fill={P.orange} radius={[3,3,0,0]}/>
            <Bar dataKey="Equity"      fill={P.purple} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ── CASH FLOW MODULE ───────────────────────────────────────────────
function CashFlowModule({gf}){
  const {store}=useStore();
  const {gl,coa,entities,fxRates,ar,ap}=store;
  const periods=fxRates.map(r=>r.period);
  const [fPeriod,setFPeriod]=useState(periods[periods.length-1]||"");
  const activeE=entities.filter(e=>e.active&&gf.entityIds.includes(e.id));
  const eids=activeE.map(e=>e.id);
  const spotRow=fxRates[fxRates.length-1]||{};
  const toR=(a,c)=>toRM(spotRow,a,c);
  function getGL(code,period2){
    let dr=0,cr=0;eids.forEach(eid=>{const e=entities.find(x=>x.id===eid);const rate=getFxRate(fxRates,period2,e?.currency||BASE);
      gl.filter(j=>j.entityId===eid&&j.period===period2).forEach(j=>{if(j.drAccount===code)dr+=j.amount*rate;if(j.crAccount===code)cr+=j.amount*rate;});
    });return dr-cr;
  }
  const rev=coa.filter(a=>a.class==="R"&&a.active).reduce((s,a)=>s-getGL(a.code,fPeriod),0);
  const exp=coa.filter(a=>a.class==="X"&&a.active).reduce((s,a)=>s+getGL(a.code,fPeriod),0);
  const netProfit=rev-exp;
  const deprn=getGL("5300",fPeriod);
  const arBal=ar.filter(r=>gf.entityIds.includes(r.entityId)&&r.status!=="Paid").reduce((s,r)=>s+toR(r.amount,r.currency),0);
  const apBal=ap.filter(r=>gf.entityIds.includes(r.entityId)&&r.status!=="Paid").reduce((s,r)=>s+toR(r.amount,r.currency),0);
  const opCF=netProfit+deprn;
  const cfData=[
    {name:"Net Profit",value:netProfit,color:netProfit>=0?P.green:P.red},
    {name:"+ Depreciation",value:deprn,color:P.blue},
    {name:"Operating CF",value:opCF,color:opCF>=0?P.green:P.red},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10,alignItems:"center",background:P.surf2,borderRadius:10,padding:"10px 14px",border:`1px solid ${P.border}`}}>
        <Sel value={fPeriod} onChange={setFPeriod} style={{width:140}}>{periods.map(p=><option key={p}>{p}</option>)}</Sel>
        <span style={{color:P.muted,fontSize:10}}>Method: Indirect</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        <KPI label="Net Profit"      value={fmtK(netProfit)} color={netProfit>=0?P.green:P.red} small/>
        <KPI label="+ Depreciation"  value={fmtK(deprn)}     color={P.blue}   small/>
        <KPI label="Operating CF"    value={fmtK(opCF)}       color={opCF>=0?P.green:P.red} small/>
        <KPI label="AR Outstanding"  value={fmtK(arBal)}      color={P.gold}   small/>
        <KPI label="AP Outstanding"  value={fmtK(apBal)}      color={P.mag}    small/>
      </div>
      <Card title="Cash Flow Bridge">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={cfData} margin={{top:5,right:20,left:0,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
            <XAxis dataKey="name" tick={{fill:P.muted,fontSize:10}}/>
            <YAxis tick={{fill:P.muted,fontSize:9}} tickFormatter={v=>fmtK(v)}/>
            <ReferenceLine y={0} stroke={P.muted}/>
            <Tooltip formatter={v=>fmtMYR(v)} contentStyle={{background:"#1A2235",border:`1px solid ${P.border}`,borderRadius:8,fontSize:11}}/>
            <Bar dataKey="value" radius={[4,4,0,0]}>{cfData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="What drives the gap? (Working Capital)">
        <div style={{fontSize:11,color:P.sub,lineHeight:1.7}}>
          <strong style={{color:P.gold}}>AR outstanding: {fmtK(arBal)}</strong> — cash owed by customers, not yet collected. Chase overdue items to improve cash position.<br/>
          <strong style={{color:P.mag}}>AP outstanding: {fmtK(apBal)}</strong> — bills pending payment to suppliers.<br/>
          <strong style={{color:P.green}}>Net working capital: {fmtK(arBal-apBal)}</strong> — higher is better for liquidity.
        </div>
      </Card>
    </div>
  );
}

// ── FX MODULE ──────────────────────────────────────────────────────
function FXModule(){
  const {store}=useStore();
  const {fxRates}=store;
  const rebased=fxRates.map(r=>{const m=r.MYR;if(!m)return{period:r.period};return{period:r.period,SGD:+(r.SGD/m).toFixed(4),USD:+(1/m).toFixed(4),PHP:+(r.PHP/m).toFixed(4)};});
  const last=rebased[rebased.length-1]||{};const prev=rebased[rebased.length-2]||last;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        {["SGD","USD","PHP"].map(c=>{const v=last[c];const p=prev[c];const chg=p&&v?((v-p)/p*100):null;return(<KPI key={c} label={`${c}/MYR`} value={v?.toFixed(4)||"—"} color={CCY_CLR[c]} accent={CCY_CLR[c]} small sub={chg!=null?(chg>=0?"▲":"▼")+Math.abs(chg).toFixed(2)+"% MoM":""}/>);})}
      </div>
      <Card title="FX Trend — SGD, USD, PHP vs MYR">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rebased} margin={{top:5,right:20,left:0,bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
            <XAxis dataKey="period" tick={{fill:P.muted,fontSize:10}}/>
            <YAxis tick={{fill:P.muted,fontSize:9}}/>
            <Tooltip contentStyle={{background:"#1A2235",border:`1px solid ${P.border}`,borderRadius:8,fontSize:11}}/>
            <Legend formatter={v=><span style={{color:CCY_CLR[v]||P.muted,fontSize:11}}>{v}/MYR</span>}/>
            {["SGD","USD","PHP"].map(c=><Line key={c} type="monotone" dataKey={c} stroke={CCY_CLR[c]||P.muted} strokeWidth={2} dot={{r:2}}/>)}
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card noPad title="Rate Table — X per 1 MYR">
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:P.surf2}}><th style={{padding:"7px 10px",textAlign:"left",color:P.muted,borderBottom:`1px solid ${P.border}`,fontSize:10}}>Period</th>{["SGD","USD","PHP"].map(c=><th key={c} style={{padding:"7px 10px",textAlign:"right",color:CCY_CLR[c],borderBottom:`1px solid ${P.border}`,fontSize:10}}>{c}/MYR</th>)}</tr></thead>
            <tbody>{rebased.map((r,i)=>(<tr key={r.period} style={{borderBottom:`1px solid ${P.border}20`,background:i%2===0?"transparent":`${P.border}12`}}><td style={{padding:"6px 10px",fontFamily:"monospace",color:P.sub,fontSize:11}}>{r.period}</td>{["SGD","USD","PHP"].map(c=><td key={c} style={{padding:"6px 10px",fontFamily:"monospace",textAlign:"right",color:P.text}}>{r[c]?.toFixed(4)||"—"}</td>)}</tr>))}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── AI INSIGHTS MODULE (PUTER.JS) ──────────────────────────────────
function AIInsightsModule(){
  const {store}=useStore();
  const [prompt,setPrompt]=React.useState("");
  const [response,setResponse]=React.useState("");
  const [loading,setLoading]=React.useState(false);
  const [history,setHistory]=React.useState([]);

  const SUGGESTIONS=[
    "Summarise the overall financial health of the group",
    "Which entity has the highest AR overdue risk?",
    "What are the top 3 budget variances I should investigate?",
    "How is the SGD/MYR rate trend affecting our Singapore office costs?",
    "Give me a cash flow outlook for next quarter",
  ];

  async function ask(q){
    const question=q||prompt;
    if(!question.trim())return;
    setLoading(true);
    setResponse("");
    const newHistory=[...history,{role:"user",content:question}];
    setHistory(newHistory);
    setPrompt("");

    // Build context from store
    const ctx=`
You are FinFlow AI, a financial analysis assistant for a multi-entity business.
Current entities: Malaysia HQ (MYR), Singapore Office (SGD), Philippines Branch (PHP).
Report period: Jan–Dec 2024.

Key figures:
- Total Revenue: MYR 4.2M (consolidated)
- Total Expenses: MYR 3.1M
- Net Profit: MYR 1.1M
- AR Outstanding: MYR ${(store.arRecords||[]).filter(r=>r.status!=="Paid").reduce((s,r)=>s+r.amount,0).toLocaleString()}
- AP Outstanding: MYR ${(store.apRecords||[]).filter(r=>r.status!=="Paid").reduce((s,r)=>s+r.amount,0).toLocaleString()}
- Open Sales Pipeline: MYR ${(store.salesPipeline||[]).filter(r=>r.stage!=="Won"&&r.stage!=="Lost").reduce((s,r)=>s+(r.value||0),0).toLocaleString()}

This is DEMO mode with mock data. Provide concise, insightful analysis. Use bullet points where helpful.
Keep responses under 200 words unless asked for detail.
    `.trim();

    try{
      // Puter.js AI — free, no API key required
      if(typeof puter==="undefined"||!puter?.ai?.chat){
        throw new Error("Puter.js not loaded");
      }
      const msgs=[
        {role:"system",content:ctx},
        ...newHistory
      ];
      const res=await puter.ai.chat(msgs,{model:"gpt-4o-mini"});
      const text=typeof res==="string"?res:(res?.message?.content||res?.content||JSON.stringify(res));
      setResponse(text);
      setHistory([...newHistory,{role:"assistant",content:text}]);
    }catch(e){
      // Fallback mock response for demo without Puter
      const fallbacks={
        "health":"**Group Financial Health — Demo Summary**\n\n• Revenue on track at MYR 4.2M vs budget MYR 4.0M (+5%)\n• Net margin 26% — healthy for a consulting/services group\n• Malaysia HQ is the main profit centre; Singapore Office cost-heavy\n• Philippines Branch showing growth momentum in Q4\n\n**Watch:** AR overdue balances — collect within 30 days to maintain cash position.",
        "ar":"**AR Overdue Risk by Entity**\n\n• **Malaysia HQ** — highest exposure with 3 invoices >60 days\n• Singapore Office — 1 invoice at 45 days, low risk\n• Philippines Branch — all within terms\n\n**Recommended action:** Chase MYR 85K from Acme Corp and MYR 52K from Beta Solutions immediately.",
        "budget":"**Top 3 Budget Variances**\n\n1. **Salaries & Benefits** — 8% over budget (MYR +42K). Review headcount plan.\n2. **Marketing** — 22% under spend. Accelerate BD campaigns in Q4.\n3. **Travel & Entertainment** — 15% over. Set per-entity travel caps.\n\nOverall OpEx running 3% above plan — manageable but monitor monthly.",
        "sgd":"**SGD/MYR Impact on Singapore Office**\n\n• SGD strengthened ~2.1% vs MYR in H2 2024\n• Singapore Office costs in MYR terms increased by approx MYR 18K\n• Revenue booked in SGD translates favourably when remitted to HQ\n\n**Net FX impact: slight positive** — SGD revenue gain outweighs cost increase.",
        "cash":"**Cash Flow Outlook — Q1 2025**\n\n• Operating cash inflow projected MYR 280K (based on pipeline + AR collection)\n• Key risk: MYR 120K AP due in Jan — ensure collections precede payments\n• Sales pipeline has MYR 650K at proposal stage — 40% probability = MYR 260K potential\n\n**Recommendation:** Accelerate AR collection and delay discretionary capex to Q2."
      };
      const key=Object.keys(fallbacks).find(k=>question.toLowerCase().includes(k))||"health";
      const fallback=fallbacks[key];
      setResponse(fallback);
      setHistory([...newHistory,{role:"assistant",content:fallback}]);
    }
    setLoading(false);
  }

  function clearChat(){setHistory([]);setResponse("");setPrompt("");}

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Demo notice */}
      <div style={{background:`${P.gold}18`,border:`1px solid ${P.gold}40`,borderRadius:8,padding:"10px 14px",fontSize:11,color:P.gold}}>
        ⚡ <strong>Demo AI:</strong> Powered by Puter.js (free, no API key). In production, FinFlow uses Anthropic Claude for deeper analysis on your real data.
      </div>

      {/* Suggestions */}
      {history.length===0&&(
        <Card title="Quick Questions">
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {SUGGESTIONS.map((s,i)=>(
              <button key={i} onClick={()=>ask(s)}
                style={{background:P.surf2,border:`1px solid ${P.border}`,borderRadius:6,padding:"9px 12px",
                  color:P.sub,fontSize:12,textAlign:"left",cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.target.style.borderColor=P.gold;e.target.style.color=P.text;}}
                onMouseLeave={e=>{e.target.style.borderColor=P.border;e.target.style.color=P.sub;}}>
                💡 {s}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Chat history */}
      {history.length>0&&(
        <Card title="Conversation" action={<button onClick={clearChat} style={{background:"transparent",border:`1px solid ${P.border}`,borderRadius:5,padding:"3px 10px",color:P.muted,fontSize:11,cursor:"pointer"}}>Clear</button>}>
          <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:400,overflowY:"auto"}}>
            {history.map((m,i)=>(
              <div key={i} style={{
                alignSelf:m.role==="user"?"flex-end":"flex-start",
                maxWidth:"85%",
                background:m.role==="user"?`${P.gold}20`:P.surf2,
                border:`1px solid ${m.role==="user"?P.gold+"40":P.border}`,
                borderRadius:8,padding:"9px 12px",fontSize:12,color:P.text,lineHeight:1.6,
                whiteSpace:"pre-wrap"
              }}>
                {m.role==="assistant"&&<div style={{fontSize:10,color:P.gold,marginBottom:4}}>FinFlow AI</div>}
                {m.content}
              </div>
            ))}
            {loading&&(
              <div style={{alignSelf:"flex-start",background:P.surf2,border:`1px solid ${P.border}`,borderRadius:8,padding:"9px 12px",fontSize:12,color:P.muted}}>
                <span style={{animation:"pulse 1s infinite"}}>Analysing...</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Input */}
      <Card>
        <div style={{display:"flex",gap:8}}>
          <input value={prompt} onChange={e=>setPrompt(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&ask()}
            placeholder="Ask about your financials… (e.g. What is our cash runway?)"
            style={{flex:1,background:P.surf2,border:`1px solid ${P.border}`,borderRadius:6,
              padding:"9px 12px",color:P.text,fontSize:12,outline:"none"}}/>
          <button onClick={()=>ask()} disabled={loading||!prompt.trim()}
            style={{background:P.gold,color:"#000",border:"none",borderRadius:6,padding:"9px 16px",
              fontSize:12,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?0.6:1}}>
            {loading?"…":"Ask"}
          </button>
        </div>
        {history.length>0&&(
          <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
            {SUGGESTIONS.slice(0,3).map((s,i)=>(
              <button key={i} onClick={()=>ask(s)}
                style={{background:"transparent",border:`1px solid ${P.border}`,borderRadius:4,
                  padding:"4px 8px",color:P.muted,fontSize:10,cursor:"pointer"}}>
                {s.slice(0,40)}…
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── ROOT COMPONENT ──────────────────────────────────────────────────
const NAV_ITEMS=[
  {id:"overview",label:"Overview",icon:"◈"},
  {id:"sales",label:"Sales Pipeline",icon:"◎"},
  {id:"arap",label:"AR / AP",icon:"◑"},
  {id:"budget",label:"Budget vs Actual",icon:"◧"},
  {id:"pl",label:"P&L",icon:"▦"},
  {id:"bs",label:"Balance Sheet",icon:"▤"},
  {id:"cashflow",label:"Cash Flow",icon:"◉"},
  {id:"fx",label:"FX Rates",icon:"◈"},
  {id:"ai",label:"AI Biz Insight",icon:"✦"},
];

function Shell({children,nav,setNav,onLogout,user}){
  const [sideOpen,setSideOpen]=React.useState(true);
  return(
    <div style={{display:"flex",height:"100vh",background:P.bg,color:P.text,fontFamily:"'Inter',system-ui,sans-serif",overflow:"hidden"}}>
      {/* DEMO BANNER */}
      {IS_DEMO&&(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,
          background:"linear-gradient(90deg,#B8860B,#DAA520,#B8860B)",
          color:"#000",fontSize:11,fontWeight:700,textAlign:"center",padding:"4px 0",
          letterSpacing:1}}>
          ⚠ DEMO MODE — Mock data only. <span style={{fontWeight:400}}>For evaluation purposes.</span>
        </div>
      )}
      {/* SIDEBAR */}
      <div style={{width:sideOpen?200:52,minWidth:sideOpen?200:52,background:P.surf,
        borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",
        transition:"width 0.2s",overflow:"hidden",paddingTop:IS_DEMO?26:0,flexShrink:0}}>
        {/* Logo area */}
        <div style={{padding:"14px 12px",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,background:`linear-gradient(135deg,${P.gold},${P.gold}88)`,
            borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:14,fontWeight:800,color:"#000",flexShrink:0}}>F</div>
          {sideOpen&&<div>
            <div style={{fontSize:13,fontWeight:700,color:P.text,lineHeight:1}}>FinFlow{IS_DEMO?" Demo":""}</div>
            {IS_DEMO&&<div style={{fontSize:9,color:P.gold,fontWeight:600,letterSpacing:0.5}}>DEMO MODE</div>}
          </div>}
          <button onClick={()=>setSideOpen(v=>!v)}
            style={{marginLeft:"auto",background:"transparent",border:"none",color:P.muted,
              cursor:"pointer",fontSize:14,padding:2,flexShrink:0}}>
            {sideOpen?"◁":"▷"}
          </button>
        </div>
        {/* Nav */}
        <nav style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
          {NAV_ITEMS.map(n=>(
            <button key={n.id} onClick={()=>setNav(n.id)}
              title={!sideOpen?n.label:undefined}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,
                padding:sideOpen?"9px 14px":"9px 0",justifyContent:sideOpen?"flex-start":"center",
                background:nav===n.id?`${P.gold}18`:"transparent",
                border:"none",borderLeft:nav===n.id?`3px solid ${P.gold}`:"3px solid transparent",
                color:nav===n.id?P.gold:P.sub,fontSize:12,cursor:"pointer",
                transition:"all 0.15s",textAlign:"left"}}>
              <span style={{fontSize:14,flexShrink:0}}>{n.icon}</span>
              {sideOpen&&<span>{n.label}</span>}
            </button>
          ))}
        </nav>
        {/* User */}
        {sideOpen&&(
          <div style={{padding:"10px 12px",borderTop:`1px solid ${P.border}`,fontSize:11}}>
            <div style={{color:P.sub,marginBottom:4}}>Signed in as</div>
            <div style={{color:P.text,fontWeight:600,marginBottom:6}}>{user?.name||"Admin"}</div>
            <button onClick={onLogout}
              style={{background:"transparent",border:`1px solid ${P.border}`,borderRadius:4,
                padding:"4px 10px",color:P.muted,fontSize:10,cursor:"pointer",width:"100%"}}>
              Sign Out
            </button>
          </div>
        )}
      </div>
      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",paddingTop:IS_DEMO?26:0}}>
        {/* Top bar */}
        <div style={{background:P.surf,borderBottom:`1px solid ${P.border}`,
          padding:"10px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{flex:1}}>
            <h2 style={{margin:0,fontSize:15,fontWeight:700,color:P.text}}>
              {NAV_ITEMS.find(n=>n.id===nav)?.label||""}
            </h2>
          </div>
          <GlobalFilters/>
          {IS_DEMO&&(
            <div style={{background:`${P.gold}20`,border:`1px solid ${P.gold}40`,
              borderRadius:4,padding:"3px 8px",fontSize:10,color:P.gold,fontWeight:600}}>
              DEMO
            </div>
          )}
        </div>
        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:16}}>
          {children}
        </div>
      </div>
    </div>
  );
}

function FinFlowRoot(){
  const {store,dispatch}=useStore();
  const [nav,setNav]=React.useState("overview");

  function handleLogin(creds){
    const valid=IS_DEMO
      ?creds.user===DEMO_CREDENTIALS.username&&creds.pass===DEMO_CREDENTIALS.password
      :creds.user==="admin"&&creds.pass==="FinFlow2025!";
    if(valid){
      dispatch({type:"SET_USER",payload:{name:"Demo Admin",role:"admin"}});
    }else{
      alert("Invalid credentials");
    }
  }

  function handleLogout(){
    dispatch({type:"SET_USER",payload:null});
    setNav("overview");
  }

  if(!store.user){
    return(
      <div style={{paddingTop:IS_DEMO?26:0}}>
        {IS_DEMO&&(
          <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,
            background:"linear-gradient(90deg,#B8860B,#DAA520,#B8860B)",
            color:"#000",fontSize:11,fontWeight:700,textAlign:"center",padding:"4px 0",letterSpacing:1}}>
            ⚠ DEMO MODE — Mock data only. For evaluation purposes.
          </div>
        )}
        <LoginScreen onLogin={handleLogin}/>
      </div>
    );
  }

  const MODULE_MAP={
    overview:<OverviewModule/>,
    sales:<SalesModule/>,
    arap:<ARAPModule/>,
    budget:<BudgetModule/>,
    pl:<PLModule/>,
    bs:<BalanceSheetModule/>,
    cashflow:<CashFlowModule/>,
    fx:<FXModule/>,
    ai:<AIInsightsModule/>,
  };

  return(
    <Shell nav={nav} setNav={setNav} onLogout={handleLogout} user={store.user}>
      {MODULE_MAP[nav]||<OverviewModule/>}
    </Shell>
  );
}

// ── APP ENTRY ───────────────────────────────────────────────────────
export default function App(){
  return(
    <StoreProvider>
      <FinFlowRoot/>
    </StoreProvider>
  );
}
