import React, { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AuthScreen, { useSession, SignOutButton } from "./Auth";
import {
  Mic, ScanLine, PenLine, Sparkles, Send, Leaf, Clock, MessageCircle,
  Mail, Link2 as Linkedin, Check, ArrowRight, RefreshCw, Sprout, Flower2, Circle,
  Search, ChevronDown, MapPin, Lightbulb, Pencil, Plus, X, Wand2,
  MessageSquare, ChevronLeft, Phone, Video, MoreVertical, Paperclip, Smile,
  Square, CheckSquare, Trash2, CalendarPlus, Bell, Info, Handshake
} from "lucide-react";

const INK = "#1B1D16";
const PAPER = "#F1ECDD";
const MOSS = "#2F4A3C";
const OCHRE = "#B8863B";
const CLAY = "#A6462F";
const SAND = "#DFD4B4";

const steps = [
  { id: 1, label: "Capture" },
  { id: 2, label: "Extract" },
  { id: 3, label: "Angles" },
  { id: 4, label: "Compose" },
  { id: 5, label: "Cultivate" },
  { id: 6, label: "Impact" },
];

const initialAngles = [
  {
    id: "a",
    title: "Send the indemnification case note",
    reasoning: "You promised her your case note on indemnification clauses right after the negotiation sim — specific, already expected, easy to send.",
    source: "ai",
  },
  {
    id: "b",
    title: "Ask how the antitrust clearance went",
    reasoning: "She mentioned her deal needed Brazilian antitrust clearance. Following up on the specific stake shows you were actually listening.",
    source: "ai",
  },
  {
    id: "c",
    title: "Propose a working coffee",
    reasoning: "Lowest-effort, general-purpose. Use only if the first two don't fit — it doesn't reference anything specific to the conversation.",
    source: "ai",
  },
];

const morePool = [
  {
    id: "d",
    title: "Offer to swap course outlines",
    reasoning: "She's cross-registered into Torts for the liability angle, you're doing the same with M&A — trading outlines is low-effort and genuinely useful to both.",
    source: "ai",
  },
  {
    id: "e",
    title: "Suggest co-writing a note on the overlap",
    reasoning: "Deal risk-allocation and tort liability keep intersecting in your conversations — a short co-authored note could be a real output, not just small talk.",
    source: "ai",
  },
  {
    id: "f",
    title: "Invite her to the study group before finals",
    reasoning: "You're both cross-registered across each other's subjects — a shared study session covers more ground than either of you prepping alone.",
    source: "ai",
  },
];

const platformCopy = {
  whatsapp: {
    icon: MessageCircle,
    label: "WhatsApp",
    tone: "Short, warm, one link, no subject line.",
    text: "Hey Elena! Great being grouped with you for the negotiation sim — here's that indemnification case note I mentioned: [link]. How did the antitrust clearance go on your deal?",
  },
  sms: {
    icon: MessageSquare,
    label: "SMS",
    tone: "Shortest of all, no link previews assumed, no emoji-heavy tone.",
    text: "Hi Elena, Gerald here from the negotiation sim group. Sending the indemnification case note by email — let me know how the antitrust clearance goes.",
  },
  email: {
    icon: Mail,
    label: "Email",
    tone: "Full sentences, clear ask, easy to forward internally.",
    text: "Subject: Following up from the negotiation sim — indemnification case note\n\nHi Elena,\n\nGood being paired with you for the negotiation simulation. Between that and comparing notes at the Torts seminar and your M&A workshop, it's been a good week of overlap between our two tracks.\n\nAttaching the case note on indemnification clauses I mentioned — curious how the Brazilian antitrust clearance is going on the deal you described.\n\nBest,\nGerald",
  },
  linkedin: {
    icon: Linkedin,
    label: "LinkedIn",
    tone: "Public-adjacent, credibility-forward, no attachments.",
    text: "Great being paired with you for our cohort's negotiation simulation, Elena — really enjoyed hearing about the cross-border M&A work in S\u00e3o Paulo. Sent over that indemnification case note, thought it might be useful for the deal risk-allocation piece.",
  },
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function hoursSinceContact(c) {
  if (!c.timeline || c.timeline.length === 0) return 9999;
  const latest = c.timeline.reduce((max, t) => (t.dateISO > max ? t.dateISO : max), c.timeline[0].dateISO);
  return Math.max(0, (Date.now() - new Date(latest + "T00:00:00").getTime()) / 36e5);
}

function buildSeedContacts() {
  return [
  {
    name: "Elena Duarte",
    context: "Berkeley Executive LLM cohort · M&A, S\u00e3o Paulo",
    phone: "+55 11 98765 4321",
    email: "elena.duarte@lawfirm.com.br",
    linkedin: "linkedin.com/in/elena-duarte",
    stage: "sprout",
    timeline: [
      { id: "w1", dateISO: daysAgo(5), place: "Torts Seminar, Berkeley Law", note: "Cross-registered from her M&A track for the cross-border liability angle. Sharp on deal-risk allocation.", manual: false },
      { id: "w2", dateISO: daysAgo(3), place: "M&A Case Study Workshop", note: "Sat in on her workshop — walked through a cross-border acquisition needing Brazilian antitrust clearance.", manual: false },
      { id: "w3", dateISO: daysAgo(1), place: "Cohort Negotiation Simulation", note: "Paired together in the exercise. Promised her a case note on indemnification clauses after.", manual: false },
      { id: "w4", dateISO: daysAgo(1), place: "Follow-up · WhatsApp", note: "Sent the indemnification case note as promised.", manual: false },
    ],
    todos: [
      { id: "wt1", text: "If she replies, ask how the antitrust clearance went on her deal.", done: false },
    ],
  },
  {
    name: "David O.",
    context: "Y Combinator visit · fintech founder",
    phone: "+1 415 555 0138",
    email: "david@fintechco.io",
    linkedin: "linkedin.com/in/david-o",
    stage: "seed",
    timeline: [
      { id: "d1", dateISO: daysAgo(2), place: "YC office, Potrero Hill", note: "Building a lending product on M-Pesa rails, raising a seed round in Q4.", manual: false },
    ],
    todos: [
      { id: "dt1", text: "Send something on the FIFI investment structure before this goes cold.", done: false },
    ],
  },
  {
    name: "Amara N.",
    context: "Berkeley Executive LLM cohort · Accra",
    phone: "+233 24 123 4567",
    email: "amara.n@lawfirm.com.gh",
    linkedin: "linkedin.com/in/amara-n",
    stage: "budding",
    timeline: [
      { id: "a1", dateISO: daysAgo(90), place: "Cohort orientation picnic, Cesar Chavez Park", note: "Runs fintech regulation practice in Accra. Traded notes on cross-border data flows.", manual: false },
      { id: "a2", dateISO: daysAgo(45), place: "Thursday rally, after IP class", note: "Pushed back on Prof. Syed's patent-eligibility framework — thinks it under-serves African filers at ARIPO.", manual: false },
      { id: "a3", dateISO: daysAgo(10), place: "Cohort weekend trip, Napa", note: "Presenting at AfricaTech Accra in March. Asked for an intro to KIPI contacts.", manual: false },
    ],
    todos: [
      { id: "at1", text: "Ask how the AfricaTech talk went before next Thursday.", done: false },
      { id: "at2", text: "Send the KIPI contact intro she asked for.", done: false },
      { id: "at3", text: "Congratulate her on the AfricaTech invite.", done: true },
    ],
  },
  {
    name: "Peter M.",
    context: "KKN diaspora BBQ · SACCO diaspora desk",
    phone: "+1 202 555 0172",
    email: "peter.m@diasporasacco.com",
    linkedin: "linkedin.com/in/peter-m",
    stage: "bloom",
    timeline: [
      { id: "p1", dateISO: daysAgo(60), place: "Urafiki BBQ, diaspora legal desk launch", note: "Runs a diaspora SACCO remittance product, wants compliance review.", manual: false },
      { id: "p2", dateISO: daysAgo(50), place: "Follow-up · Email", note: "Sent the diaspora services sheet and a proposed scope.", manual: false },
      { id: "p3", dateISO: daysAgo(30), place: "Call scheduled", note: "Kickoff meeting booked for the compliance review.", manual: false },
    ],
    todos: [
      { id: "pt1", text: "Bring the ARO fee schedule to the engagement letter.", done: false },
      { id: "pt2", text: "Send the calendar invite for kickoff.", done: true },
    ],
  },
  ];
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const initialNudges = [
  { id: "n0", type: "capture", source: "calendar", text: "Your \"Thursday IP class\" just ended — capture anyone new before it fades." },
  { id: "n1", type: "todo", contact: "David O.", text: "It's been 21 hours since YC — send the FIFI note before this goes cold." },
  { id: "n2", type: "todo", contact: "Amara N.", text: "Her AfricaTech talk was likely this week — worth asking how it went before Thursday." },
  { id: "n3", type: "todo", contact: "Peter M.", text: "Kickoff call is booked — confirm you've got the ARO fee schedule ready." },
];

const stageMeta = {
  seed: { icon: Circle, color: SAND, textColor: INK, label: "Seed — captured", verified: "Logged automatically on capture" },
  sprout: { icon: Sprout, color: OCHRE, textColor: "#fff", label: "Sprout — first reach-out sent", verified: "Logged automatically when you push a message" },
  budding: { icon: Leaf, color: MOSS, textColor: "#fff", label: "Budding — exchange under way", verified: "Confirmed by you — email replies can be verified, WhatsApp/SMS/LinkedIn can't" },
  bloom: { icon: Flower2, color: CLAY, textColor: "#fff", label: "Bloom — meeting booked", verified: "Verified against your calendar" },
};

function FreshnessRing({ hours }) {
  const pct = Math.max(0, 1 - hours / 72);
  const angle = pct * 360;
  const urgent = hours > 48;
  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: 44, height: 44,
        background: `conic-gradient(${urgent ? CLAY : OCHRE} ${angle}deg, ${SAND} ${angle}deg)`,
      }}
    >
      <div className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: PAPER }}>
        <Clock size={14} color={urgent ? CLAY : MOSS} />
      </div>
    </div>
  );
}

function Afterglow() {
  const [step, setStep] = useState(1);
  const [captureMethod, setCaptureMethod] = useState("voice");
  const [cardScanned, setCardScanned] = useState(false);
  const [cardVoiceCaptured, setCardVoiceCaptured] = useState(false);
  const [transcribed, setTranscribed] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState("a");
  const [platform, setPlatform] = useState("whatsapp");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [angleList, setAngleList] = useState(initialAngles);
  const [poolIndex, setPoolIndex] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [extraContext, setExtraContext] = useState([]); // things you remembered after the fact
  const [addingContext, setAddingContext] = useState(false);
  const [contextDraft, setContextDraft] = useState("");
  const [contextMode, setContextMode] = useState("voice");
  const [contextVoiceCaptured, setContextVoiceCaptured] = useState(false);
  const [draft, setDraft] = useState({ title: "", reasoning: "" });
  const [inputMode, setInputMode] = useState("text");
  const [voiceCaptured, setVoiceCaptured] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [contacts, setContactsRaw] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.from("contacts").select("*").order("created_at");
      if (error) { console.error(error); setContactsLoading(false); return; }
      if (cancelled) return;
      if (data.length === 0) {
        const seed = buildSeedContacts();
        const { data: inserted, error: insertError } = await supabase.from("contacts").insert(seed).select();
        if (insertError) { console.error(insertError); setContactsLoading(false); return; }
        if (!cancelled) setContactsRaw(inserted);
      } else {
        setContactsRaw(data);
      }
      if (!cancelled) setContactsLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function setContacts(updater) {
    setContactsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      next.forEach((c) => {
        const before = prev.find((p) => p.id === c.id);
        if (!before || before === c) return;
        supabase
          .from("contacts")
          .update({ context: c.context, phone: c.phone, email: c.email, linkedin: c.linkedin, stage: c.stage, timeline: c.timeline, todos: c.todos, contextNotes: c.contextNotes || [] })
          .eq("id", c.id)
          .then(({ error }) => { if (error) console.error("Save failed:", error); });
      });
      return next;
    });
  }
  const [nudges, setNudges] = useState(initialNudges);
  const [editingNudge, setEditingNudge] = useState(null);
  const [nudgeDraft, setNudgeDraft] = useState("");
  const [nudgeConfirm, setNudgeConfirm] = useState(null);

  // to-do checklist state (Cultivate view)
  const [addingTodoFor, setAddingTodoFor] = useState(null);
  const [todoDraft, setTodoDraft] = useState("");
  const [todoMode, setTodoMode] = useState("text");
  const [todoVoiceCaptured, setTodoVoiceCaptured] = useState(false);
  const [todoChannel, setTodoChannel] = useState("message");

  // manual "offline moment" state (Cultivate view) — a new, dated touchpoint
  const [addingMomentFor, setAddingMomentFor] = useState(null);
  const [momentDraft, setMomentDraft] = useState({ dateISO: "", place: "", note: "" });
  const [momentMode, setMomentMode] = useState("text");
  const [momentVoiceCaptured, setMomentVoiceCaptured] = useState(false);

  // "remembered detail" state (Cultivate view) — background on an existing relationship, not a new event
  const [addingDetailFor, setAddingDetailFor] = useState(null);
  const [detailDraft, setDetailDraft] = useState("");
  const [detailMode, setDetailMode] = useState("voice");
  const [detailVoiceCaptured, setDetailVoiceCaptured] = useState(false);

  // suggested talking point, generated from whatever was just added
  const [suggestedTodos, setSuggestedTodos] = useState(null); // { contact, options: [text,...], selected: index }
  const [addingOwnSuggestion, setAddingOwnSuggestion] = useState(false);
  const [ownSuggestionDraft, setOwnSuggestionDraft] = useState("");
  const [ownSuggestionMode, setOwnSuggestionMode] = useState("voice");
  const [ownSuggestionVoiceCaptured, setOwnSuggestionVoiceCaptured] = useState(false);
  const [highlightContact, setHighlightContact] = useState(null);
  const todosRefs = useRef({});

  // loops a to-do back into the platform compose screen
  const [composeOverride, setComposeOverride] = useState(null); // { contact, todoText, texts }
  const [messageEdits, setMessageEdits] = useState({}); // { [platform]: editedText }

  function flipPronouns(s) {
    return s
      .replace(/\b(she|he)\b/gi, "you")
      .replace(/\bthey\b/gi, "you")
      .replace(/\b(her|his)\b/gi, "your")
      .replace(/\btheir\b/gi, "your");
  }
  function contextualizeTodo(rawText) {
    let t = rawText.trim().replace(/\.$/, "");
    // Drop a leading condition like "If she replies, " — by the time this is sent, that's moot.
    t = t.replace(/^if (?:she|he|they) repl(?:y|ies)?,\s*/i, "");
    let m;
    if ((m = t.match(/^congratulate (?:her|him|them) on (.+)$/i))) {
      return `Congrats on ${m[1]}!`;
    }
    if ((m = t.match(/^ask if (?:she|he|they)(?:'s| is| are)? (?:free|able|available) to (.+)$/i))) {
      return `Would you be free to ${flipPronouns(m[1])}?`;
    }
    if ((m = t.match(/^ask how (.+?) went(.*)$/i))) {
      return `How did ${flipPronouns(m[1])} go${flipPronouns(m[2])}?`;
    }
    if ((m = t.match(/^send (.+)$/i))) {
      return `Here's ${flipPronouns(m[1])}!`;
    }
    if ((m = t.match(/^confirm (.+)$/i))) {
      return `Just confirming ${flipPronouns(m[1])}.`;
    }
    if ((m = t.match(/^bring (.+)$/i))) {
      return `I'll bring ${flipPronouns(m[1])}.`;
    }
    if ((m = t.match(/^ask (?:her|him|them)?\s*(.+)$/i))) {
      return `Quick one \u2014 ${flipPronouns(m[1])}?`;
    }
    return `Following up \u2014 ${flipPronouns(t.charAt(0).toLowerCase() + t.slice(1))}.`;
  }
  function buildMessagesFromTodo(contactName, todoText) {
    const firstName = contactName.split(" ")[0];
    const clean = contextualizeTodo(todoText);
    return {
      whatsapp: `Hey ${firstName}! ${clean} 🙂`,
      sms: `Hi ${firstName}, ${clean}`,
      email: `Subject: Following up\n\nHi ${firstName},\n\n${clean}\n\nBest,\nGerald`,
      linkedin: `Hi ${firstName} — ${clean}`,
    };
  }
  function sendTodoToCompose(contactName, todoText) {
    setComposeOverride({ contact: contactName, todoText, texts: buildMessagesFromTodo(contactName, todoText) });
    setMessageEdits({});
    setPlatform("whatsapp");
    setStep(4);
  }

  function contactMatchSnippet(c, q) {
    const needle = q.toLowerCase();
    if (!needle) return null;
    if (c.name.toLowerCase().includes(needle)) return null; // name match is already visible, no need to explain it
    if (c.context.toLowerCase().includes(needle)) return null; // context line is already visible
    for (const t of c.timeline) {
      if ((t.place || "").toLowerCase().includes(needle)) return `Matched in timeline · ${t.place}`;
      if ((t.note || "").toLowerCase().includes(needle)) return `Matched in timeline · "${t.note}"`;
    }
    for (const t of c.todos) {
      if (t.text.toLowerCase().includes(needle)) return `Matched in to-dos · "${t.text}"`;
    }
    return null;
  }

  function contactMatches(c, q) {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      c.name.toLowerCase().includes(needle) ||
      c.context.toLowerCase().includes(needle) ||
      c.timeline.some((t) => (t.place || "").toLowerCase().includes(needle) || (t.note || "").toLowerCase().includes(needle)) ||
      c.todos.some((t) => t.text.toLowerCase().includes(needle))
    );
  }

  const filteredContacts = contacts.filter((c) => contactMatches(c, search));

  function suggestTodosFromMoment(note, place) {
    const t = `${note} ${place}`.toLowerCase();
    const trimmed = note.trim();
    const short = trimmed.length > 60 ? trimmed.slice(0, 60) + "\u2026" : trimmed;
    const options = [];

    if (t.includes("visa")) options.push("Ask how the extended stay is going next time you see her.");
    if (t.includes("africatech") || t.includes("presenting")) options.push("Ask how the AfricaTech talk went.");
    if (t.includes("kipi")) options.push("Send the KIPI contact intro she asked for.");
    if (t.includes("clerk") || t.includes("judge") || t.includes("court")) options.push("Ask about her time clerking before she moved into M&A.");

    if (trimmed) {
      options.push(`Bring it up next time you talk \u2014 "${short}"`);
      options.push(`Follow up on: "${short}"`);
    } else {
      options.push(`Follow up on what happened at ${place || "that moment"}.`);
    }

    return [...new Set(options)].slice(0, 3);
  }

  // Looks across everything known about someone — every timeline note, every added
  // detail — not just whatever was most recently typed in. On-demand, not reactive.
  function suggestTodosFromProfile(c) {
    const firstName = c.name.split(" ")[0];
    const corpus = [
      ...(c.timeline || []).map((t) => t.note || ""),
      ...(c.contextNotes || []),
    ].join(" ").toLowerCase();
    const options = [];

    if (corpus.includes("visa")) options.push("Ask how the extended stay worked out.");
    if (corpus.includes("africatech") || corpus.includes("presenting")) options.push("Ask how the AfricaTech talk went.");
    if (corpus.includes("kipi")) options.push("Send the KIPI contact intro she asked for.");
    if (corpus.includes("clerk") || corpus.includes("judge") || corpus.includes("court")) options.push("Ask what made her move from clerking into M&A.");
    if (corpus.includes("antitrust")) options.push("Ask how the antitrust clearance turned out.");
    if (corpus.includes("indemnification")) options.push("Check if she got any feedback on the indemnification note.");
    if (corpus.includes("negotiation") || corpus.includes(" sim")) options.push("Ask what she'd do differently in the negotiation sim now.");

    const latest = c.timeline && c.timeline.length ? c.timeline[c.timeline.length - 1] : null;
    options.push(`Follow up on your last touchpoint \u2014 ${latest ? latest.place : "wherever you left off"}.`);
    options.push(`Just check in \u2014 it's been a while since you and ${firstName} properly connected.`);

    return [...new Set(options)].slice(0, 3);
  }

  function jumpToTodos(contactName) {
    setHighlightContact(contactName);
    setTimeout(() => {
      todosRefs.current[contactName]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    setTimeout(() => setHighlightContact(null), 2400);
  }

  function acceptNudge(n) {
    if (n.type === "capture") {
      setNudges((list) => list.filter((x) => x.id !== n.id));
      setStep(1);
      return;
    }
    setContacts((list) => list.map((c) => c.name !== n.contact ? c : {
      ...c, todos: [...c.todos, { id: "nt-" + Date.now(), text: n.text, done: false }]
    }));
    setNudges((list) => list.filter((x) => x.id !== n.id));
    setNudgeConfirm(n.contact);
    setTimeout(() => setNudgeConfirm(null), 2200);
  }
  function dismissNudge(id) {
    setNudges((list) => list.filter((x) => x.id !== id));
  }
  function startEditNudge(n) {
    setEditingNudge(n.id);
    setNudgeDraft(n.text);
  }
  function saveNudgeEdit(id) {
    setNudges((list) => list.map((x) => x.id === id ? { ...x, text: nudgeDraft } : x));
    setEditingNudge(null);
  }
  function toggleTodo(contactName, todoId) {
    setContacts((list) => list.map((c) => {
      if (c.name !== contactName) return c;
      let loggedTimeline = c.timeline;
      const todos = c.todos.map((t) => {
        if (t.id !== todoId) return t;
        const nowDone = !t.done;
        // Completing an in-person/call action is a real touchpoint — it belongs in the timeline,
        // not just a struck-through line that disappears from view.
        if (nowDone && t.channel === "inperson") {
          loggedTimeline = [
            ...loggedTimeline,
            { id: "done-" + t.id, dateISO: new Date().toISOString().slice(0, 10), place: "Done in person / call", note: t.text, manual: true },
          ].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
        }
        return { ...t, done: nowDone };
      });
      return { ...c, todos, timeline: loggedTimeline };
    }));
  }
  function removeTodo(contactName, todoId) {
    setContacts((list) => list.map((c) => c.name !== contactName ? c : {
      ...c, todos: c.todos.filter((t) => t.id !== todoId)
    }));
  }
  function openAddTodo(contactName) {
    setAddingTodoFor(contactName);
    setTodoDraft("");
    setTodoMode("text");
    setTodoVoiceCaptured(false);
    setTodoChannel("message");
  }
  function fillTodoFromVoice() {
    setTodoDraft("Ask if she's free to co-present a session at next term's Legal Tech Week.");
    setTodoVoiceCaptured(true);
  }
  function saveTodo(contactName) {
    if (!todoDraft.trim()) { setAddingTodoFor(null); return; }
    setContacts((list) => list.map((c) => c.name !== contactName ? c : {
      ...c, todos: [...c.todos, { id: "t-" + Date.now(), text: todoDraft.trim(), done: false, channel: todoChannel }]
    }));
    setAddingTodoFor(null);
    jumpToTodos(contactName);
  }

  function openAddMoment(contactName) {
    setAddingMomentFor(contactName);
    setMomentDraft({ dateISO: new Date().toISOString().slice(0, 10), place: "", note: "" });
    setMomentMode("text");
    setMomentVoiceCaptured(false);
  }
  function fillMomentFromVoice() {
    setMomentDraft((d) => ({
      ...d,
      place: "Ran into her at Peet's on Bancroft",
      note: "Not a planned catch-up — mentioned her visa renewal came through, staying through the summer term.",
    }));
    setMomentVoiceCaptured(true);
  }
  function saveMoment(contactName) {
    if (!momentDraft.place.trim() && !momentDraft.note.trim()) { setAddingMomentFor(null); return; }
    setContacts((list) => list.map((c) => {
      if (c.name !== contactName) return c;
      const entry = { id: "m-" + Date.now(), dateISO: momentDraft.dateISO, place: momentDraft.place || "Offline — added manually", note: momentDraft.note, manual: true };
      const timeline = [...c.timeline, entry].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
      return { ...c, timeline };
    }));
    setAddingMomentFor(null);
    setSuggestedTodos({ contact: contactName, options: suggestTodosFromMoment(momentDraft.note, momentDraft.place), selected: 0 });
    setAddingOwnSuggestion(false);
  }

  function openAddDetail(contactName) {
    setAddingDetailFor(contactName);
    setDetailDraft("");
    setDetailMode("voice");
    setDetailVoiceCaptured(false);
  }
  function fillDetailFromVoice() {
    setDetailDraft("Oh — she also mentioned she clerked for a judge on the S\u00e3o Paulo commercial court before moving into M&A.");
    setDetailVoiceCaptured(true);
  }
  function saveDetail(contactName) {
    const note = detailDraft.trim();
    if (!note) { setAddingDetailFor(null); return; }
    setContacts((list) => list.map((c) => c.name !== contactName ? c : {
      ...c, contextNotes: [...(c.contextNotes || []), note]
    }));
    setAddingDetailFor(null);
    setSuggestedTodos({ contact: contactName, options: suggestTodosFromMoment(note, ""), selected: 0 });
    setAddingOwnSuggestion(false);
  }

  function suggestFromWholeProfile(contact) {
    setSuggestedTodos({ contact: contact.name, options: suggestTodosFromProfile(contact), selected: 0, wholeProfile: true });
    setAddingOwnSuggestion(false);
  }

  function acceptSuggestedTodo(channel = "message") {
    if (!suggestedTodos) return;
    const { contact, options, selected } = suggestedTodos;
    const text = options[selected];
    setContacts((list) => list.map((c) => c.name !== contact ? c : {
      ...c, todos: [...c.todos, { id: "st-" + Date.now(), text, done: false, channel }]
    }));
    setSuggestedTodos(null);
    jumpToTodos(contact);
  }
  function selectSuggestedTodo(idx) {
    setSuggestedTodos((s) => ({ ...s, selected: idx }));
  }
  function editSuggestedTodo(text) {
    setSuggestedTodos((s) => ({ ...s, options: s.options.map((o, i) => (i === s.selected ? text : o)) }));
  }
  function skipSuggestedTodo() {
    setSuggestedTodos(null);
  }
  function openOwnSuggestion() {
    setAddingOwnSuggestion(true);
    setOwnSuggestionDraft("");
    setOwnSuggestionMode("voice");
    setOwnSuggestionVoiceCaptured(false);
  }
  function fillOwnSuggestionFromVoice() {
    setOwnSuggestionDraft("Actually, tell her the case note landed well with my study group too — she'd probably like knowing that.");
    setOwnSuggestionVoiceCaptured(true);
  }
  function saveOwnSuggestion() {
    const text = ownSuggestionDraft.trim();
    if (!text) { setAddingOwnSuggestion(false); return; }
    setSuggestedTodos((s) => {
      const options = [...s.options, text];
      return { ...s, options, selected: options.length - 1 };
    });
    setAddingOwnSuggestion(false);
  }

  function startEdit(a) {
    setEditingId(a.id);
    setDraft({ title: a.title, reasoning: a.reasoning });
    setInputMode("text");
    setVoiceCaptured(false);
  }
  function fillFromVoice() {
    setDraft({
      title: "Offer the negotiation sim debrief notes",
      reasoning: "She mentioned she wants to tighten her cold-opening tactics before the next round \u2014 your debrief notes from the sim are directly useful.",
    });
    setVoiceCaptured(true);
  }
  function saveEdit(id) {
    setAngleList((list) => list.map((a) => (a.id === id ? { ...a, ...draft, source: a.source === "ai" ? "edited" : a.source } : a)));
    setEditingId(null);
  }
  function openAddContext() {
    setAddingContext(true);
    setContextDraft("");
    setContextMode("voice");
    setContextVoiceCaptured(false);
  }
  function fillContextFromVoice() {
    setContextDraft("Oh — she also mentioned she clerked for a judge on the S\u00e3o Paulo commercial court before moving into M&A. That's probably why she's so sharp on risk allocation.");
    setContextVoiceCaptured(true);
  }
  function deriveAngleFromContext(note) {
    const t = note.toLowerCase();
    if (t.includes("clerk") || t.includes("judge") || t.includes("court")) {
      return {
        title: "Ask about her time clerking",
        reasoning: "New detail you just added — a judicial clerkship before M&A is a distinctive background worth asking about directly.",
      };
    }
    const trimmed = note.trim();
    return {
      title: `Follow up on: "${trimmed.length > 60 ? trimmed.slice(0, 60) + "\u2026" : trimmed}"`,
      reasoning: "Generated from the extra context you just added \u2014 not part of the original capture.",
    };
  }
  function saveContext() {
    if (!contextDraft.trim()) { setAddingContext(false); return; }
    const note = contextDraft.trim();
    setExtraContext((list) => [...list, note]);
    const derived = deriveAngleFromContext(note);
    const id = "ctx-" + Date.now();
    setAngleList((list) => [...list, { id, title: derived.title, reasoning: derived.reasoning, source: "context" }]);
    setSelectedAngle(id);
    setAddingContext(false);
  }
  function addMoreSuggestion() {
    if (poolIndex < morePool.length) {
      setAngleList((list) => [...list, morePool[poolIndex]]);
      setPoolIndex(poolIndex + 1);
    }
  }
  function addOwnAngle() {
    const id = "own-" + Date.now();
    const blank = { id, title: "New angle", reasoning: "Say why this fits the conversation…", source: "yours" };
    setAngleList((list) => [...list, blank]);
    setSelectedAngle(id);
    setEditingId(id);
    setDraft({ title: blank.title, reasoning: blank.reasoning });
    setInputMode("voice");
    setVoiceCaptured(false);
  }
  function removeAngle(id) {
    setAngleList((list) => list.filter((a) => a.id !== id));
    if (selectedAngle === id) setSelectedAngle(angleList[0]?.id);
  }
  function openPush() {
    setSent(false);
    setPushOpen(true);
  }
  function closePush() {
    setPushOpen(false);
    setSent(false);
  }

  const Plat = platformCopy[platform].icon;

  return (
    <div style={{ background: PAPER, color: INK, minHeight: "100vh" }} className="font-sans">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {/* Header */}
      <div className="px-6 pt-10 pb-6 md:px-12" style={{ borderBottom: `1px solid ${SAND}` }}>
        <div className="flex items-baseline justify-between max-w-4xl mx-auto">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: OCHRE }}>
              a memory doesn't stay warm forever
            </p>
            <h1 className="font-display text-4xl md:text-5xl" style={{ color: MOSS }}>Afterglow</h1>
          </div>
          <div className="text-right">
            <p className="hidden md:block text-sm max-w-[220px] opacity-70 mb-2">
              Capture the conversation before it fades. Cultivate it after.
            </p>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Proactive nudges */}
      {nudges.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 md:px-12 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} color={OCHRE} />
            <p className="font-mono text-xs uppercase tracking-widest opacity-60">Afterglow noticed</p>
          </div>
          <div className="grid gap-2">
            {nudges.map((n) => (
              <div key={n.id} className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-1 flex items-center gap-1.5" style={{ color: n.type === "capture" ? OCHRE : MOSS }}>
                    {n.type === "capture" ? (<><CalendarPlus size={12} /> From your calendar</>) : n.contact}
                  </p>
                  {editingNudge === n.id ? (
                    <div>
                      <textarea
                        value={nudgeDraft}
                        onChange={(e) => setNudgeDraft(e.target.value)}
                        rows={2}
                        className="w-full px-2.5 py-2 rounded-lg text-sm outline-none resize-none"
                        style={{ border: `1px solid ${SAND}` }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveNudgeEdit(n.id)} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: MOSS, color: "#fff" }}>
                          <Check size={12} /> Save
                        </button>
                        <button onClick={() => setEditingNudge(null)} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: `1px solid ${SAND}` }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{n.text}</p>
                  )}
                </div>
                {editingNudge !== n.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => acceptNudge(n)}
                      className="p-2 rounded-full"
                      style={{ background: MOSS }}
                      aria-label={n.type === "capture" ? "Go capture" : "Accept — add as to-do"}
                    >
                      {n.type === "capture" ? <Mic size={13} color="#fff" /> : <Check size={13} color="#fff" />}
                    </button>
                    <button onClick={() => startEditNudge(n)} className="p-2 rounded-full opacity-60 hover:opacity-100" aria-label="Edit">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => dismissNudge(n.id)} className="p-2 rounded-full opacity-60 hover:opacity-100" aria-label="Dismiss">
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {nudgeConfirm && (
            <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: MOSS }}>
              <Sparkles size={12} /> Added to {nudgeConfirm}'s to-do list — find it under Cultivate.
            </p>
          )}
        </div>
      )}

      {/* Step nav */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-8 flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition"
            style={{
              background: step === s.id ? MOSS : "transparent",
              color: step === s.id ? PAPER : INK,
              border: `1px solid ${step === s.id ? MOSS : SAND}`,
            }}
          >
            <span className="font-mono text-xs opacity-70">{String(s.id).padStart(2, "0")}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">

        {/* STEP 1: CAPTURE */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl mb-2">How did you meet them?</h2>
            <p className="opacity-70 mb-6 text-sm">Capture within the hour. Detail decays fast — the goal is thirty seconds, not a report.</p>

            <div className="flex gap-3 mb-8 flex-wrap">
              {[
                { id: "voice", label: "Voice note", icon: Mic },
                { id: "card", label: "Business card", icon: ScanLine },
                { id: "manual", label: "Type it", icon: PenLine },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setCaptureMethod(m.id); setTranscribed(false); setCardScanned(false); setCardVoiceCaptured(false); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: captureMethod === m.id ? OCHRE : "#fff",
                    color: captureMethod === m.id ? "#fff" : INK,
                    border: `1px solid ${captureMethod === m.id ? OCHRE : SAND}`,
                  }}
                >
                  <m.icon size={16} /> {m.label}
                </button>
              ))}
            </div>

            {captureMethod === "voice" && (
              <div className="rounded-2xl p-6" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: CLAY }}>
                    <Mic size={20} color="#fff" />
                  </div>
                  <div className="flex items-end gap-1 h-8">
                    {[6,14,9,20,12,17,7,15,10,5].map((h,i) => (
                      <div key={i} style={{ width: 3, height: h, background: MOSS, borderRadius: 2 }} />
                    ))}
                  </div>
                  <span className="font-mono text-xs opacity-60 ml-auto">0:24</span>
                </div>
                {!transcribed ? (
                  <button
                    onClick={() => setTranscribed(true)}
                    className="text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
                    style={{ background: MOSS, color: "#fff" }}
                  >
                    <Sparkles size={14} /> Transcribe &amp; extract
                  </button>
                ) : (
                  <div className="font-mono text-xs leading-relaxed p-4 rounded-lg" style={{ background: PAPER }}>
                    "Met Elena at the Torts seminar, she's actually an M&A associate from S\u00e3o
                    Paulo, cross-registered for the cross-border liability angle. We ended up
                    paired in the same negotiation sim too — sharp on deal-risk allocation."
                  </div>
                )}
              </div>
            )}

            {captureMethod === "card" && (
              <div className="rounded-2xl p-6" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                {!cardScanned ? (
                  <div className="flex flex-col items-center justify-center gap-3 text-center" style={{ minHeight: 160 }}>
                    <ScanLine size={28} color={MOSS} />
                    <p className="text-sm opacity-70">Point your camera at the card — name, title, company, and contact details are lifted automatically. Add a voice note after for context the card can't hold.</p>
                    <button
                      onClick={() => setCardScanned(true)}
                      className="mt-2 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
                      style={{ background: MOSS, color: "#fff" }}
                    >
                      <ScanLine size={14} /> Scan card
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest opacity-60 mb-3 flex items-center gap-1.5">
                      <Sparkles size={12} style={{ color: OCHRE }} /> Lifted from the card
                    </p>
                    <div className="grid gap-2 mb-5">
                      {[
                        ["Name", "Elena Duarte"],
                        ["Title", "M&A Associate"],
                        ["Company", "Almeida & Duarte Advogados, S\u00e3o Paulo"],
                        ["Phone", "+55 11 98765 4321"],
                        ["Email", "elena.duarte@lawfirm.com.br"],
                      ].map(([label, val]) => (
                        <div key={label} className="grid grid-cols-[90px_1fr] gap-2 items-center">
                          <span className="font-mono text-[10px] uppercase tracking-wide opacity-50">{label}</span>
                          <div className="px-3 py-1.5 rounded-lg text-sm" style={{ background: PAPER, border: `1px solid ${SAND}` }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: `1px solid ${SAND}` }} className="pt-4">
                      <p className="text-sm font-medium mb-1">The card can't tell you what stood out</p>
                      <p className="text-xs opacity-60 mb-3">Add a quick voice note now, while the conversation is still fresh.</p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: CLAY }}>
                          <Mic size={20} color="#fff" />
                        </div>
                        <div className="flex items-end gap-1 h-8">
                          {[6,14,9,20,12,17,7,15,10,5].map((h,i) => (
                            <div key={i} style={{ width: 3, height: h, background: MOSS, borderRadius: 2 }} />
                          ))}
                        </div>
                        <span className="font-mono text-xs opacity-60 ml-auto">0:17</span>
                      </div>

                      {!cardVoiceCaptured ? (
                        <button
                          onClick={() => setCardVoiceCaptured(true)}
                          className="text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
                          style={{ background: MOSS, color: "#fff" }}
                        >
                          <Sparkles size={14} /> Transcribe &amp; merge with card
                        </button>
                      ) : (
                        <div className="font-mono text-xs leading-relaxed p-4 rounded-lg" style={{ background: PAPER }}>
                          "Cross-registered from her M&A track for the cross-border liability
                          angle in Torts. Sharp on deal-risk allocation — ended up paired with
                          her in the negotiation sim too."
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {captureMethod === "manual" && (
              <div className="rounded-2xl p-6 grid gap-3" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                {["Name", "Where you met", "What stood out"].map((ph) => (
                  <input key={ph} placeholder={ph} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: `1px solid ${SAND}` }} />
                ))}
              </div>
            )}

            <button onClick={() => setStep(2)} className="mt-8 flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-full" style={{ background: MOSS, color: "#fff" }}>
              Continue <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: EXTRACT */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl mb-2">Pulled from your voice note</h2>
            <p className="opacity-70 mb-6 text-sm">Edit anything that's off — this becomes the memory you'll thank yourself for later.</p>

            <div className="rounded-2xl p-6 grid gap-4" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
              {[
                ["Name", "Elena Duarte"],
                ["Where you met", "Torts Seminar, Berkeley Law, 10 Jul"],
                ["Role / context", "M&A associate, S\u00e3o Paulo \u2014 cross-registered for Torts"],
                ["What stood out", "Sharp on deal-risk allocation and indemnification structuring"],
                ["Shared thread", "Also paired together in the cohort negotiation simulation"],
              ].map(([label, val]) => (
                <div key={label} className="grid md:grid-cols-[160px_1fr] gap-2 items-center">
                  <span className="font-mono text-xs uppercase tracking-wide opacity-60">{label}</span>
                  <div className="px-3 py-2 rounded-lg text-sm" style={{ background: PAPER, border: `1px solid ${SAND}` }}>{val}</div>
                </div>
              ))}
            </div>

            <p className="font-mono text-xs uppercase tracking-widest opacity-60 mt-8 mb-3">So "push" goes to the right place</p>
            <div className="rounded-2xl p-6 grid gap-4" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
              {[
                ["WhatsApp / SMS", "+55 11 98765 4321", MessageCircle],
                ["Email", "elena.duarte@lawfirm.com.br", Mail],
                ["LinkedIn profile", "linkedin.com/in/elena-duarte", Linkedin],
              ].map(([label, val, Icn]) => (
                <div key={label} className="grid md:grid-cols-[160px_1fr] gap-2 items-center">
                  <span className="font-mono text-xs uppercase tracking-wide opacity-60 flex items-center gap-1.5"><Icn size={12} /> {label}</span>
                  <div className="px-3 py-2 rounded-lg text-sm" style={{ background: PAPER, border: `1px solid ${SAND}` }}>{val}</div>
                </div>
              ))}
              <p className="text-xs opacity-60 flex items-start gap-1.5">
                <Info size={13} className="shrink-0 mt-0.5" />
                Captured once — every future push reuses these, no re-searching. LinkedIn can only open her profile, not a pre-filled chat; that's a LinkedIn limitation, not this app's.
              </p>
            </div>

            <button onClick={() => setStep(3)} className="mt-8 flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-full" style={{ background: MOSS, color: "#fff" }}>
              Get follow-up angles <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 3: ANGLES */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl mb-2">Three ways to follow up</h2>
            <p className="opacity-70 mb-4 text-sm">Ranked by how specific they are to this conversation — pick one, edit one, or write your own.</p>

            {extraContext.length > 0 && (
              <div className="rounded-xl p-3 mb-3" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1.5">Added after the fact</p>
                <div className="grid gap-1">
                  {extraContext.map((note, i) => (
                    <p key={i} className="text-xs opacity-70 flex items-start gap-1.5">
                      <Sparkles size={11} className="shrink-0 mt-0.5" style={{ color: OCHRE }} /> {note}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {addingContext ? (
              <div className="rounded-2xl p-4 mb-4" style={{ background: "#fff", border: `1px solid ${OCHRE}` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: OCHRE }}>Missed something? Add it here</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setContextMode("text")}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: contextMode === "text" ? MOSS : "transparent", color: contextMode === "text" ? "#fff" : INK, border: `1px solid ${contextMode === "text" ? MOSS : SAND}` }}
                    >
                      <PenLine size={11} /> Type
                    </button>
                    <button
                      onClick={() => setContextMode("voice")}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: contextMode === "voice" ? MOSS : "transparent", color: contextMode === "voice" ? "#fff" : INK, border: `1px solid ${contextMode === "voice" ? MOSS : SAND}` }}
                    >
                      <Mic size={11} /> Speak
                    </button>
                  </div>
                </div>

                {contextMode === "voice" && !contextVoiceCaptured ? (
                  <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: PAPER }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: CLAY }}>
                      <Mic size={14} color="#fff" />
                    </div>
                    <div className="flex items-end gap-1 h-5 flex-1">
                      {[5,10,6,13,8,11,4].map((h,i) => <div key={i} style={{ width: 3, height: h, background: MOSS, borderRadius: 2 }} />)}
                    </div>
                    <button onClick={fillContextFromVoice} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full shrink-0" style={{ background: MOSS, color: "#fff" }}>
                      <Sparkles size={11} /> Stop &amp; fill in
                    </button>
                  </div>
                ) : (
                  <textarea
                    value={contextDraft}
                    onChange={(e) => setContextDraft(e.target.value)}
                    rows={2}
                    placeholder="What did you forget to mention?"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ border: `1px solid ${SAND}` }}
                  />
                )}

                <p className="text-xs opacity-50 mt-2">This updates her profile and generates a new angle from what you just added.</p>

                <div className="flex gap-2 mt-2">
                  <button onClick={saveContext} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: MOSS, color: "#fff" }}>
                    <Check size={12} /> Add it
                  </button>
                  <button onClick={() => setAddingContext(false)} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: `1px solid ${SAND}` }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={openAddContext}
                className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full mb-5"
                style={{ border: `1px dashed ${OCHRE}`, color: OCHRE }}
              >
                <Plus size={13} /> Missed something? Add more context
              </button>
            )}

            <div className="grid gap-3">
              {angleList.map((a) => {
                const isEditing = editingId === a.id;
                const isSelected = selectedAngle === a.id;
                return (
                  <div
                    key={a.id}
                    className="rounded-2xl p-5 transition"
                    style={{
                      background: isSelected ? "#fff" : "transparent",
                      border: `1px solid ${isSelected ? OCHRE : SAND}`,
                    }}
                  >
                    {isEditing ? (
                      <div className="grid gap-2">
                        <div className="flex gap-1.5 mb-1">
                          <button
                            onClick={() => setInputMode("text")}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                            style={{
                              background: inputMode === "text" ? MOSS : "transparent",
                              color: inputMode === "text" ? "#fff" : INK,
                              border: `1px solid ${inputMode === "text" ? MOSS : SAND}`,
                            }}
                          >
                            <PenLine size={12} /> Type
                          </button>
                          <button
                            onClick={() => setInputMode("voice")}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                            style={{
                              background: inputMode === "voice" ? MOSS : "transparent",
                              color: inputMode === "voice" ? "#fff" : INK,
                              border: `1px solid ${inputMode === "voice" ? MOSS : SAND}`,
                            }}
                          >
                            <Mic size={12} /> Speak
                          </button>
                        </div>

                        {inputMode === "voice" && !voiceCaptured && (
                          <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: PAPER }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: CLAY }}>
                              <Mic size={16} color="#fff" />
                            </div>
                            <div className="flex items-end gap-1 h-6 flex-1">
                              {[5,11,7,15,9,13,6,10].map((h,i) => (
                                <div key={i} style={{ width: 3, height: h, background: MOSS, borderRadius: 2 }} />
                              ))}
                            </div>
                            <button
                              onClick={fillFromVoice}
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full shrink-0"
                              style={{ background: MOSS, color: "#fff" }}
                            >
                              <Sparkles size={12} /> Stop &amp; fill in
                            </button>
                          </div>
                        )}

                        {(inputMode === "text" || voiceCaptured) && (
                          <>
                            <input
                              value={draft.title}
                              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                              className="font-medium px-3 py-2 rounded-lg text-sm outline-none"
                              style={{ border: `1px solid ${SAND}` }}
                            />
                            <textarea
                              value={draft.reasoning}
                              onChange={(e) => setDraft({ ...draft, reasoning: e.target.value })}
                              rows={2}
                              className="px-3 py-2 rounded-lg text-sm outline-none resize-none"
                              style={{ border: `1px solid ${SAND}` }}
                            />
                            {voiceCaptured && (
                              <p className="text-xs opacity-60 flex items-center gap-1.5">
                                <Sparkles size={11} /> Filled from your voice note — edit anything before saving.
                              </p>
                            )}
                          </>
                        )}

                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => saveEdit(a.id)}
                            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full"
                            style={{ background: MOSS, color: "#fff" }}
                          >
                            <Check size={12} /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full"
                            style={{ border: `1px solid ${SAND}` }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <button onClick={() => setSelectedAngle(a.id)} className="text-left flex items-center gap-2">
                            <h3 className="font-medium">{a.title}</h3>
                            {a.source === "yours" && (
                              <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0" style={{ background: SAND }}>yours</span>
                            )}
                            {a.source === "edited" && (
                              <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0" style={{ background: SAND }}>edited</span>
                            )}
                            {a.source === "context" && (
                              <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0" style={{ background: OCHRE, color: "#fff" }}>new context</span>
                            )}
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            {isSelected && <Check size={16} color={OCHRE} />}
                            <button onClick={() => startEdit(a)} className="p-1.5 rounded-full opacity-60 hover:opacity-100" aria-label="Edit angle">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => removeAngle(a.id)} className="p-1.5 rounded-full opacity-60 hover:opacity-100" aria-label="Remove angle">
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => setSelectedAngle(a.id)} className="text-left w-full">
                          <p className="text-sm opacity-70">{a.reasoning}</p>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={addMoreSuggestion}
                disabled={poolIndex >= morePool.length}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full"
                style={{
                  border: `1px solid ${OCHRE}`,
                  color: poolIndex >= morePool.length ? INK : OCHRE,
                  opacity: poolIndex >= morePool.length ? 0.4 : 1,
                }}
              >
                <Wand2 size={14} />
                {poolIndex >= morePool.length ? "No more for now" : "Suggest another angle"}
              </button>
              <button
                onClick={addOwnAngle}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full"
                style={{ border: `1px solid ${SAND}` }}
              >
                <Plus size={14} /> Add your own
              </button>
            </div>

            <button onClick={() => setStep(4)} className="mt-8 flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-full" style={{ background: MOSS, color: "#fff" }}>
              Draft the message <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 4: COMPOSE */}
        {step === 4 && (
          <div>
            <h2 className="font-display text-2xl mb-1">Optimized per platform</h2>
            {composeOverride ? (
              <p className="opacity-70 mb-6 text-sm">
                For <span className="font-medium" style={{ color: MOSS }}>{composeOverride.contact}</span> — "{composeOverride.todoText}"
                <button onClick={() => { setComposeOverride(null); setMessageEdits({}); }} className="ml-2 underline opacity-70 hover:opacity-100">clear</button>
              </p>
            ) : (
              <p className="opacity-70 mb-6 text-sm">Same angle, re-written for how each channel is actually read.</p>
            )}

            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 mb-5" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="flex gap-2 w-max">
                {Object.entries(platformCopy).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setPlatform(key)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shrink-0"
                    style={{
                      background: platform === key ? OCHRE : "#fff",
                      color: platform === key ? "#fff" : INK,
                      border: `1px solid ${platform === key ? OCHRE : SAND}`,
                    }}
                  >
                    <p.icon size={15} /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Plat size={16} color={MOSS} />
                <span className="font-mono text-xs uppercase tracking-wide opacity-60">{platformCopy[platform].tone}</span>
              </div>
              {(() => {
                const originalText = composeOverride ? composeOverride.texts[platform] : platformCopy[platform].text;
                const activeText = messageEdits[platform] ?? originalText;
                const isEdited = messageEdits[platform] !== undefined && messageEdits[platform] !== originalText;
                return (
                  <>
                    <textarea
                      value={activeText}
                      onChange={(e) => setMessageEdits((prev) => ({ ...prev, [platform]: e.target.value }))}
                      rows={5}
                      className="w-full whitespace-pre-wrap text-sm leading-relaxed p-4 rounded-lg mb-1 outline-none resize-none"
                      style={{ background: PAPER, border: `1px solid ${isEdited ? OCHRE : "transparent"}` }}
                    />
                    {isEdited && (
                      <p className="text-xs mb-3 flex items-center gap-1" style={{ color: OCHRE }}>
                        <Pencil size={11} /> Edited — no longer the original suggestion
                      </p>
                    )}
                    {!isEdited && <div className="mb-3" />}
                    <div className="flex gap-2">
                      <button onClick={openPush} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full" style={{ background: MOSS, color: "#fff" }}>
                        <Send size={14} /> Push to {platformCopy[platform].label}
                      </button>
                      <button
                        onClick={() => setMessageEdits((prev) => { const next = { ...prev }; delete next[platform]; return next; })}
                        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
                        style={{ border: `1px solid ${SAND}` }}
                      >
                        <RefreshCw size={14} /> {isEdited ? "Revert to original" : "Regenerate"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            <button onClick={() => setStep(5)} className="mt-8 flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-full" style={{ background: MOSS, color: "#fff" }}>
              See it in the funnel <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 5: CULTIVATE */}
        {step === 5 && (
          <div>
            <h2 className="font-display text-2xl mb-2">Everyone you're cultivating</h2>
            <p className="opacity-70 mb-6 text-sm">Search by name, topic, or place — "M&A" or "Torts Seminar" work as well as a name. Open anyone to see how the relationship has actually grown, touchpoint by touchpoint.</p>

            <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-full" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
              <Search size={15} className="opacity-50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, topic, or place…"
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>

            <div className="grid gap-3">
              {filteredContacts.length === 0 && (
                <p className="text-sm opacity-60 py-6 text-center">No one matches "{search}" yet.</p>
              )}
              {filteredContacts.map((c) => {
                const meta = stageMeta[c.stage];
                const isOpen = expanded === c.name;
                const snippet = contactMatchSnippet(c, search);
                return (
                  <div key={c.name} className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${isOpen ? OCHRE : SAND}` }}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : c.name)}
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      <FreshnessRing hours={hoursSinceContact(c)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs opacity-60">{c.context}</p>
                        {snippet && (
                          <p className="text-xs mt-1 flex items-start gap-1" style={{ color: OCHRE }}>
                            <Search size={11} className="shrink-0 mt-0.5" /> <span className="line-clamp-1">{snippet}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shrink-0" style={{ background: meta.color, color: meta.textColor }}>
                        <meta.icon size={13} /> {meta.label}
                      </div>
                      <ChevronDown size={16} className="shrink-0 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "none", opacity: 0.5 }} />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1">
                        <div className="pl-1">
                          {c.timeline.map((t, i) => (
                            <div key={t.id} className="relative pl-6 pb-5 last:pb-0">
                              {i !== c.timeline.length - 1 && (
                                <div className="absolute left-[5px] top-3 bottom-0 w-px" style={{ background: SAND }} />
                              )}
                              <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full" style={{ background: i === c.timeline.length - 1 ? OCHRE : MOSS }} />
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-mono text-xs uppercase tracking-wide opacity-60">{fmtDate(t.dateISO)}</span>
                                <span className="flex items-center gap-1 text-xs opacity-50">
                                  <MapPin size={11} /> {t.place}
                                </span>
                                {t.manual && (
                                  <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: SAND }}>added manually</span>
                                )}
                              </div>
                              {t.note && <p className="text-sm">{t.note}</p>}
                            </div>
                          ))}
                        </div>

                        {(c.contextNotes && c.contextNotes.length > 0) && (
                          <div className="rounded-xl p-3 mb-4" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                            <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1.5">Also worth knowing — not tied to a specific date</p>
                            <div className="grid gap-1">
                              {c.contextNotes.map((note, i) => (
                                <p key={i} className="text-xs opacity-70 flex items-start gap-1.5">
                                  <Sparkles size={11} className="shrink-0 mt-0.5" style={{ color: OCHRE }} /> {note}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {addingMomentFor === c.name ? (
                          <div className="rounded-xl p-4 mb-4" style={{ background: PAPER, border: `1px solid ${SAND}` }}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium uppercase tracking-wide opacity-60">Add something that happened off the record</p>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setMomentMode("text")}
                                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: momentMode === "text" ? MOSS : "transparent", color: momentMode === "text" ? "#fff" : INK, border: `1px solid ${momentMode === "text" ? MOSS : SAND}` }}
                                >
                                  <PenLine size={11} /> Type
                                </button>
                                <button
                                  onClick={() => setMomentMode("voice")}
                                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: momentMode === "voice" ? MOSS : "transparent", color: momentMode === "voice" ? "#fff" : INK, border: `1px solid ${momentMode === "voice" ? MOSS : SAND}` }}
                                >
                                  <Mic size={11} /> Speak
                                </button>
                              </div>
                            </div>

                            {momentMode === "voice" && !momentVoiceCaptured ? (
                              <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: "#fff" }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: CLAY }}>
                                  <Mic size={14} color="#fff" />
                                </div>
                                <div className="flex items-end gap-1 h-5 flex-1">
                                  {[4,9,6,12,7,10,5].map((h,i) => <div key={i} style={{ width: 3, height: h, background: MOSS, borderRadius: 2 }} />)}
                                </div>
                                <button onClick={fillMomentFromVoice} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full shrink-0" style={{ background: MOSS, color: "#fff" }}>
                                  <Sparkles size={11} /> Fill in
                                </button>
                              </div>
                            ) : (
                              <div className="grid gap-2">
                                <input
                                  type="date"
                                  value={momentDraft.dateISO}
                                  onChange={(e) => setMomentDraft({ ...momentDraft, dateISO: e.target.value })}
                                  className="px-3 py-2 rounded-lg text-sm outline-none w-40"
                                  style={{ border: `1px solid ${SAND}` }}
                                />
                                <div className="flex gap-2">
                                  <input
                                    placeholder="Where / how it happened"
                                    value={momentDraft.place}
                                    onChange={(e) => setMomentDraft({ ...momentDraft, place: e.target.value })}
                                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                                    style={{ border: `1px solid ${SAND}` }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setMomentDraft((d) => ({ ...d, place: "Sutardja Dai Hall, Berkeley" }))}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 rounded-lg shrink-0"
                                    style={{ border: `1px solid ${SAND}` }}
                                    title="Fill from current location"
                                  >
                                    <MapPin size={13} /> Use here
                                  </button>
                                </div>
                                <textarea
                                  placeholder="What happened"
                                  rows={2}
                                  value={momentDraft.note}
                                  onChange={(e) => setMomentDraft({ ...momentDraft, note: e.target.value })}
                                  className="px-3 py-2 rounded-lg text-sm outline-none resize-none"
                                  style={{ border: `1px solid ${SAND}` }}
                                />
                              </div>
                            )}

                            <div className="flex gap-2 mt-3">
                              <button onClick={() => saveMoment(c.name)} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: MOSS, color: "#fff" }}>
                                <Check size={12} /> Add to timeline
                              </button>
                              <button onClick={() => setAddingMomentFor(null)} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: `1px solid ${SAND}` }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 flex-wrap mb-4">
                            <button
                              onClick={() => openAddMoment(c.name)}
                              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full"
                              style={{ border: `1px dashed ${SAND}` }}
                            >
                              <CalendarPlus size={13} /> Add something that happened off the record
                            </button>
                            {addingDetailFor !== c.name && (
                              <button
                                onClick={() => openAddDetail(c.name)}
                                className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full"
                                style={{ border: `1px dashed ${OCHRE}`, color: OCHRE }}
                              >
                                <Sparkles size={13} /> Add a detail you forgot
                              </button>
                            )}
                          </div>
                        )}

                        {addingDetailFor === c.name && (
                          <div className="rounded-xl p-4 mb-4" style={{ background: "#fff", border: `1px solid ${OCHRE}` }}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: OCHRE }}>Not a new touchpoint — just something you forgot to mention</p>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setDetailMode("text")}
                                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: detailMode === "text" ? MOSS : "transparent", color: detailMode === "text" ? "#fff" : INK, border: `1px solid ${detailMode === "text" ? MOSS : SAND}` }}
                                >
                                  <PenLine size={11} /> Type
                                </button>
                                <button
                                  onClick={() => setDetailMode("voice")}
                                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: detailMode === "voice" ? MOSS : "transparent", color: detailMode === "voice" ? "#fff" : INK, border: `1px solid ${detailMode === "voice" ? MOSS : SAND}` }}
                                >
                                  <Mic size={11} /> Speak
                                </button>
                              </div>
                            </div>

                            {detailMode === "voice" && !detailVoiceCaptured ? (
                              <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: PAPER }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: CLAY }}>
                                  <Mic size={14} color="#fff" />
                                </div>
                                <div className="flex items-end gap-1 h-5 flex-1">
                                  {[5,10,6,13,8,11,4].map((h,i) => <div key={i} style={{ width: 3, height: h, background: MOSS, borderRadius: 2 }} />)}
                                </div>
                                <button onClick={fillDetailFromVoice} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full shrink-0" style={{ background: MOSS, color: "#fff" }}>
                                  <Sparkles size={11} /> Stop &amp; fill in
                                </button>
                              </div>
                            ) : (
                              <textarea
                                value={detailDraft}
                                onChange={(e) => setDetailDraft(e.target.value)}
                                rows={2}
                                placeholder="What did you forget to mention about them?"
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                                style={{ border: `1px solid ${SAND}` }}
                              />
                            )}

                            <p className="text-xs opacity-50 mt-2">Saved to their profile and used to generate a new talking point — no date or place needed.</p>

                            <div className="flex gap-2 mt-2">
                              <button onClick={() => saveDetail(c.name)} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: MOSS, color: "#fff" }}>
                                <Check size={12} /> Save
                              </button>
                              <button onClick={() => setAddingDetailFor(null)} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: `1px solid ${SAND}` }}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {suggestedTodos && suggestedTodos.contact === c.name && (
                          <div className="rounded-xl p-4 mb-4" style={{ background: "#fff", border: `1px solid ${OCHRE}` }}>
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles size={14} color={OCHRE} className="shrink-0" />
                              <p className="font-mono text-xs uppercase tracking-wide" style={{ color: OCHRE }}>
                                {suggestedTodos.wholeProfile ? "Talking points from everything you know about her" : "Talking points from what you just added"}
                              </p>
                            </div>

                            <div className="grid gap-2 mb-3">
                              {suggestedTodos.options.map((opt, i) => {
                                const isSelected = suggestedTodos.selected === i;
                                return isSelected ? (
                                  <input
                                    key={i}
                                    value={opt}
                                    onChange={(e) => editSuggestedTodo(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                    style={{ border: `1.5px solid ${OCHRE}`, background: "#FEFCF7" }}
                                  />
                                ) : (
                                  <button
                                    key={i}
                                    onClick={() => selectSuggestedTodo(i)}
                                    className="text-left px-3 py-2 rounded-lg text-sm"
                                    style={{ border: `1px solid ${SAND}`, color: "#5A5A50" }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {addingOwnSuggestion ? (
                              <div className="rounded-lg p-3 mb-3" style={{ background: "#FEFCF7", border: `1px solid ${OCHRE}` }}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[10px] font-mono uppercase tracking-wide" style={{ color: OCHRE }}>Your own talking point</p>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => setOwnSuggestionMode("text")}
                                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                      style={{ background: ownSuggestionMode === "text" ? MOSS : "transparent", color: ownSuggestionMode === "text" ? "#fff" : INK, border: `1px solid ${ownSuggestionMode === "text" ? MOSS : SAND}` }}
                                    >
                                      <PenLine size={11} /> Type
                                    </button>
                                    <button
                                      onClick={() => setOwnSuggestionMode("voice")}
                                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                      style={{ background: ownSuggestionMode === "voice" ? MOSS : "transparent", color: ownSuggestionMode === "voice" ? "#fff" : INK, border: `1px solid ${ownSuggestionMode === "voice" ? MOSS : SAND}` }}
                                    >
                                      <Mic size={11} /> Speak
                                    </button>
                                  </div>
                                </div>

                                {ownSuggestionMode === "voice" && !ownSuggestionVoiceCaptured ? (
                                  <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: "#fff" }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: CLAY }}>
                                      <Mic size={14} color="#fff" />
                                    </div>
                                    <div className="flex items-end gap-1 h-5 flex-1">
                                      {[5,10,6,13,8,11,4].map((h,i) => <div key={i} style={{ width: 3, height: h, background: MOSS, borderRadius: 2 }} />)}
                                    </div>
                                    <button onClick={fillOwnSuggestionFromVoice} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full shrink-0" style={{ background: MOSS, color: "#fff" }}>
                                      <Sparkles size={11} /> Fill in
                                    </button>
                                  </div>
                                ) : (
                                  <textarea
                                    value={ownSuggestionDraft}
                                    onChange={(e) => setOwnSuggestionDraft(e.target.value)}
                                    rows={2}
                                    placeholder="What do you actually want to bring up?"
                                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                                    style={{ border: `1px solid ${SAND}` }}
                                  />
                                )}

                                <div className="flex gap-2 mt-2">
                                  <button onClick={saveOwnSuggestion} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: MOSS, color: "#fff" }}>
                                    <Check size={12} /> Use this one
                                  </button>
                                  <button onClick={() => setAddingOwnSuggestion(false)} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: `1px solid ${SAND}` }}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={openOwnSuggestion}
                                className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-3"
                                style={{ border: `1px dashed ${OCHRE}`, color: OCHRE }}
                              >
                                <Plus size={13} /> Add your own
                              </button>
                            )}

                            <div className="flex gap-2 flex-wrap">
                              <button onClick={() => acceptSuggestedTodo("message")} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: MOSS, color: "#fff" }}>
                                <Check size={12} /> Add to to-dos
                              </button>
                              <button
                                onClick={() => { sendTodoToCompose(c.name, suggestedTodos.options[suggestedTodos.selected]); setSuggestedTodos(null); }}
                                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full"
                                style={{ border: `1px solid ${MOSS}`, color: MOSS }}
                              >
                                <Send size={12} /> Send as a message instead
                              </button>
                              <button
                                onClick={() => acceptSuggestedTodo("inperson")}
                                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full"
                                style={{ border: `1px solid ${OCHRE}`, color: OCHRE }}
                              >
                                <Handshake size={12} /> Save for in person or a call
                              </button>
                              <button onClick={skipSuggestedTodo} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: `1px solid ${SAND}` }}>Skip</button>
                            </div>
                          </div>
                        )}

                        <div
                          ref={(el) => (todosRefs.current[c.name] = el)}
                          className="rounded-xl p-4 transition-shadow"
                          style={{
                            background: PAPER,
                            boxShadow: highlightContact === c.name ? `0 0 0 2px ${OCHRE}` : "none",
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Lightbulb size={15} color={OCHRE} className="shrink-0" />
                              <p className="text-sm font-medium">Before you see them next</p>
                            </div>
                            <button
                              onClick={() => suggestFromWholeProfile(c)}
                              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                              style={{ border: `1px solid ${OCHRE}`, color: OCHRE }}
                              title="Suggest talking points from her whole profile, not just the latest addition"
                            >
                              <Sparkles size={11} /> Suggest from her whole profile
                            </button>
                          </div>

                          <div className="grid gap-2 mb-3">
                            {c.todos.map((t) => (
                              <div key={t.id} className="flex items-start gap-2 group">
                                <button onClick={() => toggleTodo(c.name, t.id)} className="mt-0.5 shrink-0">
                                  {t.done ? <CheckSquare size={16} color={MOSS} /> : <Square size={16} className="opacity-50" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={"text-sm " + (t.done ? "line-through opacity-50" : "")}>{t.text}</p>
                                  {t.channel === "inperson" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded mt-1" style={{ background: t.done ? "transparent" : "#F1ECDD", color: OCHRE, opacity: t.done ? 0.5 : 1 }}>
                                      <Handshake size={10} /> {t.done ? "Done \u2014 logged to timeline" : "In person or a call"}
                                    </span>
                                  )}
                                </div>
                                {!t.done && t.channel !== "inperson" && (
                                  <button
                                    onClick={() => sendTodoToCompose(c.name, t.text)}
                                    className="opacity-40 hover:opacity-100 shrink-0"
                                    title="Turn this into a message"
                                  >
                                    <Send size={13} color={MOSS} />
                                  </button>
                                )}
                                <button onClick={() => removeTodo(c.name, t.id)} className="opacity-30 hover:opacity-70 shrink-0">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                            {c.todos.length === 0 && <p className="text-sm opacity-50">Nothing queued yet.</p>}
                          </div>

                          {addingTodoFor === c.name ? (
                            <div>
                              <div className="flex gap-1.5 mb-2">
                                <button
                                  onClick={() => setTodoMode("text")}
                                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: todoMode === "text" ? MOSS : "transparent", color: todoMode === "text" ? "#fff" : INK, border: `1px solid ${todoMode === "text" ? MOSS : SAND}` }}
                                >
                                  <PenLine size={11} /> Type
                                </button>
                                <button
                                  onClick={() => setTodoMode("voice")}
                                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: todoMode === "voice" ? MOSS : "transparent", color: todoMode === "voice" ? "#fff" : INK, border: `1px solid ${todoMode === "voice" ? MOSS : SAND}` }}
                                >
                                  <Mic size={11} /> Speak
                                </button>
                              </div>

                              {todoMode === "voice" && !todoVoiceCaptured ? (
                                <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: "#fff" }}>
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: CLAY }}>
                                    <Mic size={14} color="#fff" />
                                  </div>
                                  <div className="flex items-end gap-1 h-5 flex-1">
                                    {[5,10,6,13,8,11,4].map((h,i) => <div key={i} style={{ width: 3, height: h, background: MOSS, borderRadius: 2 }} />)}
                                  </div>
                                  <button onClick={fillTodoFromVoice} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full shrink-0" style={{ background: MOSS, color: "#fff" }}>
                                    <Sparkles size={11} /> Fill in
                                  </button>
                                </div>
                              ) : (
                                <input
                                  value={todoDraft}
                                  onChange={(e) => setTodoDraft(e.target.value)}
                                  placeholder="What should you do before you see them next?"
                                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                  style={{ border: `1px solid ${SAND}` }}
                                />
                              )}

                              <div className="flex gap-2 mt-2">
                                <button onClick={() => saveTodo(c.name)} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: MOSS, color: "#fff" }}>
                                  <Check size={12} /> Add
                                </button>
                                <button onClick={() => setAddingTodoFor(null)} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ border: `1px solid ${SAND}` }}>Cancel</button>
                              </div>

                              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${SAND}` }}>
                                <p className="text-[10px] font-mono uppercase tracking-wide opacity-50 mb-1.5">When it's done, it becomes</p>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => setTodoChannel("message")}
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                    style={{ background: todoChannel === "message" ? MOSS : "transparent", color: todoChannel === "message" ? "#fff" : INK, border: `1px solid ${todoChannel === "message" ? MOSS : SAND}` }}
                                  >
                                    <Send size={11} /> A message
                                  </button>
                                  <button
                                    onClick={() => setTodoChannel("inperson")}
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                    style={{ background: todoChannel === "inperson" ? OCHRE : "transparent", color: todoChannel === "inperson" ? "#fff" : INK, border: `1px solid ${todoChannel === "inperson" ? OCHRE : SAND}` }}
                                  >
                                    <Handshake size={11} /> In person or a call
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => openAddTodo(c.name)}
                              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
                              style={{ border: `1px dashed ${MOSS}`, color: MOSS }}
                            >
                              <Plus size={13} /> Add to-do
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: IMPACT */}
        {step === 6 && (() => {
          const stageOrder = ["seed", "sprout", "budding", "bloom"];
          const total = contacts.length;
          const counts = stageOrder.map((s) => contacts.filter((c) => c.stage === s).length);
          const progressedCount = total - counts[0];
          const progressedPct = total ? Math.round((progressedCount / total) * 100) : 0;

          const gaps = contacts
            .filter((c) => c.timeline.length >= 2 && !c.timeline[1].manual)
            .map((c) => {
              const d0 = new Date(c.timeline[0].dateISO);
              const d1 = new Date(c.timeline[1].dateISO);
              return Math.round((d1 - d0) / (1000 * 60 * 60 * 24));
            });
          const avgDays = gaps.length ? (gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0;

          return (
            <div>
              <h2 className="font-display text-2xl mb-2">Is this actually working?</h2>
              <p className="opacity-70 mb-6 text-sm">The honest numbers — not vanity metrics, just whether relationships are actually moving.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                  <p className="text-2xl font-display" style={{ color: MOSS }}>{progressedPct}%</p>
                  <p className="text-xs opacity-60 mt-1">of captured contacts moved past Seed — i.e. the follow-up landed</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                  <p className="text-2xl font-display" style={{ color: MOSS }}>{avgDays === 0 ? "same day" : `${avgDays.toFixed(1)}d`}</p>
                  <p className="text-xs opacity-60 mt-1">average time from capture to first follow-up</p>
                </div>
              </div>

              <h3 className="font-mono text-xs uppercase tracking-widest opacity-60 mb-3">Where relationships actually go</h3>
              <div className="rounded-2xl p-5 mb-6" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                <div className="flex h-3 rounded-full overflow-hidden mb-4">
                  {stageOrder.map((s) => (
                    <div key={s} style={{ width: total ? `${(contacts.filter((c) => c.stage === s).length / total) * 100}%` : "0%", background: stageMeta[s].color }} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {stageOrder.map((s, i) => {
                    const meta = stageMeta[s];
                    return (
                      <div key={s} className="flex flex-col items-center text-center">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1" style={{ background: meta.color, color: meta.textColor }}>
                          <meta.icon size={13} />
                        </div>
                        <p className="text-sm font-medium">{counts[i]}</p>
                        <p className="text-[10px] opacity-60">{meta.label.split(" — ")[0]}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-1.5 mt-4 pt-4" style={{ borderTop: `1px solid ${SAND}` }}>
                  {stageOrder.map((s) => {
                    const meta = stageMeta[s];
                    const auto = s === "seed" || s === "sprout";
                    const Icn = auto ? Check : s === "bloom" ? CalendarPlus : Pencil;
                    return (
                      <div key={s} className="flex items-center gap-2 text-[11px] opacity-60">
                        <Icn size={11} className="shrink-0" style={{ color: auto || s === "bloom" ? MOSS : OCHRE }} />
                        <span className="font-medium shrink-0" style={{ width: 56 }}>{meta.label.split(" — ")[0]}</span>
                        <span>{meta.verified}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs opacity-50 mt-1">This is the whole measure, on purpose — no revenue or outcome tracking to log. If relationships are moving from Seed to Bloom, it's working.</p>
            </div>
          );
        })()}
      </div>

      {pushOpen && (() => {
        const pushContactName = composeOverride ? composeOverride.contact : "Elena Duarte";
        const record = contacts.find((c) => c.name === pushContactName);
        return (
          <PushPreview
            platform={platform}
            text={messageEdits[platform] ?? (composeOverride ? composeOverride.texts[platform] : platformCopy[platform].text)}
            contactName={pushContactName}
            phone={record?.phone}
            email={record?.email}
            linkedin={record?.linkedin}
            sent={sent}
            onSend={() => setSent(true)}
            onClose={closePush}
          />
        );
      })()}
    </div>
  );
}

function PushPreview({ platform, text, contactName, phone, email, linkedin, sent, onSend, onClose }) {
  const initials = contactName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const contactSub = platform === "email" ? (email || "—") : platform === "linkedin" ? (linkedin || "—") : (phone || "—");
  const [copied, setCopied] = useState(false);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: "rgba(27,29,22,0.55)" }}
    >
      <div className="w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl" style={{ background: "#fff", border: `8px solid ${INK}` }}>

        {/* WHATSAPP / SMS style thread */}
        {(platform === "whatsapp" || platform === "sms") && (
          <div className="flex flex-col" style={{ height: 520 }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: MOSS, color: "#fff" }}>
              <ChevronLeft size={18} onClick={onClose} className="cursor-pointer" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs" style={{ background: OCHRE }}>{initials}</div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight">{contactName}</p>
                <p className="text-[11px] opacity-70 leading-tight">{platform === "whatsapp" ? "online" : contactSub}</p>
              </div>
              {platform === "whatsapp" ? <Video size={16} className="opacity-80" /> : <Phone size={16} className="opacity-80" />}
              <MoreVertical size={16} className="opacity-80" />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-end gap-2" style={{ background: PAPER }}>
              {sent ? (
                <div className="self-end max-w-[80%] rounded-2xl rounded-br-sm px-3 py-2 text-sm" style={{ background: OCHRE, color: "#fff" }}>
                  {text}
                  <div className="text-[10px] opacity-80 mt-1 text-right">Sent ✓✓</div>
                </div>
              ) : (
                <div className="self-end max-w-[85%] text-xs opacity-50 italic px-2">Drafted — waiting in the message box below</div>
              )}
            </div>
            <div className="flex items-center gap-2 p-3" style={{ background: "#fff", borderTop: `1px solid ${SAND}` }}>
              <Smile size={18} className="opacity-40 shrink-0" />
              <div className="flex-1 rounded-full px-3 py-2 text-xs leading-snug" style={{ background: PAPER, border: `1px solid ${SAND}`, maxHeight: 70, overflow: "auto" }}>
                {sent ? "" : text}
              </div>
              {!sent && (
                <button onClick={onSend} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: MOSS }}>
                  <Send size={14} color="#fff" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* EMAIL style compose */}
        {platform === "email" && (
          <div className="flex flex-col" style={{ height: 520 }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: MOSS, color: "#fff" }}>
              <div className="flex items-center gap-2">
                <ChevronLeft size={18} onClick={onClose} className="cursor-pointer" />
                <span className="text-sm font-medium">New Message</span>
              </div>
              {!sent ? (
                <button onClick={onSend} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: OCHRE }}>Send</button>
              ) : (
                <span className="text-xs font-medium flex items-center gap-1"><Check size={13} /> Sent</span>
              )}
            </div>
            <div className="px-4 py-3 grid gap-2" style={{ borderBottom: `1px solid ${SAND}` }}>
              <div className="flex text-sm gap-2"><span className="opacity-50 w-14 shrink-0">To</span><span>{contactSub}</span></div>
              <div className="flex text-sm gap-2"><span className="opacity-50 w-14 shrink-0">Subject</span><span className="font-medium">{text.split("\n\n")[0].replace(/^Subject:\s*/, "")}</span></div>
            </div>
            <div className="flex-1 p-4 text-sm whitespace-pre-wrap overflow-auto" style={{ background: sent ? "#fff" : PAPER }}>
              {text.split("\n\n").slice(1).join("\n\n")}
            </div>
          </div>
        )}

        {/* LINKEDIN — honest version: opens profile, message copied, no pre-filled chat exists */}
        {platform === "linkedin" && (
          <div className="flex flex-col" style={{ height: 520 }}>
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: INK, color: "#fff" }}>
              <ChevronLeft size={18} onClick={onClose} className="cursor-pointer" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs" style={{ background: OCHRE }}>{initials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{contactName}</p>
                <p className="text-[11px] opacity-60 leading-tight truncate">{contactSub}</p>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3" style={{ background: PAPER }}>
              <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                <Info size={13} className="mt-0.5 shrink-0 opacity-50" />
                <p className="text-xs opacity-70">LinkedIn doesn't let outside apps open a pre-filled message. This opens her profile — the text below is copied for you to paste into the message box.</p>
              </div>
              <div className="rounded-lg p-3 text-sm" style={{ background: "#fff", border: `1px solid ${SAND}` }}>
                {text}
              </div>
            </div>
            <div className="p-3 flex gap-2" style={{ background: "#fff", borderTop: `1px solid ${SAND}` }}>
              <button
                onClick={() => setCopied(true)}
                className="flex-1 flex items-center justify-center gap-2 text-xs font-medium px-3 py-2.5 rounded-full"
                style={{ border: `1px solid ${SAND}` }}
              >
                {copied ? <><Check size={13} /> Copied</> : <>Copy message</>}
              </button>
              <button onClick={onSend} className="flex-1 flex items-center justify-center gap-2 text-xs font-medium px-3 py-2.5 rounded-full" style={{ background: OCHRE, color: "#fff" }}>
                Open her profile
              </button>
            </div>
          </div>
        )}

        {sent && (
          <div className="px-4 py-2 text-center" style={{ background: MOSS }}>
            <button onClick={onClose} className="text-xs font-medium text-white/90 py-1">Done — close preview</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Auth gate: shows the sign-up/login screen until there's a session,
// then renders the real app. This is the actual default export.
export default function App() {
  const session = useSession();
  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F1ECDD", color: "#2F4A3C", fontFamily: "sans-serif" }}>
        Loading…
      </div>
    );
  }
  if (!session) return <AuthScreen />;
  return <Afterglow key={session.user.id} />;
}
