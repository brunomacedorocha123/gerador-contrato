import { ContratoAluguelFormData, LocadorData, LocatarioData } from "@/types/aluguel";

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getArtigoLocador(locador: LocadorData): string {
  return locador.tipo === "pj" ? "a LOCADORA" : "o LOCADOR";
}

function getArtigoLocatario(locatario: LocatarioData): string {
  return locatario.tipo === "pj" || locatario.tipo === "mei" ? "a LOCATÁRIA" : "o LOCATÁRIO";
}

function getNomeLocador(locador: LocadorData): string {
  return locador.tipo === "pj" ? locador.razaoSocial : locador.nome;
}

function getNomeLocatario(locatario: LocatarioData): string {
  if (locatario.tipo === "pj") {
    return (locatario as any).razaoSocial || locatario.nome;
  }
  return locatario.nome;
}

function getDocLocador(locador: LocadorData): string {
  return locador.tipo === "pf" ? `CPF: ${locador.documentos.cpf}` : `CNPJ: ${locador.cnpj}`;
}

function getDocLocatario(locatario: LocatarioData): string {
  if (locatario.tipo === "pf") return `CPF: ${locatario.documentos.cpf}`;
  return `CNPJ: ${locatario.cnpj}`;
}

function formatarEndereco(endereco: {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}): string {
  return `${endereco.rua}, nº ${endereco.numero}${endereco.complemento ? `, ${endereco.complemento}` : ""}, bairro ${endereco.bairro}, CEP ${endereco.cep}, ${endereco.cidade}/${endereco.estado}`;
}

function extensoReais(valor: number): string {
  const parteInteira = Math.floor(valor);
  const centavos = Math.round((valor - parteInteira) * 100);

  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const especiais = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  function numeroExtenso(n: number): string {
    if (n === 0) return "zero";
    if (n === 100) return "cem";
    if (n < 10) return unidades[n];
    if (n < 20) return especiais[n - 10];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      return dezenas[d] + (u > 0 ? " e " + unidades[u] : "");
    }
    if (n < 1000) {
      const c = Math.floor(n / 100);
      const resto = n % 100;
      return centenas[c] + (resto > 0 ? " e " + numeroExtenso(resto) : "");
    }
    if (n < 1000000) {
      const m = Math.floor(n / 1000);
      const resto = n % 1000;
      const milTexto = m === 1 ? "mil" : numeroExtenso(m) + " mil";
      return milTexto + (resto > 0 ? (resto < 100 ? " e " : ", ") + numeroExtenso(resto) : "");
    }
    return valor.toFixed(2).replace(".", ",");
  }

  let texto = numeroExtenso(parteInteira) + " real" + (parteInteira !== 1 ? "s" : "");
  if (centavos > 0) {
    texto += " e " + numeroExtenso(centavos) + " centavo" + (centavos !== 1 ? "s" : "");
  }
  return texto;
}

/* ============================================================
   TEMPLATE PRINCIPAL
   ============================================================ */

export function gerarTextoContratoAluguel(dados: ContratoAluguelFormData): string {
  const artLocador = getArtigoLocador(dados.locador);
  const artLocatario = getArtigoLocatario(dados.locatario);
  const nomeLocador = getNomeLocador(dados.locador);
  const nomeLocatario = getNomeLocatario(dados.locatario);
  const docLocador = getDocLocador(dados.locador);
  const docLocatario = getDocLocatario(dados.locatario);

  const enderecoImovel = formatarEndereco(dados.imovel.endereco);
  const enderecoLocador = formatarEndereco(dados.locador.endereco);
  const enderecoLocatario = formatarEndereco(dados.locatario.endereco);

  const valorAluguel = formatarMoeda(dados.aluguel.valor);

  let texto = `
<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; text-align: justify; margin: 0; padding: 15mm 20mm;">

<h1 style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 30px;">CONTRATO DE LOCAÇÃO DE IMÓVEL ${dados.tipoContrato === "residencial" ? "RESIDENCIAL" : "COMERCIAL"}</h1>

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">IDENTIFICAÇÃO DAS PARTES</h2>

<p style="margin-bottom: 15px;"><strong>${artLocador.toUpperCase()}:</strong> `;

  if (dados.locador.tipo === "pj") {
    texto += `${nomeLocador}, inscrita no CNPJ sob nº ${dados.locador.cnpj}, com sede na ${enderecoLocador}, neste ato representada por ${dados.locador.representanteNome}, ${dados.locador.nacionalidade}, ${dados.locador.documentos.estadoCivil}, ${dados.locador.profissao}, Carteira de Identidade nº ${dados.locador.documentos.rg}, órgão emissor ${dados.locador.documentos.orgaoEmissor}/${dados.locador.documentos.ssp}, CPF nº ${dados.locador.documentos.cpf}.`;
  } else {
    texto += `${nomeLocador}, ${dados.locador.nacionalidade}, ${dados.locador.documentos.estadoCivil}, ${dados.locador.profissao}, Carteira de Identidade nº ${dados.locador.documentos.rg}, órgão emissor ${dados.locador.documentos.orgaoEmissor}/${dados.locador.documentos.ssp}, CPF nº ${dados.locador.documentos.cpf}, residente e domiciliado na ${enderecoLocador}.`;
  }

  texto += `</p>

<p style="margin-bottom: 15px;"><strong>${artLocatario.toUpperCase()}:</strong> `;

  if (dados.locatario.tipo === "pj") {
    const nomeExibido = (dados.locatario as any).razaoSocial || dados.locatario.nome;
    texto += `${nomeExibido}, inscrita no CNPJ sob nº ${dados.locatario.cnpj}, com sede na ${enderecoLocatario}, neste ato representada por ${(dados.locatario as any).representanteNome}, ${dados.locatario.nacionalidade}, ${dados.locatario.documentos.estadoCivil}, ${dados.locatario.profissao}, Carteira de Identidade nº ${dados.locatario.documentos.rg}, órgão emissor ${dados.locatario.documentos.orgaoEmissor}/${dados.locatario.documentos.ssp}, CPF nº ${dados.locatario.documentos.cpf}.`;
  } else if (dados.locatario.tipo === "mei") {
    texto += `${dados.locatario.nome}, MEI, inscrito no CNPJ sob nº ${dados.locatario.cnpj}, ${dados.locatario.nacionalidade}, ${dados.locatario.documentos.estadoCivil}, ${dados.locatario.profissao}, Carteira de Identidade nº ${dados.locatario.documentos.rg}, órgão emissor ${dados.locatario.documentos.orgaoEmissor}/${dados.locatario.documentos.ssp}, CPF nº ${dados.locatario.documentos.cpf}, residente e domiciliado na ${enderecoLocatario}.`;
  } else {
    texto += `${nomeLocatario}, ${dados.locatario.nacionalidade}, ${dados.locatario.documentos.estadoCivil}, ${dados.locatario.profissao}, Carteira de Identidade nº ${dados.locatario.documentos.rg}, órgão emissor ${dados.locatario.documentos.orgaoEmissor}/${dados.locatario.documentos.ssp}, CPF nº ${dados.locatario.documentos.cpf}, residente e domiciliado na ${enderecoLocatario}.`;
  }

  texto += `</p>

<p style="margin: 20px 0; text-align: justify;">As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Locação de Imóvel ${dados.tipoContrato}, que se regerá pelas cláusulas seguintes.</p>

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA PRIMEIRA - DO OBJETO</h2>
<p style="text-align: justify; margin-bottom: 15px;">O objeto de locação é o imóvel ${dados.tipoContrato}, localizado na ${enderecoImovel}.</p>
<p style="text-align: justify; margin-bottom: 15px;">O imóvel possui as seguintes características: ${dados.imovel.detalhes.tipoImovel}, com ${dados.imovel.detalhes.metragem}m² de área construída, ${dados.imovel.detalhes.quartos} quarto(s), ${dados.imovel.detalhes.banheiros} banheiro(s), ${dados.imovel.detalhes.salas} sala(s). ${dados.imovel.detalhes.piscina ? "Possui piscina. " : ""}${dados.imovel.detalhes.areaLazer ? "Possui área de lazer. " : ""}${dados.imovel.detalhes.descricao}</p>`;

  if (dados.imovel.temMatricula && dados.imovel.matricula) {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">Matrícula do imóvel nº ${dados.imovel.matricula}, registrada no ${dados.imovel.cartorioRegistro}.</p>`;
  }

  texto += `

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA SEGUNDA - DO PRAZO</h2>`;

  if (dados.prazo.tipo === "determinado") {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">O prazo da locação é de <strong>${dados.prazo.meses} meses</strong>, tendo início na data de <strong>${dados.prazo.dataInicialPosse}</strong>, ocasião em que é entregue as chaves do imóvel ao(à) LOCATÁRIO(A).</p>`;
  } else {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">O presente contrato é por prazo <strong>indeterminado</strong>, tendo início na data de <strong>${dados.prazo.dataInicialPosse}</strong>, ocasião em que é entregue as chaves do imóvel ao(à) LOCATÁRIO(A).</p>`;
  }

  texto += `<p style="text-align: justify; margin-bottom: 15px;">${dados.prazo.permiteSublocar ? "É permitida a sublocação do imóvel, desde que com autorização prévia e por escrito do(a) LOCADOR(A)." : "É expressamente vedada a sublocação, transferência ou cessão do imóvel, sendo nulo de pleno direito qualquer ato praticado com este fim sem o consentimento prévio e por escrito do(a) LOCADOR(A)."}</p>

<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA TERCEIRA - DO ALUGUEL</h2>
<p style="text-align: justify; margin-bottom: 15px;">O valor do aluguel mensal será de <strong>${valorAluguel}</strong> (${extensoReais(dados.aluguel.valor)}), que deverá ser pago obrigatoriamente até o dia <strong>${dados.aluguel.diaPagamento}</strong> de cada mês, em moeda corrente, mediante <strong>${dados.aluguel.meioPagamento.toUpperCase()}</strong>.</p>`;

  if (dados.aluguel.meioPagamento === "transferencia" && dados.aluguel.dadosBancarios) {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">Dados para pagamento: Banco: ${dados.aluguel.dadosBancarios.banco}, Agência: ${dados.aluguel.dadosBancarios.agencia}, Conta: ${dados.aluguel.dadosBancarios.conta}${dados.aluguel.dadosBancarios.tipoConta ? " (" + dados.aluguel.dadosBancarios.tipoConta + ")" : ""}.</p>`;
  }

  if (dados.aluguel.meioPagamento === "pix" && dados.aluguel.dadosBancarios?.chavePix) {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">Chave PIX para pagamento: ${dados.aluguel.dadosBancarios.chavePix}.</p>`;
  }

  texto += `<p style="text-align: justify; margin-bottom: 15px;">O aluguel será reajustado anualmente pelo índice <strong>${dados.aluguel.indiceReajuste.toUpperCase()}</strong>.</p>
<p style="text-align: justify; margin-bottom: 15px;">Em caso de atraso no pagamento do aluguel, será aplicada automaticamente multa de <strong>${dados.aluguel.multaAtrasoPct}%</strong> sobre o valor do aluguel, mais juros de mora e correção monetária.</p>

`;

  // ─── CLÁUSULA QUARTA - DA GARANTIA ───
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA QUARTA - DA GARANTIA</h2>`;

  if (dados.garantia.tipo === "caucao") {
    const valorCaucaoTexto = dados.garantia.tipoCaucao === "fixo" && dados.garantia.valorCaucao
      ? formatarMoeda(dados.garantia.valorCaucao) + " (" + extensoReais(dados.garantia.valorCaucao) + ")"
      : (dados.garantia.mesesCaucao || 1) + " meses de aluguel";
    texto += `<p style="text-align: justify; margin-bottom: 15px;">O(a) LOCATÁRIO(A) entregará ao(à) LOCADOR(A) a título de caução a importância de <strong>${valorCaucaoTexto}</strong>, que será restituída ao término do contrato, descontados os valores devidos por danos, débitos pendentes ou outras obrigações contratuais.</p>`;
  }

  if (dados.garantia.tipo === "fiador" && dados.garantia.fiador) {
    const f = dados.garantia.fiador;
    const enderecoFiador = formatarEndereco(f.endereco);
    texto += `<p style="text-align: justify; margin-bottom: 15px;">O(a) LOCATÁRIO(A) apresenta como fiador(a) <strong>${f.nome}</strong>, ${f.nacionalidade}, ${f.documentos.estadoCivil}, ${f.profissao}, RG nº ${f.documentos.rg}, CPF nº ${f.documentos.cpf}, residente em ${enderecoFiador}. ${f.temLimite && f.valorLimite ? `O fiador responde até o limite de ${formatarMoeda(f.valorLimite)} (${extensoReais(f.valorLimite)}).` : "O fiador responde solidariamente por todo o contrato, sem limite de valor."}</p>`;
  }

  if (dados.garantia.tipo === "seguro") {
    const seguroValor = dados.garantia.seguroValor || 0;
    texto += `<p style="text-align: justify; margin-bottom: 15px;">O(a) LOCATÁRIO(A) contratará seguro-fiança junto à <strong>${dados.garantia.seguroNome}</strong>, com cobertura de <strong>${formatarMoeda(seguroValor)}</strong> (${extensoReais(seguroValor)}).</p>`;
  }

  // ─── CLÁUSULA QUINTA - DAS MELHORIAS E OBRAS ───
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA QUINTA - DAS MELHORIAS E OBRAS</h2>
<p style="text-align: justify; margin-bottom: 15px;">As melhorias essenciais serão de responsabilidade <strong>${dados.melhorias.essencial === "proprietario" ? "do(a) LOCADOR(A)" : "do(a) LOCATÁRIO(A)"}</strong>. As obras não essenciais serão de responsabilidade <strong>${dados.melhorias.naoEssencial === "proprietario" ? "do(a) LOCADOR(A)" : "do(a) LOCATÁRIO(A)"}</strong>, vedadas reformas e alterações sem prévia e expressa autorização por escrito do(a) LOCADOR(A).</p>`;

  // ─── CLÁUSULA SEXTA - DAS DESPESAS ───
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA SEXTA - DAS DESPESAS</h2>
<p style="text-align: justify; margin-bottom: 15px;">O pagamento do IPTU será de responsabilidade <strong>${dados.despesas.iptu === "proprietario" ? "do(a) LOCADOR(A)" : "do(a) LOCATÁRIO(A)"}</strong>.</p>`;

  if (dados.despesas.seguroIncendio !== "ninguem") {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">O pagamento do seguro contra incêndio será de responsabilidade <strong>${dados.despesas.seguroIncendio === "proprietario" ? "do(a) LOCADOR(A)" : "do(a) LOCATÁRIO(A)"}</strong>.</p>`;
  } else {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">Não há obrigatoriedade de contratação de seguro contra incêndio.</p>`;
  }

  texto += `<p style="text-align: justify; margin-bottom: 15px;">Será de responsabilidade do(a) LOCATÁRIO(A) o pagamento de condomínio, água, luz, gás, internet e demais despesas de consumo e utilização do imóvel.</p>`;

  // ─── CLÁUSULA SÉTIMA - DAS MULTAS ───
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA SÉTIMA - DAS MULTAS</h2>`;

  if (dados.multas.descumprimento.tem && dados.multas.descumprimento.valor) {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">Em caso de descumprimento de qualquer cláusula do presente contrato, a parte infratora pagará multa de <strong>${formatarMoeda(dados.multas.descumprimento.valor)}</strong> (${extensoReais(dados.multas.descumprimento.valor)}).</p>`;
  }

  if (dados.multas.rompimento.tem && dados.multas.rompimento.valor) {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">Em caso de rompimento do contrato antes do prazo estipulado, a parte desistente pagará multa de <strong>${formatarMoeda(dados.multas.rompimento.valor)}</strong> (${extensoReais(dados.multas.rompimento.valor)}).</p>`;
  }

  // ─── CLÁUSULA OITAVA - OBRIGAÇÕES ESPECIAIS ───
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA OITAVA - OBRIGAÇÕES ESPECIAIS</h2>`;

  const opcoesClausulasProprietario: Record<string, string> = {
    proibir_animais: "Proibir animais de estimação no imóvel",
    proibir_som_alto: "Proibir som alto e perturbação do sossego alheio",
    limite_pessoas: "Definir limite máximo de pessoas no imóvel",
    proibir_sublocacao: "Proibir sublocação (caso permitida no contrato)",
    vistoria_periodica: "Permitir vistoria periódica pelo proprietário",
  };

  const opcoesClausulasInquilino: Record<string, string> = {
    manter_limpo: "Manter o imóvel limpo e conservado",
    nao_alterar: "Não realizar alterações sem autorização escrita",
    informar_danos: "Informar imediatamente qualquer dano ou defeito",
    respeitar_condominio: "Respeitar normas de condomínio e vizinhança",
    devolver_igual: "Devolver o imóvel nas mesmas condições de recebimento",
  };

  if (dados.clausulas.proprietario.length > 0) {
    const clausulasProp = dados.clausulas.proprietario
      .map((c) => opcoesClausulasProprietario[c])
      .filter(Boolean)
      .join("; ");
    texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Obrigações / Restrições ao(à) LOCADOR(A):</strong> ${clausulasProp}.</p>`;
  }

  if (dados.clausulas.inquilino.length > 0) {
    const clausulasInq = dados.clausulas.inquilino
      .map((c) => opcoesClausulasInquilino[c])
      .filter(Boolean)
      .join("; ");
    texto += `<p style="text-align: justify; margin-bottom: 15px;"><strong>Obrigações / Restrições ao(à) LOCATÁRIO(A):</strong> ${clausulasInq}.</p>`;
  }

  if (dados.clausulas.limitePessoas) {
    texto += `<p style="text-align: justify; margin-bottom: 15px;">O imóvel terá limite máximo de <strong>${dados.clausulas.limitePessoas} pessoa(s)</strong> em sua ocupação.</p>`;
  }

  // ─── CLÁUSULA NONA - DISPOSIÇÕES GERAIS ───
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">CLÁUSULA NONA - DISPOSIÇÕES GERAIS</h2>
<p style="text-align: justify; margin-bottom: 15px;">O(a) LOCATÁRIO(A) está obrigado(a) a devolver o imóvel nas condições em que recebeu, limpo e conservado, ao término do contrato, salvo desgaste natural pelo uso regular.</p>
<p style="text-align: justify; margin-bottom: 15px;">O(a) LOCADOR(A) poderá vistoriar o imóvel sempre que achar conveniente, mediante comunicação prévia ao(à) LOCATÁRIO(A).</p>
<p style="text-align: justify; margin-bottom: 15px;">Quaisquer tolerâncias por parte do(a) LOCADOR(A) não constituirão precedente invocável ou renúncia a direitos.</p>
<p style="text-align: justify; margin-bottom: 15px;">O presente contrato obriga as partes, seus herdeiros e sucessores, a qualquer título.</p>`;

  // ─── DO FORO ───
  texto += `<h2 style="text-align: center; font-size: 12pt; font-weight: bold; margin: 20px 0;">DO FORO</h2>
<p style="text-align: justify; margin-bottom: 30px;">As partes elegem o foro da Comarca de <strong>${dados.assinatura.cidade}</strong>/${dados.assinatura.estado}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>`;

  // ─── LOCAL E DATA ───
  texto += `<p style="text-align: center; margin: 40px 0;"><strong>${dados.assinatura.cidade}/${dados.assinatura.estado}</strong>, ${dados.assinatura.dia} de ${dados.assinatura.mes} de ${dados.assinatura.ano}.</p>`;

  // ─── ASSINATURAS ───
  texto += `<div style="margin-top: 60px;">
  <p style="text-align: center; margin-bottom: 40px;">_______________________________________________<br/>
  <strong>${nomeLocador}</strong><br/>
  ${docLocador}
  </p>
  
  <p style="text-align: center; margin-bottom: 40px;">_______________________________________________<br/>
  <strong>${nomeLocatario}</strong><br/>
  ${docLocatario}
  </p>
</div>`;

  // ─── TESTEMUNHAS ───
  if (dados.testemunhas.length > 0) {
    texto += `<div style="margin-top: 40px;">`;
    dados.testemunhas.forEach((t, i) => {
      texto += `<p style="text-align: center; margin-bottom: 40px;">_______________________________________________<br/><strong>Testemunha ${i + 1}:</strong> ${t.nome}<br/>RG: ${t.rg} | CPF: ${t.cpf}</p>`;
    });
    texto += `</div>`;
  }

  // ─── FECHAMENTO ───
  texto += `</div>`;

  return texto;
}