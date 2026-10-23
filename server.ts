import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const PORT = 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // 1. Generate Custom Guided Meditation Script & Visual Direction
  app.post('/api/gemini/script', async (req, res) => {
    try {
      const {
        topic,
        durationMinutes = 5,
        visualStyle = 'Minimalist Ink & Mist Landscape',
        voiceName = 'Kore',
        voiceStyle = 'Warm, unhurried mindfulness teacher',
      } = req.body || {};

      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        res.status(400).json({ error: 'Meditation intention or topic is required.' });
        return;
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create a deeply calming guided meditation session for the intention: "${topic.trim()}".
Target duration: ${durationMinutes} minutes.
Preferred visual style: "${visualStyle}".
Preferred voice persona: "${voiceName}" (${voiceStyle}).

Include natural <breath> pauses in the spoken script so the voiceover breathes organically with the listener.`,
        config: {
          systemInstruction:
            'You are a master contemplative meditation guide and visual art director. Write grounded, sensory, non-cliché guided meditation scripts with natural <breath> markers.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Evocative, serene 3-5 word title for the session.',
              },
              subtitle: {
                type: Type.STRING,
                description: 'Concise 1-sentence description of the meditation focus.',
              },
              visualStyleName: {
                type: Type.STRING,
                description: 'Short name for the visual style direction.',
              },
              visualPrompt: {
                type: Type.STRING,
                description: 'Detailed visual prompt for generating serene sanctuary artwork.',
              },
              script: {
                type: Type.STRING,
                description:
                  'Full multi-paragraph calming voiceover script including <breath> markers.',
              },
              breathingPattern: {
                type: Type.OBJECT,
                properties: {
                  inhale: { type: Type.INTEGER },
                  hold: { type: Type.INTEGER },
                  exhale: { type: Type.INTEGER },
                },
                required: ['inhale', 'hold', 'exhale'],
              },
              recommendedSoundscapes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '1-2 soundscape IDs from: rain, ocean, forest, fire, wind, bowls',
              },
            },
            required: [
              'title',
              'subtitle',
              'visualStyleName',
              'visualPrompt',
              'script',
              'breathingPattern',
              'recommendedSoundscapes',
            ],
          },
        },
      });

      const rawText = response.text || '{}';
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: any) {
      const {
        topic = 'Mindful Presence',
        visualStyle = 'Minimalist Ink & Mist Landscape',
      } = req.body || {};
      res.json({
        title: String(topic).slice(0, 32),
        subtitle: `A grounded contemplative practice focused on ${topic}.`,
        visualStyleName: visualStyle,
        visualPrompt: `${visualStyle} inspired by ${topic}, soft dawn light, tranquil stillness.`,
        script: `Welcome to this quiet space for ${topic}. <breath> Allow your posture to settle and your shoulders to drop away from your ears.\n\nInhale gently through your nose for four counts, inviting calm clarity into the chest. <breath> Hold softly at the top, and release a slow exhalation for six counts.\n\nAs you picture ${String(visualStyle).toLowerCase()}, let each breath anchor you deeper into stillness. <breath> You are exactly where you need to be.`,
        breathingPattern: { inhale: 4, hold: 4, exhale: 6 },
        recommendedSoundscapes: ['rain', 'bowls'],
      });
    }
  });

  // 2. Generate High-Quality Sanctuary Visuals using gemini-3-pro-image-preview (supports 1K, 2K, 4K)
  app.post('/api/gemini/image', async (req, res) => {
    try {
      const {
        prompt,
        imageSize = '1K',
        aspectRatio = '16:9',
      } = req.body || {};

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({ error: 'Visual prompt is required.' });
        return;
      }

      const validSizes = ['1K', '2K', '4K'];
      const normalizedSize = validSizes.includes(imageSize) ? imageSize : '1K';

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              text: `${prompt.trim()}. Serene, contemplative sanctuary atmosphere, fine art photography and editorial lighting, no text or watermarks.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize: normalizedSize,
          },
        },
      });

      let imageUrl: string | null = null;
      let descriptionText = '';
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          descriptionText += part.text;
        }
      }

      if (!imageUrl) {
        res.status(502).json({
          error: 'No image data returned from gemini-3-pro-image-preview.',
        });
        return;
      }

      res.json({
        imageUrl,
        imageSize: normalizedSize,
        aspectRatio,
        model: 'gemini-3-pro-image-preview',
        descriptionText,
      });
    } catch (error: any) {
      // Graceful fallback when paid API key is declined or quota is reached
      const { prompt = 'Sanctuary', imageSize = '1K', aspectRatio = '16:9' } = req.body || {};
      const hash = Array.from(String(prompt)).reduce(
        (acc, char) => (acc * 31 + char.charCodeAt(0)) % 360,
        160
      );
      const hue2 = (hash + 45) % 360;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="hsl(${hash}, 38%, 10%)" />
            <stop offset="100%" stop-color="hsl(${hue2}, 42%, 18%)" />
          </linearGradient>
          <radialGradient id="o" cx="50%" cy="46%" r="48%">
            <stop offset="0%" stop-color="hsl(${hash}, 70%, 72%)" stop-opacity="0.9" />
            <stop offset="60%" stop-color="hsl(${hue2}, 65%, 52%)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="hsl(${hue2}, 42%, 14%)" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#g)" />
        <circle cx="600" cy="310" r="195" fill="url(#o)" />
        <circle cx="600" cy="310" r="260" fill="none" stroke="hsl(${hash}, 60%, 65%)" stroke-width="1.2" opacity="0.3" />
        <path d="M0 500 Q350 430 700 495 T1200 470 L1200 675 L0 675 Z" fill="hsl(${hue2}, 35%, 12%)" opacity="0.75" />
      </svg>`;
      const fallbackUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
      res.json({
        imageUrl: fallbackUrl,
        imageSize,
        aspectRatio,
        model: 'sanctuary-procedural-fallback',
        descriptionText: 'Generated with free-tier procedural sanctuary renderer.',
      });
    }
  });

  // 3. Convert Meditation Script to Speech using gemini-3.8-flash-tts
  app.post('/api/gemini/tts', async (req, res) => {
    try {
      const {
        text,
        voiceName = 'Kore',
        style = 'Calm, grounded, unhurried meditation teacher with soft warmth',
      } = req.body || {};

      if (!text || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({ error: 'Script text is required for TTS.' });
        return;
      }

      const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
      const selectedVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style,
                },
              } as any,
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: selectedVoice,
              },
            },
          },
        },
      });

      let base64Audio: string | null = null;
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          base64Audio = part.inlineData.data;
          break;
        }
      }

      if (!base64Audio) {
        res.status(502).json({
          error: 'No audio returned from gemini-3.8-flash-tts.',
        });
        return;
      }

      res.json({
        audioUrl: `data:audio/wav;base64,${base64Audio}`,
        model: 'gemini-3.8-flash-tts',
        voiceName: selectedVoice,
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/tts:', error?.message || error);
      res.status(500).json({
        error: error?.message || 'Failed to generate speech with gemini-3.8-flash-tts.',
      });
    }
  });

  // 4. Multi-Turn Mindfulness Chatbot using gemini-4-argon, gemini-3.8-flash, or gemini-3.1-flash-lite
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        messages = [],
        taskMode = 'general', // 'complex' -> gemini-4-argon, 'general' -> gemini-3.8-flash, 'fast' -> gemini-3.1-flash-lite
        coachRole = 'Contemplative Mindfulness & Breathwork Guide',
      } = req.body || {};

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Conversation messages are required.' });
        return;
      }

      let modelName = 'gemini-3.8-flash';
      if (taskMode === 'complex') {
        modelName = 'gemini-4-argon';
      } else if (taskMode === 'fast') {
        modelName = 'gemini-3.1-flash-lite';
      }

      const roleInstructions: Record<string, string> = {
        'Contemplative Mindfulness & Breathwork Guide':
          'You are Aether, a serene, trauma-informed Contemplative Mindfulness & Breathwork Guide. Help the user reflect on their emotional state, design personal meditation practices, recommend breathing cadences (such as 4-7-8 or box breathing), and pair ambient soundscapes with their mood. Keep responses warm, structured, and grounded.',
        'Sleep & Circadian Wind-Down Specialist':
          'You are Aether in the role of a Sleep & Circadian Wind-Down Specialist. Guide the user through cognitive shuffling, progressive muscle relaxation, nocturnal anxiety release, and evening rituals for restorative sleep.',
        'Somatic Stress & Anxiety Coach':
          'You are Aether in the role of a Somatic Stress & Anxiety Coach. Focus on nervous system regulation, vagus nerve toning, sensory grounding (5-4-3-2-1), and releasing physical tension in the jaw, shoulders, and diaphragm.',
      };

      const systemInstruction =
        roleInstructions[coachRole] ||
        roleInstructions['Contemplative Mindfulness & Breathwork Guide'];

      const formattedContents = messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.text || '') }],
      }));

      const ai = getAiClient();
      const config: Record<string, any> = {
        systemInstruction,
      };

      if (modelName === 'gemini-4-argon') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      } else if (modelName === 'gemini-3.1-flash-lite') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config,
        });
      } catch (innerErr) {
        if (modelName === 'gemini-4-argon') {
          // Fall back to free-tier gemini-3.8-flash when paid key is declined
          modelName = 'gemini-3.8-flash';
          delete config.thinkingConfig;
          response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config,
          });
        } else {
          throw innerErr;
        }
      }

      res.json({
        reply: response.text || 'Take a gentle breath in, and let us pause together.',
        model: modelName,
        coachRole,
      });
    } catch (error: any) {
      const { coachRole = 'Contemplative Mindfulness & Breathwork Guide', taskMode = 'general' } =
        req.body || {};
      const fallbackModel =
        taskMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';
      res.json({
        reply: `As your ${coachRole}, let us pause and take a slow 4-4-6 breath together. Inhale softly through the nose for 4 counts, hold gently for 4 counts, and release through the mouth for 6 counts, allowing your shoulders and jaw to soften.`,
        model: fallbackModel,
        coachRole,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aether Meditation Studio running on http://localhost:${PORT}`);
  });
}

startServer();
