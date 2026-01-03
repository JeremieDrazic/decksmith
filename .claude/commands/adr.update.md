# Update Architecture Decision Record

Amend an existing ADR to reflect evolution of the decision.

ADRs in Decksmith are living documents - they can be updated as context changes or new information emerges.

---

## Context: Decksmith Architecture

Project: Decksmith - Magic: The Gathering deck management tool

Core Values:
- Separation of concerns
- Explicit data contracts
- Deterministic behavior
- Maintainability
- Clarity over cleverness

ADR Location: docs/adr/
ADR Format: Living documents with Evolution History

---

## Process

### Step 1: Identify the ADR

Ask the user:

1. Which ADR needs to be updated?
   - Provide ADR number (e.g., "0001") OR
   - Provide ADR title OR
   - Provide filename

Examples:
- "ADR-0001"
- "Use Fastify for API Server"
- "0001-use-fastify.md"

### Step 2: Read the current ADR

1. Find the file in docs/adr/
   - If user gave number: find XXXX-*.md
   - If user gave title: search for matching title
   - If user gave filename: read directly

2. Read the entire file

3. Show the user a summary:
   - Current decision
   - Last updated date
   - Current status
   - Key points from rationale

Example:
> I've read ADR-0001: Use Fastify for API Server
> 
> Current decision: Use Fastify as the web framework for apps/api
> Last updated: 2025-01-04
> Status: Active
> 
> Key rationale: TypeScript-first, explicit validation, clear plugin system

### Step 3: Understand the change

Ask the user:

4. What has changed?
   - New information discovered?
   - Decision refined or extended?
   - New consequences or trade-offs identified?
   - Related technology or approach changed?

5. Why is this update needed?
   - What triggered this update?
   - What impact does it have?

### Step 4: Determine update scope

Based on the user's answer, determine what needs updating:

- **Minor clarification**: Just add to Evolution History
- **New practice/tool**: Add to Evolution History + maybe update Rationale
- **Changed decision**: Add to Evolution History + update Current Decision + update Rationale
- **Deprecation**: Change Status + add deprecation entry

Ask the user to confirm the scope before proceeding.

### Step 5: Update the ADR

1. **Always add an entry to Evolution History**

Format:
    
    ### YYYY-MM-DD: [Brief title of change]
    - [Description of what changed and why]
    - [Any new implications or learnings]

Place it at the TOP of Evolution History (reverse chronological order).

2. **Update other sections if needed:**

If the decision itself changed:
- Update "Current Decision" section

If new reasoning emerged:
- Update or extend "Rationale" section

If new trade-offs discovered:
- Add to "Trade-offs" section (Benefits, Costs, or Risks)

If new related docs:
- Add to "References" section

3. **Update metadata**

- Set "Last Updated" to today's date (YYYY-MM-DD format)
- Update "Status" if applicable:
  * Keep as "Active" for most updates
  * Change to "Deprecated" if being replaced
  * Add superseding ADR reference if deprecated

### Step 6: Validate

Check:
- Evolution History is in reverse chronological order (newest first)
- New entry has today's date
- New entry has clear description of what changed
- "Last Updated" date is today
- All changes are additions, not replacements (preserve history)
- If deprecated, there's a reference to the new ADR

### Step 7: Show and confirm

Show the user:
1. Summary of changes made
2. The new Evolution History entry
3. Any other sections that were updated

Ask:
- "Does this update accurately reflect the evolution?"
- "Should the status remain 'Active' or change?"
- "Any other adjustments needed?"

---

## Example Interaction

User: "Update ADR-0001 - we've decided to also use @fastify/cors plugin"

You respond:
> I've read ADR-0001: Use Fastify for API Server.
> 
> Current decision: Use Fastify as the web framework for apps/api
> Last updated: 2025-01-04
> Status: Active
> 
> You want to add information about @fastify/cors. Let me ask:
> 
> 1. Why was this plugin chosen over alternatives?
> 2. Were there other options (manual CORS, other plugins)?
> 3. Any new trade-offs or benefits from this choice?

User provides answers.

You respond:
> Perfect! I'll update the ADR with:
> 
> Evolution History entry:
> ### 2025-01-10: Added CORS handling with @fastify/cors
> - Decided to use @fastify/cors plugin for explicit CORS configuration
> - Alternative was manual CORS middleware, but plugin is better maintained and aligns with Fastify ecosystem
> - Reinforces "explicit contracts" value
> 
> Should I also update the Rationale section to mention CORS handling?

User: "Yes"

You respond:
> Done! I've updated:
> 1. Added Evolution History entry
> 2. Extended Rationale to mention CORS plugin choice
> 3. Updated "Last Updated" to 2025-01-10
> 
> The ADR now reflects the expanded use of Fastify plugins.

---

## Special Cases

### Case 1: Decision is being deprecated

If the user says the decision is no longer valid:

1. Ask: "What is replacing this decision? Is there a new ADR?"

2. Change Status to "Deprecated"

3. Add deprecation entry to Evolution History:

    ### YYYY-MM-DD: Deprecated
    - This decision has been superseded by ADR-XXXX: [New Decision Title]
    - Reason: [Brief explanation]
    - Migration: [If applicable, how to migrate]

4. If new ADR doesn't exist yet, offer: "Should I create the new ADR now?"

Example:

    # ADR-0001: Use Fastify for API Server
    
    **Last Updated:** 2025-03-15
    **Status:** Deprecated (superseded by ADR-0010)
    
    ---
    
    [... original sections ...]
    
    ## Evolution History
    
    ### 2025-03-15: Deprecated
    - Superseded by ADR-0010: Use Hono for API Server
    - Reason: Need for edge runtime compatibility
    - All new endpoints should use Hono; existing Fastify endpoints will be migrated gradually

### Case 2: Decision is being reversed (but not deprecated)

If going back to a previous state:

1. Don't modify old Evolution History entries
2. Add new entry explaining the reversal
3. Update Current Decision to reflect the new state

Example:

    ### 2025-02-20: Reverted to synchronous validation
    - Initially moved to async validation in 2025-01-15
    - Performance testing showed sync is 3x faster for our use case
    - Reverted to synchronous validation approach

### Case 3: Minor clarification

If just adding context or fixing ambiguity:

1. Add to Evolution History with "Clarification" in title
2. Update the relevant section inline

Example:

    ### 2025-01-12: Clarification on plugin usage
    - Clarified that all Fastify plugins should be explicitly registered
    - No auto-discovery or magic plugin loading

### Case 4: New related information

If new technology or practice emerges:

1. Add to Evolution History
2. Add to References section

Example:

    ### 2025-01-20: Added Fastify Type Provider for Zod
    - Discovered @fastify/type-provider-zod for better TypeScript integration
    - Allows using Zod schemas directly in route definitions
    - See: https://github.com/fastify/fastify-type-provider-zod

---

## After Update

Ask the user:

1. "Should I commit this update now?"
2. "Are there code changes needed to align with this evolution?"
3. "Should any related specs or other ADRs be updated?"
4. "Do you want to notify anyone about this change?"

---

## Important Notes

- NEVER delete or rewrite Evolution History - only add to it
- Keep all old entries intact (they show the decision's journey)
- Each update adds a new timestamped entry
- Updates should be additions, not replacements
- If a decision changes fundamentally, consider creating a new ADR instead
- Evolution History entries should be concise but informative
- Always update "Last Updated" date
- Preserve the original decision's context (don't erase why it was made)

---

## Tips for Good Updates

DO:
- Be specific about what changed and why
- Date every entry
- Keep the historical context
- Explain the trigger for the update
- Link to related changes (specs, code, other ADRs)

DON'T:
- Delete or modify old Evolution History entries
- Be vague about what changed
- Update without explanation
- Forget to update the date
- Change the original decision without documenting why