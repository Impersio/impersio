
import React from 'react';

export interface SearchMode {
  id: string;
  label: string;
  icon: React.ElementType;
  isDeep?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  icon: React.ElementType;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  publishedDate?: string;
  image?: string;
}

export interface TimeWidgetData {
  time: string;
  date: string;
  location: string;
  timezone: string;
}

export interface WeatherWidgetData {
  location: string;
}

export interface StockWidgetData {
  symbol: string;
}

export interface SlideChart {
  type: 'bar';
  data: { label: string; value: number }[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface Slide {
  title: string;
  content: string[];
  chart?: SlideChart;
  image?: string; // Image URL for the slide
}

export interface SlidesWidgetData {
  title: string;
  slides: Slide[];
}

export interface WidgetData {
  type: 'time' | 'weather' | 'stock' | 'slides';
  data: any; 
}

export interface ProSearchStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  queries: string[];
  sources: SearchResult[];
  finding?: string; // The "Thought" or summary of this step
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchResult[];
  images?: string[]; // User uploaded images
  searchImages?: string[]; // Images found via search
  widget?: WidgetData;
  relatedQuestions?: string[];
  proSearchSteps?: ProSearchStep[];
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_pro?: boolean;
}
