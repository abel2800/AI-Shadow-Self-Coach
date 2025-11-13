/**
 * Export Service
 * Generates PDF and text exports of journal entries
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Export session as text
 */
async function exportAsText(session, messages) {
  let text = `Shadow Coach - Session Export\n`;
  text += `================================\n\n`;
  text += `Session Type: ${session.session_type}\n`;
  text += `Date: ${new Date(session.started_at).toLocaleDateString()}\n`;
  text += `Duration: ${session.duration_minutes} minutes\n\n`;
  
  if (session.summary?.text) {
    text += `Summary:\n${session.summary.text}\n\n`;
  }
  
  if (messages && messages.length > 0) {
    text += `Full Transcript:\n`;
    text += `----------------\n\n`;
    
    messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'You' : 'Ari';
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();
      text += `[${timestamp}] ${role}:\n${msg.text}\n\n`;
    });
  }
  
  if (session.summary?.insights && session.summary.insights.length > 0) {
    text += `Insights:\n`;
    text += `---------\n`;
    session.summary.insights.forEach((insight, index) => {
      text += `${index + 1}. ${insight}\n`;
    });
    text += `\n`;
  }
  
  if (session.summary?.experiment) {
    text += `This Week's Experiment:\n`;
    text += `----------------------\n`;
    text += `${session.summary.experiment}\n\n`;
  }
  
  if (session.summary?.tags && session.summary.tags.length > 0) {
    text += `Tags: ${session.summary.tags.join(', ')}\n`;
  }
  
  return text;
}

/**
 * Export session as PDF (simplified - in production use PDF library)
 */
async function exportAsPDF(session, messages) {
  // For MVP, return text formatted for PDF
  // In production, use library like pdfkit or puppeteer
  const text = await exportAsText(session, messages);
  
  // TODO: Convert to actual PDF using pdfkit or similar
  // For now, return text that can be converted
  return {
    content: text,
    format: 'text', // Will be converted to PDF
    filename: `session_${session.id}_${new Date().toISOString().split('T')[0]}.txt`
  };
}

/**
 * Export multiple sessions
 */
async function exportMultipleSessions(sessions, format = 'text') {
  let exportContent = `Shadow Coach - Journal Export\n`;
  exportContent += `==============================\n\n`;
  exportContent += `Export Date: ${new Date().toLocaleDateString()}\n`;
  exportContent += `Total Sessions: ${sessions.length}\n\n`;
  exportContent += `================================\n\n`;
  
  for (const session of sessions) {
    const sessionText = await exportAsText(session, session.messages || []);
    exportContent += sessionText;
    exportContent += `\n${'='.repeat(50)}\n\n`;
  }
  
  return {
    content: exportContent,
    format: format,
    filename: `journal_export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'txt'}`
  };
}

module.exports = {
  exportAsText,
  exportAsPDF,
  exportMultipleSessions
};

