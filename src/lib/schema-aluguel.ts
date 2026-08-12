import { z } from "zod";

/* ============================================================
   SCHEMAS BASE
   ============================================================ */

const enderecoSchema = z.object({
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Selecione o estado (UF)"),
  cep: z.string().min(8, "CEP inválido"),
});

const documentosSchema = z.object({
  rg: z.string().min(1, "RG é obrigatório"),
  orgaoEmissor: z.string().min(1, "Órgão emissor é obrigatório"),
  ssp: z.string().min(1, "SSP/Estado é obrigatório"),
  estadoCivil: z.string().min(1, "Estado civil é obrigatório"),
  cpf: z.string().min(11, "CPF inválido"),
});

const dadosBancariosSchema = z.object({
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  tipoConta: z.string().optional(),
  chavePix: z.string().optional(),
});

/* ============================================================
   LOCADOR
   ============================================================ */

const locadorPFSchema = z.object({
  tipo: z.literal("pf"),
  nome: z.string().min(3, "Nome completo é obrigatório"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  documentos: documentosSchema,
  endereco: enderecoSchema,
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  representanteNome: z.string().optional(),
  representanteCargo: z.string().optional(),
});

const locadorPJSchema = z.object({
  tipo: z.literal("pj"),
  razaoSocial: z.string().min(3, "Razão social é obrigatória"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  representanteNome: z.string().min(3, "Nome do representante é obrigatório"),
  representanteCargo: z.string().min(1, "Cargo é obrigatório"),
  nome: z.string().min(3, "Nome do representante para o contrato é obrigatório"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  documentos: documentosSchema,
  endereco: enderecoSchema,
});

export const locadorSchema = z.union([locadorPFSchema, locadorPJSchema]);

/* ============================================================
   LOCATÁRIO
   ============================================================ */

const locatarioPFSchema = z.object({
  tipo: z.literal("pf"),
  nome: z.string().min(3, "Nome completo é obrigatório"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  documentos: documentosSchema,
  endereco: enderecoSchema,
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  representanteNome: z.string().optional(),
  representanteCargo: z.string().optional(),
});

const locatarioMEISchema = z.object({
  tipo: z.literal("mei"),
  nome: z.string().min(3, "Nome completo é obrigatório"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  cnpj: z.string().min(14, "CNPJ do MEI é inválido"),
  documentos: documentosSchema,
  endereco: enderecoSchema,
  razaoSocial: z.string().optional(),
  representanteNome: z.string().optional(),
  representanteCargo: z.string().optional(),
});

const locatarioPJSchema = z.object({
  tipo: z.literal("pj"),
  razaoSocial: z.string().min(3, "Razão social é obrigatória"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  representanteNome: z.string().min(3, "Nome do representante é obrigatório"),
  representanteCargo: z.string().min(1, "Cargo é obrigatório"),
  nome: z.string().min(3, "Nome do representante para o contrato é obrigatório"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  profissao: z.string().min(1, "Profissão é obrigatória"),
  documentos: documentosSchema,
  endereco: enderecoSchema,
});

export const locatarioSchema = z.union([
  locatarioPFSchema,
  locatarioMEISchema,
  locatarioPJSchema,
]);

/* ============================================================
   FIADOR
   ============================================================ */

const fiadorSchema = z.object({
  nome: z.string().min(3, "Nome do fiador é obrigatório"),
  documentos: documentosSchema,
  endereco: enderecoSchema,
  profissao: z.string().min(1, "Profissão é obrigatória"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória"),
  temLimite: z.boolean(),
  valorLimite: z.number().optional(),
});

/* ============================================================
   IMÓVEL
   ============================================================ */

const imovelDetalhesSchema = z.object({
  tipoImovel: z.string().min(1, "Tipo do imóvel é obrigatório"),
  metragem: z.number().min(0.01, "Metragem deve ser maior que zero"),
  quartos: z.number().min(0, "Número de quartos"),
  banheiros: z.number().min(0, "Número de banheiros"),
  salas: z.number().min(0, "Número de salas"),
  piscina: z.boolean(),
  areaLazer: z.boolean(),
  descricao: z.string(),
});

const imovelSchema = z.object({
  endereco: enderecoSchema,
  detalhes: imovelDetalhesSchema,
  temMatricula: z.boolean(),
  matricula: z.string().optional(),
  cartorioRegistro: z.string().optional(),
});

/* ============================================================
   PRAZO
   ============================================================ */

const prazoSchema = z.object({
  tipo: z.enum(["determinado", "indeterminado"]),
  meses: z.number().optional(),
  dataInicialPosse: z.string().min(1, "Data inicial de posse é obrigatória"),
  permiteSublocar: z.boolean(),
});

/* ============================================================
   ALUGUEL
   ============================================================ */

const aluguelSchema = z.object({
  valor: z.number().min(0.01, "Valor do aluguel deve ser maior que zero"),
  diaPagamento: z.number().min(1).max(31, "Dia de pagamento inválido"),
  meioPagamento: z.enum(["pix", "dinheiro", "boleto", "cheque", "transferencia"]),
  indiceReajuste: z.enum(["ipca", "igpm", "incc"]),
  multaAtrasoPct: z.number().min(0).max(10, "Multa não pode exceder 10%"),
  dadosBancarios: dadosBancariosSchema.optional(),
});

/* ============================================================
   GARANTIA
   ============================================================ */

const garantiaSchema = z.object({
  tipo: z.enum(["caucao", "fiador", "seguro"]),
  valorCaucao: z.number().optional(),
  tipoCaucao: z.enum(["fixo", "meses"]).optional(),
  mesesCaucao: z.number().optional(),
  fiador: fiadorSchema.optional(),
  seguroNome: z.string().optional(),
  seguroValor: z.number().optional(),
});

/* ============================================================
   MELHORIAS, DESPESAS, MULTAS, CLÁUSULAS
   ============================================================ */

const melhoriasSchema = z.object({
  essencial: z.enum(["proprietario", "inquilino"]),
  naoEssencial: z.enum(["proprietario", "inquilino"]),
});

const despesasSchema = z.object({
  iptu: z.enum(["proprietario", "inquilino"]),
  seguroIncendio: z.enum(["ninguem", "proprietario", "inquilino"]),
});

const multaItemSchema = z.object({
  tem: z.boolean(),
  valor: z.number().optional(),
});

const multasSchema = z.object({
  descumprimento: multaItemSchema,
  rompimento: multaItemSchema,
});

const clausulasSchema = z.object({
  proprietario: z.array(z.string()),
  inquilino: z.array(z.string()),
  limitePessoas: z.number().optional(),
});

/* ============================================================
   TESTEMUNHAS E ASSINATURA
   ============================================================ */

const testemunhaSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  rg: z.string().min(1, "RG é obrigatório"),
  cpf: z.string().min(11, "CPF inválido"),
});

const assinaturaSchema = z.object({
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado é obrigatório"),
  dia: z.string().min(1, "Dia é obrigatório"),
  mes: z.string().min(1, "Mês é obrigatório"),
  ano: z.string().min(4, "Ano é obrigatório"),
});

/* ============================================================
   SCHEMA PRINCIPAL — CONTRATO DE ALUGUEL
   ============================================================ */

export const contratoAluguelSchema = z
  .object({
    tipoContrato: z.enum(["residencial", "comercial"]),
    locador: locadorSchema,
    locatario: locatarioSchema,
    imovel: imovelSchema,
    prazo: prazoSchema,
    aluguel: aluguelSchema,
    garantia: garantiaSchema,
    melhorias: melhoriasSchema,
    despesas: despesasSchema,
    multas: multasSchema,
    clausulas: clausulasSchema,
    assinatura: assinaturaSchema,
    testemunhas: z.array(testemunhaSchema).max(2, "Máximo 2 testemunhas"),
  })
  // Se prazo determinado, meses é obrigatório
  .refine(
    (data) => {
      if (data.prazo.tipo === "determinado") {
        return data.prazo.meses !== undefined && data.prazo.meses > 0;
      }
      return true;
    },
    { message: "Informe a duração em meses", path: ["prazo", "meses"] }
  )
  // Se imóvel tem matrícula, matrícula e cartório são obrigatórios
  .refine(
    (data) => {
      if (data.imovel.temMatricula) {
        return (
          data.imovel.matricula !== undefined &&
          data.imovel.matricula.length > 0 &&
          data.imovel.cartorioRegistro !== undefined &&
          data.imovel.cartorioRegistro.length > 0
        );
      }
      return true;
    },
    { message: "Informe matrícula e cartório", path: ["imovel", "matricula"] }
  )
  // Se meio de pagamento = transferência, dados bancários são obrigatórios
  .refine(
    (data) => {
      if (data.aluguel.meioPagamento === "transferencia") {
        return (
          data.aluguel.dadosBancarios?.banco &&
          data.aluguel.dadosBancarios?.agencia &&
          data.aluguel.dadosBancarios?.conta
        );
      }
      return true;
    },
    { message: "Informe banco, agência e conta", path: ["aluguel", "dadosBancarios"] }
  )
  // Se meio de pagamento = PIX, chave PIX é obrigatória
  .refine(
    (data) => {
      if (data.aluguel.meioPagamento === "pix") {
        return (
          data.aluguel.dadosBancarios?.chavePix !== undefined &&
          data.aluguel.dadosBancarios.chavePix.length > 0
        );
      }
      return true;
    },
    { message: "Informe a chave PIX", path: ["aluguel", "dadosBancarios", "chavePix"] }
  )
  // Se garantia = caução, tipoCaucao é obrigatório
  .refine(
    (data) => {
      if (data.garantia.tipo === "caucao") {
        return data.garantia.tipoCaucao !== undefined;
      }
      return true;
    },
    { message: "Escolha o tipo de caução", path: ["garantia", "tipoCaucao"] }
  )
  // Se caução = fixo, valorCaucao obrigatório
  .refine(
    (data) => {
      if (data.garantia.tipo === "caucao" && data.garantia.tipoCaucao === "fixo") {
        return data.garantia.valorCaucao !== undefined && data.garantia.valorCaucao > 0;
      }
      return true;
    },
    { message: "Informe o valor da caução", path: ["garantia", "valorCaucao"] }
  )
  // Se caução = meses, mesesCaucao obrigatório
  .refine(
    (data) => {
      if (data.garantia.tipo === "caucao" && data.garantia.tipoCaucao === "meses") {
        return data.garantia.mesesCaucao !== undefined && data.garantia.mesesCaucao > 0;
      }
      return true;
    },
    { message: "Informe a quantidade de meses", path: ["garantia", "mesesCaucao"] }
  )
  // Se garantia = fiador, fiador é obrigatório
  .refine(
    (data) => {
      if (data.garantia.tipo === "fiador") {
        return data.garantia.fiador !== undefined;
      }
      return true;
    },
    { message: "Informe os dados do fiador", path: ["garantia", "fiador"] }
  )
  // Se fiador tem limite, valorLimite obrigatório
  .refine(
    (data) => {
      if (data.garantia.tipo === "fiador" && data.garantia.fiador?.temLimite) {
        return (
          data.garantia.fiador.valorLimite !== undefined &&
          data.garantia.fiador.valorLimite > 0
        );
      }
      return true;
    },
    { message: "Informe o valor limite do fiador", path: ["garantia", "fiador", "valorLimite"] }
  )
  // Se garantia = seguro, seguroNome e seguroValor obrigatórios
  .refine(
    (data) => {
      if (data.garantia.tipo === "seguro") {
        return (
          data.garantia.seguroNome !== undefined &&
          data.garantia.seguroNome.length > 0 &&
          data.garantia.seguroValor !== undefined &&
          data.garantia.seguroValor > 0
        );
      }
      return true;
    },
    { message: "Informe nome da seguradora e valor da cobertura", path: ["garantia", "seguroNome"] }
  )
  // Se multa descumprimento = sim, valor obrigatório
  .refine(
    (data) => {
      if (data.multas.descumprimento.tem) {
        return (
          data.multas.descumprimento.valor !== undefined &&
          data.multas.descumprimento.valor > 0
        );
      }
      return true;
    },
    { message: "Informe o valor da multa de descumprimento", path: ["multas", "descumprimento", "valor"] }
  )
  // Se multa rompimento = sim, valor obrigatório
  .refine(
    (data) => {
      if (data.multas.rompimento.tem) {
        return (
          data.multas.rompimento.valor !== undefined &&
          data.multas.rompimento.valor > 0
        );
      }
      return true;
    },
    { message: "Informe o valor da multa de rompimento", path: ["multas", "rompimento", "valor"] }
  );

export type ContratoAluguelFormData = z.infer<typeof contratoAluguelSchema>;