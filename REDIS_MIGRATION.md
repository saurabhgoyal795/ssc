# Redis Migration Guide

## Current Setup: In-Memory Caching

The application currently uses Spring's **simple in-memory cache** for performance optimization. This is suitable for:
- Development and testing
- Small to medium deployments (single instance)
- Quick prototyping

## When to Enable Redis

Consider enabling Redis when:
- Running multiple backend instances (horizontal scaling)
- Need persistent cache across restarts
- Handling 500+ concurrent users
- Need distributed caching
- Production deployment

## How to Enable Redis

### 1. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Verify Installation:**
```bash
redis-cli ping
# Should return: PONG
```

### 2. Update Backend Configuration

**Step 1: Enable Redis Dependency**

Edit `ssc-exam-backend/pom.xml`:

```xml
<!-- Uncomment this dependency -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

**Step 2: Update application.yml**

Edit `ssc-exam-backend/src/main/resources/application.yml`:

```yaml
# Change cache type from 'simple' to 'redis'
spring:
  cache:
    type: redis  # Changed from 'simple'
    redis:
      time-to-live: 600000 # 10 minutes default

  # Uncomment Redis configuration
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 60000
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
          max-wait: -1ms
```

**Step 3: Update Environment Variables**

Edit `.env`:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=        # Leave empty if no password
```

### 3. Rebuild and Restart

```bash
cd ssc-exam-backend

# Clean and rebuild
mvn clean install

# Restart application
mvn spring-boot:run
```

### 4. Verify Redis is Working

**Check Application Logs:**
```
Lettuce ConnectionFactory initialized
```

**Test with Redis CLI:**
```bash
# Connect to Redis
redis-cli

# Monitor cache operations
MONITOR

# In another terminal, make API calls to trigger caching
curl http://localhost:8080/api/v1/subjects
```

You should see cache operations in Redis monitor.

## Cache Configuration

Current cache names and TTLs:

| Cache Name    | TTL (seconds) | Purpose                |
|---------------|---------------|------------------------|
| tests         | 3600 (1h)     | Test details          |
| materials     | 1800 (30m)    | Study materials       |
| analytics     | 600 (10m)     | User analytics        |
| leaderboard   | 300 (5m)      | Rankings              |
| subjects      | 7200 (2h)     | Subject list          |

To modify TTLs, update in `application.yml`:

```yaml
spring:
  cache:
    redis:
      time-to-live: 600000  # Default: 10 minutes
      cache-null-values: false
      use-key-prefix: true
      key-prefix: "sscexam:"
```

## Production Redis Setup

### Redis Cloud (Recommended for Production)

**Pros:**
- Managed service (no maintenance)
- High availability
- Automatic backups
- Free tier available

**Setup:**
1. Sign up at https://redis.com/redis-enterprise-cloud/
2. Create a database
3. Get connection details
4. Update `.env`:
```bash
REDIS_HOST=redis-xxxxx.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_password_here
```

### AWS ElastiCache

**For AWS deployments:**
1. Create ElastiCache Redis cluster
2. Use cluster endpoint
3. Configure security groups
4. Update connection details

### Self-Hosted Redis (Production)

**Configuration for Production:**

```bash
# /etc/redis/redis.conf

# Bind to specific IP
bind 127.0.0.1 <your-backend-ip>

# Set password
requirepass your_strong_password_here

# Enable persistence
save 900 1
save 300 10
save 60 10000

# Max memory policy
maxmemory 256mb
maxmemory-policy allkeys-lru

# Enable AOF for durability
appendonly yes
appendfilename "appendonly.aof"
```

## Performance Comparison

### In-Memory Cache (Current)
- ✅ Simple setup
- ✅ No external dependencies
- ✅ Fast (local memory)
- ❌ Lost on restart
- ❌ Single instance only
- ❌ Limited scalability

### Redis Cache
- ✅ Persistent across restarts
- ✅ Distributed (multi-instance)
- ✅ Production-ready
- ✅ Horizontal scaling
- ❌ External dependency
- ❌ Slight network latency

## Monitoring Redis

### Using Redis CLI
```bash
# Connect
redis-cli

# Get info
INFO

# Monitor memory
INFO memory

# View all keys
KEYS *

# Get cache size
DBSIZE

# Clear all cache
FLUSHALL  # Use with caution!
```

### Using RedisInsight (GUI)
Download from: https://redis.com/redis-enterprise/redis-insight/

## Troubleshooting

### Cannot connect to Redis
```bash
# Check if Redis is running
redis-cli ping

# Check port
netstat -an | grep 6379

# Check logs
tail -f /var/log/redis/redis-server.log  # Linux
brew services log redis  # macOS
```

### Application not using Redis
- Verify cache type in `application.yml` is set to `redis`
- Check for Redis connection errors in application logs
- Ensure Redis dependency is uncommented in `pom.xml`
- Rebuild application: `mvn clean install`

### Redis connection timeout
- Increase timeout in `application.yml`
- Check network/firewall rules
- Verify Redis is accessible from backend

## Cost Estimation

### Development
- **Local Redis**: Free
- **Docker Redis**: Free

### Production (1000 users)
- **Redis Cloud Free**: 30MB, suitable for testing
- **Redis Cloud Basic**: $5-10/month (256MB)
- **AWS ElastiCache**: $15-20/month (cache.t3.micro)

### Production (10,000+ users)
- **Redis Cloud Standard**: $50-100/month (1-2GB)
- **AWS ElastiCache**: $100-200/month (cache.m5.large)

## Migration Checklist

- [ ] Install Redis on server
- [ ] Uncomment Redis dependency in `pom.xml`
- [ ] Update `application.yml` cache type to `redis`
- [ ] Uncomment Redis configuration in `application.yml`
- [ ] Set Redis environment variables in `.env`
- [ ] Rebuild application (`mvn clean install`)
- [ ] Test Redis connection
- [ ] Restart application
- [ ] Verify caching is working
- [ ] Monitor performance improvement

## Rollback (Back to In-Memory)

If issues occur:

1. Comment Redis dependency in `pom.xml`
2. Change cache type to `simple` in `application.yml`
3. Rebuild and restart

Your data won't be affected - cache is just for performance.

---

**Current Status:** Using in-memory cache (no Redis needed)

**Recommendation:** Keep in-memory cache until:
- Deploying to production
- Running multiple instances
- Reaching 500+ active users
