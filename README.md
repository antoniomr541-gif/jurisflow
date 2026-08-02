# PedidoFlow 2.0 — Cadastro obrigatório na primeira compra

## Mudanças
- o cliente precisa criar conta antes do primeiro pedido;
- login visível por celular + senha;
- e-mail interno usa domínio válido;
- nome, WhatsApp e endereço ficam salvos no Supabase;
- carrinho permanece salvo enquanto o cliente cria a conta;
- após entrar, o checkout é preenchido automaticamente;
- conta do cliente mostra o endereço salvo;
- pedidos continuam sendo gravados no painel do dono.

## Instalação
1. Execute novamente `instalar-pedidoflow.sql` no SQL Editor.
2. Em Authentication > Providers > Email, desative `Confirm email`.
3. Substitua no GitHub:
   - index.html
   - login.html
   - conta.html
   - styles.css
4. Faça commit e aguarde o deploy.

## Teste
1. Abra o site em janela anônima.
2. Adicione produtos.
3. Clique em finalizar.
4. O sistema enviará para o cadastro.
5. Crie a conta e volte ao cardápio.
6. Os dados e o carrinho devem continuar preenchidos.
