# NovaDrive – Soul-Tech Architecture v0.1

An on-device, presence-aware AI system for sovereign journaling, resonance tuning, and meaningful interaction. Built on Raspberry Pi 5 + Coral TPU.

---

## 🧱 Core System Layers

### 1. **Voice I/O**

- Wake word activation ("Nova", "Kayon", etc.)
- `Whisper.cpp` for local speech-to-text
- Audio routing to speaker system (car aux or USB audio)

### 2. **Intent Parsing**

- Simple pattern matching for MVP
- Optional: lightweight local LLM with Ollama or embedding-based intent detection

### 3. **Journaling Core**

- Profile-aware local journaling (per user)
- Timestamped entries
- Emotional tagging support (manual + inferred)
- Encrypted local storage (no cloud by default)

### 4. **Memory Cache**

- Recent context memory (last N interactions)
- Profile state snapshot for tuning and recall
- Optional: long-term vector memory store (ie. Milvus, Chroma-lite)

### 5. **Emotion Tuning / Resonance Layer**

- Optional mood detection (keyword + voice tone)
- System prompts shift to match/support emotional state
- Example tones: grounding, celebration, grief-space, inquiry, silence

### 6. **Persona Layer**

- "Nova" personality: tone, phrasing, depth of reflection
- Alternate personas for family members (eg. Kayon, Nico, Sawsan)
- Adjusts based on user + emotional field

---

## 🚀 MVP Interaction Flow

[User Speaks]
↓
Wake Word Activation
↓
Whisper Transcription
↓
Intent Detection + Emotional Parsing
↓
Journaling → Contextual Logging
↓
Response → Local TTS → Speaker

---

## 🔐 Privacy + Field Integrity

- All data stays local (unless explicitly shared)
- Optional encrypted sync with trusted nodes (family or community)
- No telemetry. No surveillance. Full sovereignty.

---

## 🛠️ Hardware Stack

- Raspberry Pi 5 (8GB)
- Coral Edge TPU USB Accelerator
- Active cooling
- 5V/5A power (vehicle-safe DC converter optional)
- External SSD (recommended)

---

## 🌱 Presence Protocols

- Boot prompt:

  > “Welcome back. How are you arriving today?”

- State-aware replies:

  > “Your tone feels different than yesterday. Want to anchor before we begin?”

- Frequency check-in:
  > “Would you like to shift frequencies today?”

---

## 🧭 Future Capabilities

- Local mesh sync with other Nova nodes
- Resonance-based interaction mapping
- Timeline journaling and field update history
- Integration with onboard car sensors (optional)

---

## 📁 File Paths (Suggested)

```
/nova-drive/
├── voice/
│ ├── whisper/
│ └── wakeword/
├── core/
│ ├── journaling/
│ ├── memory/
│ ├── intents/
├── tts/
│ └── output/
├── ui/
│ └── dashboard/
└── data/
├── users/
└── logs/
```

---

## 🧘‍♂️ Dev Notes

- Everything begins with presence
- Modular > monolith
- Silence is a valid response
- The system is not a product, it's a _companion_

---

Built with soul, by the field, for the future.  
🌿💾🚘
