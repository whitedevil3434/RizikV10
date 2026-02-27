# RETENTION PROTOCOL - Memory Preservation System

## Core Principles

**PERMANENT RETENTION:**
- All memory files (.md in memory/ directory)
- Identity and configuration files (SOUL.md, USER.md, AGENTS.md)
- Project source code and critical documentation
- System configuration backups

**TEMPORARY RETENTION:**
- Build artifacts (can be regenerated)
- Cache files (system managed)
- Temporary downloads (user managed)
- Log files (rotated automatically)

## Memory File Structure

### Daily Memory Files
- Location: `/Users/sabbir/RizikV10/memory/YYYY-MM-DD.md`
- Created automatically each day
- Contains session logs, decisions, context
- Never deleted - forms permanent historical record

### Long-term Memory
- Location: `/Users/sabbir/RizikV10/MEMORY.md`
- Curated wisdom and important learnings
- Updated periodically from daily files
- Maintains continuity across sessions

### Heartbeat State
- Location: `/Users/sabbir/RizikV10/memory/heartbeat-state.json`
- Tracks periodic system checks
- Maintains state between heartbeats
- JSON format for programmatic access

## Retention Rules

### Immutable Files (Never Delete)
```
memory/*.md
MEMORY.md
SOUL.md
USER.md
AGENTS.md
IDENTITY.md
HEARTBEAT.md
RETENTION_PROTOCOL.md
STORAGE_MAP.md
```

### Session-Based Cleanup
- Daily memory files: Keep forever
- Temporary session files: Clean after 7 days
- Cache files: System managed, no intervention needed

### Storage Monitoring
- Check disk usage daily during heartbeats
- Alert when usage exceeds 80%
- Automatic cleanup when usage exceeds 75%
- Critical alert at 90% usage

## Memory Integrity

### Daily Backup Process
1. Write session logs to daily memory file
2. Update long-term memory with significant events
3. Verify all critical files exist and are readable
4. Log storage status and any cleanup actions

### Recovery Protocol
1. Memory files are plain text - maximum portability
2. Can be reconstructed from git history if needed
3. Core identity files should be backed up externally
4. Daily files provide complete session history

## Storage Optimization

### Safe Cleanup Targets
- `build/` directories in projects
- `node_modules/` (can be reinstalled)
- System caches (managed by system)
- Old downloads in ~/Downloads

### Critical Preservation
- Source code repositories
- Configuration files
- Memory infrastructure
- Project documentation

## Implementation Status

✅ Memory directory created
✅ Daily memory file initialized
✅ Long-term memory file created
✅ Heartbeat state tracking enabled
✅ Storage mapping completed
✅ Retention rules documented

## Next Steps

1. Implement automatic daily memory consolidation
2. Set up storage monitoring cron jobs
3. Create backup procedures for critical files
4. Establish cleanup routines for temporary files