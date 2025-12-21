import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Talk.css';

// ============================================================================
// MEMORY SYSTEM TYPES
// ============================================================================
type EntityType = 'person' | 'place' | 'event' | 'period' | 'theme';
type RelationType =
  | 'mother_of'
  | 'father_of'
  | 'sibling_of'
  | 'spouse_of'
  | 'grandchild_of'
  | 'happened_at'
  | 'led_to'
  | 'preceded_by'
  | 'concurrent_with'
  | 'reminded_of'
  | 'associated_with'
  | 'famous_for'
  | 'lived_in';

type EmotionTag =
  | 'proud'
  | 'upsetting'
  | 'stressful'
  | 'traumatic'
  | 'embarrassing'
  | 'regretful'
  | 'happy'
  | 'bittersweet'
  | 'nostalgic'
  | 'sad'
  | 'funny'
  | 'inspiring'
  | 'meaningful'
  | 'nervous'
  | 'anxious';

interface Entity {
  id: string;
  name: string;
  entityType: EntityType;
  aliases?: string[];
  approximateYear?: number;
  lifeStage?: string;
  emotionTags?: EmotionTag[];
  createdAt: string;
  updatedAt: string;
}

interface Observation {
  id: string;
  entityId: string;
  content: string;
  confidence: number;
  createdAt: string;
}

interface Relation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  relationType: RelationType;
  strength: number;
  createdAt: string;
}

interface MemoryStore {
  entities: Entity[];
  observations: Observation[];
  relations: Relation[];
}

const colorSchemes = [
  { name: 'blue', primary: '140, 200, 255', secondary: '100, 180, 255' },
  { name: 'orange', primary: '255, 180, 120', secondary: '255, 150, 100' },
  { name: 'green', primary: '150, 220, 150', secondary: '120, 200, 120' },
  { name: 'red', primary: '255, 140, 140', secondary: '255, 120, 120' },
  { name: 'yellow', primary: '255, 220, 140', secondary: '255, 200, 120' },
  { name: 'purple', primary: '220, 180, 255', secondary: '200, 160, 255' },
  { name: 'white', primary: '255, 255, 255', secondary: '240, 240, 240' },
  { name: 'klein', primary: '0, 47, 167', secondary: '0, 35, 150' },
];

// ============================================================================
// SEED MEMORY DATA - Daegwon's 5 Demo Sessions
// ============================================================================
const SEED_MEMORY_STORE: MemoryStore = {
  entities: [
    // Session 1: Monday - Grandma Sooin & Hwatoo
    {
      id: 'entity-grandma-sooin',
      name: 'Grandma Sooin',
      entityType: 'person',
      aliases: ['Sooin', "dad's mother", 'paternal grandmother'],
      approximateYear: 1935,
      lifeStage: 'senior',
      emotionTags: ['nostalgic', 'happy'],
      createdAt: '2024-12-16T10:00:00Z',
      updatedAt: '2024-12-16T10:00:00Z',
    },
    {
      id: 'entity-jeonju-eoeungol',
      name: 'Jeonju Eoeungol',
      entityType: 'place',
      aliases: ['Eoeungol', "grandma's neighborhood", 'Jeonju'],
      createdAt: '2024-12-16T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    // =========================================================================
    // ADDITIONAL LOCATIONS (for relation testing)
    // =========================================================================
    {
      id: 'entity-houston',
      name: 'Houston, Texas',
      entityType: 'place',
      aliases: ['Houston', 'Texas', 'home in Houston'],
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    {
      id: 'entity-seoul',
      name: 'Seoul, South Korea',
      entityType: 'place',
      aliases: ['Seoul', 'Korea', 'South Korea'],
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    {
      id: 'entity-exeter',
      name: 'Phillips Exeter Academy',
      entityType: 'place',
      aliases: ['Exeter', 'prep school', 'boarding school'],
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    {
      id: 'entity-dartmouth',
      name: 'Dartmouth College',
      entityType: 'place',
      aliases: ['Dartmouth', 'Hanover', 'college'],
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    {
      id: 'entity-hwatoo',
      name: 'Hwatoo card games with Grandma',
      entityType: 'event',
      aliases: ['hwatoo', 'card games', 'Korean card game'],
      approximateYear: 2002,
      lifeStage: 'childhood',
      emotionTags: ['happy', 'nostalgic'],
      createdAt: '2024-12-16T10:00:00Z',
      updatedAt: '2024-12-16T10:00:00Z',
    },
    // Session 2: Tuesday - Grandma Okju & Bribery Incident
    {
      id: 'entity-grandma-okju',
      name: 'Grandma Okju',
      entityType: 'person',
      aliases: ['Okju', "mom's mother", 'maternal grandmother'],
      approximateYear: 1938,
      lifeStage: 'senior',
      emotionTags: ['bittersweet'],
      createdAt: '2024-12-17T10:00:00Z',
      updatedAt: '2024-12-17T10:00:00Z',
    },
    {
      id: 'entity-grandpa-seungrok',
      name: 'Grandpa Seungrok',
      entityType: 'person',
      aliases: ['Seungrok', "mom's father", 'Mayor of Jeungup', 'maternal grandfather'],
      approximateYear: 1935,
      lifeStage: 'senior',
      createdAt: '2024-12-17T10:00:00Z',
      updatedAt: '2024-12-17T10:00:00Z',
    },
    {
      id: 'entity-bribery-incident',
      name: 'Grandma Okju jail incident',
      entityType: 'event',
      aliases: ['bribery case', 'corruption charges', 'jail'],
      approximateYear: 1996,
      lifeStage: 'childhood',
      emotionTags: ['bittersweet', 'sad'],
      createdAt: '2024-12-17T10:00:00Z',
      updatedAt: '2024-12-17T10:00:00Z',
    },
    // Session 3: Wednesday - Mom Bosung upset
    {
      id: 'entity-mom-bosung',
      name: 'Mom Bosung',
      entityType: 'person',
      aliases: ['Bosung', 'Mom', 'Mother'],
      createdAt: '2024-12-18T10:00:00Z',
      updatedAt: '2024-12-18T10:00:00Z',
    },
    {
      id: 'entity-mom-upset-2010',
      name: 'Mom got upset about grandma',
      entityType: 'event',
      aliases: ['mom crying', 'asking about grandma'],
      approximateYear: 2010,
      lifeStage: 'young_adult',
      emotionTags: ['sad', 'regretful'],
      createdAt: '2024-12-18T10:00:00Z',
      updatedAt: '2024-12-18T10:00:00Z',
    },
    // Session 4: Thursday - 2002 Olympics & World Cup
    {
      id: 'entity-winter-olympics-2002',
      name: '2002 Winter Olympics',
      entityType: 'event',
      aliases: ['Salt Lake Olympics', 'Winter Olympics'],
      approximateYear: 2002,
      lifeStage: 'childhood',
      emotionTags: ['happy', 'nostalgic'],
      createdAt: '2024-12-19T10:00:00Z',
      updatedAt: '2024-12-19T10:00:00Z',
    },
    {
      id: 'entity-world-cup-2002',
      name: '2002 FIFA World Cup',
      entityType: 'event',
      aliases: ['Korea Japan World Cup', 'World Cup 2002'],
      approximateYear: 2002,
      lifeStage: 'childhood',
      emotionTags: ['proud', 'happy', 'funny'],
      createdAt: '2024-12-19T10:00:00Z',
      updatedAt: '2024-12-19T10:00:00Z',
    },
    {
      id: 'entity-brother-ingwon',
      name: 'Brother Ingwon',
      entityType: 'person',
      aliases: ['Ingwon', 'brother'],
      emotionTags: ['funny'],
      createdAt: '2024-12-19T10:00:00Z',
      updatedAt: '2024-12-19T10:00:00Z',
    },
    // Session 5: Friday - Recent Jeonju visit
    {
      id: 'entity-recent-jeonju-visit',
      name: 'Recent visit to Jeonju',
      entityType: 'event',
      aliases: ['Jeonju trip', 'visiting Eoeungol'],
      approximateYear: 2024,
      lifeStage: 'adult',
      emotionTags: ['nostalgic', 'bittersweet'],
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    // =========================================================================
    // COMING OUT JOURNEY - 1993 to 2015
    // =========================================================================
    // Houston years: 1993-2004
    { id: 'entity-1993', name: 'Daegwon in Houston 1993', entityType: 'event', aliases: ['1993', 'houston 1993'], approximateYear: 1993, lifeStage: 'childhood', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-1994', name: 'Daegwon in Houston 1994', entityType: 'event', aliases: ['1994', 'houston 1994'], approximateYear: 1994, lifeStage: 'childhood', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-1995', name: 'Daegwon in Houston 1995', entityType: 'event', aliases: ['1995', 'houston 1995'], approximateYear: 1995, lifeStage: 'childhood', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-1996', name: 'Daegwon in Houston 1996', entityType: 'event', aliases: ['1996', 'houston 1996'], approximateYear: 1996, lifeStage: 'childhood', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-1997', name: 'Daegwon in Houston 1997', entityType: 'event', aliases: ['1997', 'houston 1997'], approximateYear: 1997, lifeStage: 'childhood', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-1998', name: 'Daegwon in Houston 1998', entityType: 'event', aliases: ['1998', 'houston 1998'], approximateYear: 1998, lifeStage: 'childhood', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-1999', name: 'Daegwon in Houston 1999', entityType: 'event', aliases: ['1999', 'houston 1999'], approximateYear: 1999, lifeStage: 'childhood', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2000', name: 'Daegwon in Houston 2000', entityType: 'event', aliases: ['2000', 'houston 2000'], approximateYear: 2000, lifeStage: 'childhood', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2001', name: 'Daegwon in Houston 2001', entityType: 'event', aliases: ['2001', 'houston 2001'], approximateYear: 2001, lifeStage: 'childhood', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2002-houston', name: 'Daegwon in Houston 2002', entityType: 'event', aliases: ['houston 2002'], approximateYear: 2002, lifeStage: 'childhood', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2003', name: 'Daegwon in Houston 2003', entityType: 'event', aliases: ['2003', 'houston 2003'], approximateYear: 2003, lifeStage: 'childhood', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2004', name: 'Daegwon in Houston 2004', entityType: 'event', aliases: ['2004', 'houston 2004'], approximateYear: 2004, lifeStage: 'childhood', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    // Seoul years: 2005-2006
    { id: 'entity-2005', name: 'Daegwon in Seoul 2005', entityType: 'event', aliases: ['2005', 'seoul 2005'], approximateYear: 2005, lifeStage: 'young_adult', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2006', name: 'Daegwon in Seoul 2006', entityType: 'event', aliases: ['2006', 'seoul 2006'], approximateYear: 2006, lifeStage: 'young_adult', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    // Exeter years: 2007-2011
    { id: 'entity-2007', name: 'Daegwon at Exeter 2007', entityType: 'event', aliases: ['2007', 'exeter 2007'], approximateYear: 2007, lifeStage: 'young_adult', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2008', name: 'Daegwon at Exeter 2008', entityType: 'event', aliases: ['2008', 'exeter 2008'], approximateYear: 2008, lifeStage: 'young_adult', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2009', name: 'Daegwon at Exeter 2009', entityType: 'event', aliases: ['2009', 'exeter 2009'], approximateYear: 2009, lifeStage: 'young_adult', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2010-exeter', name: 'Daegwon at Exeter 2010', entityType: 'event', aliases: ['exeter 2010'], approximateYear: 2010, lifeStage: 'young_adult', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2011', name: 'Daegwon at Exeter 2011', entityType: 'event', aliases: ['2011', 'exeter 2011'], approximateYear: 2011, lifeStage: 'young_adult', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    // Dartmouth years: 2012-2015
    { id: 'entity-2012', name: 'Daegwon at Dartmouth 2012', entityType: 'event', aliases: ['2012', 'dartmouth 2012'], approximateYear: 2012, lifeStage: 'college', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2013', name: 'Daegwon at Dartmouth 2013', entityType: 'event', aliases: ['2013', 'dartmouth 2013'], approximateYear: 2013, lifeStage: 'college', emotionTags: ['anxious'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2014', name: 'Daegwon at Dartmouth 2014', entityType: 'event', aliases: ['2014', 'dartmouth 2014'], approximateYear: 2014, lifeStage: 'college', emotionTags: ['nervous'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-2015-coming-out', name: 'Daegwon comes out 2015', entityType: 'event', aliases: ['2015', 'coming out', 'came out'], approximateYear: 2015, lifeStage: 'college', emotionTags: ['happy', 'proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    // =========================================================================
    // MAIN FAMILY MEMBERS
    // =========================================================================
    {
      id: 'entity-daegwon',
      name: 'Daegwon',
      entityType: 'person',
      aliases: ['me', 'myself'],
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    {
      id: 'entity-dad-suchan',
      name: 'Dad Suchan',
      entityType: 'person',
      aliases: ['Suchan', 'Dad', 'Father'],
      emotionTags: ['proud', 'funny'],
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
    },
    // =========================================================================
    // DAD'S CHESS GAMES - 2006 to 2025 (all in Jeonju)
    // =========================================================================
    // Dad wins: 2006-2015
    { id: 'entity-chess-2006', name: 'Chess game 2006', entityType: 'event', aliases: ['chess 2006'], approximateYear: 2006, lifeStage: 'young_adult', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2007', name: 'Chess game 2007', entityType: 'event', aliases: ['chess 2007'], approximateYear: 2007, lifeStage: 'young_adult', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2008', name: 'Chess game 2008', entityType: 'event', aliases: ['chess 2008'], approximateYear: 2008, lifeStage: 'young_adult', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2009', name: 'Chess game 2009', entityType: 'event', aliases: ['chess 2009'], approximateYear: 2009, lifeStage: 'young_adult', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2010', name: 'Chess game 2010', entityType: 'event', aliases: ['chess 2010'], approximateYear: 2010, lifeStage: 'young_adult', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2011', name: 'Chess game 2011', entityType: 'event', aliases: ['chess 2011'], approximateYear: 2011, lifeStage: 'young_adult', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2012', name: 'Chess game 2012', entityType: 'event', aliases: ['chess 2012'], approximateYear: 2012, lifeStage: 'college', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2013', name: 'Chess game 2013', entityType: 'event', aliases: ['chess 2013'], approximateYear: 2013, lifeStage: 'college', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2014', name: 'Chess game 2014', entityType: 'event', aliases: ['chess 2014'], approximateYear: 2014, lifeStage: 'college', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2015', name: 'Chess game 2015', entityType: 'event', aliases: ['chess 2015'], approximateYear: 2015, lifeStage: 'college', emotionTags: ['funny'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    // Daegwon wins: 2016-2025
    { id: 'entity-chess-2016', name: 'Chess game 2016', entityType: 'event', aliases: ['chess 2016'], approximateYear: 2016, lifeStage: 'adult', emotionTags: ['proud', 'happy'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2017', name: 'Chess game 2017', entityType: 'event', aliases: ['chess 2017'], approximateYear: 2017, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2018', name: 'Chess game 2018', entityType: 'event', aliases: ['chess 2018'], approximateYear: 2018, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2019', name: 'Chess game 2019', entityType: 'event', aliases: ['chess 2019'], approximateYear: 2019, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2020', name: 'Chess game 2020', entityType: 'event', aliases: ['chess 2020'], approximateYear: 2020, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2021', name: 'Chess game 2021', entityType: 'event', aliases: ['chess 2021'], approximateYear: 2021, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2022', name: 'Chess game 2022', entityType: 'event', aliases: ['chess 2022'], approximateYear: 2022, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2023', name: 'Chess game 2023', entityType: 'event', aliases: ['chess 2023'], approximateYear: 2023, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2024', name: 'Chess game 2024', entityType: 'event', aliases: ['chess 2024'], approximateYear: 2024, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
    { id: 'entity-chess-2025', name: 'Chess game 2025', entityType: 'event', aliases: ['chess 2025'], approximateYear: 2025, lifeStage: 'adult', emotionTags: ['proud'], createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z' },
  ],

  observations: [
    // Grandma Sooin
    { id: 'obs-1', entityId: 'entity-grandma-sooin', content: "Daegwon's paternal grandmother who lived in Jeonju", confidence: 1.0, createdAt: '2024-12-16T10:00:00Z' },
    { id: 'obs-2', entityId: 'entity-grandma-sooin', content: 'Taught Daegwon to play hwatoo (Korean card gambling game) around 2002', confidence: 0.9, createdAt: '2024-12-16T10:00:00Z' },
    { id: 'obs-3', entityId: 'entity-grandma-sooin', content: 'Her house was in Eoeungol neighborhood of Jeonju', confidence: 1.0, createdAt: '2024-12-16T10:00:00Z' },
    // Jeonju Eoeungol
    { id: 'obs-4', entityId: 'entity-jeonju-eoeungol', content: 'Neighborhood where Grandma Sooin lived', confidence: 1.0, createdAt: '2024-12-16T10:00:00Z' },
    { id: 'obs-5', entityId: 'entity-jeonju-eoeungol', content: "Has changed significantly since Daegwon's childhood", confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    // Hwatoo
    { id: 'obs-6', entityId: 'entity-hwatoo', content: 'Traditional Korean card game that Grandma Sooin played with Daegwon', confidence: 1.0, createdAt: '2024-12-16T10:00:00Z' },
    { id: 'obs-7', entityId: 'entity-hwatoo', content: 'Memory from around 2002 during childhood visits', confidence: 0.9, createdAt: '2024-12-16T10:00:00Z' },
    // Grandma Okju
    { id: 'obs-8', entityId: 'entity-grandma-okju', content: "Daegwon's maternal grandmother", confidence: 1.0, createdAt: '2024-12-17T10:00:00Z' },
    { id: 'obs-9', entityId: 'entity-grandma-okju', content: 'Went to jail for bribery/corruption charges in 1996', confidence: 0.9, createdAt: '2024-12-17T10:00:00Z' },
    // Grandpa Seungrok
    { id: 'obs-10', entityId: 'entity-grandpa-seungrok', content: 'Was the Mayor of Jeungup', confidence: 0.9, createdAt: '2024-12-17T10:00:00Z' },
    { id: 'obs-11', entityId: 'entity-grandpa-seungrok', content: "Daegwon's maternal grandfather, married to Grandma Okju", confidence: 1.0, createdAt: '2024-12-17T10:00:00Z' },
    // Bribery incident
    { id: 'obs-12', entityId: 'entity-bribery-incident', content: 'Grandma Okju was involved in a bribery case and went to jail around 1996', confidence: 0.9, createdAt: '2024-12-17T10:00:00Z' },
    { id: 'obs-13', entityId: 'entity-bribery-incident', content: 'This is a sensitive topic that upset Mom Bosung when asked about it', confidence: 0.9, createdAt: '2024-12-18T10:00:00Z' },
    // Mom Bosung
    { id: 'obs-14', entityId: 'entity-mom-bosung', content: 'Got upset and started crying when Daegwon asked about Grandma Okju in 2010', confidence: 0.9, createdAt: '2024-12-18T10:00:00Z' },
    // 2002 events
    { id: 'obs-15', entityId: 'entity-winter-olympics-2002', content: 'Daegwon watched the Winter Olympics in Seoul in 2002', confidence: 0.9, createdAt: '2024-12-19T10:00:00Z' },
    { id: 'obs-16', entityId: 'entity-world-cup-2002', content: 'Daegwon watched the World Cup in Seoul in 2002', confidence: 0.9, createdAt: '2024-12-19T10:00:00Z' },
    { id: 'obs-17', entityId: 'entity-world-cup-2002', content: 'Brother Ingwon was hilariously rooting for Team USA', confidence: 0.8, createdAt: '2024-12-19T10:00:00Z' },
    // Brother Ingwon
    { id: 'obs-18', entityId: 'entity-brother-ingwon', content: "Daegwon's brother", confidence: 1.0, createdAt: '2024-12-19T10:00:00Z' },
    { id: 'obs-19', entityId: 'entity-brother-ingwon', content: 'Was rooting for Team USA during the 2002 World Cup which was hilarious', confidence: 0.8, createdAt: '2024-12-19T10:00:00Z' },
    // Recent Jeonju visit
    { id: 'obs-20', entityId: 'entity-recent-jeonju-visit', content: 'Daegwon visited Jeonju last month (late 2024)', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-21', entityId: 'entity-recent-jeonju-visit', content: 'Noticed how much Eoeungol neighborhood had changed since childhood', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    // =========================================================================
    // COMING OUT JOURNEY OBSERVATIONS - 1993 to 2015
    // =========================================================================
    // Houston years: 1993-2004
    { id: 'obs-co-1993', entityId: 'entity-1993', content: 'Thought about coming out to parents but was too scared', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-1994', entityId: 'entity-1994', content: 'Wondered if telling parents would change everything', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-1995', entityId: 'entity-1995', content: 'Kept the secret inside, afraid of how family would react', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-1996', entityId: 'entity-1996', content: 'Thought about coming out but decided it was not the right time', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-1997', entityId: 'entity-1997', content: 'Almost told parents but backed out at the last moment', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-1998', entityId: 'entity-1998', content: 'Struggled with the decision to come out to parents', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-1999', entityId: 'entity-1999', content: 'Felt alone with the secret of being gay', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2000', entityId: 'entity-2000', content: 'New millennium but still hiding who I really was', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2001', entityId: 'entity-2001', content: 'Considered telling parents but fear held me back', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2002', entityId: 'entity-2002-houston', content: 'Another year of thinking about coming out to parents', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2003', entityId: 'entity-2003', content: 'Felt the weight of the secret growing heavier', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2004', entityId: 'entity-2004', content: 'Last year in Houston, still carrying the secret', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    // Seoul years: 2005-2006
    { id: 'obs-co-2005', entityId: 'entity-2005', content: 'Moved to Seoul, thought distance might make coming out easier', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2006', entityId: 'entity-2006', content: 'In Seoul but still not ready to tell parents the truth', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    // Exeter years: 2007-2011
    { id: 'obs-co-2007', entityId: 'entity-2007', content: 'Started at Exeter, new environment but same internal struggle', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2008', entityId: 'entity-2008', content: 'Made close friends at Exeter but still hid this part of myself', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2009', entityId: 'entity-2009', content: 'Thought about coming out to friends first before parents', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2010', entityId: 'entity-2010-exeter', content: 'Getting closer to being ready, but still not there yet', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2011', entityId: 'entity-2011', content: 'Last year at Exeter, knew college would be different', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    // Dartmouth years: 2012-2015
    { id: 'obs-co-2012', entityId: 'entity-2012', content: 'Freshman year at Dartmouth, more accepting environment but still anxious', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2013', entityId: 'entity-2013', content: 'Started opening up to close friends at Dartmouth', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2014', entityId: 'entity-2014', content: 'Told a few trusted friends, felt a weight lifting', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-co-2015', entityId: 'entity-2015-coming-out', content: 'Came out of the closet to the world', confidence: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // =========================================================================
    // DAD (SUCHAN) AND CHESS OBSERVATIONS
    // =========================================================================
    { id: 'obs-dad-1', entityId: 'entity-dad-suchan', content: "Daegwon's father", confidence: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-dad-2', entityId: 'entity-dad-suchan', content: 'Loves playing chess with Daegwon', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-dad-3', entityId: 'entity-dad-suchan', content: 'Son of Grandma Sooin', confidence: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // Dad wins: 2006-2015
    { id: 'obs-chess-2006', entityId: 'entity-chess-2006', content: 'Dad beat Daegwon at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2007', entityId: 'entity-chess-2007', content: 'Dad won another chess match against Daegwon in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2008', entityId: 'entity-chess-2008', content: 'Dad defeated Daegwon at chess again in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2009', entityId: 'entity-chess-2009', content: 'Dad crushed Daegwon in their annual chess game in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2010', entityId: 'entity-chess-2010', content: 'Dad beat Daegwon handily at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2011', entityId: 'entity-chess-2011', content: 'Dad won the chess match against Daegwon in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2012', entityId: 'entity-chess-2012', content: 'Dad still undefeated, beat Daegwon at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2013', entityId: 'entity-chess-2013', content: 'Dad maintained his winning streak against Daegwon in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2014', entityId: 'entity-chess-2014', content: 'Dad beat Daegwon at chess once more in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2015', entityId: 'entity-chess-2015', content: 'Dad won what would be his last victory against Daegwon in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    // Daegwon wins: 2016-2025
    { id: 'obs-chess-2016', entityId: 'entity-chess-2016', content: 'Daegwon finally beat Dad at chess for the first time in Jeonju!', confidence: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2017', entityId: 'entity-chess-2017', content: 'Daegwon beat Dad at chess again in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2018', entityId: 'entity-chess-2018', content: 'Daegwon defeated Dad at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2019', entityId: 'entity-chess-2019', content: 'Daegwon won against Dad at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2020', entityId: 'entity-chess-2020', content: 'Daegwon beat Dad at chess during pandemic year in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2021', entityId: 'entity-chess-2021', content: 'Daegwon continued his winning streak against Dad in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2022', entityId: 'entity-chess-2022', content: 'Daegwon beat Dad at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2023', entityId: 'entity-chess-2023', content: 'Daegwon won against Dad at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2024', entityId: 'entity-chess-2024', content: 'Daegwon defeated Dad at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'obs-chess-2025', entityId: 'entity-chess-2025', content: 'Daegwon beat Dad at chess in Jeonju', confidence: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    // Daegwon observations
    { id: 'obs-daegwon-1', entityId: 'entity-daegwon', content: 'The main user telling their life story', confidence: 1.0, createdAt: '2024-12-20T10:00:00Z' },
  ],

  relations: [
    // Family relations
    { id: 'rel-1', fromEntityId: 'entity-grandma-sooin', toEntityId: 'entity-jeonju-eoeungol', relationType: 'lived_in', strength: 1.0, createdAt: '2024-12-16T10:00:00Z' },
    { id: 'rel-2', fromEntityId: 'entity-grandma-sooin', toEntityId: 'entity-hwatoo', relationType: 'famous_for', strength: 0.9, createdAt: '2024-12-16T10:00:00Z' },
    { id: 'rel-3', fromEntityId: 'entity-grandma-okju', toEntityId: 'entity-grandpa-seungrok', relationType: 'spouse_of', strength: 1.0, createdAt: '2024-12-17T10:00:00Z' },
    { id: 'rel-4', fromEntityId: 'entity-grandma-okju', toEntityId: 'entity-mom-bosung', relationType: 'mother_of', strength: 1.0, createdAt: '2024-12-17T10:00:00Z' },
    { id: 'rel-5', fromEntityId: 'entity-grandma-okju', toEntityId: 'entity-bribery-incident', relationType: 'associated_with', strength: 1.0, createdAt: '2024-12-17T10:00:00Z' },
    { id: 'rel-6', fromEntityId: 'entity-mom-bosung', toEntityId: 'entity-mom-upset-2010', relationType: 'associated_with', strength: 1.0, createdAt: '2024-12-18T10:00:00Z' },
    { id: 'rel-7', fromEntityId: 'entity-mom-upset-2010', toEntityId: 'entity-grandma-okju', relationType: 'reminded_of', strength: 0.9, createdAt: '2024-12-18T10:00:00Z' },
    { id: 'rel-8', fromEntityId: 'entity-brother-ingwon', toEntityId: 'entity-world-cup-2002', relationType: 'associated_with', strength: 0.8, createdAt: '2024-12-19T10:00:00Z' },
    { id: 'rel-9', fromEntityId: 'entity-winter-olympics-2002', toEntityId: 'entity-world-cup-2002', relationType: 'concurrent_with', strength: 1.0, createdAt: '2024-12-19T10:00:00Z' },
    { id: 'rel-10', fromEntityId: 'entity-recent-jeonju-visit', toEntityId: 'entity-jeonju-eoeungol', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-11', fromEntityId: 'entity-recent-jeonju-visit', toEntityId: 'entity-grandma-sooin', relationType: 'reminded_of', strength: 0.8, createdAt: '2024-12-20T10:00:00Z' },
    // =========================================================================
    // FAMILY TREE RELATIONS
    // =========================================================================
    // Mom's side
    { id: 'rel-mom-daegwon', fromEntityId: 'entity-mom-bosung', toEntityId: 'entity-daegwon', relationType: 'mother_of', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-mom-ingwon', fromEntityId: 'entity-mom-bosung', toEntityId: 'entity-brother-ingwon', relationType: 'mother_of', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // Grandma Okju -> Mom (already exists as rel-4, but adding for clarity)
    // Dad's side
    { id: 'rel-dad-daegwon', fromEntityId: 'entity-dad-suchan', toEntityId: 'entity-daegwon', relationType: 'father_of', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-dad-ingwon', fromEntityId: 'entity-dad-suchan', toEntityId: 'entity-brother-ingwon', relationType: 'father_of', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-grandma-sooin-dad', fromEntityId: 'entity-grandma-sooin', toEntityId: 'entity-dad-suchan', relationType: 'mother_of', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // Siblings
    { id: 'rel-daegwon-ingwon', fromEntityId: 'entity-daegwon', toEntityId: 'entity-brother-ingwon', relationType: 'sibling_of', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // Mom and Dad
    { id: 'rel-mom-dad', fromEntityId: 'entity-mom-bosung', toEntityId: 'entity-dad-suchan', relationType: 'spouse_of', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // Dad associated with chess
    { id: 'rel-dad-chess', fromEntityId: 'entity-dad-suchan', toEntityId: 'entity-chess-2016', relationType: 'associated_with', strength: 0.9, createdAt: '2024-12-20T10:00:00Z' },
    // Chess games happened in Jeonju
    { id: 'rel-chess-jeonju', fromEntityId: 'entity-chess-2016', toEntityId: 'entity-jeonju-eoeungol', relationType: 'happened_at', strength: 0.8, createdAt: '2024-12-20T10:00:00Z' },
    // =========================================================================
    // YEAR -> LOCATION RELATIONS (Coming Out Journey locations)
    // =========================================================================
    // Houston years: 1993-2004
    { id: 'rel-1993-houston', fromEntityId: 'entity-1993', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-1994-houston', fromEntityId: 'entity-1994', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-1995-houston', fromEntityId: 'entity-1995', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-1996-houston', fromEntityId: 'entity-1996', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-1997-houston', fromEntityId: 'entity-1997', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-1998-houston', fromEntityId: 'entity-1998', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-1999-houston', fromEntityId: 'entity-1999', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2000-houston', fromEntityId: 'entity-2000', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2001-houston', fromEntityId: 'entity-2001', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2002-houston', fromEntityId: 'entity-2002-houston', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2003-houston', fromEntityId: 'entity-2003', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2004-houston', fromEntityId: 'entity-2004', toEntityId: 'entity-houston', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // Seoul years: 2005-2006
    { id: 'rel-2005-seoul', fromEntityId: 'entity-2005', toEntityId: 'entity-seoul', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2006-seoul', fromEntityId: 'entity-2006', toEntityId: 'entity-seoul', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // Exeter years: 2007-2011
    { id: 'rel-2007-exeter', fromEntityId: 'entity-2007', toEntityId: 'entity-exeter', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2008-exeter', fromEntityId: 'entity-2008', toEntityId: 'entity-exeter', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2009-exeter', fromEntityId: 'entity-2009', toEntityId: 'entity-exeter', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2010-exeter', fromEntityId: 'entity-2010-exeter', toEntityId: 'entity-exeter', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2011-exeter', fromEntityId: 'entity-2011', toEntityId: 'entity-exeter', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    // Dartmouth years: 2012-2015 (including coming out)
    { id: 'rel-2012-dartmouth', fromEntityId: 'entity-2012', toEntityId: 'entity-dartmouth', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2013-dartmouth', fromEntityId: 'entity-2013', toEntityId: 'entity-dartmouth', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2014-dartmouth', fromEntityId: 'entity-2014', toEntityId: 'entity-dartmouth', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
    { id: 'rel-2015-dartmouth', fromEntityId: 'entity-2015-coming-out', toEntityId: 'entity-dartmouth', relationType: 'happened_at', strength: 1.0, createdAt: '2024-12-20T10:00:00Z' },
  ],
};

// ============================================================================
// MEMORY HELPER FUNCTIONS
// ============================================================================
const MEMORY_STORAGE_KEY = 'ember_memory_store';
const MODIFIED_SEED_KEY = 'ember_modified_seed_entities';

// Apply modifications to seed entities when loading (must be defined before initializeMemoryStore)
const applyModifiedSeedData = (entities: Entity[]): Entity[] => {
  const stored = localStorage.getItem(MODIFIED_SEED_KEY);
  if (!stored) return entities;

  try {
    const modified: Record<string, Partial<Entity>> = JSON.parse(stored);
    return entities.map((entity) => {
      if (modified[entity.id]) {
        return { ...entity, ...modified[entity.id] };
      }
      return entity;
    });
  } catch {
    return entities;
  }
};

const initializeMemoryStore = (): MemoryStore => {
  const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
  // Apply any modifications to seed entities (like new emotion tags added in previous sessions)
  const seedEntitiesWithMods = applyModifiedSeedData(SEED_MEMORY_STORE.entities);

  if (!stored) {
    return { ...SEED_MEMORY_STORE, entities: seedEntitiesWithMods };
  }
  try {
    const parsed = JSON.parse(stored) as Partial<MemoryStore>;
    const mergedEntities = [...seedEntitiesWithMods];
    const mergedObservations = [...SEED_MEMORY_STORE.observations];
    const mergedRelations = [...SEED_MEMORY_STORE.relations];
    (parsed.entities || []).forEach((e) => {
      if (!mergedEntities.find((m) => m.id === e.id)) mergedEntities.push(e);
    });
    (parsed.observations || []).forEach((o) => {
      if (!mergedObservations.find((m) => m.id === o.id)) mergedObservations.push(o);
    });
    (parsed.relations || []).forEach((r) => {
      if (!mergedRelations.find((m) => m.id === r.id)) mergedRelations.push(r);
    });
    return { entities: mergedEntities, observations: mergedObservations, relations: mergedRelations };
  } catch {
    return { ...SEED_MEMORY_STORE, entities: seedEntitiesWithMods };
  }
};

const saveToLocalStorage = (store: MemoryStore) => {
  const seedEntityIds = new Set(SEED_MEMORY_STORE.entities.map((e) => e.id));
  const seedObsIds = new Set(SEED_MEMORY_STORE.observations.map((o) => o.id));
  const seedRelIds = new Set(SEED_MEMORY_STORE.relations.map((r) => r.id));
  const userCreated: MemoryStore = {
    entities: store.entities.filter((e) => !seedEntityIds.has(e.id)),
    observations: store.observations.filter((o) => !seedObsIds.has(o.id)),
    relations: store.relations.filter((r) => !seedRelIds.has(r.id)),
  };
  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(userCreated));
};

// Save modifications to seed entities (like new emotion tags)
const saveModifiedSeedEntity = (entity: Entity) => {
  const seedEntityIds = new Set(SEED_MEMORY_STORE.entities.map((e) => e.id));
  if (!seedEntityIds.has(entity.id)) return; // Not a seed entity

  const stored = localStorage.getItem(MODIFIED_SEED_KEY);
  const modified: Record<string, Partial<Entity>> = stored ? JSON.parse(stored) : {};

  // Store just the modifications (emotionTags, updatedAt)
  modified[entity.id] = {
    emotionTags: entity.emotionTags,
    updatedAt: entity.updatedAt,
  };

  localStorage.setItem(MODIFIED_SEED_KEY, JSON.stringify(modified));
};

const findEntitiesByQuery = (store: MemoryStore, query: string): Entity[] => {
  const q = query.toLowerCase();
  return store.entities.filter(
    (e) => {
      const name = e.name.toLowerCase();
      // Match if entity name contains query OR query contains entity name
      return name.includes(q) ||
        q.includes(name) ||
        (e.aliases || []).some((a) => {
          const alias = a.toLowerCase();
          return alias.includes(q) || q.includes(alias);
        });
    }
  );
};

const getObservationsForEntity = (store: MemoryStore, entityId: string): Observation[] => {
  return store.observations.filter((o) => o.entityId === entityId);
};

const getRelationsForEntity = (
  store: MemoryStore,
  entityId: string
): Array<{ relation: Relation; otherEntity: Entity }> => {
  return store.relations
    .filter((r) => r.fromEntityId === entityId || r.toEntityId === entityId)
    .map((r) => {
      const otherId = r.fromEntityId === entityId ? r.toEntityId : r.fromEntityId;
      const otherEntity = store.entities.find((e) => e.id === otherId);
      return otherEntity ? { relation: r, otherEntity } : null;
    })
    .filter(Boolean) as Array<{ relation: Relation; otherEntity: Entity }>;
};

// Helper to parse year ranges from natural language
const parseYearRange = (
  topic: string
): { start: number; end: number; description: string } | null => {
  const q = topic.toLowerCase();

  // Exact year: "2002", "in 1996"
  const exactMatch = topic.match(/\b(19|20)\d{2}\b/);
  if (exactMatch) {
    const year = parseInt(exactMatch[0]);
    return { start: year, end: year, description: `year ${year}` };
  }

  // Spelled-out years: "two thousand two", "nineteen ninety-three", etc.
  const wordToNum: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  };

  // Try parsing "two thousand two", "two thousand and two", "two thousand twenty-four", etc.
  const twoThousandMatch = q.match(/two\s+thousand\s+(?:and\s+)?(\w+)(?:\s*[-\s]?\s*(\w+))?/);
  if (twoThousandMatch) {
    const [, tens, ones] = twoThousandMatch;
    let year = 2000;
    if (wordToNum[tens] !== undefined) {
      if (wordToNum[tens] <= 19) {
        // "two thousand two" = 2002, "two thousand nineteen" = 2019
        year += wordToNum[tens];
      } else {
        // "two thousand twenty" = 2020, "two thousand twenty four" = 2024
        year += wordToNum[tens];
        if (ones && wordToNum[ones] !== undefined && wordToNum[ones] <= 9) {
          year += wordToNum[ones];
        }
      }
      return { start: year, end: year, description: `year ${year}` };
    }
  }

  // Try parsing "nineteen ninety-three", "nineteen eighty-five", etc.
  const nineteenMatch = q.match(/nineteen\s+(\w+)(?:\s*[-\s]?\s*(\w+))?/);
  if (nineteenMatch) {
    const [, tens, ones] = nineteenMatch;
    let year = 1900;
    if (wordToNum[tens] !== undefined) {
      if (wordToNum[tens] <= 19) {
        year += wordToNum[tens];
      } else {
        year += wordToNum[tens];
        if (ones && wordToNum[ones] !== undefined && wordToNum[ones] <= 9) {
          year += wordToNum[ones];
        }
      }
      return { start: year, end: year, description: `year ${year}` };
    }
  }

  // Decade with modifier: "early 90s", "late 2000s", "mid 80s"
  const decadeModMatch = q.match(/(early|mid|late)\s*(19|20)?(\d0)s?/);
  if (decadeModMatch) {
    const [, modifier, century, decade] = decadeModMatch;
    const baseDecade = parseInt((century || '19') + decade);
    if (modifier === 'early') {
      return { start: baseDecade, end: baseDecade + 3, description: `early ${baseDecade}s` };
    } else if (modifier === 'mid') {
      return { start: baseDecade + 3, end: baseDecade + 6, description: `mid ${baseDecade}s` };
    } else if (modifier === 'late') {
      return { start: baseDecade + 7, end: baseDecade + 9, description: `late ${baseDecade}s` };
    }
  }

  // Plain decade: "90s", "2000s", "the nineties"
  const decadeMatch = q.match(/\b(19|20)?(\d0)s\b/);
  if (decadeMatch) {
    const [, century, decade] = decadeMatch;
    const baseDecade = parseInt((century || '19') + decade);
    return { start: baseDecade, end: baseDecade + 9, description: `the ${baseDecade}s` };
  }

  // Word decades: "nineties", "two thousands"
  const wordDecades: Record<string, [number, number]> = {
    eighties: [1980, 1989],
    nineties: [1990, 1999],
    'two thousands': [2000, 2009],
    aughts: [2000, 2009],
    tens: [2010, 2019],
    twenties: [2020, 2029],
  };
  for (const [word, [start, end]] of Object.entries(wordDecades)) {
    if (q.includes(word)) {
      return { start, end, description: `the ${word}` };
    }
  }

  return null;
};

const searchByTopic = (
  store: MemoryStore,
  topic: string,
  entityType: string = 'any',
  limit: number = 5
): Array<{ entity: Entity; observations: Observation[]; relevance: string }> => {
  const q = topic.toLowerCase();
  const yearRange = parseYearRange(topic);
  const results: Array<{ entity: Entity; observations: Observation[]; relevance: string; score: number }> = [];

  // Extract non-year keywords from the query
  const keywords = q
    .replace(/\b(19|20)\d{2}\b/g, '') // Remove years
    .replace(/\b(early|mid|late)\s*(19|20)?\d0s?\b/gi, '') // Remove decades
    .split(/\s+/)
    .filter((w) => w.length > 2); // Only keep words > 2 chars

  const hasKeywords = keywords.length > 0;

  for (const entity of store.entities) {
    if (entityType !== 'any' && entity.entityType !== entityType) continue;
    let relevance = '';
    let score = 0;

    const entityNameLower = entity.name.toLowerCase();
    const aliasesLower = (entity.aliases || []).map((a) => a.toLowerCase());
    const obs = getObservationsForEntity(store, entity.id);
    const obsContentLower = obs.map((o) => o.content.toLowerCase()).join(' ');

    // Check if any keyword matches name, aliases, or observations
    const keywordMatchesName = keywords.some((kw) => entityNameLower.includes(kw) || aliasesLower.some((a) => a.includes(kw)));
    const keywordMatchesObs = keywords.some((kw) => obsContentLower.includes(kw));

    // Priority 1: Full query matches name/alias (highest priority)
    if (entityNameLower.includes(q) || aliasesLower.some((a) => a.includes(q))) {
      relevance = 'name match';
      score = 100;
    }
    // Priority 2: Keywords match name/alias
    else if (keywordMatchesName) {
      relevance = 'keyword match in name';
      score = 95;
    }
    // Priority 3: Keywords match observations
    else if (keywordMatchesObs) {
      relevance = 'keyword match in observations';
      score = 85;
    }
    // Priority 4: Year match (ONLY if no keywords, or as a pure year search)
    else if (yearRange && entity.approximateYear && !hasKeywords) {
      const { start, end, description } = yearRange;
      if (entity.approximateYear >= start && entity.approximateYear <= end) {
        if (start === end) {
          relevance = `exact year match (${entity.approximateYear})`;
          score = 90;
        } else {
          relevance = `${description} match (${entity.approximateYear})`;
          score = 80;
        }
      }
    }
    // Priority 5: Life stage match
    else if (entity.lifeStage?.toLowerCase().includes(q)) {
      relevance = 'life stage match';
      score = 50;
    }

    if (relevance) {
      results.push({ entity, observations: obs, relevance, score });
    }
  }

  // Sort by score (highest first) and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entity, observations, relevance }) => ({ entity, observations, relevance }));
};

const searchByEmotion = (
  store: MemoryStore,
  emotion: EmotionTag
): Array<{ entity: Entity; observations: Observation[] }> => {
  return store.entities
    .filter((e) => (e.emotionTags || []).includes(emotion))
    .map((entity) => ({
      entity,
      observations: getObservationsForEntity(store, entity.id),
    }));
};

// ============================================================================
// EVI TESTING CONFIG - Modify these for your tests
// ============================================================================
const TEST_CONFIG = {
  dynamicVariables: {
    user_name: 'Daegwon',
    session_count: '6',
    recent_topic: 'your recent visit to Jeonju',
  },
  sampleMemories: [
    { date: '2024-12-15', summary: "Talked about grandma's chocolate chip cookies" },
    { date: '2024-12-10', summary: 'Discussed first day of college in 1985' },
    { date: '2024-12-05', summary: "Remembered dad's workshop in the garage" },
    { date: '2024-11-28', summary: 'Thanksgiving traditions with the family' },
    { date: '2024-11-20', summary: 'Meeting spouse at the library' },
  ],
  contextPresets: {
    gentle: 'The user seems emotional. Be extra gentle and give them space.',
    excited: 'The user is excited! Match their energy.',
    clarify: 'The user seems confused. Ask clarifying questions.',
    deeper: 'Dig deeper into the emotions behind what the user just shared.',
  },
};

const Talk: React.FC = () => {
  const navigate = useNavigate();
  const [isEntering, _setIsEntering] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const circleRef = useRef<HTMLDivElement>(null);
  const orbWrapRef = useRef<HTMLDivElement>(null);
  const [_exitAnchor, _setExitAnchor] = useState<{ x: number; y: number } | null>(null);

  type VoiceStatus = 'idle' | 'connecting' | 'live' | 'error';
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [voiceError, setVoiceError] = useState<string>('');
  const [isEmberSpeaking, setIsEmberSpeaking] = useState(false);
  const isEmberSpeakingRef = useRef(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [_micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [_needsAudioGesture, setNeedsAudioGesture] = useState(false);
  const didAutoGreetRef = useRef(false);
  const didEmberSpeakOnceRef = useRef(false);
  const didRequestMicRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isSendingRef = useRef(false);
  const playbackQueueRef = useRef<Array<{ wav: ArrayBuffer }>>([]);
  const playingRef = useRef(false);
  const playbackAudioCtxRef = useRef<AudioContext | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamLoggedRef = useRef(false); // Track if we've logged audio start for current response

  // ============================================================================
  // EVI TESTING STATE
  // ============================================================================
  const [isPaused, setIsPaused] = useState(false);
  const [chatGroupId, setChatGroupId] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(true);
  const [toolCallLog, setToolCallLog] = useState<{ display: string; full: string }[]>([]);
  const [lastToolCall, setLastToolCall] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isFetchingMemory, setIsFetchingMemory] = useState(false);
  const [fetchedMemory, setFetchedMemory] = useState<{
    name: string;
    type: string;
    observations: string[];
    relations?: { type: string; with: string }[];
    emotionTags?: string[];
    source: 'entity' | 'topic' | 'emotion';
    entityName?: string; // Original entity name for actions
  } | null>(null);
  const [selectedObservationIndex, setSelectedObservationIndex] = useState<number | null>(null);
  const [selectedMemoryName, setSelectedMemoryName] = useState<string | null>(null);

  // Derive mode from state
  const currentMode: 'idle' | 'searching' | 'viewing' = isFetchingMemory
    ? 'searching'
    : fetchedMemory
      ? 'viewing'
      : 'idle';

  // Left sidebar state
  const [showMemorySidebar, setShowMemorySidebar] = useState(false);
  const [memorySidebarTab, setMemorySidebarTab] = useState<'list' | 'graph' | 'family'>('list');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [memoryLedger, setMemoryLedger] = useState<Array<{
    type: 'fetch' | 'create' | 'update';
    entityName: string;
    detail: string;
    timestamp: Date;
  }>>([]);

  // Get session memories (from localStorage, excluding seed data)
  // Includes: new entities, new observations on existing entities, new relations
  const sessionMemories = useMemo(() => {
    const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!stored) return { entities: [], observations: [], relations: [], updatedSeedEntities: [] as Entity[] };
    try {
      const parsed = JSON.parse(stored) as MemoryStore;

      // Find seed entities that have new observations attached
      const newObsEntityIds = new Set(parsed.observations.map(o => o.entityId));
      const updatedSeedEntities = SEED_MEMORY_STORE.entities.filter(
        e => newObsEntityIds.has(e.id)
      );

      return {
        ...parsed,
        updatedSeedEntities,
      };
    } catch {
      return { entities: [], observations: [], relations: [], updatedSeedEntities: [] as Entity[] };
    }
  }, [toolCallLog]); // Re-compute when tool calls happen

  // Calculate graph layout for memory visualization
  const graphData = useMemo(() => {
    const entities = SEED_MEMORY_STORE.entities;
    const relations = SEED_MEMORY_STORE.relations;

    // Simple circular layout with some randomization for visual interest
    const width = 280;
    const height = 350;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Position nodes in a circle
    const nodes = entities.map((entity, i) => {
      const angle = (i / entities.length) * 2 * Math.PI - Math.PI / 2;
      // Add slight randomization
      const r = radius + (Math.random() - 0.5) * 30;
      return {
        entity,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        label: entity.name.split(' ')[0] + (entity.approximateYear ? ` ${entity.approximateYear}` : ''),
      };
    });

    // Create edges from relations
    const edges = relations.map((rel) => {
      const fromNode = nodes.find((n) => n.entity.id === rel.fromEntityId);
      const toNode = nodes.find((n) => n.entity.id === rel.toEntityId);
      return fromNode && toNode ? { from: fromNode, to: toNode, type: rel.relationType } : null;
    }).filter(Boolean) as Array<{ from: typeof nodes[0]; to: typeof nodes[0]; type: string }>;

    return { nodes, edges, width, height };
  }, []);

  // Calculate family tree graph layout
  const familyGraphData = useMemo(() => {
    // Only show person entities and family relations
    const familyRelationTypes = ['mother_of', 'father_of', 'sibling_of', 'spouse_of'];
    const personEntities = SEED_MEMORY_STORE.entities.filter((e) => e.entityType === 'person');
    const familyRelations = SEED_MEMORY_STORE.relations.filter((r) => familyRelationTypes.includes(r.relationType));

    const width = 280;
    const height = 350;

    // Position family members in a tree-like structure
    // Daegwon at center, parents above, grandparents at top, siblings beside
    const positions: Record<string, { x: number; y: number }> = {
      'entity-daegwon': { x: width / 2, y: height * 0.65 },
      'entity-brother-ingwon': { x: width * 0.75, y: height * 0.65 },
      'entity-mom-bosung': { x: width * 0.35, y: height * 0.4 },
      'entity-dad-suchan': { x: width * 0.65, y: height * 0.4 },
      'entity-grandma-okju': { x: width * 0.2, y: height * 0.15 },
      'entity-grandpa-seungrok': { x: width * 0.4, y: height * 0.15 },
      'entity-grandma-sooin': { x: width * 0.75, y: height * 0.15 },
    };

    const nodes = personEntities.map((entity) => {
      const pos = positions[entity.id] || { x: width / 2, y: height * 0.85 };
      // Create relationship label for hover
      let relationToUser = '';
      if (entity.id === 'entity-daegwon') relationToUser = 'You';
      else if (entity.id === 'entity-brother-ingwon') relationToUser = 'Brother';
      else if (entity.id === 'entity-mom-bosung') relationToUser = 'Mom';
      else if (entity.id === 'entity-dad-suchan') relationToUser = 'Dad';
      else if (entity.id === 'entity-grandma-okju') relationToUser = "Mom's Mom";
      else if (entity.id === 'entity-grandpa-seungrok') relationToUser = "Mom's Dad";
      else if (entity.id === 'entity-grandma-sooin') relationToUser = "Dad's Mom";

      return {
        entity,
        x: pos.x,
        y: pos.y,
        label: entity.name.split(' ').pop() || entity.name, // Last word (usually first name)
        relationToUser,
      };
    });

    // Create edges from family relations
    const edges = familyRelations.map((rel) => {
      const fromNode = nodes.find((n) => n.entity.id === rel.fromEntityId);
      const toNode = nodes.find((n) => n.entity.id === rel.toEntityId);
      return fromNode && toNode ? { from: fromNode, to: toNode, type: rel.relationType } : null;
    }).filter(Boolean) as Array<{ from: typeof nodes[0]; to: typeof nodes[0]; type: string }>;

    return { nodes, edges, width, height };
  }, []);

  // Add to memory ledger
  const addToLedger = (type: 'fetch' | 'create' | 'update', entityName: string, detail: string) => {
    setMemoryLedger((prev) => [
      { type, entityName, detail, timestamp: new Date() },
      ...prev.slice(0, 49), // Keep last 50 entries
    ]);
  };

  // Show memory in modal when clicked from sidebar
  const showMemoryFromSidebar = (entity: Entity) => {
    const store = initializeMemoryStore();
    const observations = getObservationsForEntity(store, entity.id);
    const relations = getRelationsForEntity(store, entity.id);
    setFetchedMemory({
      name: entity.name,
      type: entity.entityType,
      observations: observations.map((o) => o.content),
      relations: relations.map((r) => ({ type: r.relation.relationType, with: r.otherEntity.name })),
      emotionTags: entity.emotionTags,
      source: 'entity',
      entityName: entity.name,
    });
    // Set selectedMemory and inject context
    setSelectedMemoryName(entity.name);
    wsRef.current?.send(JSON.stringify({
      type: 'session_settings',
      context: {
        text: `CURRENT_SELECTED_MEMORY: "${entity.name}". When user shares new details or emotions, apply them to this memory using its exact name.`,
        type: 'persistent',
      },
    }));
  };

  const getProxyUrl = (resumeChatGroupId?: string) => {
    const envUrl = (import.meta as any).env?.VITE_EVI_PROXY_WS as string | undefined;
    let base =
      envUrl ||
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname || 'localhost'}:8788/evi`;
    return resumeChatGroupId ? `${base}?resumed_chat_group_id=${resumeChatGroupId}` : base;
  };

  const proxyWsUrl = useMemo(() => getProxyUrl(), []);
  const [colorIndex, setColorIndex] = useState(() => {
    const saved = localStorage.getItem('emberTalkOrbColor');
    return saved ? Math.min(parseInt(saved, 10), colorSchemes.length - 1) : 0;
  });
  const currentColor = colorSchemes[colorIndex];
  const [showExitOverlay, setShowExitOverlay] = useState(false);

  // ============================================================================
  // EVI TESTING FUNCTIONS
  // ============================================================================
  const addToLog = (message: string, fullMessage?: string) => {
    const ts = new Date().toLocaleTimeString();
    const display = `[${ts}] ${message}`;
    const full = fullMessage ? `[${ts}] ${fullMessage}` : display;
    setToolCallLog((prev) => [{ display, full }, ...prev.slice(0, 49)]); // Keep 50 logs
    console.log(full);
  };

  const copyLogToClipboard = (index: number) => {
    const log = toolCallLog[index];
    if (log) {
      navigator.clipboard.writeText(log.full);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const copyAllLogsToClipboard = () => {
    const allLogs = toolCallLog.map((l) => l.full).join('\n');
    navigator.clipboard.writeText(allLogs);
    setCopiedIndex(-1); // Use -1 to indicate "all copied"
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handlePause = () => {
    wsRef.current?.send(JSON.stringify({ type: 'pause_assistant_message' }));
    setIsPaused(true);
    addToLog('⏸️ Paused EVI');
  };

  const handleResume = () => {
    wsRef.current?.send(JSON.stringify({ type: 'resume_assistant_message' }));
    setIsPaused(false);
    addToLog('▶️ Resumed EVI');
  };

  const sendDynamicVariables = (variables: Record<string, string | number | boolean>) => {
    wsRef.current?.send(JSON.stringify({ type: 'session_settings', variables }));
    addToLog(`📝 Sent variables: ${Object.keys(variables).join(', ')}`);
  };

  // Memory card action handlers - inject prompts to guide EVI

  // Click emotion tag to see all memories with that emotion
  const handleEmotionTagClick = (emotion: string) => {
    setIsFetchingMemory(true);
    const store = initializeMemoryStore();
    const results = searchByEmotion(store, emotion as EmotionTag);

    setTimeout(() => {
      setIsFetchingMemory(false);
      setSelectedObservationIndex(null);
      if (results.length > 0) {
        setFetchedMemory({
          name: `${results.length} ${emotion} memories`,
          type: 'emotion',
          observations: results.map((r) => `${r.entity.name}: ${r.observations[0]?.content || 'No details yet'}`),
          emotionTags: [emotion],
          source: 'emotion',
          entityName: results[0]?.entity.name,
        });
        addToLog(`💭 Browsing ${emotion} memories: ${results.length} found`);
        addToLedger('fetch', `${emotion} memories`, `Browsed ${results.length} memories`);
      }
    }, 300);
  };

  // Click observation to select it for detailed actions
  const handleObservationClick = (index: number) => {
    if (selectedObservationIndex === index) {
      // Deselecting
      setSelectedObservationIndex(null);
    } else {
      // Selecting
      setSelectedObservationIndex(index);

      // For topic/emotion searches, observations are formatted as "Entity Name: content"
      // Extract the entity name and set it as selectedMemory
      if (fetchedMemory && (fetchedMemory.source === 'topic' || fetchedMemory.source === 'emotion')) {
        const obs = fetchedMemory.observations[index];
        const colonIndex = obs.indexOf(':');
        if (colonIndex > 0) {
          const entityName = obs.substring(0, colonIndex).trim();
          setSelectedMemoryName(entityName);
          // Update fetchedMemory.entityName so action buttons use correct entity
          setFetchedMemory({ ...fetchedMemory, entityName });
          // Inject context
          wsRef.current?.send(JSON.stringify({
            type: 'session_settings',
            context: {
              text: `CURRENT_SELECTED_MEMORY: "${entityName}". When user shares new details or emotions, apply them to this memory using its exact name.`,
              type: 'persistent',
            },
          }));
          addToLog(`📌 Selected memory: ${entityName}`);
        }
      } else if (fetchedMemory?.entityName) {
        // For single entity fetch, the entityName is already set
        setSelectedMemoryName(fetchedMemory.entityName);
      }
    }
  };

  // Add More Details - explore the selected observation deeper
  const handleAddDetail = () => {
    if (!fetchedMemory?.entityName || selectedObservationIndex === null) return;

    const selectedObs = fetchedMemory.observations[selectedObservationIndex];
    const memoryName = fetchedMemory.entityName;

    const prompt = `ACTIVE_MEMORY: "${memoryName}"
SELECTED_DETAIL: "${selectedObs}"

The user clicked "Add More Details" on this specific memory detail.
Help them explore this memory deeper with warm autobiographer questions:
- "Can you picture that moment? What do you see around you?"
- "Who else was there with you?"
- "What sounds or smells come to mind?"
- "How old were you then?"
- "What happened just before or after?"

After they share new details, call store_observation with entity_name="${memoryName}".
CRITICAL: Use the exact entity name shown above.
IMPORTANT: Only save facts they actually share. Never invent details.`;

    wsRef.current?.send(JSON.stringify({
      type: 'session_settings',
      context: { text: prompt, type: 'temporary' },
    }));
    addToLog(`💬 Exploring: "${selectedObs.slice(0, 30)}..."`);
    // Keep selectedMemoryName set (don't clear it - user is still working on this memory)
    setFetchedMemory(null);
    setSelectedObservationIndex(null);
  };

  // Add Related - connect this memory detail to other people, places, events
  const handleAddRelated = () => {
    if (!fetchedMemory?.entityName || selectedObservationIndex === null) return;

    const selectedObs = fetchedMemory.observations[selectedObservationIndex];
    const memoryName = fetchedMemory.entityName;
    const existingRelations = fetchedMemory.relations?.map(r => r.with).join(', ') || 'none yet';

    const prompt = `ACTIVE_MEMORY: "${memoryName}"
SELECTED_DETAIL: "${selectedObs}"
Current connections: ${existingRelations}

The user clicked "Add Related" to connect this memory to other people, places, or events.
Help them discover what this memory connects to by asking:
- "Does this remind you of anyone else in your life?"
- "Were there other important moments around that same time?"
- "Is there a place that comes to mind when you think of this?"
- "Did this lead to anything else significant?"

When they mention a connection:
1. Check if that entity exists with fetch_entity
2. If not, create it with store_entity
3. Use store_relation with from_entity="${memoryName}" to link them

CRITICAL: Use the exact entity name shown above for the from_entity.
IMPORTANT: Only create connections they explicitly mention. Never invent relationships.`;

    wsRef.current?.send(JSON.stringify({
      type: 'session_settings',
      context: { text: prompt, type: 'temporary' },
    }));
    addToLog(`💬 Finding connections for: "${selectedObs.slice(0, 30)}..."`);
    // Keep selectedMemoryName set (don't clear it - user is still working on this memory)
    setFetchedMemory(null);
    setSelectedObservationIndex(null);
  };

  // Add Emotion - tag how this specific memory detail makes them feel
  const handleAddEmotion = () => {
    if (!fetchedMemory?.entityName || selectedObservationIndex === null) return;

    const selectedObs = fetchedMemory.observations[selectedObservationIndex];
    const memoryName = fetchedMemory.entityName;
    const existingEmotions = fetchedMemory.emotionTags?.join(', ') || 'none yet';

    const prompt = `ACTIVE_MEMORY: "${memoryName}"
SELECTED_DETAIL: "${selectedObs}"
Current emotion tags: ${existingEmotions}

The user clicked "Add Emotion" to tag how this memory makes them feel.
Ask gently: "When you think about that moment, what feelings come up? It's okay if there are mixed feelings."

Available emotions: proud, happy, nostalgic, bittersweet, funny, inspiring, meaningful, sad, embarrassing, regretful, upsetting, stressful, traumatic, nervous, anxious, grateful.

After they share, call tag_memory with entity_name="${memoryName}".
CRITICAL: Use the exact entity name shown above.
Multiple emotions are welcome - memories are often complex.
IMPORTANT: Only tag emotions they explicitly express. Never assume feelings.`;

    wsRef.current?.send(JSON.stringify({
      type: 'session_settings',
      context: { text: prompt, type: 'temporary' },
    }));
    addToLog(`💬 Tagging emotion for: "${selectedObs.slice(0, 30)}..."`);
    // Keep selectedMemoryName set (don't clear it - user is still working on this memory)
    setFetchedMemory(null);
    setSelectedObservationIndex(null);
  };

  const handleDismissMemory = () => {
    const wasSelected = selectedMemoryName;
    setFetchedMemory(null);
    setSelectedObservationIndex(null);
    setSelectedMemoryName(null);
    // Clear the context
    wsRef.current?.send(JSON.stringify({
      type: 'session_settings',
      context: { text: '', type: 'persistent' },
    }));
    addToLog(`👋 Dismissed memory card${wasSelected ? ` (was: ${wasSelected})` : ''}`);
  };

  const handleToolCall = (parsed: any) => {
    const { tool_call_id, name, parameters } = parsed;
    const params = JSON.parse(parameters || '{}');
    addToLog(`🔧 Tool: ${name}`);
    setLastToolCall(`${name}(${JSON.stringify(params)})`);

    // Get current memory store
    const store = initializeMemoryStore();
    let content = '';

    switch (name) {
      case 'fetch_entity': {
        const { query } = params;
        setIsFetchingMemory(true);
        const entities = findEntitiesByQuery(store, query);

        if (entities.length === 0) {
          // NO MATCHES
          content = JSON.stringify({ found: false, message: `No memories found for "${query}"` });
          addToLog(`🔍 No entity found: ${query}`);
          setTimeout(() => setIsFetchingMemory(false), 1000);
        } else if (entities.length === 1) {
          // SINGLE MATCH - return full details
          const entity = entities[0];
          const observations = getObservationsForEntity(store, entity.id);
          const relations = getRelationsForEntity(store, entity.id);

          const entityResult = {
            found: true,
            _instruction: "IMPORTANT: Only mention the facts listed below. Do NOT add, embellish, or invent any details not in this response.",
            entity: {
              name: entity.name,
              type: entity.entityType,
              year: entity.approximateYear,
              emotionTags: entity.emotionTags || [],
            },
            known_facts: observations.map((o) => o.content),
            known_connections: relations.map((r) => ({
              type: r.relation.relationType,
              with: r.otherEntity.name,
            })),
            _reminder: `You know ${observations.length} facts about ${entity.name}. If asked about something not listed above, say "I don't have that detail yet - would you like to tell me about it?"`,
          };
          content = JSON.stringify(entityResult);

          // Show fetched memory in UI and set selectedMemory context
          setTimeout(() => {
            setIsFetchingMemory(false);
            setFetchedMemory({
              name: entity.name,
              type: entity.entityType,
              observations: observations.map((o) => o.content),
              relations: relations.map((r) => ({ type: r.relation.relationType, with: r.otherEntity.name })),
              emotionTags: entity.emotionTags,
              source: 'entity',
              entityName: entity.name, // For action buttons
            });
            // Set selectedMemory and inject context
            setSelectedMemoryName(entity.name);
            wsRef.current?.send(JSON.stringify({
              type: 'session_settings',
              context: {
                text: `CURRENT_SELECTED_MEMORY: "${entity.name}". When user shares new details or emotions, apply them to this memory using its exact name.`,
                type: 'persistent',
              },
            }));
            // No auto-hide for entity - user can interact with buttons or dismiss
          }, 800);

          addToLog(`🧠 Found: ${entity.name} (${observations.length} obs, ${relations.length} rels)`);
          addToLedger('fetch', entity.name, `Fetched with ${observations.length} observations`);
        } else {
          // MULTIPLE MATCHES - return list for disambiguation
          const matches = entities.slice(0, 5).map((e) => {
            const obs = getObservationsForEntity(store, e.id);
            return {
              name: e.name,
              type: e.entityType,
              year: e.approximateYear || null,
              emotionTags: e.emotionTags || [],
              hint: obs[0]?.content || 'No details yet',
            };
          });

          content = JSON.stringify({
            found: true,
            multiple_matches: true,
            count: entities.length,
            matches,
            _instruction: `Found ${entities.length} matches for "${query}". Ask user which one they mean, using the hints to help differentiate. Once they clarify, call fetch_entity again with the specific name.`,
          });

          addToLog(`🔍 Multiple matches (${entities.length}) for: ${query}`);
          setTimeout(() => setIsFetchingMemory(false), 1000);
        }
        break;
      }

      case 'fetch_memories_by_topic': {
        const { topic, entity_type = 'any' } = params;
        setIsFetchingMemory(true);
        const results = searchByTopic(store, topic, entity_type, 5);

        content = JSON.stringify({
          _instruction: "IMPORTANT: Only mention the facts listed below. Do NOT invent details, locations, or events not in this data.",
          found: results.length > 0,
          count: results.length,
          memories: results.map((r) => ({
            name: r.entity.name,
            type: r.entity.entityType,
            relevance: r.relevance,
            year: r.entity.approximateYear,
            emotionTags: r.entity.emotionTags || [],
            known_facts: r.observations.map((o) => o.content),
          })),
          _reminder: "Share only what's in 'known_facts'. For anything else, ask the user to tell you about it.",
        });

        // Show first result in UI
        setTimeout(() => {
          setIsFetchingMemory(false);
          if (results.length > 0) {
            const first = results[0];
            setFetchedMemory({
              name: `${results.length} memories: "${topic}"`,
              type: first.entity.entityType,
              observations: results.slice(0, 3).map((r) => `${r.entity.name}: ${r.observations[0]?.content || ''}`),
              emotionTags: first.entity.emotionTags,
              source: 'topic',
              entityName: first.entity.name, // For action buttons
            });
            // No auto-dismiss - wait for user interaction
          }
        }, 800);

        addToLog(`🔍 Topic "${topic}": ${results.length} results`);
        if (results.length > 0) {
          addToLedger('fetch', `"${topic}"`, `Found ${results.length} memories`);
        }
        break;
      }

      case 'fetch_memories_by_emotion': {
        const { emotion } = params;
        setIsFetchingMemory(true);
        const results = searchByEmotion(store, emotion as EmotionTag);

        content = JSON.stringify({
          _instruction: "IMPORTANT: Only mention the facts listed below. Do NOT invent or embellish details.",
          found: results.length > 0,
          count: results.length,
          emotion,
          memories: results.map((r) => ({
            name: r.entity.name,
            type: r.entity.entityType,
            known_facts: r.observations.map((o) => o.content),
          })),
          _reminder: "These memories are tagged as " + emotion + ". Share only the known_facts. Do not make up sensory details or events.",
        });

        // Show results in UI
        setTimeout(() => {
          setIsFetchingMemory(false);
          if (results.length > 0) {
            setFetchedMemory({
              name: `${results.length} ${emotion} memories`,
              type: 'emotion',
              observations: results.slice(0, 3).map((r) => r.entity.name),
              emotionTags: [emotion as EmotionTag],
              source: 'emotion',
              entityName: results[0]?.entity.name, // For action buttons
            });
            // No auto-dismiss - wait for user interaction
          }
        }, 800);

        addToLog(`💭 Emotion "${emotion}": ${results.length} results`);
        if (results.length > 0) {
          addToLedger('fetch', `${emotion} memories`, `Found ${results.length} memories`);
        }
        break;
      }

      case 'store_entity': {
        const { name: entityName, entity_type, aliases, approximate_year, life_stage } = params;
        const now = new Date().toISOString();
        const newEntity: Entity = {
          id: `entity-${Date.now()}`,
          name: entityName,
          entityType: entity_type,
          aliases,
          approximateYear: approximate_year,
          lifeStage: life_stage,
          createdAt: now,
          updatedAt: now,
        };

        store.entities.push(newEntity);
        saveToLocalStorage(store);

        content = JSON.stringify({ success: true, entityId: newEntity.id, message: `Created ${entity_type}: ${entityName}` });
        addToLog(`✨ Created: ${entityName}`);
        addToLedger('create', entityName, `New ${entity_type} created`);
        break;
      }

      case 'store_observation': {
        const { entity_name, content: obsContent } = params;
        const entities = findEntitiesByQuery(store, entity_name);

        if (entities.length === 0) {
          content = JSON.stringify({ success: false, message: `Entity "${entity_name}" not found` });
          addToLog(`❌ Entity not found: ${entity_name}`);
        } else {
          const newObs: Observation = {
            id: `obs-${Date.now()}`,
            entityId: entities[0].id,
            content: obsContent,
            confidence: 0.8,
            createdAt: new Date().toISOString(),
          };

          store.observations.push(newObs);
          saveToLocalStorage(store);

          content = JSON.stringify({ success: true, message: `Added observation to ${entities[0].name}` });
          addToLog(`📝 Observation added to: ${entities[0].name}`);
          addToLedger('update', entities[0].name, `New observation added`);
        }
        break;
      }

      case 'store_relation': {
        const { from_entity, to_entity, relation_type } = params;
        const fromEntities = findEntitiesByQuery(store, from_entity);
        const toEntities = findEntitiesByQuery(store, to_entity);

        if (fromEntities.length === 0 || toEntities.length === 0) {
          content = JSON.stringify({
            success: false,
            message: `Could not find both entities: "${from_entity}" and "${to_entity}"`,
          });
          addToLog(`❌ Relation failed: missing entities`);
        } else {
          const newRel: Relation = {
            id: `rel-${Date.now()}`,
            fromEntityId: fromEntities[0].id,
            toEntityId: toEntities[0].id,
            relationType: relation_type,
            strength: 0.8,
            createdAt: new Date().toISOString(),
          };

          store.relations.push(newRel);
          saveToLocalStorage(store);

          content = JSON.stringify({
            success: true,
            message: `Created ${relation_type}: ${fromEntities[0].name} -> ${toEntities[0].name}`,
          });
          addToLog(`🔗 Relation: ${fromEntities[0].name} -> ${toEntities[0].name}`);
          addToLedger('create', `${fromEntities[0].name} → ${toEntities[0].name}`, `New ${relation_type} relation`);
        }
        break;
      }

      case 'tag_memory': {
        const { entity_name, emotion } = params;
        const entities = findEntitiesByQuery(store, entity_name);

        if (entities.length === 0) {
          content = JSON.stringify({ success: false, message: `Entity "${entity_name}" not found` });
          addToLog(`❌ Entity not found for tagging: ${entity_name}`);
        } else {
          const entity = entities[0];
          const existingTags = entity.emotionTags || [];
          if (existingTags.includes(emotion)) {
            // Tag already exists
            content = JSON.stringify({
              success: true,
              already_tagged: true,
              message: `${entity.name} is already tagged as ${emotion}. Current tags: ${existingTags.join(', ')}`,
              current_tags: existingTags,
            });
            addToLog(`🏷️ Already tagged: ${entity.name} as ${emotion}`);
          } else {
            // Add new tag
            entity.emotionTags = [...existingTags, emotion];
            entity.updatedAt = new Date().toISOString();
            saveToLocalStorage(store);
            // Also save modified seed entities
            saveModifiedSeedEntity(entity);

            content = JSON.stringify({
              success: true,
              already_tagged: false,
              message: `Added ${emotion} to ${entity.name}. Tags: ${entity.emotionTags.join(', ')}`,
              current_tags: entity.emotionTags,
            });
            addToLog(`🏷️ Tagged: ${entity.name} as ${emotion} (now has ${entity.emotionTags.length} tags)`);
            addToLedger('update', entity.name, `Tagged as ${emotion}`);
          }
        }
        break;
      }

      case 'get_current_weather': {
        const temp = params.format === 'celsius' ? '22°C' : '72°F';
        content = JSON.stringify({
          location: params.location,
          temperature: temp,
          conditions: 'Partly cloudy',
        });
        addToLog(`🌤️ Weather: ${params.location} = ${temp}`);
        break;
      }

      case 'recent_5_memories': {
        content = JSON.stringify({ memories: TEST_CONFIG.sampleMemories });
        addToLog(`🧠 Returned 5 memories`);
        break;
      }

      default: {
        content = JSON.stringify({ status: 'success', tool: name, params });
        addToLog(`⚙️ Generic response for ${name}`);
      }
    }

    wsRef.current?.send(JSON.stringify({ type: 'tool_response', tool_call_id, content }));
    addToLog(`✅ Sent response`);
  };

  // Audio utilities (unchanged from original)
  const base64FromBytes = (bytes: Uint8Array) => {
    let b = '';
    for (let i = 0; i < bytes.length; i += 0x8000)
      b += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(b);
  };

  const bytesFromBase64 = (b64: string) => {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };

  const downsampleTo16k = (input: Float32Array, rate: number) => {
    if (rate === 16000) return input;
    const r = rate / 16000,
      len = Math.floor(input.length / r),
      out = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const idx = i * r,
        i0 = Math.floor(idx),
        i1 = Math.min(i0 + 1, input.length - 1),
        f = idx - i0;
      out[i] = input[i0] * (1 - f) + input[i1] * f;
    }
    return out;
  };

  const floatToPcm16 = (f32: Float32Array) => {
    const out = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
      const v = Math.max(-1, Math.min(1, f32[i]));
      out[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
    }
    return new Uint8Array(out.buffer);
  };

  const enqueuePlayback = (bytes: Uint8Array) => {
    playbackQueueRef.current.push({
      wav: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    });
    void pumpPlayback();
  };

  const ensurePlaybackCtx = () => {
    // Check if context is missing OR closed (closed contexts can't be reused)
    if (!playbackAudioCtxRef.current || playbackAudioCtxRef.current.state === 'closed') {
      playbackAudioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return playbackAudioCtxRef.current;
  };

  const pumpPlayback = async () => {
    if (playingRef.current) return;
    const next = playbackQueueRef.current.shift();
    if (!next) return;

    const ctx = ensurePlaybackCtx();
    try {
      await ctx.resume();
      setNeedsAudioGesture(false);
    } catch (e) {
      console.warn('[Audio] Context resume failed, needs gesture:', e);
      playbackQueueRef.current.unshift(next);
      setNeedsAudioGesture(true);
      return;
    }

    playingRef.current = true;
    isEmberSpeakingRef.current = true;
    didEmberSpeakOnceRef.current = true;
    setIsEmberSpeaking(true);

    let audioBuffer: AudioBuffer | null = null;
    try {
      audioBuffer = await ctx.decodeAudioData(next.wav.slice(0));
    } catch (e) {
      console.warn('[Audio] Decode failed:', e);
      playingRef.current = false;
      if (!playbackQueueRef.current.length) {
        isEmberSpeakingRef.current = false;
        setIsEmberSpeaking(false);
      }
      void pumpPlayback();
      return;
    }

    let analyser = playbackAnalyserRef.current;
    if (!analyser) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      playbackAnalyserRef.current = analyser;
      analyser.connect(ctx.destination);
    }

    const src = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(analyser);
    src.onended = () => {
      playingRef.current = false;
      try {
        src.disconnect();
      } catch {}
      if (!playbackQueueRef.current.length) {
        isEmberSpeakingRef.current = false;
        setIsEmberSpeaking(false);
      }
      void pumpPlayback();
    };
    try {
      src.start();
    } catch {
      playingRef.current = false;
    }
  };

  const startMicCapture = async () => {
    if (didRequestMicRef.current) return;
    didRequestMicRef.current = true;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      didRequestMicRef.current = false;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      mediaStreamRef.current = stream;
      setIsMicOn(true);
      setMicPermission('granted');

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (
          isMutedRef.current ||
          !wsRef.current ||
          wsRef.current.readyState !== WebSocket.OPEN ||
          isSendingRef.current
        )
          return;
        const down = downsampleTo16k(e.inputBuffer.getChannelData(0), ctx.sampleRate);
        try {
          isSendingRef.current = true;
          wsRef.current.send(
            JSON.stringify({
              type: 'audio_input',
              data: base64FromBytes(floatToPcm16(down)),
            })
          );
        } finally {
          isSendingRef.current = false;
        }
      };

      source.connect(processor);
      processor.connect(ctx.destination);
    } catch {
      didRequestMicRef.current = false;
      setMicPermission('denied');
    }
  };

  const connectVoice = (opts: { startMic: boolean; resumeChatGroupId?: string }) => {
    // Prevent multiple connections (React Strict Mode protection)
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      console.log('[Voice] Already connected, skipping');
      return;
    }

    setVoiceError('');
    setVoiceStatus('connecting');
    didAutoGreetRef.current = false;
    didRequestMicRef.current = false;

    try {
      const ws = new WebSocket(
        opts.resumeChatGroupId ? getProxyUrl(opts.resumeChatGroupId) : proxyWsUrl
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setVoiceStatus('live');
        addToLog('🔌 Connected (new session)');
        sendDynamicVariables(TEST_CONFIG.dynamicVariables);
        // Note: System prompt handles greeting with "Welcome back, {{user_name}}!"
        // No need to send assistant_input here - EVI will greet based on prompt
        didAutoGreetRef.current = true;
        if (opts.startMic) void startMicCapture();
      };

      ws.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(String(evt.data));
          if (parsed?.type === 'proxy_error') {
            setVoiceStatus('error');
            setVoiceError(parsed?.message);
            return;
          }
          // Handle Hume EVI disconnect (e.g., inactivity timeout)
          if (parsed?.type === 'proxy_status' && parsed?.status === 'disconnected') {
            addToLog(`🔌 Hume disconnected (code: ${parsed?.code || 'unknown'})`);
            return;
          }
          if (parsed?.type === 'chat_metadata' && parsed.chat_group_id) {
            setChatGroupId(parsed.chat_group_id);
            localStorage.setItem('ember_chat_group_id', parsed.chat_group_id);
            addToLog(`📋 Chat: ${parsed.chat_group_id.slice(0, 8)}...`);
          }
          if (parsed?.type === 'tool_call') handleToolCall(parsed);
          if (parsed?.type === 'user_interruption') {
            addToLog('🛑 Interrupted');
            playbackQueueRef.current = [];
            playingRef.current = false;
            audioStreamLoggedRef.current = false; // Reset for next response
            setIsEmberSpeaking(false);
          }
          if (parsed?.type === 'audio_output' && parsed?.data) {
            // Log audio chunk received (only once per EVI response)
            if (!audioStreamLoggedRef.current) {
              audioStreamLoggedRef.current = true;
              addToLog('🔊 Audio stream started');
            }
            enqueuePlayback(bytesFromBase64(parsed.data));
          }
          if (parsed?.type === 'assistant_end') {
            // Reset audio log tracking when EVI finishes speaking
            audioStreamLoggedRef.current = false;
          }
          if (parsed?.type === 'assistant_message') {
            const content = parsed?.message?.content || '';
            addToLog(`🤖 ${content.slice(0, 40)}${content.length > 40 ? '...' : ''}`, `🤖 ${content}`);
          }
          if (parsed?.type === 'user_message') {
            const content = parsed?.message?.content || '';
            addToLog(`👤 ${content.slice(0, 40)}${content.length > 40 ? '...' : ''}`, `👤 ${content}`);
            // Dismiss memory modal when user starts speaking (natural dismissal)
            if (fetchedMemory) {
              setFetchedMemory(null);
            }
            // Start ripple eagerly when user mentions memory-related keywords
            const lowerContent = content.toLowerCase();
            const memoryKeywords = ['remember', 'tell me about', 'what about', 'grandma', 'grandpa', 'mom', 'dad', 'brother', 'sister', 'family', 'when', '2002', '1996', '2010', 'childhood', 'memory', 'memories', 'feel', 'happy', 'sad', 'nostalgic'];
            if (memoryKeywords.some(keyword => lowerContent.includes(keyword))) {
              setIsFetchingMemory(true);
              // Auto-stop ripple if no tool is called within 5 seconds
              setTimeout(() => {
                setIsFetchingMemory((current) => current ? false : current);
              }, 5000);
            }
          }
        } catch {}
      };

      ws.onerror = () => {
        setVoiceStatus('error');
        setVoiceError('Connection failed');
      };
      ws.onclose = () => {
        setVoiceStatus('idle');
        addToLog('🔌 Disconnected');
      };
    } catch {
      setVoiceStatus('error');
    }
  };

  const stopVoice = () => {
    try {
      processorRef.current?.disconnect();
    } catch {}
    try {
      audioCtxRef.current?.close();
    } catch {}
    try {
      playbackAudioCtxRef.current?.close();
    } catch {}
    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    mediaStreamRef.current = null;
    playbackQueueRef.current = [];
    setIsMicOn(false);
    setIsEmberSpeaking(false);
    setVoiceStatus('idle');
  };

  useEffect(() => {
    return () => stopVoice();
  }, []);
  useEffect(() => {
    connectVoice({ startMic: false });
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (
      voiceStatus === 'live' &&
      !mediaStreamRef.current &&
      didEmberSpeakOnceRef.current &&
      !isEmberSpeaking
    )
      void startMicCapture();
    // eslint-disable-next-line
  }, [voiceStatus, isEmberSpeaking]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  useEffect(() => {
    localStorage.setItem('emberTalkOrbColor', String(colorIndex));
  }, [colorIndex]);

  // Create AudioContext early and auto-resume - no click required for audio playback
  useEffect(() => {
    // Create context immediately
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    playbackAudioCtxRef.current = ctx;

    // Try to resume immediately (works on some browsers without gesture)
    const tryAutoResume = async () => {
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
          setNeedsAudioGesture(false);
          console.log('[Audio] Context auto-resumed');
          // Pump any pending playback that was waiting
          void pumpPlayback();
        } catch {
          // Browser requires user gesture, set up listeners
          console.log('[Audio] Waiting for user gesture...');
        }
      }
    };
    void tryAutoResume();

    // Resume on any interaction if still suspended
    const resumeAndPump = async () => {
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
          setNeedsAudioGesture(false);
          console.log('[Audio] Context resumed after user interaction');
          // Immediately pump any pending audio that was queued while waiting
          void pumpPlayback();
        } catch (e) {
          console.warn('[Audio] Failed to resume context:', e);
        }
      }
    };

    // Use capture phase to catch interaction as early as possible
    document.addEventListener('click', resumeAndPump, { capture: true });
    document.addEventListener('touchstart', resumeAndPump, { capture: true });
    document.addEventListener('keydown', resumeAndPump, { capture: true });
    // Also try on mouse move for even earlier activation
    document.addEventListener('mousemove', resumeAndPump, { once: true });

    return () => {
      document.removeEventListener('click', resumeAndPump, { capture: true });
      document.removeEventListener('touchstart', resumeAndPump, { capture: true });
      document.removeEventListener('keydown', resumeAndPump, { capture: true });
      document.removeEventListener('mousemove', resumeAndPump);
    };
  }, []);

  return (
    <div className={`talk-container ${isEntering ? 'entering' : 'active'}`}>
      <header className="header">
        <span
          style={{
            cursor: 'pointer',
            fontSize: 12,
            opacity: 0.6,
          }}
          onClick={() => setShowMemorySidebar(!showMemorySidebar)}
        >
          {showMemorySidebar ? '🧠 Hide' : '🧠 Memory'}
        </span>
        <span
          className="home-icon"
          onClick={() => setShowExitOverlay(true)}
          style={{ cursor: 'pointer' }}
        >
          ○
        </span>
        <span
          style={{
            marginLeft: 'auto',
            cursor: 'pointer',
            fontSize: 12,
            opacity: 0.6,
          }}
          onClick={() => setShowDebugPanel(!showDebugPanel)}
        >
          {showDebugPanel ? '🔧 Hide' : '🔧 Debug'}
        </span>
      </header>

      <div className="circle-wrapper">
        <div
          className={[
            'ember-orb',
            voiceStatus === 'live' ? 'live' : '',
            isMicOn && !isMuted ? 'listening' : '',
            isEmberSpeaking ? 'speaking' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          ref={orbWrapRef}
          style={
            {
              '--color-primary': currentColor.primary,
              '--color-secondary': currentColor.secondary,
            } as React.CSSProperties
          }
        >
          <div className="ember-ring mic" />
          <div className="ember-ring speak" />
          <div
            className={`circle ${isMuted ? 'muted' : ''}`}
            ref={circleRef}
            onClick={() =>
              !mediaStreamRef.current
                ? startMicCapture()
                : setColorIndex((p) => (p + 1) % colorSchemes.length)
            }
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="talk-state">
          {voiceStatus === 'connecting' && 'Connecting'}
          {voiceStatus === 'error' && voiceError}
          {voiceStatus === 'live' && isMicOn && !isMuted && !isEmberSpeaking && 'Listening'}
          {isPaused && ' (PAUSED)'}
        </div>
      </div>

      {/* Memory Fetch Animation - Ripple Effect */}
      {isFetchingMemory && (
        <div className="memory-ripple-container">
          <div className="memory-ripple" />
          <div className="memory-ripple delay-1" />
          <div className="memory-ripple delay-2" />
        </div>
      )}

      {/* Mode Indicator */}
      <div className={`mode-indicator ${currentMode}`}>
        {currentMode === 'idle' && (
          <>
            <span className="mode-icon">💭</span>
            <span className="mode-text">Say a name, place, or year to search memories...</span>
          </>
        )}
        {currentMode === 'searching' && (
          <>
            <span className="mode-icon">🔍</span>
            <span className="mode-text">Searching memories...</span>
          </>
        )}
        {currentMode === 'viewing' && (
          <>
            <span className="mode-icon">🧠</span>
            <span className="mode-text">Memory found</span>
          </>
        )}
      </div>

      {/* Fetched Memory Display */}
      {fetchedMemory && (
        <div className="memory-card">
          <button className="memory-dismiss" onClick={handleDismissMemory}>×</button>
          <div className="memory-card-header">
            <span className="memory-icon">
              {fetchedMemory.source === 'entity' ? '🧠' : fetchedMemory.source === 'topic' ? '🔍' : '💭'}
            </span>
            <span className="memory-name">{fetchedMemory.name}</span>
          </div>
          {fetchedMemory.emotionTags && fetchedMemory.emotionTags.length > 0 && (
            <div className="memory-emotions">
              {fetchedMemory.emotionTags.map((tag) => (
                <span
                  key={tag}
                  className="emotion-tag clickable"
                  onClick={() => handleEmotionTagClick(tag)}
                  title={`Show all ${tag} memories`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="memory-observations">
            {fetchedMemory.observations.slice(0, 5).map((obs, i) => (
              <div
                key={i}
                className={`memory-obs ${selectedObservationIndex === i ? 'selected' : ''}`}
                onClick={() => handleObservationClick(i)}
                title="Select to enable actions"
              >
                {obs}
              </div>
            ))}
          </div>
          {fetchedMemory.relations && fetchedMemory.relations.length > 0 && (
            <div className="memory-relations">
              {fetchedMemory.relations.slice(0, 3).map((rel, i) => (
                <span key={i} className="relation-tag">
                  {rel.type.replace(/_/g, ' ')} → {rel.with}
                </span>
              ))}
            </div>
          )}
          {/* Action Buttons - only show when a specific observation is selected */}
          {selectedObservationIndex !== null && fetchedMemory.entityName && (
            <div className="memory-actions">
              <button className="memory-action-btn" onClick={handleAddDetail}>
                <span>✏️</span> Add More Details
              </button>
              <button className="memory-action-btn" onClick={handleAddRelated}>
                <span>🔗</span> Add Related
              </button>
              <button className="memory-action-btn" onClick={handleAddEmotion}>
                <span>💜</span> Add Emotion
              </button>
            </div>
          )}
        </div>
      )}

      <div className="talk-controls">
        <button
          className={`control-btn ${isMuted ? 'active' : ''}`}
          onClick={() => setIsMuted(!isMuted)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
        </button>
        <button
          className="control-btn end-btn"
          onClick={() => {
            stopVoice();
            setShowExitOverlay(true);
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
          </svg>
        </button>
      </div>

      {/* MEMORY SIDEBAR - Left side */}
      {showMemorySidebar && (
        <div className="memory-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">🧠 Memory Bank</span>
          </div>

          {/* Tab Switcher */}
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${memorySidebarTab === 'list' ? 'active' : ''}`}
              onClick={() => setMemorySidebarTab('list')}
            >
              📋 List
            </button>
            <button
              className={`sidebar-tab ${memorySidebarTab === 'graph' ? 'active' : ''}`}
              onClick={() => setMemorySidebarTab('graph')}
            >
              🕸️ Graph
            </button>
            <button
              className={`sidebar-tab ${memorySidebarTab === 'family' ? 'active' : ''}`}
              onClick={() => setMemorySidebarTab('family')}
            >
              👨‍👩‍👧‍👦 Family
            </button>
          </div>

          {/* Tab Content: List View */}
          {memorySidebarTab === 'list' && (
            <>
              {/* Section 1: Stored Demo Memories */}
              <div className="sidebar-section">
                <div className="section-header">
                  <span>📦 Stored Memories ({SEED_MEMORY_STORE.entities.length})</span>
                </div>
                <div className="section-content">
                  {SEED_MEMORY_STORE.entities.map((entity) => (
                    <div
                      key={entity.id}
                      className="memory-item"
                      onClick={() => showMemoryFromSidebar(entity)}
                    >
                      <span className="memory-item-icon">
                        {entity.entityType === 'person' ? '👤' : entity.entityType === 'place' ? '📍' : '📅'}
                      </span>
                      <span className="memory-item-name">{entity.name}</span>
                      {entity.emotionTags && entity.emotionTags.length > 0 && (
                        <span className="memory-item-tags">
                          {entity.emotionTags.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Session Memories */}
              <div className="sidebar-section">
                <div className="section-header">
                  <span>✨ Session Changes ({sessionMemories.entities.length + sessionMemories.updatedSeedEntities.length + sessionMemories.observations.length})</span>
                </div>
                <div className="section-content">
                  {sessionMemories.entities.length === 0 && sessionMemories.updatedSeedEntities.length === 0 && sessionMemories.observations.length === 0 ? (
                    <div className="empty-section">No changes this session</div>
                  ) : (
                    <>
                      {/* New entities created */}
                      {sessionMemories.entities.map((entity) => (
                        <div
                          key={entity.id}
                          className="memory-item new"
                          onClick={() => showMemoryFromSidebar(entity)}
                        >
                          <span className="memory-item-icon">✨</span>
                          <span className="memory-item-name">{entity.name}</span>
                          <span className="memory-item-tags">new</span>
                        </div>
                      ))}
                      {/* Updated seed entities (have new observations) */}
                      {sessionMemories.updatedSeedEntities.map((entity) => (
                        <div
                          key={`updated-${entity.id}`}
                          className="memory-item updated"
                          onClick={() => showMemoryFromSidebar(entity)}
                        >
                          <span className="memory-item-icon">📝</span>
                          <span className="memory-item-name">{entity.name}</span>
                          <span className="memory-item-tags">+{sessionMemories.observations.filter(o => o.entityId === entity.id).length} obs</span>
                        </div>
                      ))}
                      {/* New observations on unknown entities (edge case) */}
                      {sessionMemories.observations
                        .filter(o => !sessionMemories.entities.find(e => e.id === o.entityId) && !sessionMemories.updatedSeedEntities.find(e => e.id === o.entityId))
                        .slice(0, 5)
                        .map((obs) => (
                          <div key={obs.id} className="memory-item observation">
                            <span className="memory-item-icon">💬</span>
                            <span className="memory-item-name">{obs.content.slice(0, 40)}...</span>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tab Content: Graph View */}
          {memorySidebarTab === 'graph' && (
            <div className="memory-graph-container">
              <svg
                width={graphData.width}
                height={graphData.height}
                className="memory-graph"
              >
                {/* Draw edges first (so they're behind nodes) */}
                {graphData.edges.map((edge, i) => (
                  <line
                    key={`edge-${i}`}
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    className={`graph-edge ${hoveredNode === edge.from.entity.id || hoveredNode === edge.to.entity.id ? 'highlighted' : ''}`}
                  />
                ))}

                {/* Draw nodes */}
                {graphData.nodes.map((node) => {
                  const isHovered = hoveredNode === node.entity.id;
                  const isConnected = graphData.edges.some(
                    (e) =>
                      (e.from.entity.id === node.entity.id || e.to.entity.id === node.entity.id) &&
                      (e.from.entity.id === hoveredNode || e.to.entity.id === hoveredNode)
                  );
                  const nodeClass = `graph-node ${node.entity.entityType} ${isHovered ? 'hovered' : ''} ${isConnected ? 'connected' : ''}`;

                  return (
                    <g
                      key={node.entity.id}
                      className={nodeClass}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseEnter={() => setHoveredNode(node.entity.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => showMemoryFromSidebar(node.entity)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle r={isHovered ? 14 : 10} className="node-circle" />
                      {/* Show label on hover */}
                      {(isHovered || isConnected) && (
                        <text
                          y={-18}
                          textAnchor="middle"
                          className="node-label"
                        >
                          {node.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="graph-legend">
                <span className="legend-item person">👤 Person</span>
                <span className="legend-item place">📍 Place</span>
                <span className="legend-item event">📅 Event</span>
              </div>
            </div>
          )}

          {/* Tab Content: Family Tree View */}
          {memorySidebarTab === 'family' && (
            <div className="memory-graph-container">
              <svg
                width={familyGraphData.width}
                height={familyGraphData.height}
                className="memory-graph family-graph"
              >
                {/* Draw family edges first */}
                {familyGraphData.edges.map((edge, i) => {
                  const isHighlighted = hoveredNode === edge.from.entity.id || hoveredNode === edge.to.entity.id;
                  return (
                    <line
                      key={`family-edge-${i}`}
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                      className={`graph-edge family-edge ${edge.type} ${isHighlighted ? 'highlighted' : ''}`}
                    />
                  );
                })}

                {/* Draw family nodes */}
                {familyGraphData.nodes.map((node) => {
                  const isHovered = hoveredNode === node.entity.id;
                  const isConnected = familyGraphData.edges.some(
                    (e) =>
                      (e.from.entity.id === node.entity.id || e.to.entity.id === node.entity.id) &&
                      (e.from.entity.id === hoveredNode || e.to.entity.id === hoveredNode)
                  );
                  const isUser = node.entity.id === 'entity-daegwon';
                  const nodeClass = `graph-node person ${isHovered ? 'hovered' : ''} ${isConnected ? 'connected' : ''} ${isUser ? 'user' : ''}`;

                  return (
                    <g
                      key={node.entity.id}
                      className={nodeClass}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseEnter={() => setHoveredNode(node.entity.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => showMemoryFromSidebar(node.entity)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle r={isUser ? 16 : isHovered ? 14 : 12} className="node-circle" />
                      {/* Always show name, show relation on hover */}
                      <text
                        y={isHovered ? -20 : 28}
                        textAnchor="middle"
                        className="node-label"
                      >
                        {isHovered ? `${node.relationToUser}: ${node.label}` : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="graph-legend">
                <span className="legend-item">Hover to see relationship</span>
              </div>
            </div>
          )}

          {/* Section 3: Memory Ledger - Always visible at bottom */}
          <div className="sidebar-section ledger">
            <div className="section-header">
              <span>📜 Activity Ledger ({memoryLedger.length})</span>
            </div>
            <div className="section-content">
              {memoryLedger.length === 0 ? (
                <div className="empty-section">No activity yet</div>
              ) : (
                memoryLedger.map((entry, i) => (
                  <div key={i} className={`ledger-item ${entry.type}`}>
                    <span className="ledger-icon">
                      {entry.type === 'fetch' ? '🔍' : entry.type === 'create' ? '✨' : '📝'}
                    </span>
                    <span className="ledger-entity">{entry.entityName}</span>
                    <span className="ledger-detail">{entry.detail}</span>
                    <span className="ledger-time">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEBUG PANEL - Memory Demo */}
      {showDebugPanel && (
        <div
          style={{
            position: 'fixed',
            top: 50,
            right: 10,
            bottom: 10,
            width: 380,
            background: 'rgba(0,0,0,0.95)',
            borderRadius: 12,
            padding: 12,
            color: '#fff',
            fontSize: 11,
            fontFamily: 'monospace',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: 4 }}>
            <span style={{ fontWeight: 'bold' }}>🧠 Memory Demo - Tool Log</span>
            <button
              onClick={copyAllLogsToClipboard}
              style={{ ...btnStyle, padding: '2px 6px', fontSize: 9 }}
              title="Copy all logs"
            >
              {copiedIndex === -1 ? '✓ Copied!' : '📋 Copy All'}
            </button>
          </div>
          <div style={{ fontSize: 10 }}>
            Status: {voiceStatus} | Chat: {chatGroupId?.slice(0, 8) || 'none'}
            {isPaused && <span style={{ color: '#f90' }}> PAUSED</span>}
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button onClick={handlePause} disabled={isPaused} style={btnStyle}>
              ⏸️ Pause
            </button>
            <button onClick={handleResume} disabled={!isPaused} style={btnStyle}>
              ▶️ Resume
            </button>
            <button
              onClick={() => localStorage.removeItem(MEMORY_STORAGE_KEY)}
              style={{ ...btnStyle, background: '#600' }}
            >
              🗑️ Clear Session Memories
            </button>
          </div>

          {lastToolCall && (
            <div style={{ background: '#1a1a2e', padding: 8, borderRadius: 4, border: '1px solid #333' }}>
              <div style={{ color: '#888', marginBottom: 4 }}>Last Tool Call:</div>
              <div style={{ color: '#0f0', wordBreak: 'break-all', fontSize: 10 }}>{lastToolCall}</div>
            </div>
          )}

          <div style={{ color: '#888', fontSize: 10 }}>
            Event Log (click to copy full text):
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              background: '#111',
              borderRadius: 4,
              padding: 6,
            }}
          >
            {toolCallLog.map((log, i) => (
              <div
                key={i}
                onClick={() => copyLogToClipboard(i)}
                style={{
                  borderBottom: '1px solid #222',
                  padding: '4px 6px',
                  fontSize: 10,
                  cursor: 'pointer',
                  background: copiedIndex === i ? 'rgba(0,255,0,0.1)' : 'transparent',
                  transition: 'background 0.2s',
                  borderRadius: 2,
                }}
                title="Click to copy full text"
              >
                {copiedIndex === i ? '✓ Copied!' : log.display}
              </div>
            ))}
          </div>
        </div>
      )}

      {showExitOverlay && (
        <div className="exit-overlay" onClick={() => setShowExitOverlay(false)}>
          <div className="exit-overlay-content" onClick={(e) => e.stopPropagation()}>
            <div className="exit-overlay-buttons">
              <button className="exit-btn save-btn" onClick={() => navigate('/build')}>
                Save & Next
              </button>
              <button className="exit-btn delete-btn" onClick={() => navigate('/')}>
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: '#333',
  border: 'none',
  color: '#fff',
  padding: '4px 8px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 10,
};

export default Talk;