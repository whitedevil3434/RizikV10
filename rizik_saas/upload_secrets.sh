#!/bin/bash

# Extract variables from .env.local and upload to Cloudflare Pages
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ -z "$key" || "$key" == \#* ]]; then
    continue
  fi
  
  # Remove surrounding quotes from value if present
  value="${value%\"}"
  value="${value#\"}"
  
  echo "Uploading secret: $key"
  echo "$value" | npx wrangler pages secret put "$key" --project-name rizik-saas-v10
done < .env.local

echo "All secrets uploaded!"
