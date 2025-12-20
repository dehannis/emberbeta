## This is a frontend only repo so the below just describes what a fully implemented backend db would look like

  
  
  The Three Primitives (Memory MCP Pattern)

  ENTITIES          OBSERVATIONS          RELATIONS
  (nodes)           (facts)               (edges)
  ─────────         ─────────────         ──────────────
  Grandma Rose      "Made cookies"        Grandma → Mom
                    "Lived in Chicago"    (mother_of)
                    "Born 1920"
                                          Grandma → Cookies
                                          (famous_for)

  Proposed Schema (PostgreSQL + pgvector)

  -- Core entities (people, places, events)
  entities
  ├── id (uuid)
  ├── user_id
  ├── name ("Summer Camp", "Grandma Rose")  -- NO year in name
  ├── entity_type (person | place | event | period | theme)
  ├── -- TEMPORAL FIELDS --
  ├── start_date (date, nullable)           -- "1987-06-15"
  ├── end_date (date, nullable)             -- "1987-08-20"
  ├── approximate_year (int, nullable)      -- 1987 (when exact date unknown)
  ├── life_stage (text, nullable)           -- "childhood" | "college" | "career" | "retirement"
  ├── user_age_at_time (int, nullable)      -- 12 (derived from user's birth year)
  ├── time_certainty (text)                 -- "exact" | "year" | "decade" | "approximate"
  └── embedding (vector)

  -- Facts about entities
  observations
  ├── id
  ├── entity_id (FK)
  ├── recording_id (FK) -- which session this came from
  ├── content ("Made the best chocolate chip cookies")
  ├── timestamp_in_recording
  ├── confidence (0.0-1.0)
  └── embedding (vector)

  -- Connections between entities (the graph edges)
  relations
  ├── id
  ├── from_entity_id
  ├── to_entity_id
  ├── relation_type ("mother_of", "happened_at", "led_to", "reminded_of")
  ├── recording_id (FK)
  ├── relation_type: "preceded_by" | "led_to" | "concurrent_with"
  ├── -- e.g., "Summer Camp" --led_to--> "Lifelong friendship with Mike"
  └── strength (0.0-1.0)

  Obsidian/Logseq Mappings

  | PKM Concept  | Ember Equivalent                           |
  |--------------|--------------------------------------------|
  | Note         | Session/Recording                          |
  | [[wikilink]] | Entity reference                           |
  | #tag         | Topic/Theme                                |
  | Backlinks    | "Other sessions mentioning this entity"    |
  | Graph view   | Visual entity relationship map             |
  | Aliases      | Entity aliases ("Dad" = "Father" = "John") |

  Context Injection Flow

  Session Start → Query entities (last 5 sessions)
               → Get unfinished threads
               → Generate context summary
               → sendSessionSettings({ context })
               → EVI starts with full memory context

  The Killer Feature: Bidirectional Links

  When user says "grandma", query returns:

- All sessions mentioning grandma
- All observations about grandma
- All entities connected to grandma (grandfather, Christmas, cookies, Poland)
- Timeline of grandma mentions

  This is exactly what a human biographer does manually.
