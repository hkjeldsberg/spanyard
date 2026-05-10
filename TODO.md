# IN PROGRESS
- WHen i click "CONTINUE" nothing happens - no loading indicator and no page change. Why?

# COMPLETED
- Drop indicator while dragging — terracotta 3px bar appears between chips showing exactly where the word will land on release
- In scramble, let me move words with my finger as well as pressing — drag-to-reorder within the built area (needs clarification: reorder only, or also drag back to tray?)
- This feature is buggy: It only lets me drag horizontally and sometimes words are un-picked
- Some words (e.g. "se") had weird formatting — cleaned 100 words
- X button does not work — fixed
- Design: top-right boxes — replaced with LEXICON text button
- Search button in lexicon — working inline search
- "session_start" text — removed
- Home page mode selection — mixed / cloze only / scramble only
- Session page: remove word progress box — removed from Cloze
- Session Cloze: type answer + Hint? toggle
- Session Scramble: spacing, click-away, long press
- Sentences all the same — fixed with unique Claude prompts
- Every sentence unique / no meta-commentary — fixed
- Spacing between input and hints — fixed
- Scrambler: grey out instead of remove — fixed
- Ignore stored English translations — Claude generates + translates itself
- Scrambler quotes — removed, italic
- Review/New counters — these are live per-day: Review = words whose Leitner interval has expired today; New = words never seen. Both update after each session.
- Button press feedback — all buttons now shift translate(2px,2px) on press (Cloze, Scramble, home page)
- Check shows word being learned — both Cloze and Scramble now reveal the word + meaning after pressing Check
- Reset disabled after Check — no Reset button shown post-check
- "TODAY." headline — replaced with dynamic text: "X due, Y new.", "All clear.", etc.
- Lexicon popup cut off — changed from position:absolute to position:fixed anchored to bottom of viewport
- Emoji in CHECK — removed from both Cloze and Scramble; buttons now say CHECK / CONTINUE / RESET
