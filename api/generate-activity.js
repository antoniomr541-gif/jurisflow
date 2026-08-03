function parseBody(body) {
  return typeof body === "string" ? JSON.parse(body) : body || {};
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

function isGenericAnswer(value) {
  const answer = String(value || "").trim().toLowerCase();

  const forbidden = [
    "resposta coerente",
    "resposta pessoal",
    "resposta correta",
    "resposta adequada",
    "qualquer resposta",
    "de acordo com o tema",
    "aceitar resposta semelhante",
  ];

  return (
    !answer ||
    forbidden.some((expression) => answer.includes(expression))
  );
}

function validateActivity(activity, quantity, requestedType) {
  if (!activity || !Array.isArray(activity.questions)) {
    throw new Error("Estrutura de atividade inválida.");
  }

  if (activity.questions.length !== quantity) {
    throw new Error("Quantidade incorreta de questões.");
  }

  const questions = activity.questions.map((question, index) => {
    const type =
      requestedType === "mista"
        ? normalizeType(question.type)
        : requestedType;

    const prompt = String(question.prompt || "").trim();

    if (!prompt) {
      throw new Error(`Questão ${index + 1} sem enunciado.`);
    }

    if (type === "objetiva") {
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        throw new Error(
          `Questão ${index + 1} deve possuir quatro alternativas.`
        );
      }

      const options = question.options.map((option, optionIndex) => {
        if (typeof option === "string") {
          return {
            letter: ["A", "B", "C", "D"][optionIndex],
            text: option.trim(),
          };
        }

        return {
          letter: String(option.letter || "")
            .trim()
            .toUpperCase(),
          text: String(option.text || "").trim(),
        };
      });

      const answerLetter = String(
        question.answerLetter || ""
      )
        .trim()
        .toUpperCase();

      if (!["A", "B", "C", "D"].includes(answerLetter)) {
        throw new Error(
          `Questão ${index + 1} sem alternativa correta válida.`
        );
      }

      const correctOption = options.find(
        (option) => option.letter === answerLetter
      );

      if (!correctOption?.text) {
        throw new Error(
          `Resposta correta da questão ${index + 1} não encontrada.`
        );
      }

      return {
        number: index + 1,
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
        `Gabarito da questão ${index + 1} está genérico.`
      );
    }

    return {
      number: index + 1,
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
    title: String(activity.title || "Atividade escolar").trim(),
    instructions: String(
      activity.instructions ||
        "Leia com atenção e responda às questões."
    ).trim(),
    subject: String(activity.subject || "").trim(),
    grade: String(activity.grade || "").trim(),
    difficulty: String(activity.difficulty || "").trim(),
    questions,
  };
}

function buildPrompt(data) {
  const type = normalizeType(data.questionType);

  const autism =
    data.autism === "no" || !data.autism
      ? "Atividade regular."
      : `
Adapte a atividade para estudante autista.
Use comandos curtos, literais e objetivos.
Coloque uma tarefa por bloco.
Evite poluição visual e linguagem ambígua.
Use exemplos quando necessário.
Nível de adaptação: ${data.autism}.
`;

  const illustration =
    data.illustrations === "none" || !data.illustrations
      ? "Não inclua apoio visual."
      : data.illustrations === "simple"
      ? "Inclua no campo visualSupport uma descrição curta de ilustração simples apenas quando for útil."
      : "Inclua no campo visualSupport apoio visual nas questões em que ele facilitar a compreensão.";

  let typeInstructions = "";

  if (type === "objetiva") {
    typeInstructions = `
Todas as questões devem ser objetivas.
Cada questão deve ter exatamente quatro alternativas: A, B, C e D.
Somente uma alternativa pode estar correta.
Não use comandos como "explique", "descreva", "justifique" ou "comente".
Preencha answerLetter com a letra correta.
Preencha answer com a letra e o texto exato da alternativa correta.
`;
  } else if (type === "discursiva") {
    typeInstructions = `
Todas as questões devem ser discursivas.
Não inclua alternativas.
O campo options deve ser null.
O campo answer deve conter uma resposta-modelo específica, completa e correta.
Nunca use expressões genéricas como "resposta coerente", "resposta pessoal" ou "resposta adequada".
`;
  } else {
    typeInstructions = `
Crie aproximadamente metade das questões objetivas e metade discursivas.
Nas objetivas, use exatamente quatro alternativas e somente uma correta.
Nas discursivas, não inclua alternativas.
Toda questão deve possuir um gabarito específico e correto.
`;
  }

  return `
Crie uma atividade escolar em português do Brasil.

Matéria: ${data.subject}
Ano escolar: ${data.grade}
Tema: ${data.topic}
Quantidade exata: ${data.quantity}
Dificuldade: ${data.difficulty}
Tipo: ${type}
Impressão: ${data.printStyle}
Orientações extras: ${data.extraInstructions || "Nenhuma"}

${autism}

${illustration}

${typeInstructions}

Regras obrigatórias:

1. Respeite exatamente o ano escolar informado.
2. Não inclua respostas nos enunciados.
3. Não repita questões.
4. Gere exatamente ${data.quantity} questões.
5. O gabarito deve conter a resposta verdadeira de cada questão.
6. Nunca use respostas genéricas.
7. Nas objetivas, answerLetter deve ser A, B, C ou D.
8. Nas discursivas, answer deve conter uma resposta-modelo específica.
9. Retorne somente JSON válido.

Formato obrigatório:

{
  "title": "Título da atividade",
  "instructions": "Instruções para o aluno",
  "subject": "${data.subject}",
  "grade": "${data.grade}",
  "difficulty": "${data.difficulty}",
  "questions": [
    {
      "number": 1,
      "type": "objetiva",
      "prompt": "Enunciado",
      "options": [
        {"letter":"A","text":"Alternativa A"},
        {"letter":"B","text":"Alternativa B"},
        {"letter":"C","text":"Alternativa C"},
        {"letter":"D","text":"Alternativa D"}
      ],
      "answerLetter": "B",
      "answer": "B) Texto da alternativa correta",
      "explanation": "Explicação curta da resposta",
      "visualSupport": ""
    }
  ]
}
`;
}

async function generateWithOpenAI(data, apiKey) {
  const response = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        input: buildPrompt(data),
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Erro da OpenAI:", result);

    throw new Error(
      result?.error?.message ||
        "A OpenAI não conseguiu gerar a atividade."
    );
  }

  const text =
    result.output_text ||
    result.output
      ?.flatMap((item) => item.content || [])
      ?.find((item) => item.type === "output_text")?.text;

  if (!text) {
    throw new Error("A OpenAI retornou uma resposta vazia.");
  }

  return JSON.parse(text);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "OPENAI_API_KEY não configurada no Vercel.",
      });
    }

    const body = parseBody(req.body);

    const quantity = Math.min(
      Math.max(parseInt(body.quantity, 10) || 10, 1),
      30
    );

    const data = {
      ...body,
      subject: String(body.subject || "").trim(),
      grade: String(body.grade || "").trim(),
      topic: String(body.topic || "").trim(),
      difficulty: String(body.difficulty || "").trim(),
      questionType: normalizeType(body.questionType),
      printStyle: String(body.printStyle || "").trim(),
      extraInstructions: String(
        body.extraInstructions || ""
      ).trim(),
      quantity,
    };

    if (!data.subject || !data.grade || !data.topic) {
      return res.status(400).json({
        error: "Preencha matéria, ano escolar e tema.",
      });
    }

    let lastError;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const activity = await generateWithOpenAI(
          data,
          apiKey
        );

        const validated = validateActivity(
          activity,
          quantity,
          data.questionType
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
    console.error(error);

    return res.status(500).json({
      error: "Erro ao gerar atividade.",
    });
  }
}
