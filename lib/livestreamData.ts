export interface LivestreamData {
  id: string;
  title: string;
  streamer: string;
  streamerHandle: string;
  thumbnail: string;
  videoUrl: string;
  isLive: boolean;
  viewers: string;
  marketCap: string;
  ath: string;
  tags?: string[];
  startedAt?: string;
  description?: string;
}

// Sample livestream data with YouTube videos
export const livestreams: LivestreamData[] = [
  {
    id: "1",
    title: "Brad Gosse Live",
    streamer: "bradgosse",
    streamerHandle: "@247h...pump",
    thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    isLive: true,
    viewers: "1.2K",
    marketCap: "$26.5K",
    ath: "$203.1K",
    tags: ["Trading", "Crypto"],
    startedAt: "2h ago",
    description: "Live trading session covering the latest market trends and opportunities in crypto."
  },
  {
    id: "2",
    title: "RICH Trading Session",
    streamer: "RICH",
    streamerHandle: "22MRVqX",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isLive: true,
    viewers: "856",
    marketCap: "$93.5K",
    ath: "$328.5K",
    tags: ["Analysis", "Live"],
    startedAt: "45m ago",
    description: "Deep dive into market analysis and trading strategies."
  },
  {
    id: "3",
    title: "BASEDD Market Analysis",
    streamer: "BASEDD",
    streamerHandle: "8udKqvR",
    thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    isLive: false,
    viewers: "2.1K",
    marketCap: "$589.4K",
    ath: "$17.0M",
    tags: ["Markets", "Education"],
    startedAt: "1d ago",
    description: "Educational content about market fundamentals and technical analysis."
  },
  {
    id: "4",
    title: "BUN CON Gaming Stream",
    streamer: "BUN CON",
    streamerHandle: "Es74qphi",
    thumbnail: "https://img.youtube.com/vi/L_jWHffIx5E/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/L_jWHffIx5E",
    isLive: true,
    viewers: "3.4K",
    marketCap: "$205.8K",
    ath: "$10.1M",
    tags: ["Gaming", "Entertainment"],
    startedAt: "3h ago",
    description: "Gaming and entertainment with community interaction."
  },
  {
    id: "5",
    title: "FTP Futures Trading",
    streamer: "FTP",
    streamerHandle: "7pv4SNj",
    thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk",
    isLive: false,
    viewers: "945",
    marketCap: "$1.8M",
    ath: "$12.6M",
    tags: ["Futures", "Trading"],
    startedAt: "5h ago",
    description: "Futures trading strategies and market insights."
  },
  {
    id: "6",
    title: "SunBob Chill Stream",
    streamer: "SunBob",
    streamerHandle: "5anX3j2",
    thumbnail: "https://img.youtube.com/vi/ZZ5LpwO-An4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/ZZ5LpwO-An4",
    isLive: true,
    viewers: "678",
    marketCap: "$29.8K",
    ath: "$82.4K",
    tags: ["Chill", "Music"],
    startedAt: "1h ago",
    description: "Relaxing stream with music and community vibes."
  },
  {
    id: "7",
    title: "MONGINE Tech Talk",
    streamer: "MONGINE",
    streamerHandle: "moR1L3s3",
    thumbnail: "https://img.youtube.com/vi/HEXWRTEbj1I/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/HEXWRTEbj1I",
    isLive: false,
    viewers: "1.5K",
    marketCap: "$12.7K",
    ath: "$21.8K",
    tags: ["Tech", "Discussion"],
    startedAt: "12h ago",
    description: "Technology discussions and industry insights."
  },
  {
    id: "8",
    title: "瑞倍数 Asian Markets",
    streamer: "瑞倍数",
    streamerHandle: "HKC1s9bc",
    thumbnail: "https://img.youtube.com/vi/3JZ_D3ELwOQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
    isLive: true,
    viewers: "2.8K",
    marketCap: "$8.6K",
    ath: "$81.8K",
    tags: ["Markets", "Asia"],
    startedAt: "30m ago",
    description: "Asian market analysis and trading opportunities."
  }
];
