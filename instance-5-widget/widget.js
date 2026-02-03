(function() {
  'use strict';

  var API_BASE = 'https://api.shellout.ai';
  var WIDGET_ID_COUNTER = 0;

  var STYLES = [
    '.shellout-widget{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;border-radius:8px;box-sizing:border-box;line-height:1.4;text-align:left;}',
    '.shellout-widget *{box-sizing:border-box;margin:0;padding:0;}',
    '.shellout-light{background:#FFFFFF;border:1px solid #E5E7EB;color:#111827;}',
    '.shellout-dark{background:#1F2937;border:1px solid #374151;color:#F9FAFB;}',

    /* Full variant */
    '.shellout-full{width:300px;padding:20px;}',
    '.shellout-full .shellout-header{text-align:center;margin-bottom:14px;}',
    '.shellout-full .shellout-score{font-size:42px;font-weight:700;line-height:1;}',
    '.shellout-full .shellout-label{font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;}',
    '.shellout-light .shellout-label{color:#6B7280;}',
    '.shellout-dark .shellout-label{color:#9CA3AF;}',
    '.shellout-full .shellout-metrics{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px;}',
    '.shellout-full .shellout-metric{font-size:13px;padding:6px 0;}',
    '.shellout-full .shellout-metric-value{font-weight:600;}',
    '.shellout-full .shellout-metric-label{font-size:11px;}',
    '.shellout-light .shellout-metric-label{color:#6B7280;}',
    '.shellout-dark .shellout-metric-label{color:#9CA3AF;}',
    '.shellout-full .shellout-flags{margin-top:10px;padding:8px;border-radius:6px;font-size:12px;}',
    '.shellout-light .shellout-flags{background:#FEF2F2;color:#DC2626;}',
    '.shellout-dark .shellout-flags{background:#451a1a;color:#FCA5A5;}',
    '.shellout-full .shellout-no-history{text-align:center;padding:12px 0;font-size:13px;}',
    '.shellout-light .shellout-no-history{color:#6B7280;}',
    '.shellout-dark .shellout-no-history{color:#9CA3AF;}',

    /* Compact variant */
    '.shellout-compact{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;font-size:14px;}',
    '.shellout-compact .shellout-score{font-size:16px;font-weight:700;}',
    '.shellout-compact .shellout-sep{opacity:0.4;}',

    /* Score colors */
    '.shellout-score-good{color:#059669;}',
    '.shellout-score-medium{color:#D97706;}',
    '.shellout-score-low{color:#DC2626;}',
    '.shellout-score-none{opacity:0.4;}',

    /* Footer / branding */
    '.shellout-footer{margin-top:14px;font-size:11px;text-align:center;}',
    '.shellout-light .shellout-footer{color:#9CA3AF;}',
    '.shellout-dark .shellout-footer{color:#6B7280;}',
    '.shellout-footer a{text-decoration:none;}',
    '.shellout-light .shellout-footer a{color:#3B82F6;}',
    '.shellout-dark .shellout-footer a{color:#60A5FA;}',
    '.shellout-compact .shellout-brand{text-decoration:none;font-size:12px;}',
    '.shellout-light .shellout-brand{color:#3B82F6;}',
    '.shellout-dark .shellout-brand{color:#60A5FA;}',

    /* Loading state */
    '.shellout-loading{display:flex;align-items:center;justify-content:center;min-height:80px;gap:8px;padding:20px;}',
    '.shellout-light .shellout-loading{color:#6B7280;}',
    '.shellout-dark .shellout-loading{color:#9CA3AF;}',
    '.shellout-spinner{width:16px;height:16px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;display:inline-block;animation:shellout-spin 0.7s linear infinite;}',
    '@keyframes shellout-spin{to{transform:rotate(360deg);}}',

    /* Error state */
    '.shellout-error{text-align:center;padding:20px;font-size:13px;}',
    '.shellout-light .shellout-error{color:#6B7280;}',
    '.shellout-dark .shellout-error{color:#9CA3AF;}',
    '.shellout-error-icon{font-size:20px;margin-bottom:6px;}',
    '.shellout-retry-btn{margin-top:10px;padding:5px 16px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:500;}',
    '.shellout-light .shellout-retry-btn{background:#F3F4F6;color:#374151;border:1px solid #D1D5DB;}',
    '.shellout-dark .shellout-retry-btn{background:#374151;color:#E5E7EB;border:1px solid #4B5563;}',
    '.shellout-retry-btn:hover{opacity:0.85;}'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById('shellout-styles')) return;
    var style = document.createElement('style');
    style.id = 'shellout-styles';
    style.textContent = STYLES;
    (document.head || document.documentElement).appendChild(style);
  }

  function fetchReputation(address) {
    return fetch(API_BASE + '/v1/reputation/' + encodeURIComponent(address))
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(json) {
        if (!json.success) throw new Error((json.error && json.error.message) || 'Request failed');
        return json.data;
      });
  }

  function scoreClass(score) {
    if (score >= 70) return 'shellout-score-good';
    if (score >= 40) return 'shellout-score-medium';
    return 'shellout-score-low';
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function renderFull(data, theme) {
    var hasHistory = data.metrics && data.metrics.total_transactions > 0;
    var sClass = hasHistory ? scoreClass(data.score) : 'shellout-score-none';
    var scoreDisplay = hasHistory ? esc(String(data.score)) : '&mdash;';

    var metricsHtml = '';
    if (hasHistory) {
      var m = data.metrics;
      metricsHtml = '<div class="shellout-metrics">' +
        '<div class="shellout-metric"><div class="shellout-metric-value">' + esc(String(m.total_transactions)) + '</div><div class="shellout-metric-label">Transactions</div></div>' +
        '<div class="shellout-metric"><div class="shellout-metric-value">' + esc(String(m.unique_counterparties)) + '</div><div class="shellout-metric-label">Counterparties</div></div>' +
        '<div class="shellout-metric"><div class="shellout-metric-value">' + esc(String(m.activity_span_days)) + 'd</div><div class="shellout-metric-label">Active Period</div></div>' +
        '<div class="shellout-metric"><div class="shellout-metric-value">' + esc(String(m.transactions_7d)) + '</div><div class="shellout-metric-label">Last 7 Days</div></div>' +
        '</div>';
    } else {
      metricsHtml = '<div class="shellout-no-history">No transaction history</div>';
    }

    var flagsHtml = '';
    if (data.flags && data.flags.length > 0) {
      flagsHtml = '<div class="shellout-flags">' + data.flags.map(function(f) { return esc(String(f)); }).join(', ') + '</div>';
    }

    return '<div class="shellout-widget shellout-full shellout-' + esc(theme) + '">' +
      '<div class="shellout-header">' +
        '<div class="shellout-score ' + sClass + '">' + scoreDisplay + '</div>' +
        '<div class="shellout-label">Reputation Score</div>' +
      '</div>' +
      metricsHtml +
      flagsHtml +
      '<div class="shellout-footer"><a href="https://shellout.ai" target="_blank" rel="noopener">Powered by Shell Out</a></div>' +
    '</div>';
  }

  function renderCompact(data, theme) {
    var hasHistory = data.metrics && data.metrics.total_transactions > 0;
    var sClass = hasHistory ? scoreClass(data.score) : 'shellout-score-none';
    var scoreDisplay = hasHistory ? esc(String(data.score)) : '&mdash;';

    return '<div class="shellout-widget shellout-compact shellout-' + esc(theme) + '">' +
      '<span class="shellout-score ' + sClass + '">' + scoreDisplay + '</span>' +
      '<span class="shellout-sep">/100</span>' +
      '<a class="shellout-brand" href="https://shellout.ai" target="_blank" rel="noopener">Shell Out</a>' +
    '</div>';
  }

  function renderLoading(theme, size) {
    var cls = size === 'compact' ? 'shellout-compact' : 'shellout-full';
    return '<div class="shellout-widget shellout-loading ' + cls + ' shellout-' + esc(theme) + '">' +
      '<span class="shellout-spinner"></span> Loading\u2026' +
    '</div>';
  }

  function renderError(theme, size, widgetId) {
    var cls = size === 'compact' ? 'shellout-compact' : 'shellout-full';
    return '<div class="shellout-widget shellout-error ' + cls + ' shellout-' + esc(theme) + '">' +
      '<div class="shellout-error-icon">\u26A0</div>' +
      '<div>Could not load reputation</div>' +
      '<button class="shellout-retry-btn" data-shellout-retry="' + widgetId + '">Retry</button>' +
    '</div>';
  }

  function initWidget(el) {
    var address = el.getAttribute('data-shellout');
    if (!address || !address.trim()) return;

    var size = el.getAttribute('data-shellout-size') || 'full';
    var theme = el.getAttribute('data-shellout-theme') || 'light';

    // Assign a unique ID for retry binding
    var widgetId = 'shellout-' + (++WIDGET_ID_COUNTER);
    el.setAttribute('data-shellout-id', widgetId);

    el.innerHTML = renderLoading(theme, size);

    fetchReputation(address)
      .then(function(data) {
        el.innerHTML = size === 'compact'
          ? renderCompact(data, theme)
          : renderFull(data, theme);
      })
      .catch(function() {
        el.innerHTML = renderError(theme, size, widgetId);
        var btn = el.querySelector('[data-shellout-retry]');
        if (btn) {
          btn.addEventListener('click', function() {
            initWidget(el);
          });
        }
      });
  }

  function init() {
    injectStyles();
    var widgets = document.querySelectorAll('[data-shellout]');
    for (var i = 0; i < widgets.length; i++) {
      initWidget(widgets[i]);
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API - only global namespace pollution
  window.ShellOut = {
    init: init,
    initWidget: initWidget
  };
})();
