import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Accepts results, participants, and filename
export function downloadResultsAsPDF({ results, participants, filename = "results.pdf" }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  let y = 40;
  doc.setFontSize(20);
  doc.setTextColor("#357ae8");
  doc.text("Stable Roommates Results", 40, y);
  y += 30;

  // Results pairs as list with separator
  if (results && results.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor("#222");
    doc.text("Pairings", 40, y);
    y += 20;
    results.forEach(pair => {
      doc.text(`${pair[0]}   —   ${pair[1]}`, 60, y);
      y += 24;
    });
    y += 10;
  }

  // Preferences table
  if (participants && participants.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor("#222");
    doc.text("Preferences Overview", 40, y);
    y += 10;
    // Build head row
    const prefCount = participants[0].preferences.length;
    const head = ["Name", ...Array.from({ length: prefCount }, (_, i) => `${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}`)];
    // Build body and cellStyles for highlighting
  // Table body: [name, ...preferences]
  const body = participants.map(p => [p.name, ...p.preferences]);
    // Build a match map for quick lookup
    let matchMap = {};
    if (results && results.length > 0) {
      results.forEach(pair => {
        matchMap[pair[0]] = pair[1];
        matchMap[pair[1]] = pair[0];
      });
    }
    participants.forEach((p, rowIdx) => {
      const match = matchMap[p.name];
      // Debug log removed
    });
    autoTable(doc, {
      startY: y + 10,
      head: [head],
      body,
      theme: "grid",
      headStyles: { fillColor: [53, 122, 232] },
      styles: { fontSize: 12, cellPadding: 6 },
      margin: { left: 40, right: 40 }
    });
  }

  doc.save(filename);
}
