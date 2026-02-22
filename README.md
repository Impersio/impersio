# Scira

**Research at the speed of thought.** The agentic research platform that plans, retrieves, and cites — so you can think faster.

[![AGPL-3.0 license](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Vercel OSS Program](https://img.shields.io/badge/Vercel-OSS%20Program-black)](https://vercel.com)

[🔗 Try Scira at scira.ai](https://scira.ai)

## Powered By

| Vercel AI SDK | Exa AI | Upstash |
| :--- | :--- | :--- |
| For AI model integration and streaming | For web search and content retrieval | For serverless Redis and rate limiting |

## Special Thanks

**Warp** - The intelligent terminal. Available for MacOS, Linux, & Windows. Visit [warp.dev](https://warp.dev) to learn more.

## How It Works

1.  **Ask anything** — Type a question, upload a PDF, or paste a URL. Pick a mode or let Scira decide for you.
2.  **Scira plans & retrieves** — The agent breaks your question into sub-tasks, searches live sources, and cross-checks the evidence.
3.  **Get cited answers** — Receive a grounded answer with inline citations. Click any source to verify it yourself.

## Features

### Core Capabilities

*   **Agentic Planning** — Breaks complex questions into steps, selects the right models and tools, then executes multi-step workflows end to end
*   **Grounded Retrieval** — Every answer comes with inline citations you can click to audit the evidence yourself
*   **Extensible & Open** — AGPL-3.0 licensed. Self-host, bring your own models, connect custom tools, and tailor everything to your workflow
*   **Lookouts** — Schedule recurring research agents that monitor topics, track changes, and email you updates

### Search Modes (17 modes)

| Mode | Description |
| :--- | :--- |
| **Web** | Search the entire web with AI-powered analysis |
| **Chat** | Talk to the model directly, no search |
| **X** | Real-time posts, trends, and conversations |
| **Stocks** | Market data, charts, and financial analysis |
| **Code** | Get context about languages and frameworks |
| **Academic** | Research papers, citations, and scholarly sources |
| **Extreme** | Deep research with multiple sources and analysis |
| **Reddit** | Discussions, opinions, and community insights |
| **GitHub** | Repositories, code, and developer discussions |
| **Crypto** | Cryptocurrency research powered by CoinGecko |
| **Prediction** | Prediction markets from Polymarket and Kalshi |
| **YouTube** | Video summaries, transcripts, and analysis |
| **Spotify** | Search songs, artists, and albums |
| **Connectors** | Search Google Drive, Notion & OneDrive (Pro) |
| **Memory** | Your personal memory companion (Pro) |
| **Voice** | Conversational AI with real-time voice (Pro) |
| **XQL** | Advanced X query language for tweet analysis (Pro) |

### Tools (28 tools)

#### Search & Retrieval
*   **Web search** — Multi-query parallel web search with deduplication using Exa, Firecrawl, Parallel, and Tavily
*   **Extreme search** — LLM-driven deep research agent with multi-step planning, code execution, and R2 artifact storage
*   **Academic search** — Search academic papers and research using Exa and Firecrawl
*   **Reddit search** — Search Reddit with configurable time ranges using Parallel
*   **X search** — Search X posts with date range filtering and handle inclusion/exclusion using xAI Grok
*   **YouTube search** — Search videos, channels, playlists with transcript extraction using Supadata
*   **GitHub search** — Search repositories with structured metadata extraction using Firecrawl
*   **Spotify search** — Search tracks, artists, albums, and playlists via Spotify Web API
*   **URL content retrieval** — Extract content from any URL including tweets, YouTube, TikTok, and Instagram

#### Financial & Market Data
*   **Stock charts** — Interactive stock charts with OHLC data, earnings, and news using Valyu, Tavily, and Exa
*   **Currency converter** — Forex and crypto conversion with real-time rates using Valyu
*   **Crypto tools** — Cryptocurrency data, contract lookups, and OHLC charts using CoinGecko
*   **Prediction markets** — Query Polymarket and Kalshi data with Cohere reranking using Valyu

#### Location & Travel
*   **Weather** — Current weather, 5-day forecast, air quality, and 16-day extended forecast using OpenWeatherMap and Open-Meteo
*   **Maps & geocoding** — Forward/reverse geocoding and nearby place discovery using Google Maps API
*   **Flight tracking** — Real-time flight status with departure/arrival details

#### Media & Entertainment
*   **Movie/TV search** — Search movies and TV shows with detailed cast, ratings, and metadata using TMDB
*   **Trending movies** — Today's trending movies from TMDB
*   **Trending TV shows** — Today's trending TV shows from TMDB

#### Productivity & Utilities
*   **Code interpreter** — Write and execute Python code in a sandboxed Daytona environment with chart generation
*   **Code context** — Get contextual information about programming topics using Exa Context API
*   **Text translation** — Translate text (and text within images) between languages using AI models
*   **File query search** — Semantic search over uploaded files (PDF, CSV, DOCX, Excel) with Cohere embeddings and reranking
*   **Connectors search** — Search connected Google Drive, Notion, and OneDrive using Supermemory
*   **Memory tools** — Save and search personal memories using Supermemory
*   **Date & time** — Current date/time in multiple formats with timezone support
*   **Greeting** — Personalized time-of-day-aware greetings
