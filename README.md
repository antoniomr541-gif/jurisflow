# JurisFlow V3 — Supabase + DataJud + Portal do Cliente

Esta versão deixa de ser apenas uma demonstração local e já contém a arquitetura para uso real em escritório.

## Incluído
- Login de advogado e cliente com Supabase Auth.
- Isolamento por escritório (firm_id) e RLS.
- Clientes, processos, agenda e notificações em banco Supabase.
- Portal individual do cliente: o cliente só lê os próprios processos/documentos/notificações.
- Criação de acesso de cliente pelo advogado via Netlify Function segura.
- Sincronização de processo judicial público com DataJud/CNJ.
- Área administrativa INSS: NB, protocolo, DER, benefício, status, exigências e observações.
- Documentos em Supabase Storage PRIVADO com link temporário de 60 segundos.
- Modo demonstração sem configuração para apresentação comercial.
- Layout responsivo para celular.

## Configuração em 4 passos
1. Crie um projeto Supabase e rode `supabase/schema.sql` no SQL Editor.
2. Em `assets/js/config.js`, informe `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
3. No Netlify > Site configuration > Environment variables, adicione:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (NUNCA coloque esta no navegador)
   - `DATAJUD_API_KEY` (opcional; se ausente, a função usa a chave pública de fallback presente no MVP)
4. Faça deploy desta pasta/ZIP no Netlify.

## Primeiro acesso
Na tela inicial, use “Primeiro acesso do escritório” para criar o advogado. Depois entre e cadastre clientes. Ao marcar “Criar acesso ao portal”, defina uma senha temporária para o cliente.

## INSS
A área de INSS desta versão controla o processo administrativo dentro do escritório, mas não faz login automatizado no Meu INSS/Gov.br. O conector externo está preparado em estrutura (`external_data`) para futura API oficialmente autorizada. Ações judiciais previdenciárias podem usar DataJud como os demais processos.

## Segurança
O arquivo `supabase/schema.sql` ativa RLS. O service role fica apenas em função server-side do Netlify. Documentos usam bucket privado e URLs assinadas temporárias.

## Observação de produção
Antes de vender como serviço, recomenda-se configurar domínio próprio, política de privacidade/LGPD, backup, logs/auditoria, recuperação de senha e provedor de e-mail transacional.
