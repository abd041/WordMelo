# Pictionary Word Generator — content policy

**Review date:** 2026-11-04

## Purpose

Drawing prompts for informal family and classroom games.
Curated for **halal-conscious / family-friendly** play: **non-living subjects only**, with plants and natural scenery explicitly allowed.

This is a product content policy, **not** a religious certification or scholarly ruling.

## Allowed categories

- Fruits and vegetables
- Trees, flowers, and plants
- Landscapes and natural scenery (non-animal)
- Buildings and architecture
- Houses, rooms, and furniture
- Vehicles and transport objects
- Kitchen and household objects
- Stationery and school supplies
- Technology and electronics
- Shapes and patterns
- Weather and natural phenomena
- Tools and equipment (non-weapon)

## Strict exclusions

- Humans, faces, body parts, and human-like characters
- Animals, birds, fish, insects, and other animate creatures
- Dolls / character figures that imply a living being
- Alcohol and intoxicants
- Gambling / betting / casino themes
- Sexual or inappropriate themes
- Music instruments or music performance prompts
- Violence and weapons
- Explicitly religious buildings or ritual objects (e.g. church, mosque, temple, altar)
- Other inappropriate family-game content

## Difficulty guidelines

| Level | Drawing complexity |
| --- | --- |
| Easy | Single familiar object, simple silhouette |
| Medium | Multi-part object or recognizable scene element |
| Hard | Complex structure, technical detail, or layered composition |

Difficulty reflects **practical drawing difficulty**, not word rarity.

## Dataset rules

- Source: original WordMelo curated list (`prompts.ts`) — not Random Word Generator vocabulary and not unrestricted AI expansion
- Unique IDs and unique prompt text (case-insensitive)
- Automated prohibited-pattern checks (`policy.ts`) plus manual semantic review
- Ambiguous prompts are rewritten or removed
- When the eligible pool is empty, show a message — never fall back to a general dictionary

## Counts

See `PROMPT_STATS` in `prompts.ts` for current totals by difficulty.

## Known limitations

- Automated keyword blocking cannot prove every semantic interpretation
- Best-effort filtering is not a child-safety or religious certification
- No affiliation with any commercial Pictionary trademark holder
