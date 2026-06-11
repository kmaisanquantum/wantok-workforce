# Redis Persistence Troubleshooting Guide

The error "Redis is configured to save RDB snapshots, but it's currently unable to persist to disk" (MISCONF) occurs when Redis is unable to write its database snapshot to disk. This often happens due to insufficient disk space or permission issues.

## Immediate Fix (Disable "stop-writes-on-bgsave-error")

If you need the server to resume accepting write commands immediately, you can disable the safety check that blocks writes when snapshots fail.

**Warning:** This is a temporary measure. If Redis crashes, you may lose data that hasn't been saved to disk.

```bash
redis-cli config set stop-writes-on-bgsave-error no
```

## Long-term Resolution

### 1. Check Disk Space
Verify if the disk is full where Redis stores its `.rdb` file (usually `/var/lib/redis`).

```bash
df -h
```

If the disk is full, clear logs or increase the partition size.

### 2. Check Permissions
Ensure the Redis user has write permissions to the data directory.

```bash
ls -ld /var/lib/redis
```

### 3. Check Redis Logs
Look for specific error messages in the Redis log file to identify why the background save is failing.

```bash
tail -f /var/log/redis/redis-server.log
```

### 4. Memory Overcommit (Linux)
Ensure the kernel is allowed to overcommit memory, which is required for Redis background saves (forking).

Add `vm.overcommit_memory = 1` to `/etc/sysctl.conf` and run:

```bash
sysctl -p
```
