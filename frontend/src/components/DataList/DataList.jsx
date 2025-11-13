// src/components/DataList/DataList.jsx
import { useMemo, useState, useEffect } from "react";
import styles from "./DataList.module.css";

/**
 * props:
 * - columns: [{ key, header, accessor: string|fn(row), sortable?, render?(value,row), visibleFor?: ('admin'|'entrenador')[] }]
 * - data: array (para client-side)  || controlled mode: omitilo y usá onQueryChange + total
 * - loading: bool
 * - searchable: bool
 * - initialQuery: string
 * - initialSort: { key, dir: 'asc'|'desc' }
 * - initialPageSize: number
 * - actions?: (row, {role}) => [{ label, onClick, danger?, disabled? }]
 * - onRowClick?: (row) => void
 * - controlled?: boolean  // si true, DataList NO hace filtro/orden/paginado interno
 * - page, pageSize, sort, query, total // cuando controlled === true
 * - onPageChange, onPageSizeChange, onSortChange, onQueryChange // cuando controlled === true
 * - role?: 'admin'|'entrenador' // para visibilidad de columnas/acciones
 */
export default function DataList(props) {
  const {
    columns = [],
    data = [],
    loading = false,
    searchable = true,
    initialQuery = "",
    initialSort = null,
    initialPageSize = 10,
    actions,
    onRowClick,
    controlled = false,
    // controlled props:
    page, pageSize, sort, query, total,
    onPageChange, onPageSizeChange, onSortChange, onQueryChange,
    role = "entrenador",
  } = props;

  // 1) columnas filtradas por rol (si visibleFor está definido)
  const visibleCols = useMemo(() => {
    return columns
      .filter(c => !c.visibleFor || c.visibleFor.includes(role))
      .map(col => (typeof col.accessor === "string"
        ? { ...col, accessor: (row) => safeGet(row, col.accessor) }
        : col
      ));
  }, [columns, role]);

  // 2) estado interno (solo si no es controlled)
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(initialPageSize);
  const [localSort, setLocalSort] = useState(initialSort); // { key, dir }

  // 3) derivar datos (client-side) o usar controlled props
  const {
    rows, totalPages, currentPage, currentQuery, currentPageSize, currentSort,
    setQuery, goPage, setPageSize, setSort
  } = useDerivedState({
    controlled,
    data,
    visibleCols,
    // controlled in:
    page, pageSize, sort, query, total,
    // uncontrolled in:
    local: { localQuery, localPage, localPageSize, localSort },
  });

  // 4) handlers (emiten evento si controlled; si no, actualizan local)
  function handleSort(col) {
    if (!col.sortable) return;
    if (controlled) {
      const next = sort?.key !== col.key
        ? { key: col.key, dir: "asc" }
        : { key: col.key, dir: sort.dir === "asc" ? "desc" : "asc" };
      onSortChange?.(next);
      return;
    }
    setSort(col.key);
  }

  function handleQueryChange(e) {
    const q = e.target.value;
    if (controlled) onQueryChange?.(q);
    else setQuery(q);
  }

  function handlePageChange(next) {
    if (controlled) onPageChange?.(next);
    else goPage(next);
  }

  function handlePageSizeChange(e) {
    const s = Number(e.target.value);
    if (controlled) onPageSizeChange?.(s);
    else setPageSize(s);
  }

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {searchable && (
          <input
            className={styles.search}
            type="search"
            placeholder="Buscar…"
            value={controlled ? (query ?? "") : currentQuery}
            onChange={handleQueryChange}
            aria-label="Buscar"
          />
        )}
        <div className={styles.spacer} />
        <label className={styles.pageSizeLabel}>
          Filas:
          <select
            className={styles.pageSize}
            value={controlled ? pageSize : currentPageSize}
            onChange={handlePageSizeChange}
            aria-label="Filas por página"
          >
            {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {/* Tabla */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {visibleCols.map(col => (
                <th key={col.key} scope="col">
                  <button
                    type="button"
                    className={`${styles.thButton} ${col.sortable ? styles.sortable : ""}`}
                    onClick={() => handleSort(col)}
                    aria-sort={ariaSort(col.key, controlled ? sort : currentSort)}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className={styles.sortIcon}>
                        {sortIcon(col.key, controlled ? sort : currentSort)}
                      </span>
                    )}
                  </button>
                </th>
              ))}
              {actions && <th scope="col" className={styles.actionsCol}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={visibleCols.length + (actions ? 1 : 0)} className={styles.center}>Cargando…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={visibleCols.length + (actions ? 1 : 0)} className={styles.center}>Sin resultados</td></tr>
            ) : rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={onRowClick ? styles.clickableRow : undefined}
                onClick={() => onRowClick?.(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => (onRowClick && (e.key === "Enter" || e.key === " ")) && onRowClick(row)}
              >
                {visibleCols.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(col.accessor?.(row), row) : (col.accessor?.(row) ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td className={styles.actionsCell}>
                    {actions(row, { role }).map((act, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.actionBtn} ${act.danger ? styles.danger : ""}`}
                        disabled={act.disabled}
                        onClick={(e) => { e.stopPropagation(); act.onClick?.(row); }}
                      >
                        {act.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <Pagination
        page={controlled ? page : currentPage}
        totalPages={totalPages}
        onChange={handlePageChange}
      />
    </div>
  );
}

/* ---------- helpers + subcomponentes ---------- */

function useDerivedState({ controlled, data, visibleCols, page, pageSize, sort, query, total, local }) {
  const [q, setQ] = useState(local.localQuery);
  const [p, setP] = useState(local.localPage);
  const [s, setS] = useState(local.localPageSize);
  const [ord, setOrd] = useState(local.localSort);

  useEffect(() => { if (!controlled) setP(1); }, [q, s]); // reset page

  const filtered = useMemo(() => {
    if (controlled) return data;
    if (!q.trim()) return data;
    const ql = q.toLowerCase();
    return data.filter(row =>
      visibleCols.some(col => String(col.accessor?.(row) ?? "").toLowerCase().includes(ql))
    );
  }, [controlled, data, q, visibleCols]);

  const sorted = useMemo(() => {
    if (controlled) return filtered;
    if (!ord?.key) return filtered;
    const col = visibleCols.find(c => c.key === ord.key);
    if (!col) return filtered;
    const dir = ord.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = norm(col.accessor(a)), vb = norm(col.accessor(b));
      return va < vb ? -1 * dir : va > vb ? 1 * dir : 0;
    });
  }, [controlled, filtered, ord, visibleCols]);

  const totalItems = controlled ? (total ?? (data?.length ?? 0)) : sorted.length;
  const pages = Math.max(1, Math.ceil(totalItems / (controlled ? pageSize : s)));
  const currentPg = controlled ? page : Math.min(p, pages);
  const pageSz = controlled ? pageSize : s;

  const rows = useMemo(() => {
    if (controlled) return data; // paginado lo maneja el contenedor
    const start = (currentPg - 1) * pageSz;
    return sorted.slice(start, start + pageSz);
  }, [controlled, sorted, currentPg, pageSz, data]);

  return {
    rows,
    totalPages: pages,
    currentPage: currentPg,
    currentQuery: controlled ? query : q,
    currentPageSize: pageSz,
    currentSort: controlled ? sort : ord,
    setQuery: setQ,
    goPage: setP,
    setPageSize: setS,
    setSort: (key) => setOrd(prev => prev?.key !== key ? { key, dir: "asc" } : { key, dir: prev.dir === "asc" ? "desc" : "asc" }),
  };
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className={styles.pagination}>
      <button onClick={() => onChange(1)} disabled={page === 1}>«</button>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}>‹</button>
      <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}>›</button>
      <button onClick={() => onChange(totalPages)} disabled={page === totalPages}>»</button>
    </div>
  );
}

const norm = (v) => (v == null ? "" : v instanceof Date ? v.getTime() : typeof v === "number" ? v : String(v).toLowerCase());
const safeGet = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const ariaSort = (k, sort) => (sort?.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none");
const sortIcon = (k, sort) => (sort?.key === k ? (sort.dir === "asc" ? "▲" : "▼") : "⇅");
