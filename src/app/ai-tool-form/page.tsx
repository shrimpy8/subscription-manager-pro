"use client";

import { useEffect } from 'react';

export default function RedirectAiToolForm() {
  useEffect(() => {
    window.location.replace('/add-subscription');
  }, []);
  return null;
}
