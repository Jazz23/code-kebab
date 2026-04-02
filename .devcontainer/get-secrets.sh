#!/bin/sh
VAULT_NAME="CodeKebab"
ENV_FILE=".env"

if ! az account show > /dev/null 2>&1; then
  echo "Not logged in to Azure CLI, skipping secret fetch."
  exit 0
fi

echo "Fetching secret list from $VAULT_NAME..."

# Get list of all secret names
secrets=$(az keyvault secret list --vault-name $VAULT_NAME --query "[].name" -o tsv)

TMP_DIR=$(mktemp -d)

# Download all secrets in parallel
for secret in $secrets; do
  (
    env_key=$(echo $secret | tr '-' '_' | tr '[:lower:]' '[:upper:]')
    echo "Downloading: $secret..."
    value=$(az keyvault secret show --vault-name $VAULT_NAME --name $secret --query "value" -o tsv)
    echo "$env_key=$value" > "$TMP_DIR/$secret"
  ) &
done

wait

# Sequentially apply results to .env
for tmp_file in "$TMP_DIR"/*; do
  [ -f "$tmp_file" ] || continue
  env_key=$(cut -d= -f1 "$tmp_file")
  value=$(cut -d= -f2- "$tmp_file")

  if [ -f "$ENV_FILE" ] && grep -q "^${env_key}=" "$ENV_FILE"; then
    current=$(grep "^${env_key}=" "$ENV_FILE" | sed 's/^[^=]*=//')
    if [ "$current" = "$value" ]; then
      echo "Skipping (unchanged): $env_key"
    else
      echo "Updating: $env_key..."
      sed -i "s|^${env_key}=.*|${env_key}=${value}|" "$ENV_FILE"
    fi
  else
    if [ -f "$ENV_FILE" ] && [ -s "$ENV_FILE" ] && [ "$(tail -c1 "$ENV_FILE" | wc -l)" -eq 0 ]; then
      echo "" >> $ENV_FILE
    fi
    echo "$env_key=$value" >> $ENV_FILE
  fi
done

rm -rf "$TMP_DIR"

echo "Done! Secrets synced to $ENV_FILE"
