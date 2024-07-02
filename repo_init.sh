#! bin/bash

# This installation scrypt is only for Ubuntu 22.04 (Jammy Jellyfish)

# Installing Node.js
echo -e "\n\n\nInstalling Node.js:"
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

# Installing MongoDB
echo -e "\n\n\nInstalling MongoDB:"
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo -e "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod

# Installing Node.js dependencies using NPM
echo -e "\n\nInstalling Node.js dependencies:"
npm install