import styles from "./DataList.module.css";
import { renderCell, resolveImage } from "./utils.js";

export function DataListCard({ row, columns, actions, onClick, imageAccessor }) {
  if (!columns || columns.length === 0) return null;

  const primaryCol = columns[0];
  const secondaryCol = columns[1];
  const detailCols = columns.slice(2);

  const primaryValue = renderCell(primaryCol, row);
  const secondaryValue = secondaryCol ? renderCell(secondaryCol, row) : null;
  const cardImage = resolveImage(row, imageAccessor);
  const clickable = typeof onClick === "function";

  // cacheamos las acciones para no llamar actions(row) varias veces
  const cardActions = typeof actions === "function" ? actions(row) ?? [] : [];

  const handleCardClick = () => {
    if (clickable) onClick(row);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation(); // que el click del botón no dispare el click de la carta
    action.onClick?.(row);
  };

  const hasDetails = detailCols.length > 0;
  const hasActions = cardActions.length > 0;

  return (
    <article
      className={`${styles.cardOuter} ${clickable ? styles.cardOuterClickable : ""}`}
      onClick={clickable ? handleCardClick : undefined}
      aria-label={String(primaryValue)}
    >
      <div className={styles.cardInner}>
        <div className={styles.yugiFrame}>
          {/* Imagen / arte de la carta */}
          <div className={styles.imageFrame}>
            {cardImage ? (
              <img
                src={cardImage}
                alt={String(primaryValue)}
                className={styles.cardImage}
                loading="lazy"
              />
            ) : (
              <div className={styles.cardImagePlaceholder}>
                <span className={styles.placeholderText}>Sin imagen</span>
              </div>
            )}
          </div>

          {/* Nombre + “tipo” (subtítulo) */}
          <header className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{primaryValue}</h3>
            {secondaryValue && (
              <p className={styles.cardSubtitle}>{secondaryValue}</p>
            )}
          </header>

          {/* Atributos / stats de la carta */}
          {hasDetails && (
            <section className={styles.cardBody}>
              {detailCols.map((col) => (
                <div key={col.key} className={styles.statRow}>
                  <span className={styles.statLabel}>{col.header}</span>
                  <span className={styles.statValue}>
                    {renderCell(col, row)}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* Footer tipo ATK/DEF + acciones */}
          <footer className={styles.cardFooter}>
            <div className={styles.atkDefArea}>
              {/* acá en el futuro podés mapear, por ejemplo:
                  ATK {row.atk} / DEF {row.def}
               */}
            </div>

            {hasActions && (
              <div className={styles.actionsArea}>
                {cardActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={styles.actionBtn}
                    onClick={(e) => handleActionClick(e, action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
}
