 import { z } from "zod";

const enderecoSchema = z.object({
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cep: z.string().min(8, "CEP inválido"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório").max(2),
});

const pessoaFisicaSchema = z.object({
  tipo: z.literal("pf"),
  nome: z.string().min(3, "Nome completo é obrigatório"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  estadoCivil: z.enum(["solteiro", "solteira", "casado", "casada", "uniao_estavel", "divorciado", "divorciada", "viuvo", "viuva"]),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  rg: z.string().min(1, "RG é obrigatório"),
  cpf: z.string().min(11, "CPF inválido"),
  endereco: enderecoSchema,
});

const representanteSchema = z.object({
  nome: z.string().min(3, "Nome do representante é obrigatório"),
  cpf: z.string().min(11, "CPF inválido"),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  rg: z.string().min(1, "RG é obrigatório"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  estadoCivil: z.string().min(1, "Estado civil é obrigatório"),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  endereco: enderecoSchema,
});

const pessoaJuridicaSchema = z.object({
  tipo: z.literal("pj"),
  razaoSocial: z.string().min(3, "Razão social é obrigatória"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  nire: z.string().optional(),
  representante: representanteSchema,
  endereco: enderecoSchema,
});

const parteSchema = z.union([pessoaFisicaSchema, pessoaJuridicaSchema]);

const imovelSchema = z.object({
  endereco: enderecoSchema,
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  cartorioRegistro: z.string().min(1, "Cartório é obrigatório"),
  inscricaoMunicipal: z.string().min(1, "Inscrição municipal é obrigatória"),
  area: z.number().min(0.01, "Área deve ser maior que zero"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  confrontacoes: z.string().optional(),
});

const parcelaSchema = z.object({
  quantidade: z.number().min(1, "Mínimo 1 parcela"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  vencimentoPrimeira: z.string().min(1, "Data de vencimento é obrigatória"),
  periodicidade: z.enum(["mensal", "bimestral", "trimestral", "semestral"]),
});

const testemunhaSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().min(11, "CPF inválido"),
  rg: z.string().min(1, "RG é obrigatório"),
});

const corretorInfoSchema = z.object({
  nome: z.string().min(1, "Nome do corretor é obrigatório"),
  creci: z.string().min(1, "CRECI é obrigatório"),
  tipoComissao: z.enum(["porcentagem", "valor_fixo"]),
  valorComissao: z.number().min(0.01, "Valor da comissão deve ser maior que zero"),
  quemPaga: z.enum(["vendedor", "comprador", "dividido_50_50"]),
});

export const contratoSchema = z.object({
  vendedores: z.array(parteSchema).min(1, "Pelo menos um vendedor é obrigatório"),
  compradores: z.array(parteSchema).min(1, "Pelo menos um comprador é obrigatório"),
  imovel: imovelSchema,
  ocupacao: z.enum(["uso_proprio_vendedor", "alugado_arrendado", "financiamento_quitado", "financiamento_vendedor_quita", "financiamento_comprador_assume", "financiamento_vendedor_quita_antes"]),
  debitos: z.enum(["sem_debitos", "vendedor_quita_antes", "comprador_assume", "dividido_50_50"]),
  corretor: z.union([corretorInfoSchema, z.null()]),
  formaPagamento: z.enum(["avista", "sinal_resto_avista", "sinal_financiamento", "parcelado_vendedor"]),
  valorTotal: z.number().min(0.01, "Valor deve ser maior que zero"),
  valorSinal: z.number().optional(),
  parcelas: parcelaSchema.optional(),
  multaAtraso: z.number().min(0).max(10, "Multa não pode exceder 10% conforme Art. 26, V, Lei 6.766/79"),
  jurosMes: z.number().min(0),
  diasToleranciaDesfazer: z.number().min(90, "Prazo mínimo de 90 dias conforme Art. 26, V, Lei 6.766/79"),
  correcaoMonetaria: z.enum(["fixa", "ipca_12_meses"]),
  desistencia: z.enum(["nao_permite", "sim_com_prazo"]),
  prazoDesistencia: z.number().optional(),
  multaQuebra: z.number().min(0).max(10, "Multa não pode exceder 10% conforme Art. 26, V, Lei 6.766/79"),
  prazoEscritura: z.number().min(1, "Prazo mínimo de 1 dia"),
  custoTransferencia: z.enum(["comprador", "vendedor", "dividido_50_50"]),
  formaRecebimento: z.enum(["pix", "transferencia", "dinheiro", "outro"]),
  formaRecebimentoOutro: z.string().optional(),
  posse: z.enum(["pagamento_concluido", "assinatura_contrato", "data_combinada"]),
  dataPosseCombinada: z.string().optional(),
  testemunhas: z.array(testemunhaSchema).max(2, "Máximo 2 testemunhas"),
  localAssinatura: z.string().min(1, "Local é obrigatório"),
  dataContrato: z.string().min(1, "Data é obrigatória"),
}).refine((data) => {
  if (data.formaPagamento === "sinal_resto_avista" || data.formaPagamento === "sinal_financiamento") {
    return data.valorSinal !== undefined && data.valorSinal > 0 && data.valorSinal < data.valorTotal;
  }
  return true;
}, {
  message: "Valor do sinal é obrigatório e deve ser menor que o valor total",
  path: ["valorSinal"],
}).refine((data) => {
  if (data.formaPagamento === "parcelado_vendedor") {
    return data.parcelas !== undefined;
  }
  return true;
}, {
  message: "Dados das parcelas são obrigatórios",
  path: ["parcelas"],
}).refine((data) => {
  if (data.desistencia === "sim_com_prazo") {
    return data.prazoDesistencia !== undefined && data.prazoDesistencia > 0;
  }
  return true;
}, {
  message: "Prazo de desistência é obrigatório",
  path: ["prazoDesistencia"],
}).refine((data) => {
  if (data.posse === "data_combinada") {
    return data.dataPosseCombinada !== undefined && data.dataPosseCombinada.length > 0;
  }
  return true;
}, {
  message: "Data combinada para posse é obrigatória",
  path: ["dataPosseCombinada"],
}).refine((data) => {
  if (data.formaRecebimento === "outro") {
    return data.formaRecebimentoOutro !== undefined && data.formaRecebimentoOutro.length > 0;
  }
  return true;
}, {
  message: "Especifique a forma de recebimento",
  path: ["formaRecebimentoOutro"],
});

export type ContratoFormData = z.infer<typeof contratoSchema>;