const XLSX = require('xlsx');
const path = require('path');

// Load overall.xlsx to inspect hospital column values
const overallPath = path.join(__dirname, '..', 'docs', 'overall.xlsx');
const workbook = XLSX.readFile(overallPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// Check first 10 rows for hospital values
console.log('=== First 10 rows with hospital field ===');
jsonData.slice(0, 10).forEach((row, index) => {
  console.log(`Row ${index + 1}:`);
  console.log(`  Username: ${row['1열']}`);
  console.log(`  Hospital: "${row['병원']}" (type: ${typeof row['병원']})`);
});

// Count hospital values
const hospitalCounts = {};
jsonData.forEach(row => {
  const hospital = row['병원'] || 'empty';
  hospitalCounts[hospital] = (hospitalCounts[hospital] || 0) + 1;
});

console.log('\n=== Hospital value distribution ===');
Object.entries(hospitalCounts).forEach(([hospital, count]) => {
  console.log(`  "${hospital}": ${count} rows`);
});

// Check if there are other hospital-like columns
const headers = Object.keys(jsonData[0]);
console.log('\n=== All column headers ===');
headers.forEach(header => {
  console.log(`  - ${header}`);
});