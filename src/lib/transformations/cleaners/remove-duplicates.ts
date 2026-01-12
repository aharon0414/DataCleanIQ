/**
 * Remove duplicate rows from dataset
 */
export function removeDuplicates(data: any[]): any[] {
  const seen = new Set<string>();
  return data.filter(row => {
    const rowString = JSON.stringify(row);
    if (seen.has(rowString)) {
      return false;
    }
    seen.add(rowString);
    return true;
  });
}
