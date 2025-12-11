#!/bin/bash
# Remove old remote
git remote remove origin 2>/dev/null

# Add correct remote
git remote add origin https://github.com/Fireboy086/UkrTestDB.git

# Stage and commit any changes
git add .
git commit -m "ZNO Ukrainian Test Database - Initial Deploy" || echo "No changes to commit"

# Push to GitHub
git push -u origin main
