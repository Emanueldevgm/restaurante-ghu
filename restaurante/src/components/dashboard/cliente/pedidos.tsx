import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function ClientePedidos() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display">Meus Pedidos</h1>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Exemplo de pedido */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">Pedido #001</p>
                <p className="text-sm text-muted-foreground">2 itens • R$ 45,00</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Entregue</Badge>
                <Button variant="ghost" size="sm">Detalhes</Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center py-4">
              Você ainda não fez nenhum pedido.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}