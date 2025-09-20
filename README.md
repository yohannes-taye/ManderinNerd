# Clear session
document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
localStorage.clear();
sessionStorage.clear();
window.location.reload();


# Check system logs
sudo journalctl -u your-service-name

# Check nginx logs (if using nginx)
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check system logs
sudo tail -f /var/log/syslog


