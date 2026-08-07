# Integrações do JurisFlow V3

## DataJud / CNJ
Implementado em `netlify/functions/datajud.js` e acionado na tela de detalhes do processo. O JurisFlow identifica automaticamente TJ/TRT/TRF pelo padrão do número CNJ e importa metadados/movimentações públicas para a linha do tempo.

## Supabase
Implementado para autenticação, banco, RLS e documentos privados. A configuração está em `assets/js/config.js`, o banco em `supabase/schema.sql` e a criação segura de usuário-cliente em `netlify/functions/create-client-user.js`.

## Meu INSS
O JurisFlow já possui módulo administrativo próprio para NB, protocolo, DER, benefício, status e exigências. Não há automação de login Gov.br nesta versão. `external_data` foi reservado no banco para receber dados de uma futura API/conector oficialmente autorizado.

## Próximos conectores possíveis
A arquitetura permite adicionar novos adaptadores server-side (tribunais/fornecedores jurídicos, assinatura eletrônica, e-mail/WhatsApp, cobrança) sem expor credenciais no navegador.
