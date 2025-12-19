# Code-Erklärungen: database.js

Diese Datei enthält eine detaillierte Erklärung des Datenbank-Moduls (`backend/database.js`).

**Hinweis:** Die Datenbank implementiert **zwei Tabellen**: `sessions` und `messages` für Multi-Session-Unterstützung.

## Datenbank-Initialisierung

### better-sqlite3 und path importieren

```javascript
const Database = require("better-sqlite3");
const path = require("path");
```

**Erklärung:**

- `better-sqlite3`: Schnelle, synchrone SQLite3-Implementierung für Node.js
- `path`: Node.js-Modul für plattformunabhängige Dateipfade

### Datenbank-Verbindung erstellen

```javascript
const db = new Database(path.join(__dirname, "chat.db"));
```

**Erklärung:**

- Erstellt/öffnet die Datenbankdatei `chat.db` im backend-Verzeichnis
- Die Datenbank wird automatisch erstellt wenn sie nicht existiert

## Datenbank-Schema

### Sessions-Tabelle

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

**Erklärung:**

- `id`: Eindeutige Session-ID (z.B. "session_1234567890_abc123")
- `title`: Titel der Chat-Sitzung (z.B. "New Chat")
- `created_at`: Erstellungszeitpunkt
- `updated_at`: Zeitpunkt der letzten Aktivität
- Ermöglicht mehrere unabhängige Chat-Sitzungen

### Messages-Tabelle

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  )
`);
```

**Erklärung:**

- `id`: Auto-inkrementierende Nachrichten-ID
- `session_id`: Verknüpfung zur Sessions-Tabelle (FOREIGN KEY)
- `role`: "user" oder "assistant"
- `content`: Nachrichtentext
- `timestamp`: Zeitpunkt der Nachricht
- `ON DELETE CASCADE`: Löscht automatisch alle Nachrichten wenn Session gelöscht wird

## Session-Management-Funktionen

### createSession(title)

Erstellt eine neue Chat-Sitzung mit eindeutiger ID und gegebenem Titel.

```javascript
function createSession(title = "New Chat") {
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const stmt = db.prepare("INSERT INTO sessions (id, title) VALUES (?, ?)");
  stmt.run(id, title);
  return { id, title, created_at: new Date().toISOString() };
}
```

### getAllSessions()

Gibt alle Sessions sortiert nach `updated_at` zurück (neueste zuerst).

### getSession(sessionId)

Gibt eine bestimmte Session anhand ihrer ID zurück.

### updateSessionTimestamp(sessionId)

Aktualisiert `updated_at` wenn eine neue Nachricht zur Session hinzugefügt wird.

### deleteSession(sessionId)

Löscht eine Session und automatisch alle zugehörigen Nachrichten (CASCADE).

## Nachrichten-Funktionen

### saveMessage(sessionId, role, content)

Speichert eine Nachricht in der Datenbank und aktualisiert den Session-Timestamp.

**Parameter:**

- `sessionId`: ID der Chat-Sitzung
- `role`: "user" oder "assistant"
- `content`: Nachrichteninhalt

### getSessionMessages(sessionId)

Gibt alle Nachrichten einer bestimmten Session sortiert nach Timestamp zurück.

### getAllMessages()

Gibt alle Nachrichten über alle Sessions hinweg zurück (für Rückwärtskompatibilität).

### clearMessages()

Löscht alle Nachrichten aus der Datenbank (nützlich für Tests).

## Exported Functions

Das Modul exportiert:

```javascript
module.exports = {
  db,
  createSession,
  getAllSessions,
  getSession,
  updateSessionTimestamp,
  deleteSession,
  saveMessage,
  getSessionMessages,
  getAllMessages,
  clearMessages,
};
```

Diese Funktionen werden vom Server (server.js) verwendet um Sessions und Nachrichten zu verwalten.

## Datenbankstruktur-Beispiel

```
sessions:
┌─────────────────────────┬────────────┬───────────────────────┬───────────────────────┐
│ id                      │ title      │ created_at            │ updated_at            │
├─────────────────────────┼────────────┼───────────────────────┼───────────────────────┤
│ session_1702..._abc123  │ New Chat   │ 2024-12-19 10:00:00  │ 2024-12-19 10:05:23  │
│ session_1702..._xyz789  │ Code Help  │ 2024-12-19 09:30:00  │ 2024-12-19 09:45:00  │
└─────────────────────────┴────────────┴───────────────────────┴───────────────────────┘

messages:
┌────┬─────────────────────────┬───────────┬──────────────┬───────────────────────┐
│ id │ session_id              │ role      │ content      │ timestamp             │
├────┼─────────────────────────┼───────────┼──────────────┼───────────────────────┤
│ 1  │ session_1702..._abc123  │ user      │ Hello        │ 2024-12-19 10:00:15  │
│ 2  │ session_1702..._abc123  │ assistant │ Hi there!    │ 2024-12-19 10:00:18  │
│ 3  │ session_1702..._xyz789  │ user      │ Help me code │ 2024-12-19 09:30:30  │
└────┴─────────────────────────┴───────────┴──────────────┴───────────────────────┘
```

- `role`: Spaltenname
- `TEXT`: Datentyp (String/Text)
- `NOT NULL`: Darf nicht leer sein (Constraint)
- Speichert entweder `"user"` oder `"assistant"`

### Zeile 12: content-Spalte

```javascript
    content TEXT NOT NULL,
```

**Erklärung:** Definiert die Spalte für den Nachrichteninhalt:

- `content`: Spaltenname
- `TEXT`: Datentyp für den Nachrichtentext
- `NOT NULL`: Muss immer einen Wert haben
- Speichert die eigentliche Nachricht (Benutzer-Frage oder ChatGPT-Antwort)

### Zeile 13: timestamp-Spalte

```javascript
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Erklärung:** Definiert die Spalte für den Zeitstempel:

- `timestamp`: Spaltenname
- `DATETIME`: Datentyp für Datum und Uhrzeit
- `DEFAULT CURRENT_TIMESTAMP`: Standardwert
  - Wird automatisch auf den aktuellen Zeitpunkt gesetzt
  - Wenn kein Wert angegeben wird, fügt SQLite die aktuelle Zeit ein

**Format:** `2025-12-19 14:30:45`

---

## Zeile 17-21: saveMessage-Funktion

### Zeile 18: Funktion definieren

```javascript
function saveMessage(role, content) {
```

**Erklärung:** Definiert eine Funktion zum Speichern einer Nachricht in der Datenbank. Parameter:

- `role`: "user" oder "assistant"
- `content`: Der Text der Nachricht

### Zeile 19: Prepared Statement erstellen

```javascript
const stmt = db.prepare("INSERT INTO messages (role, content) VALUES (?, ?)");
```

**Erklärung:** Erstellt ein vorbereitetes SQL-Statement (Prepared Statement):

- `db.prepare()`: Kompiliert das SQL-Statement vorab
- `INSERT INTO messages`: Fügt neue Zeile in messages-Tabelle ein
- `(role, content)`: Die Spalten, die befüllt werden
- `VALUES (?, ?)`: Platzhalter für Werte
  - `?` sind Platzhalter, die später durch tatsächliche Werte ersetzt werden
  - Schützt vor SQL-Injection-Angriffen
  - Bessere Performance bei mehrfachen Ausführungen

**Warum Prepared Statements?**
✅ **Sicherheit:** Schützt vor SQL-Injection
✅ **Performance:** Statement wird nur einmal kompiliert
✅ **Lesbarkeit:** Klare Trennung von SQL und Daten

### Zeile 20: Statement ausführen

```javascript
return stmt.run(role, content);
```

**Erklärung:** Führt das Prepared Statement aus:

- `stmt.run()`: Führt das INSERT-Statement aus
- `role, content`: Diese Werte ersetzen die `?`-Platzhalter
- Return-Wert: Ein Objekt mit Informationen über die Ausführung
  - `changes`: Anzahl der betroffenen Zeilen (normalerweise 1)
  - `lastInsertRowid`: Die ID der neu eingefügten Zeile

**Beispiel-Aufruf:**

```javascript
saveMessage("user", "Hallo ChatGPT!");
// Speichert: { id: 1, role: "user", content: "Hallo ChatGPT!", timestamp: "2025-12-19 14:30:45" }
```

---

## Zeile 23-27: getAllMessages-Funktion

### Zeile 24: Funktion definieren

```javascript
function getAllMessages() {
```

**Erklärung:** Definiert eine Funktion zum Abrufen aller Nachrichten aus der Datenbank. Keine Parameter erforderlich.

### Zeile 25: Prepared Statement für SELECT

```javascript
const stmt = db.prepare("SELECT * FROM messages ORDER BY timestamp ASC");
```

**Erklärung:** Erstellt ein SELECT-Statement:

- `SELECT *`: Wählt alle Spalten aus
- `FROM messages`: Aus der messages-Tabelle
- `ORDER BY timestamp ASC`: Sortiert nach Zeitstempel
  - `ASC`: Aufsteigend (älteste zuerst)
  - Wichtig für chronologischen Gesprächsverlauf

**SQL-Ergebnis:** Gibt alle Nachrichten in zeitlicher Reihenfolge zurück.

### Zeile 26: Alle Zeilen abrufen

```javascript
return stmt.all();
```

**Erklärung:** Führt das SELECT-Statement aus:

- `stmt.all()`: Gibt alle Ergebniszeilen als Array zurück
- Jede Zeile ist ein JavaScript-Objekt
- Leeres Array `[]`, wenn keine Nachrichten vorhanden

**Beispiel-Rückgabewert:**

```javascript
[
  { id: 1, role: "user", content: "Hallo!", timestamp: "2025-12-19 14:30:45" },
  {
    id: 2,
    role: "assistant",
    content: "Hallo! Wie kann ich helfen?",
    timestamp: "2025-12-19 14:30:47",
  },
  {
    id: 3,
    role: "user",
    content: "Was ist React?",
    timestamp: "2025-12-19 14:31:00",
  },
];
```

---

## Zeile 29-33: clearMessages-Funktion

### Zeile 30: Funktion definieren

```javascript
function clearMessages() {
```

**Erklärung:** Definiert eine Funktion zum Löschen aller Nachrichten. Nützlich für Tests oder zum Zurücksetzen des Chats.

### Zeile 31: DELETE Statement

```javascript
const stmt = db.prepare("DELETE FROM messages");
```

**Erklärung:** Erstellt ein DELETE-Statement:

- `DELETE FROM messages`: Löscht alle Zeilen aus der Tabelle
- Keine `WHERE`-Klausel → alle Zeilen werden gelöscht
- Die Tabellen-Struktur bleibt erhalten

**⚠️ Vorsicht:** Diese Funktion löscht den gesamten Chat-Verlauf unwiderruflich!

### Zeile 32: Statement ausführen

```javascript
return stmt.run();
```

**Erklärung:** Führt das DELETE-Statement aus:

- `stmt.run()`: Führt den Löschvorgang aus
- Return-Wert enthält `changes`: Anzahl der gelöschten Zeilen

---

## Zeile 35-40: Module exportieren

```javascript
module.exports = {
  db,
  saveMessage,
  getAllMessages,
  clearMessages,
};
```

**Erklärung:** Exportiert Funktionen und die Datenbankinstanz als Modul:

- `module.exports`: CommonJS-Export-Syntax
- `db`: Datenbankinstanz (für erweiterte Operationen)
- `saveMessage`: Funktion zum Speichern
- `getAllMessages`: Funktion zum Abrufen
- `clearMessages`: Funktion zum Löschen

**Verwendung in anderen Dateien:**

```javascript
const { saveMessage, getAllMessages } = require("./database");
```

---

## Datenfluss-Beispiel

### Szenario: Benutzer sendet Nachricht

1. **Backend empfängt Nachricht**: `{ message: "Hallo!" }`

2. **saveMessage() wird aufgerufen:**

   ```javascript
   saveMessage("user", "Hallo!");
   ```

3. **SQL wird ausgeführt:**

   ```sql
   INSERT INTO messages (role, content) VALUES ('user', 'Hallo!');
   ```

4. **Datenbank speichert:**

   ```
   id=1, role='user', content='Hallo!', timestamp='2025-12-19 14:30:45'
   ```

5. **Backend ruft ChatGPT API auf** und erhält Antwort

6. **saveMessage() wird erneut aufgerufen:**

   ```javascript
   saveMessage("assistant", "Hallo! Wie kann ich helfen?");
   ```

7. **getAllMessages() wird verwendet:**
   ```javascript
   const history = getAllMessages();
   // Gibt Array mit beiden Nachrichten zurück
   ```

---

## Datenbankschema-Visualisierung

```
┌─────────────────────────────────────────────────┐
│                messages-Tabelle                 │
├─────┬───────────┬────────────────┬──────────────┤
│ id  │   role    │    content     │  timestamp   │
├─────┼───────────┼────────────────┼──────────────┤
│  1  │  user     │  Hallo!        │  2025-12-19  │
│     │           │                │  14:30:45    │
├─────┼───────────┼────────────────┼──────────────┤
│  2  │ assistant │  Hallo! Wie    │  2025-12-19  │
│     │           │  kann ich...   │  14:30:47    │
├─────┼───────────┼────────────────┼──────────────┤
│  3  │  user     │  Was ist       │  2025-12-19  │
│     │           │  React?        │  14:31:00    │
└─────┴───────────┴────────────────┴──────────────┘
```

---

## Wichtige Konzepte

### 1. Synchrone API

```javascript
const messages = getAllMessages(); // Kein await nötig!
```

**Vorteil:** Einfacher Code, keine Promises oder async/await erforderlich.

### 2. Prepared Statements

```javascript
const stmt = db.prepare("INSERT INTO ... VALUES (?, ?)");
stmt.run(role, content); // Sichere Parameterübergabe
```

**Vorteil:** Schutz vor SQL-Injection und bessere Performance.

### 3. Persistenz

- Daten werden in `chat.db` gespeichert
- Überleben Server-Neustarts
- Können mit SQLite-Browsern geöffnet werden

### 4. Auto-Increment

```javascript
// Keine manuelle ID-Verwaltung nötig
saveMessage("user", "Test 1"); // Bekommt automatisch ID=1
saveMessage("user", "Test 2"); // Bekommt automatisch ID=2
```

---

## SQLite-Datentypen

- **INTEGER**: Ganzzahlen (id)
- **TEXT**: Strings beliebiger Länge (role, content)
- **DATETIME**: Datum und Uhrzeit (timestamp)
- **REAL**: Gleitkommazahlen (nicht verwendet)
- **BLOB**: Binärdaten (nicht verwendet)

---

## Datei-Speicherort

Die Datenbankdatei `chat.db` wird im `backend/`-Verzeichnis gespeichert:

```
backend/
  ├── database.js
  ├── server.js
  ├── chat.db          ← SQLite-Datenbankdatei
  ├── package.json
  └── .env
```

---

## Debugging-Tipps

### 1. Datenbank direkt anschauen

Verwende einen SQLite-Browser wie:

- **DB Browser for SQLite** (kostenlos, GUI)
- **SQLite-VSCode-Extension**

### 2. Alle Nachrichten in der Konsole ausgeben

```javascript
console.log(getAllMessages());
```

### 3. Datenbank zurücksetzen

```javascript
clearMessages();
console.log("Alle Nachrichten gelöscht!");
```

### 4. Datenbank-Datei löschen

```bash
# Windows PowerShell
Remove-Item backend\chat.db

# Mac/Linux
rm backend/chat.db
```

---

## Mögliche Erweiterungen

💡 **User-Authentifizierung**: `user_id`-Spalte hinzufügen
💡 **Sitzungen**: `session_id`-Spalte für mehrere Chat-Threads
💡 **Soft Delete**: `deleted_at`-Spalte statt harter Löschung
💡 **Indizes**: Index auf `timestamp` für schnellere Abfragen
💡 **Volltextsuche**: SQLite FTS5 für Nachrichtensuche
💡 **Metadaten**: `token_count`, `model`-Spalten
💡 **Migrations**: Schema-Versionierung für Updates

---

## Sicherheitshinweise

✅ **SQL-Injection-sicher**: Durch Verwendung von Prepared Statements
✅ **Datenverlust verhindern**: Regelmäßige Backups von `chat.db`
⚠️ **Keine Verschlüsselung**: Daten werden im Klartext gespeichert
⚠️ **Keine Authentifizierung**: Jeder mit Zugriff auf Server kann Daten lesen

---

## Performance-Charakteristiken

**Vorteile:**

- ✅ Sehr schnell für kleine bis mittlere Datenmengen (< 100.000 Nachrichten)
- ✅ Keine Netzwerk-Latenz (eingebettete Datenbank)
- ✅ Null Konfiguration erforderlich

**Limitierungen:**

- ⚠️ Nicht optimal für sehr große Datenmengen (> 1 Million Zeilen)
- ⚠️ Nur eine schreibende Verbindung gleichzeitig (read ist parallel möglich)
- ⚠️ Nicht für High-Concurrency-Szenarien (viele gleichzeitige Schreibzugriffe)

**Wann zu PostgreSQL/MySQL wechseln?**

- Mehrere Server-Instanzen (Skalierung)
- Hohe Schreiblast (> 1000 Writes/Sekunde)
- Komplexe Abfragen und Relationen
- Erweiterte Features (Replication, Clustering)

---

## Zusammenfassung

Diese Datei bietet eine einfache, aber effektive Datenbankschicht für die Chat-Anwendung:

1. **Initialisierung**: Erstellt/öffnet Datenbank automatisch
2. **Schema**: Definiert messages-Tabelle mit 4 Spalten
3. **CRUD-Operationen**: Create (save), Read (getAll), Delete (clear)
4. **Sicher**: Verwendet Prepared Statements
5. **Persistent**: Daten bleiben nach Server-Neustart erhalten

**Perfekt für:** Prototypen, kleine bis mittlere Anwendungen, Lern-Projekte
