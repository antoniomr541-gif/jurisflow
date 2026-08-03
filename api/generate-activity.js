function parseBody(body) {
  if (!body) return {};

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

function normalizeType(value = "") {
  const type = String(value).toLowerCase();

  if (type.includes("mista")) return "mista";

  if (
    type.includes("discurs") ||
    type.includes("dissert") ||
    type.includes("aberta")
  ) {
    return "discursiva";
  }

  return "objetiva";
}

function removeMarkdown(text = "") {
  return String(text)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function isGenericAnswer(answer = "") {
  const value = String(answer).trim().toLowerCase();

  const forbidden = [
    "resposta coerente",
    "resposta pessoal",
    "resposta adequada",
    "qualquer resposta",
    "resposta correta",
    "de acordo com o tema",
    "aceitar resposta semelhante",
  ];

  return !value || forbidden.some((item) => value.includes(item));
}

function buildPrompt(data) {
  const type = normalizeType(data.questionType);

  let typeRules = "";

  if (type === "objetiva") {
    typeRules = `
Todas as questões devem ser objetivas.

Cada questão precisa ter exatamente quatro alternativas:
A, B, C e D.

Somente uma alternativa pode estar correta.

Não use nos enunciados palavras como:
"explique", "descreva", "justifique" ou "comente".

O campo answerLetter deve conter a letra correta.
`;
  }

  if (type === "discursiva") {
    typeRules = `
Todas as questões devem ser discursivas.

Não inclua alternativas.

O campo options deve ser null.

O campo answer deve apresentar uma resposta-modelo específica,
correta e completa.

Nunca use respostas genéricas.
`;
  }

  if (type === "mista") {
    typeRules = `
Crie aproximadamente metade das questões objetivas e metade discursivas.

Nas objetivas:
- use quatro alternativas;
- somente uma deve estar correta;
- informe answerLetter.

Nas discursivas:
- não use alternativas;
- apresente uma resposta-modelo específica.
`;
  }

  const autism =
    data.autism && data.autism !== "no"
      ? `
A atividade deve ser adaptada para estudante autista.

Use:
- comandos curtos e literais;
- uma tarefa por bloco;
- linguagem sem ambiguidades;
- pouco excesso visual;
- exemplos simples quando forem necessários.

Nível de adaptação: ${data.autism}.
`
      : "";

  const illustrations =
    data.illustrations && data.illustrations !== "none"
      ? `
Inclua no campo visualSupport uma descrição curta de ilustração
quando ela realmente ajudar na compreensão.
`
      : `
Deixe visualSupport vazio.
`;

  return `
Crie uma atividade escolar em português do Brasil.

Matéria: ${data.subject}
Ano escolar: ${data.grade}
Tema: ${data.topic}
Quantidade exata de questões: ${data.quantity}
Dificuldade: ${data.difficulty}
Tipo de questão: ${type}

${typeRules}

${autism}

${illustrations}

REGRAS OBRIGATÓRIAS:

1. Respeite exatamente o ano escolar informado.
2. Gere exatamente ${data.quantity} questões.
3. Não repita questões.
4. Não coloque a resposta dentro do enunciado.
5. O gabarito deve apresentar a resposta verdadeira.
6. Nunca use respostas genéricas.
7. Cada objetiva deve ter somente uma alternativa correta.
8. Retorne somente JSON válido.
9. Não use texto antes ou depois do JSON.

FORMATO OBRIGATÓRIO:

{
  "title": "Título da atividade",
  "instructions": "Orientação para os alunos",
  "subject": "${data.subject}",
  "grade": "${data.grade}",
  "difficulty": "${data.difficulty}",
  "questions": [
    {
      "number": 1,
      "type": "objetiva",
      "prompt": "Enunciado da questão",
      "options": [
        {
          "letter": "A",
          "text": "Primeira alternativa"
        },
        {
          "letter": "B",
          "text": "Segunda alternativa"
        },
        {
          "letter": "C",
          "text": "Terceira alternativa"
        },
        {
          "letter": "D",
          "text": "Quarta alternativa"
        }
      ],
      "answerLetter": "B",
      "answer": "B) Texto exato da alternativa correta",
      "explanation": "Explicação curta da resposta",
      "visualSupport": ""
    }
  ]
}
`;
}

function validateActivity(activity, data) {
  if (!activity || !Array.isArray(activity.questions)) {
    throw new Error("A IA retornou uma estrutura inválida.");
  }

  if (activity.questions.length !== data.quantity) {
    throw new Error("A quantidade de questões retornada está incorreta.");
  }

  const requestedType = normalizeType(data.questionType);

  const questions = activity.questions.map((question, index) => {
    const number = index + 1;

    const type =
      requestedType === "mista"
        ? normalizeType(question.type)
        : requestedType;

    const prompt = String(question.prompt || "").trim();

    if (!prompt) {
      throw new Error(`A questão ${number} está sem enunciado.`);
    }

    if (type === "objetiva") {
      const forbiddenCommands =
        /\b(explique|descreva|justifique|comente)\b/i;

      if (forbiddenCommands.test(prompt)) {
        throw new Error(
          `A questão ${number} não está no formato objetivo.`
        );
      }

      if (
        !Array.isArray(question.options) ||
        question.options.length !== 4
      ) {
        throw new Error(
          `A questão ${number} precisa ter quatro alternativas.`
        );
      }

      const letters = ["A", "B", "C", "D"];

      const options = question.options.map((option, optionIndex) => ({
        letter: letters[optionIndex],
        text: String(
          typeof option === "string" ? option : option.text || ""
        ).trim(),
      }));

      if (options.some((option) => !option.text)) {
        throw new Error(
          `A questão ${number} possui alternativa vazia.`
        );
      }

      const answerLetter = String(
        question.answerLetter || ""
      )
        .trim()
        .toUpperCase();

      if (!letters.includes(answerLetter)) {
        throw new Error(
          `A questão ${number} não possui alternativa correta válida.`
        );
      }

      const correctOption = options.find(
        (option) => option.letter === answerLetter
      );

      if (!correctOption) {
        throw new Error(
          `A resposta da questão ${number} não foi encontrada.`
        );
      }

      return {
        number,
        type: "objetiva",
        prompt,
        options,
        answerLetter,
        answer: `${answerLetter}) ${correctOption.text}`,
        explanation: String(question.explanation || "").trim(),
        visualSupport: String(question.visualSupport || "").trim(),
      };
    }

    const answer = String(question.answer || "").trim();

    if (isGenericAnswer(answer)) {
      throw new Error(
        `O gabarito da questão ${number} veio genérico.`
      );
    }

    return {
      number,
      type: "discursiva",
      prompt,
      options: null,
      answerLetter: null,
      answer,
      explanation: String(question.explanation || "").trim(),
      visualSupport: String(question.visualSupport || "").trim(),
    };
  });

  return {
    title: String(
      activity.title ||
        `Atividade de ${data.subject}: ${data.topic}`
    ).trim(),

    instructions: String(
      activity.instructions ||
        "Leia com atenção e responda às questões."
    ).trim(),

    subject: data.subject,
    grade: data.grade,
    difficulty: data.difficulty,
    questions,
  };
}

async function generateWithGemini(data, apiKey) {
  const model =
    process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildPrompt(data),
            },
          ],
        },
      ],

      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Erro retornado pelo Gemini:", result);

    throw new Error(
      result?.error?.message ||
        "O Gemini não conseguiu gerar a atividade."
    );
  }

  const text =
    result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("O Gemini retornou uma resposta vazia.");
  }

  return JSON.parse(removeMarkdown(text));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  try {
    const body = parseBody(req.body);

    const quantity = Math.min(
      Math.max(
        Number.parseInt(
          body.quantity || body.quantidade,
          10
        ) || 10,
        1
      ),
      30
    );

    const data = {
      subject: String(
        body.subject || body.materia || ""
      ).trim(),

      grade: String(
        body.grade || body.ano || ""
      ).trim(),

      topic: String(
        body.topic || body.tema || ""
      ).trim(),

      difficulty: String(
        body.difficulty ||
          body.dificuldade ||
          "Média"
      ).trim(),

      questionType: normalizeType(
        body.questionType ||
          body.tipo ||
          "objetiva"
      ),

      illustrations: String(
        body.illustrations ||
          body.ilustracoes ||
          "none"
      ).trim(),

      autism: String(
        body.autism ||
          body.autismo ||
          "no"
      ).trim(),

      quantity,
    };

    if (!data.subject || !data.grade || !data.topic) {
      return res.status(400).json({
        error:
          "Preencha matéria, ano escolar e tema.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error:
          "O gerador ainda não está configurado.",
      });
    }

    let lastError;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const generated = await generateWithGemini(
          data,
          apiKey
        );

        const validated = validateActivity(
          generated,
          data
        );

        return res.status(200).json(validated);
      } catch (error) {
        lastError = error;

        console.error(
          `Tentativa ${attempt} falhou:`,
          error
        );
      }
    }
  

    return res.status(500).json({
      error:
        lastError?.message ||
        "Não foi possível gerar uma atividade válida.",
    });
  } catch (error) {
    console.error("Erro geral:", error);

    return res.status(500).json({
      error: "Erro ao gerar atividade.",
    });
  }
}
