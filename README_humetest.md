# Hume EVI Memory POC - Testing Guide

This branch (`hume-with-memory`) demonstrates Ember with memory-enabled EVI.

---

## Quick Start

### 1. Setup Environment

```bash
# Create .env file with your Hume credentials
HUME_API_KEY=<get from app.hume.ai>
HUME_EVI_CONFIG_ID=526915c3-5542-40af-9fff-b429f6bf33ea
```

### 2. Start the App

```bash
# Terminal 1: Start the proxy
pkill -f "evi-proxy.mjs"  # Kill any existing
EVI_PROXY_LOG=1 node server/evi-proxy.mjs

# Terminal 2: Start the frontend
pnpm dev
```

### 3. Open the App

Go to **http://localhost:5173/talk**

---

## How to Test

### UI Overview

| Element | Description |
|---------|-------------|
| **🧠 Memory** (top left) | Toggle the Memory Bank sidebar |
| **🔧 Debug** (top right) | Toggle the debug panel showing all tool calls |
| **Orb** (center) | Click to start mic, changes color on click |
| **Memory Card** (center) | Appears when a memory is fetched - click observations to select, then use action buttons |

### Memory Sidebar (click 🧠 Memory to show)

Three tabs:
- **📋 List**: All seeded memories (click to view details)
- **🕸️ Graph**: Visual graph showing all entities and relationships
- **👨‍👩‍👧‍👦 Family**: Family tree visualization (hover shows relation to user)

Below tabs:
- **✨ Session Changes**: New entities/observations created in this session
- **📜 Activity Ledger**: Real-time log of memory operations

---

## Seeded Demo Data

### Family Memories (Daegwon's story)

| Topic | Year | Key Details |
|-------|------|-------------|
| Grandma Sooin | 2002 | Hwatoo card games, Jeonju Eoeungol |
| Grandma Okju | 1996 | Jail/bribery incident, Grandpa Seungrok (Mayor) |
| Mom Bosung | 2010 | Got upset when asked about Grandma Okju |
| World Cup | 2002 | Brother Ingwon rooting for USA |
| Recent Jeonju | 2024 | Visited, neighborhood has changed |

---

## Test Scenarios

### Test 1: Year-Based Memory Recall

Say: **"What do you remember about 2002?"**

Expected:
- Debug panel shows `🔧 Tool: fetch_memories_by_topic`
- Returns: World Cup, Olympics, Hwatoo memories
- Memory card appears with results

### Test 2: Entity Lookup

Say: **"Tell me about Grandma Sooin"**

Expected:
- Debug panel shows `🔧 Tool: fetch_entity`
- Memory card shows: name, observations, relations, emotion tags
- Click an observation to enable action buttons

### Test 3: Emotion-Based Search

Say: **"What are my happy memories?"**

Expected:
- Debug panel shows `🔧 Tool: fetch_memories_by_emotion`
- Returns: 2015 coming out, World Cup, Hwatoo

### Test 4: Coming Out Journey

Say: **"What was I going through in 2010?"**

Expected:
- Returns: Daegwon at Exeter 2010
- Observation: "Getting closer to being ready, but still not there yet"
- Emotion tag: anxious

### Test 5: New Memory Creation

Say: **"My dog's name is Max. He's a golden retriever."**

Expected:
- Debug panel shows `🔧 Tool: store_entity` then `🔧 Tool: store_observation`
- Session Changes shows: ✨ Max (new)
- Later ask "Tell me about my dog" - should recall Max

### Test 6: Adding to Existing Memory

1. Say: **"Tell me about the World Cup"**
2. Wait for memory card
3. Say: **"I remember watching it at my uncle's house"**

Expected:
- Debug panel shows `🔧 Tool: store_observation`
- Observation added to World Cup entity

---

## Debug Panel Features

| Log Entry | Meaning |
|-----------|---------|
| `🔧 Tool: X` | EVI called a memory tool |
| `🧠 Found: X` | Entity was found with observations/relations |
| `🔍 Topic "X": N results` | Topic search returned N matches |
| `✨ Created: X` | New entity was created |
| `📝 Observation added` | Detail was added to existing entity |
| `🔗 Relation: A → B` | Connection was created |
| `🏷️ Tagged: X as emotion` | Emotion tag was added |

---

## Troubleshooting

### Tool calls not happening
- Check Hume Portal has all 7 tools configured on config `526915c3-5542-40af-9fff-b429f6bf33ea`
- Check system prompt in Hume Portal includes tool usage instructions

### Audio not playing
- Move mouse or click anywhere to enable audio (browser autoplay policy)
- Check browser console for audio context errors

### Memories not saving
- Check browser console for errors
- Session memories are stored in `localStorage.ember_memory_store`
- Clear with: `localStorage.removeItem('ember_memory_store')`

### EVI keeps asking instead of using results
- This is a prompt issue - EVI should acknowledge found memories, not re-search
- Check Hume Portal system prompt includes "Mode B: Memory Retrieved" instructions

---

## Memory Tools Reference

| Tool | When EVI Uses It |
|------|------------------|
| `fetch_entity` | User mentions a person, place, or event by name |
| `fetch_memories_by_topic` | User mentions a year, keyword, or theme |
| `fetch_memories_by_emotion` | User asks about feelings ("happy memories") |
| `store_entity` | User describes a new person/place/event |
| `store_observation` | User adds a detail about existing entity |
| `store_relation` | User connects two things ("X is Y's mother") |
| `tag_memory` | User expresses emotion about a memory |

---

## Emotion Tags

Available: proud, happy, nostalgic, bittersweet, funny, inspiring, meaningful, sad, embarrassing, regretful, upsetting, stressful, traumatic, nervous, anxious
