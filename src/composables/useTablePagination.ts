import { ref, computed, watch } from 'vue';

export interface TablePaginationOptions {
  initialPage?: number;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  totalItems?: number;
}

export interface TablePaginationState {
  currentPage: number;
  rowsPerPage: number;
  totalItems: number;
}

export function useTablePagination(options: TablePaginationOptions = {}) {
  const {
    initialPage = 1,
    initialRowsPerPage = 20,
    rowsPerPageOptions = [10, 20, 50, 100],
    totalItems: initialTotalItems = 0,
  } = options;

  // Reactive state
  const currentPage = ref(initialPage);
  const rowsPerPage = ref(initialRowsPerPage);
  const totalItems = ref(initialTotalItems);

  // Computed properties
  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / rowsPerPage.value) || 1;
  });

  const startItem = computed(() => {
    return (currentPage.value - 1) * rowsPerPage.value + 1;
  });

  const endItem = computed(() => {
    return Math.min(currentPage.value * rowsPerPage.value, totalItems.value);
  });

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value;
  });

  const hasPreviousPage = computed(() => {
    return currentPage.value > 1;
  });

  const paginationInfo = computed(() => ({
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    startItem: startItem.value,
    endItem: endItem.value,
    totalItems: totalItems.value,
    rowsPerPage: rowsPerPage.value,
    hasNextPage: hasNextPage.value,
    hasPreviousPage: hasPreviousPage.value,
  }));

  // Quasar table pagination object
  const quasarPagination = computed(() => ({
    page: currentPage.value,
    rowsPerPage: rowsPerPage.value,
    rowsNumber: totalItems.value,
  }));

  // Methods
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const goToFirstPage = () => {
    goToPage(1);
  };

  const goToLastPage = () => {
    goToPage(totalPages.value);
  };

  const goToNextPage = () => {
    if (hasNextPage.value) {
      goToPage(currentPage.value + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage.value) {
      goToPage(currentPage.value - 1);
    }
  };

  const setRowsPerPage = (newRowsPerPage: number) => {
    if (rowsPerPageOptions.includes(newRowsPerPage)) {
      rowsPerPage.value = newRowsPerPage;
      // Reset to first page when changing rows per page
      currentPage.value = 1;
    }
  };

  const setTotalItems = (newTotalItems: number) => {
    totalItems.value = newTotalItems;
    // Adjust current page if it's beyond the new total pages
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value);
    }
  };

  const reset = () => {
    currentPage.value = initialPage;
    rowsPerPage.value = initialRowsPerPage;
    totalItems.value = initialTotalItems;
  };

  // Watch for changes in rowsPerPage to adjust current page if needed
  watch(rowsPerPage, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value);
    }
  });

  // Format text helpers
  const formatItemsText = (count: number, singular = 'item', plural = 'items'): string => {
    if (count === 1) {
      return `1 ${singular}`;
    }
    return `${count.toLocaleString()} ${plural}`;
  };

  const formatPageInfo = (): string => {
    if (totalItems.value === 0) {
      return 'No items';
    }
    if (totalPages.value === 1) {
      return `${formatItemsText(totalItems.value)}`;
    }
    return `Page ${currentPage.value} of ${totalPages.value} • ${formatItemsText(totalItems.value)}`;
  };

  const formatRangeInfo = (): string => {
    if (totalItems.value === 0) {
      return 'No items to display';
    }
    return `Showing ${startItem.value}-${endItem.value} of ${totalItems.value} items`;
  };

  return {
    // State
    currentPage,
    rowsPerPage,
    totalItems,
    rowsPerPageOptions,

    // Computed
    totalPages,
    startItem,
    endItem,
    hasNextPage,
    hasPreviousPage,
    paginationInfo,
    quasarPagination,

    // Methods
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    setRowsPerPage,
    setTotalItems,
    reset,

    // Formatters
    formatItemsText,
    formatPageInfo,
    formatRangeInfo,
  };
}
