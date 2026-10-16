// Eigene Miner auf der Pool-Uebersicht.
// Nur im Heimnetz sichtbar: miners.json und /minerapi/ sind extern per Nginx gesperrt (403),
// dann bleibt der Abschnitt einfach weg.
(function () {
  var POOL_HOSTS = ['darth999pool.selfhost.co', '192.168.2.121'];
  var POOL_PORTS = { 9989: 'ACG', 3334: 'ACG Low-Diff', 9990: 'DEM', 3335: 'DEM Low-Diff', 9991: 'AUR' };
  var DASH = String.fromCharCode(8211);
  var DOT = ' ' + String.fromCharCode(183) + ' ';
  var DEG = ' ' + String.fromCharCode(176) + 'C';
  var REFRESH_MS = 30000;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmtHash(ghs) {
    if (!ghs) return '0 H/s';
    return ghs >= 1000 ? (ghs / 1000).toFixed(2) + ' TH/s' : ghs.toFixed(2) + ' GH/s';
  }
  function poolLabel(url, port) {
    var host = String(url || '').replace(/^stratum[+]tcp:[/][/]/, '').split('/')[0].toLowerCase();
    if (POOL_HOSTS.indexOf(host) >= 0 && POOL_PORTS[port]) return POOL_PORTS[port];
    return (host || DASH) + ':' + port;
  }
  function row(label, value) {
    return '<div class="pool-stat-row"><span class="pool-stat-label">' + label +
      '</span><span class="pool-stat-value">' + value + '</span></div>';
  }
  function header(title, text, cls) {
    return '<div class="pool-card-header"><h2 class="pool-card-title">' + esc(title) +
      '</h2><span class="pool-status ' + cls + '">' + text + '</span></div>';
  }
  function getJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  var grid = null, summary = null;

  function ensureSection() {
    if (grid) return;
    var section = document.createElement('div');
    section.id = 'myRigs';
    section.innerHTML =
      '<h1 class="page-title" style="margin-top:50px;margin-bottom:10px;font-size:28px;">Meine Miner</h1>' +
      '<p id="myRigsSummary" style="text-align:center;margin-bottom:24px;"></p>' +
      '<div class="pool-grid" id="myRigsGrid"></div>' +
      '<p style="text-align:center;margin-top:20px;"><a href="rigs.html">Detailansicht</a></p>';
    var pg = document.getElementById('poolGrid');
    pg.parentNode.insertBefore(section, pg.nextSibling);
    grid = document.getElementById('myRigsGrid');
    summary = document.getElementById('myRigsSummary');
  }

  function card(ip, d, err) {
    var a = '<a class="pool-card" href="http://' + esc(ip) + '/" target="_blank">';
    if (err) {
      return a + header(ip, 'Offline', 'status-offline') + row('Status', 'nicht erreichbar') + '</a>';
    }
    var fb = !!d.isUsingFallbackStratum;
    var url = fb ? d.fallbackStratumURL : d.stratumURL;
    var port = fb ? d.fallbackStratumPort : d.stratumPort;
    var on = d.hashRate > 0;
    var text = on ? (fb ? 'Fallback' : 'Online') : 'Offline';
    var cls = on && !fb ? 'status-online' : 'status-offline';
    return a + header(d.hostname || ip, text, cls) +
      row('Pool', esc(poolLabel(url, port))) +
      row('Hashrate', fmtHash(d.hashRate)) +
      row('Temperatur', d.temp != null ? d.temp.toFixed(1) + DEG : DASH) +
      row('Leistung', d.power != null ? d.power.toFixed(1) + ' W' : DASH) +
      row('Shares ok / abgelehnt', esc((d.sharesAccepted || 0) + ' / ' + (d.sharesRejected || 0))) +
      '</a>';
  }

  function refresh() {
    getJSON('miners.json').then(function (ips) {
      if (!ips || !ips.length) return;
      ensureSection();
      return Promise.all(ips.map(function (ip) {
        return getJSON('minerapi/' + ip + '/info').then(
          function (d) { return { ip: ip, d: d }; },
          function () { return { ip: ip, err: true }; }
        );
      })).then(function (res) {
        res.sort(function (a, b) {
          return String((a.d && a.d.hostname) || a.ip).localeCompare(String((b.d && b.d.hostname) || b.ip));
        });
        var total = 0, active = 0, watts = 0;
        res.forEach(function (r) {
          if (r.d && r.d.hashRate > 0) { active++; total += r.d.hashRate; watts += r.d.power || 0; }
        });
        grid.innerHTML = res.map(function (r) { return card(r.ip, r.d, r.err); }).join('');
        summary.innerHTML = '<b>' + active + '</b> von <b>' + res.length + '</b> aktiv' + DOT +
          'Gesamt <b>' + fmtHash(total) + '</b>' + DOT + '<b>' + watts.toFixed(0) + ' W</b>';
      });
    }).catch(function () { /* extern: 403 -> Abschnitt bleibt unsichtbar */ });
  }

  refresh();
  setInterval(refresh, REFRESH_MS);
})();
