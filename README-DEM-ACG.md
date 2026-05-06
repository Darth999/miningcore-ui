# Miningcore UI - DEM & ACG Pool

This branch adds support for **Deutsche eMark (DEM)** and **Aurum Crypto Gold (ACG)** 
mining pools, based on [calvintam236/miningcore-ui](https://github.com/calvintam236/miningcore-ui).

## Changes from upstream

### `assets/js/miningcore-ui.js`
- API URL configurable via `YOUR-SERVER-IP-OR-DOMAIN` placeholder
- Pool selection persisted in `localStorage` – selected pool survives page reload
- Per-pool logo support (`updatePoolLogo`) for DEM and ACG
- Lifetime blocks counter added to stats page
- Worker list fix: uses correct API endpoint `/miners/{address}` instead of `/miners/{address}/performance`

### HTML Files
- `dashboard.html`, `stats.html`, `blocks.html`, `miners.html`, `payments.html`, `connect.html`
- DEM and ACG pool branding
- Pool logo element `#poolLogo` added to navigation

### Assets
- `assets/img/background.jpg` – Custom pool background
- `assets/img/faces/face-0.jpg` – ACG pool logo
- `assets/img/faces/face-1.jpg` – DEM pool logo
- `alerts.html` – New alerts page

## Setup

### 1. Clone this repo
```bash
git clone https://github.com/Darth999/miningcore-ui.git
cd miningcore-ui
git checkout dem-acg-pool
```

### 2. Configure API URL
Edit `assets/js/miningcore-ui.js` and set your pool API address:
```javascript
var API = 'http://YOUR-SERVER-IP-OR-DOMAIN:4000/api/';
```

### 3. Add your pool logos
Replace these files with your own pool logos:
- `assets/img/faces/face-0.jpg` – ACG logo (shown when ACG pool is selected)
- `assets/img/faces/face-1.jpg` – DEM logo (shown when DEM pool is selected)

### 4. Serve via nginx
Example nginx config for serving the UI:
```nginx
server {
    listen 80;
    server_name YOUR-DOMAIN-OR-IP;

    root /path/to/miningcore-ui;
    index dashboard.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 5. Docker (optional)
If using Docker with the miningcore stack, copy the UI files into your nginx container volume.

## Pool logos per coin
To add more coin logos, edit `miningcore-ui.js`:
```javascript
function updatePoolLogo(poolId) {
    var logos = {
        'acg': 'assets/img/faces/face-0.jpg',
        'dem': 'assets/img/faces/face-1.jpg',
        'yourcoin': 'assets/img/faces/face-2.jpg'  // add more here
    };
    var logo = logos[poolId] || 'assets/img/faces/face-0.jpg';
    $('#poolLogo').attr('src', logo);
}
```

## Works with
- [Darth999/miningcore - dem-acg-pool branch](https://github.com/Darth999/miningcore/tree/dem-acg-pool)
- Tested with Deutsche eMark (DEM) and Aurum Crypto Gold (ACG)
- Miners: Bitaxe Gamma 601/602, NerdQaxe+++

## Based on
- [calvintam236/miningcore-ui](https://github.com/calvintam236/miningcore-ui)
