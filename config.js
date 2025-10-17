// Configurações da aplicação
const CONFIG = {
    // URL da API para operações de banco de dados
    API_URL: "https://script.google.com/macros/s/AKfycbzka9zfxb9UcVz2kVafIWmiYT12YHx0JPb3zPU8jU1PN4BuNzBXeVUe1bMxxqG21b6O0A/exec",

    // Lista inicial de solicitantes
    SOLICITANTES_INICIAIS: [
        "BRUNO GOMES DA SILVA",
        "JOSÉ ADRIANO DE SIQUEIRA ARAÚJO",
        "MANUEL PEREIRA ALENCAR JUNIOR",
        "NEUSVALDO NOVAIS RODRIGUES",
        "RONALDO GONÇALVES DA SILVA",
        "TIAGO FELIPE DOS SANTOS COELHO",
        "DENILSON DE SOUZA SANTOS",
        "FELIPE DE LIMA PEREIRA",
        "JOSÉ CARLOS FIGUEIRA DA SILVA",
        "JOSÉ GENILSON MARTINS SOARES",
        "NETANIS DOS SANTOS",
        "THIAGO PACHECO ALMEIDA",
        "ROBERTO CARLOS DA SILVA",
        "WESLEY ALEKSANDER ALCANTI DA SILVA",
        "VALDEMIRO GOMES JUNIOR"
    ],

    // Configurações de autenticação
    AUTH: {
        // Usuários permitidos (em produção, isso deveria estar no backend)
        USERS: {
            "admin": "1234"
        },
        // Tempo de expiração da sessão em minutos
        SESSION_TIMEOUT: 60
    },

    // Configurações de interface
    UI: {
        // Número máximo de notificações exibidas
        MAX_NOTIFICATIONS: 10,
        // Atualizar dados automaticamente a cada X segundos
        AUTO_REFRESH: 30
    }
};

// Exportar configurações para uso global
window.APP_CONFIG = CONFIG;