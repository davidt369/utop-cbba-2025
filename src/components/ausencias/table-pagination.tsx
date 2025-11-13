'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import useAusenciaStore from '@/store/ausencias.store';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
}: PaginationProps) {
    const {
        setCurrentPage,
        setItemsPerPage,
        nextPage,
        prevPage,
        goToFirstPage,
        goToLastPage,
    } = useAusenciaStore();

    const pageNumbers = [];
    const maxPagesToShow = 5;

    // Calcular qué páginas mostrar
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Ajustar si hay pocas páginas al final
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    if (totalPages <= 1) {
        return (
            <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {totalItems} de {totalItems} resultados
                </div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Elementos por página</p>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => setItemsPerPage(parseInt(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
                Mostrando {startIndex} a {endIndex} de {totalItems} resultados
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Elementos por página</p>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => setItemsPerPage(parseInt(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">
                        Página {currentPage} de {totalPages}
                    </p>

                    <div className="flex items-center space-x-1">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={goToFirstPage}
                            disabled={!hasPrevPage}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={prevPage}
                            disabled={!hasPrevPage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Números de página */}
                        <div className="hidden md:flex items-center space-x-1">
                            {startPage > 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setCurrentPage(1)}
                                    >
                                        1
                                    </Button>
                                    {startPage > 2 && (
                                        <span className="text-muted-foreground px-1">...</span>
                                    )}
                                </>
                            )}

                            {pageNumbers.map((page) => (
                                <Button
                                    key={page}
                                    variant={page === currentPage ? "default" : "outline"}
                                    className="h-8 w-8 p-0"
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}

                            {endPage < totalPages && (
                                <>
                                    {endPage < totalPages - 1 && (
                                        <span className="text-muted-foreground px-1">...</span>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setCurrentPage(totalPages)}
                                    >
                                        {totalPages}
                                    </Button>
                                </>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={nextPage}
                            disabled={!hasNextPage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => goToLastPage(totalPages)}
                            disabled={!hasNextPage}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}