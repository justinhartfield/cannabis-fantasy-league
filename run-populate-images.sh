#!/bin/bash
# Script to populate image URLs in the database
# Run this after run-image-migration.sh to add actual CloudFront URLs

echo "🎨 Populating image URLs from CloudFront CDN..."

psql $DATABASE_URL < populate-images.sql

echo "✅ Image population complete!"
