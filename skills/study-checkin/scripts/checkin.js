#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// --- Config ---
const DATA_PATH = process.env.CHECKIN_DATA_PATH
  || path.join('D:', 'code', 'openclaw-home', 'workspace', 'data', 'study-checkin.json');

// --- Timezone helper: Asia/Shanghai (UTC+8) ---
function getTodayCST() {
  const now = new Date();
  // Get date string in Asia/Shanghai timezone
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;
  return `${y}-${m}-${d}`;
}

function getCurrentMonthCST() {
  const today = getTodayCST();
  return today.slice(0, 7); // YYYY-MM
}

// --- Data IO ---
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.checkins)) {
      data.checkins = [];
    }
    return data;
  } catch {
    return {
      checkins: [],
      created_at: new Date().toISOString(),
    };
  }
}

function saveData(data) {
  const dir = path.dirname(DATA_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Streak calculation ---
function calculateCurrentStreak(checkins, referenceDate) {
  if (checkins.length === 0) return 0;

  // Sort descending
  const sorted = [...new Set(checkins)].sort().reverse();

  // Reference date must be today or we check from today
  const ref = referenceDate || getTodayCST();

  // The streak must include today or yesterday to be "current"
  const yesterday = dateAdd(ref, -1);

  if (sorted[0] !== ref && sorted[0] !== yesterday) {
    return 0;
  }

  let streak = 0;
  let expected = sorted[0]; // start from the most recent checkin

  for (const d of sorted) {
    if (d === expected) {
      streak++;
      expected = dateAdd(expected, -1);
    } else if (d < expected) {
      break;
    }
  }
  return streak;
}

function calculateMaxStreak(checkins) {
  if (checkins.length === 0) return 0;
  const sorted = [...new Set(checkins)].sort();
  let max = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (dateAdd(sorted[i - 1], 1) === sorted[i]) {
      cur++;
      if (cur > max) max = cur;
    } else {
      cur = 1;
    }
  }
  return max;
}

function dateAdd(dateStr, days) {
  // Pure date arithmetic without timezone issues
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const ny = dt.getUTCFullYear();
  const nm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(dt.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

// --- Commands ---
function doCheckin() {
  const data = loadData();
  const today = getTodayCST();

  if (data.checkins.includes(today)) {
    const streak = calculateCurrentStreak(data.checkins, today);
    console.log(JSON.stringify({
      success: true,
      already_checked: true,
      message: '今天已经打过卡啦',
      streak,
      date: today,
    }));
    return;
  }

  data.checkins.push(today);
  // Keep sorted descending for convenience
  data.checkins = [...new Set(data.checkins)].sort().reverse();
  saveData(data);

  const streak = calculateCurrentStreak(data.checkins, today);
  console.log(JSON.stringify({
    success: true,
    already_checked: false,
    message: `打卡成功！连续打卡 ${streak} 天`,
    streak,
    date: today,
  }));
}

function doStats(monthArg) {
  const data = loadData();
  const month = monthArg || getCurrentMonthCST();

  // Validate month format
  if (!/^\d{4}-\d{2}$/.test(month)) {
    console.log(JSON.stringify({ error: '月份格式错误，请使用 YYYY-MM 格式' }));
    process.exit(1);
  }

  const [year, mon] = month.split('-').map(Number);
  const totalDays = new Date(Date.UTC(year, mon, 0)).getUTCDate();

  // Filter checkins for this month
  const monthCheckins = new Set(
    data.checkins.filter(d => d.startsWith(month + '-'))
  );

  // Build calendar
  // Find what day of week the 1st is (0=Sun, 1=Mon, ..., 6=Sat)
  const firstDayDow = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();
  // Convert to Monday-based (0=Mon, 1=Tue, ..., 6=Sun)
  const mondayBased = (firstDayDow + 6) % 7;

  const calendar = [];
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${month}-${String(d).padStart(2, '0')}`;
    calendar.push({
      day: d,
      date: dateStr,
      checked: monthCheckins.has(dateStr),
    });
  }

  const checkedDays = monthCheckins.size;
  const today = getTodayCST();

  // Rate: if current month, use days elapsed so far; otherwise use total days
  const isCurrentMonth = month === getCurrentMonthCST();
  const todayDay = isCurrentMonth ? parseInt(today.split('-')[2], 10) : totalDays;
  const rate = todayDay > 0 ? Math.round((checkedDays / todayDay) * 100) : 0;

  const allCheckinsArr = [...new Set(data.checkins)].sort().reverse();
  const currentStreak = calculateCurrentStreak(allCheckinsArr, today);
  const maxStreak = calculateMaxStreak([...new Set(data.checkins)]);

  console.log(JSON.stringify({
    month,
    calendar,
    total_days: totalDays,
    checked_days: checkedDays,
    rate: `${rate}%`,
    current_streak: currentStreak,
    max_streak: maxStreak,
    first_day_offset: mondayBased, // 0=Mon start, how many blank cells before day 1
  }));
}

// --- Main ---
const [,, command, ...args] = process.argv;

switch (command) {
  case 'checkin':
    doCheckin();
    break;
  case 'stats':
    doStats(args[0]);
    break;
  default:
    console.log(JSON.stringify({ error: `未知命令: ${command}。可用命令: checkin, stats` }));
    process.exit(1);
}
