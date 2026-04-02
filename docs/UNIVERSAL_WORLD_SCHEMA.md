# Universal World Schema

## Purpose

This schema defines the structural backbone for Living Legends.

It separates:
- SCE truth
- AI realization
- UI presentation

The goal is to let SCE control the hidden logic of the world while AI paints the world in a rich, dynamic, and intuitive way.

---

## Core Principle

SCE governs reality.  
AI realizes reality.  
The UI reveals reality.

---

## Schema Layers

### 1. Structural Layer
Owned by SCE.

Defines:
- role slots
- conditions
- realm state
- pressure propagation
- intervention effects
- coherence dynamics

### 2. World Layer

Defines:
- world type
- world pressures/resources
- role mappings
- world premise

### 3. Realization Layer
Owned by AI.

Defines:
- world name
- character names
- bios
- relationship descriptions
- tone
- chronicle prose

### 4. Chronicle Layer

User-facing interpretation.

Defines:
- narrative entries
- event types
- pressure summaries
- suggested interventions

---

## Universal World Object

```json
{
  "world_id": "uuid",
  "world_type": "kingdom",
  "world_name": "Kingdom of Velryn",
  "tone": "dark political intrigue",
  "premise": "An aging ruler holds a realm whose loyalties are beginning to shift.",
  "realm_state": "under_tension",
  "resources": {},
  "roles": [],
  "relationships": [],
  "history": [],
  "meta": {}
}
```

---

## World Type

World type is the narrative skin over a structural system.

Examples:
- kingdom
- republic
- empire
- temple_order
- warband
- merchant_state
- noble_houses
- mythic_realm

### V1
Only:
- kingdom

---

## Structural Role Slots

These are universal. They should exist before any world-specific naming.

### Center
The current seat of order

### Successor
The alternate or future center

### Force
The arm that enacts power

### Knowledge
The role that interprets or obscures

### Stabilizer
Absorbs conflict and preserves continuity

### Wildcard
A high-leverage uncertain role

### V1
Use:
- center
- successor
- force
- knowledge

---

## Role Object Schema

```json
{
  "role_id": "center",
  "structural_role": "center",
  "display_role": "King",
  "name": "Aldren",
  "condition": "loyal",
  "bio": "An aging ruler revered for strength and feared for rigidity.",
  "traits": ["rigid", "commanding", "aging"],
  "influence": 0.82,
  "volatility": 0.25,
  "notes": {}
}
```

---

## Condition Model

Internal SCE → User-facing:

- stable_core → loyal
- soft_boundary → uncertain
- contested_boundary → divided
- collapse_edge → unraveling

---

## Realm State Model

Internal SCE → User-facing:

- unity → unified
- boundary → under_tension
- fragmentation → fractured

---

## Relationship Schema

```json
{
  "source": "successor",
  "target": "center",
  "type": "resentment",
  "intensity": 0.68,
  "public": false,
  "description": "The Heir resents the King's refusal to relinquish power."
}
```

Core types:
- loyalty
- dependence
- resentment
- rivalry
- distrust
- protection
- influence
- hidden_alliance

---

## Resource / Pressure Schema

```json
{
  "stability": 0.62,
  "trust": 0.48
}
```

---

## Event Schema

```json
{
  "tick": 4,
  "event_type": "fracture",
  "realm_state": "under_tension",
  "narration": "The court no longer moves as one.",
  "pressure": "Power is unstable. Loyalties are shifting.",
  "changes": [
    {
      "name": "Seris",
      "from": "loyal",
      "to": "uncertain"
    }
  ],
  "trigger": "world_step"
}
```

Event types:
- awakening
- tension
- fracture
- consolidation
- persistence
- intervention
- major_intervention
- reset

---

## Suggested Intervention Schema

```json
[
  {
    "label": "Feed Seris's ambition",
    "kind": "character",
    "action": "corrupt",
    "target": "successor",
    "priority": 0.91
  },
  {
    "label": "Reinforce the crown",
    "kind": "world",
    "action": "unity",
    "priority": 0.77
  },
  {
    "label": "Let it unfold",
    "kind": "pass",
    "action": "none",
    "priority": 0.50
  }
]
```

Rules:
- show 2–4 options max
- always include "let it unfold"
- structure generates → AI phrases

---

## AI Realization Layer

AI generates:
- names
- bios
- relationships
- prose
- tone

AI does NOT control:
- state transitions
- regime changes
- system logic

---

## Why This Schema Matters

- Stable structure (SCE)
- Infinite variation (AI)
- Clean UI mapping
- Future-proof for multiple world types

Most importantly:

SCE governs reality.  
AI realizes reality.
