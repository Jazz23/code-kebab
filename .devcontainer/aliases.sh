#!/bin/zsh

# Modifiable list of aliases — add, remove, or change entries here
alias_list=(
    'alias bruh="echo hi"'
)

ZSHRC="$HOME/.zshrc"

for entry in "${alias_list[@]}"; do
    if ! grep -qF "$entry" "$ZSHRC"; then
        echo "$entry" >> "$ZSHRC"
    fi
done
