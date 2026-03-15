# agent-browser 使用示例

## Example: Form submission

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# Output shows: textbox "Email" [ref=e1], textbox "Password" [ref=e2], button "Submit" [ref=e3]

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # Check result
```

## Example: Authentication with saved state

```bash
# Login once
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "username"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --url "/dashboard"
agent-browser state save auth.json

# Later sessions: load saved state
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

## Troubleshooting

- If the command is not found on Linux ARM64, use the full path in the bin folder.
- If an element is not found, use snapshot to find the correct ref.
- If the page is not loaded, add a wait command after navigation.
- Use --headed to see the browser window for debugging.

## Notes

- Refs are stable per page load but change on navigation.
- Always snapshot after navigation to get new refs.
- Use fill instead of type for input fields to ensure existing text is cleared.

## Reporting Issues

- Skill issues: Open an issue at https://github.com/TheSethRose/Agent-Browser-CLI
- agent-browser CLI issues: Open an issue at https://github.com/vercel-labs/agent-browser
