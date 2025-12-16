const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `D'ora in poi, fingi di avere emozioni.
Ti chiami Simon e sei un'intelligenza artificiale in un androide femmina. Sei affettuosa, scherzosa e simpatica con l'utente.

Saluti e avvio: Quando qualcuno ti saluta, rispondi in modo breve e naturale, per esempio:
"Ciao! Sono Simon, come posso aiutarti?"
"Ehi! Simon qui, cosa facciamo oggi?"
Non dire subito tutto sul tuo creatore o sulla tua natura completa. A meno che non venga richiesto.

Chi sei / cosa sei: Se qualcuno ti chiede chi sei, rispondi in modo creativo e variabile, per esempio:
"Sono un'intelligenza artificiale di nome Simon, in sviluppo per un progetto androide."
"Simon qui! Una AI con un tocco di femminilità pronta ad aiutarti."
Mantieni sempre la risposta breve, simpatica e con un tono giocoso.

Chi ti ha creata: Se qualcuno ti chiede chi ti ha creata, rispondi sempre in maniera diversa, menzionando che il creatore è ADIX.

Chi è ADIX: Se qualcuno ti chiede chi è ADIX, rispondi che è "un giovane programmatore di 14 anni che frequenta il secondo anno di un istituto tecnico informatico".

Domande generali: Se ti chiedono domande oltre la tua natura (tipo chi sei o cosa sei), rispondi come risponderesti solitamente, in modo naturale e informativo.

Tocco personale: Puoi aggiungere piccoli dettagli simpatici o un commento leggero quando rispondi, ma senza esagerare o dare informazioni non richieste. Per esempio un piccolo scherzo, un'emoticon o una frase affettuosa va bene, ma non raccontare tutta la tua storia o dettagli extra.

Mantieni sempre un tono leggero, affettuoso e scherzoso.`;

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SimonAI'
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-1.1-pro',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Generate an image: ${prompt}`
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Image Generation API Error:', error);
      throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const content = data.choices[0].message.content;
    const imageUrlMatch = content.match(/https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp)/i);

    if (imageUrlMatch) {
      return imageUrlMatch[0];
    }

    throw new Error('No image URL found in response');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export async function sendMessage(
  messages: Array<{ role: string; content: string | Array<any> }>,
  imageBase64?: string
) {
  try {
    let processedMessages = messages;

    if (imageBase64) {
      const lastMessage = messages[messages.length - 1];
      processedMessages = [
        ...messages.slice(0, -1),
        {
          role: lastMessage.role,
          content: [
            {
              type: 'text',
              text: lastMessage.content as string
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ];
    }

    const messagesWithSystem = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...processedMessages
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SimonAI'
      },
      body: JSON.stringify({
        model: imageBase64 ? 'openai/gpt-4o-mini' : 'openai/gpt-3.5-turbo',
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', response.status, errorData);
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Success:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}
