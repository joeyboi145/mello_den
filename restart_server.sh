#!/bin/bash

echo -e "\n\nStopping frontend and backend services..."
sudo systemctl stop frontend
sudo systemctl stop backend

echo -e "\n\nCompiling Javascipt bundle, reloading daemon..."
npm run build
sudo systemctl daemon-reload

echo -e "\n\nStarting frontend and backend services..."
sudo systemctl start backend
sudo systemctl start frontend

echo -e "\n\nDone! Mello Den servers restarted!"