# Flow Pedidos 2.3

Versão completa e responsiva do sistema de pedidos.

## Recursos incluídos
- cardápio público responsivo;
- busca e categorias;
- carrinho e observações por item;
- cadastro obrigatório antes do primeiro pedido;
- cadastro sem e-mail, usando celular e senha;
- aceite obrigatório dos termos;
- autorização de promoções destacada;
- dados e endereço salvos para próximos pedidos;
- histórico na área do cliente;
- pedido salvo no Supabase antes de abrir o WhatsApp;
- painel do dono com dashboard, pedidos, produtos e clientes;
- alteração de status dos pedidos;
- central de marketing com mensagem e banner;
- exportação CSV dos clientes autorizados;
- layout otimizado para celular, tablet e computador.

## Instalação
1. Abra o Supabase e acesse **SQL Editor > New query**.
2. Execute todo o arquivo `instalar-cliente-sem-email.sql`.
3. No Supabase Authentication, crie a conta do dono.
4. Publique todos os arquivos desta pasta no GitHub, Netlify ou Vercel.
5. Acesse `dono.html` para entrar no painel administrativo.

## Páginas
- `index.html`: cardápio;
- `login.html`: cadastro e entrada do cliente;
- `conta.html`: conta e histórico do cliente;
- `dono.html`: login do dono;
- `admin.html`: painel administrativo.

## Marketing no WhatsApp
O sistema gera a mensagem e exporta um CSV apenas com clientes que aceitaram receber promoções. O disparo automático para todos exige integração oficial com a Plataforma WhatsApp Business.
