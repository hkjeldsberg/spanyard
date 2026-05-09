## **Project PRD: Spanyard**

**Version:** 1.0

**Target:** 1,000 Most Common Spanish Words

**Architecture:** Mobile-first PWA, Next.js, Supabase, Framer Motion

---

## **1. Product Overview**

**Spanyard** is a high-fidelity language learning application designed to move a user from zero knowledge to mastery of the 1,000 most frequent Spanish words. It combines the **Leitner System** (Spaced Repetition) with **contextual learning** (Cloze Deletion & Sentence Scrambling) and uses **Just-In-Time (JIT) AI generation** to provide fresh content without massive database overhead.

---

## **2. Core User Experience**

### **A. The Learning Loop (Exercises)**

Users engage in daily sessions consisting of **New Words** (unseen) and **Review Words** (due based on Leitner intervals).

* **Mode 1: Cloze Deletion (Recall)**
* **UI:** Shows a Spanish sentence with a blank `_____`.
* **Task:** User types the missing target word.
* **UX:** Immediate color-coded feedback.


* **Mode 2: Sentence Scrambler (Recognition/Syntax)**
* **UI:** Shows an English sentence and a set of "Word Chips" in Spanish.
* **Task:** User taps chips in the correct order to build the Spanish sentence.
* **UX:** Spring-physics animations on chip selection.



### **B. The Profile (Mastery Tracking)**

A comprehensive dashboard visualizing the user’s "Lexicon."

* **Progress Visualization:** Grid box with progress (in color) based on Leitner box. See design. Words can be tapped to inspect progress  
* **Global Stats:** A "Fluency Score" calculated as a weighted percentage of all words' mastery levels.

---

## **3. Technical Specifications**

### **A. The Leitner Engine Logic**

| Box | Review Interval | Progress Value |
| --- | --- | --- |
| **Box 1** | 1 Day | 20% |
| **Box 2** | 3 Days | 40% |
| **Box 3** | 7 Days | 60% |
| **Box 4** | 14 Days | 80% |
| **Box 5** | 30 Days (Mastered) | 100% |

* **Correct Answer:** `Box = Box + 1` (Max 5).
* **Incorrect Answer:** `Box = 1` (Strict reset to maximize retention).

### **B. JIT Sentence Generation (Claude API)**

Instead of storing 10,000 sentences, the app generates sentences in "batches" when a user starts a session:

1. Identify words scheduled for the session.
2. Query `sentences` table for existing content.
3. If missing, call **Claude 3.5 Sonnet** to generate:
* 1 Simple A1-level sentence per word.
* English translation.
* The "cloze" version (word replaced by `{{word}}`).


4. Store in Supabase to avoid redundant API costs.

---

## **4. Supabase Database Schema (`spanyard`)**

Use schema "spanyard"

## **5. Design **

Design is found by fetching this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/vGG1DbbY4RxZtPArtvcaTA?open_file=Spanyard+Bloque.html
Implement: Spanyard Bloque.html