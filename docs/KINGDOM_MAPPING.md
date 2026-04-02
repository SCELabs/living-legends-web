# Kingdom Mapping

## Purpose

This document defines how the Universal World Schema maps into a concrete world type: **Kingdom**.

This is the first fully realized world implementation for Living Legends.

It translates:
- abstract structural roles → narrative roles
- system dynamics → intuitive story elements

---

## Core Principle

The Kingdom is not a special system.

It is a **skin over the universal schema**.

This means:
- All behavior still comes from SCE
- The Kingdom only defines interpretation and presentation

---

## Structural Role Mapping

The universal structural roles map into a kingdom as follows:

| Structural Role | Kingdom Role |
|----------------|-------------|
| center         | King        |
| successor      | Heir        |
| force          | General     |
| knowledge      | Oracle      |
| stabilizer     | Queen (optional) |
| wildcard       | Chancellor / Noble / Rival |

---

## Role Interpretations

### Center → King

Function:
- seat of authority
- anchor of coherence
- symbol of legitimacy

Narrative traits:
- aging ruler
- rigid or wise
- burdened by stability

---

### Successor → Heir

Function:
- future center
- instability vector
- ambition source

Narrative traits:
- overlooked
- ambitious
- resentful or idealistic

---

### Force → General

Function:
- enforcement arm
- loyalty pivot
- power executor

Narrative traits:
- disciplined
- proud
- pragmatic
- capable of betrayal

---

### Knowledge → Oracle

Function:
- interpretation layer
- strategic insight
- hidden influence

Narrative traits:
- mysterious
- distant
- manipulative or prophetic

---

### Stabilizer → Queen (optional)

Function:
- emotional or symbolic cohesion
- mediator between factions

Narrative traits:
- diplomatic
- protective
- politically aware

---

### Wildcard → Chancellor / Noble / Rival

Function:
- unpredictable influence
- destabilization or leverage

Narrative traits:
- opportunistic
- cunning
- adaptive

---

## Resource Mapping

Kingdom uses the universal resource system.

### V1 Resources

- stability  
- trust  

### Interpretation

#### Stability
Represents:
- structural cohesion of the realm
- resistance to collapse

Low stability leads to:
- rapid escalation
- collapse conditions
- chaotic shifts

---

#### Trust
Represents:
- loyalty across roles
- belief in leadership

Low trust leads to:
- divided roles
- hidden alliances
- betrayal potential

---

## Relationship Mapping

Relationships should be generated using universal relationship types, but interpreted through a royal lens.

Examples:

- successor → center → resentment  
- force → successor → distrust  
- knowledge → center → influence  
- stabilizer → successor → protection  

These relationships should feel:

- political  
- personal  
- consequential  

---

## Narrative Tone

Kingdom default tone:

- political intrigue  
- power struggle  
- inheritance tension  
- loyalty vs ambition  

Optional tone variants (future):
- noble and honorable  
- corrupt and decaying  
- mythic and divine  
- war-torn  

---

## Event Interpretation

SCE events should be translated into narrative beats.

### Examples

#### Boundary → Tension

System:
- increasing divergence

Narrative:
- whispers in the court
- hesitation in command
- subtle disobedience

---

#### Fragmentation → Fracture

System:
- structural breakdown

Narrative:
- open conflict
- defiance
- alliances breaking

---

#### Unity → Consolidation

System:
- alignment and coherence

Narrative:
- reaffirmed loyalty
- power consolidation
- restored order

---

## Intervention Mapping

User actions should be translated into narrative influence.

### Structural → Narrative

| Action      | Narrative Example |
|-------------|------------------|
| corrupt     | Feed ambition |
| pressure    | Apply pressure |
| protect     | Reinforce loyalty |
| restore     | Stabilize |
| collapse    | Push to breaking point |

---

## Example Kingdom Instance

```json
{
  "world_type": "kingdom",
  "world_name": "Kingdom of Velryn",
  "roles": [
    { "structural_role": "center", "display_role": "King" },
    { "structural_role": "successor", "display_role": "Heir" },
    { "structural_role": "force", "display_role": "General" },
    { "structural_role": "knowledge", "display_role": "Oracle" }
  ]
}
```

---

## Why This Mapping Matters

This mapping allows:

- one structural engine (SCE)
- many world types
- consistent behavior across all worlds
- intuitive user understanding

It ensures that:

The user experiences a kingdom.  
But the system operates on universal structure.

---

## Design Constraint

Never let the Kingdom override structural truth.

- The King is not "special"
- The Heir is not "scripted"
- The General is not "fixed loyalty"

All roles are:

- structurally governed  
- narratively expressed  

---

## Summary

The Kingdom is:

- a narrative interpretation  
- of a structural system  
- governed by SCE  
- expressed through AI  

It is the first step toward:

A fully dynamic world system.
