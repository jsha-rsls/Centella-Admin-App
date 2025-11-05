export const exportToCSV = (reservations) => {
  const headers = ["Date", "Homeowner", "Facility", "Amount", "Status"]
  const rows = reservations.map((r) => [
    new Date(r.createdAt).toLocaleDateString(),
    r.homeownerName || "N/A",
    r.facilityName || "N/A",
    r.totalAmount || 0,
    r.status,
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `income-report-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
