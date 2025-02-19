function saveSession(fakeLink, sessionData) {
  const sessionPath = path.join(__dirname, "sessions", `${fakeLink}.json`);
  fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
  console.log(`Session saved to ${sessionPath}`);
}

module.exports = saveSession;
