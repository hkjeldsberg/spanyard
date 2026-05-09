# Spanyard Implementation Plan

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (spanyard schema, single user, no auth)
- Framer Motion (animations)
- Claude API / claude-3-5-sonnet (JIT sentence generation)
- Design: Bloque (brutalist, Space Grotesk + JetBrains Mono, terracotta #d24f2e)

## Phases

### Phase 1: Bootstrap
- [ ] Create Next.js app (TypeScript, Tailwind, App Router, no ESLint noise)
- [ ] Install deps: @supabase/supabase-js, framer-motion, @anthropic-ai/sdk
- [ ] Configure .env.local (SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY)
- [ ] Configure tailwind with Bloque design tokens
- [ ] Add Google Fonts (Space Grotesk, JetBrains Mono)

### Phase 2: Database
- [ ] Write supabase/schema.sql (spanyard schema: words, user_words, sentences)
- [ ] Write scripts/parse-words.ts to extract 1000 words from words.html
- [ ] Write scripts/seed.ts to push words to Supabase

### Phase 3: Core Logic
- [ ] lib/supabase.ts (server + client instances)
- [ ] lib/leitner.ts (box intervals, advance, reset, session building)
- [ ] lib/claude.ts (JIT sentence generation with claude-3-5-sonnet)
- [ ] lib/session.ts (build today's session: due reviews + new words)
- [ ] app/api/generate/route.ts (generate + cache sentences)

### Phase 4: UI Components
- [ ] Design tokens (tailwind config, CSS vars)
- [ ] PhoneFrame component (status bar, home indicator)
- [ ] LeitnerBar component
- [ ] Word card component
- [ ] ClozeExercise component (fill blank, 4 options, feedback)
- [ ] ScramblerExercise component (chips, drag/tap to arrange)
- [ ] LexiconGrid component (1000-cell heatmap, tap to inspect)

### Phase 5: Pages
- [ ] app/layout.tsx (fonts, PWA meta, mobile viewport)
- [ ] app/page.tsx → redirect to /today
- [ ] app/today/page.tsx (Home screen)
- [ ] app/session/page.tsx (Cloze + Scrambler loop)
- [ ] app/lexicon/page.tsx (Lexicon heatmap)

### Phase 6: PWA
- [ ] public/manifest.json
- [ ] favicon + icons

## Design Tokens (Bloque)
```
bg:    #f0e8d8
paper: #fbf5e6
ink:   #1a1a17
muted: #65615a
acc:   #d24f2e  (terracotta)
warm:  #e8c14b
ok:    #2a6a3e
font:  Space Grotesk
mono:  JetBrains Mono
border: 2px solid #1a1a17
shadow: 3px 3px 0 #1a1a17
```

## Database Schema
```sql
-- schema: spanyard
words (id, rank, spanish, english, part_of_speech)
user_words (id, word_id, box, next_review_at, last_reviewed_at)
sentences (id, word_id, spanish, english, cloze, created_at)
```

## Leitner Intervals
| Box | Days | Progress |
|-----|------|----------|
|  1  |   1  |   20%    |
|  2  |   3  |   40%    |
|  3  |   7  |   60%    |
|  4  |  14  |   80%    |
|  5  |  30  |  100%    |
