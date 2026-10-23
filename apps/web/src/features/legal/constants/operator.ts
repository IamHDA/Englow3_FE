/**
 * Who answers for the service, as the legal pages state it.
 *
 * Read from the environment rather than written into the pages: the operator
 * of a deployment is a fact about that deployment, and a made-up address in a
 * privacy policy is worse than none. With nothing set the pages say contact is
 * through the app, and the upgrade button on the pricing page stays off.
 */
export const OPERATOR_NAME =
  process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim() || "Englow3";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;

/** Bump when either document changes in a way a learner should be told about. */
export const LEGAL_UPDATED = "23/10/2026";
