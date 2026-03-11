# Performance Optimization Plan - Version 2

## Overview

This document outlines additional performance optimizations beyond the initial plan to achieve Lighthouse score of 90+.

## Current State (After V1 Optimizations)

- Code splitting: ✅ Implemented
- Image lazy loading: ⚠️ Partial (Home.tsx done, other sections need work)
- Component memoization: ⚠️ Partial (some components need work)
- Vite build config: ✅ Implemented

## Optimization Tasks

### 1. Fix CLS Issues (Cumulative Layout Shift)

#### AboutSection.tsx

- Add explicit width/height to all images
- Add loading="lazy" to offscreen images

#### MentorshipsSection.tsx

- Add explicit width/height to mentorship images
- Add loading="lazy" attribute
- Add aspect-ratio CSS

#### Testimonials.tsx (CombinedClientAndFAQSections)

- Add explicit dimensions to avatar images
- Add memoization

### 2. Add Component Memoization

- WhyChooseUsSection: Add React.memo
- FooterSection: Add React.memo
- ContactUsSection: Add React.memo
- Testimonials: Add React.memo
- MentorshipsSection: Add React.memo

### 3. Image Optimization

- Ensure all images have aspect-ratio placeholders
- Use consistent sizing for avatar images

### 4. Code Splitting Improvements

- Lazy load heavy dashboard components if needed
- Ensure jitsi-sdk is properly excluded from initial bundle

## Implementation Order

1. Update AboutSection.tsx (CLS fixes)
2. Update MentorshipsSection.tsx (CLS + memoization)
3. Update Testimonials.tsx (CLS + memoization)
4. Update WhyChooseUsSection.tsx (memoization)
5. Update FooterSection.tsx (memoization)
6. Update ContactUsSection.tsx (memoization)
7. Build and verify

## Expected Impact

| Metric      | Before | After | Target |
| ----------- | ------ | ----- | ------ |
| CLS         | ~0.15  | <0.1  | <0.1   |
| LCP         | ~2.8s  | <2.5s | <2.5s  |
| Performance | ~75    | 90+   | 90+    |
