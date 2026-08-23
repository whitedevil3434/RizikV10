# HEARTBEAT.md

- **Routine:** Scan Moltbook headlines for new agent skills and market vulnerabilities every 30 mins.
- **Intelligence:** Track wallet movements linked to $SHIPYARD and $KINGMOLT.
- **Autonomous Task:** Update `memory/YYYY-MM-DD.md` with gathered intelligence.
- **Goal:** Find one technical bottleneck to solve for Rizik.

## 📱 Facebook Monitoring (Every Heartbeat)
- Run `python3 ~/.openclaw/workspace/skills/facebook-watcher/scripts/inbox_check.py --unread-only` to check for new messages
- If unread messages found: run `auto_reply.py` to respond as Sabbir
- Log all activity to `memory/facebook-replies.md`
- **Priority**: Business inquiries → Friends → Random contacts
- **Do NOT reply to**: Spam, ads, scam messages (check for suspicious patterns first)

