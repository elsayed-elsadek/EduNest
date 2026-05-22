import type { StatCardData, ChartPoint, TopMentor, ActivityEvent } from '../types/admin-role-types/admin-dash.types';

interface DashboardExportData {
  stats:     StatCardData[];
  chartData: ChartPoint[];
  mentors:   TopMentor[];
  events:    ActivityEvent[];
}

const now = () =>
  new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const buildHtml = (data: DashboardExportData): string => {
  const { stats, chartData, mentors, events } = data;

  const statsRows = stats
    .map(s => `
      <div class="stat-card">
        <p class="stat-label">${s.label}</p>
        <p class="stat-value">${s.value}</p>
      </div>`)
    .join('');

  const chartRows = chartData
    .map(c => `<tr><td>${c.month}</td><td>${c.sessions}</td></tr>`)
    .join('');

  const mentorRows = mentors
    .map(m => `
      <tr>
        <td>${m.rank}</td>
        <td>${m.name}</td>
        <td>${m.email}</td>
        <td>${m.students}</td>
        <td>${m.revenue}</td>
      </tr>`)
    .join('');

  const eventRows = events
    .map(e => `
      <tr class="${e.isAlert ? 'alert-row' : ''}">
        <td>${e.title}</td>
        <td>${e.description}</td>
        <td>${e.timeLabel}</td>
      </tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>EduNest Dashboard Summary — ${new Date().toLocaleDateString('en-US')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #f5f6fa;
      color: #1a1a2e;
      padding: 40px;
    }

    .cover {
      background: linear-gradient(135deg, #0f5e8b 0%, #0a3d5c 100%);
      color: white;
      border-radius: 16px;
      padding: 36px 40px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .cover h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .cover p  { font-size: 13px; opacity: 0.65; margin-top: 4px; }
    .cover .meta { text-align: right; font-size: 12px; opacity: 0.7; }
    .cover .meta strong { display: block; font-size: 14px; opacity: 1; margin-bottom: 2px; }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #0f5e8b;
      border-left: 3px solid #0f5e8b;
      padding-left: 10px;
      margin-bottom: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 18px 20px;
      border: 1px solid #e8eaf0;
    }
    .stat-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9ca3af;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 800;
      color: #111827;
    }

    .table-wrap {
      background: white;
      border-radius: 12px;
      border: 1px solid #e8eaf0;
      overflow: hidden;
      margin-bottom: 32px;
    }
    .table-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #f9fafb;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6b7280;
      padding: 10px 16px;
      border-bottom: 1px solid #f0f0f5;
    }
    td {
      padding: 11px 16px;
      font-size: 13px;
      color: #374151;
      border-bottom: 1px solid #f9fafb;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafbff; }
    .alert-row td { background: #fff5f5; color: #991b1b; }
    td:first-child { font-weight: 700; }

    .footer {
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      margin-top: 8px;
      padding-top: 20px;
      border-top: 1px solid #e8eaf0;
    }

    @media print {
      body { background: white; padding: 20px; }
      .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
      .table-wrap { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <div>
      <h1>EduNest Dashboard Summary</h1>
      <p>Monitoring Report — Automatically Generated</p>
    </div>
    <div class="meta">
      <strong>Generated</strong>
      ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
    </div>
  </div>

  <div class="no-print" style="text-align:right; margin-bottom:24px;">
    <button onclick="window.print()"
      style="background:#0f5e8b;color:white;border:none;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;">
      🖨 Print / Save as PDF
    </button>
  </div>

  <p class="section-title">Platform Overview</p>
  <div class="stats-grid">${statsRows}</div>

  ${chartData.length > 0 ? `
  <p class="section-title">Session Activity</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Month</th>
          <th>Total Sessions</th>
        </tr>
      </thead>
      <tbody>${chartRows}</tbody>
    </table>
  </div>` : ''}

  ${mentors.length > 0 ? `
  <p class="section-title">Top Mentors</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Students</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>${mentorRows}</tbody>
    </table>
  </div>` : ''}

  ${events.length > 0 ? `
  <p class="section-title">Recent Activity</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Details</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>${eventRows}</tbody>
    </table>
  </div>` : ''}

  <div class="footer">
    EduNest Admin Portal · ${now()} · Confidential
  </div>
</body>
</html>`;
};

export const exportDashboardSummary = (data: DashboardExportData): void => {
  const html = buildHtml(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const win = window.open(url, '_blank');

  if (win) {
    win.addEventListener('load', () => URL.revokeObjectURL(url));
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = `edunest-summary-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
