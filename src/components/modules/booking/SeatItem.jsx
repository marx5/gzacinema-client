export function SeatItem({
  seat,
  status = "AVAILABLE", // AVAILABLE, SELECTED, OCCUPIED, VIP, COUPLE
  onClick,
  disabled = false,
}) {
  const getSeatColor = () => {
    if (status === "OCCUPIED" || disabled) {
      return "bg-dark-border text-gray-500 cursor-not-allowed border-transparent";
    }
    if (status === "SELECTED") {
      return "bg-brand-500 text-white font-bold border-brand-400 shadow-md shadow-brand-500/30";
    }
    if (seat?.type === "VIP") {
      return "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/30";
    }
    if (seat?.type === "COUPLE") {
      return "bg-pink-500/15 text-pink-300 border-pink-500/40 hover:bg-pink-500/30";
    }
    return "bg-dark-surface text-gray-300 border-dark-border hover:border-brand-500 hover:text-white";
  };

  return (
    <button
      type="button"
      disabled={status === "OCCUPIED" || disabled}
      onClick={() => onClick?.(seat)}
      className={`h-8 min-w-8 px-1 rounded-md text-xs font-medium border flex items-center justify-center transition-all duration-150 ${getSeatColor()}`}
      title={`${seat?.code || seat?.label || ""} (${seat?.type || "Standard"})`}
    >
      {seat?.code || seat?.label || ""}
    </button>
  );
}

export default SeatItem;
