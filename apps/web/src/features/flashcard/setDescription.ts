/** Pipeline provenance is authoring metadata, not a description for learners. */
export function learnerSetDescription(description: string): string {
  return /^Generated vocabulary at [A-C][12], imported for review on \S+\.$/.test(
    description.trim(),
  )
    ? ""
    : description;
}
