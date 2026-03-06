# Django Deployment Guide for Hostinger VPS (187.124.96.206)
## Domain: crm.medexcellenceindia.com

Follow these steps to deploy your Django backend to your VPS.

## 1. SSH into your VPS
Open your terminal (PowerShell, Command Prompt, or Git Bash) and run:
```bash
ssh root@187.124.96.206
```

## 2. Install System Dependencies
Update the package list and install Python, pip, and Nginx:
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx -y
```

## 3. Clone Your Repository
Navigate to the directory where you want to host the app (e.g., `/var/www/`) and clone your code:
```bash
cd /var/www/
# Replace <your-repo-url> with your actual repository URL
git clone <your-repo-url>
cd <project-folder>/backend
```

## 4. Set Up Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 5. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
nano .env
```
*Make sure `DJANGO_DEBUG=False` and all database details are correct.*

## 6. Prepare Static Files
```bash
python3 manage.py collectstatic --noinput
```

## 7. Run Gunicorn (Test)
```bash
gunicorn --bind 0.0.0.0:8000 config.wsgi
```
*Press `Ctrl+C` once you verify it starts without errors.*

## 8. Configure Gunicorn as a Service
Create a systemd service file:
```bash
sudo nano /etc/systemd/system/gunicorn.service
```
Paste the following (adjust paths if necessary):
```ini
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/home/ubuntu/backend/backend
ExecStart=/home/ubuntu/backend/backend/venv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          --pythonpath /home/ubuntu/backend/backend \
          config.wsgi:application

[Install]
WantedBy=multi-user.target
```
Start and enable Gunicorn:
```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

## 9. Configure Nginx
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/afro_arab
```
Paste the following:
```nginx
server {
    listen 80;
    server_name crm.medexcellenceindia.com 187.124.96.206;

    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        alias /home/ubuntu/backend/backend/staticfiles/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}
```
Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/afro_arab /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## 10. Access Your Backend
Your API should now be live at `http://crm.medexcellenceindia.com/`.
Try accessing the admin panel at `http://crm.medexcellenceindia.com/admin/`.

## Troubleshooting 502 Bad Gateway
If you see a "502 Bad Gateway" error, it means Nginx cannot talk to Gunicorn. Follow these steps to find the cause:

### 1. Check if Gunicorn is running
```bash
sudo systemctl status gunicorn
```
*If it says "failed" or "inactive", look at the logs below.*

### 2. Check Gunicorn Logs
```bash
sudo journalctl -u gunicorn --no-pager | tail -n 20
```
*Look for Python tracebacks or "ModuleNotFoundError" (often happens if virtualenv isn't right or `.env` is missing).*

### 3. Check Social Permissions
Sometimes Nginx can't read the socket file. Try:
```bash
sudo chmod 666 /run/gunicorn.sock
sudo systemctl restart nginx
```

### 4. Test Gunicorn Manually
Stop the service and run it manually to see real-time errors:
```bash
sudo systemctl stop gunicorn
source venv/bin/activate
gunicorn --bind 0.0.0.0:8000 config.wsgi
```
*If this works but the service doesn't, there is a path error in your `/etc/systemd/system/gunicorn.service` file.*
