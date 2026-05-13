# 💼 JJ Tech - Sistema de Orçamentos e Gestão B2B

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

Uma aplicação web desenvolvida para facilitar a criação de orçamentos e a gestão de catálogos de produtos de fornecedores. O sistema possui uma interface moderna para o uso diário e gera um layout de impressão otimizado, nos padrões de sistemas ERP profissionais.

## 🎯 Objetivo do Projeto
Este projeto foi construído para resolver um problema real de gestão de peças e orçamentos, garantindo cálculos automáticos e a padronização na entrega das propostas para os clientes finais.

## ✨ Funcionalidades

* **Gestão de Catálogo (CRUD):** Cadastro, edição, listagem e exclusão de produtos e materiais, vinculando fornecedores, custo e valor de venda bruto.
* **Ponto de Venda (PDV) / Orçamento:** * Busca dinâmica de produtos no catálogo.
  * Gerenciamento de carrinho de compras com cálculos automáticos em tempo real.
  * Inserção de dados completos do cliente (Nome, CNPJ/CPF, Endereço, etc.).
* **Cálculos Financeiros:** Aplicação de descontos percentuais, acréscimos e cálculo de frete, gerando o total líquido instantaneamente.
* **Persistência de Dados:** Uso do `localStorage` do navegador para garantir que os dados do catálogo não sejam perdidos ao recarregar a página.
* **Geração de PDF:** Layout exclusivo formatado para impressão (`window.print()`), simulando a saída de um sistema ERP tradicional com campo de assinatura e resumo financeiro.

## 🛠️ Tecnologias Utilizadas

* **Front-end:** React.js
* **Build Tool:** Vite
* **Ícones:** Lucide React
* **Estilização:** CSS3 Vanilla (Foco em responsividade e `@media print` para o layout do PDF)
* **Gerenciamento de Estado:** Hooks do React (`useState`, `useEffect`, `useMemo`)

## 🚀 Como executar o projeto localmente

Siga os passos abaixo para rodar o projeto na sua máquina:

1. Clone este repositório:
```bash
git clone [https://github.com/johnysantos22/jjtech-orcamentos.git](https://github.com/johnysantos22/jjtech-orcamentos.git)
