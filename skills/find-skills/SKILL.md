---
name: find-skills
description: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.
---

# Find Skills

This skill helps you discover and install skills from the agent skills ecosystem via ClawHub.

## When to Use This Skill

Use this skill when the user:

- Asks "how do I do X" where X might be a common task with an existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Expresses interest in extending agent capabilities
- Wants to search for tools, templates, or workflows
- Mentions they wish they had help with a specific domain (design, testing, deployment, etc.)

## What is ClawHub CLI?

ClawHub CLI (`clawhub`) is the package manager for the agent skills ecosystem. Skills are modular packages that extend agent capabilities with specialized knowledge, workflows, and tools.

**Key commands:**

- `clawhub search [query]` - Search for skills by keyword
- `clawhub install <skill-name>` - Install a skill
- `clawhub install <skill-name> --version 1.2.3` - Install a specific version
- `clawhub list` - List installed skills
- `clawhub update --all` - Update all installed skills

**Browse skills at:** https://clawhub.com/

## How to Help Users Find Skills

### Step 1: Understand What They Need

When a user asks for help with something, identify:

1. The domain (e.g., React, testing, design, deployment)
2. The specific task (e.g., writing tests, creating animations, reviewing PRs)
3. Whether this is a common enough task that a skill likely exists

### Step 2: Search for Skills

Run the search command with a relevant query:

```bash
clawhub search [query]
```

For example:

- User asks "how do I make my React app faster?" → `clawhub search react performance`
- User asks "can you help me with PR reviews?" → `clawhub search pr review`
- User asks "I need to create a changelog" → `clawhub search changelog`

### Step 3: Present Options to the User

When you find relevant skills, present them to the user with:

1. The skill name and what it does
2. The install command they can run
3. A link to learn more at clawhub.com

Example response:

```
I found a skill that might help! The "react-best-practices" skill provides
React and Next.js performance optimization guidelines from Vercel Engineering.

To install it:
clawhub install react-best-practices

Learn more: https://clawhub.com/
```

### Step 4: Offer to Install

If the user wants to proceed, you can install the skill for them:

```bash
clawhub install <skill-name>
```

To install a specific version:

```bash
clawhub install <skill-name> --version 1.2.3
```

## Common Skill Categories

When searching, consider these common categories:

| Category        | Example Queries                          |
| --------------- | ---------------------------------------- |
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing         | testing, jest, playwright, e2e           |
| DevOps          | deploy, docker, kubernetes, ci-cd        |
| Documentation   | docs, readme, changelog, api-docs        |
| Code Quality    | review, lint, refactor, best-practices   |
| Design          | ui, ux, design-system, accessibility     |
| Productivity    | workflow, automation, git                |

## Tips for Effective Searches

1. **Use specific keywords**: "react testing" is better than just "testing"
2. **Try alternative terms**: If "deploy" doesn't work, try "deployment" or "ci-cd"
3. **Check installed skills first**: Run `clawhub list` to see what's already available

## When No Skills Are Found

If no relevant skills exist:

1. Acknowledge that no existing skill was found
2. Offer to help with the task directly using your general capabilities
3. Suggest the user could create and publish their own skill

Example:

```
I searched for skills related to "xyz" but didn't find any matches.
I can still help you with this task directly! Would you like me to proceed?

If this is something you do often, you could create your own skill and publish it:
clawhub publish ./my-skill --slug my-skill --name "My Skill" --version 1.0.0
```
