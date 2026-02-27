# Grok API Integration Guide - OpenClaw

## ⚠️ Current Status: EXPERIMENTAL

**Repository:** realasfngl/Grok-Api  
**Method:** Reverse-engineered wrapper (no official API key)  
**Risk Level:** HIGH (currently broken, see below)

---

## 🚨 CRITICAL ISSUES (From GitHub)

**Active Problems:**
1. **Issue #6:** "Grok Changed!" - Page structure updated, wrapper broken
2. **Issue #3:** Cloudflare 403 verification cannot be bypassed
3. **5 open issues, 0 resolved** - Active maintenance required

**Last Working:** December 2025 (may have broken since)

---

## 🔧 Installation Steps

### **Option 1: Automated Setup**
```bash
cd /Users/sabbir/RizikV10
python3 setup_grok_api.py
```

### **Option 2: Manual Setup**
```bash
# 1. Clone repository
cd /tmp
git clone https://github.com/realasfngl/Grok-Api.git
cd Grok-Api

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start API server
python3 api_server.py
# Server runs on: http://localhost:6969
```

---

## 🎯 Usage Methods

### **Method 1: Direct Python**
```python
from core import Grok

# New conversation
response = Grok("grok-3-fast").start_convo("Hello, how are you?")
print(response["response"])

# Continue conversation
response2 = Grok().start_convo(
    "Tell me more",
    extra_data=response["extra_data"]
)
```

### **Method 2: API Server**
```bash
# Start server
cd /tmp/Grok-Api
source venv/bin/activate
python3 api_server.py

# Test with curl
curl -X POST http://localhost:6969/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message",
    "model": "grok-3-fast",
    "proxy": "",
    "extra_data": null
  }'
```

### **Method 3: OpenClaw Integration**
```json
// Add to openclaw.json
{
  "models": {
    "providers": {
      "grok-local": {
        "baseUrl": "http://localhost:6969",
        "api": "openai-completions",
        "models": [{
          "id": "grok-3-fast",
          "name": "Grok 3 Fast (Unofficial)",
          "contextWindow": 128000,
          "maxTokens": 4096
        }]
      }
    }
  }
}
```

---

## 🎨 Available Models

| Model | Mode | Description |
|-------|------|-------------|
| `grok-3-auto` | auto | Automatic mode |
| `grok-3-fast` | fast | Fast processing ⭐ |
| `grok-4` | expert | Expert mode |
| `grok-4-mini-thinking` | thinking | Mini thinking mode |

---

## ⚠️ Known Limitations

### **Technical Issues:**
1. **Anti-bot Detection** - Cloudflare increasingly blocking
2. **Breaking Changes** - Grok updates break wrapper regularly
3. **IP Flagging** - Error 403/407 when detected
4. **No Maintenance** - Community-maintained, not official

### **Reliability:**
- **Uptime:** Unstable (breaks on xAI updates)
- **Rate Limits:** Unofficial limits unknown
- **Support:** Community only, no official help

---

## 🔄 Troubleshooting

### **Error: "Grok Changed!"**
```
Solution: Check GitHub issues for updates
Status: Currently broken as of Issue #6
```

### **Error: Cloudflare 403**
```
Solution: Use proxy or wait for fix
Workaround: Rotate IP addresses
```

### **Error: "list index out of range"**
```
Solution: Wrapper needs update
Action: Monitor GitHub for patches
```

---

## 🎯 OpenClaw Integration (If Working)

### **Step 1: Start Grok Server**
```bash
cd /tmp/Grok-Api
source venv/bin/activate
python3 api_server.py &
# Server: http://localhost:6969
```

### **Step 2: Configure OpenClaw**
Add to `~/.openclaw/openclaw.json`:
```json
{
  "models": {
    "providers": {
      "grok-unofficial": {
        "baseUrl": "http://localhost:6969/ask",
        "apiKey": "dummy",
        "api": "openai-completions"
      }
    }
  }
}
```

### **Step 3: Use in OpenClaw**
```bash
# After gateway restart
/model grok-unofficial/grok-3-fast
```

---

## 💡 Recommendation

**For Production:** ❌ **NOT RECOMMENDED**
- Too unstable for Protocol 100
- Breaking changes frequent
- Legal/ethical concerns

**For Testing:** ⚠️ **USE WITH CAUTION**
- Good for learning reverse engineering
- Experimental development only
- Have fallback models ready

**Better Alternatives:**
1. **Qwen3-8B** (SiliconFlow) - FREE, stable
2. **Gemini** (Google) - FREE tier, reliable
3. **Groq models** - FREE, ultra-fast

---

## 📊 Status Summary

| Factor | Score | Notes |
|--------|-------|-------|
| **Technical Quality** | ⭐⭐⭐⭐☆ | Well-engineered |
| **Reliability** | ⭐⭐☆☆☆ | Currently broken |
| **Legal Safety** | ⭐☆☆☆☆ | TOS violation |
| **Maintenance** | ⭐⭐☆☆☆ | Community-only |
| **Production Ready** | ❌ | Not recommended |

---

## 🚀 Quick Start (If You Insist)

```bash
# 1. Run setup script
python3 /Users/sabbir/RizikV10/setup_grok_api.py

# 2. Test manually
cd /tmp/Grok-Api
source venv/bin/activate
python3 manual.py

# 3. Check if working
# If errors: Check GitHub issues
# If success: Integrate with OpenClaw
```

---

**Prepared by:** Omega  
**Analysis Date:** 2026-02-05 17:35 GMT+6  
**Recommendation:** Use as fallback only, prefer stable alternatives  
**Setup Script:** `/Users/sabbir/RizikV10/setup_grok_api.py`
