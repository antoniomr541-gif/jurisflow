# PedidoFlow 1.0 Comercial

Esta é a versão consolidada para apresentação.

## Arquivos principais
- `index.html` — cardápio e checkout
- `dono.html` — login do dono
- `admin.html` — painel administrativo
- `login.html` — conta opcional do cliente
- `conta.html` — histórico do cliente
- `styles.css` — visual
- `instalar-pedidoflow.sql` — instalação completa do Supabase
- `autorizar-dono.sql` — libera a conta do dono

## Instalação correta

### 1. Banco
No Supabase, abra **SQL Editor → New query**.
Cole todo o conteúdo de `instalar-pedidoflow.sql` e clique em **Run**.

Esse arquivo:
- cria as tabelas;
- cria a função de segurança;
- configura as políticas;
- adiciona produtos fictícios;
- libera upload de imagens;
- ativa pedidos em tempo real.

### 2. Dono
Em **Authentication → Users**, crie a conta do dono.

Abra `autorizar-dono.sql`, troque `EMAIL_DO_DONO` pelo e-mail real e execute no SQL Editor.
O resultado final deve mostrar `role = dono`.

### 3. Site
Envie ao GitHub:
- index.html
- login.html
- conta.html
- dono.html
- admin.html
- styles.css
- README.md

A Vercel atualiza automaticamente.

## Teste obrigatório
1. Abra o cardápio como visitante.
2. Faça um pedido.
3. O WhatsApp só abrirá se o pedido tiver sido salvo.
4. Entre no painel do dono.
5. Abra **Pedidos**.
6. O pedido deve aparecer com cliente, endereço, itens, pagamento e status.

## Links
- Cardápio: `/`
- Cliente: `/login.html`
- Dono: `/dono.html`
- Painel: `/admin.html`
