npm run build:dev
rm -rf /var/www/html/**.*
rm -rf /var/www/html/assets
cp -r ./dist/**.* /var/www/html/
cp -r ./dist/assets /var/www/html/
