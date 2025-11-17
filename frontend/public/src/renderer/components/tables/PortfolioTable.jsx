import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { cn } from '@/utils/cn';

/**
 * Componente de tabela de portfólio usando TanStack Table
 * 
 * @param {Array} data - Array de posições do portfólio
 * @param {Function} onRowClick - Callback quando uma linha é clicada
 */
const PortfolioTable = ({ data = [], onRowClick }) => {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  // Definir colunas
  const columns = useMemo(
    () => [
      {
        accessorKey: 'symbol',
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Ativo</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.symbol}</div>
            <div className="text-sm text-muted-foreground">{row.original.name}</div>
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Quantidade</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono">
            {row.original.quantity.toLocaleString('pt-BR')}
          </div>
        ),
      },
      {
        accessorKey: 'avgPrice',
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Preço Médio</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono">
            {formatCurrency(row.original.avgPrice)}
          </div>
        ),
      },
      {
        accessorKey: 'currentPrice',
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Preço Atual</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono">
            {formatCurrency(row.original.currentPrice)}
          </div>
        ),
      },
      {
        accessorKey: 'totalValue',
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Valor Total</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono">
            {formatCurrency(row.original.totalValue)}
          </div>
        ),
      },
      {
        accessorKey: 'pnl',
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Lucro/Prejuízo</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => {
          const pnl = row.original.pnl;
          const pnlPercentage = row.original.pnlPercentage;
          const isPositive = pnl >= 0;
          
          return (
            <div className={cn('text-right font-mono', {
              'text-bull': isPositive,
              'text-bear': !isPositive,
            })}>
              <div className="font-medium">
                {isPositive ? '+' : ''}{formatCurrency(pnl)}
              </div>
              <div className="text-sm">
                {isPositive ? '+' : ''}{formatPercentage(pnlPercentage)}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'allocation',
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Alocação</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <div className="text-sm font-medium">
              {formatPercentage(row.original.allocation)}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${row.original.allocation}%` }}
              />
            </div>
          </div>
        ),
      },
    ],
    []
  );

  // Configurar tabela
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Filtro de busca */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar ativo..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de {data.length} posições
        </div>
      </div>

      {/* Tabela */}
      <div className="trading-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-3 px-4 text-left text-sm font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensagem quando não há dados */}
        {table.getFilteredRowModel().rows.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {globalFilter ? 'Nenhuma posição encontrada' : 'Nenhuma posição no portfólio'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTable;
