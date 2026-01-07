
import type { Question, Theme, Difficulty } from '../types';

// --- Word Search Data ---

const wordLists: Record<string, string[]> = {
    animais: [
        "LEAO", "TIGRE", "ELEFANTE", "GIRAFA", "MACACO", "ZEBRA", "HIPOPOTAMO", "RINOCERONTE", "CROCODILO", "JACARE",
        "CAPIVARA", "TATU", "ONCA", "LOBO", "RAPOSA", "URSO", "PANDA", "CANGURU", "COALA", "PREGUICA",
        "GATO", "CACHORRO", "HAMSTER", "COELHO", "PORQUINHO", "VACAS", "CAVALO", "PORCO", "OVELHA", "CABRA",
        "GALINHA", "PATO", "PERU", "GANSO", "MARRECO", "AVESTRUZ", "PINGUIM", "AGUIA", "FALCAO", "CORUJA",
        "GAVIAO", "ARARA", "PAPAGAIO", "TUCANO", "BEIJAFLOR", "PARDAL", "POMBO", "CORVO", "GAIVOTA", "PELICANO",
        "TUBARAO", "BALEIA", "GOLFINHO", "POLVO", "LULA", "CAMARAO", "LAGOSTA", "CARANGUEJO", "SIRI", "OSTRA",
        "ESTRELA", "AGUAVIVA", "CORAL", "PEIXE", "SALMAO", "ATUM", "SARDINHA", "BACALHAU", "TILAPIA", "TUCUNARE",
        "COBRA", "LAGARTO", "IGUANA", "CAMALEAO", "JABUTI", "TARTARUGA", "SAPO", "RA", "PERERECA", "SALAMANDRA",
        "ABELHA", "FORMIGA", "BESOURO", "BORBOLETA", "MARIPOSA", "LIBELULA", "GRILO", "GAFANHOTO", "BARATA", "MOSCA",
        "MOSQUITO", "ARANHA", "ESCORPIAO", "LACRAIA", "CENTOPEIA", "MINHOCA", "SANGUESSUGA", "LESMA", "CARACOL", "CARAMUJO"
    ],
    comidas: [
        "ARROZ", "FEIJAO", "MACARRAO", "LASANHA", "PIZZA", "HAMBURGUER", "BATATA", "MANDIOCA", "INHAME", "CARA",
        "ALFACE", "TOMATE", "CEBOLA", "ALHO", "PIMENTA", "CENOURA", "BETERRABA", "NABO", "RABANETE", "CHUCHU",
        "ABOBORA", "ABOBRINHA", "BERINJELA", "JILO", "QUIABO", "MAXIXE", "PEPINO", "VAGEM", "ERVILHA", "MILHO",
        "GRÃO", "LENTILHA", "SOJA", "TRIGO", "AVEIA", "CENTEIO", "CEVADA", "SORGO", "PAO", "BOLO",
        "TORTA", "BISCOITO", "BOLACHA", "TORRADA", "SONHO", "CROISSANT", "BAGUETE", "CIABATTA", "FOCACCIA", "BRIOCHE",
        "QUEIJO", "MANTEIGA", "REQUEIJAO", "IOGURTE", "LEITE", "CREME", "CHANTILLY", "SORVETE", "GELATO", "PICOLÉ",
        "CARNE", "FRANGO", "PEIXE", "PORCO", "CORDEIRO", "PERU", "PATO", "LINGUICA", "SALSICHA", "PRESUNTO",
        "BACON", "SALAME", "MORTADELA", "COPA", "LOMBO", "COSTELA", "PICANHA", "ALCATRA", "MAMINHA", "FRALDINHA",
        "MACA", "BANANA", "LARANJA", "UVA", "PERA", "ABACAXI", "MELANCIA", "MELAO", "MAMAO", "MANGA",
        "GOIABA", "CAJU", "ACEROLA", "PITANGA", "JABUTICABA", "AMORA", "MORANGO", "FRAMBOESA", "MIRTILO", "CEREJA"
    ],
    esportes: [
        "FUTEBOL", "VOLEI", "BASQUETE", "TENIS", "GOLFE", "RUGBY", "HANDEBOL", "NATACAO", "JUDO", "KARATE",
        "BOXE", "MMA", "JIUJITSU", "CAPOEIRA", "TAEKWONDO", "KUNGFU", "MUAYTHAI", "WRESTLING", "SUMO", "ESGRIMA",
        "ATLETISMO", "CORRIDA", "SALTO", "ARREMESSO", "LANCAMENTO", "MARATONA", "TRIATLO", "PENTATLO", "DECATLO", "MARCHA",
        "GINASTICA", "ARTISTICA", "RITMICA", "TRAMPOLIM", "ACROBATICA", "AEROBICA", "PARKOUR", "SKATE", "PATINS", "BICICLETA",
        "CICLISMO", "BMX", "MTB", "ESTRADA", "PISTA", "DOWNHILL", "MOTOCROSS", "VELOCIDADE", "ENDURO", "TRIAL",
        "SURF", "BODYBOARD", "WINDSURF", "KITESURF", "WAKEBOARD", "ESQUI", "SNOWBOARD", "CANOAGEM", "REMO", "VELA",
        "HIPISMO", "POLO", "RODEIO", "VAQUEJADA", "TAMBOR", "BALIZA", "LACO", "BULLRIDING", "DRESSAGE", "SALTO",
        "BASEBALL", "CRICKET", "SOFTBALL", "HOCKEY", "GELO", "GRAMA", "PATINS", "BADMINTON", "SQUASH", "PINGPONG"
    ],
    profissoes: [
        "MEDICO", "ENFERMEIRO", "DENTISTA", "VETERINARIO", "PSICOLOGO", "FISIOTERAPEUTA", "NUTRICIONISTA", "BIOLOGO", "QUIMICO", "FISICO",
        "PROFESSOR", "DIRETOR", "PEDAGOGO", "HISTORIADOR", "GEOGRAFO", "SOCIOLOGO", "FILOSOFO", "MATEMATICO", "LETRAS", "ARTES",
        "ENGENHEIRO", "ARQUITETO", "URBANISTA", "DESIGNER", "DECORADOR", "PAISAGISTA", "PEDREIRO", "ELETRICISTA", "ENCANADOR", "PINTOR",
        "CARPINTEIRO", "MARCENEIRO", "SERRALHEIRO", "MECANICO", "BORRACHEIRO", "FUNILEIRO", "MOTORISTA", "PILOTO", "MAQUINISTA", "MARINHEIRO",
        "ADVOGADO", "JUIZ", "PROMOTOR", "DELEGADO", "POLICIAL", "BOMBEIRO", "GUARDA", "SEGURANCA", "DETETIVE", "ESPIAO",
        "JORNALISTA", "REPORTER", "EDITOR", "ESCRITOR", "POETA", "ATOR", "CANTOR", "MUSICO", "BAILARINO", "PINTOR",
        "COZINHEIRO", "CHEF", "GARCOM", "BARMAN", "PADEIRO", "CONFEITEIRO", "ACOGUEIRO", "PEIXEIRO", "FEIRANTE", "VENDEDOR",
        "CONTADOR", "ADMINISTRADOR", "ECONOMISTA", "BANQUEIRO", "CORRETOR", "CONSULTOR", "ANALISTA", "PROGRAMADOR", "DESENVOLVEDOR", "SUPORTE"
    ],
    paises: [
        "BRASIL", "ARGENTINA", "URUGUAI", "PARAGUAI", "CHILE", "BOLIVIA", "PERU", "EQUADOR", "COLOMBIA", "VENEZUELA",
        "GUIANA", "SURINAME", "MEXICO", "EUA", "CANADA", "CUBA", "HAITI", "JAMAICA", "PANAMA", "COSTARICA",
        "ESPANHA", "PORTUGAL", "FRANCA", "ITALIA", "ALEMANHA", "INGLATERRA", "IRLANDA", "ESCOCIA", "HOLANDA", "BELGICA",
        "SUICA", "AUSTRIA", "POLONIA", "GRECIA", "TURQUIA", "RUSSIA", "UCRANIA", "SUECIA", "NORUEGA", "DINAMARCA",
        "CHINA", "JAPAO", "COREIA", "INDIA", "INDONESIA", "TAILANDIA", "VIETNA", "FILIPINAS", "MALASIA", "SINGAPURA",
        "AUSTRALIA", "NOVAZELANDIA", "FIJI", "SAMOA", "TONGA", "TAITI", "HAVAI", "GUAM", "PALAU", "NAURU",
        "EGITO", "AFRICA", "ANGOLA", "MOCAMBIQUE", "NIGERIA", "GANA", "SENEGAL", "MARROCOS", "ARGELIA", "TUNISIA",
        "ISRAEL", "IRAQUE", "IRA", "SIRIA", "LIBANO", "JORDAO", "ARABIA", "QATAR", "EMIRADOS", "OMAN"
    ],
    tecnologia: [
        "COMPUTADOR", "NOTEBOOK", "TABLET", "CELULAR", "SMARTPHONE", "RELOGIO", "CAMERA", "DRONE", "ROBO", "CONSOLE",
        "INTERNET", "WIFI", "BLUETOOTH", "DADOS", "NUVEM", "SERVIDOR", "REDE", "FIBRA", "SATELITE", "ANTENA",
        "SOFTWARE", "HARDWARE", "SISTEMA", "PROGRAMA", "APLICATIVO", "JOGO", "SITE", "BLOG", "EMAIL", "CHAT",
        "MOUSE", "TECLADO", "MONITOR", "TELA", "IMPRESSORA", "SCANNER", "WEBCAM", "FONE", "MICROFONE", "CAIXA",
        "PROCESSADOR", "MEMORIA", "DISCO", "HD", "SSD", "PENDRIVE", "CARTAO", "CABO", "BATERIA", "FONTE",
        "CODIGO", "ALGORITMO", "LOGICA", "DADOS", "BANCO", "SEGURANCA", "VIRUS", "ANTIVIRUS", "FIREWALL", "HACKER",
        "INOVACAO", "FUTURO", "VIRTUAL", "AUMENTADA", "INTELIGENCIA", "ARTIFICIAL", "MACHINE", "LEARNING", "BIGDATA", "ANALYTICS"
    ],
    natureza: [
        "ARVORE", "FLOR", "FOLHA", "RAIZ", "TRONCO", "GALHO", "FRUTO", "SEMENTE", "GRAMA", "MATO",
        "FLORESTA", "MATA", "SELVA", "BOSQUE", "CERRADO", "CAATINGA", "PAMPA", "PANTANAL", "AMAZONIA", "ATLANTICA",
        "RIO", "LAGO", "LAGOA", "MAR", "OCEANO", "CACHOEIRA", "CASCATA", "RIUNCHO", "CORREGO", "NASCENTE",
        "MONTANHA", "MORRO", "COLINA", "SERRA", "VALE", "PLANICIE", "PLANALTO", "DEPRESSAO", "CANYON", "ABISMO",
        "SOL", "LUA", "ESTRELA", "CEU", "NUVEM", "CHUVA", "RAIO", "TROVAO", "VENTO", "AR",
        "FOGO", "TERRA", "AGUA", "GELO", "NEVE", "GRANIZO", "ORVALHO", "NEBLINA", "VAPOR", "FUMACA",
        "PEDRA", "ROCHA", "AREIA", "BARRO", "LAMA", "POEIRA", "CASCALHO", "ARGILA", "MINERIO", "OURO"
    ],
    cores: [
        "AZUL", "AMARELO", "VERMELHO", "VERDE", "LARANJA", "ROXO", "LILAS", "ROSA", "MARROM", "PRETO",
        "BRANCO", "CINZA", "PRATA", "DOURADO", "BEGE", "CREME", "VINHO", "TURQUESA", "CIANO", "MAGENTA",
        "VIOLETA", "INDIGO", "OCRE", "SALMAO", "CORAL", "RUBI", "ESMERALDA", "SAFIRA", "AMETISTA", "TOPAZIO",
        "JADE", "AMBAR", "BRONZE", "COBRE", "CHUMBO", "GRAFITE", "GELO", "MARFIM", "PEROLA", "NEON"
    ]
};

export const getOfflineWords = (theme: string, count: number): string[] => {
    const normalizedTheme = theme.toLowerCase();
    let availableWords = wordLists[normalizedTheme];
    
    if (!availableWords) {
        // Fallback to random mix if theme not found
        availableWords = Object.values(wordLists).flat();
    }
    
    // Shuffle and slice
    const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// --- Quiz Data ---

// Helper for Math generation
const generateMathQuestion = (difficulty: Difficulty): Question => {
    const operators = difficulty === 'facil' ? ['+', '-'] : difficulty === 'medio' ? ['*', '/'] : ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let a, b, result;
    
    if (operator === '+') {
        a = Math.floor(Math.random() * (difficulty === 'facil' ? 50 : 200)) + 1;
        b = Math.floor(Math.random() * (difficulty === 'facil' ? 50 : 200)) + 1;
        result = a + b;
    } else if (operator === '-') {
        a = Math.floor(Math.random() * (difficulty === 'facil' ? 50 : 200)) + 10;
        b = Math.floor(Math.random() * a); // Ensure positive result
        result = a - b;
    } else if (operator === '*') {
        a = Math.floor(Math.random() * (difficulty === 'medio' ? 12 : 20)) + 2;
        b = Math.floor(Math.random() * (difficulty === 'medio' ? 12 : 20)) + 2;
        result = a * b;
    } else { // '/'
        b = Math.floor(Math.random() * (difficulty === 'medio' ? 10 : 15)) + 2;
        result = Math.floor(Math.random() * (difficulty === 'medio' ? 10 : 15)) + 2;
        a = b * result; // Ensure clean division
    }

    // Generate distractors
    const distractors = new Set<number>();
    while (distractors.size < 3) {
        let offset = Math.floor(Math.random() * 10) - 5; // -5 to +4
        if (offset === 0) offset = 1;
        const wrong = result + offset;
        if (wrong > 0 && wrong !== result) {
            distractors.add(wrong);
        }
    }

    const options = [result.toString(), ...Array.from(distractors).map(String)];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    const opSymbol = operator === '*' ? 'x' : operator === '/' ? '÷' : operator;

    return {
        pergunta: `Quanto é ${a} ${opSymbol} ${b}?`,
        opcoes: options,
        resposta: options.indexOf(result.toString())
    };
};

// Geography Generator (Capitals)
const countries = [
    { c: "Brasil", k: "Brasília" }, { c: "Argentina", k: "Buenos Aires" }, { c: "Uruguai", k: "Montevidéu" },
    { c: "Chile", k: "Santiago" }, { c: "Colômbia", k: "Bogotá" }, { c: "Peru", k: "Lima" },
    { c: "Estados Unidos", k: "Washington D.C." }, { c: "Canadá", k: "Ottawa" }, { c: "México", k: "Cidade do México" },
    { c: "França", k: "Paris" }, { c: "Alemanha", k: "Berlim" }, { c: "Itália", k: "Roma" },
    { c: "Espanha", k: "Madri" }, { c: "Portugal", k: "Lisboa" }, { c: "Reino Unido", k: "Londres" },
    { c: "Japão", k: "Tóquio" }, { c: "China", k: "Pequim" }, { c: "Índia", k: "Nova Delhi" },
    { c: "Rússia", k: "Moscou" }, { c: "Egito", k: "Cairo" }, { c: "Austrália", k: "Camberra" }
];

const generateGeoQuestion = (): Question => {
    const target = countries[Math.floor(Math.random() * countries.length)];
    const distractors = new Set<string>();
    while (distractors.size < 3) {
        const d = countries[Math.floor(Math.random() * countries.length)];
        if (d.k !== target.k) distractors.add(d.k);
    }
    
    const options = [target.k, ...Array.from(distractors)];
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return {
        pergunta: `Qual é a capital de ${target.c}?`,
        opcoes: options,
        resposta: options.indexOf(target.k)
    };
};

// Static Questions for other categories (Subset for fallback)
const staticQuestions: Record<string, Question[]> = {
    ciencia: [
        { pergunta: "Qual é o planeta mais próximo do Sol?", opcoes: ["Vênus", "Terra", "Mercúrio", "Marte"], resposta: 2 },
        { pergunta: "Qual é a fórmula química da água?", opcoes: ["CO2", "H2O", "O2", "NaCl"], resposta: 1 },
        { pergunta: "Quantos ossos tem o corpo humano adulto?", opcoes: ["206", "200", "210", "215"], resposta: 0 },
        { pergunta: "Qual é o maior órgão do corpo humano?", opcoes: ["Fígado", "Coração", "Pele", "Pulmão"], resposta: 2 },
        { pergunta: "O que as plantas usam para fazer fotossíntese?", opcoes: ["Oxigênio", "Luz solar", "Nitrogênio", "Glicose"], resposta: 1 },
        { pergunta: "Qual é o animal mais rápido do mundo?", opcoes: ["Guepardo", "Leão", "Águia", "Cavalo"], resposta: 0 },
        { pergunta: "Qual gás é essencial para a respiração humana?", opcoes: ["Hélio", "Oxigênio", "Carbono", "Nitrogênio"], resposta: 1 },
        { pergunta: "Qual é o centro do sistema solar?", opcoes: ["Terra", "Lua", "Sol", "Marte"], resposta: 2 },
    ],
    historia: [
        { pergunta: "Quem descobriu o Brasil?", opcoes: ["Pedro Álvares Cabral", "Cristóvão Colombo", "Vasco da Gama", "Dom Pedro I"], resposta: 0 },
        { pergunta: "Em que ano o homem pisou na Lua?", opcoes: ["1960", "1969", "1975", "1958"], resposta: 1 },
        { pergunta: "Quem foi o primeiro presidente do Brasil?", opcoes: ["Getúlio Vargas", "Deodoro da Fonseca", "Juscelino Kubitschek", "Dom Pedro II"], resposta: 1 },
        { pergunta: "Em que ano começou a Segunda Guerra Mundial?", opcoes: ["1914", "1939", "1945", "1940"], resposta: 1 },
        { pergunta: "Qual era o nome do navio famoso que afundou em 1912?", opcoes: ["Titanic", "Britannic", "Olympic", "Carpathia"], resposta: 0 },
        { pergunta: "Quem pintou a Mona Lisa?", opcoes: ["Michelangelo", "Van Gogh", "Leonardo da Vinci", "Picasso"], resposta: 2 },
        { pergunta: "Qual civilização construiu as pirâmides?", opcoes: ["Romanos", "Gregos", "Egípcios", "Maias"], resposta: 2 },
    ],
    entretenimento: [
        { pergunta: "Quem é o criador do Mickey Mouse?", opcoes: ["Walt Disney", "Stan Lee", "Steven Spielberg", "George Lucas"], resposta: 0 },
        { pergunta: "Qual super-herói é conhecido como o Homem de Ferro?", opcoes: ["Tony Stark", "Bruce Wayne", "Clark Kent", "Peter Parker"], resposta: 0 },
        { pergunta: "Em que filme encontramos o personagem Nemo?", opcoes: ["Toy Story", "Procurando Nemo", "Carros", "Monstros S.A."], resposta: 1 },
        { pergunta: "Qual banda inglesa é famosa pela música 'Hey Jude'?", opcoes: ["Rolling Stones", "The Beatles", "Queen", "Pink Floyd"], resposta: 1 },
        { pergunta: "Quem escreveu 'Harry Potter'?", opcoes: ["J.R.R. Tolkien", "J.K. Rowling", "George R.R. Martin", "Stephen King"], resposta: 1 },
        { pergunta: "Qual é a série mais assistida da Netflix?", opcoes: ["Stranger Things", "Round 6", "Bridgerton", "The Crown"], resposta: 1 },
    ],
    ingles: [
        { pergunta: "Como se diz 'Vermelho' em inglês?", opcoes: ["Blue", "Red", "Green", "Yellow"], resposta: 1 },
        { pergunta: "O que significa 'Dog'?", opcoes: ["Gato", "Cachorro", "Pássaro", "Peixe"], resposta: 1 },
        { pergunta: "Qual é o passado do verbo 'Go'?", opcoes: ["Gone", "Went", "Going", "Goed"], resposta: 1 },
        { pergunta: "Como se escreve 'Maçã' em inglês?", opcoes: ["Banana", "Orange", "Apple", "Grape"], resposta: 2 },
        { pergunta: "O que significa 'Book'?", opcoes: ["Mesa", "Cadeira", "Livro", "Caneta"], resposta: 2 },
        { pergunta: "Como se diz 'Obrigado'?", opcoes: ["Please", "Sorry", "Hello", "Thank you"], resposta: 3 },
    ],
    conhecimentos_gerais: [
        { pergunta: "Quantos dias tem um ano bissexto?", opcoes: ["364", "365", "366", "367"], resposta: 2 },
        { pergunta: "Qual é a moeda do Japão?", opcoes: ["Dólar", "Euro", "Iene", "Won"], resposta: 2 },
        { pergunta: "Quantos continentes existem?", opcoes: ["5", "6", "7", "8"], resposta: 2 }, // Considerando modelo de 7 ou 6, ajustável
        { pergunta: "Qual é a cor da mistura de azul e amarelo?", opcoes: ["Roxo", "Laranja", "Verde", "Marrom"], resposta: 2 },
        { pergunta: "Quantas letras tem o alfabeto?", opcoes: ["24", "25", "26", "27"], resposta: 2 },
    ]
};

export const getFallbackQuestions = (theme: Theme, difficulty: Difficulty): Question[] => {
    if (theme === 'matematica') {
        return Array.from({ length: 10 }, () => generateMathQuestion(difficulty));
    }
    
    if (theme === 'geografia') {
        return Array.from({ length: 10 }, () => generateGeoQuestion());
    }

    // Normalize theme key
    const key = theme.replace('-', '_');
    let pool = staticQuestions[key];
    
    if (!pool) {
        // If specific theme pool missing, mix all static
        pool = Object.values(staticQuestions).flat();
    }

    // Shuffle and return 10
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
};
