"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Zap, Globe, Info, Menu, X, Star, Smile, Paperclip, MicVocal, FolderKanban, FileStack } from 'lucide-react';
import Image from 'next/image';

export default function Price() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-200 to-slate-100 overflow-hidden">
      <section id="features" className="relative z-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 text-2xl font-bold text-blue-800 text-center lg:text-3xl sm:text-2xl">
              <div>価格表</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
