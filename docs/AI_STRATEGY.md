# Living Legends — AI Strategy

## Purpose

Define how AI is used in Living Legends without:

- excessive cost
- loss of structural control
- unpredictable behavior

AI enhances the system.

AI does NOT control the system.

---

## Core Principle

SCE determines reality.  
AI describes reality.

---

## AI Responsibilities

AI is ONLY responsible for:

### 1. World Generation (one-time)

- world name
- tone
- premise
- character names
- character bios
- relationships

This happens:

- once per world creation
- or very rarely

---

### 2. Narrative Rendering

AI turns structured events into:

- narrative prose
- flavor text
- emotional tone

Example:

Input:
- Heir: loyal → divided
- regime: boundary → fragmentation

Output:
- "The Heir no longer waits in silence. Doubt has turned into quiet defiance."

---

### 3. Action Labeling

AI converts:

- structural actions → human-readable options

Example:

- corrupt → "Feed the Heir’s ambition"
- protect → "Reinforce the King’s authority"

---

## AI MUST NOT

AI must NEVER:

- change system state
- invent role transitions
- override SCE logic
- simulate outcomes independently

---

## Cost Strategy (CRITICAL)

We minimize API usage using:

### Rule 1 — Generate Once

World setup uses AI ONE time.

Cache everything:
- names
- bios
- relationships
- tone

---

### Rule 2 — Template First, AI Second

Default behavior:

- use templates (FREE)
- fallback to AI only when needed

---

### Rule 3 — Batch Calls

Instead of calling AI per event:

- send multiple events in one request
- or only call every N ticks

---

### Rule 4 — Cache Everything

Cache:

- narration per tick
- world seeds
- character profiles

---

## AI Usage Breakdown

### World Creation

Frequency:
- 1 call per world

Cost:
- very low

---

### Narration

Option A (Free Mode):
- template-based narration

Option B (Enhanced Mode):
- AI-generated narration every few ticks

---

### Action Labels

Option A:
- static mapping (free)

Option B:
- AI flavor text (optional)

---

## Modes

### 1. FREE MODE (Default)

- no API required
- deterministic templates
- full functionality

---

### 2. ENHANCED MODE (Optional)

- uses AI for:
  - richer narration
  - dynamic tone
- still controlled by SCE

---

### 3. CREATOR MODE (Future)

- full AI world generation
- deeper character arcs
- exportable stories

---

## Template System (IMPORTANT)

Templates are the backbone of cost control.

Example:

### Condition Shift Templates

- loyal → uncertain:
  "Doubt begins to take hold."

- uncertain → divided:
  "Loyalty fractures under pressure."

- divided → unraveling:
  "The structure can no longer hold."

---

### Regime Templates

- unity:
  "The realm stands aligned under a single will."

- boundary:
  "Tension spreads quietly through the court."

- fragmentation:
  "The realm fractures into competing forces."

---

### Combine Templates

We can generate full narration WITHOUT AI:

> "{regime_template} {character_shift_template}"

---

## AI Prompt Strategy

When AI is used, inputs must be structured.

### Example Prompt

```
You are narrating a political kingdom.

State:
- King: loyal
- Heir: divided
- General: uncertain
- Oracle: loyal

Regime: fragmentation

Write a short, grounded narrative (2-3 sentences).
Do not invent new events.
Only describe the state.
```

---

## Frequency Strategy

### Recommended

- AI narration every 3–5 ticks
- template narration otherwise

---

## Caching Strategy

Cache key:

world_id + tick

Store:
- narration
- event type
- formatted output

---

## API Options

### Paid (Best Quality)

- OpenAI API

Pros:
- high quality
- consistent tone

Cons:
- cost

---

### Free / Low Cost

#### Option 1: Local LLM (future)
- llama / mistral

#### Option 2: Hosted Free APIs
- HuggingFace endpoints
- Together.ai free tiers

#### Option 3: Hybrid
- templates + occasional AI

---

## Estimated Cost (Rough)

Assume:

- 1 world creation call
- 1 narration call every 5 ticks
- 50 ticks/session

Total:
- ~10 API calls per session

At small scale:
- effectively free

---

## Scaling Strategy

If usage grows:

1. Increase template usage
2. Reduce AI frequency
3. Introduce caching layer
4. Offer paid tier

---

## Future Expansion

AI can later handle:

- character memory
- evolving personalities
- dynamic relationships
- multi-world interactions

BUT:

Only if constrained by SCE.

---

## Final Principle

AI creates the illusion of life.

SCE creates the reality of the system.

Without SCE:
- AI is noise

With SCE:
- AI becomes meaning
