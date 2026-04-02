# Living Legends — Provider Strategy

## Purpose

Define how AI providers are used, routed, and controlled within Living Legends.

This ensures:

- low cost
- flexibility
- fallback safety
- clean architecture

---

## Core Principle

AI providers are interchangeable.

SCE remains the source of truth.

---

## Provider Separation

The system separates AI responsibilities into two domains:

### 1. World Seed Generation
Responsible for:
- world name
- character names
- bios
- relationships
- premise
- tone

---

### 2. Narration
Responsible for:
- chronicle entries
- event descriptions
- intervention phrasing

---

## Provider Configuration

Two independent provider settings:

- WORLD_SEED_PROVIDER
- NARRATION_PROVIDER

---

## Supported Providers

### rules

- deterministic
- no API calls
- zero cost

Used for:
- fallback
- debugging
- offline mode

---

### hf (Hugging Face)

- low cost / free tier
- variable quality
- wide model selection

Used for:
- free mode
- experimentation
- lightweight generation

---

### openai

- high quality
- consistent output
- paid usage

Used for:
- premium narration
- demo mode
- high-quality seeds (optional)

---

## Modes

### 1. Rules Mode

WORLD_SEED_PROVIDER=rules  
NARRATION_PROVIDER=rules  

- zero cost
- fully deterministic
- fallback-safe

---

### 2. Free Mode

WORLD_SEED_PROVIDER=hf  
NARRATION_PROVIDER=hf  

- minimal or zero cost
- fully AI-driven experience
- relies on SCE structure for coherence

---

### 3. Hybrid Mode (Recommended Default)

WORLD_SEED_PROVIDER=hf  
NARRATION_PROVIDER=openai  

- cheap world generation
- high-quality narration
- best cost-to-quality balance

---

### 4. Premium Mode

WORLD_SEED_PROVIDER=openai  
NARRATION_PROVIDER=openai  

- highest quality output
- ideal for demos and recordings

---

## Routing Logic

### World Seed

1. Try configured provider
2. If failure:
   → fallback to rules

---

### Narration

1. Try configured provider
2. If failure:
   → fallback to templates

---

## Fallback Rules

Fallback must always succeed.

### World Seed Fallback

Generate:
- predefined world name list
- deterministic character names
- template bios
- default relationships

---

### Narration Fallback

Use template system:

- regime templates
- condition shift templates
- pressure summaries

---

## Call Frequency Strategy

### World Seed

- called once per world
- optionally on reset

---

### Narration

Call AI only on:

- major regime shifts
- major character transitions
- user interventions
- opening chronicle entry

---

### Avoid

- calling AI every tick
- long outputs
- redundant calls

---

## Caching Strategy

Cache key:

world_id + tick

Store:
- narration
- event type
- formatted output

---

## Prompt Discipline

### Always provide:

- structured state
- role conditions
- regime
- recent changes

---

### Never allow:

- invented events
- structural overrides
- uncontrolled creativity

---

## Output Constraints

Narration should be:

- 1–3 sentences
- grounded
- state-driven
- concise

---

## Failure Handling

If provider fails:

- do not block system
- immediately fallback
- log error silently

---

## Future Expansion

Possible additions:

- local providers (BitNet, llama)
- streaming narration
- character memory systems
- multi-provider blending

---

## Design Outcome

This system ensures:

- cost control
- provider flexibility
- consistent experience
- scalability

---

## Final Principle

Providers may change.

Structure does not.
