 import { DadosContrato, Parte } from "@/types/contrato";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getArtigoGenero(parte: Parte): string {
  if (parte.tipo === 'pj') return 'a';
  const feminino = ['solteira', 'casada', 'divorciada', 'viuva'];
  return feminino.includes(parte.estadoCivil) ? 'a' : 'o';
}

function getPronome(parte: Parte): string {
  return getArtigoGenero(parte) === 'a' ? 'a' : 'o';
}

// ─── FUNÇÃO NOVA: limpa a cidade para evitar duplicação BA/BA ───
function limparCidade(cidade: string, estado: string): string {
  const sigla = estado.toUpperCase().trim();
  let c = cidade.trim();
  // Remove padrões como "Itabuna BA", "Itabuna-BA", "Itabuna / BA", "Itabuna/BA" no final
  const regex = new RegExp(`[\\s\\-/]*${sigla}\\s*$`, 'i');
  c = c.replace(regex, '').trim();
  // Remove traço ou barra solta no final
  c = c.replace(/[\/\-]\s*$/, '').trim();
  return c;
}

function formatarEndereco(rua: string, numero: string, complemento: string | undefined, bairro: string, cep: string, cidade: string, estado: string): string {
  const cidadeLimpa = limparCidade(cidade, estado);
  return `${rua}, nº ${numero}${complemento ? `, ${complemento}` : ''}, bairro ${bairro}, CEP ${cep}, ${cidadeLimpa}/${estado}`;
}

function formatarParte(parte: Parte, funcao: 'vendedor' | 'comprador'): string {
  if (parte.tipo === 'pj') {
    const artigo = funcao === 'vendedor' ? 'VENDEDORA' : 'COMPRADORA';
    const enderecoSede = formatarEndereco(
      parte.endereco.rua, parte.endereco.numero, parte.endereco.complemento,
      parte.endereco.bairro, parte.endereco.cep,
      parte.endereco.cidade, parte.endereco.estado
    );
    const enderecoRep = formatarEndereco(
      parte.representante.endereco.rua, parte.representante.endereco.numero, parte.representante.endereco.complemento,
      parte.representante.endereco.bairro, parte.representante.endereco.cep,
      parte.representante.endereco.cidade, parte.representante.endereco.estado
    );
    const generoRep = parte.representante.estadoCivil.includes('a') && !parte.representante.estadoCivil.includes('o') ? 'a' : 'o';
    
    return `${artigo}: ${parte.razaoSocial}, inscrita no CNPJ sob nº ${parte.cnpj}${parte.nire ? `, NIRE nº ${parte.nire}` : ''}, com sede na ${enderecoSede}, neste ato representada por ${parte.representante.nome}, ${parte.representante.nacionalidade}, ${parte.representante.estadoCivil}, ${parte.representante.profissao}, portador${generoRep} da Carteira de Identidade nº ${parte.representante.rg}, CPF nº ${parte.representante.cpf}, residente e domiciliad${generoRep} na ${enderecoRep}.`;
  }
  
  const artigo = funcao === 'vendedor' 
    ? (getArtigoGenero(parte) === 'a' ? 'VENDEDORA' : 'VENDEDOR')
    : (getArtigoGenero(parte) === 'a' ? 'COMPRADORA' : 'COMPRADOR');
  
  const estadoCivilTexto = {
    'solteiro': 'solteiro', 'solteira': 'solteira',
    'casado': 'casado', 'casada': 'casada',
    'uniao_estavel': 'em união estável',
    'divorciado': 'divorciado', 'divorciada': 'divorciada',
    'viuvo': 'viúvo', 'viuva': 'viúva'
  }[parte.estadoCivil];
  
  const endereco = formatarEndereco(
    parte.endereco.rua, parte.endereco.numero, parte.endereco.complemento,
    parte.endereco.bairro, parte.endereco.cep,
    parte.endereco.cidade, parte.endereco.estado
  );
  
  return `${artigo}: ${parte.nome}, ${parte.nacionalidade}, ${estadoCivilTexto}, ${parte.profissao}, Carteira de Identidade nº ${parte.rg}, CPF nº ${parte.cpf}, residente e domiciliad${getArtigoGenero(parte) === 'a' ? 'a' : 'o'} na ${endereco}.`;
}

export function gerarTextoContrato(dados: DadosContrato): string {
  const vendedoresTexto = dados.vendedores.map((v) => formatarParte(v, 'vendedor')).join('<br/><br/>');
  const compradoresTexto = dados.compradores.map((c) => formatarParte(c, 'comprador')).join('<br/><br/>');
  
  const vendedorPronome = dados.vendedores.length === 1 ? getPronome(dados.vendedores[0]) : 'os';
  const compradorPronome = dados.compradores.length === 1 ? getPronome(dados.compradores[0]) : 'os';
  
  const vendedorArtigo = dados.vendedores.length === 1 
    ? (getArtigoGenero(dados.vendedores[0]) === 'a' ? 'a VENDEDORA' : 'o VENDEDOR')
    : 'os VENDEDORES';
  
  const compradorArtigo = dados.compradores.length === 1
    ? (getArtigoGenero(dados.compradores[0]) === 'a' ? 'a COMPRADORA' : 'o COMPRADOR')
    : 'os COMPRADORES';

  const enderecoImovel = formatarEndereco(
    dados.imovel.endereco.rua, dados.imovel.endereco.numero, dados.imovel.endereco.complemento,
    dados.imovel.endereco.bairro, dados.imovel.endereco.cep,
    dados.imovel.endereco.cidade, dados.imovel.endereco.estado
  );

  let texto = `
<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; text-align: justify; margin: 0; padding: 15mm 20mm;">

<h1 style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 30px;">CONTRATO DE COMPRA E VENDA DE IMÓVEL</h1>

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">IDENTIFICAÇÃO DAS PARTES CONTRATANTES</h2>

<p style="margin-bottom: 15px;">${vendedoresTexto}</p>

<p style="margin-bottom: 15px;">${compradoresTexto}</p>

<p style="margin: 20px 0; text-align: justify;"><strong>As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Compra e Venda de Imóvel, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente instrumento, em conformidade com o Art. 26, inciso I, da Lei nº 6.766/79, que exige nome, registro civil, CPF, nacionalidade, estado civil e residência dos contratantes.</strong></p>

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DO OBJETO DO CONTRATO</h2>

<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula 1ª.</strong> O presente contrato tem como OBJETO a venda, realizada entre ${vendedorArtigo.toUpperCase()} e ${compradorArtigo.toUpperCase()}, do imóvel situado na ${enderecoImovel}, possuindo as seguintes descrições, conforme Art. 26, incisos II e III, da Lei nº 6.766/79:</p>

<p style="text-align: justify; margin-bottom: 15px; padding-left: 20px;">
- <strong>Matrícula do imóvel:</strong> ${dados.imovel.matricula}<br/>
- <strong>Cartório de Registro de Imóveis:</strong> ${dados.imovel.cartorioRegistro}<br/>
- <strong>Inscrição Municipal (IPTU):</strong> ${dados.imovel.inscricaoMunicipal}<br/>
- <strong>Área total:</strong> ${dados.imovel.area} m²<br/>
- <strong>Descrição:</strong> ${dados.imovel.descricao}
${dados.imovel.confrontacoes ? `<br/>- <strong>Confrontações:</strong> ${dados.imovel.confrontacoes}` : ''}
</p>

<p style="text-align: justify; margin-bottom: 15px;">O imóvel é de propriedade ${vendedorPronome === 'os' ? 'dos' : 'do'} ${vendedorArtigo.toUpperCase()}, livre de qualquer vício, ônus ou impedimento que impeça a livre fruição da posse pelo ${compradorArtigo.toUpperCase()}.</p>

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DA SITUAÇÃO DO IMÓVEL</h2>
`;

  // Cláusula 2 - Ocupação
  texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula 2ª.</strong> `;
  
  switch (dados.ocupacao) {
    case 'uso_proprio_vendedor':
      texto += `O imóvel encontra-se em uso próprio ${vendedorPronome === 'os' ? 'dos' : 'do'} ${vendedorArtigo.toUpperCase()}, não estando alugado, arrendado ou compromissado a terceiros.`;
      break;
    case 'alugado_arrendado':
      texto += `O imóvel encontra-se atualmente alugado/arrendado a terceiros, conforme contrato de locação/arrendamento em vigor, do qual ${vendedorPronome === 'os' ? 'os' : 'o'} ${vendedorArtigo.toUpperCase()} se compromete a fornecer cópia integral ao ${compradorArtigo.toUpperCase()}. A posse será transferida ao ${compradorArtigo.toUpperCase()} na forma estabelecida neste contrato, ressalvados os direitos do inquilino/arrendatário até o término do respectivo contrato.`;
      break;
    case 'financiamento_quitado':
      texto += `O imóvel foi adquirido ${vendedorPronome === 'os' ? 'pelos' : 'pelo'} ${vendedorArtigo.toUpperCase()} mediante financiamento habitacional, o qual encontra-se integralmente quitado, conforme comprovante de quitação que será anexado a este instrumento.`;
      break;
    case 'financiamento_vendedor_quita':
      texto += `O imóvel encontra-se em fase de financiamento habitacional, o qual será quitado integralmente ${vendedorPronome === 'os' ? 'pelos' : 'pelo'} ${vendedorArtigo.toUpperCase()} com parte do valor desta venda, antes da transferência da propriedade ao ${compradorArtigo.toUpperCase()}. ${vendedorPronome === 'os' ? 'Os' : 'O'} ${vendedorArtigo.toUpperCase()} se obriga a apresentar o comprovante de quitação antes da assinatura da escritura definitiva.`;
      break;
    case 'financiamento_comprador_assume':
      texto += `O imóvel encontra-se em fase de financiamento habitacional, cujo saldo devedor restante será assumido pelo ${compradorArtigo.toUpperCase()}, mediante anuência da instituição financeira credora, nos termos da cláusula específica de cessão de direitos creditórios ou transferência de contrato.`;
      break;
    case 'financiamento_vendedor_quita_antes':
      texto += `O imóvel encontra-se em fase de financiamento habitacional, o qual será quitado integralmente ${vendedorPronome === 'os' ? 'pelos' : 'pelo'} ${vendedorArtigo.toUpperCase()} antes da assinatura deste contrato, conforme comprovante de quitação que será anexado como documento essencial deste instrumento.`;
      break;
  }
  
  texto += `</p>

`;

  // Cláusula 3 - Débitos (Art. 26, VI)
  texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula 3ª.</strong> `;
  
  switch (dados.debitos) {
    case 'sem_debitos':
      texto += `Não há débitos pendentes de impostos, taxas ou despesas condominárias incidentes sobre o imóvel, conforme certidão negativa que será anexada a este instrumento, nos termos do <strong>Art. 26, inciso VI, da Lei nº 6.766/79</strong>, que estabelece a indicação sobre a quem incumbe o pagamento dos impostos e taxas incidentes sobre o imóvel compromissado.`;
      break;
    case 'vendedor_quita_antes':
      texto += `Há débitos pendentes de impostos, taxas ou despesas condominárias incidentes sobre o imóvel, os quais serão integralmente quitados ${vendedorPronome === 'os' ? 'pelos' : 'pelo'} ${vendedorArtigo.toUpperCase()} antes da assinatura da escritura definitiva, conforme comprovantes que serão anexados a este instrumento, nos termos do <strong>Art. 26, inciso VI, da Lei nº 6.766/79</strong>.`;
      break;
    case 'comprador_assume':
      texto += `Há débitos pendentes de impostos, taxas ou despesas condominárias incidentes sobre o imóvel, os quais serão assumidos integralmente pelo ${compradorArtigo.toUpperCase()} a partir da data da assinatura deste instrumento, nos termos do <strong>Art. 26, inciso VI, da Lei nº 6.766/79</strong>.`;
      break;
    case 'dividido_50_50':
      texto += `Há débitos pendentes de impostos, taxas ou despesas condominárias incidentes sobre o imóvel, os quais serão quitados em partes iguais (50% para cada parte) entre ${vendedorArtigo.toUpperCase()} e ${compradorArtigo.toUpperCase()}, conforme planilha de débitos que será anexada a este instrumento, nos termos do <strong>Art. 26, inciso VI, da Lei nº 6.766/79</strong>.`;
      break;
  }
  
  texto += `</p>

`;

  // ─── Cláusula 4 - Corretor (NOVO: com dados completos) ───
  const temCorretor = dados.corretor !== null;
  
  if (temCorretor && dados.corretor) {
    const c = dados.corretor;
    const comissaoTexto = c.tipoComissao === 'porcentagem'
      ? `${c.valorComissao}% (por cento)`
      : formatarMoeda(c.valorComissao);
    
    let pagadorTexto = '';
    if (c.quemPaga === 'vendedor') {
      pagadorTexto = `paga integralmente ${vendedorPronome === 'os' ? 'pelos' : 'pelo'} ${vendedorArtigo.toUpperCase()}`;
    } else if (c.quemPaga === 'comprador') {
      pagadorTexto = `paga integralmente pelo ${compradorArtigo.toUpperCase()}`;
    } else {
      pagadorTexto = `dividida igualmente entre ${vendedorArtigo.toUpperCase()} e ${compradorArtigo.toUpperCase()}, sendo 50% (cinquenta por cento) para cada parte`;
    }

    texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DA INTERMEDIAÇÃO</h2>
<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula 4ª.</strong> Houve intermediação de corretor de imóveis nesta negociação, representada por <strong>${c.nome}</strong>, inscrito no CRECI sob nº <strong>${c.creci}</strong>, nos termos da lei em vigor. A comissão de corretagem corresponde a <strong>${comissaoTexto}</strong> sobre o valor total da venda, sendo ${pagadorTexto}, não constituindo ônus para a parte não responsável pelo pagamento.</p>

`;
  }

  // Cláusula de Pagamento
  const clausulaNum = temCorretor ? 5 : 4;
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DO PREÇO E FORMA DE PAGAMENTO</h2>

<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${clausulaNum}ª.</strong> Pelo presente instrumento, ${vendedorPronome === 'os' ? 'os' : 'o'} ${vendedorArtigo.toUpperCase()} vende e o ${compradorArtigo.toUpperCase()} compra o imóvel descrito na Cláusula 1ª pelo valor total de <strong>${formatarMoeda(dados.valorTotal)}</strong> (${extensoReais(dados.valorTotal)}).</p>

`;

  switch (dados.formaPagamento) {
    case 'avista':
      texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${clausulaNum + 1}ª.</strong> O pagamento será realizado à vista, em única parcela, no ato da assinatura da escritura definitiva ou deste contrato, conforme acordo entre as partes, mediante ${getFormaRecebimentoTexto(dados)}.</p>

`;
      break;
    case 'sinal_resto_avista':
      texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${clausulaNum + 1}ª.</strong> O pagamento será realizado mediante sinal de <strong>${formatarMoeda(dados.valorSinal || 0)}</strong> (${extensoReais(dados.valorSinal || 0)}), pago no ato da assinatura deste contrato, e o saldo remanescente de <strong>${formatarMoeda((dados.valorTotal - (dados.valorSinal || 0)))}</strong> (${extensoReais(dados.valorTotal - (dados.valorSinal || 0))}), a ser pago à vista no ato da assinatura da escritura definitiva, mediante ${getFormaRecebimentoTexto(dados)}.</p>

`;
      break;
    case 'sinal_financiamento':
      texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${clausulaNum + 1}ª.</strong> O pagamento será realizado mediante sinal de <strong>${formatarMoeda(dados.valorSinal || 0)}</strong> (${extensoReais(dados.valorSinal || 0)}), pago no ato da assinatura deste contrato, e o saldo remanescente de <strong>${formatarMoeda((dados.valorTotal - (dados.valorSinal || 0)))}</strong> (${extensoReais(dados.valorTotal - (dados.valorSinal || 0))}), a ser financiado pelo ${compradorArtigo.toUpperCase()} junto a instituição financeira de sua escolha, mediante ${getFormaRecebimentoTexto(dados)} para o sinal.</p>

`;
      break;
    case 'parcelado_vendedor':
      const parcela = dados.parcelas!;
      texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${clausulaNum + 1}ª.</strong> O pagamento será realizado ${dados.valorSinal ? `mediante sinal de <strong>${formatarMoeda(dados.valorSinal)}</strong> (${extensoReais(dados.valorSinal)}), pago no ato da assinatura deste contrato, e ` : ''}em <strong>${parcela.quantidade}</strong> parcelas${dados.valorSinal ? ' do saldo remanescente' : ''} de <strong>${formatarMoeda(parcela.valor)}</strong> (${extensoReais(parcela.valor)}) cada, com vencimento da primeira parcela em <strong>${parcela.vencimentoPrimeira}</strong>, e as demais sucessivamente a cada ${getPeriodicidadeTexto(parcela.periodicidade)}, mediante ${getFormaRecebimentoTexto(dados)}.</p>

`;
      
      // Cláusula de juros e correção (Art. 26, V)
      texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${clausulaNum + 2}ª.</strong> As parcelas em atraso sofrerão multa de <strong>${dados.multaAtraso}%</strong> e juros de mora de <strong>${dados.jurosMes}% ao mês</strong>, conforme limitação do <strong>Art. 26, inciso V, da Lei nº 6.766/79</strong>, que estabelece que a taxa de juros incidentes sobre o débito em aberto e sobre as prestações vencidas e não pagas, bem como a cláusula penal, nunca excederá a <strong>10% (dez por cento)</strong> do débito e só será exigível nos casos de intervenção judicial ou de mora superior a 3 (três) meses. `;
      
      if (dados.correcaoMonetaria === 'fixa') {
        texto += `As parcelas terão valor fixo, sem correção monetária.`;
      } else {
        texto += `As parcelas serão corrigidas anualmente pelo IPCA (Índice Nacional de Preços ao Consumidor Amplo), a cada 12 (doze) meses, contados a partir do vencimento da primeira parcela.`;
      }
      
      texto += `</p>

`;
      
      // Cláusula de desfazimento
      texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${clausulaNum + 3}ª.</strong> Em caso de atraso superior a <strong>${dados.diasToleranciaDesfazer} dias</strong> no pagamento de qualquer parcela, ${vendedorPronome === 'os' ? 'os' : 'o'} ${vendedorArtigo.toUpperCase()} poderá rescindir o presente contrato, retendo o sinal e as parcelas pagas a título de cláusula penal, sem prejuízo das demais cominações legais, ressalvado o disposto no Art. 26, inciso V, da Lei nº 6.766/79.</p>

`;
      break;
  }

  // Cláusula de posse
  const posseClausula = dados.formaPagamento === 'parcelado_vendedor' 
    ? (temCorretor ? 9 : 8) 
    : (temCorretor ? 6 : 5);
  
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DA POSSE E TRANSFERÊNCIA</h2>

<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${posseClausula}ª.</strong> `;
  
  switch (dados.posse) {
    case 'pagamento_concluido':
      texto += `A posse do imóvel será transferida ao ${compradorArtigo.toUpperCase()} somente após o pagamento integral do preço acertado, conforme comprovantes de quitação apresentados.`;
      break;
    case 'assinatura_contrato':
      texto += `A posse do imóvel será transferida ao ${compradorArtigo.toUpperCase()} no ato da assinatura deste contrato, independentemente do pagamento integral, desde que ${vendedorPronome === 'os' ? 'os' : 'o'} ${vendedorArtigo.toUpperCase()} disponibilize o imóvel livre de qualquer impedimento que impeça a livre fruição da posse.`;
      break;
    case 'data_combinada':
      texto += `A posse do imóvel será transferida ao ${compradorArtigo.toUpperCase()} na data de <strong>${dados.dataPosseCombinada}</strong>, conforme acordo específico entre as partes, desde que ${vendedorPronome === 'os' ? 'os' : 'o'} ${vendedorArtigo.toUpperCase()} disponibilize o imóvel livre de qualquer impedimento.`;
      break;
  }
  
  texto += `</p>

`;

  // Cláusula de escritura
  const escrituraClausula = posseClausula + 1;
  texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${escrituraClausula}ª.</strong> As partes se obrigam a lavrar a escritura definitiva de compra e venda no prazo de <strong>${dados.prazoEscritura} dias</strong> após a quitação integral do preço, sendo que os custos de transferência (ITBI, registro em cartório e demais despesas) serão de responsabilidade `;
  
  switch (dados.custoTransferencia) {
    case 'comprador':
      texto += `exclusiva do ${compradorArtigo.toUpperCase()}.`;
      break;
    case 'vendedor':
      texto += `exclusiva ${vendedorPronome === 'os' ? 'dos' : 'do'} ${vendedorArtigo.toUpperCase()}.`;
      break;
    case 'dividido_50_50':
      texto += `de ambas as partes, em partes iguais (50% para cada lado).`;
      break;
  }
  
  texto += `</p>

`;

  // Cláusula de desistência
  const desistenciaClausula = escrituraClausula + 1;
  texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${desistenciaClausula}ª.</strong> `;
  
  if (dados.desistencia === 'nao_permite') {
    texto += `Nenhuma das partes poderá desistir da presente negociação após a assinatura deste instrumento, sob pena de pagamento de multa compensatória de <strong>${dados.multaQuebra}%</strong> do valor total da venda.`;
  } else {
    texto += `As partes poderão desistir da presente negociação no prazo de <strong>${dados.prazoDesistencia} dias</strong> após a assinatura deste instrumento, mediante pagamento de multa compensatória de <strong>${dados.multaQuebra}%</strong> do valor total da venda, caso a desistência seja imotivada.`;
  }
  
  texto += `</p>

`;

  // Cláusula de seguro (Art. 531 CC)
  const seguroClausula = desistenciaClausula + 1;
  texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${seguroClausula}ª.</strong> Se entre os documentos entregues ao ${compradorArtigo.toUpperCase()} figurar apólice de seguro que cubra os riscos do imóvel, os mesmos correrão à conta do ${compradorArtigo.toUpperCase()}, salvo se, ao ser concluído o contrato, tivesse ${vendedorPronome === 'os' ? 'os' : 'o'} ${vendedorArtigo.toUpperCase()} ciência da perda ou avaria da coisa, nos termos do <strong>Art. 531 do Código Civil</strong>.</p>

`;

  // Cláusulas gerais
  const geralClausula = seguroClausula + 1;
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DISPOSIÇÕES GERAIS</h2>

<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${geralClausula}ª.</strong> O presente contrato passa a valer a partir da assinatura pelas partes, obrigando-se a ele os herdeiros ou sucessores das mesmas, nos termos do Art. 26, inciso I, da Lei nº 6.766/79.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${geralClausula + 1}ª.</strong> Segue anexo a este instrumento certidão negativa de débito tributário sobre o imóvel, certidão negativa dos cartórios de distribuição e dos cartórios de protesto, quando exigível.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>Cláusula ${geralClausula + 2}ª.</strong> As partes declaram, para todos os fins de direito, que leram e compreenderam integralmente o presente instrumento, tendo tido a oportunidade de esclarecer todas as dúvidas antes de sua assinatura.</p>

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DO FORO</h2>

<p style="text-align: justify; margin-bottom: 30px;"><strong>Cláusula ${geralClausula + 3}ª.</strong> Para dirimir quaisquer controvérsias oriundas do presente CONTRATO, as partes elegem o foro da comarca de <strong>${limparCidade(dados.imovel.endereco.cidade, dados.imovel.endereco.estado)}</strong>/${dados.imovel.endereco.estado}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DISPOSIÇÕES FINAIS E FUNDAMENTO LEGAL</h2>

<p style="text-align: justify; margin-bottom: 15px;">O presente instrumento foi elaborado em conformidade com as disposições da <strong>Lei nº 6.766, de 19 de dezembro de 1979</strong> (Lei do Parcelamento do Solo Urbano), que dispõe sobre o parcelamento do solo urbano para fins de edificação, e com o <strong>Código Civil Brasileiro (Lei nº 10.406/2002)</strong>.</p>

<p style="text-align: justify; margin-bottom: 15px;">Conforme o <strong>Art. 26 da Lei nº 6.766/79</strong>, os compromissos de compra e venda, as cessões ou promessas de cessão poderão ser feitos por escritura pública ou por instrumento particular, e conterão, pelo menos, as seguintes indicações:</p>

<p style="text-align: justify; margin-bottom: 10px; padding-left: 20px;">
<strong>I -</strong> nome, registro civil, cadastro fiscal no Ministério da Fazenda, nacionalidade, estado civil e residência dos contratantes;<br/>
<strong>II -</strong> denominação e situação do loteamento, número e data da inscrição;<br/>
<strong>III -</strong> descrição do lote ou dos lotes que forem objeto de compromissos, confrontações, área e outras características;<br/>
<strong>V -</strong> taxa de juros incidentes sobre o débito em aberto e sobre as prestações vencidas e não pagas, bem como a cláusula penal, nunca excedente a 10% (dez por cento) do débito e só exigível nos casos de intervenção judicial ou de mora superior a 3 (três) meses;<br/>
<strong>VI -</strong> indicação sobre a quem incumbe o pagamento dos impostos e taxas incidentes sobre o lote compromissado.
</p>

<p style="text-align: justify; margin-bottom: 15px;">Conforme o <strong>Art. 531 do Código Civil</strong>: "Se entre os documentos entregues ao comprador figurar apólice de seguro que cubra os riscos do transporte, correm estes à conta do comprador, salvo se, ao ser concluído o contrato, tivesse o vendedor ciência da perda ou avaria da coisa."</p>

<p style="text-align: justify; margin-bottom: 30px;">Por estarem assim justos e contratados, firmam o presente instrumento, em duas vias de igual teor${dados.testemunhas.length > 0 ? `, juntamente com ${dados.testemunhas.length} (${extensoNumero(dados.testemunhas.length)}) testemunha${dados.testemunhas.length > 1 ? 's' : ''}` : ''}.</p>

<p style="text-align: center; margin: 40px 0;">${dados.localAssinatura}, ${dados.dataContrato}.</p>

<div style="margin-top: 60px;">
  <p style="text-align: center; margin-bottom: 40px;">_______________________________________________<br/>
  <strong>${dados.vendedores.map(v => v.tipo === 'pf' ? v.nome : v.razaoSocial).join(' e ')}</strong><br/>
  ${dados.vendedores.length === 1 && dados.vendedores[0].tipo === 'pf' ? `CPF: ${dados.vendedores[0].cpf}` : ''}
  ${dados.vendedores.length === 1 && dados.vendedores[0].tipo === 'pj' ? `CNPJ: ${dados.vendedores[0].cnpj}` : ''}
  </p>
  
  <p style="text-align: center; margin-bottom: 40px;">_______________________________________________<br/>
  <strong>${dados.compradores.map(c => c.tipo === 'pf' ? c.nome : c.razaoSocial).join(' e ')}</strong><br/>
  ${dados.compradores.length === 1 && dados.compradores[0].tipo === 'pf' ? `CPF: ${dados.compradores[0].cpf}` : ''}
  ${dados.compradores.length === 1 && dados.compradores[0].tipo === 'pj' ? `CNPJ: ${dados.compradores[0].cnpj}` : ''}
  </p>
</div>
`;

  if (dados.testemunhas.length > 0) {
    texto += `<div style="margin-top: 40px;">`;
    dados.testemunhas.forEach((t, i) => {
      texto += `<p style="text-align: center; margin-bottom: 40px;">_______________________________________________<br/>
      <strong>Testemunha ${i + 1}:</strong> ${t.nome}<br/>
      RG: ${t.rg} | CPF: ${t.cpf}
      </p>`;
    });
    texto += `</div>`;
  }

  texto += `</div>`;
  
  return texto;
}

function getFormaRecebimentoTexto(dados: DadosContrato): string {
  switch (dados.formaRecebimento) {
    case 'pix': return 'transferência via PIX';
    case 'transferencia': return 'transferência bancária';
    case 'dinheiro': return 'dinheiro em espécie';
    case 'outro': return dados.formaRecebimentoOutro || 'outra forma de pagamento';
  }
}

function getPeriodicidadeTexto(p: string): string {
  const map: Record<string, string> = {
    'mensal': 'mês',
    'bimestral': 'dois meses',
    'trimestral': 'três meses',
    'semestral': 'seis meses'
  };
  return map[p] || 'mês';
}

function extensoReais(valor: number): string {
  const parteInteira = Math.floor(valor);
  const centavos = Math.round((valor - parteInteira) * 100);
  
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  function numeroExtenso(n: number): string {
    if (n === 0) return 'zero';
    if (n === 100) return 'cem';
    if (n < 10) return unidades[n];
    if (n < 20) return especiais[n - 10];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      return dezenas[d] + (u > 0 ? ' e ' + unidades[u] : '');
    }
    if (n < 1000) {
      const c = Math.floor(n / 100);
      const resto = n % 100;
      return centenas[c] + (resto > 0 ? ' e ' + numeroExtenso(resto) : '');
    }
    if (n < 1000000) {
      const m = Math.floor(n / 1000);
      const resto = n % 1000;
      const milTexto = m === 1 ? 'mil' : numeroExtenso(m) + ' mil';
      return milTexto + (resto > 0 ? (resto < 100 ? ' e ' : ', ') + numeroExtenso(resto) : '');
    }
    return valor.toFixed(2).replace('.', ',');
  }
  
  let texto = numeroExtenso(parteInteira) + ' real' + (parteInteira !== 1 ? 's' : '');
  if (centavos > 0) {
    texto += ' e ' + numeroExtenso(centavos) + ' centavo' + (centavos !== 1 ? 's' : '');
  }
  return texto;
}

function extensoNumero(n: number): string {
  const map: Record<number, string> = {
    0: 'zero', 1: 'uma', 2: 'duas'
  };
  return map[n] || String(n);
}