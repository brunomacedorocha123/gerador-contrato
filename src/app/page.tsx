"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, KeyRound, FileText } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4 shadow-lg">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Gerador de Contratos
          </h1>
          <p className="text-slate-600 text-lg">
            Crie contratos completos e profissionais em poucos minutos
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Compra e Venda */}
          <Card className="border-2 border-transparent hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer group bg-white"
            onClick={() => router.push("/compra-venda")}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Home className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Compra e Venda</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-600 mb-4">
                Gere contratos de compra e venda de imóveis residenciais ou comerciais, 
                com todas as cláusulas legais, formas de pagamento e condições de transferência.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Iniciar Contrato de Compra e Venda →
              </Button>
            </CardContent>
          </Card>

          {/* Card Aluguel */}
          <Card className="border-2 border-transparent hover:border-emerald-300 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer group bg-white"
            onClick={() => router.push("/aluguel")}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <KeyRound className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Locação / Aluguel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-600 mb-4">
                Gere contratos de locação residencial ou comercial, com garantia, 
                reajuste anual, multas, cláusulas especiais e todas as obrigações das partes.
              </p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Iniciar Contrato de Aluguel →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-10">
          Contratos gerados em conformidade com a legislação brasileira
        </p>
      </div>
    </main>
  );
}