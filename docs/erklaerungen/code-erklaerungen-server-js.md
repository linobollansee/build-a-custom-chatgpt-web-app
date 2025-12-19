# Code-Erklärungen: server.js

Diese Datei enthält eine detaillierte Erklärung jeder Zeile des Backend-Servers (`backend/server.js`).

## Zeile 1: Environment-Variablen laden

```javascript
require("dotenv").config();
```

**Erklärung:** Lädt die `dotenv`-Bibliothek und führt die `config()`-Funktion aus. Dies liest die `.env`-Datei und lädt alle dort definierten Umgebungsvariablen (wie den OpenAI API-Schlüssel) in `process.env`.

---

## Zeile 2: Express importieren

```javascript
const express = require("express");
```

**Erklärung:** Importiert das Express-Framework. Express ist ein minimalistisches Web-Framework für Node.js, das die Erstellung von Webservern und APIs vereinfacht.

---

## Zeile 3: CORS importieren

```javascript
const cors = require("cors");
```

**Erklärung:** Importiert die CORS-Middleware (Cross-Origin Resource Sharing). CORS ermöglicht es dem Frontend (auf Port 5173), mit dem Backend (auf Port 3000) zu kommunizieren, obwohl sie auf unterschiedlichen Ports laufen.

---

## Zeile 4: OpenAI-Bibliothek importieren

```javascript
const OpenAI = require("openai");
```

**Erklärung:** Importiert die offizielle OpenAI-JavaScript-Bibliothek. Diese ermöglicht die Kommunikation mit der ChatGPT API.

---

## Zeile 5: Datenbankfunktionen importieren

```javascript
const { saveMessage, getAllMessages } = require("./database");
```

**Erklärung:** Importiert zwei Funktionen aus der `database.js`-Datei:

- `saveMessage`: Speichert eine Nachricht in der SQLite-Datenbank
- `getAllMessages`: Ruft alle Nachrichten aus der Datenbank ab

---

## Zeile 7: Express-App erstellen

```javascript
const app = express();
```

**Erklärung:** Erstellt eine neue Express-Anwendungsinstanz. Diese `app`-Variable repräsentiert den gesamten Server und wird verwendet, um Routen, Middleware und Einstellungen zu definieren.

---

## Zeile 8: Port-Konfiguration

```javascript
const PORT = process.env.PORT || 3000;
```

**Erklärung:** Definiert den Port, auf dem der Server läuft. Versucht zuerst, den Port aus der Umgebungsvariable `process.env.PORT` zu lesen. Falls diese nicht existiert, wird der Standardport 3000 verwendet.

---

## Zeile 10-12: Middleware konfigurieren

### Zeile 11: CORS aktivieren

```javascript
app.use(cors());
```

**Erklärung:** Aktiviert CORS für alle Routen. Dies erlaubt Anfragen von jeder Origin (Frontend-Domain). In Produktion sollte dies auf spezifische Domains beschränkt werden.

### Zeile 12: JSON-Parser aktivieren

```javascript
app.use(express.json());
```

**Erklärung:** Aktiviert die eingebaute JSON-Middleware von Express. Diese parst eingehende Anfragen mit JSON-Payload und macht die Daten über `req.body` verfügbar.

---

## Zeile 14-17: OpenAI-Client initialisieren

```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

**Erklärung:** Erstellt eine neue Instanz des OpenAI-Clients. Der API-Schlüssel wird aus der Umgebungsvariable `OPENAI_API_KEY` gelesen (die aus der `.env`-Datei stammt). Dieser Client wird für alle API-Aufrufe an ChatGPT verwendet.

---

## Zeile 19-65: POST /api/chat Endpoint

### Zeile 20: Route definieren

```javascript
app.post("/api/chat", async (req, res) => {
```

**Erklärung:** Definiert eine POST-Route unter `/api/chat`. Die Callback-Funktion ist `async`, da sie auf die OpenAI API warten muss. Parameter:

- `req` (request): Enthält Daten der eingehenden Anfrage
- `res` (response): Wird verwendet, um die Antwort zu senden

### Zeile 21: Try-Block beginnen

```javascript
  try {
```

**Erklärung:** Beginnt einen `try-catch`-Block für Fehlerbehandlung. Alle Fehler innerhalb dieses Blocks werden vom `catch`-Block abgefangen.

### Zeile 22: Nachricht aus Request extrahieren

```javascript
const { message } = req.body;
```

**Erklärung:** Destrukturiert die `message`-Eigenschaft aus `req.body`. Dies ist die Nachricht, die der Benutzer gesendet hat.

### Zeile 24-26: Validierung

```javascript
if (!message) {
  return res.status(400).json({ error: "Message is required" });
}
```

**Erklärung:** Validiert, ob eine Nachricht vorhanden ist. Wenn nicht:

- Setzt HTTP-Status 400 (Bad Request)
- Sendet ein JSON-Objekt mit Fehlermeldung
- `return` beendet die Funktion frühzeitig

### Zeile 28-29: Benutzernachricht speichern

```javascript
// Save user message to database
saveMessage("user", message);
```

**Erklärung:** Speichert die Nachricht des Benutzers in der Datenbank. Parameter:

- `"user"`: Die Rolle des Absenders
- `message`: Der Inhalt der Nachricht

### Zeile 31-32: Gesprächsverlauf abrufen

```javascript
// Get conversation history from database
const history = getAllMessages();
```

**Erklärung:** Ruft alle bisherigen Nachrichten aus der Datenbank ab. Dies ist wichtig, damit ChatGPT den Kontext der gesamten Konversation hat.

### Zeile 34-37: Nachrichten für OpenAI formatieren

```javascript
// Format messages for OpenAI API
const messages = history.map((msg) => ({
  role: msg.role,
  content: msg.content,
}));
```

**Erklärung:** Transformiert die Datenbank-Nachrichten in das von OpenAI erwartete Format. Die `map()`-Funktion erstellt für jede Nachricht ein neues Objekt mit nur den Feldern `role` und `content` (OpenAI benötigt kein `id` oder `timestamp`).

### Zeile 39-42: ChatGPT API aufrufen

```javascript
// Call ChatGPT API
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: messages,
});
```

**Erklärung:** Sendet eine Anfrage an die OpenAI API:

- `await`: Wartet auf die Antwort der API
- `model: "gpt-3.5-turbo"`: Verwendet das GPT-3.5 Turbo Modell
- `messages`: Der gesamte Gesprächsverlauf wird übergeben
- `completion`: Enthält die Antwort von OpenAI

### Zeile 44: Antwort extrahieren

```javascript
const assistantResponse = completion.choices[0].message.content;
```

**Erklärung:** Extrahiert den Text der Antwort aus dem OpenAI-Response-Objekt:

- `choices[0]`: OpenAI kann mehrere Antworten generieren; wir nehmen die erste
- `message.content`: Der eigentliche Textinhalt der Antwort

### Zeile 46-47: Assistenten-Antwort speichern

```javascript
// Save assistant response to database
saveMessage("assistant", assistantResponse);
```

**Erklärung:** Speichert die Antwort von ChatGPT in der Datenbank mit der Rolle `"assistant"`.

### Zeile 49-52: Erfolgreiche Antwort senden

```javascript
// Return response
res.json({
  message: assistantResponse,
  timestamp: new Date().toISOString(),
});
```

**Erklärung:** Sendet die Antwort als JSON an das Frontend:

- `message`: Die Antwort von ChatGPT
- `timestamp`: Aktueller Zeitstempel im ISO-Format
- `res.json()`: Konvertiert das Objekt automatisch zu JSON und sendet es

### Zeile 53-59: Fehlerbehandlung

```javascript
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
```

**Erklärung:** Fängt alle Fehler ab, die im `try`-Block auftreten:

- `console.error()`: Protokolliert den Fehler in der Serverkonsole
- `res.status(500)`: Setzt HTTP-Status 500 (Internal Server Error)
- Sendet ein JSON-Objekt mit Fehlermeldung und Details

---

## Zeile 67-80: GET /api/messages Endpoint

### Zeile 68: Route definieren

```javascript
app.get("/api/messages", async (req, res) => {
```

**Erklärung:** Definiert eine GET-Route unter `/api/messages`. Diese Route wird verwendet, um die gesamte Gesprächshistorie abzurufen.

### Zeile 69-71: Nachrichten abrufen

```javascript
  try {
    const messages = getAllMessages();
```

**Erklärung:** Ruft alle Nachrichten aus der Datenbank ab.

### Zeile 72-75: Erfolgreiche Antwort

```javascript
res.json({
  messages: messages,
  count: messages.length,
});
```

**Erklärung:** Sendet die Nachrichten als JSON zurück:

- `messages`: Array aller Nachrichten
- `count`: Anzahl der Nachrichten (für einfache Übersicht)

### Zeile 76-81: Fehlerbehandlung

```javascript
  } catch (error) {
    console.error("Error in /api/messages:", error);
    res.status(500).json({
      error: "Failed to fetch messages",
      details: error.message,
    });
  }
```

**Erklärung:** Fängt Datenbankfehler ab und sendet eine Fehlermeldung.

---

## Zeile 83-86: GET /api/health Endpoint

```javascript
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
```

**Erklärung:** Health-Check-Endpoint für Monitoring:

- Gibt immer `status: "OK"` zurück
- Enthält aktuellen Zeitstempel
- Kann verwendet werden, um zu prüfen, ob der Server läuft

---

## Zeile 88-93: Server starten

```javascript
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`  POST http://localhost:${PORT}/api/chat`);
  console.log(`  GET  http://localhost:${PORT}/api/messages`);
});
```

**Erklärung:** Startet den Server:

- `app.listen(PORT, callback)`: Startet den Server auf dem konfigurierten Port
- Die Callback-Funktion wird ausgeführt, sobald der Server bereit ist
- `console.log()`: Gibt hilfreiche Informationen in der Konsole aus
  - Server-URL
  - Liste aller verfügbaren API-Endpoints

---

## Zusammenfassung des Datenflusses

1. **Client sendet Nachricht** → POST `/api/chat` mit JSON `{ message: "..." }`
2. **Server speichert Nachricht** → Datenbank (Rolle: "user")
3. **Server ruft Historie ab** → Alle bisherigen Nachrichten aus Datenbank
4. **Server fragt ChatGPT** → Sendet kompletten Gesprächsverlauf an OpenAI API
5. **ChatGPT antwortet** → Server erhält Antwort
6. **Server speichert Antwort** → Datenbank (Rolle: "assistant")
7. **Server antwortet Client** → Sendet ChatGPT-Antwort zurück

## Verwendete Technologien

- **Express**: Web-Framework für Node.js
- **dotenv**: Umgebungsvariablen-Management
- **CORS**: Cross-Origin Resource Sharing
- **OpenAI**: ChatGPT API-Integration
- **SQLite (better-sqlite3)**: Datenbankoperationen über `database.js`

## Sicherheitshinweise

⚠️ **Produktionsverbesserungen:**

1. **CORS einschränken**: Nur spezifische Domains erlauben
2. **Rate Limiting**: Anzahl der Anfragen pro Benutzer begrenzen
3. **Input-Validierung**: Nachrichtenlänge und Inhalt validieren
4. **Authentifizierung**: Benutzer-Login implementieren
5. **Fehlerbehandlung**: Sensible Fehlerdetails nicht an Client senden
6. **API-Key-Schutz**: Niemals API-Keys in Code committen
