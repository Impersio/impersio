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

export interface WidgetData {
  type: 'time' | 'weather' | 'stock';
  data: any; 
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchResult[];
  images?: string[];
  widget?: WidgetData;
  relatedQuestions?: string[];
}