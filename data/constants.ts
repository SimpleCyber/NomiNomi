import {
  Home,
  Tv,
  MessageCircle,
  RefreshCcw,
  User,
  PlusCircle,
  HelpCircle,
} from "lucide-react";

// --- Types ---

export interface Market {
  id: number | string;
  name: string;
  symbol: string;
  price: string;
  volume: string;
  marketCap: string;
  change: string;
  change5m: string;
  change1h: string;
  change6h: string;
  isPositive: boolean;
  chartData: number[];
  bondingCurve: number;
  ath: string;
  age: string;
  txns: number;
  traders: number;
  image: string;
  description?: string;
  creatorAddress?: string;
  createdAt?: any;
}

export interface MenuItem {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
}

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  align: string;
}

export interface MarketStatItem {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

export interface SearchResultCoin {
  name: string;
  symbol: string;
  price: string;
  age: string;
  image: string;
}

export interface SearchResultUser {
  name: string;
  followers: string;
  image: string;
}

// --- Data ---

export const MARKETS: Market[] = [
  {
    id: 1,
    name: "HAPPYSANTA",
    symbol: "Santa",
    price: "$15.80K",
    volume: "$414.38",
    marketCap: "$15.80K",
    change: "+298.45%",
    change5m: "-",
    change1h: "+298.45%",
    change6h: "+298.45%",
    isPositive: true,
    chartData: [10, 12, 11, 13, 15, 20, 25, 30, 35, 40],
    bondingCurve: 95,
    ath: "$15.9K",
    age: "17m",
    txns: 57,
    traders: 4,
    image: "/santa.png",
  },
  {
    id: 2,
    name: "butterjak",
    symbol: "butterjak",
    price: "$18.88K",
    volume: "$18.35K",
    marketCap: "$18.88K",
    change: "+263.51%",
    change5m: "+263.51%",
    change1h: "+263.51%",
    change6h: "+263.51%",
    isPositive: true,
    chartData: [20, 22, 25, 28, 30, 35, 40, 45, 50, 55],
    bondingCurve: 45,
    ath: "$26.7K",
    age: "1m",
    txns: 159,
    traders: 106,
    image: "/butterjak.png",
  },
  {
    id: 3,
    name: "The Spiderkid",
    symbol: "Spiderkid",
    price: "$19.53K",
    volume: "$37.22K",
    marketCap: "$19.53K",
    change: "+280.50%",
    change5m: "+67.92%",
    change1h: "+280.50%",
    change6h: "+280.50%",
    isPositive: true,
    chartData: [15, 18, 20, 22, 25, 24, 28, 32, 35, 38],
    bondingCurve: 60,
    ath: "$20.6K",
    age: "6m",
    txns: 789,
    traders: 296,
    image: "/spiderkid.png",
  },
  {
    id: 4,
    name: "Perillius Portal",
    symbol: "Perillius",
    price: "$25.74K",
    volume: "$212.58K",
    marketCap: "$25.74K",
    change: "+453.60%",
    change5m: "-28.52%",
    change1h: "+453.60%",
    change6h: "+453.60%",
    isPositive: true,
    chartData: [10, 15, 25, 35, 30, 25, 20, 15, 10, 12],
    bondingCurve: 30,
    ath: "$61.9K",
    age: "28m",
    txns: 3840,
    traders: 1006,
    image: "/portal.png",
  },
  {
    id: 5,
    name: "Stranger Things",
    symbol: "5",
    price: "$15.42K",
    volume: "$5.22K",
    marketCap: "$15.42K",
    change: "+266.41%",
    change5m: "-0.47%",
    change1h: "+266.41%",
    change6h: "+266.41%",
    isPositive: true,
    chartData: [12, 13, 14, 15, 16, 18, 20, 22, 24, 26],
    bondingCurve: 90,
    ath: "$15.5K",
    age: "9m",
    txns: 59,
    traders: 5,
    image: "/stranger.png",
  },
  {
    id: 6,
    name: "Phone Wojak",
    symbol: "PHONEWOJAK",
    price: "$184.27K",
    volume: "$1.72M",
    marketCap: "$184.27K",
    change: "+2,762.70%",
    change5m: "+1.37%",
    change1h: "-86.10%",
    change6h: "+2,762.70%",
    isPositive: true,
    chartData: [10, 20, 15, 30, 25, 40, 35, 50, 45, 60],
    bondingCurve: 85,
    ath: "$184.5K",
    age: "2h",
    txns: 10348,
    traders: 2537,
    image: "/wojak.png",
  },
  {
    id: 7,
    name: "Anna",
    symbol: "Anna",
    price: "$6.55K",
    volume: "$61.17K",
    marketCap: "$6.55K",
    change: "+55.92%",
    change5m: "-52.77%",
    change1h: "-25.77%",
    change6h: "+55.92%",
    isPositive: true,
    chartData: [30, 28, 32, 35, 38, 36, 34, 32, 30, 28],
    bondingCurve: 25,
    ath: "$15.9K",
    age: "1h",
    txns: 1522,
    traders: 363,
    image: "/anna.png",
  },
];

export const MENU_ITEMS: MenuItem[] = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Live stream", icon: Tv, href: "/livestream" },
  { name: "Chat Friends", icon: MessageCircle, href: "/chat" },
  { name: "Swap Coins", icon: RefreshCcw, href: "/swap" },
  { name: "My Profile", icon: User, href: "/profile" },
  { name: "Create coin", icon: PlusCircle, href: "/createcoin" },
];

export const BOTTOM_MENU_ITEMS: MenuItem[] = [
  { name: "Support", icon: HelpCircle, href: "/support" },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: "/home-banner-season-4.webp",
    title: "Season 4 is Here",
    description: "Trade to earn rewards in the new season.",
    buttonText: "Join Now",
    buttonLink: "#",
    align: "left",
  },
  {
    id: 2,
    image: "/home-banner-stacked-yield-usd-new.webp",
    title: "Stacked Yield",
    description: "Earn yield on your ADA assets.",
    buttonText: "Start Earning",
    buttonLink: "#",
    align: "left",
  },
  {
    id: 3,
    image: "/home-banner-stacked-yield-sol-new.webp",
    title: "Stacked Yield",
    description: "Earn yield on your ADA assets.",
    buttonText: "Start Earning",
    buttonLink: "#",
    align: "left",
  },
  {
    id: 4,
    image: "/home-banner-usdt-4.webp",
    title: "Got USDT?",
    description: "Convert to USD with 0 fees and start trading on NomiNomi!",
    buttonText: "Trade USDT",
    buttonLink: "#",
    align: "left",
  },
  {
    id: 5,
    image: "/home-banner-refer-3.webp",
    title: "Refer Friends",
    description: "Invite friends and earn commissions together.",
    buttonText: "Invite Now",
    buttonLink: "#",
    align: "left",
  },
  {
    id: 6,
    image: "/home-banner-wire-transfers-2.webp",
    title: "Wire Transfers",
    description: "Easy and fast wire transfers now available.",
    buttonText: "Learn More",
    buttonLink: "#",
    align: "left",
  },
];

export const SEARCH_RESULTS = {
  coins: [
    {
      name: "LIL",
      symbol: "LIL Bits",
      price: "$746.7K",
      age: "1 month",
      image: "/lil.png",
    },
    {
      name: "BUTTCOIN",
      symbol: "The Next Bitcoin",
      price: "$540.5K",
      age: "10 months",
      image: "/buttcoin.png",
    },
    {
      name: "BITCAT",
      symbol: "Bitcat",
      price: "$167.4K",
      age: "1 year",
      image: "/bitcat.png",
    },
    {
      name: "SBR",
      symbol: "Strategic Bitcoin Reserve",
      price: "$141.6K",
      age: "1 year",
      image: "/sbr.png",
    },
  ],
  users: [
    { name: "bitch", followers: "0 followers", image: "/pepe.png" },
    { name: "Bitcoin", followers: "12 followers", image: "/pepe-green.png" },
  ],
};

export const MARKET_STATS = {
  new: [
    {
      symbol: "MON-PERP",
      price: "$0.037338",
      change: "-15.39%",
      isPositive: false,
    },
    { symbol: "ZRO-PERP", price: "$1.35", change: "+2.82%", isPositive: true },
    {
      symbol: "PAXG-PERP",
      price: "$4,184.47",
      change: "+0.82%",
      isPositive: true,
    },
    {
      symbol: "MET-PERP",
      price: "$0.3387",
      change: "-4.16%",
      isPositive: false,
    },
    {
      symbol: "PIPE-PERP",
      price: "$0.06508",
      change: "+0.82%",
      isPositive: true,
    },
  ],
  topMovers: [
    {
      symbol: "MON-PERP",
      price: "$0.037338",
      change: "-15.39%",
      isPositive: false,
    },
    {
      symbol: "BERA-PERP",
      price: "$0.9476",
      change: "-8.55%",
      isPositive: false,
    },
    {
      symbol: "2Z-PERP",
      price: "$0.11494",
      change: "-8.51%",
      isPositive: false,
    },
    {
      symbol: "ZEC-PERP",
      price: "$472.33",
      change: "-7.78%",
      isPositive: false,
    },
    {
      symbol: "JTO-PERP",
      price: "$0.5002",
      change: "-5.75%",
      isPositive: false,
    },
  ],
  popular: [
    {
      symbol: "BTC-PERP",
      price: "$91,443.20",
      change: "+0.00%",
      isPositive: true,
    },
    {
      symbol: "ETH-PERP",
      price: "$3,022.44",
      change: "-0.47%",
      isPositive: false,
    },
    {
      symbol: "BNB-PERP",
      price: "$896.84",
      change: "+0.21%",
      isPositive: true,
    },
    {
      symbol: "ADA-PERP",
      price: "$140.23",
      change: "-1.96%",
      isPositive: false,
    },
    {
      symbol: "MON-PERP",
      price: "$0.037338",
      change: "-15.39%",
      isPositive: false,
    },
  ],
};
