#!/bin/bash
# Test 1: Direct driver call guessing
curl -X POST "https://api.puter.com/drivers/call" \
     -H "Content-Type: text/plain;actually=json" \
     -H "Origin: https://puter.com" \
     -d '{
        "interface": "puter-chat-completion",
        "method": "complete",
        "args": {
            "messages": [{"role":"user", "content":"hello"}],
            "model": "moonshotai/kimi-k2.5"
        }
     }'
echo -e "\n---"

# Test 2: 'driver' parameter naming
curl -X POST "https://api.puter.com/drivers/call" \
     -H "Content-Type: text/plain;actually=json" \
     -H "Origin: https://puter.com" \
     -d '{
        "driver": "puter-chat-completion",
        "method_name": "complete",
        "parameters": {
            "messages": [{"role":"user", "content":"hello"}],
            "model": "moonshotai/kimi-k2.5"
        }
     }'
echo -e "\n---"

# Test 3: Maybe it is 'ai-chat' interface?
curl -X POST "https://api.puter.com/drivers/call" \
     -H "Content-Type: text/plain;actually=json" \
     -H "Origin: https://puter.com" \
     -d '{
        "interface": "ai-chat",
        "method": "complete",
        "args": {
            "messages": [{"role":"user", "content":"hello"}],
            "model": "moonshotai/kimi-k2.5"
        }
     }'
echo -e "\n---"
