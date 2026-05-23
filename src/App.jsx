import React, { useState, useEffect } from 'react';
import { Truck, ShoppingCart, Printer, Search, Plus, Trash2, Edit3, Save, DollarSign, User, SearchX, Send, Share2 } from 'lucide-react';
import './App.css';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('pdv');

  const [catalogo, setCatalogo] = useState(() => {
    const salvo = localStorage.getItem('jjtech_fornecedores');
    return salvo ? JSON.parse(salvo) : [
      { id: 1, codigo: '1433', descricao: 'CABO PP 4X 1,0MM2 METRO COBRECOM', fornecedor: 'COBRECOM', custo: 2.50, venda: 5.02, un: 'MT' },
      { id: 2, codigo: '2766', descricao: 'DISJUNTOR STECK BIPOL.DIM 20A CURVA C', fornecedor: 'STECK', custo: 18.00, venda: 37.90, un: 'PC' },
      { id: 3, codigo: '14194', descricao: 'WEG CONTATOR MINI CWC0121030V26', fornecedor: 'WEG', custo: 80.00, venda: 138.03, un: 'UN' }
    ];
  });

  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState('');
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formProduto, setFormProduto] = useState({ codigo: '', descricao: '', fornecedor: '', custo: '', venda: '', un: '' });

  const [cliente, setCliente] = useState({
    nome: 'CONSUMIDOR FINAL 1', endereco: '', bairro: '',
    cidade: 'NATAL', estado: 'RN', cep: '', celular: '', fone1: '', fone2: '',
    cnpjCpf: '', inscricao: 'ISENTO', rg: '', email: ''
  });

  const [financas, setFinancas] = useState({ descontoPct: 0, frete: 0, acrescimoGeral: 0 });

  useEffect(() => {
    localStorage.setItem('jjtech_fornecedores', JSON.stringify(catalogo));
  }, [catalogo]);

  const formatarMoeda = (valor) => parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const produtosFiltrados = catalogo.filter(p =>
    p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.id === produto.id);
    if (itemExistente) {
      setCarrinho(carrinho.map(item => item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item));
    } else {
      setCarrinho([...carrinho, { ...produto, qtd: 1 }]);
    }
  };

  const removerDoCarrinho = (id) => setCarrinho(carrinho.filter(item => item.id !== id));
  const atualizarQtd = (id, qtd) => {
    if (qtd <= 0) return removerDoCarrinho(id);
    setCarrinho(carrinho.map(item => item.id === id ? { ...item, qtd: parseFloat(qtd) } : item));
  };

  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  const totalBruto = carrinho.reduce((acc, item) => acc + (item.venda * item.qtd), 0);
  const descontoPercentual = parseFloat(financas.descontoPct) || 0;
  const valorDescontoGeral = totalBruto * (descontoPercentual / 100);
  const subtotalLiquido = totalBruto - valorDescontoGeral;
  const valorFrete = parseFloat(financas.frete) || 0;
  const valorAcrescimoGeral = parseFloat(financas.acrescimoGeral) || 0;
  const totalLiquido = subtotalLiquido + valorFrete + valorAcrescimoGeral;

  const salvarProduto = () => {
    if (!formProduto.codigo || !formProduto.descricao) return alert("Preencha o código e a descrição.");
    if (produtoEditando) {
      setCatalogo(catalogo.map(p => p.id === produtoEditando.id ? { ...formProduto, id: p.id } : p));
      setProdutoEditando(null);
    } else {
      setCatalogo([...catalogo, { ...formProduto, id: Date.now() }]);
    }
    setFormProduto({ codigo: '', descricao: '', fornecedor: '', custo: '', venda: '', un: '' });
  };
  const iniciarEdicao = (produto) => { setProdutoEditando(produto); setFormProduto(produto); };

  const enviarWhatsApp = () => {
    if (!cliente.celular) {
      alert("Por favor, preencha o número do Celular do cliente para enviar o orçamento.");
      return;
    }

    // Pega apenas os números do telefone digitado
    const numero = cliente.celular.replace(/\D/g, '');
    if (numero.length < 10) {
      alert("Por favor, insira um número de celular válido com DDD (Ex: 84999999999).");
      return;
    }

    let texto = `*ORÇAMENTO - JJ TECH SISTEMAS*\n\n`;
    texto += `Olá, *${cliente.nome}*!\nSegue o resumo do seu orçamento:\n\n`;

    carrinho.forEach(item => {
      const unitLiquido = item.venda * (1 - (descontoPercentual / 100));
      const totalLinha = item.qtd * unitLiquido;
      texto += `▪ ${item.qtd}x ${item.descricao} - R$ ${formatarMoeda(totalLinha)}\n`;
    });

    texto += `\n*Subtotal:* R$ ${formatarMoeda(subtotalLiquido)}`;
    if (valorFrete > 0) texto += `\n*Frete:* R$ ${formatarMoeda(valorFrete)}`;
    if (valorDescontoGeral > 0) texto += `\n*Desconto:* R$ ${formatarMoeda(valorDescontoGeral)}`;
    if (valorAcrescimoGeral > 0) texto += `\n*Acréscimo:* R$ ${formatarMoeda(valorAcrescimoGeral)}`;
    texto += `\n\n*TOTAL:* *R$ ${formatarMoeda(totalLiquido)}*`;
    texto += `\n\nValidade: ${formatarData(new Date(Date.now() + 86400000))}`;

    const url = `https://api.whatsapp.com/send?phone=55${numero}&text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const compartilharPDF = async () => {
    if (!cliente.celular) {
      alert("Por favor, preencha o número do Celular do cliente para gerar o arquivo.");
      return;
    }

    const gerar = async () => {
      const elementoOriginal = document.getElementById('orcamento-pdf');

      // 1. Cria um clone exato do orçamento
      const clone = elementoOriginal.cloneNode(true);

      // 2. Garante que o clone fique com design de folha A4 branca
      clone.style.display = 'block';
      clone.style.width = '794px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.padding = '20px';

      // 3. Cria o container "Fantasma" e esconde atrás de toda a tela
      const ghostContainer = document.createElement('div');
      // absolute corrige o bug de tela branca ao rolar a página em celulares
      ghostContainer.style.position = 'absolute';
      ghostContainer.style.top = '0';
      ghostContainer.style.left = '0';
      ghostContainer.style.zIndex = '-9999';
      ghostContainer.style.pointerEvents = 'none';

      ghostContainer.appendChild(clone);
      document.body.appendChild(ghostContainer);

      // 4. Aguardamos 300ms (tempo pro navegador ser obrigado a carregar todos os textos no fantasma)
      await new Promise(resolve => setTimeout(resolve, 300));

      const opt = {
        margin: 5,
        filename: `Orcamento_${cliente.nome.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          windowWidth: 900, // Força a largura de PC no celular para não cortar
          scrollY: 0 // Força a captura no topo da página
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
        const pdfBlob = await window.html2pdf().set(opt).from(clone).output('blob');
        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Orçamento JJ Tech',
            text: `Olá ${cliente.nome}, segue o seu orçamento em anexo.`,
            files: [file]
          });
        } else {
          alert("O compartilhamento nativo não é suportado no seu dispositivo. O arquivo será baixado.");
          await window.html2pdf().set(opt).from(clone).save();
        }
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro ao processar o arquivo PDF.");
      } finally {
        // Remove o fantasma de trás da tela para não gastar memória
        document.body.removeChild(ghostContainer);
      }
    };

    // Carrega a biblioteca de conversão de PDF apenas quando necessário
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = gerar;
      document.body.appendChild(script);
    } else {
      gerar();
    }
  };

  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const formatarData = (data) => data.toLocaleDateString('pt-BR');

  return (
    <div className="dashboard-container">
      <nav className="topbar no-print">
        <div className="logo">
          <h2>JJ TECH <span>PRO</span></h2>
          <p>Gestão B2B e Orçamentos</p>
        </div>
        <div className="nav-buttons">
          <button className={abaAtiva === 'pdv' ? 'active' : ''} onClick={() => setAbaAtiva('pdv')}>
            <ShoppingCart size={18} /> Orçamento
          </button>
          <button className={abaAtiva === 'catalogo' ? 'active' : ''} onClick={() => setAbaAtiva('catalogo')}>
            <Truck size={18} /> Fornecedores
          </button>
        </div>
      </nav>

      {abaAtiva === 'pdv' && (
        <div className="pdv-layout no-print">
          <div className="pdv-main">

            <div className="cliente-card">
              <h3><User size={18} /> Dados do Cliente para o Orçamento</h3>
              <div className="cliente-grid">
                <input className="col-span-2" placeholder="Nome ou Razão Social" value={cliente.nome} onChange={e => setCliente({ ...cliente, nome: e.target.value.toUpperCase() })} />
                <input placeholder="CNPJ / CPF" value={cliente.cnpjCpf} onChange={e => setCliente({ ...cliente, cnpjCpf: e.target.value })} />
                <input placeholder="Insc. Estadual" value={cliente.inscricao} onChange={e => setCliente({ ...cliente, inscricao: e.target.value.toUpperCase() })} />

                <input className="col-span-2" placeholder="Endereço" value={cliente.endereco} onChange={e => setCliente({ ...cliente, endereco: e.target.value.toUpperCase() })} />
                <input placeholder="Bairro" value={cliente.bairro} onChange={e => setCliente({ ...cliente, bairro: e.target.value.toUpperCase() })} />
                <input placeholder="CEP" value={cliente.cep} onChange={e => setCliente({ ...cliente, cep: e.target.value })} />

                <input placeholder="Cidade" value={cliente.cidade} onChange={e => setCliente({ ...cliente, cidade: e.target.value.toUpperCase() })} />
                <input placeholder="Estado (UF)" value={cliente.estado} onChange={e => setCliente({ ...cliente, estado: e.target.value.toUpperCase() })} />
                <input placeholder="RG" value={cliente.rg} onChange={e => setCliente({ ...cliente, rg: e.target.value.toUpperCase() })} />
                <input placeholder="E-mail" value={cliente.email} onChange={e => setCliente({ ...cliente, email: e.target.value.toLowerCase() })} />

                <input placeholder="Celular" value={cliente.celular} onChange={e => setCliente({ ...cliente, celular: e.target.value })} />
                <input placeholder="Fone 1" value={cliente.fone1} onChange={e => setCliente({ ...cliente, fone1: e.target.value })} />
                <input placeholder="Fone 2" value={cliente.fone2} onChange={e => setCliente({ ...cliente, fone2: e.target.value })} />
              </div>
            </div>

            <div className="search-box">
              <Search className="search-icon" size={24} />
              <input type="text" placeholder="Pesquisar material..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>

            {produtosFiltrados.length === 0 ? (
              <div className="empty-search">
                <SearchX size={48} color="#cbd5e1" />
                <h3>Nenhum material encontrado</h3>
                <p>A pesquisa por "{busca}" não retornou resultados no catálogo.</p>
                <button className="btn-secondary" onClick={() => setAbaAtiva('catalogo')}>
                  <Plus size={18} /> Cadastrar Nova Peça
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {produtosFiltrados.map(p => (
                  <div key={p.id} className="product-card">
                    <div className="product-info">
                      <span className="prod-cod">{p.codigo}</span>
                      <h4>{p.descricao}</h4>
                      <p className="prod-price">R$ {formatarMoeda(p.venda)}</p>
                    </div>
                    <button className="btn-add" onClick={() => adicionarAoCarrinho(p)}><Plus size={24} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pdv-sidebar">
            <div className="cart-header">
              <h3>Carrinho</h3>
              <span>{carrinho.length} itens</span>
            </div>

            <div className="cart-items">
              {carrinho.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-desc"><strong>{item.codigo}</strong> - {item.descricao}</div>
                  <div className="cart-item-actions">
                    <input type="number" value={item.qtd} onChange={(e) => atualizarQtd(item.id, e.target.value)} step="1" />
                    <span className="item-total">R$ {formatarMoeda(item.qtd * item.venda)}</span>
                    {/* AQUI ESTÁ O ÍCONE DE LIXO VERMELHO DO CARRINHO */}
                    <button onClick={() => removerDoCarrinho(item.id)} className="btn-remove-cart">
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="finance-box">
              <div className="finance-input">
                <label>Desconto Geral (%)</label>
                <input type="number" value={financas.descontoPct} onChange={e => setFinancas({ ...financas, descontoPct: e.target.value })} />
              </div>
              <div className="finance-input">
                <label>Frete (R$)</label>
                <input type="number" value={financas.frete} onChange={e => setFinancas({ ...financas, frete: e.target.value })} />
              </div>
              <div className="finance-input">
                <label>Acréscimo (R$)</label>
                <input type="number" value={financas.acrescimoGeral} onChange={e => setFinancas({ ...financas, acrescimoGeral: e.target.value })} />
              </div>
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total Estimado:</span>
                <h2>R$ {formatarMoeda(totalLiquido)}</h2>
              </div>
              <div className="cart-actions">
                <button className="btn-print-huge" onClick={() => window.print()} disabled={carrinho.length === 0} title="Imprimir ou Salvar PDF">
                  <Printer size={20} /> IMPRIMIR
                </button>
                <button className="btn-whatsapp" onClick={enviarWhatsApp} disabled={carrinho.length === 0} title="Enviar resumo por WhatsApp">
                  <Send size={20} /> WHATSAPP
                </button>
                <button className="btn-share" onClick={compartilharPDF} disabled={carrinho.length === 0} title="Gerar PDF e Compartilhar">
                  <Share2 size={20} /> PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'catalogo' && (
        <div className="catalogo-layout no-print">
          <div className="form-fornecedor">
            <h3>{produtoEditando ? 'Editar Material' : 'Cadastrar Material do Fornecedor'}</h3>
            <div className="form-grid">
              <input type="text" placeholder="Código" value={formProduto.codigo} onChange={e => setFormProduto({ ...formProduto, codigo: e.target.value.toUpperCase() })} />
              <input type="text" placeholder="Descrição do Material" value={formProduto.descricao} onChange={e => setFormProduto({ ...formProduto, descricao: e.target.value.toUpperCase() })} />
              <input type="text" placeholder="Nome do Fornecedor" value={formProduto.fornecedor} onChange={e => setFormProduto({ ...formProduto, fornecedor: e.target.value.toUpperCase() })} />
              <input type="text" placeholder="UN" value={formProduto.un} onChange={e => setFormProduto({ ...formProduto, un: e.target.value.toUpperCase() })} style={{ width: '80px' }} />

              <div className="price-inputs">
                <div className="input-icon"><DollarSign size={16} color="#e74a3b" /><input type="number" placeholder="Custo Pago" value={formProduto.custo} onChange={e => setFormProduto({ ...formProduto, custo: parseFloat(e.target.value) || '' })} /></div>
                <div className="input-icon"><DollarSign size={16} color="#1cc88a" /><input type="number" placeholder="Venda Bruta" value={formProduto.venda} onChange={e => setFormProduto({ ...formProduto, venda: parseFloat(e.target.value) || '' })} /></div>
              </div>
              <button className="btn-save" onClick={salvarProduto}><Save size={18} /> Salvar</button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr><th>Código</th><th>Descrição</th><th>Fornecedor</th><th>Custo (R$)</th><th>Venda (R$)</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {catalogo.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.codigo}</strong></td><td>{p.descricao}</td><td><span className="badge-forn">{p.fornecedor}</span></td>
                    <td className="text-danger">{formatarMoeda(p.custo)}</td><td className="text-success"><strong>{formatarMoeda(p.venda)}</strong></td>
                    <td>
                      <button className="btn-edit" onClick={() => iniciarEdicao(p)}><Edit3 size={16} /></button>
                      {/* AQUI ESTÁ O ÍCONE DE LIXO VERMELHO DO CATÁLOGO */}
                      <button className="btn-delete" onClick={() => setCatalogo(catalogo.filter(item => item.id !== p.id))}>
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          PDF
          ========================================================= */}
      <div className="page-erp" id="orcamento-pdf">
        <div className="erp-top-info">
          <span>V. CISS 00</span>
          <span>{formatarData(hoje)} {new Date().toLocaleTimeString('pt-BR')}</span>
        </div>

        <div className="erp-header">
          <div className="erp-company">
            <h1>JJ TECH SISTEMAS</h1>
            <h2>SOLUÇÕES EM ENGENHARIA</h2>
            <p>AV: PRINCIPAL, 1000 - CENTRO</p>
            <p>59000-000 - NATAL - RN</p>
            <p>Fone: (84) 99999-9999</p>
            <p>CNPJ: 00.000.000/0001-00</p>
          </div>
          <div className="erp-meta">
            <p><strong>Orçamento N°:</strong> 1351208</p>
            <p><strong>Vendedor(a):</strong> BALCÃO</p>
            <p><strong>Data:</strong> {formatarData(hoje)}</p>
            <p><strong>Validade:</strong> {formatarData(amanha)}</p>
          </div>
        </div>

        <div className="erp-customer-box">
          <div className="erp-row"><div className="erp-col"><strong>Nome:</strong> <span>{cliente.nome}</span></div></div>
          <div className="erp-row">
            <div className="erp-col" style={{ flex: 2 }}><strong>Endereço:</strong> <span>{cliente.endereco}</span></div>
            <div className="erp-col"><strong>Bairro:</strong> <span>{cliente.bairro}</span></div>
          </div>
          <div className="erp-row">
            <div className="erp-col"><strong>Cidade:</strong> <span>{cliente.cidade}</span></div>
            <div className="erp-col"><strong>Estado:</strong> <span>{cliente.estado}</span></div>
            <div className="erp-col"><strong>CEP:</strong> <span>{cliente.cep}</span></div>
          </div>
          <div className="erp-row">
            <div className="erp-col"><strong>Celular:</strong> <span>{cliente.celular}</span></div>
            <div className="erp-col"><strong>Fone1:</strong> <span>{cliente.fone1}</span></div>
            <div className="erp-col"><strong>Fone2:</strong> <span>{cliente.fone2}</span></div>
          </div>
          <div className="erp-row">
            <div className="erp-col"><strong>CNPJ/CPF:</strong> <span>{cliente.cnpjCpf}</span></div>
            <div className="erp-col"><strong>Inscrição:</strong> <span>{cliente.inscricao}</span></div>
            <div className="erp-col"><strong>RG:</strong> <span>{cliente.rg}</span></div>
          </div>
          <div className="erp-row"><div className="erp-col"><strong>E-mail:</strong> <span>{cliente.email}</span></div></div>
        </div>

        <table className="erp-table">
          <thead>
            <tr>
              <th width="10%">Código</th>
              <th width="45%">Descrição do Produto</th>
              <th width="8%" className="text-right">Quantidade</th>
              <th width="5%">UN</th>
              <th width="10%" className="text-right">Vlr Unit. Bruto</th>
              <th width="10%" className="text-right">Vlr Unit. Líquido</th>
              <th width="12%" className="text-right">Total Líquido</th>
            </tr>
            <tr><td colSpan="7" style={{ paddingTop: '5px' }}><strong>AMBIENTE NÃO DEFINIDO</strong></td></tr>
          </thead>
          <tbody>
            {carrinho.map((item, index) => {
              const unitLiquido = item.venda * (1 - (descontoPercentual / 100));
              const totalLinha = item.qtd * unitLiquido;
              return (
                <tr key={index}>
                  <td>{item.codigo}</td>
                  <td>{item.descricao}</td>
                  <td className="text-right">{item.qtd.toFixed(3).replace('.', ',')}</td>
                  <td>{item.un || 'UN'}</td>
                  <td className="text-right">{formatarMoeda(item.venda)}</td>
                  <td className="text-right">{formatarMoeda(unitLiquido)}</td>
                  <td className="text-right">{formatarMoeda(totalLinha)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="erp-total-items">
          Total de Itens: <strong>{carrinho.length}</strong> | Quantidade Total: <strong>{totalItens.toFixed(3).replace('.', ',')}</strong>
        </div>

        <div className="erp-footer">
          <div className="erp-payment">
            <p><strong>A COMBINAR</strong></p>
            <p>01 - {formatarData(amanha)} - R$ {formatarMoeda(totalLiquido)}</p>
            <div className="erp-signature">
              <p>De Acordo</p>
              <p><strong>{cliente.nome}</strong></p>
            </div>
          </div>

          <div className="erp-summary">
            <div className="summary-row"><span>Subtotal Líquido: R$</span> <span>{formatarMoeda(subtotalLiquido)}</span></div>
            <div className="summary-row"><span>Total Bruto: R$</span> <span>{formatarMoeda(totalBruto)}</span></div>
            <div className="summary-row"><span>Total Frete: R$</span> <span>{formatarMoeda(valorFrete)}</span></div>
            <div className="summary-row"><span>(-) Valor Desconto Item: R$</span> <span>0,00</span></div>
            <div className="summary-row"><span>(-) Valor Desconto Geral ({descontoPercentual.toFixed(2)}%): R$</span> <span>{formatarMoeda(valorDescontoGeral)}</span></div>
            <div className="summary-row"><span>Valor Acréscimo Item: R$</span> <span>0,00</span></div>
            <div className="summary-row"><span>Valor Acréscimo Geral: R$</span> <span>{formatarMoeda(valorAcrescimoGeral)}</span></div>
            <div className="summary-row total-final"><span>Total Líquido: R$</span> <span>{formatarMoeda(totalLiquido)}</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}