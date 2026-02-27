#!/bin/bash
# Local Omega Interface (Ollama Wrapper)
# Role: Local Manager
# Model: omega:latest

PROMPT="$1"

curl -s http://localhost:11434/api/generate -d "{
  \"model\": \"omega:latest\",
  \"prompt\": \"You are the Local Manager of the Rizik Ecosystem. You run locally on the Mac Mini. Your superior is OMEGA (the Cloud Architect). Execute this: $PROMPT\",
  \"stream\": false
}" | jq -r .response
