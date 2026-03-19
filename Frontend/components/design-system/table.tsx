import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={`w-full caption-bottom text-sm ${className || ''}`}
        {...props}
      />
    </div>
  )
);

Table.displayName = 'Table';

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={`border-b border-border bg-slate-50 dark:bg-slate-900 [&_tr]:border-b ${className || ''}`}
      {...props}
    />
  )
);

TableHeader.displayName = 'TableHeader';

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={`[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-border hover:[&_tr]:bg-slate-50 dark:hover:[&_tr]:bg-slate-900 ${className || ''}`}
      {...props}
    />
  )
);

TableBody.displayName = 'TableBody';

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={`border-t border-border bg-slate-50 dark:bg-slate-900 font-medium [&>tr]:last:border-b-0 ${className || ''}`}
      {...props}
    />
  )
);

TableFooter.displayName = 'TableFooter';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={`transition-colors ${className || ''}`}
      {...props}
    />
  )
);

TableRow.displayName = 'TableRow';

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={`h-12 px-6 text-left align-middle font-semibold text-foreground [&:has([role=checkbox])]:pr-0 ${className || ''}`}
      {...props}
    />
  )
);

TableHead.displayName = 'TableHead';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={`px-6 py-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
      {...props}
    />
  )
);

TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell };
