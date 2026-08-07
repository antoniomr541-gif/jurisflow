# Checklist rápido de publicação

## Supabase
- [ ] Criar projeto.
- [ ] Executar `supabase/schema.sql`.
- [ ] Copiar Project URL e anon public key para `assets/js/config.js`.
- [ ] Em Authentication > URL Configuration, cadastrar a URL publicada no Netlify.

## Netlify
- [ ] Publicar a pasta/ZIP.
- [ ] Configurar `SUPABASE_URL`.
- [ ] Configurar `SUPABASE_ANON_KEY`.
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Opcional: configurar `DATAJUD_API_KEY`.

## Teste
- [ ] Criar primeiro advogado.
- [ ] Cadastrar cliente e gerar acesso de cliente.
- [ ] Cadastrar um número CNJ real e testar “Sincronizar com DataJud”.
- [ ] Abrir aba anônima, entrar como cliente e confirmar que ele só vê os próprios dados.
- [ ] Enviar documento e testar o link temporário.
