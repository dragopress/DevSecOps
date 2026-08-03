import React, { useState } from "react";
import { 
  ShoppingBag, 
  Users, 
  Workflow, 
  BarChart3, 
  Zap, 
  Code2, 
  Terminal, 
  Play, 
  Check, 
  Copy, 
  Filter, 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Eye, 
  Layers, 
  Database, 
  Send, 
  Mail, 
  MessageSquare, 
  Tag, 
  CreditCard, 
  PackageCheck, 
  Store, 
  Activity, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  FileCode, 
  Smartphone,
  Sliders,
  DollarSign,
  TrendingUp,
  Maximize2,
  Trash2,
  Share2,
  MousePointer,
  PlayCircle,
  PauseCircle,
  RotateCcw
} from "lucide-react";

// Types for CDP & Commerce Module
export interface CdpCustomerProfile {
  id: string;
  primaryEmail: string;
  name: string;
  fingerprints: string[];
  lifetimeValue: number;
  totalOrders: number;
  segments: string[];
  lastSeen: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  location: string;
  gdprConsent: boolean;
  eventsCount: number;
}

export interface CdpEvent {
  id: string;
  customerId: string;
  eventType: 'page_view' | 'add_to_cart' | 'checkout_completed' | 'form_submit' | 'search_query';
  properties: Record<string, any>;
  timestamp: string;
  channel: 'Web' | 'iOS App' | 'Android App' | 'POS Store';
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePriceUSD: number;
  stockLevel: number;
  imageUrl: string;
  storefronts: string[];
}

export interface CampaignNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  label: string;
  config: string;
}

export const MartechCommerceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cdp' | 'automation' | 'commerce' | 'analytics' | 'architecture'>('cdp');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // --- 1. CDP STATE ---
  const [cdpSearchQuery, setCdpSearchQuery] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('usr_acme_8921');
  const [cdpEvents, setCdpEvents] = useState<CdpEvent[]>([
    {
      id: "evt_1001",
      customerId: "usr_acme_8921",
      eventType: "page_view",
      properties: { url: "/products/cloud-edge-gateway", referrer: "google.com" },
      timestamp: "2 mins ago",
      channel: "Web"
    },
    {
      id: "evt_1002",
      customerId: "usr_acme_8921",
      eventType: "add_to_cart",
      properties: { sku: "SKU-GW-900", price: 1250.00, qty: 2 },
      timestamp: "5 mins ago",
      channel: "Web"
    },
    {
      id: "evt_1003",
      customerId: "usr_acme_8921",
      eventType: "checkout_completed",
      properties: { orderId: "ORD-99012", total: 2500.00, currency: "USD" },
      timestamp: "12 mins ago",
      channel: "Web"
    },
    {
      id: "evt_1004",
      customerId: "usr_acme_3302",
      eventType: "add_to_cart",
      properties: { sku: "SKU-SaaS-ENT", price: 4999.00, qty: 1 },
      timestamp: "18 mins ago",
      channel: "iOS App"
    },
    {
      id: "evt_1005",
      customerId: "usr_acme_7741",
      eventType: "form_submit",
      properties: { formId: "enterprise_demo_request", companySize: "5000+" },
      timestamp: "35 mins ago",
      channel: "Web"
    }
  ]);

  const [customerProfiles, setCustomerProfiles] = useState<CdpCustomerProfile[]>([
    {
      id: "usr_acme_8921",
      primaryEmail: "alexandra.vance@fintech-corp.com",
      name: "Alexandra Vance",
      fingerprints: ["fp_chrome_9a82f", "cookie_sess_88190", "ios_idfv_3321"],
      lifetimeValue: 18450.00,
      totalOrders: 14,
      segments: ["VIP Enterprise", "High Intent Buyers", "Cloud Architecture"],
      lastSeen: "2 mins ago",
      deviceType: "Desktop",
      location: "New York, USA",
      gdprConsent: true,
      eventsCount: 342
    },
    {
      id: "usr_acme_3302",
      primaryEmail: "d.kovacs@cyber-defence.de",
      name: "Dieter Kovacs",
      fingerprints: ["fp_firefox_1192a", "cookie_sess_44120"],
      lifetimeValue: 8900.00,
      totalOrders: 5,
      segments: ["EU GDPR Compliant", "Cart Abandoner", "Security Leads"],
      lastSeen: "18 mins ago",
      deviceType: "Mobile",
      location: "Berlin, Germany",
      gdprConsent: true,
      eventsCount: 128
    },
    {
      id: "usr_acme_7741",
      primaryEmail: "sarah.connor@defense-global.org",
      name: "Sarah Connor",
      fingerprints: ["fp_safari_7721b"],
      lifetimeValue: 34200.00,
      totalOrders: 22,
      segments: ["FedRAMP Govt", "VIP Enterprise", "Deciders"],
      lastSeen: "35 mins ago",
      deviceType: "Desktop",
      location: "Washington D.C., USA",
      gdprConsent: true,
      eventsCount: 891
    }
  ]);

  // Event ingestion simulator
  const [simEventType, setSimEventType] = useState<'page_view' | 'add_to_cart' | 'checkout_completed' | 'form_submit'>('add_to_cart');
  const [simEventPayload, setSimEventPayload] = useState<string>(`{
  "sku": "SKU-AI-GEN-SUITE",
  "productName": "Generative AI Agent Ops Pro",
  "price": 2499.00,
  "currency": "USD"
}`);

  // --- 2. MARKETING AUTOMATION STATE ---
  const [campaignNodes, setCampaignNodes] = useState<CampaignNode[]>([
    { id: "node-1", type: "trigger", label: "Event: Cart Abandoned", config: "Inactivity > 15 Minutes" },
    { id: "node-2", type: "condition", label: "Check: Cart Value > $500", config: "High-Value Shopping Basket" },
    { id: "node-3", type: "action", label: "Send Discount SMS via Twilio", config: "Coupon: VIP15OFF (15% Discount)" },
    { id: "node-4", type: "delay", label: "Wait: 24 Hours", config: "Check Conversion State" },
    { id: "node-5", type: "action", label: "Trigger CRM Webhook", config: "POST https://crm.acme.com/api/v1/leads" }
  ]);

  const [campaignStatus, setCampaignStatus] = useState<'Active' | 'Paused' | 'Draft'>('Active');
  const [webhookLogs, setWebhookLogs] = useState<{ id: string; event: string; recipient: string; status: string; time: string }[]>([
    { id: "wh_01", event: "email.delivered", recipient: "a.vance@fintech-corp.com", status: "200 OK", time: "Just now" },
    { id: "wh_02", event: "sms.sent", recipient: "+1 (555) 019-2831", status: "201 Created", time: "3 mins ago" },
    { id: "wh_03", event: "email.opened", recipient: "d.kovacs@cyber-defence.de", status: "200 OK", time: "10 mins ago" }
  ]);

  // --- 3. COMMERCE & OMS STATE ---
  const [selectedStorefront, setSelectedStorefront] = useState<'us' | 'eu' | 'b2b'>('us');
  const [cartItems, setCartItems] = useState<{ product: ProductItem; qty: number }[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [activeOrderStatus, setActiveOrderStatus] = useState<string | null>(null);

  const products: ProductItem[] = [
    {
      id: "p1",
      sku: "SKU-CLOUD-GATEWAY",
      name: "Enterprise Multi-Tenant API Gateway",
      category: "Infrastructure",
      basePriceUSD: 1499.00,
      stockLevel: 450,
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=80",
      storefronts: ["us", "eu", "b2b"]
    },
    {
      id: "p2",
      sku: "SKU-AI-GENOPS",
      name: "Autonomous AI Agent Ops Suite",
      category: "AI & Automation",
      basePriceUSD: 2999.00,
      stockLevel: 999,
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      storefronts: ["us", "eu", "b2b"]
    },
    {
      id: "p3",
      sku: "SKU-CDP-TITAN",
      name: "Real-Time CDP Event Collector Titan",
      category: "Analytics & CDP",
      basePriceUSD: 1999.00,
      stockLevel: 120,
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop&q=80",
      storefronts: ["us", "b2b"]
    }
  ];

  // API Sandbox query
  const [graphqlQuery, setGraphqlQuery] = useState<string>(`query GetStorefrontCatalogAndCDP($storefront: String!, $customerId: String!) {
  storefront(code: $storefront) {
    name
    currency
    products {
      sku
      name
      price
      inventoryStatus
    }
  }
  customerProfile(id: $customerId) {
    primaryEmail
    lifetimeValue
    segments
  }
}`);
  const [graphqlResult, setGraphqlResult] = useState<string | null>(null);

  // --- 4. SESSION REPLAY & FUNNEL STATE ---
  const [isPlayingSession, setIsPlayingSession] = useState<boolean>(false);
  const [sessionProgress, setSessionProgress] = useState<number>(35);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Ingest Real-Time Event
  const handleFireCdpEvent = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedProps = JSON.parse(simEventPayload);
      const newEvt: CdpEvent = {
        id: `evt_${Date.now()}`,
        customerId: selectedProfileId,
        eventType: simEventType,
        properties: parsedProps,
        timestamp: "Just now",
        channel: "Web"
      };

      setCdpEvents(prev => [newEvt, ...prev]);
      // Update customer stats
      setCustomerProfiles(prev => prev.map(p => {
        if (p.id === selectedProfileId) {
          return {
            ...p,
            eventsCount: p.eventsCount + 1,
            lastSeen: "Just now"
          };
        }
        return p;
      }));

      showToast(`Ingested real-time '${simEventType}' event for ${selectedProfileId}!`);
    } catch (err) {
      showToast("Error: Event payload must be valid JSON format.");
    }
  };

  // Add Item to Cart
  const handleAddToCart = (product: ProductItem) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`Added ${product.name} to cart.`);
  };

  // Calculate cart subtotal with dynamic store multiplier
  const currencySymbol = selectedStorefront === 'eu' ? '€' : '$';
  const currencyRate = selectedStorefront === 'eu' ? 0.92 : (selectedStorefront === 'b2b' ? 0.85 : 1.0);

  const cartSubtotalUSD = cartItems.reduce((acc, item) => acc + (item.product.basePriceUSD * item.qty), 0);
  const finalPrice = cartSubtotalUSD * currencyRate;

  // Simulate OMS Checkout Pipeline
  const handleExecuteCheckout = () => {
    if (cartItems.length === 0) {
      showToast("Cart is empty! Add products first.");
      return;
    }
    setActiveOrderStatus("RESERVED_INVENTORY");
    setTimeout(() => {
      setActiveOrderStatus("PAYMENT_AUTHORIZED");
      setTimeout(() => {
        setActiveOrderStatus("FULFILLED_COMPLETED");
        showToast("Order completed successfully! OMS inventory reserved and invoice created.");
        setCartItems([]);
      }, 1000);
    }, 1000);
  };

  // Execute API Query
  const handleRunApiQuery = () => {
    setGraphqlResult(JSON.stringify({
      data: {
        storefront: {
          name: selectedStorefront === 'us' ? 'US Flagship Storefront' : (selectedStorefront === 'eu' ? 'European Union Regional Hub' : 'B2B Enterprise Portal'),
          currency: selectedStorefront === 'eu' ? 'EUR' : 'USD',
          products: products.map(p => ({
            sku: p.sku,
            name: p.name,
            calculatedPrice: (p.basePriceUSD * currencyRate).toFixed(2),
            inventoryStatus: p.stockLevel > 0 ? 'IN_STOCK' : 'BACKORDER'
          }))
        },
        customerProfile: customerProfiles.find(c => c.id === selectedProfileId)
      },
      extensions: {
        cdpLatencyMs: 4,
        dynamicPricingRuleApplied: selectedStorefront === 'b2b' ? '15% Tier 1 Wholesale Discount' : 'Standard MSRP'
      }
    }, null, 2));
  };

  const selectedProfile = customerProfiles.find(p => p.id === selectedProfileId) || customerProfiles[0];

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-800 border border-indigo-500/80 text-indigo-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-pink-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Pillar 1 Operational Service
              </span>
              <span className="text-xs font-mono text-pink-300 bg-pink-950/60 border border-pink-800/60 px-2.5 py-0.5 rounded-md">
                Unica & Headless Commerce Suite
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-8 h-8 text-pink-400" />
              Customer Experience, CDP & Headless Commerce
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Unified customer data platform (CDP), real-time behavioral event ingestion, visual node-based campaign automation engine, multi-storefront headless commerce catalog, and experience analytics.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex flex-col border-r border-slate-800 pr-4">
              <span className="text-slate-400 font-sans font-medium">Unified CDP Graph</span>
              <span className="text-pink-400 font-bold mt-0.5">3 Profiles / 1,361 Events</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-sans font-medium">Headless OMS</span>
              <span className="text-emerald-400 font-bold mt-0.5">Multi-Currency Ready</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('cdp')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cdp'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/40 border border-pink-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Users className="w-4 h-4 text-pink-300" />
            <span>Customer Data Platform (CDP)</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'automation'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/40 border border-pink-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Workflow className="w-4 h-4 text-purple-300" />
            <span>Marketing Automation (Unica Engine)</span>
          </button>

          <button
            onClick={() => setActiveTab('commerce')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'commerce'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/40 border border-pink-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Store className="w-4 h-4 text-amber-300" />
            <span>Headless Commerce & OMS</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/40 border border-pink-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-300" />
            <span>Experience Analytics & Session Replay</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/40 border border-pink-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-300" />
            <span>Microservice Repo & Contracts</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CUSTOMER DATA PLATFORM (CDP) */}
      {activeTab === 'cdp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Directory */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-400" />
                  Unified Customer Identities
                </h2>
                <span className="text-[10px] font-mono bg-pink-950 text-pink-300 border border-pink-800/80 px-2 py-0.5 rounded">
                  Deterministic Match
                </span>
              </div>

              {/* Profiles list */}
              <div className="space-y-2.5">
                {customerProfiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      selectedProfileId === profile.id
                        ? 'bg-slate-800/90 border-pink-500/80 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{profile.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">${profile.lifetimeValue.toLocaleString()} LTV</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{profile.primaryEmail}</div>
                    
                    <div className="flex flex-wrap gap-1 pt-1">
                      {profile.segments.map((seg, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 text-[9px] rounded font-mono">
                          {seg}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Profile Inspector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Identity Graph Profile: {selectedProfile.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Profile ID: {selectedProfile.id}</span>
                </div>

                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono font-bold">
                  GDPR Consent: Active
                </span>
              </div>

              {/* Trait Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans text-[11px]">Lifetime Value</span>
                  <div className="text-emerald-400 font-bold text-sm">${selectedProfile.lifetimeValue.toLocaleString()}</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans text-[11px]">Total Orders</span>
                  <div className="text-indigo-300 font-bold text-sm">{selectedProfile.totalOrders} Completed</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans text-[11px]">Device & Fingerprints</span>
                  <div className="text-purple-300 font-bold text-sm">{selectedProfile.fingerprints.length} Linked Hashes</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans text-[11px]">Location</span>
                  <div className="text-amber-300 font-bold text-sm truncate">{selectedProfile.location}</div>
                </div>
              </div>

              {/* Linked Identity Hashes */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Resolved Device Fingerprints & Cookie Tokens
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {selectedProfile.fingerprints.map((fp, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-900 text-indigo-300 border border-indigo-800/60 rounded-md">
                      {fp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingest Event Simulator Form */}
              <form onSubmit={handleFireCdpEvent} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-pink-400" />
                    Simulate Real-Time Behavioral Event Ingestion (`POST /api/v1/cdp/events`)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Live Ingestion Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Event Type:</label>
                    <select
                      value={simEventType}
                      onChange={(e) => setSimEventType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-pink-300 rounded-lg p-2 font-mono"
                    >
                      <option value="page_view">page_view</option>
                      <option value="add_to_cart">add_to_cart</option>
                      <option value="checkout_completed">checkout_completed</option>
                      <option value="form_submit">form_submit</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-1">Event Payload (JSON):</label>
                    <input
                      type="text"
                      value={simEventPayload}
                      onChange={(e) => setSimEventPayload(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-emerald-300 rounded-lg p-2 font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fire Real-Time Behavioral Event</span>
                </button>
              </form>

              {/* Event Stream Log Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Real-Time Event Stream Log
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Event Type</th>
                        <th className="py-2.5 px-3">Customer ID</th>
                        <th className="py-2.5 px-3">Channel</th>
                        <th className="py-2.5 px-3">Payload Properties</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {cdpEvents.map(evt => (
                        <tr key={evt.id} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-3 font-bold text-pink-300">{evt.eventType}</td>
                          <td className="py-2.5 px-3 text-slate-300">{evt.customerId}</td>
                          <td className="py-2.5 px-3 text-indigo-300">{evt.channel}</td>
                          <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{JSON.stringify(evt.properties)}</td>
                          <td className="py-2.5 px-3 text-slate-500">{evt.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKETING AUTOMATION & UNICA ENGINE */}
      {activeTab === 'automation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-400" />
                Unica-Inspired Visual Campaign Builder
              </h2>
              <p className="text-xs text-slate-400">Node-based multi-step trigger, condition, and action orchestration pipeline for omnichannel marketing automation.</p>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-xs font-mono font-bold rounded-full border ${
                campaignStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                Campaign State: {campaignStatus}
              </span>

              <button
                onClick={() => setCampaignStatus(prev => prev === 'Active' ? 'Paused' : 'Active')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer"
              >
                Toggle State
              </button>
            </div>
          </div>

          {/* Canvas Nodes */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden">
            <div className="text-xs text-slate-400 font-mono mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Active Workflow DAG Pipeline (Trigger → Condition → Action → Delay → Webhook)
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
              {campaignNodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <div className={`p-4 rounded-xl border w-full md:w-56 space-y-2 transition-all ${
                    node.type === 'trigger'
                      ? 'bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-lg'
                      : node.type === 'condition'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-lg'
                      : node.type === 'delay'
                      ? 'bg-blue-950/40 border-blue-500/50 text-blue-200 shadow-lg'
                      : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-lg'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold">
                      <span>Step {index + 1}: {node.type}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="font-extrabold text-xs text-white">{node.label}</div>
                    <p className="text-[11px] text-slate-300 font-mono">{node.config}</p>
                  </div>

                  {index < campaignNodes.length - 1 && (
                    <div className="flex md:flex-col items-center justify-center text-slate-600 my-1 md:my-0">
                      <ArrowRight className="w-5 h-5 hidden md:block text-purple-400" />
                      <ChevronRight className="w-5 h-5 md:hidden text-purple-400" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Webhook Delivery Log */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Omnichannel Delivery Webhook Logs (Twilio / SendGrid)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900 uppercase text-[10px]">
                    <th className="py-2.5 px-4">Webhook ID</th>
                    <th className="py-2.5 px-4">Event Type</th>
                    <th className="py-2.5 px-4">Recipient</th>
                    <th className="py-2.5 px-4">HTTP Callback Status</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {webhookLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-4 text-slate-400">{log.id}</td>
                      <td className="py-2.5 px-4 font-bold text-purple-300">{log.event}</td>
                      <td className="py-2.5 px-4 text-indigo-300">{log.recipient}</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-bold">{log.status}</td>
                      <td className="py-2.5 px-4 text-slate-500">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEADLESS COMMERCE & OMS */}
      {activeTab === 'commerce' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Catalog & Storefront Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-amber-400" />
                    Multi-Storefront Headless Catalog
                  </h2>
                  <p className="text-xs text-slate-400">Dynamic pricing engine & multi-currency MSRP overrides.</p>
                </div>

                {/* Storefront Pills */}
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setSelectedStorefront('us')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedStorefront === 'us' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    US Flagship ($)
                  </button>
                  <button
                    onClick={() => setSelectedStorefront('eu')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedStorefront === 'eu' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    EU Store (€)
                  </button>
                  <button
                    onClick={() => setSelectedStorefront('b2b')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedStorefront === 'b2b' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    B2B Wholesale (15% Off)
                  </button>
                </div>
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map(product => {
                  const calculatedPrice = (product.basePriceUSD * currencyRate).toFixed(2);
                  return (
                    <div key={product.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-28 object-cover rounded-lg border border-slate-800" />
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                          {product.category}
                        </span>
                        <h3 className="font-bold text-white text-xs">{product.name}</h3>
                        <div className="text-[11px] text-slate-500 font-mono">SKU: {product.sku}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">Price:</span>
                          <span className="text-emerald-400 font-extrabold text-sm">{currencySymbol}{calculatedPrice}</span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Headless GraphQL API Playground */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    Headless Storefront GraphQL API Sandbox
                  </span>
                  <button
                    onClick={handleRunApiQuery}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run GraphQL Query</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <textarea
                    value={graphqlQuery}
                    onChange={(e) => setGraphqlQuery(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-900 border border-slate-800 text-indigo-300 p-3 rounded-lg focus:outline-none text-[11px]"
                  />
                  <pre className="bg-slate-900 border border-slate-800 text-emerald-300 p-3 rounded-lg overflow-x-auto text-[11px] max-h-52">
                    {graphqlResult || '// Click "Run GraphQL Query" to execute against headless storefront mesh.'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Cart & OMS Checkout Workflow */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Headless Cart & OMS State
                </h2>
                <span className="text-xs text-indigo-300 font-mono">{cartItems.length} Items</span>
              </div>

              {/* Cart List */}
              <div className="space-y-2 min-h-36">
                {cartItems.length > 0 ? (
                  cartItems.map((item, i) => (
                    <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between font-mono">
                      <div>
                        <div className="font-bold text-white">{item.product.name}</div>
                        <div className="text-[10px] text-slate-500">Qty: {item.qty}</div>
                      </div>
                      <div className="text-emerald-400 font-bold">
                        {currencySymbol}{(item.product.basePriceUSD * item.qty * currencyRate).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs text-center py-10 font-sans">
                    Cart is empty. Click "Add to Cart" on catalog products.
                  </div>
                )}
              </div>

              {/* Subtotal & Checkout Button */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Cart Subtotal:</span>
                  <span className="font-bold text-white">{currencySymbol}{finalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Applied Storefront Rate:</span>
                  <span>{selectedStorefront.toUpperCase()}</span>
                </div>

                <button
                  onClick={handleExecuteCheckout}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Execute OMS Order Pipeline</span>
                </button>
              </div>

              {/* OMS State Monitor */}
              {activeOrderStatus && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl space-y-1 font-mono text-xs text-emerald-200">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    OMS Lifecycle State: {activeOrderStatus}
                  </div>
                  <p className="text-[11px] text-emerald-300">
                    {activeOrderStatus === 'RESERVED_INVENTORY' && '1. Reserving warehouse stock via Citus distributed lock...'}
                    {activeOrderStatus === 'PAYMENT_AUTHORIZED' && '2. Authorizing payment via Stripe headless intent...'}
                    {activeOrderStatus === 'FULFILLED_COMPLETED' && '3. Order fulfilled and dispatched to shipping pipeline!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPERIENCE ANALYTICS & SESSION REPLAY */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Experience Analytics & Session Replay Schema
              </h2>
              <p className="text-xs text-slate-400">Client-side event tracking snippet, session DOM mutation playback, and conversion funnel drop-off analysis.</p>
            </div>

            <button
              onClick={() => handleCopyCode(`<script src="https://cdn.saas-platform.com/analytics.js" data-tenant="tenant-01"></script>`, "Tracker Script")}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy JS Tracking Script</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Replay Simulator */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-cyan-400" />
                  User Session Recording Playback Simulator
                </h3>
                <span className="text-[10px] text-cyan-300 font-mono">Session ID: sess_9812a</span>
              </div>

              <div className="relative h-48 bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>URL: /checkout/payment</span>
                  <span>Duration: 02:45</span>
                </div>

                {/* Simulated mouse pointer */}
                <div 
                  className="absolute transition-all duration-500 flex items-center space-x-1"
                  style={{ top: `${sessionProgress}%`, left: `${sessionProgress * 1.5}%` }}
                >
                  <MousePointer className="w-4 h-4 text-pink-400 fill-pink-400 animate-bounce" />
                  <span className="px-2 py-0.5 bg-pink-950 border border-pink-500 text-pink-200 text-[10px] rounded font-mono">
                    Click: Checkout Submit
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <button
                      onClick={() => setIsPlayingSession(!isPlayingSession)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {isPlayingSession ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      <span>{isPlayingSession ? 'Pause Playback' : 'Play Session'}</span>
                    </button>
                    <span className="text-slate-400">{sessionProgress}% Scrubbed</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sessionProgress}
                    onChange={(e) => setSessionProgress(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Conversion Funnel Visualizer */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Multi-Stage Conversion Funnel Drop-off Analysis
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>1. Landing Page Views</span>
                    <span className="font-bold text-white">10,000 Visitors (100%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>2. Product Catalog View</span>
                    <span className="font-bold text-white">6,200 Visitors (62%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>3. Add to Cart</span>
                    <span className="font-bold text-white">2,800 Visitors (28%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1 text-emerald-400">
                    <span>4. Completed Purchase</span>
                    <span className="font-bold">650 Orders (6.5% Conversion)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '6.5%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MICROSERVICE REPO CONTRACTS */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              Isolated Service Repository Specs & Contracts
            </h2>
            <p className="text-xs text-slate-400">Dockerfile, gRPC proto definitions, and Citus database schema specifications for Module 1.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
            {/* Dockerfile */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 font-bold block text-indigo-300">Dockerfile (Isolated Container Build)</span>
              <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]`}
              </pre>
            </div>

            {/* gRPC Proto */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 font-bold block text-emerald-300">cdp_service.proto (gRPC Contract)</span>
              <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{`syntax = "proto3";
package martech.cdp.v1;

service CustomerDataPlatform {
  rpc IngestEvent (IngestEventRequest) returns (IngestEventResponse);
  rpc ResolveIdentity (IdentityRequest) returns (CustomerProfile);
}

message IngestEventRequest {
  string tenant_id = 1;
  string customer_id = 2;
  string event_type = 3;
  string payload_json = 4;
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
